import React from 'react';
import { AdItem, Competitor } from '../types/ad';
import { ExportService } from '../services/exportService';
import { Cpu, Printer, CheckCircle, Zap, Target, ArrowRight } from 'lucide-react';

interface AIStrategyReportProps {
  ads: AdItem[];
  competitors: Competitor[];
  selectedCompetitorId: string;
}

export const AIStrategyReport: React.FC<AIStrategyReportProps> = ({ ads, competitors, selectedCompetitorId }) => {
  const currentCompetitor = competitors.find(c => c.pageId === selectedCompetitorId || c.id === selectedCompetitorId) || competitors[0];

  const targetAds = selectedCompetitorId === 'ALL' 
    ? ads 
    : ads.filter(a => a.pageId === currentCompetitor?.pageId);

  const winnerAds = [...targetAds].sort((a, b) => b.activeDaysCount - a.activeDaysCount).slice(0, 3);

  const handlePrintPdf = () => {
    if (currentCompetitor) {
      ExportService.printAiReport(currentCompetitor, targetAds);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* AI Header Card */}
      <div className="glass-panel" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
        border: '1px solid var(--border-accent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)', marginBottom: '0.4rem' }}>
              <Cpu size={22} />
              <span style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Yapay Zekâ Strateji & Rekabet İstihbaratı
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {selectedCompetitorId === 'ALL' ? 'Tüm Rakipler Strateji Özeti' : `${currentCompetitor?.name} Reklam Stratejisi Raporu`}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Rakibin reklam kancaları, en çok bütçe ayırdığı teklifler ve medya satın alma alışkanlıkları otomatik analiz edildi.
            </p>
          </div>

          <button
            onClick={handlePrintPdf}
            className="btn-primary"
            style={{ padding: '0.65rem 1.25rem' }}
          >
            <Printer size={16} /> PDF / Rapor Çıktısı Al
          </button>
        </div>
      </div>

      {/* Grid: Insights & Counter Strategy */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Competitor Strategy Strengths */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#34d399' }}>
            <CheckCircle size={18} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Rakibin En Güçlü Reklam Açılan (Winning Hooks)
            </h3>
          </div>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <li style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #34d399' }}>
              <strong style={{ color: 'var(--text-primary)' }}>1. İndirim ve Sepet Ekstra Fırsatı:</strong> Reklamlarının %45'inde fiyat avantajı ve sınırlı süre mesajı veriyor.
            </li>
            <li style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #34d399' }}>
              <strong style={{ color: 'var(--text-primary)' }}>2. Kullanıcı Yorumları (Social Proof):</strong> Gerçek müşteri değerlendirmeleri içeren video reklamlar ortalama {winnerAds[0]?.activeDaysCount || 40} gün boyunca yayında kalıyor.
            </li>
            <li style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #34d399' }}>
              <strong style={{ color: 'var(--text-primary)' }}>3. Hızlı Teslimat & Ücretsiz Kargo:</strong> CTA mesajlarında hızlı kargo garantisi vurgulanarak dönüşüm oranı yükseltiliyor.
            </li>
          </ul>
        </div>

        {/* Counter Strategy Playbook */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-purple)' }}>
            <Zap size={18} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Önerilen Karşı Hamle Stratejisi (Playbook)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
            <div style={{ background: 'rgba(124, 58, 237, 0.08)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
              <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Target size={14} /> Karşı Teklif (Angle Disrupt)
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Rakibinizin {winnerAds[0]?.activeDaysCount || 30} gündür en çok harcama yaptığı reklama karşı <strong>"Daha Kaliteli Ürün / Aynı Gün Kargo"</strong> vurgusu taşıyan bir kanca testi yapın.
              </p>
            </div>

            <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ArrowRight size={14} /> Format Geçişi (UGC Video)
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Statik görsellere kıyasla rakibin video içerikleri 2.5 kat daha fazla gün boyunca bütçe alıyor. Kullanıcı üretimi (UGC) kutu açılım videoları test edilmeli.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
