import React, { useState } from 'react';
import { Competitor, AdItem, FilterState, MetaApiConfig } from '../types/ad';
import { CompetitorBar } from '../components/CompetitorBar';
import { AdFilters } from '../components/AdFilters';
import { AdCard } from '../components/AdCard';
import { AdDetailModal } from '../components/AdDetailModal';
import { HistoricalTimeline } from '../components/HistoricalTimeline';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { AIStrategyReport } from '../components/AIStrategyReport';
import { Flame, History, BarChart2, Cpu } from 'lucide-react';

interface CompetitorsModuleProps {
  competitors: Competitor[];
  ads: AdItem[];
  metaConfig: MetaApiConfig;
  onAddCompetitor: (inputUrlOrId: string) => void;
  onRemoveCompetitor: (id: string) => void;
  onExportCsv: () => void;
}

export const CompetitorsModule: React.FC<CompetitorsModuleProps> = ({
  competitors,
  ads,
  onAddCompetitor,
  onRemoveCompetitor,
}) => {
  const [subTab, setSubTab] = useState<'feed' | 'timeline' | 'analytics' | 'ai-strategy'>('feed');
  
  const [filters, setFilters] = useState<FilterState>({
    competitorId: 'ALL',
    searchKeyword: '',
    status: 'ALL',
    format: 'ALL',
    platform: 'ALL',
    sortBy: 'NEWEST',
  });

  const [inspectedAd, setInspectedAd] = useState<AdItem | null>(null);

  // Filter ads based on search and selected competitor
  const filteredAds = ads.filter((ad) => {
    if (filters.competitorId !== 'ALL' && ad.pageId !== filters.competitorId) {
      const matchComp = competitors.find(c => c.id === filters.competitorId);
      if (!matchComp || ad.pageId !== matchComp.pageId) return false;
    }

    if (filters.status !== 'ALL' && ad.activeStatus !== filters.status) return false;
    if (filters.format !== 'ALL' && ad.format !== filters.format) return false;

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Module Title Header & Sub-Navigation */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🎯 MODÜL: /competitors
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>
              Rakip Meta Reklam Kütüphanesi & İstihbarat Paneli
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Rakiplerin aktif/geçmiş reklamlarını çekin, formatlarını kıyaslayın ve kazanan reklam açılarını keşfedin.
            </p>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSubTab('feed')}
            className={subTab === 'feed' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Flame size={16} /> Reklam Akışı ({filteredAds.length})
          </button>
          <button
            onClick={() => setSubTab('timeline')}
            className={subTab === 'timeline' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <History size={16} /> Geçmiş Analizi (Timeline)
          </button>
          <button
            onClick={() => setSubTab('analytics')}
            className={subTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <BarChart2 size={16} /> Format & Metrikler
          </button>
          <button
            onClick={() => setSubTab('ai-strategy')}
            className={subTab === 'ai-strategy' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Cpu size={16} /> AI Strateji Raporu
          </button>
        </div>
      </div>

      {/* Competitor Manager Bar (MVP URL/ID Entry) */}
      <CompetitorBar
        competitors={competitors}
        selectedCompetitorId={filters.competitorId}
        onSelectCompetitor={(id) => setFilters(prev => ({ ...prev, competitorId: id }))}
        onAddCompetitor={onAddCompetitor}
        onRemoveCompetitor={onRemoveCompetitor}
      />

      {/* Sub-Tab Content */}
      {subTab === 'feed' && (
        <div>
          <AdFilters
            filters={filters}
            onFilterChange={(newF) => setFilters(prev => ({ ...prev, ...newF }))}
            totalResultsCount={filteredAds.length}
          />

          {filteredAds.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Filtre kriterlerinize uygun reklam bulunamadı.
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Yukarıdaki alandan yeni bir rakip Meta linki / ID ekleyebilir veya filtreleri sıfırlayabilirsiniz.
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
                  onInspect={(sel) => setInspectedAd(sel)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'timeline' && (
        <HistoricalTimeline
          ads={ads}
          competitors={competitors}
          onSelectAd={(sel) => setInspectedAd(sel)}
        />
      )}

      {subTab === 'analytics' && (
        <AnalyticsDashboard
          ads={ads}
          competitors={competitors}
        />
      )}

      {subTab === 'ai-strategy' && (
        <AIStrategyReport
          ads={ads}
          competitors={competitors}
          selectedCompetitorId={filters.competitorId}
        />
      )}

      {/* Modal */}
      <AdDetailModal
        ad={inspectedAd}
        onClose={() => setInspectedAd(null)}
      />

    </div>
  );
};
