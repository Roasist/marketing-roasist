<?php
/**
 * Auto-Deployment Webhook Script for Veridyen
 * Target Domain: marketing.roasist.com
 */

header('Content-Type: application/json');

$repoDir = '/home/roasistc/repositories/marketing-roasist';
$targetDir = '/home/roasistc/marketing.roasist.com';

$log = [];

if (is_dir($repoDir)) {
    // 1. Pull latest from GitHub in the repository directory
    $cmd = "cd $repoDir && git fetch origin main 2>&1 && git reset --hard origin/main 2>&1";
    exec($cmd, $gitOutput, $gitStatus);
    $log['git_pull'] = $gitOutput;

    // 2. Copy all files, dotfiles (.htaccess) and assets to marketing.roasist.com
    $cpCmd = "cp -rf $repoDir/* $targetDir/ 2>&1 && cp -f $repoDir/.htaccess $targetDir/.htaccess 2>&1 && cp -f $repoDir/deploy.php $targetDir/deploy.php 2>&1";
    exec($cpCmd, $cpOutput, $cpStatus);
    $log['copy_files'] = $cpOutput;

    echo json_encode([
        'status' => 'success',
        'message' => 'Deployment executed successfully!',
        'details' => $log
    ], JSON_PRETTY_PRINT);
} else {
    // Fallback
    $cmd = "cd " . __DIR__ . " && git pull origin main 2>&1";
    exec($cmd, $out, $ret);
    echo json_encode([
        'status' => $ret === 0 ? 'success' : 'fallback_executed',
        'output' => $out
    ], JSON_PRETTY_PRINT);
}
