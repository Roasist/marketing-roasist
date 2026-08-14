import React from 'react';
import { AdItem } from '../types/ad';
import { X, ExternalLink, Tag } from 'lucide-react';

interface AdDetailModalProps {
  ad: AdItem | null;
  onClose: () => void;
}

export const AdDetailModal: React.FC<AdDetailModalProps> = ({ ad, onClose }) => {
  if (!ad) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
            }}>
              {ad.pageName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {ad.pageName} - Reklam Detay Raporu
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Meta ID: {ad.id}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          
          {/* Left Column: Media & Core Info */}
          <div>
            <div style={{
              width: '100%',
              height: '240px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              backgroundColor: '#000000',
              border: '1px solid var(--border-default)',
              marginBottom: '1rem',
            }}>
              <img
                src={ad.videoThumbnail || ad.mediaUrls[0]}
                alt={ad.adHeadline}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Format</span>
                <strong style={{ color: 'var(--text-primary)' }}>{ad.format}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Yayın Süresi</span>
                <strong style={{ color: 'var(--text-primary)' }}>{ad.activeDaysCount} Gün</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>CTA Aksiyonu</span>
                <strong style={{ color: 'var(--text-primary)' }}>{ad.adCta}</strong>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Reklam Başlığı
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {ad.adHeadline}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Reklam Metni (Copywriting)
              </div>
              <div style={{
                fontSize: '0.825rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                padding: '0.75rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                maxHeight: '140px',
                overflowY: 'auto',
                whiteSpace: 'pre-line',
              }}>
                {ad.adBodyText}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Kanca Stratejisi
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="badge badge-neutral">
                  <Tag size={11} /> {ad.hookType}
                </span>
                {ad.activeDaysCount >= 30 && (
                  <span className="badge badge-carousel">🔥 Kanıtlanmış Kazanan</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-default)', display: 'flex', gap: '0.5rem' }}>
              <a
                href={ad.metaLibraryUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Meta Reklam Kütüphanesinde İncele <ExternalLink size={14} />
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
