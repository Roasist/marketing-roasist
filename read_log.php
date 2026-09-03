<?php
$secret = $_GET['secret'] ?? '';
if ($secret !== 'roasist_marketing_deploy_secret_2026') { exit; }
header('Content-Type: text/plain');
if (file_exists(__DIR__ . '/error_log')) {
    $lines = file(__DIR__ . '/error_log');
    echo implode("", array_slice($lines, -30));
} else {
    echo "No error_log found in web root\n";
}
