import React from 'react';
import { AdItem } from '../types/ad';
import { X, ExternalLink, Calendar, DollarSign, Users, Sparkles } from 'lucide-react';

interface AdDetailModalProps {
  ad: AdItem | null;
  onClose: () => void;
}

export const AdDetailModal: React.FC<AdDetailModalProps> = ({ ad, onClose }) => {
  if (!ad) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              color: 'white',
            }}>
              {ad.pageName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{ad.pageName} - Reklam Detay Analizi</h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Meta Reklam ID: {ad.id}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Grid Body */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          {/* Left Column: Creative & Copy */}
          <div>
            <div style={{
              width: '100%',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              maxHeight: '320px',
              marginBottom: '1rem',
              border: '1px solid var(--border-glass)',
            }}>
              <img
                src={ad.mediaUrls[0]}
                alt={ad.adHeadline}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>REKLAM METNİ (COPY)</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>{ad.adHeadline}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {ad.adBodyText}
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
                <strong>CTA Butonu:</strong> <span style={{ color: 'var(--accent-purple)' }}>{ad.adCta}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Performance & Targeting Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Active Status Card */}
            <div style={{
              background: ad.activeStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(107, 114, 128, 0.08)',
              border: `1px solid ${ad.activeStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ad.activeStatus === 'ACTIVE' ? '#34d399' : '#9ca3af' }}>
                  {ad.activeStatus === 'ACTIVE' ? '🔥 HALEN AKTİF REKLAM' : '⏳ GEÇMİŞ KAMPANYA'}
                </span>
                <span className="badge badge-active">{ad.activeDaysCount} Gün Yayında</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} /> Yayın Süresi: {new Date(ad.startDate).toLocaleDateString('tr-TR')} - {ad.endDate ? new Date(ad.endDate).toLocaleDateString('tr-TR') : 'Halen Devam Ediyor'}
              </div>
            </div>

            {/* AI Strategy & Hook Breakdown */}
            <div style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <Sparkles size={16} /> AI Kanca & Pazarlama Açısı
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                Kanca Kategorisi: <span style={{ color: 'var(--accent-cyan)' }}>{ad.hookType}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {ad.activeDaysCount > 30 
                  ? '🎯 Bu reklam 30 günden uzun süredir aktif bütçe alıyor. Rakip firmanın en yüksek dönüşüm getiren "Winner Ad" kreatiflerinden biridir.' 
                  : '💡 Reklam kancası müşteri aciliyetine veya indirim vurgusuna odaklanıyor.'}
              </p>
            </div>

            {/* Spend & Impressions Estimates */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <DollarSign size={16} color="var(--accent-emerald)" /> Tahmini Harcama ve Erişim
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Tahmini Erişim:</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ad.estimatedImpressions || '500K - 1M'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Tahmini Bütçe:</div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{ad.spendRange || '₺25.000+'}</div>
                </div>
              </div>
            </div>

            {/* Target Demographics */}
            {ad.targetDemographics && (
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={16} color="var(--accent-cyan)" /> Hedef Kitle & Lokasyonlar
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div><strong>Yaş Aralığı:</strong> {ad.targetDemographics.ageRange}</div>
                  <div><strong>Cinsiyet Dağılımı:</strong> {ad.targetDemographics.genderRatio}</div>
                  <div><strong>Öncelikli Şehirler:</strong> {ad.targetDemographics.topLocations.join(', ')}</div>
                </div>
              </div>
            )}

            {/* External Link */}
            <a
              href={ad.metaLibraryUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ textAlign: 'center', justifyContent: 'center', padding: '0.75rem', marginTop: 'auto' }}
            >
              Meta Ad Library'de Orijinal Reklamı İncele <ExternalLink size={16} />
            </a>

          </div>

        </div>

      </div>
    </div>
  );
};
