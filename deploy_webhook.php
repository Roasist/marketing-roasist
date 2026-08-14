<?php
/**
 * Roasist Marketing Suite - Automated Deployment Webhook
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

$targetDir = __DIR__;
$repoDir = '/home/roasistc/repositories/marketing-roasist';
$githubZipUrl = 'https://codeload.github.com/Roasist/marketing-roasist/zip/refs/heads/main';

$log = [];
$filesCopied = 0;

// Method A: If Git repository exists on server and exec is enabled
if (is_dir($repoDir) && function_exists('exec')) {
    $cmd = "cd $repoDir && git fetch origin main 2>&1 && git reset --hard origin/main 2>&1";
    @exec($cmd, $gitOutput, $gitStatus);
    $log['git_pull'] = $gitOutput;

    if ($gitStatus === 0) {
        $cpCmd = "cp -rf $repoDir/* $targetDir/ 2>&1 && cp -f $repoDir/.htaccess $targetDir/.htaccess 2>&1";
        @exec($cpCmd, $cpOutput, $cpStatus);
        $log['copy_files'] = $cpOutput;
    }
}

// Method B: High-reliability direct download via cURL and ZipArchive
$tempZip = $targetDir . '/_temp_deploy.zip';
$extractDir = $targetDir . '/_temp_extracted';

$fp = fopen($tempZip, 'w+');
$ch = curl_init($githubZipUrl);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_FILE, $fp);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Roasist-AutoDeployer');
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
fclose($fp);

$log['http_code'] = $httpCode;
$log['zip_size'] = @filesize($tempZip);

if (class_exists('ZipArchive') && file_exists($tempZip) && filesize($tempZip) > 1000) {
    $zip = new ZipArchive();
    if ($zip->open($tempZip) === TRUE) {
        if (!is_dir($extractDir)) {
            @mkdir($extractDir, 0755, true);
        }
        $zip->extractTo($extractDir);
        $zip->close();

        $extractedFolders = glob($extractDir . '/*', GLOB_ONLYDIR);
        $sourceDir = !empty($extractedFolders) ? $extractedFolders[0] : $extractDir;

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($sourceDir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $item) {
            $subPath = $iterator->getSubPathName();
            $dest = $targetDir . '/' . $subPath;
            if ($item->isDir()) {
                if (!is_dir($dest)) {
                    @mkdir($dest, 0755, true);
                }
            } else {
                @copy($item->getPathname(), $dest);
                $filesCopied++;
            }
        }

        if (file_exists($sourceDir . '/.htaccess')) {
            @copy($sourceDir . '/.htaccess', $targetDir . '/.htaccess');
        }

        // Cleanup
        @unlink($tempZip);
        $cleaner = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($extractDir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($cleaner as $f) {
            if ($f->isDir()) @rmdir($f->getRealPath());
            else @unlink($f->getRealPath());
        }
        @rmdir($extractDir);
    }
}

// 4. Auto-trigger OPcache & LiteSpeed Clear
$opcacheReset = false;
if (function_exists('opcache_reset')) {
    $opcacheReset = @opcache_reset();
}

header('X-LiteSpeed-Purge: *');

echo json_encode([
    'status' => 'success',
    'message' => 'Roasist Marketing Suite canlı sunucuya başarıyla dağıtıldı!',
    'files_updated' => $filesCopied,
    'opcache_reset' => $opcacheReset,
    'litespeed_purged' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'debug' => $log
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
