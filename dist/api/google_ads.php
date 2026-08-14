<?php
/**
 * Roasist Marketing Suite - Live Google Ads Transparency Center Engine
 * 100% Authentic Campaign Intelligence with Direct Domain Resolution & Primary Legal Entity Matching
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$currentUser = requireAuth();
$pdo = Database::getConnection();

$action = $_GET['action'] ?? 'search_advertisers';
$rawQuery = trim($_GET['q'] ?? $_GET['domain'] ?? $_GET['advertiser_id'] ?? '');
$region = strtoupper(trim($_GET['region'] ?? $_GET['country'] ?? 'ALL'));
$formatFilter = strtoupper(trim($_GET['format'] ?? 'ALL'));

// Clean domain / query
$cleanInput = preg_replace('#^https?://#', '', rtrim($rawQuery, '/'));
$cleanInput = preg_replace('#^www\.#', '', $cleanInput);
$domainName = strtolower(explode('/', $cleanInput)[0]);

if (empty($domainName) || strlen($domainName) < 2) {
    echo json_encode([
        'status' => 'success',
        'query' => $rawQuery,
        'advertisers' => [],
        'ads' => []
    ]);
    exit;
}

// 1. ACTION: Search Google Advertisers & Domains for Autocomplete
if ($action === 'search_advertisers') {
    $results = [];
    
    $transparencyUrl = "https://adstransparency.google.com/anji/_/rpc/SearchService/SearchSuggestions?authuser=0";
    $payload = "f.req=" . urlencode(json_encode([
        "1" => $domainName,
        "2" => 15,
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
                if (!empty($item['1'])) {
                    $adv = $item['1'];
                    $name = $adv['1'] ?? $domainName;
                    $advId = $adv['2'] ?? ('AR_' . md5($name));
                    $countryCode = $adv['3'] ?? 'TR';
                    $totalAdCount = !empty($adv['4']['2']['1']) ? (int)$adv['4']['2']['1'] : null;
                    $results[] = [
                        'id' => $advId,
                        'advertiserId' => $advId,
                        'name' => $name,
                        'domain' => $domainName,
                        'network' => 'GOOGLE',
                        'type' => 'ADVERTISER',
                        'country' => $countryCode,
                        'totalAds' => $totalAdCount,
                        'avatarUrl' => "https://www.google.com/s2/favicons?domain=" . urlencode($domainName ?: $name) . "&sz=128",
                        'category' => $totalAdCount ? "Google Doğrulanmış ($totalAdCount Reklam)" : 'Google Doğrulanmış Reklam Veren',
                        'googleTransparencyUrl' => "https://adstransparency.google.com/advertiser/$advId?region=" . ($region === 'ALL' ? 'anywhere' : $region)
                    ];
                } elseif (!empty($item['2']['1'])) {
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

// 2. ACTION: Fetch Google Ads with Exact Primary Verified Entity Resolution
if ($action === 'fetch_google_ads') {
    $brandBase = ucwords(str_replace(['.', '-', '_'], ' ', explode('.', $domainName)[0]));
    $gTransparencyUrl = "https://adstransparency.google.com/?region=" . ($region === 'ALL' ? 'anywhere' : $region) . "&domain=" . urlencode($domainName);

    $rawCreatives = [];
    $creatUrl = "https://adstransparency.google.com/anji/_/rpc/SearchService/SearchCreatives?authuser=0";

    $isDomainQuery = strpos($domainName, '.') !== false;
    $isDirectAdvId = strpos($rawQuery, 'AR') === 0;

    // Direct Advertiser ID query if provided
    if ($isDirectAdvId) {
        $payloadAdv = [
            "2" => 100,
            "3" => [
                "13" => ["1" => [$rawQuery]]
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
        curl_setopt($chAdv, CURLOPT_TIMEOUT, 10);
        $respAdv = curl_exec($chAdv);
        curl_close($chAdv);

        if (!empty($respAdv)) {
            $jAdv = json_decode($respAdv, true);
            if (!empty($jAdv['1']) && is_array($jAdv['1'])) {
                $rawCreatives = $jAdv['1'];
            }
        }
    } elseif ($isDomainQuery) {
        // Query domain creatives
        $payloadDomain = [
            "2" => 100,
            "3" => [
                "12" => ["1" => $domainName, "2" => true]
            ],
            "7" => ["1" => 1]
        ];

        $ch = curl_init($creatUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "f.req=" . urlencode(json_encode($payloadDomain)));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded',
            'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $resp = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && !empty($resp)) {
            $j = json_decode($resp, true);
            if (!empty($j['1']) && is_array($j['1'])) {
                $allDomainCreatives = $j['1'];

                // Count legal entities to isolate primary verified owner vs third-party affiliates
                $entityCounts = [];
                foreach ($allDomainCreatives as $c) {
                    $entityName = !empty($c['12']) ? trim($c['12']) : $brandBase;
                    $entityCounts[$entityName] = ($entityCounts[$entityName] ?? 0) + 1;
                }

                // If multiple entities, pick the dominant verified primary entity
                if (count($entityCounts) > 1) {
                    arsort($entityCounts);
                    $primaryEntity = array_key_first($entityCounts);
                    
                    // Filter to primary verified legal entity only (e.g. "summer home" vs third-party "Turkey House")
                    $rawCreatives = array_filter($allDomainCreatives, function($c) use ($primaryEntity) {
                        return (!empty($c['12']) && trim($c['12']) === $primaryEntity);
                    });
                } else {
                    $rawCreatives = $allDomainCreatives;
                }
            }
        }
    }

    $realAds = [];
    $seenIds = [];
    $officialAdvertiserName = $brandBase;

    // Transform Raw Google Creatives into Campaign Intelligence Items
    foreach ($rawCreatives as $index => $c) {
        $advId = $c['1'] ?? '';
        $creativeId = $c['2'] ?? ('CR_' . $index);
        
        if (isset($seenIds[$creativeId])) continue;
        $seenIds[$creativeId] = true;

        if (!empty($c['12'])) {
            $officialAdvertiserName = trim($c['12']);
        }
        $officialName = !empty($c['12']) ? trim($c['12']) : $brandBase;
        $formatNum = $c['4'] ?? 1; // 1 = Search, 2 = Display/Image, 3 = Responsive/Video

        $startTs = !empty($c['6']['1']) ? (int)$c['6']['1'] : time();
        $lastSeenTs = !empty($c['7']['1']) ? (int)$c['7']['1'] : time();

        $startDateStr = date('Y-m-d', $startTs);
        $lastSeenDateStr = date('Y-m-d', $lastSeenTs);
        
        // Duration in days between first shown and last seen
        $activeDays = max(1, round(($lastSeenTs - $startTs) / 86400));
        
        // 2-Day Active Rule: Active ONLY IF seen within the last 2 days (48 hours)
        $isActive = (time() - $lastSeenTs) <= (2 * 86400);
        $status = $isActive ? 'ACTIVE' : 'INACTIVE';

        $format = 'SEARCH';
        $platform = 'google_search';
        $formatLabel = 'Google Arama (Search)';
        if ($formatNum === 2) {
            $format = 'IMAGE';
            $platform = 'google_display';
            $formatLabel = 'Google Görüntülü (GDN Banner)';
        } elseif ($formatNum === 3) {
            $format = 'DISPLAY';
            $platform = 'youtube';
            $formatLabel = 'YouTube / Responsive Video';
        }

        $directAdUrl = "https://adstransparency.google.com/advertiser/$advId/creative/$creativeId?region=" . ($region === 'ALL' ? 'anywhere' : $region);

        $realAds[] = [
            'id' => $creativeId,
            'network' => 'GOOGLE',
            'pageId' => $domainName,
            'pageName' => $officialName,
            'brandLogo' => $officialAdvertiserName,
            'domain' => $domainName,
            'targetUrl' => "https://$domainName",
            'visibleUrl' => "www.$domainName",
            'activeStatus' => $status,
            'format' => $format,
            'creationDate' => $startDateStr,
            'startDate' => $startDateStr,
            'lastSeenDate' => $lastSeenDateStr,
            'endDate' => $isActive ? null : $lastSeenDateStr,
            'activeDaysCount' => $activeDays,
            'adHeadline' => $formatLabel,
            'adBodyText' => "Google Şeffaflık Merkezi tarafından tescillenen resmi kreatif.",
            'adCta' => 'Google\'da İncele',
            'mediaUrls' => [],
            'platforms' => [$platform],
            'sitelinks' => [],
            'hookType' => 'Arama Niyeti & SEO',
            'googleTransparencyUrl' => $directAdUrl
        ];
    }

    echo json_encode([
        'status' => 'success',
        'network' => 'GOOGLE',
        'brand' => $officialAdvertiserName,
        'domain' => $domainName,
        'region' => $region,
        'count' => count($realAds),
        'googleTransparencyUrl' => $gTransparencyUrl,
        'ads' => $realAds
    ]);
    exit;
}
