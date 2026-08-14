import React, { useState, useEffect } from 'react';
import { Competitor, AdItem, FilterState, MetaApiConfig } from '../types/ad';
import { SavedAdItem } from '../types/auth';
import { ApiService } from '../services/apiService';
import { INITIAL_ADS } from '../services/mockData';

import { CompetitorBar } from '../components/CompetitorBar';
import { AdFilters } from '../components/AdFilters';
import { AdCard } from '../components/AdCard';
import { AdDetailModal } from '../components/AdDetailModal';
import { HistoricalTimeline } from '../components/HistoricalTimeline';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { AIStrategyReport } from '../components/AIStrategyReport';
import { 
  Flame, 
  History, 
  BarChart3, 
  BrainCircuit, 
  Download, 
  Bookmark, 
  Trash2, 
  Tag
} from 'lucide-react';

interface CompetitorsModuleProps {
  competitors: Competitor[];
  ads: AdItem[];
  metaConfig: MetaApiConfig;
  onAddCompetitor: (urlOrId: string) => void;
  onRemoveCompetitor: (id: string) => void;
  onExportCsv: () => void;
}

export const CompetitorsModule: React.FC<CompetitorsModuleProps> = ({
  competitors: initialCompetitors,
  ads: initialAds,
  metaConfig: _metaConfig,
  onAddCompetitor,
  onRemoveCompetitor,
  onExportCsv,
}) => {
  const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors);
  const [ads] = useState<AdItem[]>(initialAds.length > 0 ? initialAds : INITIAL_ADS);
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'timeline' | 'analytics' | 'ai-strategy' | 'saved-ads'>('feed');
  const [selectedAdForModal, setSelectedAdForModal] = useState<AdItem | null>(null);

  // Saved Ads state
  const [savedAds, setSavedAds] = useState<SavedAdItem[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    competitorId: 'ALL',
    status: 'ALL',
    format: 'ALL',
    platform: 'ALL',
    searchKeyword: '',
    sortBy: 'NEWEST',
  });

  // Load database competitors and saved ads
  const loadDatabaseData = async () => {
    try {
      const dbComps = await ApiService.getCompetitors();
      if (dbComps.length > 0) {
        setCompetitors(dbComps);
      }
      const dbSaved = await ApiService.getSavedAds();
      setSavedAds(dbSaved);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const handleAddComp = async (urlOrId: string) => {
    try {
      const newComp = await ApiService.addCompetitor(urlOrId);
      setCompetitors(prev => [...prev, newComp]);
      onAddCompetitor(urlOrId);
    } catch {
      onAddCompetitor(urlOrId);
    }
  };

  const handleRemoveComp = async (id: string) => {
    if (!window.confirm('Bu rakibi kaldırmak istediğinize emin misiniz?')) return;
    try {
      await ApiService.deleteCompetitor(id);
      setCompetitors(prev => prev.filter(c => c.id !== id && c.pageId !== id));
      onRemoveCompetitor(id);
    } catch {
      onRemoveCompetitor(id);
    }
  };

  const handleSaveAd = async (ad: AdItem) => {
    const userNote = window.prompt('Bu reklam için özel bir strateji notu eklemek ister misiniz? (İsteğe bağlı):', '');
    try {
      await ApiService.saveAd(ad, userNote || '', ad.activeDaysCount >= 30 ? 'Winner Reklam' : 'Favori');
      setSaveSuccessMsg('Reklam "Kaydedilenler & Notlarım" bölümüne eklendi!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      loadDatabaseData();
    } catch (err: any) {
      alert('Kayıt hatası: ' + err.message);
    }
  };

  const handleDeleteSavedAd = async (id: string) => {
    if (!window.confirm('Bu kaydedilen reklamı silmek istediğinize emin misiniz?')) return;
    try {
      await ApiService.deleteSavedAd(id);
      setSavedAds(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert('Silme hatası: ' + err.message);
    }
  };

  // Filter Ads
  const filteredAds = ads.filter((ad) => {
    if (selectedCompetitorId !== 'ALL' && ad.pageId !== selectedCompetitorId) {
      return false;
    }
    if (filters.status !== 'ALL' && ad.activeStatus !== filters.status) {
      return false;
    }
    if (filters.format !== 'ALL' && ad.format !== filters.format) {
      return false;
    }
    if (filters.searchKeyword.trim() !== '') {
      const q = filters.searchKeyword.toLowerCase();
      const matchHeadline = ad.adHeadline.toLowerCase().includes(q);
      const matchBody = ad.adBodyText.toLowerCase().includes(q);
      const matchBrand = ad.pageName.toLowerCase().includes(q);
      if (!matchHeadline && !matchBody && !matchBrand) return false;
    }
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'LONGEST_RUNNING') {
      return b.activeDaysCount - a.activeDaysCount;
    }
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Module Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem 1.75rem',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
        border: '1px solid var(--border-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            🎯 MODÜL: /competitors
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Rakip Meta Reklam Kütüphanesi & İstihbarat Paneli</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Rakiplerinizin aktif reklamlarını, kanca açılarını, geçmiş kampanya akışlarını ve en çok bütçe alan "Winner" kreatiflerini analiz edin.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onExportCsv} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Download size={16} /> CSV Aktar
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', color: '#34d399', fontSize: '0.85rem' }}>
          ✓ {saveSuccessMsg}
        </div>
      )}

      {/* Competitor Selector Bar */}
      <CompetitorBar
        competitors={competitors}
        selectedCompetitorId={selectedCompetitorId}
        onSelectCompetitor={setSelectedCompetitorId}
        onAddCompetitor={handleAddComp}
        onRemoveCompetitor={handleRemoveComp}
      />

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        
        <button
          onClick={() => setActiveSubTab('feed')}
          className={activeSubTab === 'feed' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.55rem 1.25rem' }}
        >
          <Flame size={16} /> Reklam Akışı ({filteredAds.length})
        </button>

        <button
          onClick={() => setActiveSubTab('saved-ads')}
          className={activeSubTab === 'saved-ads' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.55rem 1.25rem' }}
        >
          <Bookmark size={16} /> Kaydedilenler & Notlarım ({savedAds.length})
        </button>

        <button
          onClick={() => setActiveSubTab('timeline')}
          className={activeSubTab === 'timeline' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.55rem 1.25rem' }}
        >
          <History size={16} /> Geçmiş Analizi & Zaman Çizelgesi
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={activeSubTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.55rem 1.25rem' }}
        >
          <BarChart3 size={16} /> Format & Metrikler
        </button>

        <button
          onClick={() => setActiveSubTab('ai-strategy')}
          className={activeSubTab === 'ai-strategy' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.55rem 1.25rem' }}
        >
          <BrainCircuit size={16} /> AI Strateji Raporu
        </button>

      </div>

      {/* Tab 1: Live Ad Feed */}
      {activeSubTab === 'feed' && (
        <div>
          <AdFilters
            filters={filters}
            onFilterChange={(newF) => setFilters({ ...filters, ...newF })}
            totalResultsCount={filteredAds.length}
          />

          {filteredAds.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Seçilen kriterlere uygun reklam bulunamadı.
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Filtrelerinizi temizleyerek veya başka bir rakip seçerek tekrar deneyebilirsiniz.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}>
              {filteredAds.map((ad) => (
                <div key={ad.id} style={{ position: 'relative' }}>
                  <AdCard
                    ad={ad}
                    onInspect={(selected) => setSelectedAdForModal(selected)}
                  />
                  <button
                    onClick={() => handleSaveAd(ad)}
                    title="Reklamı Kütüphaneme Kaydet / Not Ekle"
                    style={{
                      position: 'absolute',
                      bottom: '58px',
                      right: '12px',
                      background: 'rgba(124, 58, 237, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '5px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      zIndex: 5,
                    }}
                  >
                    <Bookmark size={13} /> Kaydet
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Ads & Notes */}
      {activeSubTab === 'saved-ads' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Kaydedilen Favori Reklamlar & Strateji Notları</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Ekibinizin ilham almak veya benchmark yapmak için veritabanına kaydettiği özel kreatifler.
            </p>
          </div>

          {savedAds.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <Bookmark size={36} color="var(--accent-purple)" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Henüz kaydedilmiş reklam bulunmuyor</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                "Reklam Akışı" sekmesinden beğendiğiniz veya kazanan reklamların altındaki <strong>"Kaydet"</strong> butonuna basarak notlarınızla birlikte buraya ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {savedAds.map((item) => (
                <div key={item.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', border: item.isWinner ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-glass)' }}>
                  
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.pageName}</div>
                    <button
                      onClick={() => handleDeleteSavedAd(item.id)}
                      title="Kaydı Sil"
                      style={{ background: 'rgba(244, 63, 94, 0.1)', border: 'none', borderRadius: '6px', color: '#fb7185', padding: '4px 6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={{ height: '200px', backgroundColor: '#000', overflow: 'hidden' }}>
                    <img src={item.mediaUrls[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600'} alt={item.headline} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>
                        <Tag size={11} /> {item.tags || 'Favori'}
                      </span>
                      {item.isWinner && <span className="badge badge-carousel" style={{ fontSize: '0.65rem' }}>🔥 Kazanan</span>}
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.headline}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.bodyText.substring(0, 90)}...</div>

                    {item.notes && (
                      <div style={{ marginTop: '0.5rem', padding: '0.6rem 0.8rem', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#c084fc' }}>
                        📝 <strong>Notum:</strong> {item.notes}
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Historical Timeline */}
      {activeSubTab === 'timeline' && (
        <HistoricalTimeline
          ads={ads}
          competitors={competitors}
          onSelectAd={(selected) => setSelectedAdForModal(selected)}
        />
      )}

      {/* Tab 4: Analytics Dashboard */}
      {activeSubTab === 'analytics' && (
        <AnalyticsDashboard
          ads={ads}
          competitors={competitors}
        />
      )}

      {/* Tab 5: AI Strategy Report */}
      {activeSubTab === 'ai-strategy' && (
        <AIStrategyReport
          competitors={competitors}
          ads={ads}
          selectedCompetitorId={selectedCompetitorId}
        />
      )}

      {/* Ad Detail Inspection Modal */}
      <AdDetailModal
        ad={selectedAdForModal}
        onClose={() => setSelectedAdForModal(null)}
      />

    </div>
  );
};
