import React, { useState } from 'react';
import { AdItem } from '../types/ad';
import { ExternalLink, Play, Calendar, Eye, Search, Image as ImageIcon, Video, Clock } from 'lucide-react';

interface AdCardProps {
  ad: AdItem;
  onInspect: (ad: AdItem) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, onInspect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const isWinner = ad.activeDaysCount >= 30;
  const isGoogle = ad.network === 'GOOGLE' || (ad.format as string) === 'SEARCH' || (ad.format as string) === 'SEARCH_IMAGE' || ad.platforms?.includes('google_search') || ad.platforms?.includes('youtube') || ad.platforms?.includes('google_display');

  // Authentic Google Ads Intelligence Card Layout (Option 2: No Fake Text)
  if (isGoogle) {
    const directGoogleUrl = ad.googleTransparencyUrl || `https://adstransparency.google.com/?region=TR&domain=${encodeURIComponent(ad.domain || ad.pageName)}`;
    const isSearch = ad.format === 'SEARCH';
    const isImage = ad.format === 'IMAGE';
    const brandName = (ad as any).brandLogo || ad.domain || ad.pageName;

    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: isWinner ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isWinner ? '0 4px 12px rgba(245, 158, 11, 0.08)' : '0 1px 3px rgba(0,0,0,0.05)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
      }}>
        {/* Top Accent Strip */}
        <div style={{
          height: '4px',
          background: isWinner 
            ? 'linear-gradient(90deg, #f59e0b, #ef4444)' 
            : 'linear-gradient(90deg, #4285f4, #34a853)',
        }} />

        {/* Card Header: Brand & Format Badge */}
        <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fcfdfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #dbeafe',
              overflow: 'hidden',
            }}>
              <img
                src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(ad.domain || 'google.com')}&sz=64`}
                alt="favicon"
                style={{ width: '18px', height: '18px' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                {brandName}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Google Reklamvereni
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {isWinner && (
              <span style={{
                fontSize: '0.68rem',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '2px 7px',
                borderRadius: '6px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                border: '1px solid #fde68a',
              }}>
                🔥 Winner ({ad.activeDaysCount} Gün)
              </span>
            )}
            <span style={{
              fontSize: '0.68rem',
              backgroundColor: ad.activeStatus === 'ACTIVE' ? '#ecfdf5' : '#f1f5f9',
              color: ad.activeStatus === 'ACTIVE' ? '#065f46' : '#475569',
              padding: '2px 7px',
              borderRadius: '6px',
              fontWeight: 600,
            }}>
              {ad.activeStatus === 'ACTIVE' ? '🟢 Aktif' : '⚪ Arşiv'}
            </span>
          </div>
        </div>

        {/* Card Body: Format & Duration Intelligence */}
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Format Indicator Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.6rem 0.75rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: isSearch ? '#e0f2fe' : isImage ? '#fef3c7' : '#fee2e2',
              color: isSearch ? '#0284c7' : isImage ? '#d97706' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {isSearch ? <Search size={14} /> : isImage ? <ImageIcon size={14} /> : <Video size={14} />}
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                {isSearch ? 'Google Arama (Search Reklamı)' : isImage ? 'Google Görüntülü (GDN Banner)' : 'YouTube / Responsive Video'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Kreatif ID: <span style={{ fontFamily: 'monospace', color: '#0284c7' }}>{ad.id}</span>
              </div>
            </div>
          </div>

          {/* Timeline & Duration Box (First Shown + Last Shown) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> İlk Yayın:
              </span>
              <strong style={{ color: '#1e293b' }}>
                {new Date(ad.startDate).toLocaleDateString('tr-TR')}
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Son Gösterim:
              </span>
              <strong style={{ color: '#1e293b' }}>
                {ad.lastSeenDate ? new Date(ad.lastSeenDate).toLocaleDateString('tr-TR') : 'Güncel / Aktif'}
              </strong>
            </div>

            <div style={{
              marginTop: '0.2rem',
              paddingTop: '0.45rem',
              borderTop: '1px dashed #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
            }}>
              <span style={{ color: '#64748b' }}>Toplam Yayın Süresi:</span>
              <span style={{
                color: isWinner ? '#b45309' : '#047857',
                fontWeight: 700,
                backgroundColor: isWinner ? '#fef3c7' : '#ecfdf5',
                padding: '1px 6px',
                borderRadius: '4px',
              }}>
                {ad.activeDaysCount} gün boyunca yayında
              </span>
            </div>
          </div>

          {/* Privacy Note */}
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4, textAlign: 'center' }}>
            🔒 Orijinal görsel ve metin Google Şeffaflık Merkezi üzerinden doğrulanır.
          </div>

        </div>

        {/* Card Footer with 1-Click Google Transparency Launcher */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ad.pageName}>
            {ad.pageName}
          </div>

          <a
            href={directGoogleUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.75rem',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <span>Google'da Aç</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  }

  // Meta Ads Card Layout (100% Real Facebook/Instagram Media & Text)
  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      borderRadius: 'var(--radius-md)',
      border: isWinner ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-surface)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Meta Header */}
      <div style={{
        padding: '0.85rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.75rem',
            color: 'var(--text-primary)',
            flexShrink: 0,
          }}>
            {ad.pageName.substring(0, 2).toUpperCase()}
          </div>
          
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {ad.pageName}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>Sponsorlu</span>
              <span>•</span>
              <Calendar size={11} />
              <span>{new Date(ad.startDate).toLocaleDateString('tr-TR')} ({ad.activeDaysCount} gün)</span>
            </div>
          </div>
        </div>

        {isWinner && (
          <span className="badge badge-carousel" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
            🔥 Winner
          </span>
        )}
      </div>

      {/* Meta Media Display */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        backgroundColor: '#0a0d14',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {ad.format === 'VIDEO' ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={ad.videoThumbnail || ad.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'}
              alt={ad.adHeadline}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.35)',
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <Play size={18} style={{ marginLeft: '2px' }} fill="#000000" />
              </div>
            </div>
            <span className="badge badge-video" style={{ position: 'absolute', bottom: '8px', left: '8px' }}>
              Video
            </span>
          </div>
        ) : ad.format === 'CAROUSEL' ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={ad.mediaUrls?.[activeSlide] || ad.mediaUrls?.[0]}
              alt={ad.adHeadline}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span className="badge badge-carousel" style={{ position: 'absolute', bottom: '8px', left: '8px' }}>
              Carousel ({ad.mediaUrls?.length || 1})
            </span>
            {ad.mediaUrls && ad.mediaUrls.length > 1 && (
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                {ad.mediaUrls.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: activeSlide === idx ? '#ffffff' : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={ad.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'}
              alt={ad.adHeadline}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span className="badge badge-image" style={{ position: 'absolute', bottom: '8px', left: '8px' }}>
              Görsel
            </span>
          </div>
        )}
      </div>

      {/* Meta Ad Body */}
      <div style={{ padding: '0.85rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Kanca / Strateji: <strong style={{ color: 'var(--text-secondary)' }}>{ad.hookType}</strong>
        </div>

        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {ad.adHeadline}
        </div>

        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
        }}>
          {isExpanded ? ad.adBodyText : `${ad.adBodyText.substring(0, 100)}${ad.adBodyText.length > 100 ? '...' : ''}`}
        </p>

        {ad.adBodyText.length > 100 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.72rem',
              fontWeight: 500,
              cursor: 'pointer',
              alignSelf: 'flex-start',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            {isExpanded ? 'Daha Az Göster' : 'Devamını Gör'}
          </button>
        )}
      </div>

      {/* Meta Footer */}
      <div style={{
        marginTop: 'auto',
        padding: '0.75rem 1rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          CTA: <strong style={{ color: 'var(--text-secondary)' }}>{ad.adCta || 'İncele'}</strong>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => onInspect(ad)}
            className="btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
          >
            <Eye size={12} /> Detay
          </button>
          <a
            href={ad.metaLibraryUrl || `https://www.facebook.com/ads/library/?id=${ad.id}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
          >
            <ExternalLink size={12} /> Meta Kütüphanesi
          </a>
        </div>
      </div>
    </div>
  );
};
