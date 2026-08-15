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

// Detect language from text and title
function detectPageLanguage($title, $text) {
    $full = $title . ' ' . $text;
    preg_match_all('/[\p{Cyrillic}]/u', $full, $cyr);
    preg_match_all('/[\p{Arabic}]/u', $full, $ara);
    preg_match_all('/[ğşIıİöüçĞŞÖÜÇ]/u', $full, $tur);

    $cCount = count($cyr[0] ?? []);
    $aCount = count($ara[0] ?? []);
    $tCount = count($tur[0] ?? []);

    if ($cCount > 10) return ['code' => 'ru', 'name' => 'Rusça'];
    if ($aCount > 10) return ['code' => 'ar', 'name' => 'Arapça'];
    if ($tCount > 3 || preg_match('/\b(ve|ile|için|satılık|kiralık|fiyatları|konut|daire|otel|villa|emlak)\b/ui', $full)) return ['code' => 'tr', 'name' => 'Türkçe'];
    if (preg_match('/\b(und|für|mit|kaufen|wohnung|türkei|immobilien|haus)\b/ui', $full)) return ['code' => 'de', 'name' => 'Almanca'];
    return ['code' => 'en', 'name' => 'İngilizce'];
}

function getSuggestedCountriesByLang($langCode) {
    switch ($langCode) {
        case 'ru':
            return [
                ['code' => 'RU', 'name' => 'Rusya', 'flag' => '🇷🇺', 'region' => 'BDT', 'cpcMultiplier' => 1.0, 'volumeMultiplier' => 1.0, 'currency' => 'RUB'],
                ['code' => 'KZ', 'name' => 'Kazakistan', 'flag' => '🇰🇿', 'region' => 'BDT', 'cpcMultiplier' => 0.75, 'volumeMultiplier' => 0.45, 'currency' => 'KZT'],
                ['code' => 'UZ', 'name' => 'Özbekistan', 'flag' => '🇺🇿', 'region' => 'BDT', 'cpcMultiplier' => 0.65, 'volumeMultiplier' => 0.35, 'currency' => 'UZS'],
                ['code' => 'AE', 'name' => 'BAE / Dubai', 'flag' => '🇦🇪', 'region' => 'Körfez', 'cpcMultiplier' => 2.2, 'volumeMultiplier' => 0.25, 'currency' => 'AED'],
                ['code' => 'TR', 'name' => 'Türkiye (Yerleşik Topluluk)', 'flag' => '🇹🇷', 'region' => 'Yerel', 'cpcMultiplier' => 0.9, 'volumeMultiplier' => 0.35, 'currency' => 'TRY']
            ];
        case 'ar':
            return [
                ['code' => 'SA', 'name' => 'Suudi Arabistan', 'flag' => '🇸🇦', 'region' => 'Körfez', 'cpcMultiplier' => 1.8, 'volumeMultiplier' => 0.6, 'currency' => 'SAR'],
                ['code' => 'AE', 'name' => 'BAE / Dubai', 'flag' => '🇦🇪', 'region' => 'Körfez', 'cpcMultiplier' => 2.2, 'volumeMultiplier' => 0.4, 'currency' => 'AED'],
                ['code' => 'KW', 'name' => 'Kuveyt', 'flag' => '🇰🇼', 'region' => 'Körfez', 'cpcMultiplier' => 2.0, 'volumeMultiplier' => 0.3, 'currency' => 'KWD'],
                ['code' => 'QA', 'name' => 'Katar', 'flag' => '🇶🇦', 'region' => 'Körfez', 'cpcMultiplier' => 2.1, 'volumeMultiplier' => 0.25, 'currency' => 'QAR'],
                ['code' => 'TR', 'name' => 'Türkiye (Arap Topluluğu)', 'flag' => '🇹🇷', 'region' => 'Yerel', 'cpcMultiplier' => 0.9, 'volumeMultiplier' => 0.35, 'currency' => 'TRY']
            ];
        case 'de':
            return [
                ['code' => 'DE', 'name' => 'Almanya', 'flag' => '🇩🇪', 'region' => 'Avrupa', 'cpcMultiplier' => 1.9, 'volumeMultiplier' => 0.8, 'currency' => 'EUR'],
                ['code' => 'AT', 'name' => 'Avusturya', 'flag' => '🇦🇹', 'region' => 'Avrupa', 'cpcMultiplier' => 1.8, 'volumeMultiplier' => 0.3, 'currency' => 'EUR'],
                ['code' => 'CH', 'name' => 'İsviçre', 'flag' => '🇨🇭', 'region' => 'Avrupa', 'cpcMultiplier' => 2.4, 'volumeMultiplier' => 0.25, 'currency' => 'CHF'],
                ['code' => 'TR', 'name' => 'Türkiye (Gurbetçi & Yerleşik)', 'flag' => '🇹🇷', 'region' => 'Yerel', 'cpcMultiplier' => 0.9, 'volumeMultiplier' => 0.3, 'currency' => 'TRY']
            ];
        case 'en':
            return [
                ['code' => 'US', 'name' => 'Amerika (ABD)', 'flag' => '🇺🇸', 'region' => 'Amerika', 'cpcMultiplier' => 2.5, 'volumeMultiplier' => 1.2, 'currency' => 'USD'],
                ['code' => 'GB', 'name' => 'İngiltere', 'flag' => '🇬🇧', 'region' => 'Avrupa', 'cpcMultiplier' => 2.1, 'volumeMultiplier' => 0.6, 'currency' => 'GBP'],
                ['code' => 'AE', 'name' => 'BAE / Dubai', 'flag' => '🇦🇪', 'region' => 'Körfez', 'cpcMultiplier' => 2.2, 'volumeMultiplier' => 0.35, 'currency' => 'AED'],
                ['code' => 'CA', 'name' => 'Kanada', 'flag' => '🇨🇦', 'region' => 'Amerika', 'cpcMultiplier' => 2.0, 'volumeMultiplier' => 0.4, 'currency' => 'CAD'],
                ['code' => 'TR', 'name' => 'Türkiye', 'flag' => '🇹🇷', 'region' => 'Yerel', 'cpcMultiplier' => 0.9, 'volumeMultiplier' => 0.3, 'currency' => 'TRY']
            ];
        default: // 'tr'
            return [
                ['code' => 'TR', 'name' => 'Türkiye', 'flag' => '🇹🇷', 'region' => 'Yerel', 'cpcMultiplier' => 1.0, 'volumeMultiplier' => 1.0, 'currency' => 'TRY'],
                ['code' => 'DE', 'name' => 'Almanya (Türk Topluluğu)', 'flag' => '🇩🇪', 'region' => 'Avrupa', 'cpcMultiplier' => 1.9, 'volumeMultiplier' => 0.3, 'currency' => 'EUR'],
                ['code' => 'NL', 'name' => 'Hollanda (Türk Topluluğu)', 'flag' => '🇳🇱', 'region' => 'Avrupa', 'cpcMultiplier' => 1.85, 'volumeMultiplier' => 0.2, 'currency' => 'EUR'],
                ['code' => 'AZ', 'name' => 'Azerbaycan', 'flag' => '🇦🇿', 'region' => 'Kafkas', 'cpcMultiplier' => 0.7, 'volumeMultiplier' => 0.25, 'currency' => 'AZN']
            ];
    }
}

function generateSemanticKeywordsFallback($query, $pageDetails, $langCode) {
    $title = $pageDetails['title'] ?? $query;
    $desc = $pageDetails['description'] ?? '';
    $text = $pageDetails['textSnippet'] ?? '';
    $full = mb_strtolower($title . ' ' . $desc . ' ' . $text, 'UTF-8');

    if ($langCode === 'ru') {
        $isCitizenship = (mb_strpos($full, 'гражданств') !== false) || (mb_strpos($full, 'паспорт') !== false);
        $isRealEstate = (mb_strpos($full, 'квартир') !== false) || (mb_strpos($full, 'недвижим') !== false) || (mb_strpos($full, 'алань') !== false);

        if ($isCitizenship || $isRealEstate) {
            return [
                'sector' => 'Yatırımla Türk Vatandaşlığı & Gayrimenkul',
                'pageSummary' => 'Türkiye/Alanya’da gayrimenkul yatırımı ile Türk vatandaşlığı edinme ve yüksek getirili mülk edindirme paketi.',
                'keywords' => [
                    ['keyword' => 'гражданство Турции за инвестиции', 'monthlyVolume' => 14800, 'lowCpc' => 8.50, 'highCpc' => 32.00, 'competition' => 'HIGH', 'competitionIndex' => 85, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 25, 'opportunityScore' => 92],
                    ['keyword' => 'турецкое гражданство при покупке недвижимости', 'monthlyVolume' => 12400, 'lowCpc' => 7.80, 'highCpc' => 29.50, 'competition' => 'HIGH', 'competitionIndex' => 82, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 20, 'opportunityScore' => 89],
                    ['keyword' => 'купить квартиру в Аланье для гражданства', 'monthlyVolume' => 9600, 'lowCpc' => 6.50, 'highCpc' => 24.00, 'competition' => 'HIGH', 'competitionIndex' => 78, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 15, 'opportunityScore' => 88],
                    ['keyword' => 'недвижимость в Турции паспорт', 'monthlyVolume' => 8200, 'lowCpc' => 5.90, 'highCpc' => 22.00, 'competition' => 'MEDIUM', 'competitionIndex' => 70, 'intent' => 'COMMERCIAL', 'trendChangePercent' => 18, 'opportunityScore' => 85],
                    ['keyword' => 'получить паспорт Турции гражданину РФ', 'monthlyVolume' => 7500, 'lowCpc' => 6.20, 'highCpc' => 26.00, 'competition' => 'HIGH', 'competitionIndex' => 80, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 30, 'opportunityScore' => 91],
                    ['keyword' => 'пакет для гражданства 23 square', 'monthlyVolume' => 3400, 'lowCpc' => 4.50, 'highCpc' => 18.00, 'competition' => 'LOW', 'competitionIndex' => 45, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 40, 'opportunityScore' => 95],
                    ['keyword' => 'инвестиции в недвижимость Турции 2026', 'monthlyVolume' => 6800, 'lowCpc' => 5.40, 'highCpc' => 21.00, 'competition' => 'MEDIUM', 'competitionIndex' => 65, 'intent' => 'COMMERCIAL', 'trendChangePercent' => 12, 'opportunityScore' => 82],
                    ['keyword' => 'квартиры от застройщика Аланья гражданство', 'monthlyVolume' => 5900, 'lowCpc' => 6.80, 'highCpc' => 25.50, 'competition' => 'HIGH', 'competitionIndex' => 76, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 22, 'opportunityScore' => 87],
                    ['keyword' => 'минимальная сумма для гражданства Турции', 'monthlyVolume' => 11200, 'lowCpc' => 4.20, 'highCpc' => 16.50, 'competition' => 'MEDIUM', 'competitionIndex' => 60, 'intent' => 'INFORMATIONAL', 'trendChangePercent' => 10, 'opportunityScore' => 80],
                    ['keyword' => 'второе гражданство Турция недвижимость', 'monthlyVolume' => 5100, 'lowCpc' => 5.80, 'highCpc' => 23.00, 'competition' => 'HIGH', 'competitionIndex' => 74, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 16, 'opportunityScore' => 84],
                    ['keyword' => 'элитное жилье в Турции под паспорт', 'monthlyVolume' => 4200, 'lowCpc' => 7.20, 'highCpc' => 28.00, 'competition' => 'HIGH', 'competitionIndex' => 79, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 19, 'opportunityScore' => 86],
                    ['keyword' => 'оформление турецкого гражданства под ключ', 'monthlyVolume' => 3800, 'lowCpc' => 8.00, 'highCpc' => 31.00, 'competition' => 'HIGH', 'competitionIndex' => 83, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 28, 'opportunityScore' => 90],
                    ['keyword' => 'апартаменты в Аланье у моря', 'monthlyVolume' => 8900, 'lowCpc' => 5.10, 'highCpc' => 19.50, 'competition' => 'MEDIUM', 'competitionIndex' => 68, 'intent' => 'COMMERCIAL', 'trendChangePercent' => 14, 'opportunityScore' => 81],
                    ['keyword' => 'доходная недвижимость в Турции', 'monthlyVolume' => 6400, 'lowCpc' => 5.60, 'highCpc' => 21.50, 'competition' => 'MEDIUM', 'competitionIndex' => 66, 'intent' => 'COMMERCIAL', 'trendChangePercent' => 15, 'opportunityScore' => 83],
                    ['keyword' => 'купить виллу в Аланье гражданство', 'monthlyVolume' => 3200, 'lowCpc' => 7.90, 'highCpc' => 30.00, 'competition' => 'HIGH', 'competitionIndex' => 81, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 21, 'opportunityScore' => 88],
                    ['keyword' => 'программа гражданства Турции через недвижимость', 'monthlyVolume' => 7100, 'lowCpc' => 6.00, 'highCpc' => 24.50, 'competition' => 'HIGH', 'competitionIndex' => 77, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 17, 'opportunityScore' => 86],
                    ['keyword' => 'сроки получения турецкого паспорта при покупке жилья', 'monthlyVolume' => 4600, 'lowCpc' => 4.80, 'highCpc' => 17.50, 'competition' => 'MEDIUM', 'competitionIndex' => 58, 'intent' => 'INFORMATIONAL', 'trendChangePercent' => 11, 'opportunityScore' => 79],
                    ['keyword' => 'надежный застройщик в Аланье Турция', 'monthlyVolume' => 3900, 'lowCpc' => 5.20, 'highCpc' => 20.00, 'competition' => 'MEDIUM', 'competitionIndex' => 62, 'intent' => 'COMMERCIAL', 'trendChangePercent' => 13, 'opportunityScore' => 82]
                ]
            ];
        }
    }

    // Check Turkish Sectors
    $isMarketing = (mb_strpos($full, 'roasist') !== false) || (mb_strpos($full, 'pazarlama') !== false) || (mb_strpos($full, 'reklam') !== false) || (mb_strpos($full, 'ajans') !== false) || (mb_strpos($full, 'roas') !== false);
    if ($isMarketing) {
        return [
            'sector' => 'Performans Pazarlaması & Dijital Reklam Yönetimi',
            'pageSummary' => 'E-ticaret ve markalar için Meta, Google Ads ve TikTok odaklı ROAS artırma ve performans reklam yönetimi.',
            'keywords' => [
                ['keyword' => 'performans pazarlama ajansı', 'monthlyVolume' => 8400, 'lowCpc' => 8.50, 'highCpc' => 35.00, 'competition' => 'HIGH', 'competitionIndex' => 88, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 22, 'opportunityScore' => 93],
                ['keyword' => 'google ads reklam yönetimi ajansı', 'monthlyVolume' => 12500, 'lowCpc' => 12.00, 'highCpc' => 48.00, 'competition' => 'HIGH', 'competitionIndex' => 92, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 18, 'opportunityScore' => 95],
                ['keyword' => 'meta reklam danışmanlığı', 'monthlyVolume' => 9800, 'lowCpc' => 7.80, 'highCpc' => 32.00, 'competition' => 'HIGH', 'competitionIndex' => 85, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 25, 'opportunityScore' => 91],
                ['keyword' => 'e-ticaret roas artırma yöntemleri', 'monthlyVolume' => 6200, 'lowCpc' => 6.50, 'highCpc' => 24.00, 'competition' => 'MEDIUM', 'competitionIndex' => 70, 'intent' => 'COMMERCIAL', 'trendChangePercent' => 30, 'opportunityScore' => 89],
                ['keyword' => 'dijital pazarlama ajansı istanbul', 'monthlyVolume' => 14200, 'lowCpc' => 9.20, 'highCpc' => 38.00, 'competition' => 'HIGH', 'competitionIndex' => 90, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 15, 'opportunityScore' => 92],
                ['keyword' => 'facebook reklam hesabı optimizasyonu', 'monthlyVolume' => 5400, 'lowCpc' => 5.80, 'highCpc' => 22.50, 'competition' => 'MEDIUM', 'competitionIndex' => 68, 'intent' => 'COMMERCIAL', 'trendChangePercent' => 16, 'opportunityScore' => 86],
                ['keyword' => 'tiktok reklam ajansı türkiye', 'monthlyVolume' => 7100, 'lowCpc' => 6.20, 'highCpc' => 26.00, 'competition' => 'HIGH', 'competitionIndex' => 79, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 35, 'opportunityScore' => 94],
                ['keyword' => 'profesyonel google ads danışmanı', 'monthlyVolume' => 4800, 'lowCpc' => 10.50, 'highCpc' => 42.00, 'competition' => 'HIGH', 'competitionIndex' => 84, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 20, 'opportunityScore' => 90],
                ['keyword' => 'reklam bütçesi yönetimi ve optimizasyon', 'monthlyVolume' => 3900, 'lowCpc' => 5.40, 'highCpc' => 21.00, 'competition' => 'MEDIUM', 'competitionIndex' => 62, 'intent' => 'COMMERCIAL', 'trendChangePercent' => 14, 'opportunityScore' => 84],
                ['keyword' => 'e-ticaret büyüme ajansı', 'monthlyVolume' => 4500, 'lowCpc' => 8.00, 'highCpc' => 31.00, 'competition' => 'HIGH', 'competitionIndex' => 81, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 28, 'opportunityScore' => 89],
                ['keyword' => 'reklam kreatif optimizasyonu', 'monthlyVolume' => 3200, 'lowCpc' => 4.80, 'highCpc' => 19.50, 'competition' => 'MEDIUM', 'competitionIndex' => 58, 'intent' => 'COMMERCIAL', 'trendChangePercent' => 24, 'opportunityScore' => 85],
                ['keyword' => 'dijital reklam ajansı fiyatları', 'monthlyVolume' => 8900, 'lowCpc' => 7.00, 'highCpc' => 28.50, 'competition' => 'HIGH', 'competitionIndex' => 83, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 12, 'opportunityScore' => 88]
            ]
        ];
    }

    $isRealEstateTr = (mb_strpos($full, 'emlak') !== false) || (mb_strpos($full, 'satılık') !== false) || (mb_strpos($full, 'villa') !== false) || (mb_strpos($full, 'konut') !== false) || (mb_strpos($full, 'summerhomes') !== false);
    if ($isRealEstateTr) {
        return [
            'sector' => 'Gayrimenkul & Emlak Yatırımı',
            'pageSummary' => 'Türkiye ve Alanya/Antalya bölgesinde satılık daire, lüks villa ve yabancıya mülk edindirme portföyü.',
            'keywords' => [
                ['keyword' => 'alanya satılık daire denize sıfır', 'monthlyVolume' => 16500, 'lowCpc' => 5.20, 'highCpc' => 22.00, 'competition' => 'HIGH', 'competitionIndex' => 86, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 20, 'opportunityScore' => 92],
                ['keyword' => 'antalya satılık lüks villa', 'monthlyVolume' => 14200, 'lowCpc' => 6.80, 'highCpc' => 28.00, 'competition' => 'HIGH', 'competitionIndex' => 88, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 18, 'opportunityScore' => 94],
                ['keyword' => 'alanya emlak projeleri lansman', 'monthlyVolume' => 8900, 'lowCpc' => 4.50, 'highCpc' => 19.00, 'competition' => 'MEDIUM', 'competitionIndex' => 74, 'intent' => 'COMMERCIAL', 'trendChangePercent' => 25, 'opportunityScore' => 89],
                ['keyword' => 'yabancıya konut satışı vatandaşlık', 'monthlyVolume' => 11400, 'lowCpc' => 7.50, 'highCpc' => 31.00, 'competition' => 'HIGH', 'competitionIndex' => 84, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 22, 'opportunityScore' => 91],
                ['keyword' => 'alanya mahmutlar satılık daire', 'monthlyVolume' => 12800, 'lowCpc' => 4.10, 'highCpc' => 17.50, 'competition' => 'HIGH', 'competitionIndex' => 80, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 15, 'opportunityScore' => 88],
                ['keyword' => 'türkiye gayrimenkul yatırım getirisi', 'monthlyVolume' => 6800, 'lowCpc' => 5.60, 'highCpc' => 23.00, 'competition' => 'MEDIUM', 'competitionIndex' => 68, 'intent' => 'COMMERCIAL', 'trendChangePercent' => 14, 'opportunityScore' => 85]
            ]
        ];
    }

    // Default High-Conversion Keywords
    $cleanQ = preg_replace('/^https?:\/\//i', '', $query);
    $cleanQ = preg_replace('/[\/\?].*$/', '', $cleanQ);
    return [
        'sector' => 'Dijital Pazarlama & E-Ticaret',
        'pageSummary' => 'Web sitesi içerik ve anahtar kelime analiz projeksiyonu.',
        'keywords' => [
            ['keyword' => $cleanQ . ' online sipariş', 'monthlyVolume' => 12500, 'lowCpc' => 4.50, 'highCpc' => 18.20, 'competition' => 'HIGH', 'competitionIndex' => 78, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 15, 'opportunityScore' => 88],
            ['keyword' => 'en iyi ' . $cleanQ . ' hizmetleri', 'monthlyVolume' => 9800, 'lowCpc' => 3.80, 'highCpc' => 15.40, 'competition' => 'MEDIUM', 'competitionIndex' => 65, 'intent' => 'COMMERCIAL', 'trendChangePercent' => 20, 'opportunityScore' => 85],
            ['keyword' => $cleanQ . ' fiyatları 2026', 'monthlyVolume' => 8400, 'lowCpc' => 5.20, 'highCpc' => 21.00, 'competition' => 'HIGH', 'competitionIndex' => 82, 'intent' => 'TRANSACTIONAL', 'trendChangePercent' => 25, 'opportunityScore' => 91],
            ['keyword' => 'profesyonel ' . $cleanQ . ' danışmanlığı', 'monthlyVolume' => 6200, 'lowCpc' => 5.10, 'highCpc' => 20.80, 'competition' => 'MEDIUM', 'competitionIndex' => 72, 'intent' => 'COMMERCIAL', 'trendChangePercent' => 18, 'opportunityScore' => 86],
            ['keyword' => $cleanQ . ' müşteri yorumları', 'monthlyVolume' => 7100, 'lowCpc' => 3.50, 'highCpc' => 14.50, 'competition' => 'LOW', 'competitionIndex' => 48, 'intent' => 'INFORMATIONAL', 'trendChangePercent' => 12, 'opportunityScore' => 82]
        ]
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
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
    ];

    $keywordsResult = [];
    $detectedLang = 'tr';
    $detectedLangName = 'Türkçe';
    $sectorSummary = 'Dijital Pazarlama & E-Ticaret';
    $pageTitle = $pageDetails['title'] ?? '';
    $pageSummary = '';
    $suggestedCountries = [];
    $modelAttempts = [];

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
        $curlErr = curl_error($chGemini);
        $httpCode = curl_getinfo($chGemini, CURLINFO_HTTP_CODE);
        curl_close($chGemini);

        $gJson = json_decode($resGemini, true);
        $modelName = basename(parse_url($endpointUrl, PHP_URL_PATH));

        if (isset($gJson['candidates'][0]['content']['parts'][0]['text'])) {
            $rawAiText = $gJson['candidates'][0]['content']['parts'][0]['text'];
            
            // Clean markdown fences if any
            $cleanJson = preg_replace('/^```(?:json)?\s*/i', '', trim($rawAiText));
            $cleanJson = preg_replace('/\s*```$/', '', $cleanJson);
            
            $parsedAi = json_decode($cleanJson, true);
            if (!$parsedAi && preg_match('/\{.*\}/s', $cleanJson, $matches)) {
                $parsedAi = json_decode($matches[0], true);
            }

            if (isset($parsedAi['keywords']) && is_array($parsedAi['keywords']) && count($parsedAi['keywords']) > 0) {
                $keywordsResult = $parsedAi['keywords'];
                $detectedLang = $parsedAi['detectedLanguage'] ?? $detectedLang;
                $detectedLangName = $parsedAi['detectedLanguageName'] ?? $detectedLangName;
                $sectorSummary = $parsedAi['sector'] ?? $sectorSummary;
                $pageTitle = $parsedAi['pageTitle'] ?? $pageTitle;
                $pageSummary = $parsedAi['pageSummary'] ?? '';
                $suggestedCountries = $parsedAi['suggestedCountries'] ?? [];
                break; // Successfully got live AI keywords!
            } else {
                $modelAttempts[] = "{$modelName}: JSON Decode Başarısız (" . mb_substr($rawAiText, 0, 100) . ")";
            }
        } elseif (isset($gJson['error']['message'])) {
            $modelAttempts[] = "{$modelName} (HTTP {$httpCode}): " . $gJson['error']['message'];
        } elseif ($curlErr) {
            $modelAttempts[] = "{$modelName} (cURL Hatası): " . $curlErr;
        } else {
            $modelAttempts[] = "{$modelName} (HTTP {$httpCode}): " . mb_substr($resGemini, 0, 150);
        }
    }

    if (empty($keywordsResult)) {
        // ZERO FAKE DATA - Return exact Google API error & debug info
        echo json_encode([
            'status' => 'error',
            'message' => 'Google Gemini API Yanıt Veremedi: ' . implode(' | ', $modelAttempts),
            'diagnostics' => [
                'geminiKeyConfigured' => !empty($geminiKey),
                'geminiKeyMasked' => $geminiKey ? substr($geminiKey, 0, 6) . '...' . substr($geminiKey, -4) : 'YOK',
                'modelAttempts' => $modelAttempts,
                'scrapedPage' => [
                    'url' => $query,
                    'title' => $pageDetails['title'] ?? '(Başlık Çekilemedi)',
                    'headingsCount' => count($pageDetails['headings'] ?? []),
                    'textLength' => strlen($pageDetails['textSnippet'] ?? '')
                ]
            ]
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

function generateNegativeCategoriesFallback($sector, $lang) {
    if ($lang === 'ru') {
        return [
            [
                'category' => 'Мусорные и Бесплатные Запросы',
                'words' => ['бесплатно', 'скачать', 'торрент', 'халява', 'кряк', 'взлом', 'видео бесплатно', 'pdf']
            ],
            [
                'category' => 'Работа, Учеба и Карьера',
                'words' => ['вакансии', 'работа', 'резюме', 'стажировка', 'зарплата', 'требуются', 'курсы', 'обучение']
            ],
            [
                'category' => 'Отзывы, Форумы и Жалобы',
                'words' => ['отзывы', 'форум', 'жалобы', 'мошенники', 'развод', 'обман', 'суд', 'контакты']
            ],
            [
                'category' => 'Б/У и Неподходящие Форматы',
                'words' => ['б/у', 'авито', 'посуточно', 'аренда на день', 'своими руками', 'дешево копейки']
            ]
        ];
    }
    return [
        [
            'category' => 'İsraf & Bedava Aramalar',
            'words' => ['ücretsiz', 'bedava', 'indir', 'torrent', 'crack', 'hile', 'pdf']
        ],
        [
            'category' => 'Kariyer & Eğitim',
            'words' => ['iş ilanları', 'maaşları', 'staj', 'eleman arayanlar', 'kursu', 'nasıl olunur']
        ],
        [
            'category' => 'Şikayet & Forum',
            'words' => ['şikayet', 'yorumlar', 'dolandırıcılığı', 'müşteri hizmetleri', 'iletişim']
        ],
        [
            'category' => 'İkinci El & Sahibinden',
            'words' => ['sahibinden', 'ikinci el', '2 el', 'letgo', 'dolap']
        ]
    ];
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

    if (empty($negativeCategories)) {
        $negativeCategories = generateNegativeCategoriesFallback($sector, $language);
    }

    echo json_encode([
        'status' => 'success',
        'categories' => $negativeCategories
    ]);
    exit;
}

if ($action === 'list_models') {
    $apiKeys = getApiKeys($pdo);
    $geminiKey = $apiKeys['geminiApiKey'] ?: $apiKeys['googleApiKey'];
    if (empty($geminiKey)) {
        echo json_encode(['status' => 'error', 'message' => 'API Key tanımlanmamış.']);
        exit;
    }

    $ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models?key=" . urlencode($geminiKey));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $json = json_decode($res, true);
    echo json_encode([
        'status' => 'success',
        'httpCode' => $httpCode,
        'keyLength' => strlen($geminiKey),
        'keyMasked' => substr($geminiKey, 0, 6) . '...' . substr($geminiKey, -4),
        'raw' => $json
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
