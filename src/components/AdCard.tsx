import React, { useState } from 'react';
import { AdItem } from '../types/ad';
import { Flame, History, ExternalLink, Play, Calendar, Eye, Tag } from 'lucide-react';

interface AdCardProps {
  ad: AdItem;
  onInspect: (ad: AdItem) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, onInspect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const isWinner = ad.activeDaysCount >= 30;

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      border: isWinner ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-glass)',
      transition: 'all 0.25s ease',
    }}>
      
      {/* Winner Ribbon if running for 30+ days */}
      {isWinner && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '-32px',
          transform: 'rotate(45deg)',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'black',
          fontWeight: 800,
          fontSize: '0.65rem',
          padding: '4px 35px',
          zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          letterSpacing: '0.05em',
        }}>
          KAZANAN REKLAM
        </div>
      )}

      {/* Card Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8rem',
            color: 'white',
          }}>
            {ad.pageName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ad.pageName}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={12} /> {new Date(ad.startDate).toLocaleDateString('tr-TR')}
            </div>
          </div>
        </div>

        {/* Active vs Inactive Badge */}
        {ad.activeStatus === 'ACTIVE' ? (
          <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
            <Flame size={12} /> Aktif ({ad.activeDaysCount} Gün)
          </span>
        ) : (
          <span className="badge badge-inactive" style={{ fontSize: '0.7rem' }}>
            <History size={12} /> Geçmiş ({ad.activeDaysCount} Gün Sürdü)
          </span>
        )}
      </div>

      {/* Media Creative Display */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        backgroundColor: '#000',
        overflow: 'hidden',
      }}>
        {ad.format === 'VIDEO' ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={ad.videoThumbnail || ad.mediaUrls[0]}
              alt={ad.adHeadline}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)',
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(124, 58, 237, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(124, 58, 237, 0.8)',
                cursor: 'pointer',
              }}>
                <Play size={22} color="white" style={{ marginLeft: '3px' }} />
              </div>
            </div>
            <span className="badge badge-video" style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
              🎥 Video Reklam
            </span>
          </div>
        ) : ad.format === 'CAROUSEL' ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={ad.mediaUrls[activeSlide] || ad.mediaUrls[0]}
              alt={ad.adHeadline}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span className="badge badge-carousel" style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
              🎠 Carousel ({ad.mediaUrls.length} Slayt)
            </span>
            {ad.mediaUrls.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                display: 'flex',
                gap: '4px',
              }}>
                {ad.mediaUrls.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: activeSlide === idx ? 'var(--accent-amber)' : 'rgba(255,255,255,0.4)',
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
            <span className="badge badge-image" style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
              🖼️ Görsel Reklam
            </span>
          </div>
        )}
      </div>

      {/* Ad Content & Body */}
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        
        {/* Hook Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--accent-purple)' }}>
          <Tag size={13} />
          <span style={{ fontWeight: 600 }}>Kanca Tipi:</span> {ad.hookType}
        </div>

        {/* Headline */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {ad.adHeadline}
        </h3>

        {/* Ad Body Text */}
        <p style={{
          fontSize: '0.825rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          whiteSpace: 'pre-line',
        }}>
          {isExpanded ? ad.adBodyText : `${ad.adBodyText.substring(0, 110)}${ad.adBodyText.length > 110 ? '...' : ''}`}
        </p>

        {ad.adBodyText.length > 110 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              alignSelf: 'flex-start',
              padding: 0,
            }}
          >
            {isExpanded ? 'Daha Az Göster' : 'Devamını Oku...'}
          </button>
        )}

        {/* CTA & Platform Badges */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            CTA: <strong style={{ color: 'var(--text-primary)' }}>{ad.adCta}</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onInspect(ad)}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            >
              <Eye size={13} /> İncele
            </button>
            <a
              href={ad.metaLibraryUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            >
              Meta'da Gör <ExternalLink size={12} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
