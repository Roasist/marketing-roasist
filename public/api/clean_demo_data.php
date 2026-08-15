<?php
/**
 * Purge Demo Competitors and Demo Saved Ads from SQLite database
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$pdo = Database::getConnection();

// Delete all competitors, dummy ads, forecast plans and cache
$pdo->exec("DELETE FROM competitors");
$pdo->exec("DELETE FROM saved_ads");
$pdo->exec("DELETE FROM forecast_plans");
$pdo->exec("DELETE FROM keyword_cache");

echo json_encode([
    'status' => 'success',
    'message' => 'Tüm örnek veriler ve tahminleme önbelleği veritabanından tamamen temizlendi.'
]);
