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

// 1. Fetch Farsi cache (d17ff38a639e81eee1ec46e1d80e7a1e)
$farsiCacheStmt = $pdo->prepare("SELECT data FROM keyword_cache WHERE cache_key = 'd17ff38a639e81eee1ec46e1d80e7a1e'");
$farsiCacheStmt->execute();
$farsiRow = $farsiCacheStmt->fetch(PDO::FETCH_ASSOC);

$farsiKeywords = array();
if ($farsiRow && !empty($farsiRow['data'])) {
    $fDecoded = json_decode($farsiRow['data'], true);
    if (isset($fDecoded['keywords']) && is_array($fDecoded['keywords'])) {
        $farsiKeywords = $fDecoded['keywords'];
    } elseif (isset($fDecoded['discoveredKeywords']) && is_array($fDecoded['discoveredKeywords'])) {
        $farsiKeywords = $fDecoded['discoveredKeywords'];
    }
}

// 2. Fetch Russian cache (a56102c9f76d4ba523bfaf8b1c54f0d2)
$ruCacheStmt = $pdo->prepare("SELECT data FROM keyword_cache WHERE cache_key = 'a56102c9f76d4ba523bfaf8b1c54f0d2'");
$ruCacheStmt->execute();
$ruRow = $ruCacheStmt->fetch(PDO::FETCH_ASSOC);

$ruKeywords = array();
if ($ruRow && !empty($ruRow['data'])) {
    $rDecoded = json_decode($ruRow['data'], true);
    if (isset($rDecoded['keywords']) && is_array($rDecoded['keywords'])) {
        $ruKeywords = $rDecoded['keywords'];
    } elseif (isset($rDecoded['discoveredKeywords']) && is_array($rDecoded['discoveredKeywords'])) {
        $ruKeywords = $rDecoded['discoveredKeywords'];
    }
}

// 3. Update forecast_plans for Plan '1787692730001' (Kampanya 1)
$planStmt = $pdo->prepare("SELECT plan_data FROM forecast_plans WHERE id = '1787692730001' OR id = 'plan_kampanya_1'");
$planStmt->execute();
$planRow = $planStmt->fetch(PDO::FETCH_ASSOC);

if (!$planRow) {
    echo json_encode(array('status' => 'error', 'message' => 'Plan not found in DB'));
    exit;
}

$planData = json_decode($planRow['plan_data'], true);
if (!isset($planData['subCampaigns']) || !is_array($planData['subCampaigns'])) {
    echo json_encode(array('status' => 'error', 'message' => 'No subcampaigns in plan_data'));
    exit;
}

$farsiRestored = 0;
$ruRestored = 0;

foreach ($planData['subCampaigns'] as &$sc) {
    // Restore FA - Search (sub_1787923419053)
    if (isset($sc['id']) && $sc['id'] === 'sub_1787923419053') {
        $sc['discoveredKeywords'] = $farsiKeywords;
        $sc['selectedKeywords'] = $farsiKeywords;
        $sc['isStep1Completed'] = true;
        $sc['isStep2Completed'] = true;
        $farsiRestored = count($farsiKeywords);
    }
    // Restore RU - Search (sub_1787922432736)
    if (isset($sc['id']) && $sc['id'] === 'sub_1787922432736') {
        $sc['discoveredKeywords'] = $ruKeywords;
        $sc['selectedKeywords'] = $ruKeywords;
        $sc['isStep1Completed'] = true;
        $sc['isStep2Completed'] = true;
        $ruRestored = count($ruKeywords);
    }
}
unset($sc);

// Save back to DB
$newPlanDataJson = json_encode($planData, JSON_UNESCAPED_UNICODE);
$updateStmt = $pdo->prepare("UPDATE forecast_plans SET plan_data = ? WHERE id = '1787692730001' OR id = 'plan_kampanya_1'");
$updateStmt->execute(array($newPlanDataJson));

echo json_encode(array(
    'status' => 'success',
    'message' => 'Sub-campaign analysis results restored successfully from cache!',
    'farsiRestoredCount' => $farsiRestored,
    'farsiSample' => array_slice(array_map(function($k) { return isset($k['text']) ? $k['text'] : (isset($k['keyword']) ? $k['keyword'] : ''); }, $farsiKeywords), 0, 5),
    'ruRestoredCount' => $ruRestored
), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
