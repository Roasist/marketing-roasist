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

try {
    require_once __DIR__ . '/api/db.php';
    $pdo = Database::getConnection();

    $targetSubId = $_GET['sub_id'] ?? 'sub_1787923419053';

    $result = [
        'targetSubId' => $targetSubId,
        'allPlans' => [],
        'foundInPlans' => [],
        'keywordCacheMatches' => []
    ];

    $stmt = $pdo->query("SELECT id, name, target_url, seed_keywords, monthly_budget, selected_keywords, plan_data, created_at FROM forecast_plans");
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $planData = json_decode($r['plan_data'] ?? '{}', true);
        if (!is_array($planData)) $planData = [];
        $subs = $planData['subCampaigns'] ?? [];
        if (!is_array($subs)) $subs = [];

        $subSummaries = [];
        foreach ($subs as $s) {
            $subSummaries[] = [
                'id' => $s['id'] ?? '',
                'name' => $s['name'] ?? '',
                'discCount' => count($s['discoveredKeywords'] ?? []),
                'selCount' => count($s['selectedKeywords'] ?? []),
                'step1' => !empty($s['isStep1Completed']),
                'step2' => !empty($s['isStep2Completed']),
                'step3' => !empty($s['isStep3Completed'])
            ];
            if (($s['id'] ?? '') === $targetSubId) {
                $result['foundInPlans'][] = [
                    'planId' => $r['id'],
                    'planName' => $r['name'],
                    'sub' => $s
                ];
            }
        }

        $result['allPlans'][] = [
            'id' => $r['id'],
            'name' => $r['name'],
            'subs' => $subSummaries
        ];
    }

    $cacheStmt = $pdo->query("SELECT cache_key, created_at FROM keyword_cache ORDER BY created_at DESC LIMIT 20");
    while ($c = $cacheStmt->fetch(PDO::FETCH_ASSOC)) {
        $result['keywordCacheMatches'][] = [
            'key' => $c['cache_key'],
            'created_at' => $c['created_at']
        ];
    }

    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
