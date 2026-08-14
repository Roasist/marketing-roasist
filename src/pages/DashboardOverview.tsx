import React from 'react';
import { MarketingRoute } from '../types/suite';
import { Competitor, AdItem } from '../types/ad';
import { Target, PenTool, Sliders, ArrowRight, Users, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

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
  const winnerAds = ads.filter(a => a.activeDaysCount >= 30);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Genel Bakış & Metrikler
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Pazarlama ekosisteminiz, rakip analizleriniz ve aktif reklam istihbaratınız.
          </p>
        </div>

        <button
          onClick={() => onNavigate('competitors')}
          className="btn-primary"
          style={{ fontSize: '0.85rem' }}
        >
          <Target size={15} /> Rakipleri İncele <ArrowRight size={14} />
        </button>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        
        {/* Metric 1 */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>Takip Edilen Rakipler</span>
            <Users size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {competitors.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#10b981', marginTop: '0.35rem' }}>
            <CheckCircle2 size={13} />
            <span>Tüm markalar senkronize</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>Aktif Bütçe Alan Reklamlar</span>
            <TrendingUp size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {activeAds.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Meta Ad Library canlı yayınları
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>30+ Gün Çalışan "Winner" Reklamlar</span>
            <Target size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.5rem' }}>
            {winnerAds.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Yüksek ROAS sağlayan kanıtlanmış kreatifler
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>Arşivlenen Reklam Verisi</span>
            <Layers size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {ads.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Geçmiş kampanya veritabanı
          </div>
        </div>

      </div>

      {/* Modules Section */}
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
          Pazarlama İstihbarat Modülleri
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          
          {/* Module 1: Competitors */}
          <div
            onClick={() => onNavigate('competitors')}
            className="card"
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={18} color="var(--text-primary)" />
                </div>
                <span className="badge badge-active">Aktif</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                Rakip Reklam İstihbaratı
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Meta Ad Library üzerinden rakiplerinizin aktif reklamlarını, kanca açılarını, geçmiş kampanya akışlarını ve kaydedilen notlarınızı yönetin.
              </p>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.825rem' }}>
              Modülü Aç <ArrowRight size={13} />
            </div>
          </div>

          {/* Module 2: AI Copywriter */}
          <div
            onClick={() => onNavigate('ai-copywriter')}
            className="card"
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PenTool size={18} color="var(--text-primary)" />
                </div>
                <span className="badge badge-neutral">Beta</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                AI Reklam Metni & Kanca Motoru
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Rakiplerin en çok dönüşüm getiren açılarını analiz ederek markanıza özel yüksek CTR'lı kancalar ve metin varyasyonları üretin.
              </p>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.825rem' }}>
              Önizlemeyi Başlat <ArrowRight size={13} />
            </div>
          </div>

          {/* Module 3: Admin & Users */}
          <div
            onClick={() => onNavigate('admin')}
            className="card"
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sliders size={18} color="var(--text-primary)" />
                </div>
                <span className="badge badge-neutral">Yönetici</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                Kullanıcı & Sistem Yönetimi
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Ekip üyelerine erişim yetkisi verin, API anahtarlarını yapılandırın ve denetim loglarını inceleyin.
              </p>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.825rem' }}>
              Ayarları Yönet <ArrowRight size={13} />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
