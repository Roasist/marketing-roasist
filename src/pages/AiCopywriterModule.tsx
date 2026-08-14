import React, { useState } from 'react';
import { Copy, CheckCircle2, Sparkles } from 'lucide-react';

export const AiCopywriterModule: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const sampleOutputs = [
    {
      hook: '🔥 Rakiplerinizin Reklam Harcamasını %40 Azaltan Gizli Strateji!',
      body: 'Meta Reklam Kütüphanesi verilerini anında analiz edin. Kazanan reklam açılarını keşfedip kendi kampanyalarınızda kullanmaya hemen başlayın.',
      cta: 'Şimdi Ücretsiz Deneyin',
      angle: 'Problem-Çözüm & Aciliyet',
    },
    {
      hook: '🎯 ROAS Değerinizi 3 Katına Çıkaracak Reklam Kancaları Burada',
      body: 'Trendyol, Hepsiburada ve global markaların en uzun süre yayında tuttuğu reklamları tek panelde görün. Bütçenizi boşa harcamayın.',
      cta: 'Demoyu İncele',
      angle: 'Sosyal Kanıt & Fiyat',
    },
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            AI Reklam Metni & Kanca Motoru
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Ürününüzü ve hedef kitlenizi girin; yapay zekâ yüksek dönüşüm getiren reklam kancaları hazırlasın.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Input Form */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Kampanya Bilgileri
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Ürün / Hizmet Adı
              </label>
              <input
                type="text"
                placeholder="Örn: Deri Erkek Ayakkabı, B2B SaaS"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Hedef Kitle & Sektör
              </label>
              <input
                type="text"
                placeholder="Örn: 25-45 yaş profesyoneller, E-ticaret yöneticileri"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: '0.5rem', justifyContent: 'center' }}
            >
              <Sparkles size={14} /> Metinleri Üret
            </button>
          </div>
        </div>

        {/* Generated Output */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Üretilen Reklam Kancaları & Metinler
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {sampleOutputs.map((item, idx) => (
              <div key={idx} style={{
                padding: '0.85rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{item.angle}</span>
                  <button
                    onClick={() => handleCopy(`${item.hook}\n\n${item.body}`, idx)}
                    className="btn-ghost"
                    style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                  >
                    {copiedIdx === idx ? <CheckCircle2 size={12} color="var(--success)" /> : <Copy size={12} />}
                    {copiedIdx === idx ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.hook}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
