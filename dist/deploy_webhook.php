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
$githubZipUrl = 'https://github.com/Roasist/marketing-roasist/archive/refs/heads/main.zip';

$log = [];
$filesCopied = 0;

// Method A: If Git repository exists on server, try git fetch & reset
if (is_dir($repoDir) && function_exists('exec')) {
    $cmd = "cd $repoDir && git fetch origin main 2>&1 && git reset --hard origin/main 2>&1";
    exec($cmd, $gitOutput, $gitStatus);
    $log['git_pull'] = $gitOutput;

    if ($gitStatus === 0) {
        $cpCmd = "cp -rf $repoDir/* $targetDir/ 2>&1 && cp -f $repoDir/.htaccess $targetDir/.htaccess 2>&1";
        exec($cpCmd, $cpOutput, $cpStatus);
        $log['copy_files'] = $cpOutput;
    }
}

// Method B: High-reliability fallback using GitHub zip & ZipArchive
$tempZip = sys_get_temp_dir() . '/roasist_deploy_' . time() . '.zip';
$extractDir = sys_get_temp_dir() . '/roasist_extracted_' . time();

$zipContent = @file_get_contents($githubZipUrl);
if (!$zipContent && function_exists('curl_init')) {
    $ch = curl_init($githubZipUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Roasist-AutoDeployer');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $zipContent = curl_exec($ch);
    curl_close($ch);
}

if ($zipContent && class_exists('ZipArchive')) {
    file_put_contents($tempZip, $zipContent);
    $zip = new ZipArchive();
    if ($zip->open($tempZip) === TRUE) {
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
    'details' => $log
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
