<?php
/**
 * Purge Demo Competitors and Demo Saved Ads from SQLite database
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$pdo = Database::getConnection();

// Delete all competitors and dummy ads
$pdo->exec("DELETE FROM competitors");
$pdo->exec("DELETE FROM saved_ads");

echo json_encode([
    'status' => 'success',
    'message' => 'Tüm örnek rakip ve reklam kayıtları veritabanından tamamen temizlendi.'
]);
