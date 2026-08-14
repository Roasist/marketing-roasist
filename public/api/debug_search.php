<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');
$pdo = Database::getConnection();

$stmt = $pdo->prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'metaToken'");
$stmt->execute();
$tokenRow = $stmt->fetch();
$token = $tokenRow ? trim($tokenRow['setting_value']) : '';

$q = $_GET['q'] ?? '23 PROJECTS';

$results = [
    'query' => $q,
    'token_length' => strlen($token)
];

// Method 1: Public Meta Ad Library Typeahead
$url1 = "https://www.facebook.com/ads/library/async/search_typeahead/?q=" . urlencode($q) . "&session_id=1&count=8&active_status=all&ad_type=all&countries[0]=ALL";
$ch1 = curl_init($url1);
curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch1, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
curl_setopt($ch1, CURLOPT_TIMEOUT, 6);
$resp1 = curl_exec($ch1);
$http1 = curl_getinfo($ch1, CURLINFO_HTTP_CODE);
curl_close($ch1);
$results['method1_public_typeahead'] = [
    'http' => $http1,
    'raw_preview' => substr($resp1, 0, 500)
];

// Method 2: Graph API ads_archive search_terms
if (!empty($token)) {
    $params2 = [
        'access_token' => $token,
        'search_terms' => $q,
        'ad_reached_countries' => "['TR', 'US', 'DE', 'RU', 'GB']",
        'fields' => 'id,page_id,page_name',
        'limit' => 6
    ];
    $url2 = "https://graph.facebook.com/v19.0/ads_archive?" . http_build_query($params2);
    $ch2 = curl_init($url2);
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_TIMEOUT, 6);
    $resp2 = curl_exec($ch2);
    $http2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    curl_close($ch2);
    $results['method2_ads_archive'] = [
        'http' => $http2,
        'data' => json_decode($resp2, true)
    ];

    // Method 3: Graph API pages/search
    $url3 = "https://graph.facebook.com/v19.0/pages/search?q=" . urlencode($q) . "&fields=id,name,picture&access_token=" . urlencode($token);
    $ch3 = curl_init($url3);
    curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch3, CURLOPT_TIMEOUT, 6);
    $resp3 = curl_exec($ch3);
    $http3 = curl_getinfo($ch3, CURLINFO_HTTP_CODE);
    curl_close($ch3);
    $results['method3_pages_search'] = [
        'http' => $http3,
        'data' => json_decode($resp3, true)
    ];
}

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
