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
  History, 
  BarChart3, 
  BrainCircuit, 
  Download, 
  Bookmark, 
  Trash2, 
  Tag,
  ExternalLink,
  Loader2,
  Layers,
  Search
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
  
  // Dedicated clean sub-tabs for Meta vs Google
  const [activeSubTab, setActiveSubTab] = useState<'meta-feed' | 'google-feed' | 'timeline' | 'analytics' | 'ai-strategy' | 'saved-ads'>('google-feed');
  const [selectedAdForModal, setSelectedAdForModal] = useState<AdItem | null>(null);

  // Saved Ads state
  const [savedAds, setSavedAds] = useState<SavedAdItem[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    competitorId: 'ALL',
    network: 'ALL',
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
      const activeCompetitor = competitors.find(c => c.id === targetId || c.pageId === targetId || c.domain === targetId);
      const queryName = activeCompetitor ? (activeCompetitor.domain || activeCompetitor.name) : (targetId && targetId !== 'ALL' ? targetId : '');

      const promises: Promise<AdItem[]>[] = [];

      // 1. Meta Ads Fetch
      promises.push(ApiService.fetchMetaAds({
        pageId: targetId && targetId !== 'ALL' ? targetId : undefined,
        country: filters.country || 'TR',
        status: filters.status !== 'ALL' ? filters.status : undefined,
        mediaType: (filters.format === 'IMAGE' || filters.format === 'VIDEO' || filters.format === 'CAROUSEL') ? filters.format : undefined,
      }));

      // 2. Google Ads Transparency Fetch
      const domainOrBrand = activeCompetitor?.domain || activeCompetitor?.name || queryName || (targetId !== 'ALL' ? targetId : '');
      if (domainOrBrand) {
        promises.push(ApiService.fetchGoogleAds(domainOrBrand, filters.country || 'TR', filters.format));
      }

      const results = await Promise.allSettled(promises);
      let combinedAds: AdItem[] = [];

      results.forEach(res => {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          combinedAds = [...combinedAds, ...res.value];
        }
      });

      setAds(combinedAds);
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

  const handleAddComp = async (urlOrId: any) => {
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
        
        // If it's a domain/google competitor, auto-switch to Google tab
        if ((newComp as any).network === 'GOOGLE' || (newComp.domain && newComp.domain.includes('.'))) {
          setActiveSubTab('google-feed');
        } else {
          setActiveSubTab('meta-feed');
        }
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

  // Base platform filter
  const baseAds = ads.filter(ad => {
    if (selectedCompetitorId !== 'ALL') {
      const s = selectedCompetitorId.toLowerCase();
      const matchId = ad.pageId?.toLowerCase() === s;
      const matchDomain = ad.domain?.toLowerCase() === s;
      const matchName = ad.pageName?.toLowerCase() === s;
      if (!matchId && !matchDomain && !matchName) return false;
    }
    return true;
  });

  const metaAds = baseAds.filter(ad => ad.network !== 'GOOGLE');
  const googleAds = baseAds.filter(ad => ad.network === 'GOOGLE');

  // Filtered by sub-tab and current filter criteria
  const currentTabAds = (activeSubTab === 'meta-feed' ? metaAds : googleAds).filter((ad) => {
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
      const matchId = ad.id.toLowerCase().includes(q);
      if (!matchHeadline && !matchBody && !matchBrand && !matchId) return false;
    }
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'LONGEST_RUNNING') {
      return b.activeDaysCount - a.activeDaysCount;
    }
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  const activeCompetitor = competitors.find(c => c.id === selectedCompetitorId || c.pageId === selectedCompetitorId || c.domain === selectedCompetitorId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Rakip Reklam İstihbaratı
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Google Ads Şeffaflık Merkezi ve Meta Reklam Kütüphanesi üzerinden canlı rakip analizi.
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

      {/* Clean Dedicated Platform Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        
        {/* Google Ads Tab */}
        <button
          onClick={() => {
            setActiveSubTab('google-feed');
            setFilters(prev => ({ ...prev, network: 'GOOGLE' }));
          }}
          className={activeSubTab === 'google-feed' ? 'btn-primary' : 'btn-ghost'}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: activeSubTab === 'google-feed' ? 600 : 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <span style={{ fontSize: '1rem' }}>🔴</span>
          <span>Google Ads ({googleAds.length})</span>
        </button>

        {/* Meta Ads Tab */}
        <button
          onClick={() => {
            setActiveSubTab('meta-feed');
            setFilters(prev => ({ ...prev, network: 'META' }));
          }}
          className={activeSubTab === 'meta-feed' ? 'btn-primary' : 'btn-ghost'}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: activeSubTab === 'meta-feed' ? 600 : 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <span style={{ fontSize: '1rem' }}>📘</span>
          <span>Meta Reklamları ({metaAds.length})</span>
        </button>

        {/* Saved Ads Tab */}
        <button
          onClick={() => setActiveSubTab('saved-ads')}
          className={activeSubTab === 'saved-ads' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
        >
          <Bookmark size={14} /> Kaydedilenler ({savedAds.length})
        </button>

        {/* Timeline Tab */}
        <button
          onClick={() => setActiveSubTab('timeline')}
          className={activeSubTab === 'timeline' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
        >
          <History size={14} /> Zaman Çizelgesi
        </button>

        {/* Analytics Tab */}
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={activeSubTab === 'analytics' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
        >
          <BarChart3 size={14} /> Format & Dağılım
        </button>

        {/* AI Strategy Report Tab */}
        <button
          onClick={() => setActiveSubTab('ai-strategy')}
          className={activeSubTab === 'ai-strategy' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
        >
          <BrainCircuit size={14} /> AI Strateji Analizi
        </button>

      </div>

      {/* Google Ads Feed Tab */}
      {activeSubTab === 'google-feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Google Transparency Banner Header */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div>
              <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>🔴 Google Ads Şeffaflık Merkezi İstihbaratı</span>
                <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  {googleAds.length} Resmi Kreatif
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Son gösterim tarihi 2 günü geçen kampanyalar otomatik olarak arşiv olarak işaretlenir.
              </p>
            </div>

            {activeCompetitor && (
              <a
                href={activeCompetitor.googleAdvertiserId 
                  ? `https://adstransparency.google.com/advertiser/${activeCompetitor.googleAdvertiserId}?region=TR`
                  : `https://adstransparency.google.com/?region=TR&domain=${encodeURIComponent(activeCompetitor.domain || activeCompetitor.name)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ExternalLink size={13} /> {activeCompetitor.name} - Google Kütüphanesini Aç
              </a>
            )}
          </div>

          <AdFilters
            filters={filters}
            onFilterChange={(newF) => setFilters({ ...filters, ...newF })}
            totalResultsCount={currentTabAds.length}
          />

          {isLoadingAds ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--brand-primary)', marginBottom: '1rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Google Ads Şeffaflık Merkezinden Canlı Veriler Alınıyor...
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Seçili markanın tüm aktif ve geçmiş Google kampanyaları taranıyor.
              </p>
            </div>
          ) : currentTabAds.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Kriterlere Uygun Google Reklamı Bulunamadı
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.35rem', maxWidth: '400px' }}>
                Filtreleri sıfırlayarak veya yukarıdan takip edilen markayı değiştirerek Google kampanyalarını listeleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1rem',
            }}>
              {currentTabAds.map((ad) => (
                <div key={ad.id} style={{ position: 'relative' }}>
                  <AdCard
                    ad={ad}
                    onInspect={(selected) => setSelectedAdForModal(selected)}
                  />
                  <button
                    onClick={() => handleSaveAd(ad)}
                    title="Reklamı Kaydet"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      color: '#475569',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      zIndex: 5,
                    }}
                  >
                    <Bookmark size={12} /> Kaydet
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Meta Ads Feed Tab */}
      {activeSubTab === 'meta-feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Meta Banner Header */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div>
              <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>📘 Meta (Facebook & Instagram) Reklam Kütüphanesi</span>
                <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                  {metaAds.length} Canlı Kreatif
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Rakiplerin Facebook, Instagram ve Messenger üzerindeki orijinal medya ve metinleri.
              </p>
            </div>

            {activeCompetitor && (
              <a
                href={activeCompetitor.facebookPageUrl || `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TR&view_all_page_id=${activeCompetitor.pageId}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ExternalLink size={13} /> {activeCompetitor.name} - Meta Kütüphanesini Aç
              </a>
            )}
          </div>

          <AdFilters
            filters={filters}
            onFilterChange={(newF) => setFilters({ ...filters, ...newF })}
            totalResultsCount={currentTabAds.length}
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
          ) : currentTabAds.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Kriterlere Uygun Meta Reklamı Bulunamadı
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.35rem', maxWidth: '400px' }}>
                Seçili filtreleri sıfırlayarak veya yukarıdan başka bir rakip seçerek Meta reklamlarını görüntüleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1rem',
            }}>
              {currentTabAds.map((ad) => (
                <div key={ad.id} style={{ position: 'relative' }}>
                  <AdCard
                    ad={ad}
                    onInspect={(selected) => setSelectedAdForModal(selected)}
                  />
                  <button
                    onClick={() => handleSaveAd(ad)}
                    title="Reklamı Kaydet"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      zIndex: 5,
                    }}
                  >
                    <Bookmark size={12} /> Kaydet
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Ads & Notes */}
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
                Reklam sekmelerinden beğendiğiniz reklamların sağ üstündeki <strong>Kaydet</strong> butonunu kullanabilirsiniz.
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

      {/* Tab 4: Historical Timeline */}
      {activeSubTab === 'timeline' && (
        <HistoricalTimeline
          ads={ads}
          competitors={competitors}
          onSelectAd={(selected) => setSelectedAdForModal(selected)}
        />
      )}

      {/* Tab 5: Analytics Dashboard */}
      {activeSubTab === 'analytics' && (
        <AnalyticsDashboard
          ads={ads}
          competitors={competitors}
        />
      )}

      {/* Tab 6: AI Strategy Report */}
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
