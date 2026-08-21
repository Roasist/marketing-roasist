<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/forecast.php';

$pdo = Database::getConnection();
$apiKeys = getApiKeys($pdo);

$clientId = $apiKeys['googleClientId'] ?? '';
$clientSecret = $apiKeys['googleClientSecret'] ?? '';
$refreshToken = $apiKeys['googleRefreshToken'] ?? '';
$devToken = $apiKeys['googleAdsDevToken'] ?? '';
$customerId = preg_replace('/[^0-9]/', '', $apiKeys['googleAdsCustomerId'] ?? '');

$chToken = curl_init('https://oauth2.googleapis.com/token');
curl_setopt($chToken, CURLOPT_POST, true);
curl_setopt($chToken, CURLOPT_POSTFIELDS, http_build_query([
    'client_id' => $clientId,
    'client_secret' => $clientSecret,
    'refresh_token' => $refreshToken,
    'grant_type' => 'refresh_token'
]));
curl_setopt($chToken, CURLOPT_RETURNTRANSFER, true);
$tRes = json_decode(curl_exec($chToken), true);
curl_close($chToken);
$accessToken = $tRes['access_token'] ?? '';

$kw = 'гражданство турции по недвижимости';

// Query Country level (Ukraine = 2804) vs Oblast level (Odesa Oblast = 20812)
$geos = [
    'Ukraine_Country_2804' => 'geoTargetConstants/2804',
    'Odesa_Oblast_20812' => 'geoTargetConstants/20812'
];

$res = [];
foreach ($geos as $gName => $gConst) {
    $chApi = curl_init("https://googleads.googleapis.com/v22/customers/{$customerId}:generateKeywordIdeas");
    curl_setopt($chApi, CURLOPT_POST, true);
    $payload = [
        "keywordPlanNetwork" => "GOOGLE_SEARCH",
        "language" => "languageConstants/1031",
        "geoTargetConstants" => [$gConst],
        "keywordSeed" => ["keywords" => [$kw]],
        "includeAdultKeywords" => false
    ];
    curl_setopt($chApi, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($chApi, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chApi, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$accessToken}",
        "developer-token: {$devToken}",
        "Content-Type: application/json"
    ]);
    $resp = curl_exec($chApi);
    $httpCode = curl_getinfo($chApi, CURLINFO_HTTP_CODE);
    curl_close($chApi);

    $json = json_decode($resp, true);
    
    $item = null;
    if (!empty($json['results'])) {
        foreach ($json['results'] as $r) {
            if (mb_strtolower(trim($r['text'] ?? ''), 'UTF-8') === mb_strtolower(trim($kw), 'UTF-8')) {
                $item = $r;
                break;
            }
        }
    }

    $res[$gName] = [
        'httpCode' => $httpCode,
        'exactItem' => $item
    ];
}

echo json_encode($res, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
