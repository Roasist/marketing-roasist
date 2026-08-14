<?php
/**
 * Roasist Marketing Suite - Workspaces (Çalışma Alanları) Management API
 * Multi-Brand isolation and workspace switcher backend
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$currentUser = requireAuth();
$pdo = Database::getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET: List all workspaces
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT w.*, 
                (SELECT COUNT(*) FROM competitors c WHERE c.workspace_id = w.id) as competitor_count,
                (SELECT COUNT(*) FROM saved_ads s WHERE s.workspace_id = w.id) as saved_ads_count
            FROM workspaces w
            ORDER BY w.is_default DESC, w.created_at ASC
        ");
        $stmt->execute();
        $workspaces = $stmt->fetchAll();

        $activeWsId = $_GET['active_id'] ?? ($workspaces[0]['id'] ?? 'ws_default_roasist');

        echo json_encode([
            'status' => 'success',
            'activeWorkspaceId' => $activeWsId,
            'workspaces' => $workspaces
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Çalışma alanları yüklenirken hata: ' . $e->getMessage()]);
    }
    exit;
}

$rawInput = file_get_contents('php://input');
$input = !empty($rawInput) ? json_decode($rawInput, true) : null;
if (!is_array($input)) {
    $input = $_POST ?: [];
}

// POST: Create New Workspace
if ($method === 'POST') {
    $name = trim($input['name'] ?? '');
    if (empty($name)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Lütfen bir çalışma alanı / marka adı girin.']);
        exit;
    }

    $domain = strtolower(trim(preg_replace('#^https?://#', '', rtrim($input['domain'] ?? '', '/'))));
    $domain = preg_replace('#^www\.#', '', $domain);
    $domain = explode('/', $domain)[0];

    $industry = 'Genel';
    $color = '#2563eb';
    $currency = 'TRY';
    $logoUrl = !empty($domain) ? "https://www.google.com/s2/favicons?domain=" . urlencode($domain) . "&sz=128" : '';

    $id = 'ws_' . strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name)) . '_' . time();
    $slug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '-', $name)) . '-' . rand(100, 999);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO workspaces (id, name, slug, domain, industry, color, logo_url, currency, created_by, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        ");
        $stmt->execute([
            $id,
            $name,
            $slug,
            $domain,
            $industry,
            $color,
            $logoUrl,
            $currency,
            $currentUser['id']
        ]);

        // Add creator to workspace_members
        $stmtMem = $pdo->prepare("INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'OWNER')");
        $stmtMem->execute([$id, $currentUser['id']]);

        logAudit((int)$currentUser['id'], $currentUser['name'], 'Çalışma Alanı Oluşturuldu', "$name ($domain) çalışma alanı oluşturuldu.", 'ÇALIŞMA_ALANI');

        echo json_encode([
            'status' => 'success',
            'message' => 'Yeni çalışma alanı başarıyla oluşturuldu!',
            'workspace' => [
                'id' => $id,
                'name' => $name,
                'slug' => $slug,
                'domain' => $domain,
                'industry' => $industry,
                'color' => $color,
                'logo_url' => $logoUrl,
                'currency' => $currency,
                'competitor_count' => 0,
                'saved_ads_count' => 0
            ]
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Çalışma alanı oluşturulamadı: ' . $e->getMessage()]);
    }
    exit;
}

// PUT: Update Workspace
if ($method === 'PUT') {
    $id = trim($_GET['id'] ?? $input['id'] ?? '');
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Çalışma alanı ID belirtilmedi.']);
        exit;
    }

    $name = trim($input['name'] ?? '');
    if (empty($name)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Marka adı boş bırakılamaz.']);
        exit;
    }

    $domain = strtolower(trim(preg_replace('#^https?://#', '', rtrim($input['domain'] ?? '', '/'))));
    $domain = preg_replace('#^www\.#', '', $domain);
    $domain = explode('/', $domain)[0];

    $logoUrl = !empty($domain) ? "https://www.google.com/s2/favicons?domain=" . urlencode($domain) . "&sz=128" : '';

    try {
        $stmt = $pdo->prepare("
            UPDATE workspaces 
            SET name = ?, domain = ?, logo_url = ?
            WHERE id = ?
        ");
        $stmt->execute([$name, $domain, $logoUrl, $id]);

        logAudit((int)$currentUser['id'], $currentUser['name'], 'Çalışma Alanı Güncellendi', "$name çalışma alanı bilgileri güncellendi.", 'ÇALIŞMA_ALANI');

        echo json_encode([
            'status' => 'success',
            'message' => 'Çalışma alanı bilgileri güncellendi!'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Güncelleme hatası: ' . $e->getMessage()]);
    }
    exit;
}

// DELETE: Delete Workspace
if ($method === 'DELETE') {
    $id = trim($_GET['id'] ?? $input['id'] ?? '');
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Çalışma alanı ID belirtilmedi.']);
        exit;
    }

    try {
        $stmtCount = $pdo->query("SELECT COUNT(*) as count FROM workspaces");
        $rowCount = $stmtCount->fetch();
        if ((int)($rowCount['count'] ?? 0) <= 1) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Son kalan ana çalışma alanı silinemez.']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM workspaces WHERE id = ?");
        $stmt->execute([$id]);

        // Cleanup associated workspace competitors & saved ads
        $pdo->prepare("DELETE FROM competitors WHERE workspace_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM saved_ads WHERE workspace_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM workspace_members WHERE workspace_id = ?")->execute([$id]);

        logAudit((int)$currentUser['id'], $currentUser['name'], 'Çalışma Alanı Silindi', "ID: $id çalışma alanı silindi.", 'ÇALIŞMA_ALANI');

        echo json_encode([
            'status' => 'success',
            'message' => 'Çalışma alanı başarıyla silindi.'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Silme hatası: ' . $e->getMessage()]);
    }
    exit;
}
