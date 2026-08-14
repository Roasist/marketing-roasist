import { useState, useEffect } from 'react';
import { MarketingRoute, AdminTab } from './types/suite';
import { Competitor, AdItem, MetaApiConfig } from './types/ad';
import { ApiService } from './services/apiService';
import { ExportService } from './services/exportService';

import { ThemeProvider } from './contexts/ThemeContext';
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
  const [adminTab, setAdminTab] = useState<AdminTab>('users');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Data states
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [metaConfig, setMetaConfig] = useState<MetaApiConfig>({ accessToken: '', isConfigured: false, useSandboxMock: false });

  const loadRealData = async () => {
    // Clear old legacy mock data from browser localStorage
    localStorage.removeItem('adpulse_competitors');
    localStorage.removeItem('adpulse_ads');
    localStorage.removeItem('adpulse_meta_config');

    try {
      const dbComps = await ApiService.getCompetitors();
      setCompetitors(dbComps || []);
      
      const settings = await ApiService.getSettings();
      if (settings && settings.metaToken) {
        setMetaConfig({
          accessToken: settings.metaToken,
          isConfigured: true,
          useSandboxMock: false,
        });
      }
    } catch {
      setCompetitors([]);
    }
  };

  // Initialize URL & Data on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadRealData();
    }

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
  }, [isAuthenticated]);

  const navigateTo = (route: MarketingRoute) => {
    if (route === 'admin' && !hasRole(['SUPER_ADMIN', 'ADMIN'])) {
      alert('Bu alana erişim için Yönetici (Admin) yetkisi gereklidir.');
      return;
    }

    setCurrentRoute(route);
    const targetPath = route === 'dashboard' ? '/' : `/${route}`;
    window.history.pushState({}, '', targetPath);
  };

  const handleAddCompetitor = async (inputUrlOrId: string) => {
    try {
      const newComp = await ApiService.addCompetitor(inputUrlOrId);
      setCompetitors(prev => [...prev, newComp]);
      
      // Fetch live ads for this newly added competitor
      const fetchedAds = await ApiService.fetchMetaAds(newComp.pageId);
      if (fetchedAds && fetchedAds.length > 0) {
        setAds(prev => [...prev.filter(a => a.pageId !== newComp.pageId), ...fetchedAds]);
      }
    } catch (err: any) {
      alert('Rakip eklenirken hata: ' + err.message);
    }
  };

  const handleRemoveCompetitor = async (id: string) => {
    try {
      await ApiService.deleteCompetitor(id);
      setCompetitors(prev => prev.filter(c => c.id !== id && c.pageId !== id));
      setAds(prev => prev.filter(a => a.pageId !== id));
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  const handleExportCsv = () => {
    ExportService.exportToCsv(ads, 'Roasist_Rakipler');
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--text-primary)' }} />
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
      
      {/* 1. Sidebar Navigation */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        adminTab={adminTab}
        onSelectAdminTab={(tab) => setAdminTab(tab)}
      />

      {/* 2. Main Workspace Layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflowX: 'hidden',
      }}>
        
        {/* Top Header Bar */}
        <TopBar
          currentRoute={currentRoute}
          onNavigate={navigateTo}
        />

        {/* Dynamic Page Content */}
        <main style={{
          flex: 1,
          padding: '1.75rem',
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto',
        }}>
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
              activeTab={adminTab}
              onTabChange={(tab) => setAdminTab(tab)}
            />
          )}
        </main>
      </div>

    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
