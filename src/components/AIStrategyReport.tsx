import React from 'react';
import { AdItem, Competitor } from '../types/ad';
import { ExportService } from '../services/exportService';
import { Printer, CheckCircle, Zap, Target } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedCompetitorId === 'ALL' ? 'Tüm Rakipler Strateji Özeti' : `${currentCompetitor?.name} Reklam Stratejisi Raporu`}
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Reklam kancaları, en çok bütçe alan teklifler ve kreatif dağılım analizleri.
            </p>
          </div>

          <button
            onClick={handlePrintPdf}
            className="btn-primary"
            style={{ fontSize: '0.825rem' }}
          >
            <Printer size={14} /> PDF / Rapor Çıktısı
          </button>
        </div>
      </div>

      {/* 3 Column Insights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        
        {/* Insight 1: Winner Offer Strategy */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <Zap size={16} color="var(--brand-primary)" />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              En Güçlü Reklam Açısı
            </div>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Rakibin 30 günden uzun süredir aktif olan kampanyalarında en sık kullandığı kanca açısı: <strong>"Problem-Çözüm & Aciliyet"</strong>. Bu strateji doğrudan kullanıcının yaşadığı sıkıntıya odaklanıp hızlı aksiyon sunuyor.
          </p>
        </div>

        {/* Insight 2: Format Strategy */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <Target size={16} color="var(--success)" />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Kreatif ve Format Analizi
            </div>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Kreatiflerin %60'ından fazlası ilk 3 saniyesinde dinamik kanca içeren dikey kısa videolardan (Reels/TikTok formatı) oluşuyor. Statik görseller ise sepette indirim duyurularında kullanılıyor.
          </p>
        </div>

        {/* Insight 3: Action Plan */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <CheckCircle size={16} color="var(--info)" />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Önerilen Aksiyon Planı
            </div>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Rakibin uzun süredir çalışan metin yapısını referans alarak kendi markanız için sosyal kanıt (Social Proof) ve garanti vurgusu içeren 3 yeni varyasyon oluşturmanız önerilir.
          </p>
        </div>

      </div>

      {/* Top 3 Winner Ads Showcase */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
          Örnek Alınabilecek En İyi 3 Kreatif
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          En yüksek etkileşim ve yayın süresine sahip kazanan kampanyalar
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {winnerAds.map((ad, idx) => (
            <div key={ad.id} style={{
              padding: '0.85rem',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>#{idx + 1} {ad.pageName}</span>
                <span className="badge badge-carousel" style={{ fontSize: '0.68rem' }}>{ad.activeDaysCount} Gün</span>
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-primary)' }}>{ad.adHeadline}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{ad.adBodyText.substring(0, 80)}...</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
