import React, { useState, useEffect, useRef } from 'react';
import { Competitor } from '../types/ad';
import { ApiService } from '../services/apiService';
import { 
  Plus, 
  ExternalLink, 
  Trash2, 
  Search, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';

interface CompetitorBarProps {
  competitors: Competitor[];
  selectedCompetitorId: string;
  onSelectCompetitor: (id: string) => void;
  onAddCompetitor: (inputUrlOrId: any) => void;
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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search query to Meta Graph API autocomplete
  useEffect(() => {
    if (!inputVal.trim() || inputVal.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await ApiService.searchAdvertisers(inputVal.trim());
        setSuggestions(results);
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [inputVal]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectAdvertiser = (adv: any) => {
    if (adv.isExactPhrase) {
      onAddCompetitor(adv.pageId);
    } else {
      onAddCompetitor({
        name: adv.name,
        pageId: adv.pageId || adv.id,
        facebookPageUrl: adv.facebookPageUrl,
        avatarUrl: adv.avatarUrl,
        category: adv.category
      });
    }
    setInputVal('');
    setShowDropdown(false);
    if (competitors.length > 0) {
      setIsAdding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onAddCompetitor(inputVal.trim());
    setInputVal('');
    setShowDropdown(false);
    if (competitors.length > 0) {
      setIsAdding(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1rem 1.25rem', overflow: 'visible' }}>
      
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
            onClick={() => {
              setIsAdding(!isAdding);
              setShowDropdown(false);
            }}
            className="btn-primary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            {isAdding && competitors.length > 0 ? <X size={14} /> : <Plus size={14} />}
            {isAdding && competitors.length > 0 ? 'Kapat' : 'Yeni Rakip Ekle'}
          </button>
        </div>
      </div>

      {/* Add Competitor Input Form with Live Meta Typeahead Dropdown */}
      {isAdding && (
        <div ref={containerRef} style={{ position: 'relative', marginBottom: '1rem', zIndex: 90 }}>
          <form 
            onSubmit={handleSubmit}
            style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
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
                placeholder="Marka adı (örn: 23 PROJECTS, Trendyol) veya Meta Sayfa linki yazın..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                style={{
                  width: '100%',
                  paddingLeft: '2.1rem',
                  paddingRight: isSearching ? '2.5rem' : '1rem',
                }}
                autoFocus
              />
              {isSearching && (
                <Loader2 
                  size={15} 
                  className="animate-spin" 
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }} 
                />
              )}
            </div>
            
            <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              <Sparkles size={14} /> Ekle & Analiz Et
            </button>
          </form>

          {/* Meta Live Typeahead Dropdown Menu */}
          {showDropdown && suggestions.length > 0 && (
            <div 
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
                maxHeight: '380px',
                overflowY: 'auto',
                zIndex: 100,
                padding: '0.4rem',
              }}
            >
              <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Meta Reklam Verenler & Markalar
              </div>

              {suggestions.map((adv, idx) => (
                <div
                  key={adv.id || idx}
                  onClick={() => handleSelectAdvertiser(adv)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    borderBottom: idx === suggestions.length - 2 ? '1px solid var(--border-default)' : 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Brand Avatar */}
                  {adv.isExactPhrase ? (
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--brand-primary)',
                      flexShrink: 0
                    }}>
                      <Search size={16} />
                    </div>
                  ) : adv.avatarUrl ? (
                    <img
                      src={adv.avatarUrl}
                      alt={adv.name}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid var(--border-default)',
                        flexShrink: 0
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      flexShrink: 0
                    }}>
                      {adv.name.charAt(0)}
                    </div>
                  )}

                  {/* Brand Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {adv.name}
                      </span>
                      {adv.verified && (
                        <CheckCircle2 size={13} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {adv.handle && (
                        <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>
                          {adv.handle}
                        </span>
                      )}
                      {adv.followers && (
                        <span>• {adv.followers.toLocaleString('tr-TR')} Takipçi</span>
                      )}
                      {adv.category && (
                        <span>• {adv.category}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Badge */}
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                    {adv.isExactPhrase ? 'Metin Ara' : 'Seç & İncele'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Competitors List Cards / Pills */}
      {competitors.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '1.25rem 1rem',
          color: 'var(--text-secondary)',
          fontSize: '0.825rem',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border-default)',
        }}>
          Henüz takip edilen bir rakip eklenmedi. Yukarıdaki arama kutusuna rakip markanın Facebook sayfa linkini veya ID'sini yazarak ilk rakibinizi ekleyebilirsiniz.
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}>
          
          {/* "All Competitors" Button */}
          <button
            onClick={() => onSelectCompetitor('ALL')}
            className={`btn-ghost ${selectedCompetitorId === 'ALL' ? 'active' : ''}`}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: selectedCompetitorId === 'ALL' ? 600 : 400,
              backgroundColor: selectedCompetitorId === 'ALL' ? 'var(--bg-surface-elevated)' : 'transparent',
              border: selectedCompetitorId === 'ALL' ? '1px solid var(--border-focus)' : '1px solid transparent',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Sparkles size={14} color="var(--brand-primary)" />
            Tüm Rakipler ({competitors.length})
          </button>

          {/* Individual Competitor Items */}
          {competitors.map((comp) => {
            const isSelected = selectedCompetitorId === comp.id || selectedCompetitorId === comp.pageId;
            return (
              <div
                key={comp.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.65rem 0.35rem 0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-focus)' : '1px solid var(--border-default)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => onSelectCompetitor(comp.pageId || comp.id)}
              >
                {comp.avatarUrl ? (
                  <img
                    src={comp.avatarUrl}
                    alt={comp.name}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {comp.name.charAt(0)}
                  </div>
                )}

                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}>
                  {comp.name}
                </span>

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
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '0.2rem',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};
