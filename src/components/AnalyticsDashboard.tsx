import React from 'react';
import { AdItem, Competitor } from '../types/ad';
import { BarChart3, Trophy, Flame, Film, Image as ImageIcon, Layers } from 'lucide-react';

interface AnalyticsDashboardProps {
  ads: AdItem[];
  competitors: Competitor[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ ads, competitors }) => {
  const activeAds = ads.filter(a => a.activeStatus === 'ACTIVE');

  // Format Breakdown
  const videoCount = ads.filter(a => a.format === 'VIDEO').length;
  const imageCount = ads.filter(a => a.format === 'IMAGE').length;
  const carouselCount = ads.filter(a => a.format === 'CAROUSEL').length;
  const totalAds = ads.length || 1;

  const videoPct = Math.round((videoCount / totalAds) * 100);
  const imagePct = Math.round((imageCount / totalAds) * 100);
  const carouselPct = Math.round((carouselCount / totalAds) * 100);

  // Winner Ads (Longest running)
  const winnerAds = [...ads].sort((a, b) => b.activeDaysCount - a.activeDaysCount).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Stat Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
      }}>
        
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>Toplam Reklam Verisi</span>
            <BarChart3 size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ads.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {competitors.length} Markadan Çekilen Arşiv
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>Canlı Yayındaki Reklamlar</span>
            <Flame size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>{activeAds.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Aktif Bütçe Harcayanlar
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>Video Reklam Hakimiyeti</span>
            <Film size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>%{videoPct}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {videoCount} Adet Video Kreatifi
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>30+ Gün Kazanan Reklam</span>
            <Trophy size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning)' }}>
            {ads.filter(a => a.activeDaysCount >= 30).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Ölçeklenmiş Kampanyalar
          </div>
        </div>

      </div>

      {/* Grid: Format Distribution & Winner Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        
        {/* Format Distribution Panel */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Kreatif Format Dağılımı
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Rakiplerin en çok tercih ettiği kreatif format türleri
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Video Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  <Film size={14} /> Video Reklamlar
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>{videoCount} Adet (%{videoPct})</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${videoPct}%`, height: '100%', backgroundColor: 'var(--brand-primary)' }} />
              </div>
            </div>

            {/* Image Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  <ImageIcon size={14} /> Tek Görsel Reklamlar
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>{imageCount} Adet (%{imagePct})</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${imagePct}%`, height: '100%', backgroundColor: 'var(--info)' }} />
              </div>
            </div>

            {/* Carousel Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  <Layers size={14} /> Carousel (Kaydırmalı)
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>{carouselCount} Adet (%{carouselPct})</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${carouselPct}%`, height: '100%', backgroundColor: 'var(--warning)' }} />
              </div>
            </div>

          </div>
        </div>

        {/* Winner Leaderboard Panel */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            En Uzun Süre Yayında Kalan 5 "Winner" Reklam
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Pazarlamada en çok bütçe ayrılan ve ölçeklenen kampanyalar
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {winnerAds.map((ad, idx) => (
              <div key={ad.id} style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: idx === 0 ? '#f59e0b' : 'var(--border-strong)',
                    color: idx === 0 ? '#000000' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ad.pageName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ad.hookType}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-carousel" style={{ fontSize: '0.7rem' }}>
                    {ad.activeDaysCount} Gün
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
