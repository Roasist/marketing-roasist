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
    $urlOrId = trim($input['urlOrId'] ?? '');
    if (empty($urlOrId)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Lütfen geçerli bir Meta sayfa linki veya ID girin.']);
        exit;
    }

    // Extract Page ID / Slug
    $cleanId = $urlOrId;
    $name = 'Yeni Marka';
    if (filter_var($urlOrId, FILTER_VALIDATE_URL)) {
        $path = trim(parse_url($urlOrId, PHP_URL_PATH), '/');
        $segments = explode('/', $path);
        $cleanId = end($segments) ?: 'page_' . rand(1000, 9999);
        $name = ucfirst(str_replace(['-', '_', '.'], ' ', $cleanId));
    } elseif (is_numeric($urlOrId)) {
        $cleanId = $urlOrId;
        $name = "Meta Marka #$cleanId";
    }

    $id = 'comp_' . time() . '_' . rand(100, 999);
    $avatarUrl = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150';
    $fbUrl = filter_var($urlOrId, FILTER_VALIDATE_URL) ? $urlOrId : "https://www.facebook.com/$cleanId";
    $activeCount = rand(8, 35);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO competitors (id, page_id, name, facebook_page_url, avatar_url, category, active_ads_count, created_by)
            VALUES (?, ?, ?, ?, ?, 'E-Ticaret', ?, ?)
        ");
        $stmt->execute([$id, $cleanId, $name, $fbUrl, $avatarUrl, $activeCount, $currentUser['id']]);

        logAudit((int)$currentUser['id'], $currentUser['name'], 'Rakip Eklendi', "Yeni rakip eklendi: $name ($cleanId)");

        echo json_encode([
            'status' => 'success',
            'message' => 'Rakip başarıyla eklendi!',
            'competitor' => [
                'id' => $id,
                'pageId' => $cleanId,
                'name' => $name,
                'facebookPageUrl' => $fbUrl,
                'avatarUrl' => $avatarUrl,
                'category' => 'E-Ticaret',
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
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Geçersiz rakip ID.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM competitors WHERE id = ? OR page_id = ?");
    $stmt->execute([$id, $id]);

    logAudit((int)$currentUser['id'], $currentUser['name'], 'Rakip Silindi', "Rakip kaldırıldı: ID $id");

    echo json_encode([
        'status' => 'success',
        'message' => 'Rakip başarıyla silindi.'
    ]);
    exit;
}
