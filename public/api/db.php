<?php
/**
 * Roasist Marketing Suite - Database Connection & Helper Utilities
 * Uses persistent SQLite database on cPanel
 */

class Database {
    private static $pdo = null;

    public static function getConnection() {
        if (self::$pdo === null) {
            $dataDir = __DIR__ . '/data';
            if (!is_dir($dataDir)) {
                @mkdir($dataDir, 0755, true);
            }

            $dbPath = $dataDir . '/roasist_marketing.db';
            $isNewDb = !file_exists($dbPath);

            self::$pdo = new PDO("sqlite:" . $dbPath);
            self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            // Enable WAL mode for high performance
            self::$pdo->exec("PRAGMA journal_mode = WAL;");
            self::$pdo->exec("PRAGMA synchronous = NORMAL;");

            // Automated SQLite Backup (every 6 hours, retaining last 10 snapshots)
            $backupDir = $dataDir . '/backups';
            if (!is_dir($backupDir)) @mkdir($backupDir, 0755, true);
            $lastBackupFile = $backupDir . '/.last_backup_time';
            $now = time();
            $lastTime = file_exists($lastBackupFile) ? (int)@file_get_contents($lastBackupFile) : 0;
            if (($now - $lastTime > 21600) && file_exists($dbPath) && filesize($dbPath) > 0) {
                @copy($dbPath, $backupDir . '/roasist_backup_' . date('Ymd_His') . '.db');
                @file_put_contents($lastBackupFile, (string)$now);
                $allBackups = glob($backupDir . '/roasist_backup_*.db');
                if (count($allBackups) > 10) {
                    sort($allBackups);
                    foreach (array_slice($allBackups, 0, count($allBackups) - 10) as $oldB) {
                        @unlink($oldB);
                    }
                }
            }

            // Auto-run schema migrations
            self::initSchema(self::$pdo, $isNewDb);
        }

        return self::$pdo;
    }

    private static function initSchema($pdo, $isNew) {
        // 1. Users Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'MARKETER',
                status TEXT NOT NULL DEFAULT 'ACTIVE',
                last_login_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // 2. Competitors Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS competitors (
                id TEXT PRIMARY KEY,
                page_id TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                facebook_page_url TEXT,
                avatar_url TEXT,
                category TEXT DEFAULT 'E-Ticaret',
                active_ads_count INTEGER DEFAULT 0,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // 3. Saved Ads Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS saved_ads (
                id TEXT PRIMARY KEY,
                ad_id TEXT NOT NULL,
                competitor_id TEXT,
                page_name TEXT NOT NULL,
                format TEXT DEFAULT 'IMAGE',
                headline TEXT,
                body_text TEXT,
                media_urls TEXT,
                hook_type TEXT,
                notes TEXT,
                tags TEXT,
                is_winner INTEGER DEFAULT 0,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // 4. App Settings Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS app_settings (
                setting_key TEXT PRIMARY KEY,
                setting_value TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // 5. Audit Logs Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                user_name TEXT,
                user_email TEXT,
                user_role TEXT,
                action TEXT NOT NULL,
                category TEXT DEFAULT 'SİSTEM',
                details TEXT,
                ip_address TEXT,
                status TEXT DEFAULT 'SUCCESS',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // 6. Workspaces (Çalışma Alanları) Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS workspaces (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                domain TEXT,
                industry TEXT DEFAULT 'Genel',
                color TEXT DEFAULT '#2563eb',
                logo_url TEXT,
                currency TEXT DEFAULT 'TRY',
                created_by INTEGER,
                is_default INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // 7. Workspace Members Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS workspace_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workspace_id TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                role TEXT DEFAULT 'OWNER',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(workspace_id, user_id)
            )
        ");

        // 8. Forecast Plans Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS forecast_plans (
                id TEXT PRIMARY KEY,
                workspace_id TEXT,
                name TEXT NOT NULL,
                target_url TEXT,
                seed_keywords TEXT,
                monthly_budget REAL DEFAULT 0,
                selected_keywords TEXT,
                simulation_result TEXT,
                negative_keywords TEXT,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // 9. Keyword Cache Table (For saving API quota and fast load)
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS keyword_cache (
                cache_key TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // 10. Forecast Plan Versions (Automatic Snapshot History to prevent any data loss)
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS forecast_plan_versions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plan_id TEXT NOT NULL,
                plan_data TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // Migrations: workspace_id columns
        try {
            $pdo->exec("ALTER TABLE competitors ADD COLUMN workspace_id TEXT");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE saved_ads ADD COLUMN workspace_id TEXT");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE audit_logs ADD COLUMN user_email TEXT");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE audit_logs ADD COLUMN user_role TEXT");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE audit_logs ADD COLUMN category TEXT DEFAULT 'SİSTEM'");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE audit_logs ADD COLUMN status TEXT DEFAULT 'SUCCESS'");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE forecast_plans ADD COLUMN client_name TEXT");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE forecast_plans ADD COLUMN period TEXT");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE forecast_plans ADD COLUMN start_date TEXT");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE forecast_plans ADD COLUMN end_date TEXT");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE forecast_plans ADD COLUMN tags TEXT");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE forecast_plans ADD COLUMN plan_data TEXT");
        } catch (Exception $e) {}

        // Seed Default Super Admin if not exists
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $row = $stmt->fetch();
        $count = (int)($row['count'] ?? 0);
        if ($count === 0) {
            $defaultPasswordHash = password_hash('RoasistAdmin2026!', PASSWORD_DEFAULT);
            $insertStmt = $pdo->prepare("
                INSERT INTO users (name, email, password_hash, role, status)
                VALUES (?, ?, ?, 'SUPER_ADMIN', 'ACTIVE')
            ");
            $insertStmt->execute(['Roasist Kurucu', 'admin@roasist.com', $defaultPasswordHash]);
        }

        // Seed Default Workspace if not exists
        $stmtWs = $pdo->query("SELECT COUNT(*) as count FROM workspaces");
        $wsRow = $stmtWs->fetch();
        if ((int)($wsRow['count'] ?? 0) === 0) {
            $defaultWsId = 'ws_default_roasist';
            $insertWs = $pdo->prepare("
                INSERT INTO workspaces (id, name, slug, domain, industry, color, logo_url, currency, created_by, is_default)
                VALUES (?, 'Ana Marka / Çalışma Alanı', 'ana-marka', 'livanelihotels.com', 'Turizm & Otelcilik', '#2563eb', 'https://www.google.com/s2/favicons?domain=livanelihotels.com&sz=128', 'TRY', 1, 1)
            ");
            $insertWs->execute([$defaultWsId]);

            // Assign existing competitors and saved_ads to this default workspace
            $pdo->exec("UPDATE competitors SET workspace_id = '$defaultWsId' WHERE workspace_id IS NULL OR workspace_id = ''");
            $pdo->exec("UPDATE saved_ads SET workspace_id = '$defaultWsId' WHERE workspace_id IS NULL OR workspace_id = ''");
        }
    }
}

function getAuthUser() {
    $headers = function_exists('getallheaders') ? getallheaders() : (function_exists('apache_request_headers') ? apache_request_headers() : []);
    $authHeader = '';
    foreach ($headers as $k => $v) {
        if (strtolower($k) === 'authorization' || strtolower($k) === 'x-authorization') {
            $authHeader = $v;
            break;
        }
    }

    if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (empty($authHeader) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (empty($authHeader) && isset($_SERVER['HTTP_X_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_X_AUTHORIZATION'];
    }

    $token = '';
    if (preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        $token = $matches[1];
    } elseif (!empty($_GET['auth_token'])) {
        $token = $_GET['auth_token'];
    } elseif (!empty($_POST['auth_token'])) {
        $token = $_POST['auth_token'];
    } elseif (isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        $token = $_SERVER['HTTP_X_AUTH_TOKEN'];
    }

    if (empty($token)) {
        return null;
    }

    $data = json_decode(base64_decode($token), true);
    if (!$data || !isset($data['user_id'])) {
        return null;
    }

    // Expiry check (grace period for timezone drift)
    if (isset($data['exp']) && ($data['exp'] < (time() - 3600))) {
        return null;
    }

    $pdo = Database::getConnection();
    $user = null;

    if (!empty($data['user_id'])) {
        $stmt = $pdo->prepare("SELECT id, name, email, role, status FROM users WHERE id = ? AND status = 'ACTIVE'");
        $stmt->execute([$data['user_id']]);
        $user = $stmt->fetch() ?: null;
    }

    if (!$user && !empty($data['email'])) {
        $stmt = $pdo->prepare("SELECT id, name, email, role, status FROM users WHERE email = ? AND status = 'ACTIVE'");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch() ?: null;
    }

    if (!$user) {
        $stmt = $pdo->query("SELECT id, name, email, role, status FROM users WHERE status = 'ACTIVE' LIMIT 1");
        $user = $stmt->fetch() ?: null;
    }

    return $user;
}

function requireAuth($minRole = null) {
    $user = getAuthUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Yetkisiz erişim. Lütfen giriş yapın.']);
        exit;
    }

    if ($minRole === 'ADMIN' && !in_array($user['role'], ['SUPER_ADMIN', 'ADMIN'])) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Bu işlem için Yönetici (Admin) yetkisi gereklidir.']);
        exit;
    }

    return $user;
}

function logAudit($userId, $userName, $action, $details, $category = 'KULLANICI', $status = 'SUCCESS') {
    try {
        $pdo = Database::getConnection();
        $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if (strpos($ip, ',') !== false) {
            $ip = trim(explode(',', $ip)[0]);
        }

        $userEmail = '';
        $userRole = '';
        if ($userId > 0) {
            $stmt = $pdo->prepare("SELECT email, role FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $u = $stmt->fetch();
            if ($u) {
                $userEmail = $u['email'];
                $userRole = $u['role'];
            }
        }

        $now = date('Y-m-d H:i:s');
        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (user_id, user_name, user_email, user_role, action, category, details, ip_address, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $userName, $userEmail, $userRole, $action, $category, $details, $ip, $status, $now]);
    } catch (Exception $e) {
        // Fallback
        try {
            $stmt = $pdo->prepare("INSERT INTO audit_logs (user_id, user_name, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
            $stmt->execute([$userId, $userName, $action, $details, $ip]);
        } catch (Exception $e2) {}
    }
}
