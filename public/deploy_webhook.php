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

// 2. Git Pull Çalıştırma (HOME ve PATH tanımlı olarak)
$cmd1 = "cd $repoDir && export HOME=/home/roasistc && export PATH=\$PATH:/usr/local/cpanel/3rdparty/bin:/usr/bin:/bin && git pull origin main 2>&1";
$out1 = shell_exec($cmd1);

// 3. Dosyaları Canlı Klasöre Kopyalama
$cmd2 = "cp -rf $repoDir/* $targetDir/ 2>&1 && cp -rf $repoDir/dist/* $targetDir/ 2>&1 && cp -f $repoDir/.htaccess $targetDir/.htaccess 2>&1";
$out2 = shell_exec($cmd2);

// 4. Eğer .git klasörü doğrudan hedef klasördeyse fallback
$cmd3 = "cd $targetDir && export HOME=/home/roasistc && export PATH=\$PATH:/usr/local/cpanel/3rdparty/bin:/usr/bin:/bin && git pull origin main 2>&1";
$out3 = shell_exec($cmd3);

// 5. OPcache & LiteSpeed Önbellek Temizliği
$opcacheReset = false;
if (function_exists('opcache_reset')) {
    $opcacheReset = @opcache_reset();
}
header('X-LiteSpeed-Purge: *');

echo json_encode([
    'status' => 'success',
    'message' => 'Roasist Marketing Suite canlı sunucuya başarıyla dağıtıldı!',
    'git_pull_repo' => trim($out1 ?? ''),
    'copy_files' => trim($out2 ?? ''),
    'git_pull_target' => trim($out3 ?? ''),
    'opcache_reset' => $opcacheReset,
    'litespeed_purged' => true,
    'timestamp' => date('Y-m-d H:i:s')
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
