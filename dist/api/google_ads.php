<?php
/**
 * Roasist Marketing Suite - Live Google Ads Transparency Center Engine
 * Real-time connection to Google Ads Transparency Center RPC & Universal Creative Ingestion
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$currentUser = requireAuth();
$pdo = Database::getConnection();

$action = $_GET['action'] ?? 'search_advertisers';
$rawQuery = trim($_GET['q'] ?? $_GET['domain'] ?? $_GET['advertiser_id'] ?? '');
$region = strtoupper(trim($_GET['region'] ?? $_GET['country'] ?? 'TR'));
$formatFilter = strtoupper(trim($_GET['format'] ?? 'ALL'));

// Clean domain / query
$cleanInput = preg_replace('#^https?://#', '', rtrim($rawQuery, '/'));
$cleanInput = preg_replace('#^www\.#', '', $cleanInput);
$domainName = explode('/', $cleanInput)[0];

if (empty($domainName) || strlen($domainName) < 2) {
    echo json_encode([
        'status' => 'success',
        'query' => $rawQuery,
        'advertisers' => [],
        'ads' => []
    ]);
    exit;
}

// 1. ACTION: Search Google Advertisers & Domains via Google Transparency RPC
if ($action === 'search_advertisers') {
    $results = [];
    
    // Call Google Transparency Center SearchSuggestions RPC
    $transparencyUrl = "https://adstransparency.google.com/anji/_/rpc/SearchService/SearchSuggestions?authuser=0";
    $payload = "f.req=" . urlencode(json_encode([
        "1" => $domainName,
        "2" => 12,
        "3" => 10
    ]));

    $ch = curl_init($transparencyUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded',
        'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);
    $resp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && !empty($resp)) {
        $j = json_decode($resp, true);
        if (!empty($j['1']) && is_array($j['1'])) {
            foreach ($j['1'] as $item) {
                // Case 1: Verified Advertiser Object (item['1'])
                if (!empty($item['1'])) {
                    $adv = $item['1'];
                    $name = $adv['1'] ?? $domainName;
                    $advId = $adv['2'] ?? ('AR_' . md5($name));
                    $countryCode = $adv['3'] ?? 'TR';
                    $results[] = [
                        'id' => $advId,
                        'advertiserId' => $advId,
                        'name' => $name,
                        'domain' => $domainName,
                        'network' => 'GOOGLE',
                        'type' => 'ADVERTISER',
                        'country' => $countryCode,
                        'avatarUrl' => "https://www.google.com/s2/favicons?domain=" . urlencode($domainName ?: $name) . "&sz=128",
                        'category' => 'Google Doğrulanmış Reklam Veren',
                        'googleTransparencyUrl' => "https://adstransparency.google.com/advertiser/$advId?region=" . ($region === 'ALL' ? 'anywhere' : $region)
                    ];
                }
                // Case 2: Website Domain (item['2'])
                elseif (!empty($item['2']['1'])) {
                    $domain = $item['2']['1'];
                    $results[] = [
                        'id' => 'g_' . md5($domain),
                        'advertiserId' => '',
                        'name' => $domain,
                        'domain' => $domain,
                        'network' => 'GOOGLE',
                        'type' => 'DOMAIN',
                        'country' => 'Global',
                        'avatarUrl' => "https://www.google.com/s2/favicons?domain=" . urlencode($domain) . "&sz=128",
                        'category' => 'Web Sitesi / Domain',
                        'googleTransparencyUrl' => "https://adstransparency.google.com/?region=" . ($region === 'ALL' ? 'anywhere' : $region) . "&domain=" . urlencode($domain)
                    ];
                }
            }
        }
    }

    // Always include direct domain search if user typed a domain
    if (strpos($domainName, '.') !== false) {
        $alreadyInList = false;
        foreach ($results as $r) {
            if (strtolower($r['name']) === strtolower($domainName) || strtolower($r['domain']) === strtolower($domainName)) {
                $alreadyInList = true;
                break;
            }
        }
        if (!$alreadyInList) {
            array_unshift($results, [
                'id' => 'g_' . md5($domainName),
                'advertiserId' => '',
                'name' => $domainName,
                'domain' => $domainName,
                'network' => 'GOOGLE',
                'type' => 'DOMAIN',
                'country' => 'Global',
                'avatarUrl' => "https://www.google.com/s2/favicons?domain=" . urlencode($domainName) . "&sz=128",
                'category' => 'Web Sitesi / Domain',
                'googleTransparencyUrl' => "https://adstransparency.google.com/?region=" . ($region === 'ALL' ? 'anywhere' : $region) . "&domain=" . urlencode($domainName)
            ]);
        }
    }

    echo json_encode([
        'status' => 'success',
        'query' => $rawQuery,
        'advertisers' => $results
    ]);
    exit;
}

// 2. ACTION: Universal Real Google Ads Fetch (Works for ANY Domain & Advertiser)
if ($action === 'fetch_google_ads') {
    $brandBase = ucwords(str_replace(['.', '-', '_'], ' ', explode('.', $domainName)[0]));
    $gTransparencyUrl = "https://adstransparency.google.com/?region=" . ($region === 'ALL' ? 'anywhere' : $region) . "&domain=" . urlencode($domainName);

    $rawCreatives = [];
    $creatUrl = "https://adstransparency.google.com/anji/_/rpc/SearchService/SearchCreatives?authuser=0";

    // Step 1: Query by Domain in SearchCreatives
    $payloadCreat = [
        "2" => 40,
        "3" => [
            "12" => ["1" => $domainName, "2" => true]
        ],
        "7" => ["1" => 1]
    ];

    $ch = curl_init($creatUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, "f.req=" . urlencode(json_encode($payloadCreat)));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded',
        'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    $resp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && !empty($resp)) {
        $j = json_decode($resp, true);
        if (!empty($j['1']) && is_array($j['1'])) {
            $rawCreatives = $j['1'];
        }
    }

    // Step 2: If 0 results by domain, resolve Advertiser ID via SearchSuggestions
    if (empty($rawCreatives)) {
        $sugUrl = "https://adstransparency.google.com/anji/_/rpc/SearchService/SearchSuggestions?authuser=0";
        $payloadSug = ["1" => $domainName, "2" => 10, "3" => 10];

        $chSug = curl_init($sugUrl);
        curl_setopt($chSug, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($chSug, CURLOPT_POST, true);
        curl_setopt($chSug, CURLOPT_POSTFIELDS, "f.req=" . urlencode(json_encode($payloadSug)));
        curl_setopt($chSug, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded',
            'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        ]);
        curl_setopt($chSug, CURLOPT_TIMEOUT, 6);
        $respSug = curl_exec($chSug);
        curl_close($chSug);

        if (!empty($respSug)) {
            $jSug = json_decode($respSug, true);
            $foundAdvIds = [];
            if (!empty($jSug['1']) && is_array($jSug['1'])) {
                foreach ($jSug['1'] as $sItem) {
                    if (!empty($sItem['1']['2'])) {
                        $foundAdvIds[] = $sItem['1']['2'];
                    }
                }
            }

            foreach ($foundAdvIds as $advId) {
                $payloadAdv = [
                    "2" => 40,
                    "3" => [
                        "12" => ["1" => "", "2" => true],
                        "13" => ["1" => [$advId]]
                    ],
                    "7" => ["1" => 1]
                ];
                $chAdv = curl_init($creatUrl);
                curl_setopt($chAdv, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($chAdv, CURLOPT_POST, true);
                curl_setopt($chAdv, CURLOPT_POSTFIELDS, "f.req=" . urlencode(json_encode($payloadAdv)));
                curl_setopt($chAdv, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/x-www-form-urlencoded',
                    'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                ]);
                curl_setopt($chAdv, CURLOPT_TIMEOUT, 8);
                $respAdv = curl_exec($chAdv);
                curl_close($chAdv);
                if (!empty($respAdv)) {
                    $jAdv = json_decode($respAdv, true);
                    if (!empty($jAdv['1']) && is_array($jAdv['1'])) {
                        $rawCreatives = array_merge($rawCreatives, $jAdv['1']);
                        break;
                    }
                }
            }
        }
    }

    // Step 3: If still 0 results and domain has extension, try searching base brand name
    if (empty($rawCreatives) && strpos($domainName, '.') !== false) {
        $baseQuery = explode('.', $domainName)[0];
        $sugUrl = "https://adstransparency.google.com/anji/_/rpc/SearchService/SearchSuggestions?authuser=0";
        $payloadSug = ["1" => $baseQuery, "2" => 6, "3" => 10];

        $chSug = curl_init($sugUrl);
        curl_setopt($chSug, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($chSug, CURLOPT_POST, true);
        curl_setopt($chSug, CURLOPT_POSTFIELDS, "f.req=" . urlencode(json_encode($payloadSug)));
        curl_setopt($chSug, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded',
            'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        ]);
        curl_setopt($chSug, CURLOPT_TIMEOUT, 6);
        $respSug = curl_exec($chSug);
        curl_close($chSug);

        if (!empty($respSug)) {
            $jSug = json_decode($respSug, true);
            if (!empty($jSug['1']) && is_array($jSug['1'])) {
                foreach ($jSug['1'] as $sItem) {
                    if (!empty($sItem['1']['2'])) {
                        $advId = $sItem['1']['2'];
                        $payloadAdv = [
                            "2" => 40,
                            "3" => [
                                "12" => ["1" => "", "2" => true],
                                "13" => ["1" => [$advId]]
                            ],
                            "7" => ["1" => 1]
                        ];
                        $chAdv = curl_init($creatUrl);
                        curl_setopt($chAdv, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($chAdv, CURLOPT_POST, true);
                        curl_setopt($chAdv, CURLOPT_POSTFIELDS, "f.req=" . urlencode(json_encode($payloadAdv)));
                        curl_setopt($chAdv, CURLOPT_HTTPHEADER, [
                            'Content-Type: application/x-www-form-urlencoded',
                            'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                        ]);
                        curl_setopt($chAdv, CURLOPT_TIMEOUT, 8);
                        $respAdv = curl_exec($chAdv);
                        curl_close($chAdv);
                        if (!empty($respAdv)) {
                            $jAdv = json_decode($respAdv, true);
                            if (!empty($jAdv['1']) && is_array($jAdv['1'])) {
                                $rawCreatives = array_merge($rawCreatives, $jAdv['1']);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    $realAds = [];
    $seenIds = [];

    // Transform Raw Google Creatives into AdItems
    foreach ($rawCreatives as $index => $c) {
        $advId = $c['1'] ?? '';
        $creativeId = $c['2'] ?? ('CR_' . $index);
        
        if (isset($seenIds[$creativeId])) continue;
        $seenIds[$creativeId] = true;

        $officialName = $c['12'] ?? $brandBase;
        $formatNum = $c['4'] ?? 1; // 1 = Search, 2 = Display/Image, 3 = Responsive/Video

        $startTs = !empty($c['6']['1']) ? (int)$c['6']['1'] : time();
        $lastSeenTs = !empty($c['7']['1']) ? (int)$c['7']['1'] : time();

        $startDateStr = date('Y-m-d', $startTs);
        $activeDays = max(1, round(($lastSeenTs - $startTs) / 86400));

        $format = 'DISPLAY';
        $platform = 'google_display';
        if ($formatNum === 1) {
            $format = 'SEARCH';
            $platform = 'google_search';
        } elseif ($formatNum === 3) {
            $format = 'VIDEO';
            $platform = 'youtube';
        }

        // Extract creative preview url if available
        $previewUrl = $c['3']['1']['4'] ?? '';

        $mediaUrls = [];
        if (!empty($previewUrl)) {
            $mediaUrls[] = $previewUrl;
        }

        $directAdUrl = "https://adstransparency.google.com/advertiser/$advId/creative/$creativeId?region=" . ($region === 'ALL' ? 'anywhere' : $region);

        $realAds[] = [
            'id' => $creativeId,
            'network' => 'GOOGLE',
            'pageId' => $domainName,
            'pageName' => $officialName,
            'domain' => $domainName,
            'targetUrl' => "https://$domainName",
            'activeStatus' => 'ACTIVE',
            'format' => $format,
            'creationDate' => $startDateStr,
            'startDate' => $startDateStr,
            'activeDaysCount' => $activeDays,
            'adHeadline' => "$officialName | Google Ads Kreatifi ($creativeId)",
            'adBodyText' => "Google Reklam Şeffaflığı Merkezi tarafından tespit edilen $startDateStr tarihli aktif $format kampanyası.",
            'adCta' => 'Google Kreatifini Aç',
            'mediaUrls' => $mediaUrls,
            'platforms' => [$platform],
            'sitelinks' => ['Google Reklamı', 'Doğrulanmış Kampanya', $officialName],
            'hookType' => $activeDays >= 30 ? 'Sosyal Kanıt' : 'Arama Niyeti & SEO',
            'isWinner' => $activeDays >= 30,
            'googleTransparencyUrl' => $directAdUrl
        ];
    }

    echo json_encode([
        'status' => 'success',
        'network' => 'GOOGLE',
        'brand' => $brandBase,
        'domain' => $domainName,
        'region' => $region,
        'count' => count($realAds),
        'googleTransparencyUrl' => $gTransparencyUrl,
        'ads' => $realAds
    ]);
    exit;
}
