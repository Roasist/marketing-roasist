import React, { useState } from 'react';

export const RoasOptimizerModule: React.FC = () => {
  const [adSpend, setAdSpend] = useState<number>(50000);
  const [revenue, setRevenue] = useState<number>(180000);
  const [costOfGoods, setCostOfGoods] = useState<number>(60000);

  const currentRoas = ((revenue / adSpend) || 0).toFixed(2);
  const netProfit = revenue - adSpend - costOfGoods;
  const breakEvenRoas = (revenue / Math.max(1, (revenue - costOfGoods))).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            ROAS & Kampanya Bütçe Simülatörü
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Reklam harcamalarınız, cironuz ve ürün maliyetlerinize göre gerçek karlılık (ROAS & Net Kâr) analizi.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Input Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Bütçe & Ciro Değişkenleri
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Aylık Reklam Harcaması (₺)
              </label>
              <input
                type="number"
                value={adSpend}
                onChange={(e) => setAdSpend(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Elde Edilen Toplam Ciro (₺)
              </label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Ürün / Hizmet Maliyeti (COGS ₺)
              </label>
              <input
                type="number"
                value={costOfGoods}
                onChange={(e) => setCostOfGoods(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Karlılık & ROAS Metrikleri
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mevcut ROAS Değeri</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--brand-primary)', marginTop: '2px' }}>
                {currentRoas}x
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Her 1₺ reklam harcaması için {currentRoas}₺ ciro
              </div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Kâr (Vergi Öncesi)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '2px' }}>
                ₺{netProfit.toLocaleString('tr-TR')}
              </div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Başabaş (Break-even) ROAS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {breakEvenRoas}x
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Zarar etmemek için minimum gereken ROAS oranı
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
