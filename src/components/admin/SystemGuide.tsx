import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Target,
  Users,
  PenTool,
  TrendingUp,
  Key,
  Zap,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Database,
  Globe2,
  Server
} from 'lucide-react';

export const SystemGuide: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    { id: 'ALL', name: 'Tüm Kılavuz', icon: Globe2 },
    { id: 'FORECAST', name: 'Google Ads & SEM Motoru', icon: Target },
    { id: 'COMPETITORS', name: 'Rakip Reklam İstihbaratı', icon: Users },
    { id: 'COPYWRITER', name: 'Yapay Zeka Metin Yazarı', icon: PenTool },
    { id: 'ROAS', name: 'ROAS & Bütçe Simülatörü', icon: TrendingUp },
    { id: 'API_SECURITY', name: 'API, Güvenlik & Dağıtım', icon: Key },
    { id: 'FAQ', name: 'Sıkça Sorulan Sorular', icon: HelpCircle },
  ];

  const faqs = [
    {
      q: 'Google Ads Tahmin modülündeki arama hacimleri ve TBM verileri nereden geliyor?',
      a: 'Tüm arama hacimleri (Search Volume), sayfa üstü minimum ve maksimum TBM (Top of Page Bids) ile rekabet indeksleri doğrudan Google Ads Resmi Keyword Planner API üzerinden çekilmektedir. Sistemde kesinlikle yapay zeka uydurması veya tahmini sayısal veri kullanılmaz; her bir kelimenin verisi Google veritabanından doğrulanır.'
    },
    {
      q: 'SEM Uzman Seçimi (High-ROAS) nedir ve nasıl çalışır?',
      a: 'SEM Uzmanı, Google Gemini AI ile sayfanın gerçek satın alma niyetini (Transactional Intent) ve sektör dilini analiz ederek yüksek dönüşümlü tohum kelimeler (Seeds) üretir. Bu tohumlar doğrudan Google Ads API\'sine gönderilerek resmi verileri alınır ve Google Ads STAG (Single Theme Ad Group) prensibine göre 5 farklı reklam grubuna (Fiyat, Lokasyon, Yorumlar, Lead Kancaları, Ana Hizmet) ayrıştırılır.'
    },
    {
      q: 'Sayfamda Türkçe hizmet veriyorum, yabancı dil veya alakasız kelimeler gelir mi?',
      a: 'Hayır. Sistem 2. Kontrol Semantik ve Dil Filtresi (Context Filter) uygular. Sayfa dili Türkçe tespit edildiğinde İngilizce edatlar ("in istanbul", "for sale", "near me" vb.), gramatikal çöp kalıplar ("fits you", "good not", "we you are") ve sektör dışı ansiklopedik kelimeler otomatik olarak elenir.'
    },
    {
      q: 'Farklı bir ülke veya para birimi için nasıl tahmin yapabilirim?',
      a: 'Tahmin modülünde üst bardaki "Hedef Ülke" seçiciden Türkiye (TRY), Almanya (EUR), İngiltere (GBP), BAE/Dubai (AED) veya ABD (USD) seçebilirsiniz. Sistem, seçilen ülkenin resmi Google Ads coğrafi hedefleme kriterlerine ve TBM katsayılarına göre bütçe ve tıklama projeksiyonunu anında günceller.'
    },
    {
      q: 'Google Ads API veya Gemini API anahtarlarını nereden yönetirim?',
      a: 'Admin panelindeki "API Bağlantıları" sekmesinden Google Ads Developer Token, Customer ID, Client ID, Client Secret, Refresh Token ve Google Gemini API anahtarlarını güvenli bir şekilde girebilir ve "Bağlantıyı Test Et" butonu ile canlı doğrulama yapabilirsiniz.'
    },
    {
      q: 'Yapılan güncellemeler canlı sunucuya nasıl aktarılıyor?',
      a: 'Roasist Marketing Suite, tam otomatik Zero-Downtime Deploy Webhook altyapısına sahiptir. Kod GitHub\'a gönderildiğinde sunucu webhook tetiklenir, OPcache ve LiteSpeed önbellekleri otomatik temizlenir ve sistem kesintisiz güncellenir.'
    }
  ];

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div 
        className="card" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(139,92,246,0.08) 100%)',
          border: '1px solid rgba(37,99,235,0.2)',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                backgroundColor: 'var(--brand-primary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#fff'
              }}>
                <BookOpen size={18} />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Roasist Marketing Suite — Kullanım Kılavuzu & Sistem Mimarisi
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Bu doküman, platformun tüm alt modüllerinin arkasındaki çalışma prensiplerini, yapay zeka ve Google Ads API entegrasyonu mimarisini, STAG reklam gruplama mantığını ve operasyonel kullanım adımlarını detaylandırmaktadır.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', padding: '0.35rem 0.65rem' }}>
              <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Canlı Versiyon 6.0 (Zero-Shot Verified)
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginTop: '1.25rem', position: 'relative', maxWidth: '600px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Kılavuzda terim, modül veya özellik ara (örn: Google Ads, STAG, TBM, Negatif Kelimeler)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={isSelected ? 'btn-primary' : 'btn-ghost'}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Icon size={14} />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* MODULE 1: GOOGLE ADS FORECAST & SEM STRATEGIST ENGINE */}
      {(selectedCategory === 'ALL' || selectedCategory === 'FORECAST') && matchesSearch('google ads sem tahmin arama hacmi stag negatif kelime cpc tbm') && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={16} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                1. Google Ads Kampanya Tahmin & SEM Uzmanı Motoru
              </h3>
            </div>
            <span className="badge badge-carousel">Temel Modül</span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Bu modül, herhangi bir açılış sayfası (Landing Page URL) veya sektör tohum kelimesi için <strong>Google Ads bütçe simülasyonu, tıklama tahminleri, resmi anahtar kelime havuzu ve negatif kelime listesi</strong> oluşturur.
          </div>

          {/* Architecture Flow Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
            
            {/* Step 1 */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#3b82f6', fontWeight: 600, fontSize: '0.85rem' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
                Canlı İçerik Kazıma & Dil Tespiti
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                URL girildiğinde sayfa HTML'i canlı kazınır, meta etiketleri, H1/H2 başlıkları ve metin içeriği UTF-8 formatında ayıklanır. Sayfanın dili (TR, EN, DE, RU, AR) otomatik tespit edilir.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#8b5cf6', fontWeight: 600, fontSize: '0.85rem' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
                Gemini AI Niyet & Varlık Analizi
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Yapay zeka, sayfanın sunduğu gerçek hizmetleri, marka adını, bulunduğu ilçe/il/ülke coğrafi hiyerarşisini ve yüksek dönüşümlü (Transactional) tohum kelimeleri (Seeds) çıkarır.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
                %100 Resmi Google Ads API Sorgusu
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Hem URL hem de yapay zekanın tohumları resmi Google Ads Keyword Planner API'sine gönderilir. Gerçek aylık hacimler, sayfa üstü min/max TBM ve rekabet endeksleri çekilir.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>4</span>
                Semantik Filtreleme & STAG Gruplama
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Gramatikal çöpler ve yabancı dil edatları elenir. Kalan yüksek niyetli kelimeler Google Ads STAG mimarisine göre 5 ayrı tematik reklam grubuna dağıtılır.
              </p>
            </div>

          </div>

          {/* STAG Deep Dive Table */}
          <div style={{ marginTop: '0.5rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={15} color="var(--brand-primary)" />
              SEM Uzmanı STAG (Single Theme Ad Group) Reklam Grubu Yapısı
            </h4>
            
            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '240px' }}>Reklam Grubu Teması</th>
                    <th>Hedeflenen Arama Niyeti</th>
                    <th>Örnek Kelimeler</th>
                    <th>Önerilen Reklam Metni Stratejisi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      💰 SEM: Fiyat, Paket & Maliyetler
                    </td>
                    <td>Satın almaya veya bütçe karşılaştırmaya en yakın, hazır kitle.</td>
                    <td><code>diksiyon kursu fiyatları</code>, <code>bbl cost turkey</code>, <code>özel okul ücretleri</code></td>
                    <td>"Şeffaf Fiyatlandırma, Avantajlı Paketler & Erken Kayıt Fırsatları"</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      📍 SEM: Lokasyon & Şehir Odaklı
                    </td>
                    <td>Belirli bir şehir, ilçe veya bölgede doğrudan fiziksel/yerel hizmet arayanlar.</td>
                    <td><code>izmit butik ilkokul</code>, <code>kadıköy diksiyon eğitimi</code>, <code>solaranlage münchen</code></td>
                    <td>"[Şehir] Bölgesindeki Yetkili Merkezimiz ve Uzman Kadromuz"</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      ⭐ SEM: En İyi, Tavsiye & Yorumlar
                    </td>
                    <td>Karar aşamasında referans, başarı oranı ve güvenilirlik arayanlar.</td>
                    <td><code>en iyi diksiyon kursu</code>, <code>veli yorumları</code>, <code>top rated clinics</code></td>
                    <td>"Yüksek Başarı Oranı, Gerçek Müşteri Yorumları & Sertifikalı Eğitim"</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      🪝 SEM: Randevu & Lead Kancaları
                    </td>
                    <td>Hemen aksiyon almaya, form doldurmaya, bursluluk veya teklif almaya hazır kitle.</td>
                    <td><code>ücretsiz ön görüşme</code>, <code>bursluluk sınavı başvurusu</code>, <code>teklif al</code></td>
                    <td>"Ücretsiz Danışmanlık Alın / Hızlı Randevu Formunu Doldurun"</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      🎯 SEM: Ana Hizmet & Varyasyonlar
                    </td>
                    <td>Hizmetin temel adını, teknik eş anlamlılarını veya kısaltmalarını arayanlar.</td>
                    <td><code>etkili iletişim eğitimi</code>, <code>hitabet kursu</code>, <code>photovoltaik anlage</code></td>
                    <td>"Profesyonel [Hizmet Adı] Çözümleri & Kapsamlı Müfredat"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODULE 2: COMPETITOR AD INTELLIGENCE */}
      {(selectedCategory === 'ALL' || selectedCategory === 'COMPETITORS') && matchesSearch('rakip reklam istihbarat meta ad library format kreatif') && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(236,72,153,0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                2. Rakip Reklam İstihbarat & Kütüphanesi Modülü
              </h3>
            </div>
            <span className="badge badge-carousel">İstihbarat</span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Rakiplerin Meta (Facebook/Instagram) ve Google Ads platformlarında yayınladığı aktif reklam kreatiflerini, metin stratejilerini ve format dağılımlarını anlık olarak analiz eder.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                🖼️ Kreatif Format Dağılımı
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Rakibin video, tek görsel ve carousel (dönen kart) reklam formatlarındaki ağırlığını yüzdesel olarak gösterir.
              </p>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                💬 Metin & Kanca (Hook) Analizi
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Rakip reklamların başlıklarında ve ana metinlerinde kullanılan teklifleri, indirim oranlarını ve çağrı metinlerini dökümler.
              </p>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                ⏳ Aktiflik Süresi & Kazanma Testi
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Uzun süredir yayında kalan (30+ gün) reklamlar tespit edilir; bu reklamlar rakibin en karlı "kazanan kreatifleri" olarak etiketlenir.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* MODULE 3: AI COPYWRITER */}
      {(selectedCategory === 'ALL' || selectedCategory === 'COPYWRITER') && matchesSearch('yapay zeka metin yazarı copywriter başlık açıklama cta') && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(168,85,247,0.15)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PenTool size={16} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                3. Yapay Zeka Reklam Metin Yazarı (AI Copywriter)
              </h3>
            </div>
            <span className="badge badge-carousel">Dönüşüm Odaklı</span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Performans pazarlaması psikolojisi (AIDA ve PAS formülleri) kullanarak Google Ads ve Meta Ads için yüksek tıklama oranına (CTR) sahip reklam başlıkları, açıklamaları ve eylem çağrıları üretir.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                📏 Karakter Sınırı Uyumu
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Google Ads Başlık (30 karakter) ve Açıklama (90 karakter) sınırlarına harfi harfine uyar; kesilme veya taşma yapmaz.
              </p>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                🌍 Çok Dilli Doğal Metinler
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Hedef ülkeye göre Türkçe, İngilizce, Almanca, Rusça veya Arapça dillerinde akıcı, yerel pazara uygun metinler hazırlar.
              </p>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                🎯 Niyet Uyumlu Kancalar
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Fiyat odaklı reklam grupları için indirim kancaları, lokasyon grupları için yerellik kancaları üretir.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* MODULE 4: ROAS & PROFIT OPTIMIZER */}
      {(selectedCategory === 'ALL' || selectedCategory === 'ROAS') && matchesSearch('roas optimizasyon karlılık başabaş ciro bütçe simülasyon') && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(234,179,8,0.15)', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                4. ROAS & Karlılık Simülatörü (Roas Optimizer)
              </h3>
            </div>
            <span className="badge badge-carousel">Finansal Modelleme</span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Reklam harcamalarının başabaş noktasını (Break-Even ROAS), hedef kar marjını ve bütçe artışlarındaki marjinal getiri eğrisini hesaplar.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                ⚖️ Başabaş ROAS Formülü
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                <code>Break-Even ROAS = 1 / Kar Marjı (%)</code> formülüyle zarar etmeden harcanabilecek maksimum reklam payını bulur.
              </p>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                📈 Bütçe Ölçekleme Simülasyonu
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Bütçe 2x veya 5x yapıldığında artan rekabet ve azalan marjinal verim etkisiyle net karlılığın nasıl değişeceğini simüle eder.
              </p>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                💵 Hedef EBM / CPA Limitleri
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Karlılığı korumak için katlanılabilecek maksimum müşteri kazanım maliyetini (CPA) belirler.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* MODULE 5: API, SECURITY & DEPLOYMENT ARCHITECTURE */}
      {(selectedCategory === 'ALL' || selectedCategory === 'API_SECURITY') && matchesSearch('api güvenlik token oauth2 veritabanı sqlite deploy webhook') && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(14,165,233,0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Server size={16} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                5. API Entegrasyonları, Güvenlik & Dağıtım Altyapısı
              </h3>
            </div>
            <span className="badge badge-carousel">Sistem Mimarisi</span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Roasist Marketing Suite, kurumsal düzeyde güvenlik, yüksek hız ve güvenilirlik için modern bir mimariyle tasarlanmıştır.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
            
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                <Key size={14} color="#0ea5e9" /> Google Ads API & OAuth2
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Google Ads API v22 üzerinden Customer ID, Developer Token ve OAuth2 Refresh Token ile doğrudan Google veri merkezlerine bağlanır.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                <Sparkles size={14} color="#8b5cf6" /> Google Gemini Flash AI
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Gemini 2.5 Flash modeli ile sayfa metinlerini sıfır gecikmeyle analiz eder, sektörel terminolojiyi ve hedef kitleyi çıkarır.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                <Database size={14} color="#10b981" /> SQLite & Audit Logging
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Gereksiz API maliyetlerini önlemek için 24 saatlik akıllı anahtar kelime önbelleği tutar. Tüm kullanıcı işlemleri denetim günlüğüne kaydedilir.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                <Zap size={14} color="#f59e0b" /> Zero-Downtime Deploy
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Canlı sunucu webhook entegrasyonu ile GitHub üzerinden otomatik derleme, OPcache ve LiteSpeed önbellek temizleme gerçekleştirir.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* SSS / FAQ SECTION */}
      {(selectedCategory === 'ALL' || selectedCategory === 'FAQ') && matchesSearch('sss soru cevap yardım nasıl yapılır') && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(99,102,241,0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HelpCircle size={16} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Sıkça Sorulan Sorular & Operasyonel İpuçları
              </h3>
            </div>
            <span className="badge badge-carousel">SSS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-default)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {faq.q}
                    </span>
                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 1rem 0.85rem 1rem', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border-default)', paddingTop: '0.6rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
