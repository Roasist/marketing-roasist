<?php
/**
 * Roasist Marketing Suite - Settings & Audit Logs API
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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

// Test Meta API Token & Ad Library Verification
if ($action === 'test_meta') {
    requireAuth('ADMIN');
    $stmt = $pdo->prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'metaToken'");
    $stmt->execute();
    $row = $stmt->fetch();
    $token = $row ? trim($row['setting_value']) : '';

    if (empty($token)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Henüz kayıtlı bir Meta Token bulunamadı. Lütfen önce tokenı alana yapıştırıp "Değişiklikleri Kaydet" butonuna basın.'
        ]);
        exit;
    }

    // Step 1: Check basic token & user identity via /me
    $ch = curl_init('https://graph.facebook.com/v19.0/me?fields=id,name&access_token=' . urlencode($token));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $resMe = curl_exec($ch);
    $codeMe = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $jsonMe = json_decode($resMe, true);
    if ($codeMe !== 200 || empty($jsonMe['id'])) {
        $errorMsg = $jsonMe['error']['message'] ?? 'Token geçersiz veya süresi dolmuş.';
        echo json_encode([
            'status' => 'error',
            'verified' => false,
            'message' => '❌ Meta Token Geçersiz: ' . $errorMsg
        ]);
        exit;
    }

    $devName = $jsonMe['name'] ?? $jsonMe['id'];

    // Step 2: Check Ad Library (ads_archive) permission & Identity confirmation
    $testAdUrl = 'https://graph.facebook.com/v19.0/ads_archive?fields=id,page_id&search_terms=test&ad_reached_countries=["TR"]&limit=1&access_token=' . urlencode($token);
    $chAd = curl_init($testAdUrl);
    curl_setopt($chAd, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chAd, CURLOPT_TIMEOUT, 8);
    curl_setopt($chAd, CURLOPT_SSL_VERIFYPEER, true);
    $resAd = curl_exec($chAd);
    $codeAd = curl_getinfo($chAd, CURLINFO_HTTP_CODE);
    curl_close($chAd);

    $jsonAd = json_decode($resAd, true);

    if ($codeAd === 200 && isset($jsonAd['data'])) {
        echo json_encode([
            'status' => 'success',
            'verified' => true,
            'adLibraryApproved' => true,
            'message' => '🎉 TEBRİKLER! Meta Kimlik Onayınız ve Reklam Kütüphanesi (Ad Library API) İzniniz AKTİF! (Geliştirici: ' . $devName . ')',
            'user' => $jsonMe
        ]);
    } else {
        $adError = $jsonAd['error']['message'] ?? 'Reklam kütüphanesine erişim izni henüz onaylanmamış.';
        $adCode = $jsonAd['error']['code'] ?? $codeAd;
        
        echo json_encode([
            'status' => 'warning',
            'verified' => true,
            'adLibraryApproved' => false,
            'message' => '⚠️ Token Geçerli (' . $devName . ') ancak Meta Kimlik Onayı / Ad Library İzni Bekleniyor. (Meta Yanıtı: ' . $adError . ')',
            'details' => $adError,
    exit;
}

// Test Google / Gemini API Connection
if ($action === 'test_google') {
    requireAuth('ADMIN');
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM app_settings WHERE setting_key IN ('googleApiKey', 'geminiApiKey')");
    $rows = $stmt->fetchAll();
    $keys = [];
    foreach ($rows as $r) {
        $keys[$r['setting_key']] = trim($r['setting_value'] ?? '');
    }
    $googleKey = $keys['googleApiKey'] ?: $keys['geminiApiKey'] ?: '';

    if (empty($googleKey)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Henüz kayıtlı bir Google / Gemini API Anahtarı bulunamadı. Lütfen anahtarınızı girip "Değişiklikleri Kaydet"e basın.'
        ]);
        exit;
    }

    $testUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . urlencode($googleKey);
    $payload = [
        "contents" => [["parts" => [["text" => "Ping test. Respond with OK"]]]],
        "generationConfig" => ["maxOutputTokens" => 5]
    ];

    $ch = curl_init($testUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $json = json_decode($res, true);

    if ($code === 200 && isset($json['candidates'])) {
        echo json_encode([
            'status' => 'success',
            'message' => '✓ Google & Gemini API Bağlantısı Başarılı! Sunucu taraflı güvenli bağlantı aktif.'
        ]);
    } else {
        $errMsg = $json['error']['message'] ?? 'API Anahtarı geçersiz veya yetkisiz.';
        echo json_encode([
            'status' => 'error',
            'message' => 'Google API Doğrulama Hatası: ' . $errMsg
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

    try {
        logAudit((int)$currentUser['id'], $currentUser['name'], 'Sistem Ayarları Güncellendi', 'API ve genel ayarlar güncellendi.', 'AYARLAR');
    } catch (Exception $e) {}

    echo json_encode(['status' => 'success', 'message' => 'Ayarlar başarıyla kaydedildi!']);
    exit;
}
