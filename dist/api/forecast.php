<?php
/**
 * Roasist Marketing Suite - Google Ads Forecast & Keyword Budget Planner API
 * Secure Server-to-Server Proxy with Zero-Exposure Architecture
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

// Strict Authentication Protection - Prevents public quota drainage
$currentUser = requireAuth();
$pdo = Database::getConnection();

$action = $_GET['action'] ?? 'discover';
$method = $_SERVER['REQUEST_METHOD'];

// Helper to retrieve encrypted/stored API keys from server database
function getApiKeys($pdo) {
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM app_settings WHERE setting_key IN ('geminiApiKey', 'googleApiKey', 'googleAdsCustomerId', 'googleAdsDevToken')");
    $rows = $stmt->fetchAll();
    $keys = [
        'geminiApiKey' => '',
        'googleApiKey' => '',
        'googleAdsCustomerId' => '',
        'googleAdsDevToken' => '',
    ];
    foreach ($rows as $r) {
        $keys[$r['setting_key']] = trim($r['setting_value'] ?? '');
    }
    return $keys;
}

// -------------------------------------------------------------
// ACTION: DISCOVER & ANALYZE KEYWORDS
// -------------------------------------------------------------
if ($action === 'discover' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $query = trim($input['query'] ?? '');
    $mode = trim($input['mode'] ?? 'KEYWORDS'); // 'URL' or 'KEYWORDS'
    $country = trim($input['country'] ?? 'TR');
    $language = trim($input['language'] ?? 'tr');

    if (empty($query)) {
        echo json_encode(['status' => 'error', 'message' => 'Lütfen analiz edilecek bir web sitesi veya anahtar kelime girin.']);
        exit;
    }

    $cacheKey = md5("forecast_disc_{$mode}_{$query}_{$country}_{$language}");

    // 1. Check Server-Side Cache (Save API quota & Instant Response)
    $stmtCache = $pdo->prepare("SELECT data, created_at FROM keyword_cache WHERE cache_key = ?");
    $stmtCache->execute([$cacheKey]);
    $cached = $stmtCache->fetch();

    if ($cached && (time() - strtotime($cached['created_at']) < 86400)) { // 24-hour cache
        $cachedData = json_decode($cached['data'], true);
        echo json_encode([
            'status' => 'success',
            'source' => 'cache',
            'data' => $cachedData
        ]);
        exit;
    }

    $apiKeys = getApiKeys($pdo);
    $geminiKey = $apiKeys['geminiApiKey'] ?: $apiKeys['googleApiKey'];

    // 2. Fetch Google Suggestions / Autocomplete
    $googleSuggestions = [];
    try {
        $cleanQuery = urlencode(str_replace(['https://', 'http://', 'www.'], '', $query));
        $autoUrl = "https://suggestqueries.google.com/complete/search?client=chrome&hl={$language}&gl={$country}&q={$cleanQuery}";
        
        $ch = curl_init($autoUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $res = curl_exec($ch);
        curl_close($ch);

        $parsed = json_decode($res, true);
        if (isset($parsed[1]) && is_array($parsed[1])) {
            $googleSuggestions = array_slice($parsed[1], 0, 15);
        }
    } catch (Exception $e) {}

    // 3. AI Semantic Keyword Expansion & Search Intent Classification via Gemini
    $keywordsResult = [];
    $sectorSummary = "Dijital Pazarlama & E-Ticaret";

    if (!empty($geminiKey)) {
        try {
            $prompt = "Sen Google Ads ve Performans Pazarlaması konusunda uzman bir SEO & SEM analistisin.\n"
                . "Hedef: '{$query}' (Mod: {$mode}, Ülke: {$country}, Dil: {$language}).\n"
                . "Google arama önerileri: " . json_encode($googleSuggestions, JSON_UNESCAPED_UNICODE) . ".\n\n"
                . "Görev: Bu marka/sektör için yüksek dönüşüm potansiyeline sahip en az 25 adet gerçekçi Google Ads anahtar kelimesi üret ve her biri için Türkiye / hedef pazar Google Ads ortalamalarına uygun tahminler yap.\n"
                . "Yanıtını SADECE geçerli JSON formatında şu şemayla ver (başka hiçbir metin yazma):\n"
                . "{\n"
                . "  \"sector\": \"Sektör Adı\",\n"
                . "  \"keywords\": [\n"
                . "    {\n"
                . "      \"keyword\": \"anahtar kelime\",\n"
                . "      \"monthlyVolume\": 12500,\n"
                . "      \"lowCpc\": 4.50,\n"
                . "      \"highCpc\": 18.20,\n"
                . "      \"competition\": \"HIGH\", // LOW, MEDIUM, HIGH\n"
                . "      \"competitionIndex\": 78, // 0-100\n"
                . "      \"intent\": \"TRANSACTIONAL\", // TRANSACTIONAL (Satın Alma), COMMERCIAL (Araştırma), INFORMATIONAL (Bilgi)\n"
                . "      \"trendChangePercent\": 15, // Son 3 aylık trend % değişimi (-50 ile +150 arası)\n"
                . "      \"opportunityScore\": 85 // 1-100 fırsat puanı\n"
                . "    }\n"
                . "  ]\n"
                . "}";

            $geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . urlencode($geminiKey);
            $payload = [
                "contents" => [
                    ["parts" => [["text" => $prompt]]]
                ],
                "generationConfig" => [
                    "temperature" => 0.2,
                    "responseMimeType" => "application/json"
                ]
            ];

            $chGemini = curl_init($geminiUrl);
            curl_setopt($chGemini, CURLOPT_POST, true);
            curl_setopt($chGemini, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($chGemini, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($chGemini, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($chGemini, CURLOPT_TIMEOUT, 20);
            $resGemini = curl_exec($chGemini);
            curl_close($chGemini);

            $gJson = json_decode($resGemini, true);
            if (isset($gJson['candidates'][0]['content']['parts'][0]['text'])) {
                $rawAiText = $gJson['candidates'][0]['content']['parts'][0]['text'];
                $parsedAi = json_decode($rawAiText, true);
                if (isset($parsedAi['keywords']) && is_array($parsedAi['keywords'])) {
                    $keywordsResult = $parsedAi['keywords'];
                    $sectorSummary = $parsedAi['sector'] ?? $sectorSummary;
                }
            }
        } catch (Exception $e) {}
    }

    if (empty($geminiKey)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Tahminleme ve anahtar kelime motorunu çalıştırmak için lütfen Yönetim Paneli > API Bağlantıları sekmesinden Google / Gemini API Anahtarınızı kaydedin.'
        ]);
        exit;
    }

    if (empty($keywordsResult)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Bu arama terimi için anahtar kelime verisi alınamadı. Lütfen API anahtarınızı doğrulayın veya farklı bir web sitesi / terim deneyin.'
        ]);
        exit;
    }

    // Add unique IDs
    foreach ($keywordsResult as $idx => &$item) {
        if (!isset($item['id'])) {
            $item['id'] = 'kw_' . ($idx + 1) . '_' . substr(md5($item['keyword']), 0, 6);
        }
    }

    $finalPayload = [
        'query' => $query,
        'mode' => $mode,
        'sector' => $sectorSummary,
        'country' => $country,
        'language' => $language,
        'totalCount' => count($keywordsResult),
        'keywords' => $keywordsResult,
        'timestamp' => date('Y-m-d H:i:s')
    ];

    // Save to server-side cache
    try {
        $stmtSave = $pdo->prepare("INSERT OR REPLACE INTO keyword_cache (cache_key, data, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)");
        $stmtSave->execute([$cacheKey, json_encode($finalPayload, JSON_UNESCAPED_UNICODE)]);
    } catch (Exception $e) {}

    echo json_encode([
        'status' => 'success',
        'source' => 'live',
        'data' => $finalPayload
    ]);
    exit;
}

// -------------------------------------------------------------
// ACTION: GENERATE AI NEGATIVE KEYWORDS
// -------------------------------------------------------------
if ($action === 'negative_keywords' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $sector = trim($input['sector'] ?? 'Genel');
    $keywords = $input['keywords'] ?? [];

    $apiKeys = getApiKeys($pdo);
    $geminiKey = $apiKeys['geminiApiKey'] ?: $apiKeys['googleApiKey'];

    $negativeCategories = [
        [
            'category' => 'İsraf & Alakasız Aramalar',
            'words' => ['ücretsiz', 'bedava', 'crack', 'full indir', 'torrent', 'apk', 'hile', 'pdf']
        ],
        [
            'category' => 'Kariyer & Eğitim Odaklı',
            'words' => ['staj', 'iş ilanları', 'maaşları', 'eleman arayanlar', 'kursu', 'nedir', 'nasıl olunur']
        ],
        [
            'category' => 'Şikayet & Destek',
            'words' => ['şikayet', 'yorumlar', 'dolandırıcılığı', 'müşteri hizmetleri numarası', 'iletişim']
        ],
        [
            'category' => 'İkinci El & Karşılaştırma',
            'words' => ['sahibinden', 'ikinci el', '2 el', 'letgo', 'dolap', 'gardrops']
        ]
    ];

    if (!empty($geminiKey) && !empty($keywords)) {
        try {
            $kwSample = array_slice($keywords, 0, 15);
            $prompt = "Sen Google Ads negatif anahtar kelime uzmanısın. Sektör: '{$sector}', Anahtar kelimeler: " . implode(', ', $kwSample) . ".\n"
                . "Bu sektördeki Google Arama kampanyasında bütçe israfını önleyecek, dönüşüm getirmeyen 20-30 adet negatif anahtar kelimeyi 4 mantıksal kategoride gruplayarak JSON formatında listele.\n"
                . "Format:\n"
                . "[\n"
                . "  {\n"
                . "    \"category\": \"Kategori Başlığı\",\n"
                . "    \"words\": [\"kelime1\", \"kelime2\", \"kelime3\"]\n"
                . "  }\n"
                . "]";

            $geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . urlencode($geminiKey);
            $payload = [
                "contents" => [["parts" => [["text" => $prompt]]]],
                "generationConfig" => ["temperature" => 0.2, "responseMimeType" => "application/json"]
            ];

            $ch = curl_init($geminiUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            $res = curl_exec($ch);
            curl_close($ch);

            $gJson = json_decode($res, true);
            if (isset($gJson['candidates'][0]['content']['parts'][0]['text'])) {
                $parsedNeg = json_decode($gJson['candidates'][0]['content']['parts'][0]['text'], true);
                if (is_array($parsedNeg) && count($parsedNeg) > 0) {
                    $negativeCategories = $parsedNeg;
                }
            }
        } catch (Exception $e) {}
    }

    echo json_encode([
        'status' => 'success',
        'categories' => $negativeCategories
    ]);
    exit;
}

// -------------------------------------------------------------
// ACTION: SAVE / LIST / DELETE FORECAST PLANS
// -------------------------------------------------------------
if ($action === 'plans') {
    $workspaceId = $_GET['workspace_id'] ?? '';

    if ($method === 'GET') {
        $stmt = $pdo->prepare("
            SELECT * FROM forecast_plans 
            WHERE workspace_id = ? OR workspace_id IS NULL 
            ORDER BY id DESC
        ");
        $stmt->execute([$workspaceId]);
        $rows = $stmt->fetchAll();

        $plans = [];
        foreach ($rows as $r) {
            $plans[] = [
                'id' => $r['id'],
                'workspaceId' => $r['workspace_id'],
                'name' => $r['name'],
                'targetUrl' => $r['target_url'],
                'seedKeywords' => $r['seed_keywords'],
                'monthlyBudget' => (float)$r['monthly_budget'],
                'selectedKeywords' => json_decode($r['selected_keywords'] ?? '[]', true),
                'simulationResult' => json_decode($r['simulation_result'] ?? '{}', true),
                'negativeKeywords' => json_decode($r['negative_keywords'] ?? '[]', true),
                'createdAt' => $r['created_at'],
            ];
        }

        echo json_encode(['status' => 'success', 'plans' => $plans]);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $planId = $input['id'] ?? ('plan_' . time() . '_' . rand(100, 999));
        $name = trim($input['name'] ?? ('Forecast Planı ' . date('d.m.Y H:i')));
        $targetUrl = trim($input['targetUrl'] ?? '');
        $seedKeywords = trim($input['seedKeywords'] ?? '');
        $monthlyBudget = (float)($input['monthlyBudget'] ?? 0);
        $selectedKeywords = json_encode($input['selectedKeywords'] ?? [], JSON_UNESCAPED_UNICODE);
        $simulationResult = json_encode($input['simulationResult'] ?? new stdClass(), JSON_UNESCAPED_UNICODE);
        $negativeKeywords = json_encode($input['negativeKeywords'] ?? [], JSON_UNESCAPED_UNICODE);
        $wsId = $input['workspaceId'] ?? $workspaceId;

        $stmt = $pdo->prepare("
            INSERT OR REPLACE INTO forecast_plans 
            (id, workspace_id, name, target_url, seed_keywords, monthly_budget, selected_keywords, simulation_result, negative_keywords, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $planId,
            $wsId,
            $name,
            $targetUrl,
            $seedKeywords,
            $monthlyBudget,
            $selectedKeywords,
            $simulationResult,
            $negativeKeywords,
            $currentUser['id'] ?? 1
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Forecast planı başarıyla kaydedildi!', 'planId' => $planId]);
        exit;
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        if (!empty($id)) {
            $stmt = $pdo->prepare("DELETE FROM forecast_plans WHERE id = ?");
            $stmt->execute([$id]);
        }
        echo json_encode(['status' => 'success', 'message' => 'Plan silindi.']);
        exit;
    }
}

echo json_encode(['status' => 'error', 'message' => 'Geçersiz işlem.']);
