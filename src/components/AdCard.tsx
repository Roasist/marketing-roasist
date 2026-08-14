import React, { useState } from 'react';
import { AdItem } from '../types/ad';
import { ExternalLink, Play, Calendar, Eye } from 'lucide-react';

interface AdCardProps {
  ad: AdItem;
  onInspect: (ad: AdItem) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, onInspect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const isWinner = ad.activeDaysCount >= 30;

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      border: isWinner ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
    }}>
      
      {/* Card Header (Meta Sponsored Post Style) */}
      <div style={{
        padding: '0.85rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
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
          <div>
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
              src={ad.videoThumbnail || ad.mediaUrls[0]}
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
              Video
            </span>
          </div>
        ) : ad.format === 'CAROUSEL' ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={ad.mediaUrls[activeSlide] || ad.mediaUrls[0]}
              alt={ad.adHeadline}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span className="badge badge-carousel" style={{ position: 'absolute', bottom: '8px', left: '8px' }}>
              Carousel ({ad.mediaUrls.length})
            </span>
            {ad.mediaUrls.length > 1 && (
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
              src={ad.mediaUrls[0]}
              alt={ad.adHeadline}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span className="badge badge-image" style={{ position: 'absolute', bottom: '8px', left: '8px' }}>
              Görsel
            </span>
          </div>
        )}
      </div>

      {/* Ad Content & Body */}
      <div style={{ padding: '0.85rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        
        {/* Hook Label */}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Kanca: <strong style={{ color: 'var(--text-secondary)' }}>{ad.hookType}</strong>
        </div>

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
            CTA: <strong style={{ color: 'var(--text-secondary)' }}>{ad.adCta}</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => onInspect(ad)}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem' }}
            >
              <Eye size={12} /> Detay
            </button>
            <a
              href={ad.metaLibraryUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
              style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem' }}
            >
              <ExternalLink size={12} /> Meta
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
