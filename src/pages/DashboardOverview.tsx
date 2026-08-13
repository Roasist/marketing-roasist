import React from 'react';
import { MarketingRoute } from '../types/suite';
import { Competitor, AdItem } from '../types/ad';
import { Target, PenTool, Sliders, ArrowRight, Flame, Sparkles, Building2, BarChart2 } from 'lucide-react';

interface DashboardOverviewProps {
  competitors: Competitor[];
  ads: AdItem[];
  onNavigate: (route: MarketingRoute) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  competitors,
  ads,
  onNavigate,
}) => {
  const activeAds = ads.filter(a => a.activeStatus === 'ACTIVE');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.18) 0%, rgba(6, 182, 212, 0.12) 100%)',
        border: '1px solid var(--border-accent)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '750px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(124, 58, 237, 0.4)', color: '#c084fc', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.85rem' }}>
            <Sparkles size={14} /> Roasist AI Marketing Platform
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.2 }}>
            Hoş Geldiniz! Pazarlama Performansınızı Yapay Zekâ ile Yönetin
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            `marketing.roasist.com` platformu rakiplerinizin reklam kütüphanelerini takip etmenizi, en çok dönüşüm getiren "Winner" reklamları tespit etmenizi ve AI strateji raporları oluşturmanızı sağlar.
          </p>

          <button
            onClick={() => onNavigate('competitors')}
            className="btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          >
            <Target size={18} /> Rakip Reklam İstihbaratına Git (`/competitors`) <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TAKİP EDİLEN RAKİPLER</span>
            <Building2 size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{competitors.length} Marka</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Trendyol, Hepsiburada, Nike vb.
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CANLI TAKİP EDİLEN REKLAM</span>
            <Flame size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>{activeAds.length} Aktif Reklam</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Bütçe Alan Kampanyalar
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ARŞİVDEKİ REKLAMLAR</span>
            <BarChart2 size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{ads.length} Adet</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Geçmiş & Güncel Reklam Arşivi
          </div>
        </div>

      </div>

      {/* Module Shortcuts Grid */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
          Pazarlama Araçları & Modüller
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          
          {/* Competitor Ads Module Card */}
          <div
            onClick={() => onNavigate('competitors')}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid var(--border-accent)',
              transition: 'all 0.25s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={22} color="var(--accent-purple)" />
                </div>
                <span className="badge badge-active">Aktif Modül</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                Rakip Reklam İstihbaratı (`/competitors`)
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Meta Reklam Kütüphanesi üzerinden rakiplerinizin aktif ve geçmiş reklamlarını, kanca açılarını ve en uzun bütçe alan "Winner" kreatiflerini analiz edin.
              </p>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.85rem' }}>
              Modülü Başlat <ArrowRight size={14} />
            </div>
          </div>

          {/* AI Copywriter Card */}
          <div
            onClick={() => onNavigate('ai-copywriter')}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: 0.9,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PenTool size={22} color="var(--accent-cyan)" />
                </div>
                <span className="badge badge-carousel">Yakında</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                AI Reklam Metni & Kanca Üretici (`/ai-copywriter`)
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Yapay zekâ desteğiyle sektörünüze uygun, yüksek CTR ve dönüşüm oranı getiren reklam metinleri ve açılış kancaları oluşturun.
              </p>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.85rem' }}>
              Önizlemeyi İncele <ArrowRight size={14} />
            </div>
          </div>

          {/* Admin Panel Card */}
          <div
            onClick={() => onNavigate('admin')}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sliders size={22} color="#fbbf24" />
                </div>
                <span className="badge badge-active">Admin</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                Admin Yönetim Paneli (`/admin`)
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Meta API Token yönetimi, modül açma/kapama (Feature Flags), kullanım kotaları ve sistem güvenlik günlüklerini yönetin.
              </p>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>
              Admin Panele Git <ArrowRight size={14} />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
