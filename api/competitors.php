<?php
/**
 * Roasist Marketing Suite - Competitor Management API
 * Intelligent resolver: handles Page ID, Facebook Handles (@handle), Page URLs, Meta Ad Library Links, and Brand Names
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$currentUser = requireAuth();
$pdo = Database::getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// GET: List all competitors
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, page_id as pageId, name, facebook_page_url as facebookPageUrl, avatar_url as avatarUrl, category, active_ads_count as activeAdsCount, created_at as createdAt FROM competitors ORDER BY created_at ASC");
    $competitors = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'competitors' => $competitors
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

// POST: Add Competitor
if ($method === 'POST') {
    $rawInput = trim($input['urlOrId'] ?? $input['pageId'] ?? $input['url'] ?? $input['name'] ?? '');
    if (empty($rawInput)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Lütfen geçerli bir marka adı, sayfa linki veya Meta ID girin.']);
        exit;
    }

    // Clean input
    $cleanHandle = ltrim(trim($rawInput), '@');
    $cleanId = $cleanHandle;
    $name = !empty($input['name']) && $input['name'] !== $rawInput ? $input['name'] : ucwords($rawInput);
    $category = $input['category'] ?? 'Genel Pazarlama & E-Ticaret';
    $avatarUrl = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150';
    $fbUrl = "https://www.facebook.com/$cleanHandle";

    // Handle Meta Ad Library URL: view_all_page_id=12345
    if (strpos($rawInput, 'view_all_page_id=') !== false) {
        parse_str(parse_url($rawInput, PHP_URL_QUERY) ?? '', $queryParams);
        if (!empty($queryParams['view_all_page_id'])) {
            $cleanId = $queryParams['view_all_page_id'];
            $name = "Marka #$cleanId";
        }
    } elseif (filter_var($rawInput, FILTER_VALIDATE_URL)) {
        $path = trim(parse_url($rawInput, PHP_URL_PATH) ?? '', '/');
        $segments = explode('/', $path);
        $cleanHandle = end($segments) ?: 'page_' . rand(1000, 9999);
        $cleanId = $cleanHandle;
        $name = ucwords(str_replace(['-', '_', '.'], ' ', $cleanHandle));
        $fbUrl = $rawInput;
    }

    // Retrieve Meta Token
    $stmtToken = $pdo->prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'metaToken'");
    $stmtToken->execute();
    $tRow = $stmtToken->fetch();
    $token = $tRow ? trim($tRow['setting_value']) : '';

    if (!empty($token)) {
        // Attempt 1: Direct Page lookup by handle / ID
        try {
            $ch = curl_init("https://graph.facebook.com/v19.0/" . urlencode($cleanHandle) . "?fields=id,name,picture.type(large),category,link,verification_status&access_token=" . urlencode($token));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 6);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            $resp = curl_exec($ch);
            $cCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($cCode === 200) {
                $j = json_decode($resp, true);
                if (!empty($j['id'])) $cleanId = (string)$j['id'];
                if (!empty($j['name'])) $name = $j['name'];
                if (!empty($j['picture']['data']['url'])) $avatarUrl = $j['picture']['data']['url'];
                if (!empty($j['category'])) $category = $j['category'];
                if (!empty($j['link'])) $fbUrl = $j['link'];
            } else {
                // Attempt 2: Search pages by keyword
                $searchUrl = "https://graph.facebook.com/v19.0/pages/search?q=" . urlencode($rawInput) . "&fields=id,name,picture.type(large),category,link&limit=1&access_token=" . urlencode($token);
                $ch2 = curl_init($searchUrl);
                curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch2, CURLOPT_TIMEOUT, 6);
                curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, true);
                $resp2 = curl_exec($ch2);
                $cCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
                curl_close($ch2);

                if ($cCode2 === 200) {
                    $j2 = json_decode($resp2, true);
                    if (!empty($j2['data'][0])) {
                        $p = $j2['data'][0];
                        if (!empty($p['id'])) $cleanId = (string)$p['id'];
                        if (!empty($p['name'])) $name = $p['name'];
                        if (!empty($p['picture']['data']['url'])) $avatarUrl = $p['picture']['data']['url'];
                        if (!empty($p['category'])) $category = $p['category'];
                        if (!empty($p['link'])) $fbUrl = $p['link'];
                    }
                }
            }
        } catch (Exception $e) {
            // Non-blocking
        }
    }

    $id = 'comp_' . time() . '_' . rand(100, 999);
    $activeCount = 0;

    // Check if already exists in db
    $chkStmt = $pdo->prepare("SELECT id, page_id as pageId, name, facebook_page_url as facebookPageUrl, avatar_url as avatarUrl, category, active_ads_count as activeAdsCount FROM competitors WHERE page_id = ? OR name = ?");
    $chkStmt->execute([$cleanId, $name]);
    $existing = $chkStmt->fetch();

    if ($existing) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Rakip zaten listenizde mevcuttu, seçildi.',
            'competitor' => $existing
        ]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO competitors (id, page_id, name, facebook_page_url, avatar_url, category, active_ads_count, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$id, $cleanId, $name, $fbUrl, $avatarUrl, $category, $activeCount, $currentUser['id']]);

        logAudit((int)$currentUser['id'], $currentUser['name'], 'Rakip Eklendi', "Yeni rakip eklendi: $name ($cleanId)", 'RAKİP');

        echo json_encode([
            'status' => 'success',
            'message' => 'Rakip başarıyla eklendi!',
            'competitor' => [
                'id' => $id,
                'pageId' => (string)$cleanId,
                'name' => $name,
                'facebookPageUrl' => $fbUrl,
                'avatarUrl' => $avatarUrl,
                'category' => $category,
                'activeAdsCount' => $activeCount
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Bu rakip eklenirken bir veritabanı hatası oluştu.']);
    }
    exit;
}

// DELETE: Delete Competitor
if ($method === 'DELETE') {
    $id = trim($_GET['id'] ?? $input['id'] ?? '');
    $action = $_GET['action'] ?? '';

    if ($action === 'clear_all' || $id === 'ALL') {
        $pdo->exec("DELETE FROM competitors");
        $pdo->exec("DELETE FROM saved_ads");
        logAudit((int)$currentUser['id'], $currentUser['name'], 'Tüm Rakipler Temizlendi', "Tüm örnek rakip ve reklam verileri silindi.", 'RAKİP');
        echo json_encode(['status' => 'success', 'message' => 'Tüm kayıtlar temizlendi.']);
        exit;
    }

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Geçersiz rakip ID.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM competitors WHERE id = ? OR page_id = ?");
    $stmt->execute([$id, $id]);

    logAudit((int)$currentUser['id'], $currentUser['name'], 'Rakip Silindi', "Rakip kaldırıldı: ID $id", 'RAKİP');

    echo json_encode([
        'status' => 'success',
        'message' => 'Rakip başarıyla silindi.'
    ]);
    exit;
}
