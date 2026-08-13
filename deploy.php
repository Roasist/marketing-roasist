<?php
/**
 * Zero-Dependency Auto Deployment Script for Roasist Marketing Suite
 * Automatically downloads and deploys the latest GitHub main branch without requiring CLI git!
 */

header('Content-Type: application/json');

$githubZipUrl = 'https://github.com/Roasist/marketing-roasist/archive/refs/heads/main.zip';
$targetDir = __DIR__;
$tempZip = sys_get_temp_dir() . '/marketing_deploy_' . time() . '.zip';
$extractDir = sys_get_temp_dir() . '/marketing_extracted_' . time();

// 1. Download zip from GitHub
$zipContent = @file_get_contents($githubZipUrl);
if (!$zipContent) {
    // Try cURL if file_get_contents failed
    $ch = curl_init($githubZipUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Roasist-AutoDeployer');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $zipContent = curl_exec($ch);
    curl_close($ch);
}

if (!$zipContent) {
    echo json_encode([
        'status' => 'error',
        'message' => 'GitHub zip arşivi indirilemedi.'
    ]);
    exit;
}

file_put_contents($tempZip, $zipContent);

// 2. Extract ZIP
$zip = new ZipArchive();
if ($zip->open($tempZip) === TRUE) {
    $zip->extractTo($extractDir);
    $zip->close();
    
    // GitHub zip archives have a root folder like "marketing-roasist-main"
    $extractedFolders = glob($extractDir . '/*', GLOB_ONLYDIR);
    $sourceDir = !empty($extractedFolders) ? $extractedFolders[0] : $extractDir;

    // 3. Copy all files recursively to target document root
    $filesCopied = 0;
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($sourceDir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($iterator as $item) {
        $subPath = $iterator->getSubPathName();
        $dest = $targetDir . '/' . $subPath;
        if ($item->isDir()) {
            if (!is_dir($dest)) {
                mkdir($dest, 0755, true);
            }
        } else {
            copy($item->getPathname(), $dest);
            $filesCopied++;
        }
    }

    // Copy .htaccess explicitly if present
    if (file_exists($sourceDir . '/.htaccess')) {
        copy($sourceDir . '/.htaccess', $targetDir . '/.htaccess');
    }

    // Cleanup temp files
    @unlink($tempZip);
    // Recursive rmdir
    $cleaner = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($extractDir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($cleaner as $f) {
        if ($f->isDir()) @rmdir($f->getRealPath());
        else @unlink($f->getRealPath());
    }
    @rmdir($extractDir);

    echo json_encode([
        'status' => 'success',
        'message' => 'Tüm güncel dosyalar GitHub üzerinden başarıyla çekildi ve yayına alındı!',
        'files_copied' => $filesCopied,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'ZipArchive açılamadı.'
    ]);
}
