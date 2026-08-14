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
  Loader2,
  Globe
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
  const [metaSuggestions, setMetaSuggestions] = useState<any[]>([]);
  const [googleSuggestions, setGoogleSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search query to both Google Ads Transparency & Meta Graph API autocomplete
  useEffect(() => {
    if (!inputVal.trim() || inputVal.trim().length < 2) {
      setMetaSuggestions([]);
      setGoogleSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [googleRes, metaRes] = await Promise.allSettled([
          ApiService.searchGoogleAdvertisers(inputVal.trim()),
          ApiService.searchAdvertisers(inputVal.trim())
        ]);

        const gList = googleRes.status === 'fulfilled' ? googleRes.value : [];
        const mList = metaRes.status === 'fulfilled' ? metaRes.value : [];

        setGoogleSuggestions(gList);
        setMetaSuggestions(mList);
        setShowDropdown(gList.length > 0 || mList.length > 0);
      } catch {
        setGoogleSuggestions([]);
        setMetaSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

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

  const handleSelectGoogleAdvertiser = (adv: any) => {
    onAddCompetitor({
      name: adv.name,
      pageId: adv.domain || adv.advertiserId || adv.id,
      domain: adv.domain || adv.name,
      network: 'GOOGLE',
      category: adv.category || 'Google Ads',
      avatarUrl: adv.avatarUrl || "https://www.google.com/s2/favicons?domain=" + (adv.domain || adv.name) + "&sz=128",
      googleTransparencyUrl: adv.googleTransparencyUrl
    });
    setInputVal('');
    setShowDropdown(false);
    if (competitors.length > 0) {
      setIsAdding(false);
    }
  };

  const handleSelectMetaAdvertiser = (adv: any) => {
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

  const hasSuggestions = googleSuggestions.length > 0 || metaSuggestions.length > 0;

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
            href="https://adstransparency.google.com/?region=TR"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', textDecoration: 'none', color: '#ea4335' }}
          >
            <ExternalLink size={12} /> Google Reklam Şeffaflığı
          </a>

          <a
            href="https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TR"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', textDecoration: 'none' }}
          >
            <ExternalLink size={12} /> Meta Kütüphanesi
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

      {/* Add Competitor Input Form with Live Google & Meta Autocomplete Dropdown */}
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
                placeholder="Google web sitesi (örn: 23projects.net, trendyol.com) veya Meta marka adı yazın..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onFocus={() => { if (hasSuggestions) setShowDropdown(true); }}
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

          {/* Omnichannel Autocomplete Dropdown */}
          {showDropdown && hasSuggestions && (
            <div 
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 14px 35px rgba(0, 0, 0, 0.3)',
                maxHeight: '420px',
                overflowY: 'auto',
                zIndex: 100,
                padding: '0.4rem',
              }}
            >
              {/* Google Ads Suggestions Section */}
              {googleSuggestions.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{
                    padding: '0.4rem 0.65rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#ea4335',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    <span>🔴 Google Reklamverenleri & Web Siteleri (Google Ads Transparency)</span>
                  </div>

                  {googleSuggestions.map((gAdv, idx) => (
                    <div
                      key={gAdv.id || idx}
                      onClick={() => handleSelectGoogleAdvertiser(gAdv)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
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
                        flexShrink: 0,
                      }}>
                        <Globe size={16} color="#ea4335" />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {gAdv.name}
                          </span>
                          {gAdv.country && (
                            <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '1px 4px' }}>
                              {gAdv.country}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                          {gAdv.type === 'DOMAIN' ? 'Web Sitesi / Domain' : 'Google Doğrulanmış Reklamveren'}
                        </div>
                      </div>

                      <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                        Google Ads
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Meta Suggestions Section */}
              {metaSuggestions.length > 0 && (
                <div>
                  <div style={{
                    padding: '0.4rem 0.65rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderTop: googleSuggestions.length > 0 ? '1px solid var(--border-default)' : 'none',
                    paddingTop: googleSuggestions.length > 0 ? '0.6rem' : '0.4rem',
                  }}>
                    <span>🔵 Meta (Facebook & Instagram) Reklam Verenleri</span>
                  </div>

                  {metaSuggestions.map((mAdv, idx) => (
                    <div
                      key={mAdv.id || idx}
                      onClick={() => handleSelectMetaAdvertiser(mAdv)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {mAdv.isExactPhrase ? (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--brand-primary)',
                          flexShrink: 0
                        }}>
                          <Search size={14} />
                        </div>
                      ) : mAdv.avatarUrl ? (
                        <img
                          src={mAdv.avatarUrl}
                          alt={mAdv.name}
                          style={{
                            width: '32px',
                            height: '32px',
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
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--brand-primary)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          flexShrink: 0
                        }}>
                          {mAdv.name.charAt(0)}
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {mAdv.name}
                          </span>
                          {mAdv.verified && (
                            <CheckCircle2 size={13} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                          {mAdv.handle || mAdv.category || 'Meta Reklamveren'}
                        </div>
                      </div>

                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        {mAdv.isExactPhrase ? 'Metin Ara' : 'Meta Ads'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
          Henüz takip edilen bir rakip eklenmedi. Yukarıdaki arama kutusuna rakip markanın web sitesini (örn: <strong>23projects.net</strong> veya <strong>trendyol.com</strong>) yazarak anında analiz edebilirsiniz.
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
