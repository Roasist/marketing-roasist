#!/bin/bash
set -e

echo "🚀 [1/5] Proje derleniyor (npm run build)..."
npm run build

echo "📦 [2/5] Derlenmiş dosyalar, API ve betikler eşitleniyor..."
cp -rf dist/* .
cp -rf dist/assets .
cp -rf public/api .
cp -rf public/api dist/
cp -f public/deploy_webhook.php .
cp -f public/opcache_clear.php .
cp -f public/.htaccess .
cp -f public/deploy_webhook.php dist/
cp -f public/opcache_clear.php dist/
cp -f public/.htaccess dist/

echo "📤 [3/5] Değişiklikler GitHub'a push ediliyor..."
git add -A
COMMIT_MSG="${1:-feat: automated release update}"
git commit -m "$COMMIT_MSG" || echo "Commit edilecek yeni değişiklik yok."
git push origin main

echo "⚡ [4/5] Canlı sunucuda Deploy Webhook tetikleniyor..."
DEPLOY_RES=$(curl -s "https://marketing.roasist.com/deploy_webhook.php?secret=roasist_marketing_deploy_secret_2026" || true)
echo "Deploy Yanıtı: $DEPLOY_RES"

echo "🧹 [5/5] OPcache & LiteSpeed önbelleği temizleniyor..."
CACHE_RES=$(curl -s "https://marketing.roasist.com/opcache_clear.php?secret=roasist_marketing_deploy_secret_2026" || true)
echo "Cache Yanıtı: $CACHE_RES"

echo "✨ [TAMAMLANDI] https://marketing.roasist.com canlıda güncellendi!"
