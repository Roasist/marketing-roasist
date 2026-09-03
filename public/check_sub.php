<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

$secret = $_GET['secret'] ?? '';
if ($secret !== 'roasist_marketing_deploy_secret_2026') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

require_once __DIR__ . '/api/db.php';
$pdo = Database::getConnection();

$cacheList = [];
$stmt = $pdo->query("SELECT cache_key, data, created_at FROM keyword_cache ORDER BY created_at DESC LIMIT 15");
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $decoded = json_decode($r['data'] ?? '{}', true);
    $kws = $decoded['keywords'] ?? $decoded['discoveredKeywords'] ?? [];
    if (!is_array($kws) && isset($decoded['data']['keywords'])) {
        $kws = $decoded['data']['keywords'];
    }
    $cacheList[] = [
        'key' => $r['cache_key'],
        'created_at' => $r['created_at'],
        'kwCount' => is_array($kws) ? count($kws) : 0,
        'first3' => is_array($kws) ? array_slice(array_map(fn($k) => $k['text'] ?? $k['keyword'] ?? '', $kws), 0, 5) : []
    ];
}

echo json_encode(['caches' => $cacheList], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
