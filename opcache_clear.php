<?php
/**
 * Roasist Marketing Suite - OPcache & LiteSpeed Cache Purge Script
 * Target Domain: marketing.roasist.com
 */

header('Content-Type: application/json');

$SECRET_TOKEN = 'roasist_marketing_deploy_secret_2026';

// 1. Security Check
$providedSecret = $_GET['secret'] ?? $_POST['secret'] ?? '';
if ($providedSecret !== $SECRET_TOKEN) {
    http_response_code(403);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized: Invalid secret token'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. Clear OPcache
$opcacheReset = false;
if (function_exists('opcache_reset')) {
    $opcacheReset = @opcache_reset();
}

// 3. Clear LiteSpeed Cache Headers
header('X-LiteSpeed-Purge: *');
header('Cache-Control: no-cache, no-store, must-revalidate');

echo json_encode([
    'status' => 'success',
    'message' => 'OPcache ve LiteSpeed önbelleği başarıyla temizlendi!',
    'opcache_reset' => $opcacheReset,
    'litespeed_purged' => true,
    'timestamp' => date('Y-m-d H:i:s')
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
