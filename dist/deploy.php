<?php
/**
 * Auto-deployment Webhook Script for Veridyen Server
 * Subdomain: marketing.roasist.com
 */

// Secret key for security (optional)
$secret = "roasist_secret_key_123";

// Log file path
$logFile = __DIR__ . '/deploy.log';

function logMessage($msg) {
    global $logFile;
    file_put_contents($logFile, date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
}

logMessage("Webhook tetiklendi.");

// Execute git pull & copy dist files
$output = [];
$returnVar = 0;

exec("cd " . __DIR__ . " && git pull origin main 2>&1", $output, $returnVar);

logMessage("Git Pull Sonucu (Code: $returnVar): " . implode("\n", $output));

echo json_encode([
    'status' => $returnVar === 0 ? 'success' : 'error',
    'message' => 'Deploy executed',
    'output' => $output
]);
