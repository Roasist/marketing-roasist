import React, { useState } from 'react';
import { AdItem } from '../types/ad';
import { ExternalLink, Play, Calendar, Eye, Globe } from 'lucide-react';

interface AdCardProps {
  ad: AdItem;
  onInspect: (ad: AdItem) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, onInspect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const isWinner = ad.activeDaysCount >= 30;
  const isGoogle = ad.network === 'GOOGLE' || ad.format === 'SEARCH' || ad.platforms?.includes('google_search') || ad.platforms?.includes('youtube');

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      border: isWinner ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
    }}>
      
      {/* Card Header */}
      <div style={{
        padding: '0.85rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          {isGoogle ? (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
              color: '#ea4335',
            }}>
              G
            </div>
          ) : (
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
            }}>
              {ad.pageName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {ad.pageName}
              {isGoogle && (
                <span className="badge" style={{ fontSize: '0.65rem', backgroundColor: '#e8f0fe', color: '#1a73e8', padding: '1px 5px' }}>
                  Google Ads
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>Sponsorlu</span>
              <span>•</span>
              <Calendar size={11} />
              <span>{new Date(ad.startDate).toLocaleDateString('tr-TR')} ({ad.activeDaysCount} gün)</span>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        {isWinner ? (
          <span className="badge badge-carousel" style={{ fontSize: '0.68rem' }}>
            🔥 Winner ({ad.activeDaysCount}g)
          </span>
        ) : ad.activeStatus === 'ACTIVE' ? (
          <span className="badge badge-active" style={{ fontSize: '0.68rem' }}>
            Aktif
          </span>
        ) : (
          <span className="badge badge-inactive" style={{ fontSize: '0.68rem' }}>
            Pasif
          </span>
        )}
      </div>

      {/* Media Creative Display */}
      {ad.format === 'SEARCH' ? (
        /* Google Search Ad SERP Preview */
        <div style={{
          padding: '1.25rem 1rem',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          minHeight: '160px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Sponsorlu</span>
            <span>•</span>
            <Globe size={11} />
            <span>{ad.targetUrl || `https://${ad.domain || 'website.com'}`}</span>
          </div>

          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', lineHeight: 1.35, cursor: 'pointer' }}>
            {ad.adHeadline}
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
            {ad.adBodyText}
          </p>

          {ad.sitelinks && ad.sitelinks.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
              {ad.sitelinks.map((link, idx) => (
                <span key={idx} style={{
                  fontSize: '0.72rem',
                  color: '#38bdf8',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontWeight: 500,
                }}>
                  {link}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Image / Video / Carousel Display */
        <div style={{
          position: 'relative',
          width: '100%',
          height: '240px',
          backgroundColor: '#000000',
          overflow: 'hidden',
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
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                {isGoogle ? 'YouTube Video' : 'Video'}
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
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  display: 'flex',
                  gap: '4px',
                }}>
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
                {ad.format === 'DISPLAY' ? 'Google GDN Display' : 'Görsel'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Ad Content & Body */}
      <div style={{ padding: '0.85rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        
        {/* Hook Label */}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Kanca / Strateji: <strong style={{ color: 'var(--text-secondary)' }}>{ad.hookType}</strong>
        </div>

        {ad.format !== 'SEARCH' && (
          <>
            {/* Headline */}
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {ad.adHeadline}
            </div>

            {/* Ad Body Text */}
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
          </>
        )}

        {/* CTA & Platform Badges */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.65rem',
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
              style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem' }}
            >
              <Eye size={12} /> Detay
            </button>
            {isGoogle ? (
              <a
                href={ad.googleTransparencyUrl || `https://adstransparency.google.com/?region=TR&domain=${encodeURIComponent(ad.domain || ad.pageName)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
                style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', color: '#ea4335' }}
              >
                <ExternalLink size={12} /> Google
              </a>
            ) : (
              <a
                href={ad.metaLibraryUrl || `https://www.facebook.com/ads/library/?id=${ad.id}`}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
                style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem' }}
              >
                <ExternalLink size={12} /> Meta
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
