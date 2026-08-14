<?php
/**
 * Roasist Marketing Suite - Saved Ads & Notes API
 * List Saved Ads, Bookmark Ad, Update Notes/Tags, Delete Ad
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$currentUser = requireAuth();
$pdo = Database::getConnection();

$method = $_SERVER['REQUEST_METHOD'];

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

    logAudit((int)$currentUser['id'], $currentUser['name'], 'Reklam Kaydedildi', "$pageName markasına ait reklam kütüphaneye kaydedildi: $headline");

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

    logAudit((int)$currentUser['id'], $currentUser['name'], 'Kaydedilen Reklam Silindi', "Kayıtlı reklam silindi: ID $id");

    echo json_encode([
        'status' => 'success',
        'message' => 'Reklam arşivden silindi.'
    ]);
    exit;
}
