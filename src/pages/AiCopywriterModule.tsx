import React, { useState } from 'react';
import { PenTool, Sparkles, Copy, CheckCircle2 } from 'lucide-react';

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
      body: 'Trendyol, Hepsiburada ve global markaların en uzun süre yayında tuttuğu reklamları tek paneller görün. Bütçenizi boşa harcamayın.',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(124, 58, 237, 0.1))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
          <PenTool size={22} />
          <span style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            MODÜL: /ai-copywriter
          </span>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>AI Reklam Metni & Kanca Üretici</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Ürününüzü ve hedef kitlenizi girin; yapay zekâ yüksek dönüşüm sağlayan reklam metinleri ve kancaları hazırlasın.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Form */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Ürün & Hedef Kitle Bilgisi</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Ürün / Hizmet Adı</label>
              <input
                type="text"
                placeholder="Örn: Deri Erkek Ayakkabı, SaaS Yazılımı"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Hedef Kitle & Özellikler</label>
              <input
                type="text"
                placeholder="Örn: 25-45 yaş dijital pazarlamacılar"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none' }}
              />
            </div>
            <button className="btn-primary" style={{ padding: '0.75rem' }}>
              <Sparkles size={16} /> AI Reklam Metinlerini Oluştur
            </button>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Üretilen Reklam Kancaları (Örnek)</h3>
          {sampleOutputs.map((item, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-active">{item.angle}</span>
                <button
                  onClick={() => handleCopy(`${item.hook}\n\n${item.body}`, idx)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
                >
                  {copiedIdx === idx ? <CheckCircle2 size={14} color="#34d399" /> : <Copy size={14} />} Kopyala
                </button>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' }}>{item.hook}</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
