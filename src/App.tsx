import { useState, useEffect } from 'react';
import { MarketingRoute } from './types/suite';
import { Competitor, AdItem, MetaApiConfig } from './types/ad';
import { MetaAdLibraryService } from './services/metaAdLibraryApi';
import { ExportService } from './services/exportService';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';

import { DashboardOverview } from './pages/DashboardOverview';
import { CompetitorsModule } from './pages/CompetitorsModule';
import { AiCopywriterModule } from './pages/AiCopywriterModule';
import { RoasOptimizerModule } from './pages/RoasOptimizerModule';
import { AdminPanel } from './pages/AdminPanel';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<MarketingRoute>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Data states
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [metaConfig, setMetaConfig] = useState<MetaApiConfig>({ accessToken: '', isConfigured: false, useSandboxMock: true });

  // Initialize URL & Data on mount
  useEffect(() => {
    const loadedCompetitors = MetaAdLibraryService.getCompetitors();
    const loadedAds = MetaAdLibraryService.getAds();
    const loadedConfig = MetaAdLibraryService.getConfig();

    setCompetitors(loadedCompetitors);
    setAds(loadedAds);
    setMetaConfig(loadedConfig);

    // Initial Path Route Sync
    const path = window.location.pathname.replace('/', '').toLowerCase();
    if (path === 'competitors' || path === 'ad-intelligence') {
      setCurrentRoute('competitors');
    } else if (path === 'admin') {
      setCurrentRoute('admin');
    } else if (path === 'ai-copywriter') {
      setCurrentRoute('ai-copywriter');
    } else if (path === 'roas-optimizer') {
      setCurrentRoute('roas-optimizer');
    } else if (path === '' || path === 'dashboard') {
      setCurrentRoute('dashboard');
    }

    const handlePopState = () => {
      const p = window.location.pathname.replace('/', '').toLowerCase();
      if (p === 'competitors') setCurrentRoute('competitors');
      else if (p === 'admin') setCurrentRoute('admin');
      else if (p === 'ai-copywriter') setCurrentRoute('ai-copywriter');
      else if (p === 'roas-optimizer') setCurrentRoute('roas-optimizer');
      else if (p === '' || p === 'dashboard') setCurrentRoute('dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: MarketingRoute) => {
    if (route === 'admin' && !hasRole(['SUPER_ADMIN', 'ADMIN'])) {
      alert('Bu alana erişim için Yönetici (Admin) yetkisi gereklidir.');
      return;
    }

    setCurrentRoute(route);
    const targetPath = route === 'dashboard' ? '/' : `/${route}`;
    window.history.pushState({}, '', targetPath);
  };

  const handleAddCompetitor = (inputUrlOrId: string) => {
    MetaAdLibraryService.addCompetitorByUrlOrId(inputUrlOrId);
    setCompetitors(MetaAdLibraryService.getCompetitors());
    setAds(MetaAdLibraryService.getAds());
  };

  const handleRemoveCompetitor = (id: string) => {
    const updated = competitors.filter(c => c.id !== id);
    setCompetitors(updated);
    MetaAdLibraryService.saveCompetitors(updated);
  };

  const handleExportCsv = () => {
    ExportService.exportToCsv(ads, 'Roasist_Rakipler');
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#ffffff' }} />
          <div style={{ fontSize: '0.85rem' }}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  // If not logged in, show clean enterprise LoginPage
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      
      {/* Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Right Content Layout */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* TopBar */}
        <TopBar
          currentRoute={currentRoute}
          onNavigate={navigateTo}
        />

        {/* Dynamic Route Content */}
        <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '1.5rem', flex: 1 }}>
          
          {currentRoute === 'dashboard' && (
            <DashboardOverview
              competitors={competitors}
              ads={ads}
              onNavigate={navigateTo}
            />
          )}

          {currentRoute === 'competitors' && (
            <CompetitorsModule
              competitors={competitors}
              ads={ads}
              metaConfig={metaConfig}
              onAddCompetitor={handleAddCompetitor}
              onRemoveCompetitor={handleRemoveCompetitor}
              onExportCsv={handleExportCsv}
            />
          )}

          {currentRoute === 'ai-copywriter' && (
            <AiCopywriterModule />
          )}

          {currentRoute === 'roas-optimizer' && (
            <RoasOptimizerModule />
          )}

          {currentRoute === 'admin' && (
            <AdminPanel
              onNavigate={navigateTo}
            />
          )}

        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1rem',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-surface)',
        }}>
          Roasist Marketing Suite • marketing.roasist.com
        </footer>

      </div>

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
