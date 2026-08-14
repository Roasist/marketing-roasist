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
    $stmt = $pdo->query("SELECT id, user_id, user_name as userName, action, details, ip_address as ipAddress, created_at as createdAt FROM audit_logs ORDER BY id DESC LIMIT 50");
    $logs = $stmt->fetchAll();
    echo json_encode(['status' => 'success', 'logs' => $logs]);
    exit;
}

// Get or update settings
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

if ($method === 'POST') {
    requireAuth('ADMIN');
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $stmt = $pdo->prepare("INSERT OR REPLACE INTO app_settings (setting_key, setting_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)");

    foreach ($input as $key => $val) {
        $stmt->execute([$key, is_array($val) ? json_encode($val) : (string)$val]);
    }

    logAudit((int)$currentUser['id'], $currentUser['name'], 'Sistem Ayarları Güncellendi', 'API ve genel ayarlar güncellendi.');

    echo json_encode(['status' => 'success', 'message' => 'Ayarlar başarıyla kaydedildi!']);
    exit;
}
