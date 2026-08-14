<?php
/**
 * Roasist Marketing Suite - Competitor Management API
 * List, Add (by URL or Page ID), Delete Competitors
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
    $urlOrId = trim($input['urlOrId'] ?? $input['pageId'] ?? $input['url'] ?? $input['name'] ?? '');
    if (empty($urlOrId)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Lütfen geçerli bir Meta sayfa linki veya marka adı girin.']);
        exit;
    }

    // Extract Page ID / Slug
    $cleanId = $urlOrId;
    $name = !empty($input['name']) && $input['name'] !== $urlOrId ? $input['name'] : 'Yeni Marka';
    $category = $input['category'] ?? 'E-Ticaret';
    $avatarUrl = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150';

    // Handle Meta Ad Library URL: view_all_page_id=12345
    if (strpos($urlOrId, 'view_all_page_id=') !== false) {
        parse_str(parse_url($urlOrId, PHP_URL_QUERY) ?? '', $queryParams);
        if (!empty($queryParams['view_all_page_id'])) {
            $cleanId = $queryParams['view_all_page_id'];
            $name = "Marka #$cleanId";
        }
    } elseif (filter_var($urlOrId, FILTER_VALIDATE_URL)) {
        $path = trim(parse_url($urlOrId, PHP_URL_PATH) ?? '', '/');
        $segments = explode('/', $path);
        $cleanId = end($segments) ?: 'page_' . rand(1000, 9999);
        $name = ucwords(str_replace(['-', '_', '.'], ' ', $cleanId));
    } elseif (is_numeric($urlOrId)) {
        $cleanId = $urlOrId;
        $name = "Marka #$cleanId";
    } else {
        $cleanId = strtolower(trim(preg_replace('/[^a-zA-Z0-9_.-]/', '', $urlOrId)));
        $name = ucwords($urlOrId);
    }

    $fbUrl = filter_var($urlOrId, FILTER_VALIDATE_URL) && strpos($urlOrId, 'facebook.com') !== false
        ? $urlOrId 
        : "https://www.facebook.com/$cleanId";

    // Attempt to enrich brand details if token is configured
    $stmtToken = $pdo->prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'metaToken'");
    $stmtToken->execute();
    $tRow = $stmtToken->fetch();
    $token = $tRow ? trim($tRow['setting_value']) : '';

    if (!empty($token)) {
        try {
            $ch = curl_init("https://graph.facebook.com/v19.0/" . urlencode($cleanId) . "?fields=id,name,picture,category&access_token=" . urlencode($token));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 6);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            $resp = curl_exec($ch);
            $cCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($cCode === 200) {
                $j = json_decode($resp, true);
                if (!empty($j['name'])) {
                    $name = $j['name'];
                }
                if (!empty($j['picture']['data']['url'])) {
                    $avatarUrl = $j['picture']['data']['url'];
                }
                if (!empty($j['category'])) {
                    $category = $j['category'];
                }
                if (!empty($j['id'])) {
                    $cleanId = (string)$j['id'];
                }
            }
        } catch (Exception $e) {
            // Non-blocking fallback
        }
    }

    $id = 'comp_' . time() . '_' . rand(100, 999);
    $activeCount = 0;

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
        echo json_encode(['status' => 'error', 'message' => 'Bu rakip zaten listenizde kayıtlı.']);
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
