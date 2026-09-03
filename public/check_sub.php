<?php
header('Content-Type: application/json; charset=utf-8');

$secret = isset($_GET['secret']) ? $_GET['secret'] : '';
if ($secret !== 'roasist_marketing_deploy_secret_2026') {
    http_response_code(403);
    echo json_encode(array('error' => 'Unauthorized'));
    exit;
}

require_once __DIR__ . '/api/db.php';
$pdo = Database::getConnection();

$cacheList = array();
$stmt = $pdo->query("SELECT cache_key, data, created_at FROM keyword_cache ORDER BY created_at DESC LIMIT 25");
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $decoded = json_decode(isset($r['data']) ? $r['data'] : '{}', true);
    $kws = array();
    if (isset($decoded['keywords']) && is_array($decoded['keywords'])) {
        $kws = $decoded['keywords'];
    } elseif (isset($decoded['discoveredKeywords']) && is_array($decoded['discoveredKeywords'])) {
        $kws = $decoded['discoveredKeywords'];
    } elseif (isset($decoded['data']['keywords']) && is_array($decoded['data']['keywords'])) {
        $kws = $decoded['data']['keywords'];
    }

    $samples = array();
    $slice = array_slice($kws, 0, 5);
    foreach ($slice as $item) {
        if (isset($item['text'])) {
            $samples[] = $item['text'];
        } elseif (isset($item['keyword'])) {
            $samples[] = $item['keyword'];
        }
    }

    $cacheList[] = array(
        'key' => $r['cache_key'],
        'created_at' => $r['created_at'],
        'kwCount' => count($kws),
        'sampleKeywords' => $samples
    );
}

// Also check all plans and their subcampaigns
$plansList = array();
$pStmt = $pdo->query("SELECT id, name, selected_keywords, plan_data, created_at FROM forecast_plans");
while ($pr = $pStmt->fetch(PDO::FETCH_ASSOC)) {
    $pData = json_decode(isset($pr['plan_data']) ? $pr['plan_data'] : '{}', true);
    $pSubs = isset($pData['subCampaigns']) && is_array($pData['subCampaigns']) ? $pData['subCampaigns'] : array();
    
    $subList = array();
    foreach ($pSubs as $ps) {
        $dKws = isset($ps['discoveredKeywords']) && is_array($ps['discoveredKeywords']) ? $ps['discoveredKeywords'] : array();
        $sKws = isset($ps['selectedKeywords']) && is_array($ps['selectedKeywords']) ? $ps['selectedKeywords'] : array();
        $subList[] = array(
            'id' => isset($ps['id']) ? $ps['id'] : '',
            'name' => isset($ps['name']) ? $ps['name'] : '',
            'discCount' => count($dKws),
            'selCount' => count($sKws),
            'targetUrl' => isset($ps['targetUrl']) ? $ps['targetUrl'] : '',
            'seedKeywords' => isset($ps['seedKeywords']) ? $ps['seedKeywords'] : ''
        );
    }

    $rootKws = json_decode(isset($pr['selected_keywords']) ? $pr['selected_keywords'] : '[]', true);
    $plansList[] = array(
        'id' => $pr['id'],
        'name' => $pr['name'],
        'rootKeywordCount' => is_array($rootKws) ? count($rootKws) : 0,
        'subCampaigns' => $subList
    );
}

echo json_encode(array(
    'plans' => $plansList,
    'caches' => $cacheList
), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
