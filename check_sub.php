<?php
header('Content-Type: application/json; charset=utf-8');

$secret = $_GET['secret'] ?? '';
if ($secret !== 'roasist_marketing_deploy_secret_2026') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

require_once __DIR__ . '/api/db.php';
$pdo = Database::getConnection();

$targetSubId = $_GET['sub_id'] ?? 'sub_1787923419053';

$result = [
    'targetSubId' => $targetSubId,
    'foundInPlans' => [],
    'rootKeywordsInPlans' => [],
    'keywordCacheMatches' => []
];

$stmt = $pdo->query("SELECT id, name, target_url, seed_keywords, monthly_budget, selected_keywords, plan_data, created_at FROM forecast_plans");
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $planData = json_decode($r['plan_data'] ?? '{}', true) ?: [];
    $subs = $planData['subCampaigns'] ?? [];
    
    // Check root keywords
    $rootKws = json_decode($r['selected_keywords'] ?? '[]', true) ?: [];
    if (!empty($rootKws)) {
        $result['rootKeywordsInPlans'][] = [
            'planId' => $r['id'],
            'planName' => $r['name'],
            'keywordCount' => count($rootKws),
            'sample' => array_slice(array_map(fn($k) => $k['text'] ?? $k['keyword'] ?? '', $rootKws), 0, 5)
        ];
    }

    foreach ($subs as $s) {
        $sId = $s['id'] ?? '';
        if ($sId === $targetSubId || (isset($_GET['all']) && !empty($sId))) {
            $discKws = $s['discoveredKeywords'] ?? [];
            $selKws = $s['selectedKeywords'] ?? [];
            $result['foundInPlans'][] = [
                'planId' => $r['id'],
                'planName' => $r['name'],
                'subId' => $sId,
                'subName' => $s['name'] ?? '',
                'platform' => $s['platform'] ?? '',
                'objective' => $s['objective'] ?? '',
                'targetUrl' => $s['targetUrl'] ?? '',
                'seedKeywords' => $s['seedKeywords'] ?? '',
                'isStep1Completed' => $s['isStep1Completed'] ?? false,
                'isStep2Completed' => $s['isStep2Completed'] ?? false,
                'isStep3Completed' => $s['isStep3Completed'] ?? false,
                'discoveredKeywordsCount' => count($discKws),
                'selectedKeywordsCount' => count($selKws),
                'sampleDiscoveredKeywords' => array_slice(array_map(fn($k) => [
                    'text' => $k['text'] ?? $k['keyword'] ?? '',
                    'avgMonthlySearches' => $k['avgMonthlySearches'] ?? 0,
                    'cpc' => $k['cpc'] ?? 0
                ], $discKws), 0, 10),
                'sampleSelectedKeywords' => array_slice(array_map(fn($k) => [
                    'text' => $k['text'] ?? $k['keyword'] ?? '',
                    'avgMonthlySearches' => $k['avgMonthlySearches'] ?? 0,
                    'cpc' => $k['cpc'] ?? 0
                ], $selKws), 0, 10)
            ];
        }
    }
}

// Also check keyword_cache
$cacheStmt = $pdo->query("SELECT cache_key, created_at FROM keyword_cache ORDER BY created_at DESC LIMIT 20");
while ($c = $cacheStmt->fetch(PDO::FETCH_ASSOC)) {
    $result['keywordCacheMatches'][] = [
        'key' => $c['cache_key'],
        'created_at' => $c['created_at']
    ];
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
