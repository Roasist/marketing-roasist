# Roasist Marketing Suite - Kullanım & Metrik Kılavuzu

Bu kılavuz, Roasist Marketing Suite uygulaması içerisindeki arama hacmi (Search Volume), TBM (CPC), lokasyon bazlı veri çekme mekanizmaları ve Google Ads API veri doğruluğu kurallarını açıklamaktadır.

---

## 1. Google Ads API ve Veri Doğruluğu İlkeleri

Roasist Marketing Suite, Google Ads verilerini resmi **Google Ads API v22** (`googleads.googleapis.com`) üzerinden canlı olarak çeker. Uygulamada görüntülenen tüm metriklerde aşağıdaki temel ilkeler geçerlidir:

1. **Sıfır Tahmin (Zero Artificial Estimation) İlkesi:**
   - Uygulamada hiçbir zaman uydurma, tahmin veya yapay çarpanlı arama hacmi gösterilmez.
   - `Math.max(10, ...)`, `reach / 10000`, nüfus oranlaması gibi yapay algoritmalar **kesinlikle kullanılmaz**.
   - Google Ads API bir kelime veya lokasyon için `0` veya `null` döndürüyorsa, ekranda ve raporlarda **kesinlikle `0`** gösterilir.

2. **Gerçek Kelime Eşleşmesi:**
   - Seçilen anahtar kelimelerin toplam hacmi hesaplanırken, yalnızca kullanıcının seçtiği birebir kelimelerin hacimleri toplanır. Google Ads API'nin türettiği yan öneri kelimelerin hacimleri seçili kelimelerin toplamına karıştırılmaz.

---

## 2. Google Ads Web Arayüzü ile API Arasındaki Farklar ve Farklılık Nedenleri

Kullanıcılar Google Ads Paneli (`ads.google.com`) ile Roasist Marketing Suite (API) verilerini karşılaştırırken bazı özel durumlarda farklar görebilirler:

### 🔹 Google Ads API Gizlilik ve Bölgesel Eşik Politikası (*Differential Privacy*)
- **Eyalet / Şehir Seviyesindeki Farklar:** 
  Bir anahtar kelime eyalet, bölge veya şehir seviyesinde (örneğin *Odesa Oblast*, *Almaty Region*, *Fergana Region*) sorgulandığında, o bölgedeki arama sayısı yıllık ortalamada çok düşükse, Google Ads API kişisel gizliliği korumak adına (*Differential Privacy Policy*) `keywordIdeaMetrics` / `keywordMetrics` veri nesnelerini API yanıtında gizler ve `0 / null` döndürür.
- **Ülke Seviyesindeki Fark:** 
  Aynı kelime tüm ülke genelinde (örneğin *Ukrayna*, *Kazakistan*, *Özbekistan*) sorgulandığında, toplam hacim gizlilik eşiğini aştığı için Google Ads API tam rakamı (`avgMonthlySearches: 10`, `30`, `50` vb.) döndürür.
- **Web Arayüzü Davranışı:** 
  Google Ads Web Arayüzü (`ads.google.com`), bölgesel sorgularda kartların boş kalmaması adına bazı durumlarda ülkenin taban hacim dilimini (`10`) ekrana yansıtabilir. 
- **Roasist Yaklaşımı:** 
  Roasist Marketing Suite, Google Ads API'nin hedeflenen spesifik lokasyon için verdiği ham yanıtı birebir gösterir. API alt lokasyonda veriyi gizleyip `0` döndürdüğünde, yapay olarak 10'a tamamlamaz, gerçek `0` değerini sunar.

---

## 3. Modüller ve İşleyiş

### Step 1: Keşif & Kelime Analizi (`action=discover`)
- Girilen anahtar kelime, site URL'si veya sektör tanımına göre Google Ads API `generateKeywordIdeas` motoru üzerinden 100+ alakalı kelime fikri keşfeder.
- Kelimelerin arama hacmi, rekabet seviyesi ve Tahmini TBM değerleri doğrudan mecradan çekilir.

### Step 2: Lokasyon Bazlı Canlı Yenileme (`action=location_breakdown`)
- Seçilen kelimelerin hedeflenen her bir eyalet/şehir için ayrı ayrı performansını analiz eder.
- **`⚡ Google API'den Canlı Yenile`** butonuna tıklandığında, her lokasyon için Google Ads API'ye eşzamanlı istekler atılır ve lokasyon bazlı gerçek arama hacimleri ile TBM değerleri çekilir.
- Çekilen veriler lokasyon denetim modalında (*Location Audit Modal*) detaylı biçimde sunulur.

---

*Son Güncelleme: 21 Ağustos 2026*
