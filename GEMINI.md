# Roasist Marketing Suite - Developer & AI Assistant Guidelines

## CRITICAL PROJECT RULES

### 1. SEARCH VOLUME (ARAMA HACMİ) KURALI (KESİN VE TAVİZSİZ)
- **HİÇBİR ZAMAN TAHMİNİ VEYA UYDURMA ARAMA HACMİ GÖSTERİLEMEZ.**
- Google Ads API'den bir kelime için arama hacmi gelmiyorsa veya `0` dönüyorsa, arayüzde, tablolarda, KPI kartlarında ve raporlarda **kesinlikle `0` gösterilecektir**.
- `Math.max(10, ...)`, `Math.max(50, ...)`, `reach / 10000`, `locShareRatio * volume` gibi yapay taban, çarpan veya nüfus oranlama algoritmaları arama hacimlerinde **ASLA KULLANILAMAZ**.
- Sadece ve sadece Google Ads API'nin (`generateKeywordHistoricalMetrics` / `generateKeywordIdeas`) resmi yanıtındaki gerçek `avgMonthlySearches` değerleri kullanılır.
- Tekil bölge seçildiğinde, o bölgenin hacmi kelimelerin o bölgedeki gerçek toplamıdır.
- "Tüm Lokasyonlar" seçildiğinde, arama hacmi kelimelerin hedeflenen lokasyonlardaki gerçek toplamıdır.

### 2. GOOGLE ADS API METRİK GİZLİLİK (DIFFERENTIAL PRIVACY) VE LOKASYON BAZLI 0 VERİ KURALI
- Google Ads Web Arayüzü (`ads.google.com`) ile Google Ads API (`googleads.googleapis.com`) yanıtları arasında eyalet/şehir seviyesindeki alt lokasyonlarda fark görülebilir.
- **Teknik Neden:** Google Ads API, alt lokasyonlarda (örneğin eyalet, ilçe veya alt şehir seviyesinde) bir kelimenin arama hacmi seyrekleştiğinde kişisel gizliliği ve veri hassasiyetini korumak adına (*Differential Privacy Policy*) `keywordIdeaMetrics` / `keywordMetrics` nesnelerini API yanıtından çıkarır ve `0 / null` döndürür.
- Aynı kelime ülke genelinde sorgulandığında API gerçek hacmi (`avgMonthlySearches: 10` vb.) tam olarak sunabilir.
- Google Web Arayüzü ise alt bölge kartlarında boş ekran göstermemek adına ülkenin taban hacmini gösterebilmektedir.
- **TAVİZSİZ UYGULAMA KURALI:** Uygulamamızda web arayüzü tahminleri veya ülke seviyesinden oranlamalar değil, YALNIZCA Google Ads API'nin hedeflenen spesifik lokasyon için döndürdüğü resmi ham veri gösterilecektir. API ilgili bölge için 0/null döndürüyorsa arayüzde kesinlikle 0 gösterilecektir.

