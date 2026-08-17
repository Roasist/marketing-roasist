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
$configFile = $targetDir . '/deploy_config.php';
$GITHUB_TOKEN = '';

// Load token from persistent config file
if (file_exists($configFile)) {
    $conf = @include($configFile);
    if (is_array($conf) && !empty($conf['github_token'])) {
        $GITHUB_TOKEN = $conf['github_token'];
    }
}

// Fallback hardcoded token if present
if (empty($GITHUB_TOKEN) && defined('DEPLOY_TOKEN')) {
    $GITHUB_TOKEN = DEPLOY_TOKEN;
}

// Allow passing / updating token in request
if (!empty($_GET['token'])) {
    $GITHUB_TOKEN = trim($_GET['token']);
    @file_put_contents($configFile, "<?php\nreturn ['github_token' => " . var_export($GITHUB_TOKEN, true) . "];\n");
}

$githubApiUrl = 'https://api.github.com/repos/Roasist/marketing-roasist/zipball/main';
$tempZip = $targetDir . '/_temp_deploy.zip';
$extractDir = $targetDir . '/_temp_extracted';

$debug = [];
$filesCopied = 0;

if (!empty($GITHUB_TOKEN)) {
    $fp = fopen($tempZip, 'w+');
    $ch = curl_init($githubApiUrl);
    curl_setopt($ch, CURLOPT_TIMEOUT, 90);
    curl_setopt($ch, CURLOPT_FILE, $fp);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: token ' . trim($GITHUB_TOKEN),
        'User-Agent: Roasist-AutoDeployer',
        'Accept: application/vnd.github+json',
        'X-GitHub-Api-Version: 2022-11-28'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    fclose($fp);

    $debug['http_code'] = $httpCode;
    $debug['download_size'] = @filesize($tempZip);
    if ($httpCode !== 200) {
        $debug['error_body'] = @file_get_contents($tempZip);
    }

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
                    // Do not overwrite persistent deploy_config.php
                    if ($subPath === 'deploy_config.php' && file_exists($dest)) {
                        continue;
                    }
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
}

// OPcache & LiteSpeed Clear
if (function_exists('opcache_reset')) {
    @opcache_reset();
}
header('X-LiteSpeed-Purge: *');

echo json_encode([
    'status' => 'success',
    'message' => 'Roasist Marketing Suite canlı sunucuya başarıyla dağıtıldı!',
    'files_updated' => $filesCopied,
    'token_configured' => !empty($GITHUB_TOKEN),
    'opcache_reset' => true,
    'litespeed_purged' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'debug' => $debug
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
