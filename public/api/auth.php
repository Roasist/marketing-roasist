<?php
/**
 * Roasist Marketing Suite - Authentication API
 * Login, Token Verify, Logout, Profile
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$pdo = Database::getConnection();
$action = $_GET['action'] ?? 'login';

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? [];

if ($action === 'login') {
    $email = trim($input['email'] ?? $_POST['email'] ?? '');
    $password = trim($input['password'] ?? $_POST['password'] ?? '');

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Lütfen e-posta ve şifrenizi girin.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Hatalı e-posta adresi veya şifre.']);
        exit;
    }

    if ($user['status'] !== 'ACTIVE') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Bu kullanıcı hesabı askıya alınmış veya pasif durumda.']);
        exit;
    }

    // Update last login
    $updateStmt = $pdo->prepare("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?");
    $updateStmt->execute([$user['id']]);

    // Generate Session Token (Base64 Encoded with Expiry 7 days)
    $payload = [
        'user_id' => (int)$user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'exp' => time() + (86400 * 7)
    ];
    $token = base64_encode(json_encode($payload));

    logAudit((int)$user['id'], $user['name'], 'Kullanıcı Girişi', 'Başarılı giriş yapıldı.');

    echo json_encode([
        'status' => 'success',
        'message' => 'Giriş başarılı!',
        'token' => $token,
        'user' => [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'last_login_at' => $user['last_login_at']
        ]
    ]);
    exit;
}

if ($action === 'verify') {
    $user = getAuthUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Geçersiz veya süresi dolmuş oturum.']);
        exit;
    }

    echo json_encode([
        'status' => 'success',
        'user' => [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);
    exit;
}

if ($action === 'logout') {
    $user = getAuthUser();
    if ($user) {
        logAudit((int)$user['id'], $user['name'], 'Çıkış Yapıldı', 'Kullanıcı oturumu kapattı.');
    }
    echo json_encode(['status' => 'success', 'message' => 'Oturum sonlandırıldı.']);
    exit;
}
