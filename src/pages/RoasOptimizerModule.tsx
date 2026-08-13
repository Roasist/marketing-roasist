import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export const RoasOptimizerModule: React.FC = () => {
  const [adSpend, setAdSpend] = useState<number>(50000);
  const [revenue, setRevenue] = useState<number>(180000);
  const [costOfGoods, setCostOfGoods] = useState<number>(60000);

  const currentRoas = ((revenue / adSpend) || 0).toFixed(2);
  const netProfit = revenue - adSpend - costOfGoods;
  const breakEvenRoas = (revenue / (revenue - costOfGoods)).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(124, 58, 237, 0.1))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', marginBottom: '0.4rem' }}>
          <TrendingUp size={22} />
          <span style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            MODÜL: /roas-optimizer
          </span>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>ROAS & Kampanya Bütçe Simülatörü</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Reklam harcamalarınız, cironuz ve ürün maliyetlerinize göre gerçek karlılık (ROAS & Net Kar) simülasyonu yapın.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Input Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Bütçe & Ciro Girdileri</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Aylık Reklam Harcaması (₺)</label>
              <input
                type="number"
                value={adSpend}
                onChange={(e) => setAdSpend(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Elde Edilen Toplam Ciro (₺)</label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Ürün / Hizmet Maliyeti (COGS ₺)</label>
              <input
                type="number"
                value={costOfGoods}
                onChange={(e) => setCostOfGoods(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MEVCUT MEVZUAT ROAS</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fbbf24', margin: '0.25rem 0' }}>
              {currentRoas}x
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              1 ₺ Reklam Harcamasına Karşılık {currentRoas} ₺ Ciro
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>NET KAR / ZARAR</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: netProfit >= 0 ? '#34d399' : '#f43f5e', margin: '0.25rem 0' }}>
              ₺{netProfit.toLocaleString('tr-TR')}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Başabaş ROAS Noktanız: <strong>{breakEvenRoas}x</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
