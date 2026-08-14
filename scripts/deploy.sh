#!/bin/bash
set -e

# 1. Ensure source index.html has the Vite React entry point with official Roasist favicon
cat << 'EOF' > index.html
<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Roasist | Marketing Intelligence OS</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

echo "🚀 [1/5] Proje derleniyor (Vite build with fresh src/main.tsx)..."
npx tsc -b
npx vite build

echo "📦 [2/5] Derlenmiş dosyalar, API ve betikler eşitleniyor..."
cp -rf dist/assets .
cp -f dist/index.html .
cp -rf public/api .
cp -rf public/api dist/
cp -f public/favicon.svg .
cp -f public/favicon.svg dist/
cp -f public/roasist-logo.svg .
cp -f public/roasist-logo.svg dist/
cp -f public/deploy_webhook.php .
cp -f public/opcache_clear.php .
cp -f public/.htaccess .
cp -f public/deploy_webhook.php dist/
cp -f public/opcache_clear.php dist/
cp -f public/.htaccess dist/

echo "📤 [3/5] Değişiklikler GitHub'a push ediliyor..."
git add .
COMMIT_MSG="${1:-auto deploy update}"
git commit -m "$COMMIT_MSG" || echo "Değişiklik bulunamadı veya commit edildi."
git push origin main

echo "⚡ [4/5] Canlı sunucuda Deploy Webhook tetikleniyor..."
DEPLOY_RES=$(curl -s "https://marketing.roasist.com/deploy_webhook.php?secret=RoasistDeploy2026AutoSyncSecureToken")
echo "Deploy Yanıtı: $DEPLOY_RES"

echo "🧹 [5/5] OPcache & LiteSpeed önbelleği temizleniyor..."
CACHE_RES=$(curl -s "https://marketing.roasist.com/opcache_clear.php?secret=RoasistDeploy2026AutoSyncSecureToken")
echo "Cache Yanıtı: $CACHE_RES"

echo "✨ [TAMAMLANDI] https://marketing.roasist.com canlıda güncellendi!"
