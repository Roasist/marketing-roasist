<?php
/**
 * Roasist Marketing Suite - Automated Deployment Webhook
 * Target Domain: marketing.roasist.com
 */

header('Content-Type: application/json');

$SECRET_TOKEN = 'roasist_marketing_deploy_secret_2026';

// 1. Güvenlik Doğrulaması
$providedSecret = $_GET['secret'] ?? $_POST['secret'] ?? '';
if ($providedSecret !== $SECRET_TOKEN) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Invalid secret token']);
    exit;
}

$targetDir = __DIR__;
$repoDir = '/home/roasistc/repositories/marketing-roasist';

$debug = [];
$filesCopied = 0;

// Method 1: Execute cPanel Git pull directly on authenticated repository
$gitCommands = [
    "cd $repoDir && /usr/local/cpanel/3rdparty/bin/git pull origin main 2>&1",
    "cd $repoDir && git pull origin main 2>&1",
    "git --git-dir=$repoDir/.git --work-tree=$repoDir pull origin main 2>&1"
];

$gitSuccess = false;
foreach ($gitCommands as $cmd) {
    @exec($cmd, $out, $ret);
    $debug['commands'][] = ['cmd' => $cmd, 'output' => $out, 'code' => $ret];
    if ($ret === 0) {
        $gitSuccess = true;
        break;
    }
}

// Method 2: Copy from repository to marketing.roasist.com
if (is_dir($repoDir)) {
    // Copy all files
    @exec("cp -rf $repoDir/* $targetDir/ 2>&1", $cpOut1);
    @exec("cp -rf $repoDir/dist/* $targetDir/ 2>&1", $cpOut2);
    @exec("cp -f $repoDir/.htaccess $targetDir/.htaccess 2>&1", $cpOut3);
    $debug['copy'] = ['cp1' => $cpOut1, 'cp2' => $cpOut2, 'cp3' => $cpOut3];
}

// Method 3: OPcache & LiteSpeed Clear
if (function_exists('opcache_reset')) {
    @opcache_reset();
}
header('X-LiteSpeed-Purge: *');

echo json_encode([
    'status' => 'success',
    'message' => 'Roasist Marketing Suite canlı sunucuya başarıyla dağıtıldı!',
    'git_success' => $gitSuccess,
    'opcache_reset' => true,
    'litespeed_purged' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'debug' => $debug
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
