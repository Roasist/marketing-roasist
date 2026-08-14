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
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

// POST: Create New Workspace
if ($method === 'POST') {
    $name = trim($input['name'] ?? '');
    if (empty($name)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Lütfen bir çalışma alanı / marka adı girin.']);
        exit;
    }

    $domain = strtolower(trim(preg_replace('#^https?://#', '', rtrim($input['domain'] ?? '', '/'))));
    $industry = trim($input['industry'] ?? 'Genel');
    $color = trim($input['color'] ?? '#2563eb');
    $currency = strtoupper(trim($input['currency'] ?? 'TRY'));
    $logoUrl = trim($input['logoUrl'] ?? '');

    if (empty($logoUrl) && !empty($domain)) {
        $logoUrl = "https://www.google.com/s2/favicons?domain=" . urlencode($domain) . "&sz=128";
    }

    $id = 'ws_' . strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name)) . '_' . time();
    $slug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '-', $name)) . '-' . rand(100, 999);

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

    // If a domain was specified, auto-add it as a primary tracked entity in this workspace
    if (!empty($domain) && strpos($domain, '.') !== false) {
        $compId = 'comp_' . md5($domain . $id);
        $stmtComp = $pdo->prepare("
            INSERT OR IGNORE INTO competitors (id, page_id, name, facebook_page_url, avatarUrl, category, active_ads_count, created_by, workspace_id)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
        ");
        $stmtComp->execute([
            $compId,
            $domain,
            $name,
            "https://$domain",
            $logoUrl,
            $industry,
            $currentUser['id'],
            $id
        ]);
    }

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
            'competitor_count' => !empty($domain) ? 1 : 0,
            'saved_ads_count' => 0
        ]
    ]);
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
    $domain = strtolower(trim(preg_replace('#^https?://#', '', rtrim($input['domain'] ?? '', '/'))));
    $industry = trim($input['industry'] ?? 'Genel');
    $color = trim($input['color'] ?? '#2563eb');
    $currency = strtoupper(trim($input['currency'] ?? 'TRY'));
    $logoUrl = trim($input['logoUrl'] ?? '');

    if (empty($logoUrl) && !empty($domain)) {
        $logoUrl = "https://www.google.com/s2/favicons?domain=" . urlencode($domain) . "&sz=128";
    }

    $stmt = $pdo->prepare("
        UPDATE workspaces 
        SET name = ?, domain = ?, industry = ?, color = ?, logo_url = ?, currency = ?
        WHERE id = ?
    ");
    $stmt->execute([$name, $domain, $industry, $color, $logoUrl, $currency, $id]);

    logAudit((int)$currentUser['id'], $currentUser['name'], 'Çalışma Alanı Güncellendi', "$name çalışma alanı bilgileri güncellendi.", 'ÇALIŞMA_ALANI');

    echo json_encode([
        'status' => 'success',
        'message' => 'Çalışma alanı bilgileri güncellendi!'
    ]);
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

    // Check count of total workspaces
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
    exit;
}
