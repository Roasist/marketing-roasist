<?php
/**
 * Roasist Marketing Suite - Saved Ads & Meta Ad Library Proxy API
 * List Saved Ads, Bookmark Ad, Update Notes/Tags, Delete Ad, Fetch Live Meta Ads
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$currentUser = requireAuth();
$pdo = Database::getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ACTION: Fetch Live Ads directly from Meta Ad Library via Server-Side Proxy
if ($action === 'fetch_meta_ads') {
    $pageId = trim($_GET['page_id'] ?? $_GET['search_page_ids'] ?? '');
    $searchQuery = trim($_GET['q'] ?? '');
    $country = trim($_GET['country'] ?? 'TR');

    // Retrieve Meta Token from secure backend app_settings table
    $stmt = $pdo->prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'metaToken'");
    $stmt->execute();
    $tokenRow = $stmt->fetch();
    $accessToken = $tokenRow ? trim($tokenRow['setting_value']) : '';

    if (empty($accessToken)) {
        echo json_encode([
            'status' => 'error',
            'code' => 'TOKEN_MISSING',
            'message' => 'Meta API Access Token henüz Admin Paneli > API Bağlantıları bölümüne kaydedilmemiş.'
        ]);
        exit;
    }

    $params = [
        'access_token' => $accessToken,
        'ad_reached_countries' => "['$country']",
        'ad_active_status' => 'ACTIVE',
        'fields' => 'id,ad_creation_time,ad_delivery_start_time,ad_delivery_stop_time,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_titles,ad_snapshot_url,publisher_platforms,page_id,page_name',
        'limit' => 30
    ];

    if (!empty($pageId)) {
        $params['search_page_ids'] = $pageId;
    } elseif (!empty($searchQuery)) {
        $params['search_terms'] = $searchQuery;
    }

    $url = 'https://graph.facebook.com/v19.0/ads_archive?' . http_build_query($params);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Meta API bağlantı hatası: ' . $curlError
        ]);
        exit;
    }

    $data = json_decode($response, true);
    if ($httpCode !== 200 || isset($data['error'])) {
        $errMessage = $data['error']['message'] ?? 'Meta API hatası oluştu.';
        echo json_encode([
            'status' => 'error',
            'http_code' => $httpCode,
            'message' => $errMessage,
            'details' => $data['error'] ?? null
        ]);
        exit;
    }

    $rawAds = $data['data'] ?? [];
    $formattedAds = [];

    foreach ($rawAds as $raw) {
        $id = $raw['id'] ?? ('meta_' . rand(10000, 99999));
        $pageName = $raw['page_name'] ?? 'Meta Marka';
        $pId = $raw['page_id'] ?? $pageId;
        $bodies = $raw['ad_creative_bodies'] ?? [];
        $body = !empty($bodies) ? $bodies[0] : '';
        $titles = $raw['ad_creative_link_titles'] ?? [];
        $headline = !empty($titles) ? $titles[0] : $pageName;
        $startDate = $raw['ad_delivery_start_time'] ?? $raw['ad_creation_time'] ?? date('Y-m-d');
        $activeDays = max(1, (int)((time() - strtotime($startDate)) / 86400));
        $snapshotUrl = $raw['ad_snapshot_url'] ?? "https://www.facebook.com/ads/library/?id=$id";

        $formattedAds[] = [
            'id' => $id,
            'pageId' => (string)$pId,
            'pageName' => $pageName,
            'activeStatus' => 'ACTIVE',
            'format' => 'IMAGE',
            'creationDate' => $startDate,
            'startDate' => $startDate,
            'activeDaysCount' => $activeDays,
            'adBodyText' => $body,
            'adHeadline' => $headline,
            'mediaUrls' => ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600'],
            'ctaText' => 'Daha Fazla Bilgi Al',
            'publisherPlatforms' => $raw['publisher_platforms'] ?? ['facebook', 'instagram'],
            'hookType' => $activeDays >= 30 ? 'Kanıtlanmış Kazanan' : 'Doğrudan Teklif',
            'estimatedSpend' => $activeDays >= 30 ? '₺10,000+' : '₺2,000 - ₺5,000',
            'impressionsRange' => $activeDays >= 30 ? '100K - 500K' : '10K - 50K',
            'adSnapshotUrl' => $snapshotUrl,
            'isWinner' => $activeDays >= 30,
        ];
    }

    echo json_encode([
        'status' => 'success',
        'count' => count($formattedAds),
        'ads' => $formattedAds
    ]);
    exit;
}

// GET: List saved ads
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, ad_id as adId, competitor_id as competitorId, page_name as pageName, format, headline, body_text as bodyText, media_urls as mediaUrls, hook_type as hookType, notes, tags, is_winner as isWinner, created_at as createdAt FROM saved_ads ORDER BY created_at DESC");
    $savedAds = $stmt->fetchAll();

    foreach ($savedAds as &$ad) {
        $ad['mediaUrls'] = json_decode($ad['mediaUrls'] ?? '[]', true) ?: [];
        $ad['isWinner'] = (bool)$ad['isWinner'];
    }

    echo json_encode([
        'status' => 'success',
        'savedAds' => $savedAds
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

// POST: Save/Bookmark an ad
if ($method === 'POST') {
    $adId = trim($input['adId'] ?? $input['id'] ?? '');
    $pageName = trim($input['pageName'] ?? 'Marka');
    $headline = trim($input['adHeadline'] ?? $input['headline'] ?? '');
    $bodyText = trim($input['adBodyText'] ?? $input['bodyText'] ?? '');
    $format = $input['format'] ?? 'IMAGE';
    $mediaUrls = json_encode($input['mediaUrls'] ?? []);
    $hookType = $input['hookType'] ?? 'Sosyal Kanıt';
    $notes = trim($input['notes'] ?? '');
    $tags = trim($input['tags'] ?? 'Favori');
    $isWinner = !empty($input['isWinner']) || ($input['activeDaysCount'] ?? 0) >= 30 ? 1 : 0;

    $id = 'saved_' . time() . '_' . rand(100, 999);

    $stmt = $pdo->prepare("
        INSERT INTO saved_ads (id, ad_id, competitor_id, page_name, format, headline, body_text, media_urls, hook_type, notes, tags, is_winner, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $id,
        $adId,
        $input['competitorId'] ?? $input['pageId'] ?? '',
        $pageName,
        $format,
        $headline,
        $bodyText,
        $mediaUrls,
        $hookType,
        $notes,
        $tags,
        $isWinner,
        $currentUser['id']
    ]);

    logAudit((int)$currentUser['id'], $currentUser['name'], 'Reklam Kaydedildi', "$pageName markasına ait reklam kütüphaneye kaydedildi: $headline", 'REKLAM');

    echo json_encode([
        'status' => 'success',
        'message' => 'Reklam başarıyla kaydedildi!',
        'id' => $id
    ]);
    exit;
}

// DELETE: Delete saved ad
if ($method === 'DELETE') {
    $id = trim($_GET['id'] ?? $input['id'] ?? '');
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Geçersiz reklam ID.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM saved_ads WHERE id = ? OR ad_id = ?");
    $stmt->execute([$id, $id]);

    logAudit((int)$currentUser['id'], $currentUser['name'], 'Kaydedilen Reklam Silindi', "Kayıtlı reklam silindi: ID $id", 'REKLAM');

    echo json_encode([
        'status' => 'success',
        'message' => 'Reklam arşivden silindi.'
    ]);
    exit;
}
