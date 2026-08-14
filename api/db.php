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

        // Column migration for audit_logs if old table exists
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

            // Seed Initial Competitors
            $initialCompetitors = [
                ['comp_1', '10382959102', 'Trendyol', 'https://www.facebook.com/trendyol', 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150', 'E-Ticaret Pazaryeri', 42],
                ['comp_2', '20491823901', 'Hepsiburada', 'https://www.facebook.com/hepsiburada', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150', 'Pazaryeri & Teknoloji', 28],
                ['comp_3', '39102948192', 'Nike Turkey', 'https://www.facebook.com/nike', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150', 'Spor & Giyim', 19],
                ['comp_4', '49102948195', 'Roasist SaaS', 'https://www.facebook.com/roasist', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150', 'Pazarlama & Yazılım', 12]
            ];

            $compStmt = $pdo->prepare("
                INSERT OR IGNORE INTO competitors (id, page_id, name, facebook_page_url, avatar_url, category, active_ads_count, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            ");
            foreach ($initialCompetitors as $c) {
                $compStmt->execute($c);
            }
        }
    }
}

function getAuthUser() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = '';
    foreach ($headers as $k => $v) {
        if (strtolower($k) === 'authorization') {
            $authHeader = $v;
            break;
        }
    }

    if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return null;
    }

    $token = $matches[1];
    $data = json_decode(base64_decode($token), true);
    if (!$data || !isset($data['user_id']) || !isset($data['exp'])) {
        return null;
    }

    if ($data['exp'] < time()) {
        return null;
    }

    $pdo = Database::getConnection();
    $stmt = $pdo->prepare("SELECT id, name, email, role, status FROM users WHERE id = ? AND status = 'ACTIVE'");
    $stmt->execute([$data['user_id']]);
    return $stmt->fetch() ?: null;
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
