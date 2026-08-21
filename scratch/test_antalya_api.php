<?php
require_once __DIR__ . '/../api/db.php';

$db = Database::getConnection();
$stmt = $db->query("SELECT setting_key, setting_value FROM app_settings");
$keys = [];
while ($row = $stmt->fetch()) {
    $keys[$row['setting_key']] = $row['setting_value'];
}

$clientId = $keys['googleClientId'] ?? '';
$clientSecret = $keys['googleClientSecret'] ?? '';
$refreshToken = $keys['googleRefreshToken'] ?? '';
$customerId = str_replace('-', '', $keys['googleAdsCustomerId'] ?? '');
$devToken = $keys['googleAdsDevToken'] ?? '';

// Get Access Token
$ch = curl_init('https://oauth2.googleapis.com/token');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'client_id' => $clientId,
    'client_secret' => $clientSecret,
    'refresh_token' => $refreshToken,
    'grant_type' => 'refresh_token'
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = json_decode(curl_exec($ch), true);
curl_close($ch);
$accessToken = $res['access_token'] ?? '';

echo "Customer ID: {$customerId}\n";
echo "Access Token: " . (!empty($accessToken) ? "OK" : "FAILED") . "\n\n";

$keywordsTest = [
    "turkey real estate investment",
    "turkey property investment",
    "invest in istanbul real estate",
    "turkey passport by investment",
    "invest in turkey for passport",
    "turkey investment property",
    "antalya real estate",
    "property in antalya",
    "apartment for sale in antalya",
    "villa in antalya for sale"
];

// Test 1: generateKeywordIdeas for Antalya (geoTargetConstants/21056)
$payloadIdeas = [
    "keywordPlanNetwork" => "GOOGLE_SEARCH",
    "includeAdultKeywords" => false,
    "language" => "languageConstants/1000", // English
    "geoTargetConstants" => ["geoTargetConstants/21056"],
    "keywordSeed" => ["keywords" => $keywordsTest]
];

$ch1 = curl_init("https://googleads.googleapis.com/v22/customers/{$customerId}:generateKeywordIdeas");
curl_setopt($ch1, CURLOPT_POST, true);
curl_setopt($ch1, CURLOPT_POSTFIELDS, json_encode($payloadIdeas));
curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch1, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$accessToken}",
    "developer-token: {$devToken}",
    "Content-Type: application/json"
]);
$respIdeas = curl_exec($ch1);
curl_close($ch1);

echo "=== TEST 1: generateKeywordIdeas FOR ANTALYA (21056) [Language: English (1000)] ===\n";
$jsonIdeas = json_decode($respIdeas, true);
if (!empty($jsonIdeas['results'])) {
    foreach ($jsonIdeas['results'] as $r) {
        $text = $r['text'] ?? '';
        $m = $r['keywordIdeaMetrics'] ?? [];
        $vol = isset($m['avgMonthlySearches']) ? $m['avgMonthlySearches'] : '0/NULL';
        if (in_array(strtolower($text), array_map('strtolower', $keywordsTest))) {
            echo "KW: '{$text}' => avgMonthlySearches: {$vol}\n";
        }
    }
} else {
    echo "Raw response: " . substr($respIdeas, 0, 500) . "\n";
}

// Test 2: generateKeywordHistoricalMetrics for Antalya (geoTargetConstants/21056)
$payloadHist = [
    "keywords" => $keywordsTest,
    "geoTargetConstants" => ["geoTargetConstants/21056"],
    "keywordPlanNetwork" => "GOOGLE_SEARCH"
];

$ch2 = curl_init("https://googleads.googleapis.com/v22/customers/{$customerId}:generateKeywordHistoricalMetrics");
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($payloadHist));
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$accessToken}",
    "developer-token: {$devToken}",
    "Content-Type: application/json"
]);
$respHist = curl_exec($ch2);
curl_close($ch2);

echo "\n=== TEST 2: generateKeywordHistoricalMetrics FOR ANTALYA (21056) ===\n";
$jsonHist = json_decode($respHist, true);
if (!empty($jsonHist['results'])) {
    foreach ($jsonHist['results'] as $r) {
        $text = $r['text'] ?? '';
        $m = $r['keywordMetrics'] ?? [];
        $vol = isset($m['avgMonthlySearches']) ? $m['avgMonthlySearches'] : '0/NULL';
        echo "KW: '{$text}' => avgMonthlySearches: {$vol}\n";
    }
} else {
    echo "Raw response: " . substr($respHist, 0, 500) . "\n";
}

// Test 3: Compare with Turkey Country (geoTargetConstants/2792)
$payloadTurkey = [
    "keywords" => $keywordsTest,
    "geoTargetConstants" => ["geoTargetConstants/2792"],
    "keywordPlanNetwork" => "GOOGLE_SEARCH"
];

$ch3 = curl_init("https://googleads.googleapis.com/v22/customers/{$customerId}:generateKeywordHistoricalMetrics");
curl_setopt($ch3, CURLOPT_POST, true);
curl_setopt($ch3, CURLOPT_POSTFIELDS, json_encode($payloadTurkey));
curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch3, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$accessToken}",
    "developer-token: {$devToken}",
    "Content-Type: application/json"
]);
$respTurkey = curl_exec($ch3);
curl_close($ch3);

echo "\n=== TEST 3: generateKeywordHistoricalMetrics FOR TURKEY COUNTRY (2792) ===\n";
$jsonTurkey = json_decode($respTurkey, true);
if (!empty($jsonTurkey['results'])) {
    foreach ($jsonTurkey['results'] as $r) {
        $text = $r['text'] ?? '';
        $m = $r['keywordMetrics'] ?? [];
        $vol = isset($m['avgMonthlySearches']) ? $m['avgMonthlySearches'] : '0/NULL';
        echo "KW: '{$text}' => avgMonthlySearches: {$vol}\n";
    }
}
