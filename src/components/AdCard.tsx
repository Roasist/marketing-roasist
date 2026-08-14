import React, { useState } from 'react';
import { AdItem } from '../types/ad';
import { ExternalLink, Play, Calendar, Eye, Globe, FileText, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

interface AdCardProps {
  ad: AdItem;
  onInspect: (ad: AdItem) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, onInspect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const isWinner = ad.activeDaysCount >= 30;
  const isGoogle = ad.network === 'GOOGLE' || ad.format === 'SEARCH' || ad.platforms?.includes('google_search') || ad.platforms?.includes('youtube') || ad.platforms?.includes('google_display');

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
      
      {/* Card Header (Google Ads Transparency / Meta Header) */}
      <div style={{
        padding: '0.85rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isGoogle ? 'rgba(234, 67, 53, 0.03)' : 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {isGoogle ? (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: '#ea4335',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              flexShrink: 0,
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
              flexShrink: 0,
            }}>
              {ad.pageName.substring(0, 2).toUpperCase()}
            </div>
          )}
          
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ad.pageName}>
                {ad.pageName}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1px' }}>
              <span>{isGoogle ? 'Google Reklamı' : 'Sponsorlu'}</span>
              <span>•</span>
              <Calendar size={11} />
              <span>{new Date(ad.startDate).toLocaleDateString('tr-TR')} ({ad.activeDaysCount} gün)</span>
            </div>
          </div>
        </div>

        {/* Right Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {isGoogle ? (
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: '12px',
              backgroundColor: ad.format === 'SEARCH' ? '#e0f2fe' : (ad.format === 'VIDEO' ? '#fee2e2' : '#dcfce7'),
              color: ad.format === 'SEARCH' ? '#0369a1' : (ad.format === 'VIDEO' ? '#b91c1c' : '#15803d'),
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              {ad.format === 'SEARCH' ? <FileText size={10} /> : (ad.format === 'VIDEO' ? <VideoIcon size={10} /> : <ImageIcon size={10} />)}
              {ad.format === 'SEARCH' ? 'Metin' : (ad.format === 'VIDEO' ? 'Video' : 'Görsel')}
            </span>
          ) : null}

          {isWinner && (
            <span className="badge badge-carousel" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
              🔥 Winner
            </span>
          )}
        </div>
      </div>

      {/* Media / Creative Display (Authentic Google Search SERP or Image/Video) */}
      {ad.format === 'SEARCH' ? (
        /* Authentic Google Search Ad SERP Preview */
        <div style={{
          padding: '1.25rem 1.15rem',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem',
          minHeight: '175px',
        }}>
          {/* URL Row with Google Favicon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.72rem' }}>Sponsorlu</span>
            <span>•</span>
            <Globe size={12} color="#1a73e8" />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {ad.targetUrl || `https://${ad.domain || 'turkeyhouse.com'}`}
            </span>
          </div>

          {/* Blue Headline */}
          <div 
            onClick={() => onInspect(ad)}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#38bdf8',
              lineHeight: 1.35,
              cursor: 'pointer',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            {ad.adHeadline}
          </div>

          {/* Ad Snippet */}
          <p style={{
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            margin: 0,
          }}>
            {ad.adBodyText}
          </p>

          {/* Sitelinks Pills */}
          {ad.sitelinks && ad.sitelinks.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.35rem' }}>
              {ad.sitelinks.map((link, idx) => (
                <span key={idx} style={{
                  fontSize: '0.72rem',
                  color: '#38bdf8',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '3px 8px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                  {link}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Image / Video / Display Banner */
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
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
                {isGoogle ? 'Google GDN Banner' : 'Görsel'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Ad Content & Body for Meta / Non-Search */}
      {ad.format !== 'SEARCH' && (
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
      )}

      {/* Footer Bar */}
      <div style={{
        marginTop: 'auto',
        padding: '0.75rem 1rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface)',
      }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {isGoogle ? (
            <span>ID: <code style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>{ad.id}</code></span>
          ) : (
            <span>CTA: <strong style={{ color: 'var(--text-secondary)' }}>{ad.adCta || 'İncele'}</strong></span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => onInspect(ad)}
            className="btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
          >
            <Eye size={12} /> Detay
          </button>
          {isGoogle ? (
            <a
              href={ad.googleTransparencyUrl || `https://adstransparency.google.com/?region=TR&domain=${encodeURIComponent(ad.domain || ad.pageName)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', color: '#ea4335' }}
            >
              <ExternalLink size={12} /> Google Şeffaflık
            </a>
          ) : (
            <a
              href={ad.metaLibraryUrl || `https://www.facebook.com/ads/library/?id=${ad.id}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
            >
              <ExternalLink size={12} /> Meta Kütüphanesi
            </a>
          )}
        </div>
      </div>

    </div>
  );
};
