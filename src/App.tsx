import { useState, useEffect } from 'react';
import { AdItem, Competitor, FilterState, MetaApiConfig } from './types/ad';
import { MetaAdLibraryService } from './services/metaAdLibraryApi';
import { ExportService } from './services/exportService';
import { Header } from './components/Header';
import { CompetitorBar } from './components/CompetitorBar';
import { AdFilters } from './components/AdFilters';
import { AdCard } from './components/AdCard';
import { AdDetailModal } from './components/AdDetailModal';
import { HistoricalTimeline } from './components/HistoricalTimeline';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AIStrategyReport } from './components/AIStrategyReport';
import { SettingsWebhookModal } from './components/SettingsWebhookModal';

export function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'timeline' | 'analytics' | 'ai-strategy' | 'settings'>('feed');
  
  // Data states
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [metaConfig, setMetaConfig] = useState<MetaApiConfig>({ accessToken: '', isConfigured: false, useSandboxMock: true });
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    competitorId: 'ALL',
    searchKeyword: '',
    status: 'ALL',
    format: 'ALL',
    platform: 'ALL',
    sortBy: 'NEWEST',
  });

  // Modal inspection state
  const [inspectedAd, setInspectedAd] = useState<AdItem | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loadedCompetitors = MetaAdLibraryService.getCompetitors();
    const loadedAds = MetaAdLibraryService.getAds();
    const loadedConfig = MetaAdLibraryService.getConfig();

    setCompetitors(loadedCompetitors);
    setAds(loadedAds);
    setMetaConfig(loadedConfig);
  }, []);

  // Filter ads based on selected competitor, status, format, and search keyword
  const filteredAds = ads.filter((ad) => {
    // Competitor filter
    if (filters.competitorId !== 'ALL' && ad.pageId !== filters.competitorId) {
      const matchComp = competitors.find(c => c.id === filters.competitorId);
      if (!matchComp || ad.pageId !== matchComp.pageId) return false;
    }

    // Status filter
    if (filters.status !== 'ALL' && ad.activeStatus !== filters.status) {
      return false;
    }

    // Format filter
    if (filters.format !== 'ALL' && ad.format !== filters.format) {
      return false;
    }

    // Keyword search filter
    if (filters.searchKeyword.trim()) {
      const query = filters.searchKeyword.toLowerCase();
      const matchHeadline = ad.adHeadline.toLowerCase().includes(query);
      const matchBody = ad.adBodyText.toLowerCase().includes(query);
      const matchPage = ad.pageName.toLowerCase().includes(query);
      if (!matchHeadline && !matchBody && !matchPage) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'LONGEST_RUNNING') {
      return b.activeDaysCount - a.activeDaysCount;
    }
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  // Handlers
  const handleAddCompetitor = (inputUrlOrId: string) => {
    const newComp = MetaAdLibraryService.addCompetitorByUrlOrId(inputUrlOrId);
    const updatedComps = MetaAdLibraryService.getCompetitors();
    const updatedAds = MetaAdLibraryService.getAds();

    setCompetitors(updatedComps);
    setAds(updatedAds);
    setFilters(prev => ({ ...prev, competitorId: newComp.pageId }));
  };

  const handleRemoveCompetitor = (id: string) => {
    const updated = competitors.filter(c => c.id !== id);
    setCompetitors(updated);
    MetaAdLibraryService.saveCompetitors(updated);
    if (filters.competitorId === id) {
      setFilters(prev => ({ ...prev, competitorId: 'ALL' }));
    }
  };

  const handleSaveMetaConfig = (newConfig: MetaApiConfig) => {
    setMetaConfig(newConfig);
    MetaAdLibraryService.saveConfig(newConfig);
  };

  const handleExportCsv = () => {
    const competitorObj = competitors.find(c => c.pageId === filters.competitorId || c.id === filters.competitorId);
    const name = competitorObj ? competitorObj.name : 'Tum_Rakipler';
    ExportService.exportToCsv(filteredAds, name);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metaConfig={metaConfig}
        onExportCsv={handleExportCsv}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '1.5rem', flex: 1 }}>
        
        {/* Competitor Manager Bar (MVP Core Feature) */}
        <CompetitorBar
          competitors={competitors}
          selectedCompetitorId={filters.competitorId}
          onSelectCompetitor={(id) => setFilters(prev => ({ ...prev, competitorId: id }))}
          onAddCompetitor={handleAddCompetitor}
          onRemoveCompetitor={handleRemoveCompetitor}
        />

        {/* Tab 1: Live Feed View */}
        {activeTab === 'feed' && (
          <div>
            {/* Filter Bar */}
            <AdFilters
              filters={filters}
              onFilterChange={(newF) => setFilters(prev => ({ ...prev, ...newF }))}
              totalResultsCount={filteredAds.length}
            />

            {/* Ads Grid */}
            {filteredAds.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Aramanıza veya filtrelerinize uygun reklam bulunamadı.
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Yukarıdaki bar üzerinden yeni bir Meta Sayfa Linki / ID ekleyebilir veya filtreleri sıfırlayabilirsiniz.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}>
                {filteredAds.map((ad) => (
                  <AdCard
                    key={ad.id}
                    ad={ad}
                    onInspect={(selected) => setInspectedAd(selected)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Historical Timeline */}
        {activeTab === 'timeline' && (
          <HistoricalTimeline
            ads={ads}
            competitors={competitors}
            onSelectAd={(selected) => setInspectedAd(selected)}
          />
        )}

        {/* Tab 3: Metrics & Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            ads={ads}
            competitors={competitors}
          />
        )}

        {/* Tab 4: AI Strategy Overview */}
        {activeTab === 'ai-strategy' && (
          <AIStrategyReport
            ads={ads}
            competitors={competitors}
            selectedCompetitorId={filters.competitorId}
          />
        )}

        {/* Tab 5: Meta API & Webhook Deployment Settings */}
        {activeTab === 'settings' && (
          <SettingsWebhookModal
            metaConfig={metaConfig}
            onSaveMetaConfig={handleSaveMetaConfig}
          />
        )}

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-glass)',
        padding: '1.25rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        background: 'rgba(11, 15, 25, 0.9)',
      }}>
        AdPulse AI Intelligence & Meta Ad Library Tracking App • 
        Subdomain Target: <span style={{ color: 'var(--accent-cyan)' }}>marketing.roasist.com</span>
      </footer>

      {/* Ad Detail Modal */}
      <AdDetailModal
        ad={inspectedAd}
        onClose={() => setInspectedAd(null)}
      />

    </div>
  );
}

export default App;
