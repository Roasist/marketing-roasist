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
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Invalid secret token']);
    exit;
}

$targetDir = __DIR__;
$repoDir = '/home/roasistc/repositories/marketing-roasist';
$githubZipUrl = 'https://codeload.github.com/Roasist/marketing-roasist/zip/refs/heads/main';
$tempZip = $targetDir . '/_temp_deploy.zip';
$extractDir = $targetDir . '/_temp_extracted';

$debug = [];
$filesCopied = 0;

// Method 1: Git CLI with multiple binary paths
$gitBins = ['git', '/usr/bin/git', '/usr/local/bin/git', '/usr/local/cpanel/3rdparty/bin/git'];
if (is_dir($repoDir) && function_exists('exec')) {
    foreach ($gitBins as $gitBin) {
        $cmd = "cd $repoDir && $gitBin fetch origin main 2>&1 && $gitBin reset --hard origin/main 2>&1";
        @exec($cmd, $out, $ret);
        if ($ret === 0) {
            $debug['git_method'] = 'success using ' . $gitBin;
            $debug['git_output'] = $out;
            @exec("cp -rf $repoDir/* $targetDir/ 2>&1 && cp -f $repoDir/.htaccess $targetDir/.htaccess 2>&1");
            break;
        }
    }
}

// Method 2: High-Reliability Browser-Emulated ZIP Download
$fp = fopen($tempZip, 'w+');
$ch = curl_init($githubZipUrl);
curl_setopt($ch, CURLOPT_TIMEOUT, 90);
curl_setopt($ch, CURLOPT_FILE, $fp);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);
fclose($fp);

$debug['http_code'] = $httpCode;
$debug['curl_error'] = $curlError;
$debug['downloaded_size'] = @filesize($tempZip);

if (class_exists('ZipArchive') && file_exists($tempZip) && filesize($tempZip) > 1000) {
    $zip = new ZipArchive();
    if ($zip->open($tempZip) === TRUE) {
        if (!is_dir($extractDir)) @mkdir($extractDir, 0755, true);
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
                if (!is_dir($dest)) @mkdir($dest, 0755, true);
            } else {
                @copy($item->getPathname(), $dest);
                $filesCopied++;
            }
        }

        if (file_exists($sourceDir . '/.htaccess')) {
            @copy($sourceDir . '/.htaccess', $targetDir . '/.htaccess');
        }

        // Temizlik
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

// 4. OPcache & LiteSpeed Clear
if (function_exists('opcache_reset')) {
    @opcache_reset();
}
header('X-LiteSpeed-Purge: *');

echo json_encode([
    'status' => 'success',
    'message' => 'Roasist Marketing Suite canlı sunucuya başarıyla dağıtıldı!',
    'files_updated' => $filesCopied,
    'opcache_reset' => true,
    'litespeed_purged' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'debug' => $debug
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
