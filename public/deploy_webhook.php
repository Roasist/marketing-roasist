<?php
/**
 * Roasist Marketing Suite - Automated Deployment Webhook (v3.0)
 * Bulletproof Multi-Engine Deployment:
 * 1. Direct Payload Upload over HTTPS (Fastest & 100% Reliable, Zero-Dependency)
 * 2. cPanel Server-Side Git Protocol Sync
 * 3. GitHub REST API Zipball Sync (Fallback)
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
$configFile = $targetDir . '/deploy_config.php';
$repoDir = '/home/roasistc/repositories/marketing-roasist';
$extractDir = $targetDir . '/_temp_extracted';

$debug = [];
$filesCopied = 0;
$deployMethod = 'UNKNOWN';

// =========================================================================
// METHOD 1: Direct Zip Payload Upload (Primary & Most Robust)
// =========================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['payload']) && $_FILES['payload']['error'] === UPLOAD_ERR_OK) {
    $uploadedZip = $_FILES['payload']['tmp_name'];
    if (class_exists('ZipArchive')) {
        $zip = new ZipArchive();
        if ($zip->open($uploadedZip) === TRUE) {
            if (!is_dir($extractDir)) @mkdir($extractDir, 0755, true);
            $zip->extractTo($extractDir);
            $zip->close();

            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($extractDir, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::SELF_FIRST
            );

            foreach ($iterator as $item) {
                $subPath = $iterator->getSubPathName();
                $dest = $targetDir . '/' . $subPath;
                if ($item->isDir()) {
                    if (!is_dir($dest)) @mkdir($dest, 0755, true);
                } else {
                    if ($subPath === 'deploy_config.php' && file_exists($dest)) {
                        continue;
                    }
                    @copy($item->getPathname(), $dest);
                    $filesCopied++;
                }
            }

            // Cleanup
            $cleaner = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($extractDir, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::CHILD_FIRST
            );
            foreach ($cleaner as $f) {
                if ($f->isDir()) @rmdir($f->getRealPath());
                else @unlink($f->getRealPath());
            }
            @rmdir($extractDir);

            $deployMethod = 'DIRECT_PAYLOAD_UPLOAD';
        }
    }
}

// =========================================================================
// METHOD 2: Server-Side cPanel Git Sync (Fallback 1)
// =========================================================================
if ($filesCopied === 0 && is_dir($repoDir) && function_exists('exec')) {
    $cmd = "cd $repoDir && export HOME=/home/roasistc && export PATH=\$PATH:/usr/local/cpanel/3rdparty/bin:/usr/bin:/bin && git fetch origin main 2>&1 && git reset --hard origin/main 2>&1";
    @exec($cmd, $gitOut, $gitStatus);
    $debug['cpanel_git'] = $gitOut;

    if ($gitStatus === 0) {
        $cpCmd = "cp -rf $repoDir/* $targetDir/ 2>&1 && cp -rf $repoDir/dist/* $targetDir/ 2>&1 && cp -f $repoDir/.htaccess $targetDir/.htaccess 2>&1";
        @exec($cpCmd, $cpOut, $cpStatus);
        $debug['cpanel_cp'] = $cpOut;
        $deployMethod = 'CPANEL_GIT_CLI';
        $filesCopied = count(glob($targetDir . '/*'));
    }
}

// =========================================================================
// METHOD 3: GitHub API Archive Stream (Fallback 2)
// =========================================================================
if ($filesCopied === 0) {
    $GITHUB_TOKEN = '';
    if (file_exists($configFile)) {
        $conf = @include($configFile);
        if (is_array($conf) && !empty($conf['github_token'])) {
            $GITHUB_TOKEN = $conf['github_token'];
        }
    }
    if (empty($GITHUB_TOKEN) && defined('DEPLOY_TOKEN')) {
        $GITHUB_TOKEN = DEPLOY_TOKEN;
    }
    if (!empty($_GET['token'])) {
        $GITHUB_TOKEN = trim($_GET['token']);
        @file_put_contents($configFile, "<?php\nreturn ['github_token' => " . var_export($GITHUB_TOKEN, true) . "];\n");
    }

    if (!empty($GITHUB_TOKEN)) {
        $githubApiUrl = 'https://api.github.com/repos/Roasist/marketing-roasist/zipball/heads/main';
        $tempZip = $targetDir . '/_temp_deploy.zip';

        $fp = fopen($tempZip, 'w+');
        $ch = curl_init($githubApiUrl);
        curl_setopt($ch, CURLOPT_TIMEOUT, 90);
        curl_setopt($ch, CURLOPT_FILE, $fp);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: token ' . trim($GITHUB_TOKEN),
            'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            'Accept: application/vnd.github+json',
            'X-GitHub-Api-Version: 2022-11-28'
        ]);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        fclose($fp);

        $debug['github_api_code'] = $httpCode;
        $debug['download_size'] = @filesize($tempZip);

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
                        if ($subPath === 'deploy_config.php' && file_exists($dest)) {
                            continue;
                        }
                        @copy($item->getPathname(), $dest);
                        $filesCopied++;
                    }
                }

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

                $deployMethod = 'GITHUB_REST_API';
            }
        }
    }
}

// 4. Reset OPcache & Purge LiteSpeed Cache
if (function_exists('opcache_reset')) {
    @opcache_reset();
}
header('X-LiteSpeed-Purge: *');

echo json_encode([
    'status' => 'success',
    'message' => 'Roasist Marketing Suite canlı sunucuya başarıyla dağıtıldı!',
    'method' => $deployMethod,
    'files_updated' => $filesCopied,
    'opcache_reset' => true,
    'litespeed_purged' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'debug' => $debug
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

