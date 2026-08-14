<?php
/**
 * Roasist Marketing Suite - User Management API (Admin Only)
 * List, Create, Update (Name, Email, Role, Status, Password), Delete
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$currentUser = requireAuth('ADMIN');
$pdo = Database::getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Support method override
$input = json_decode(file_get_contents('php://input'), true) ?? [];
if ($method === 'POST' && isset($input['_method'])) {
    $method = strtoupper($input['_method']);
} elseif ($method === 'POST' && $action === 'update') {
    $method = 'PUT';
} elseif ($method === 'POST' && $action === 'delete') {
    $method = 'DELETE';
}

// GET: List all users
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, name, email, role, status, last_login_at, created_at FROM users ORDER BY id ASC");
    $users = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'users' => $users
    ]);
    exit;
}

// POST: Create New User
if ($method === 'POST') {
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');
    $role = $input['role'] ?? 'MARKETER';
    $status = $input['status'] ?? 'ACTIVE';

    if (empty($name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Lütfen ad, e-posta ve şifre alanlarını eksiksiz doldurun.']);
        exit;
    }

    // Check email uniqueness
    $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $checkStmt->execute([$email]);
    if ($checkStmt->fetch()) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var.']);
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $passwordHash, $role, $status]);
    $newId = $pdo->lastInsertId();

    logAudit(
        (int)$currentUser['id'], 
        $currentUser['name'], 
        'Kullanıcı Oluşturuldu', 
        "Yeni kullanıcı eklendi: $name ($email, Rol: $role)", 
        'KULLANICI'
    );

    echo json_encode([
        'status' => 'success',
        'message' => 'Kullanıcı başarıyla oluşturuldu!',
        'user' => [
            'id' => (int)$newId,
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'status' => $status
        ]
    ]);
    exit;
}

// PUT: Update User (Name, Email, Role, Status, Password)
if ($method === 'PUT') {
    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Geçersiz kullanıcı ID.']);
        exit;
    }

    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $role = $input['role'] ?? 'MARKETER';
    $status = $input['status'] ?? 'ACTIVE';
    $password = trim($input['password'] ?? '');

    if (empty($name) || empty($email)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Ad ve e-posta alanları boş bırakılamaz.']);
        exit;
    }

    // Check email uniqueness for other users
    $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $checkStmt->execute([$email, $id]);
    if ($checkStmt->fetch()) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.']);
        exit;
    }

    if (!empty($password)) {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ?, role = ?, status = ?, password_hash = ? WHERE id = ?");
        $stmt->execute([$name, $email, $role, $status, $passwordHash, $id]);
        logAudit(
            (int)$currentUser['id'], 
            $currentUser['name'], 
            'Kullanıcı & Şifre Güncellendi', 
            "Kullanıcı ve şifre güncellendi: $name ($email, Rol: $role, Durum: $status)", 
            'KULLANICI'
        );
    } else {
        $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?");
        $stmt->execute([$name, $email, $role, $status, $id]);
        logAudit(
            (int)$currentUser['id'], 
            $currentUser['name'], 
            'Kullanıcı Güncellendi', 
            "Kullanıcı bilgileri güncellendi: $name ($email, Rol: $role, Durum: $status)", 
            'KULLANICI'
        );
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Kullanıcı bilgileri başarıyla güncellendi!'
    ]);
    exit;
}

// DELETE: Delete User (Super Admin can delete any other user including other Super Admins)
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? $input['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Geçersiz kullanıcı ID.']);
        exit;
    }

    if ($id === (int)$currentUser['id']) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Kendi kullanıcı hesabınızı silemezsiniz.']);
        exit;
    }

    // Get target user info
    $userStmt = $pdo->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
    $userStmt->execute([$id]);
    $targetUser = $userStmt->fetch();

    if (!$targetUser) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Kullanıcı bulunamadı.']);
        exit;
    }

    // Only SUPER_ADMIN can delete another SUPER_ADMIN
    if ($currentUser['role'] !== 'SUPER_ADMIN' && $targetUser['role'] === 'SUPER_ADMIN') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Süper Admin hesabını yalnızca bir Süper Admin silebilir.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);

    logAudit(
        (int)$currentUser['id'], 
        $currentUser['name'], 
        'Kullanıcı Silindi', 
        "Silinen kullanıcı: {$targetUser['name']} ({$targetUser['email']}, Rol: {$targetUser['role']})", 
        'GÜVENLİK'
    );

    echo json_encode([
        'status' => 'success',
        'message' => 'Kullanıcı başarıyla silindi!'
    ]);
    exit;
}
