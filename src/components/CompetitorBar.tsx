import React, { useState } from 'react';
import { Competitor } from '../types/ad';
import { Plus, Building2, ExternalLink, Trash2, CheckCircle2, Search } from 'lucide-react';

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
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onAddCompetitor(inputVal.trim());
    setInputVal('');
    setIsAdding(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={20} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Takip Edilen Rakipler (Meta Sayfaları)
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            ({competitors.length} Marka Ekli)
          </span>
        </div>

        {/* Action button to open add modal/form */}
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
        >
          <Plus size={16} /> {isAdding ? 'Kapat' : 'Yeni Rakip Meta Linki / ID Ekle'}
        </button>
      </div>

      {/* Add Competitor Input Form */}
      {isAdding && (
        <form 
          onSubmit={handleSubmit}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-accent)',
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search 
              size={18} 
              color="var(--text-muted)" 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Örn: https://www.facebook.com/trendyol veya Sayfa ID: 10382959102"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            <CheckCircle2 size={16} /> Ekle & Reklamları Çek
          </button>
        </form>
      )}

      {/* Competitors List Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '0.85rem',
      }}>
        
        {/* ALL Competitors Selector Card */}
        <div
          onClick={() => onSelectCompetitor('ALL')}
          style={{
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: selectedCompetitorId === 'ALL' 
              ? '2px solid var(--accent-purple)' 
              : '1px solid var(--border-glass)',
            background: selectedCompetitorId === 'ALL' 
              ? 'rgba(124, 58, 237, 0.12)' 
              : 'rgba(255, 255, 255, 0.02)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'var(--transition-fast)',
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.9rem',
            color: 'white',
          }}>
            TÜM
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Tüm Rakipler</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Toplu Analiz Modu
            </div>
          </div>
        </div>

        {/* Individual Competitor Cards */}
        {competitors.map((comp) => {
          const isSelected = selectedCompetitorId === comp.pageId || selectedCompetitorId === comp.id;
          return (
            <div
              key={comp.id}
              onClick={() => onSelectCompetitor(comp.pageId)}
              style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: isSelected 
                  ? '2px solid var(--accent-purple)' 
                  : '1px solid var(--border-glass)',
                background: isSelected 
                  ? 'rgba(124, 58, 237, 0.15)' 
                  : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'var(--transition-fast)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                <img
                  src={comp.avatarUrl}
                  alt={comp.name}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    border: '1px solid var(--border-glass)',
                  }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {comp.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem' }}>
                    <span className="badge badge-active" style={{ padding: '0.1rem 0.4rem' }}>
                      {comp.activeAdsCount} Aktif Reklam
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <a
                  href={comp.facebookPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Meta Sayfasına Git"
                  style={{ color: 'var(--text-muted)', display: 'flex', padding: '4px' }}
                >
                  <ExternalLink size={14} />
                </a>
                {competitors.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCompetitor(comp.id);
                    }}
                    title="Rakibi Kaldır"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      padding: '4px',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};
