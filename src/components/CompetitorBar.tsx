import React, { useState } from 'react';
import { Competitor } from '../types/ad';
import { Plus, ExternalLink, Trash2, Search, X, Sparkles } from 'lucide-react';

interface CompetitorBarProps {
  competitors: Competitor[];
  selectedCompetitorId: string;
  onSelectCompetitor: (id: string) => void;
  onAddCompetitor: (inputUrlOrId: string) => void;
  onRemoveCompetitor: (id: string) => void;
}

export const CompetitorBar: React.FC<CompetitorBarProps> = ({
  competitors,
  selectedCompetitorId,
  onSelectCompetitor,
  onAddCompetitor,
  onRemoveCompetitor,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isAdding, setIsAdding] = useState(competitors.length === 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onAddCompetitor(inputVal.trim());
    setInputVal('');
    if (competitors.length > 0) {
      setIsAdding(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1rem 1.25rem' }}>
      
      {/* Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.85rem',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            İzlenen Markalar & Rakipler
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ({competitors.length} Marka)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a
            href="https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TR"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', textDecoration: 'none' }}
          >
            <ExternalLink size={12} /> Meta Reklam Kütüphanesi
          </a>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-primary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            {isAdding && competitors.length > 0 ? <X size={14} /> : <Plus size={14} />}
            {isAdding && competitors.length > 0 ? 'Kapat' : 'Yeni Rakip Ekle'}
          </button>
        </div>
      </div>

      {/* Add Competitor Input Form */}
      {isAdding && (
        <form 
          onSubmit={handleSubmit}
          style={{
            background: 'var(--bg-surface-elevated)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-default)',
            marginBottom: '1rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search 
              size={15} 
              color="var(--text-muted)" 
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Meta Sayfa Linki (örn: https://facebook.com/trendyol) veya Sayfa ID'si"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.1rem',
              }}
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            <Sparkles size={13} /> Ekle & Analiz Et
          </button>
        </form>
      )}

      {/* Competitor Pills Grid */}
      {competitors.length === 0 ? (
        <div style={{
          padding: '1.25rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border-default)',
          color: 'var(--text-secondary)',
          fontSize: '0.825rem',
        }}>
          Henüz takip edilen bir rakip eklenmedi. Yukarıdaki arama kutusuna rakip markanın Facebook sayfa linkini veya ID'sini yazarak ilk rakibinizi ekleyebilirsiniz.
        </div>
      ) : (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}>
          
          {/* ALL Selector */}
          <button
            onClick={() => onSelectCompetitor('ALL')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: selectedCompetitorId === 'ALL' 
                ? '1px solid var(--brand-primary)' 
                : '1px solid var(--border-default)',
              backgroundColor: selectedCompetitorId === 'ALL' 
                ? 'var(--bg-surface-elevated)' 
                : 'transparent',
              color: selectedCompetitorId === 'ALL' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: selectedCompetitorId === 'ALL' ? 600 : 400,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all var(--transition-fast)',
            }}
          >
            <span>Tüm Rakipler</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>Toplu</span>
          </button>

          {/* Individual Competitor Buttons */}
          {competitors.map((comp) => {
            const isSelected = selectedCompetitorId === comp.pageId || selectedCompetitorId === comp.id;
            return (
              <div
                key={comp.id}
                onClick={() => onSelectCompetitor(comp.pageId)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected 
                    ? '1px solid var(--brand-primary)' 
                    : '1px solid var(--border-default)',
                  backgroundColor: isSelected 
                    ? 'var(--bg-surface-elevated)' 
                    : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexShrink: 0,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.68rem',
                  color: 'var(--text-primary)',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}>
                  {comp.avatarUrl && comp.avatarUrl.startsWith('http') ? (
                    <img
                      src={comp.avatarUrl}
                      alt={comp.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  ) : (
                    comp.name.charAt(0).toUpperCase()
                  )}
                </div>

                <span style={{
                  fontSize: '0.825rem',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                }}>
                  {comp.name}
                </span>

                <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>
                  {comp.activeAdsCount}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '0.2rem' }}>
                  <a
                    href={comp.facebookPageUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="Meta Sayfası"
                    style={{ color: 'var(--text-muted)', display: 'flex', padding: '2px' }}
                  >
                    <ExternalLink size={12} />
                  </a>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCompetitor(comp.id);
                    }}
                    title="Kaldır"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      padding: '2px',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};
