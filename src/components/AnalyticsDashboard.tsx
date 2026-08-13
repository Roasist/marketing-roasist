import React from 'react';
import { AdItem, Competitor } from '../types/ad';
import { BarChart3, PieChart, Trophy, Flame, Film, Image as ImageIcon, Layers } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Stat Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
      }}>
        
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOPLAM REKLAM VERİSİ</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={18} color="var(--accent-purple)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{ads.length} Adet</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {competitors.length} Markadan Çekilen Reklamlar
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>HALEN AKTİF REKLAMLAR</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={18} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>{activeAds.length} Adet</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Canlı Bütçe Alan Kampanyalar
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>EN UZUN YAYIN SÜRESİ</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={18} color="#fbbf24" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>
            {winnerAds[0]?.activeDaysCount || 0} Gün 🔥
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            En Başarılı "Winner Ad" Kampanyası
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DOMİNANT FORMAT</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Film size={18} color="var(--accent-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            %{Math.max(videoPct, imagePct, carouselPct)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {videoPct >= imagePct && videoPct >= carouselPct ? 'Video Formatlı Reklamlar' : 'Görsel Reklamlar'}
          </div>
        </div>

      </div>

      {/* Format Breakdown & Winner Ads Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Format Distribution Chart Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <PieChart size={20} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Reklam Formatı Oranları (Geçmiş & Güncel)</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Video Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                  <Film size={14} color="#fb7185" /> Video Reklamlar
                </span>
                <span style={{ fontWeight: 700 }}>{videoCount} Adet (%{videoPct})</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${videoPct}%`, height: '100%', background: 'linear-gradient(90deg, #f43f5e, #fb7185)', borderRadius: '5px' }} />
              </div>
            </div>

            {/* Image Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                  <ImageIcon size={14} color="#38bdf8" /> Statik Görsel Reklamlar
                </span>
                <span style={{ fontWeight: 700 }}>{imageCount} Adet (%{imagePct})</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${imagePct}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #38bdf8)', borderRadius: '5px' }} />
              </div>
            </div>

            {/* Carousel Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                  <Layers size={14} color="#fbbf24" /> Atlıkarınca / Carousel
                </span>
                <span style={{ fontWeight: 700 }}>{carouselCount} Adet (%{carouselPct})</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${carouselPct}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: '5px' }} />
              </div>
            </div>

          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '0.85rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}>
            💡 <strong>Analiz Notu:</strong> Rakipleriniz bütçelerinin ağırlıklı kısmını 
            <strong> {videoPct > imagePct ? 'Video' : 'Statik Görsel'}</strong> kreatiflerine yatırmaktadır.
          </div>
        </div>

        {/* Winner Ads Leaderboard Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Trophy size={20} color="#fbbf24" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>En Uzun Süre Yayında Kalanlar (Winner Ads)</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {winnerAds.map((ad, idx) => (
              <div
                key={ad.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : '#b45309',
                    color: 'black',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ad.adHeadline}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {ad.pageName} • {ad.hookType}
                    </div>
                  </div>
                </div>

                <span className="badge badge-active" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                  🔥 {ad.activeDaysCount} Gün
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
