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
$geo = 'geoTargetConstants/20812'; // Odesa Oblast

$testCases = [
  'Ideas_RU_SEARCH' => [
    'endpoint' => 'generateKeywordIdeas',
    'payload' => [
      'keywordPlanNetwork' => 'GOOGLE_SEARCH',
      'includeAdultKeywords' => false,
      'language' => 'languageConstants/1031',
      'geoTargetConstants' => [$geo],
      'keywordSeed' => ['keywords' => [$kw]]
    ]
  ],
  'Ideas_NOLANG_SEARCH' => [
    'endpoint' => 'generateKeywordIdeas',
    'payload' => [
      'keywordPlanNetwork' => 'GOOGLE_SEARCH',
      'includeAdultKeywords' => false,
      'geoTargetConstants' => [$geo],
      'keywordSeed' => ['keywords' => [$kw]]
    ]
  ],
  'Ideas_RU_SEARCH_AND_PARTNERS' => [
    'endpoint' => 'generateKeywordIdeas',
    'payload' => [
      'keywordPlanNetwork' => 'GOOGLE_SEARCH_AND_PARTNERS',
      'includeAdultKeywords' => false,
      'language' => 'languageConstants/1031',
      'geoTargetConstants' => [$geo],
      'keywordSeed' => ['keywords' => [$kw]]
    ]
  ],
  'Historical_RU_SEARCH' => [
    'endpoint' => 'generateKeywordHistoricalMetrics',
    'payload' => [
      'keywordPlanNetwork' => 'GOOGLE_SEARCH',
      'language' => 'languageConstants/1031',
      'geoTargetConstants' => [$geo],
      'keywords' => [$kw]
    ]
  ],
  'Historical_NOLANG_SEARCH' => [
    'endpoint' => 'generateKeywordHistoricalMetrics',
    'payload' => [
      'keywordPlanNetwork' => 'GOOGLE_SEARCH',
      'geoTargetConstants' => [$geo],
      'keywords' => [$kw]
    ]
  ],
  'Historical_RU_SEARCH_AND_PARTNERS' => [
    'endpoint' => 'generateKeywordHistoricalMetrics',
    'payload' => [
      'keywordPlanNetwork' => 'GOOGLE_SEARCH_AND_PARTNERS',
      'language' => 'languageConstants/1031',
      'geoTargetConstants' => [$geo],
      'keywords' => [$kw]
    ]
  ]
];

$output = [];
foreach ($testCases as $name => $tc) {
    $chApi = curl_init("https://googleads.googleapis.com/v22/customers/{$customerId}:" . $tc['endpoint']);
    curl_setopt($chApi, CURLOPT_POST, true);
    curl_setopt($chApi, CURLOPT_POSTFIELDS, json_encode($tc['payload']));
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
    $results = $json['results'] ?? [];
    
    $exactVol = null;
    $top5 = [];
    foreach ($results as $r) {
        $text = $r['text'] ?? $r['keyword'] ?? '';
        $m = $r['keywordIdeaMetrics'] ?? $r['keywordMetrics'] ?? [];
        $vol = $m['avgMonthlySearches'] ?? 0;
        if (count($top5) < 5) {
            $top5[] = ['text' => $text, 'vol' => $vol];
        }
        if (mb_strtolower(trim($text), 'UTF-8') === mb_strtolower(trim($kw), 'UTF-8')) {
            $exactVol = $vol;
        }
    }

    $output[$name] = [
        'httpCode' => $httpCode,
        'resultsCount' => count($results),
        'exactKeywordVolume' => $exactVol,
        'top5Results' => $top5,
        'rawError' => $httpCode !== 200 ? substr($resp, 0, 300) : null
    ];
}

echo json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
