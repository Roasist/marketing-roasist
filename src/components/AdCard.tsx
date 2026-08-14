import React, { useState } from 'react';
import { AdItem } from '../types/ad';
import { ExternalLink, Play, Calendar, Eye, Globe, Phone, Navigation, MoreVertical } from 'lucide-react';

interface AdCardProps {
  ad: AdItem;
  onInspect: (ad: AdItem) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, onInspect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const isWinner = ad.activeDaysCount >= 30;
  const isGoogle = ad.network === 'GOOGLE' || (ad.format as string) === 'SEARCH' || (ad.format as string) === 'SEARCH_IMAGE' || ad.platforms?.includes('google_search') || ad.platforms?.includes('youtube') || ad.platforms?.includes('google_display');

  // If it's a Google Ad, render the exact Google Ads Transparency Center layout from the screenshot!
  if (isGoogle) {
    const hasImages = (ad.mediaUrls && ad.mediaUrls.length > 0) || (ad.format as string) === 'SEARCH_IMAGE';

    const brandTitle = (ad as any).brandLogo || ad.pageName;
    const visUrl = (ad as any).visibleUrl || ad.domain || 'turkeyhouse.com';

    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(60,64,67,0.1)',
        fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}>
        {/* Main Google Ad Canvas */}
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          
          {/* Header Row: Sponsor Tag & Domain */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#e8f0fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '1px solid #d2e3fc',
              }}>
                <img
                  src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(visUrl)}&sz=64`}
                  alt="favicon"
                  style={{ width: '18px', height: '18px' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#202124', lineHeight: 1.2 }}>
                  {brandTitle}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#5f6368', lineHeight: 1.2 }}>
                  {visUrl}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#5f6368' }}>
              <span style={{ fontSize: '0.68rem', color: '#70757a', fontWeight: 500 }}>Gesponsert</span>
              <MoreVertical size={14} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {/* Photos Row (if multi-image search ad) */}
          {hasImages && ad.mediaUrls && ad.mediaUrls.length >= 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '0.2rem' }}>
              <img
                src={ad.mediaUrls[0]}
                alt="Ad creative 1"
                style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <img
                src={ad.mediaUrls[1]}
                alt="Ad creative 2"
                style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px' }}
              />
            </div>
          )}

          {/* Headline (Google Blue) */}
          <div
            onClick={() => onInspect(ad)}
            style={{
              fontSize: '1.05rem',
              fontWeight: 500,
              color: '#1a0dab',
              lineHeight: 1.35,
              cursor: 'pointer',
              textDecoration: 'none',
              marginTop: '0.2rem',
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            {ad.adHeadline}
          </div>

          {/* Body Snippet */}
          <p style={{
            fontSize: '0.825rem',
            color: '#4d5156',
            lineHeight: 1.45,
            margin: 0,
          }}>
            {ad.adBodyText}
          </p>

          {/* Google Action Buttons (Website, Call, Directions) */}
          {hasImages && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '0.4rem' }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                color: '#1a73e8',
                fontWeight: 500,
                cursor: 'pointer',
              }}>
                <Globe size={11} /> Website
              </button>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                color: '#1a73e8',
                fontWeight: 500,
                cursor: 'pointer',
              }}>
                <Phone size={11} /> Call
              </button>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                color: '#1a73e8',
                fontWeight: 500,
                cursor: 'pointer',
              }}>
                <Navigation size={11} /> Directions
              </button>
            </div>
          )}

        </div>

        {/* Card Footer with Legal Advertiser Name & Transparency Link */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e8eaed',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#3c4043' }}>
            {ad.pageName}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => onInspect(ad)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.7rem',
                color: '#3c4043',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Eye size={11} /> Detay
            </button>
            <a
              href={ad.googleTransparencyUrl || `https://adstransparency.google.com/?region=TR&domain=${encodeURIComponent(ad.domain || ad.pageName)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '0.7rem',
                color: '#1a73e8',
                textDecoration: 'none',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <ExternalLink size={11} /> Google Kütüphanesi
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for Meta Ads
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
