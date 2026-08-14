import React, { useState } from 'react';
import { AdItem, Competitor } from '../types/ad';
import { Filter, ChevronRight, Film, Image as ImageIcon, Layers } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Panel */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Geçmiş Reklam Zaman Çizelgesi & Arşiv
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Rakiplerin geçmiş aylarda yayınladığı kampanyalar ve sezonluk stratejileri.
            </p>
          </div>

          {/* Competitor Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.825rem',
              }}
            >
              <option value="ALL">Tüm Markalar</option>
              {competitors.map(c => (
                <option key={c.id} value={c.pageId}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {monthKeys.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Bu filtreye uygun geçmiş reklam kaydı bulunamadı.
          </div>
        ) : (
          monthKeys.map((month) => {
            const monthAds = groupedByMonth[month];
            return (
              <div key={month} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {/* Month Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {month}
                  </div>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-default)' }} />
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    {monthAds.length} Reklam
                  </span>
                </div>

                {/* Ads in this month */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
                  {monthAds.map((ad) => (
                    <div
                      key={ad.id}
                      onClick={() => onSelectAd(ad)}
                      className="card"
                      style={{
                        padding: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#000000',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid var(--border-default)',
                      }}>
                        <img
                          src={ad.videoThumbnail || ad.mediaUrls[0]}
                          alt={ad.adHeadline}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-primary)' }}>{ad.pageName}</span>
                          <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}>
                            {ad.format === 'VIDEO' ? <Film size={9} /> : ad.format === 'CAROUSEL' ? <Layers size={9} /> : <ImageIcon size={9} />}
                            {ad.format}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ad.adHeadline}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {ad.activeDaysCount} gün yayında kaldı
                        </div>
                      </div>

                      <ChevronRight size={15} color="var(--text-muted)" />
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
