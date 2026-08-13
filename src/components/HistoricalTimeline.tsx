import React, { useState } from 'react';
import { AdItem, Competitor } from '../types/ad';
import { History, Filter, ChevronRight, Film, Image as ImageIcon, Layers } from 'lucide-react';

interface HistoricalTimelineProps {
  ads: AdItem[];
  competitors: Competitor[];
  onSelectAd: (ad: AdItem) => void;
}

export const HistoricalTimeline: React.FC<HistoricalTimelineProps> = ({ ads, competitors, onSelectAd }) => {
  const [selectedPageId, setSelectedPageId] = useState<string>('ALL');

  // Filter ads by competitor if selected
  const filteredAds = selectedPageId === 'ALL'
    ? ads
    : ads.filter(a => a.pageId === selectedPageId);

  // Group ads by Month (YYYY-MM)
  const groupedByMonth = filteredAds.reduce((acc, ad) => {
    const monthKey = new Date(ad.startDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(ad);
    return acc;
  }, {} as Record<string, AdItem[]>);

  const monthKeys = Object.keys(groupedByMonth);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)', marginBottom: '0.25rem' }}>
              <History size={20} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Zaman Çizelgesi & Arşiv
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Geçmişten Günümüze Reklam Stratejisi</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Rakiplerin geçmiş aylarda yayınladığı kampanyaları, format değişimlerini ve sezonluk stratejilerini inceleyin.
            </p>
          </div>

          {/* Competitor Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '0.55rem 1rem',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <option value="ALL">🌐 Tüm Rakiplerin Zaman Çizelgesi</option>
              {competitors.map(c => (
                <option key={c.id} value={c.pageId}>🏢 {c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px dashed var(--border-accent)' }}>
        
        {monthKeys.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Bu rakip için arşivlenmiş geçmiş reklam bulunamadı.
          </div>
        ) : (
          monthKeys.map((monthName) => {
            const monthAds = groupedByMonth[monthName];
            const activeCount = monthAds.filter(a => a.activeStatus === 'ACTIVE').length;
            const pastCount = monthAds.filter(a => a.activeStatus === 'INACTIVE').length;

            return (
              <div key={monthName} style={{ marginBottom: '2.5rem', position: 'relative' }}>
                
                {/* Timeline Dot */}
                <div style={{
                  position: 'absolute',
                  left: '-1.95rem',
                  top: '0px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                  border: '3px solid var(--bg-primary)',
                  boxShadow: '0 0 10px rgba(124, 58, 237, 0.6)',
                }} />

                {/* Month Title Card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }} className="gradient-text-purple">
                    📅 {monthName}
                  </h3>

                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <span className="badge badge-active">{activeCount} Aktif Reklam</span>
                    <span className="badge badge-inactive">{pastCount} Geçmiş Reklam</span>
                  </div>
                </div>

                {/* Month Ads Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                }}>
                  {monthAds.map((ad) => (
                    <div
                      key={ad.id}
                      onClick={() => onSelectAd(ad)}
                      className="glass-panel"
                      style={{
                        padding: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '0.85rem',
                        alignItems: 'center',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <img
                        src={ad.mediaUrls[0]}
                        alt={ad.adHeadline}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: '1px solid var(--border-glass)',
                        }}
                      />

                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            {ad.pageName}
                          </span>
                          {ad.activeStatus === 'ACTIVE' ? (
                            <span style={{ color: '#34d399', fontSize: '0.65rem' }}>• Aktif</span>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '0.65rem' }}>• Geçmiş</span>
                          )}
                        </div>

                        <div style={{
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '4px',
                        }}>
                          {ad.adHeadline}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {ad.format === 'VIDEO' && <Film size={11} />}
                            {ad.format === 'IMAGE' && <ImageIcon size={11} />}
                            {ad.format === 'CAROUSEL' && <Layers size={11} />}
                            {ad.format}
                          </span>
                          <span>• {ad.activeDaysCount} Gün Yayında</span>
                        </div>
                      </div>

                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>

              </div>
            );
          })
        )}

      </div>
    </div>
  );
};
