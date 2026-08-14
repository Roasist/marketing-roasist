import React, { useState, useEffect } from 'react';
import { Competitor, AdItem, FilterState, MetaApiConfig } from '../types/ad';
import { SavedAdItem } from '../types/auth';
import { ApiService } from '../services/apiService';

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
  Tag,
  ExternalLink,
  Loader2
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
  onAddCompetitor: _onAddCompetitor,
  onRemoveCompetitor,
  onExportCsv,
}) => {
  const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors);
  const [ads, setAds] = useState<AdItem[]>(initialAds);
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

  const [isLoadingAds, setIsLoadingAds] = useState(false);

  // Load database competitors and saved ads
  const loadDatabaseData = async () => {
    try {
      const dbComps = await ApiService.getCompetitors();
      setCompetitors(dbComps || []);
      const dbSaved = await ApiService.getSavedAds();
      setSavedAds(dbSaved || []);
    } catch {
      setCompetitors([]);
      setSavedAds([]);
    }
  };

  const fetchLiveAds = async (targetId?: string) => {
    setIsLoadingAds(true);
    try {
      const fetched = await ApiService.fetchMetaAds({
        pageId: targetId && targetId !== 'ALL' ? targetId : undefined,
        country: filters.country || 'TR',
        status: filters.status !== 'ALL' ? filters.status : undefined,
        mediaType: filters.format !== 'ALL' ? filters.format : undefined,
      });
      if (fetched && fetched.length > 0) {
        setAds(fetched);
      }
    } catch {
      // Non-blocking
    } finally {
      setIsLoadingAds(false);
    }
  };

  useEffect(() => {
    setCompetitors(initialCompetitors || []);
  }, [initialCompetitors]);

  useEffect(() => {
    loadDatabaseData();
  }, []);

  useEffect(() => {
    if (selectedCompetitorId || filters.country) {
      fetchLiveAds(selectedCompetitorId);
    }
  }, [selectedCompetitorId, filters.country, filters.status, filters.format]);

  const handleAddComp = async (urlOrId: string) => {
    try {
      setIsLoadingAds(true);
      const newComp = await ApiService.addCompetitor(urlOrId);
      if (newComp) {
        setCompetitors(prev => {
          if (prev.some(c => c.id === newComp.id || c.pageId === newComp.pageId)) return prev;
          return [...prev, newComp];
        });
        const targetPageId = newComp.pageId || newComp.id;
        setSelectedCompetitorId(targetPageId);
        await fetchLiveAds(targetPageId);
      }
    } catch (err: any) {
      alert('Rakip eklenirken hata: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsLoadingAds(false);
    }
  };

  const handleRemoveComp = async (id: string) => {
    if (!window.confirm('Bu rakibi kaldırmak istediğinize emin misiniz?')) return;
    try {
      await ApiService.deleteCompetitor(id);
      setCompetitors(prev => prev.filter(c => c.id !== id && c.pageId !== id));
      if (selectedCompetitorId === id) {
        setSelectedCompetitorId('ALL');
      }
      onRemoveCompetitor(id);
    } catch (err: any) {
      alert('Silme hatası: ' + err.message);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Rakip Reklam İstihbaratı
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Rakiplerin aktif kampanyaları, kreatif formatları ve kanıtlanmış kanca stratejileri.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={onExportCsv} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
            <Download size={14} /> CSV Dışa Aktar
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', color: '#34d399', fontSize: '0.825rem' }}>
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
      <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        
        <button
          onClick={() => setActiveSubTab('feed')}
          className={activeSubTab === 'feed' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          <Flame size={14} /> Reklam Akışı ({filteredAds.length})
        </button>

        <button
          onClick={() => setActiveSubTab('saved-ads')}
          className={activeSubTab === 'saved-ads' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          <Bookmark size={14} /> Kaydedilenler ({savedAds.length})
        </button>

        <button
          onClick={() => setActiveSubTab('timeline')}
          className={activeSubTab === 'timeline' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          <History size={14} /> Zaman Çizelgesi
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={activeSubTab === 'analytics' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          <BarChart3 size={14} /> Format & Dağılım
        </button>

        <button
          onClick={() => setActiveSubTab('ai-strategy')}
          className={activeSubTab === 'ai-strategy' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          <BrainCircuit size={14} /> AI Strateji Analizi
        </button>

      </div>

      {/* Tab 1: Live Ad Feed */}
      {activeSubTab === 'feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AdFilters
            filters={filters}
            onFilterChange={(newF) => setFilters({ ...filters, ...newF })}
            totalResultsCount={filteredAds.length}
          />

          {isLoadingAds ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--brand-primary)', marginBottom: '1rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Meta Reklam Kütüphanesinden Canlı Veriler Alınıyor...
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Seçili markanın aktif kampanyaları ve kreatifleri taranıyor.
              </p>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-primary)',
                marginBottom: '1rem',
              }}>
                <Flame size={24} />
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {competitors.length === 0 ? 'Takip Edilen Rakip Bulunmuyor' : 'Filtre Kriterlerine Uygun Reklam Bulunamadı'}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '460px', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {competitors.length === 0 
                  ? 'Meta Reklam Kütüphanesinden takip etmek istediğiniz rakiplerin sayfa linkini veya ID\'sini yukarıdaki alana girerek istihbarat havuzunuzu oluşturabilirsiniz.'
                  : 'Seçili filtreleri sıfırlayarak veya yukarıdan başka bir rakip seçerek aktif reklamları görüntüleyebilirsiniz.'}
              </p>

              {competitors.length === 0 && (
                <a
                  href="https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TR"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ textDecoration: 'none', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <ExternalLink size={14} /> Meta Reklam Kütüphanesini Aç (TR)
                </a>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1rem',
            }}>
              {filteredAds.map((ad) => (
                <div key={ad.id} style={{ position: 'relative' }}>
                  <AdCard
                    ad={ad}
                    onInspect={(selected) => setSelectedAdForModal(selected)}
                  />
                  <button
                    onClick={() => handleSaveAd(ad)}
                    title="Not Ekle & Kaydet"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--text-secondary)',
                      padding: '4px 7px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      zIndex: 5,
                    }}
                  >
                    <Bookmark size={11} /> Kaydet
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Ads & Notes */}
      {activeSubTab === 'saved-ads' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Kaydedilen Reklamlar & Strateji Notları
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Ekibinizin benchmark ve ilham amacıyla veritabanına eklediği özel kreatifler.
            </p>
          </div>

          {savedAds.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <Bookmark size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Henüz kaydedilmiş reklam yok
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                "Reklam Akışı" sekmesinden beğendiğiniz reklamların sağ üstündeki <strong>Kaydet</strong> butonunu kullanabilirsiniz.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {savedAds.map((item) => (
                <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.pageName}</div>
                    <button
                      onClick={() => handleDeleteSavedAd(item.id)}
                      title="Kaydı Sil"
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div style={{ height: '180px', backgroundColor: '#000000', overflow: 'hidden' }}>
                    <img src={item.mediaUrls[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600'} alt={item.headline} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div style={{ padding: '0.85rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                        <Tag size={10} /> {item.tags || 'Favori'}
                      </span>
                      {item.isWinner && <span className="badge badge-carousel" style={{ fontSize: '0.68rem' }}>Winner</span>}
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.headline}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.bodyText.substring(0, 90)}...</div>

                    {item.notes && (
                      <div style={{ marginTop: '0.35rem', padding: '0.5rem 0.65rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                        <strong>Not:</strong> {item.notes}
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
