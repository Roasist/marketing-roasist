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

// Helper to scrape Landing Page Content (title, meta description, headings, text)
function fetchLandingPageDetails($url) {
    if (!preg_match('/^https?:\/\//i', $url)) {
        $url = 'https://' . $url;
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if (!$html || $httpCode >= 400) {
        return null;
    }

    // Extract title
    $title = '';
    if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $m)) {
        $title = trim(html_entity_decode(strip_tags($m[1])));
    }

    // Extract meta description
    $description = '';
    if (preg_match('/<meta[^>]+name=[\'"]description[\'"][^>]+content=[\'"](.*?)[\'"]/is', $html, $m)) {
        $description = trim(html_entity_decode($m[1]));
    } elseif (preg_match('/<meta[^>]+content=[\'"](.*?)[\'"][^>]+name=[\'"]description[\'"]/is', $html, $m)) {
        $description = trim(html_entity_decode($m[1]));
    }

    // Extract H1 & H2 tags
    $headings = [];
    if (preg_match_all('/<h[12][^>]*>(.*?)<\/h[12]>/is', $html, $m)) {
        foreach ($m[1] as $h) {
            $hClean = trim(html_entity_decode(strip_tags($h)));
            if (!empty($hClean) && strlen($hClean) < 150) {
                $headings[] = $hClean;
            }
        }
    }

    // Clean body text (strip styles, scripts, SVGs)
    $cleanHtml = preg_replace('/<(style|script|svg|noscript|header|footer|nav)\b[^>]*>.*?<\/\1>/is', ' ', $html);
    $cleanHtml = preg_replace('/<style\b[^>]*>.*?<\/style>/is', ' ', $cleanHtml);
    $cleanHtml = preg_replace('/<script\b[^>]*>.*?<\/script>/is', ' ', $cleanHtml);
    $plainText = trim(preg_replace('/\s+/', ' ', strip_tags($cleanHtml)));
    $textSnippet = mb_substr($plainText, 0, 2500, 'UTF-8');

    return [
        'title' => $title,
        'description' => $description,
        'headings' => array_slice(array_unique($headings), 0, 8),
        'textSnippet' => $textSnippet
    ];
}

// -------------------------------------------------------------
// ACTION: DISCOVER & ANALYZE KEYWORDS (WITH AUTO-LANGUAGE & SCRAPER)
// -------------------------------------------------------------
if ($action === 'discover' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $query = trim($input['query'] ?? '');
    $mode = trim($input['mode'] ?? 'URL');

    if (empty($query)) {
        echo json_encode(['status' => 'error', 'message' => 'Lütfen analiz edilecek bir web sitesi veya anahtar kelime girin.']);
        exit;
    }

    $cacheKey = md5("forecast_v2_{$mode}_{$query}");

    // 1. Check Server-Side Cache
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

    if (empty($geminiKey)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Tahminleme ve anahtar kelime motorunu çalıştırmak için lütfen Yönetim Paneli > API Bağlantıları sekmesinden Google / Gemini API Anahtarınızı kaydedin.'
        ]);
        exit;
    }

    // 2. Scrape Landing Page if URL mode or query looks like a domain
    $pageDetails = null;
    $isUrl = ($mode === 'URL') || preg_match('/^https?:\/\//i', $query) || (strpos($query, '.') !== false && strpos($query, ' ') === false);
    if ($isUrl) {
        $pageDetails = fetchLandingPageDetails($query);
    }

    // 3. Construct AI Prompt with live scraped page content
    $prompt = "Sen Google Ads, SEM ve Çok Dilli Uluslararası Performans Pazarlaması konusunda kıdemli bir stratejistsin.\n\n";

    if ($pageDetails && (!empty($pageDetails['title']) || !empty($pageDetails['textSnippet']))) {
        $prompt .= "İNCELENEN LANDING PAGE URL: '{$query}'\n"
            . "Sayfa Başlığı (Title): {$pageDetails['title']}\n"
            . "Sayfa Açıklaması (Meta Description): {$pageDetails['description']}\n"
            . "Sayfa Başlıkları (H1/H2): " . implode(' | ', $pageDetails['headings']) . "\n"
            . "Sayfa Metin İçeriği: {$pageDetails['textSnippet']}\n\n";
    } else {
        $prompt .= "İNCELENEN TOHUM KELİME / MARKA: '{$query}'\n\n";
    }

    $prompt .= "GÖREVLER:\n"
        . "1. Sayfanın/içeriğin GERÇEK DİLİNİ otomatik tespit et (Örn: Rusça ise 'ru' / 'Rusça', İngilizce ise 'en' / 'İngilizce', Türkçe ise 'tr' / 'Türkçe', Arapça ise 'ar' / 'Arapça', Almanca ise 'de' / 'Almanca', Farsça ise 'fa' / 'Farsça').\n"
        . "2. Sayfanın sektörünü ve ana değer önerisini belirle.\n"
        . "3. Bu sayfaya/ürüne müşteri çekmek için Google Arama'da kullanıcının arayacağı en az 30 adet yüksek dönüşüm potansiyeline sahip Google Ads anahtar kelimesini KESİNLİKLE SAYFANIN KENDİ DİLİNDE üret.\n"
        . "4. Bu dil ve sektör için Google Ads kampanyasında hedeflenmesi en mantıklı 4-6 hedef ülkeyi (Örn: Rusça için RU, KZ, UZ, AE, TR; Arapça için SA, AE, KW, QA, TR; Almanca için DE, AT, CH; İngilizce için US, GB, AE, CA vb.) belirle.\n\n"
        . "Yanıtını SADECE geçerli JSON formatında şu şemayla ver (başka metin ekleme):\n"
        . "{\n"
        . "  \"detectedLanguage\": \"ru\",\n"
        . "  \"detectedLanguageName\": \"Rusça\",\n"
        . "  \"sector\": \"Yatırımla Türk Vatandaşlığı & Gayrimenkul\",\n"
        . "  \"pageTitle\": \"Sayfa Başlığı\",\n"
        . "  \"pageSummary\": \"Kısa sayfa özeti\",\n"
        . "  \"suggestedCountries\": [\n"
        . "    {\"code\": \"RU\", \"name\": \"Rusya\", \"flag\": \"🇷🇺\", \"region\": \"BDT\", \"cpcMultiplier\": 1.0, \"volumeMultiplier\": 1.0, \"currency\": \"RUB\"},\n"
        . "    {\"code\": \"KZ\", \"name\": \"Kazakistan\", \"flag\": \"🇰🇿\", \"region\": \"BDT\", \"cpcMultiplier\": 0.75, \"volumeMultiplier\": 0.45, \"currency\": \"KZT\"},\n"
        . "    {\"code\": \"UZ\", \"name\": \"Özbekistan\", \"flag\": \"🇺🇿\", \"region\": \"BDT\", \"cpcMultiplier\": 0.65, \"volumeMultiplier\": 0.35, \"currency\": \"UZS\"},\n"
        . "    {\"code\": \"AE\", \"name\": \"BAE / Dubai\", \"flag\": \"🇦🇪\", \"region\": \"Körfez\", \"cpcMultiplier\": 2.2, \"volumeMultiplier\": 0.25, \"currency\": \"AED\"},\n"
        . "    {\"code\": \"TR\", \"name\": \"Türkiye (Yerleşik Topluluk)\", \"flag\": \"🇹🇷\", \"region\": \"Yerel\", \"cpcMultiplier\": 0.9, \"volumeMultiplier\": 0.35, \"currency\": \"TRY\"}\n"
        . "  ],\n"
        . "  \"keywords\": [\n"
        . "    {\n"
        . "      \"keyword\": \"гражданство Турции за инвестиции\",\n"
        . "      \"monthlyVolume\": 14500,\n"
        . "      \"lowCpc\": 8.50,\n"
        . "      \"highCpc\": 32.00,\n"
        . "      \"competition\": \"HIGH\",\n"
        . "      \"competitionIndex\": 85,\n"
        . "      \"intent\": \"TRANSACTIONAL\",\n"
        . "      \"trendChangePercent\": 25,\n"
        . "      \"opportunityScore\": 92\n"
        . "    }\n"
        . "  ]\n"
        . "}";

    $endpointsToTry = [
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
        'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent'
    ];

    $keywordsResult = [];
    $detectedLang = 'tr';
    $detectedLangName = 'Türkçe';
    $sectorSummary = 'Dijital Pazarlama & E-Ticaret';
    $pageTitle = $pageDetails['title'] ?? '';
    $pageSummary = '';
    $suggestedCountries = [];
    $lastErrorMsg = '';

    foreach ($endpointsToTry as $endpointUrl) {
        $geminiUrl = $endpointUrl . "?key=" . urlencode($geminiKey);
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
        curl_setopt($chGemini, CURLOPT_TIMEOUT, 25);
        $resGemini = curl_exec($chGemini);
        curl_close($chGemini);

        $gJson = json_decode($resGemini, true);

        if (isset($gJson['candidates'][0]['content']['parts'][0]['text'])) {
            $rawAiText = $gJson['candidates'][0]['content']['parts'][0]['text'];
            $parsedAi = json_decode($rawAiText, true);
            if (isset($parsedAi['keywords']) && is_array($parsedAi['keywords'])) {
                $keywordsResult = $parsedAi['keywords'];
                $detectedLang = $parsedAi['detectedLanguage'] ?? $detectedLang;
                $detectedLangName = $parsedAi['detectedLanguageName'] ?? $detectedLangName;
                $sectorSummary = $parsedAi['sector'] ?? $sectorSummary;
                $pageTitle = $parsedAi['pageTitle'] ?? $pageTitle;
                $pageSummary = $parsedAi['pageSummary'] ?? '';
                $suggestedCountries = $parsedAi['suggestedCountries'] ?? [];
                break; // Successfully got keywords!
            }
        } elseif (isset($gJson['error']['message'])) {
            $lastErrorMsg = $gJson['error']['message'];
        }
    }

    if (empty($keywordsResult)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Analiz Hatası: ' . ($lastErrorMsg ?: 'Google Gemini API bağlantısı kurulamadı. Lütfen Yönetim Paneli > API Bağlantıları sekmesinden geçerli Gemini API anahtarınızı (AIzaSy...) kontrol edin.')
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
        'detectedLanguage' => $detectedLang,
        'detectedLanguageName' => $detectedLangName,
        'pageTitle' => $pageTitle,
        'pageSummary' => $pageSummary,
        'totalCount' => count($keywordsResult),
        'keywords' => $keywordsResult,
        'suggestedCountries' => $suggestedCountries,
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
// ACTION: GENERATE AI NEGATIVE KEYWORDS (LANGUAGE AWARE)
// -------------------------------------------------------------
if ($action === 'negative_keywords' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $sector = trim($input['sector'] ?? 'Genel');
    $keywords = $input['keywords'] ?? [];
    $language = trim($input['language'] ?? 'tr');

    $apiKeys = getApiKeys($pdo);
    $geminiKey = $apiKeys['geminiApiKey'] ?: $apiKeys['googleApiKey'];

    $negativeCategories = [];

    if (!empty($geminiKey) && !empty($keywords)) {
        try {
            $kwSample = array_slice($keywords, 0, 15);
            $prompt = "Sen Google Ads negatif anahtar kelime uzmanısın.\n"
                . "Sektör: '{$sector}', Dil: '{$language}', Anahtar Kelime Örnekleri: " . implode(', ', $kwSample) . ".\n"
                . "Bu dil ve sektördeki Google Arama kampanyasında bütçe israfını önleyecek, dönüşüm getirmeyen 25-35 adet negatif anahtar kelimeyi KESİNLİKLE BU DİLDE ({$language}) 4 mantıksal kategoride gruplayarak JSON formatında listele.\n"
                . "Format:\n"
                . "[\n"
                . "  {\n"
                . "    \"category\": \"Kategori Başlığı (Örn: İsraf & Ücretsiz Aramalar)\",\n"
                . "    \"words\": [\"kelime1\", \"kelime2\", \"kelime3\"]\n"
                . "  }\n"
                . "]";

            $modelsToTry = [
                'gemini-1.5-flash-latest',
                'gemini-2.0-flash',
                'gemini-1.5-flash',
                'gemini-1.5-pro',
                'gemini-pro'
            ];

            foreach ($modelsToTry as $modelName) {
                $geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key=" . urlencode($geminiKey);
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
                        break;
                    }
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
