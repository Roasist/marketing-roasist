<?php
/**
 * Roasist Marketing Suite - User Management API (Admin Only)
 * List, Create, Update Role/Status, Delete
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$currentUser = requireAuth('ADMIN');
$pdo = Database::getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

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

$input = json_decode(file_get_contents('php://input'), true) ?? [];

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

    logAudit((int)$currentUser['id'], $currentUser['name'], 'Kullanıcı Oluşturuldu', "Yeni kullanıcı: $name ($email, Rol: $role)");

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

// PUT: Update User (Role, Status, Password)
if ($method === 'PUT') {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Geçersiz kullanıcı ID.']);
        exit;
    }

    $name = trim($input['name'] ?? '');
    $role = $input['role'] ?? 'MARKETER';
    $status = $input['status'] ?? 'ACTIVE';
    $password = trim($input['password'] ?? '');

    if (!empty($password)) {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET name = ?, role = ?, status = ?, password_hash = ? WHERE id = ?");
        $stmt->execute([$name, $role, $status, $passwordHash, $id]);
    } else {
        $stmt = $pdo->prepare("UPDATE users SET name = ?, role = ?, status = ? WHERE id = ?");
        $stmt->execute([$name, $role, $status, $id]);
    }

    logAudit((int)$currentUser['id'], $currentUser['name'], 'Kullanıcı Güncellendi', "ID: $id güncellendi (Rol: $role, Durum: $status)");

    echo json_encode([
        'status' => 'success',
        'message' => 'Kullanıcı bilgileri güncellendi!'
    ]);
    exit;
}

// DELETE: Delete User
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

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);

    logAudit((int)$currentUser['id'], $currentUser['name'], 'Kullanıcı Silindi', "ID: $id silindi.");

    echo json_encode([
        'status' => 'success',
        'message' => 'Kullanıcı başarıyla silindi.'
    ]);
    exit;
}
