# Roasist Marketing Suite - Developer & AI Assistant Guidelines

## CRITICAL PROJECT RULES

### 1. SEARCH VOLUME (ARAMA HACMİ) KURALI (KESİN VE TAVİZSİZ)
- **HİÇBİR ZAMAN TAHMİNİ VEYA UYDURMA ARAMA HACMİ GÖSTERİLEMEZ.**
- Google Ads API'den bir kelime için arama hacmi gelmiyorsa veya `0` dönüyorsa, arayüzde, tablolarda, KPI kartlarında ve raporlarda **kesinlikle `0` gösterilecektir**.
- `Math.max(10, ...)`, `Math.max(50, ...)`, `reach / 10000`, `locShareRatio * volume` gibi yapay taban, çarpan veya nüfus oranlama algoritmaları arama hacimlerinde **ASLA KULLANILAMAZ**.
- Sadece ve sadece Google Ads API'nin (`generateKeywordHistoricalMetrics` / `generateKeywordIdeas`) resmi yanıtındaki gerçek `avgMonthlySearches` değerleri kullanılır.
- Tekil bölge seçildiğinde, o bölgenin hacmi kelimelerin o bölgedeki gerçek toplamıdır.
- "Tüm Lokasyonlar" seçildiğinde, arama hacmi kelimelerin hedeflenen lokasyonlardaki gerçek toplamıdır.
