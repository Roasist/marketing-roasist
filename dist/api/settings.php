<?php
/**
 * Roasist Marketing Suite - Settings & Audit Logs API
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$currentUser = requireAuth();
$pdo = Database::getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'settings';

if ($action === 'logs') {
    requireAuth('ADMIN');
    
    // Ensure all columns exist before select
    $stmt = $pdo->query("
        SELECT * FROM audit_logs 
        ORDER BY id DESC 
        LIMIT 100
    ");
    $rawLogs = $stmt->fetchAll();
    
    $logs = [];
    foreach ($rawLogs as $l) {
        $name = !empty($l['user_name']) ? $l['user_name'] : 'Sistem';
        $email = $l['user_email'] ?? '';
        $role = $l['user_role'] ?? '';
        $category = !empty($l['category']) ? $l['category'] : 'SİSTEM';
        $ip = !empty($l['ip_address']) ? $l['ip_address'] : '127.0.0.1';
        $status = !empty($l['status']) ? $l['status'] : 'SUCCESS';
        $createdAt = !empty($l['created_at']) ? $l['created_at'] : date('Y-m-d H:i:s');

        $logs[] = [
            'id' => (int)$l['id'],
            'user_id' => $l['user_id'] ? (int)$l['user_id'] : null,
            'user_name' => $name,
            'user_email' => $email,
            'user_role' => $role,
            'action' => $l['action'],
            'category' => $category,
            'details' => $l['details'],
            'ip_address' => $ip,
            'status' => $status,
            'created_at' => $createdAt,

            // Also provide camelCase aliases for universal client compatibility
            'userName' => $name,
            'userEmail' => $email,
            'userRole' => $role,
            'ipAddress' => $ip,
            'createdAt' => $createdAt,
        ];
    }

    echo json_encode(['status' => 'success', 'logs' => $logs]);
    exit;
}

// Test Meta API Token
if ($action === 'test_meta') {
    requireAuth('ADMIN');
    $stmt = $pdo->prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'metaToken'");
    $stmt->execute();
    $row = $stmt->fetch();
    $token = $row ? trim($row['setting_value']) : '';

    if (empty($token)) {
        echo json_encode(['status' => 'error', 'message' => 'Token bulunamadı. Lütfen önce tokenı alana yapıştırıp kaydedin.']);
        exit;
    }

    $ch = curl_init('https://graph.facebook.com/v19.0/me?access_token=' . urlencode($token));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $json = json_decode($res, true);
    if ($code === 200 && isset($json['id'])) {
        echo json_encode([
            'status' => 'success',
            'message' => '✓ Meta API Bağlantısı Başarılı! (Geliştirici Hesabı: ' . ($json['name'] ?? $json['id']) . ')',
            'user' => $json
        ]);
    } else {
        $msg = $json['error']['message'] ?? 'Geçersiz veya süresi dolmuş token.';
        echo json_encode([
            'status' => 'error',
            'message' => 'Meta Doğrulama Hatası: ' . $msg
        ]);
    }
    exit;
}

// Get settings
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM app_settings");
    $raw = $stmt->fetchAll();
    $settings = [];
    foreach ($raw as $r) {
        $settings[$r['setting_key']] = $r['setting_value'];
    }
    echo json_encode(['status' => 'success', 'settings' => $settings]);
    exit;
}

// Update settings
if ($method === 'POST') {
    requireAuth('ADMIN');
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $stmt = $pdo->prepare("INSERT OR REPLACE INTO app_settings (setting_key, setting_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)");

    foreach ($input as $key => $val) {
        $stmt->execute([$key, is_array($val) ? json_encode($val) : (string)$val]);
    }

    logAudit((int)$currentUser['id'], $currentUser['name'], 'Sistem Ayarları Güncellendi', 'API ve genel ayarlar güncellendi.', 'AYARLAR');

    echo json_encode(['status' => 'success', 'message' => 'Ayarlar başarıyla kaydedildi!']);
    exit;
}
