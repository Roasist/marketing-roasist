import { useState, useEffect } from 'react';
import { MarketingRoute, AdminTab } from './types/suite';
import { Competitor, AdItem, MetaApiConfig } from './types/ad';
import { Workspace, CreateWorkspacePayload } from './types/workspace';
import { ApiService } from './services/apiService';
import { ExportService } from './services/exportService';

import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { WorkspaceModal } from './components/WorkspaceModal';

import { DashboardOverview } from './pages/DashboardOverview';
import { CompetitorsModule } from './pages/CompetitorsModule';
import { ForecastModule } from './pages/ForecastModule';
import { AiCopywriterModule } from './pages/AiCopywriterModule';
import { RoasOptimizerModule } from './pages/RoasOptimizerModule';
import { AdminPanel } from './pages/AdminPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<MarketingRoute>('dashboard');
  const [adminTab, setAdminTab] = useState<AdminTab>('users');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Workspaces State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    return localStorage.getItem('roasist_active_workspace_id') || 'ws_default_roasist';
  });
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);

  // Data states
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [metaConfig, setMetaConfig] = useState<MetaApiConfig>({ accessToken: '', isConfigured: false, useSandboxMock: false });

  // Load Workspaces from backend
  const loadWorkspacesData = async () => {
    try {
      const res = await ApiService.getWorkspaces(activeWorkspaceId);
      if (res && res.workspaces && res.workspaces.length > 0) {
        setWorkspaces(res.workspaces);
        const validActive = res.workspaces.some((w: any) => w.id === activeWorkspaceId);
        if (!validActive) {
          const defaultWs = res.workspaces[0].id;
          setActiveWorkspaceId(defaultWs);
          localStorage.setItem('roasist_active_workspace_id', defaultWs);
        }
      }
    } catch {
      // Non-blocking fallback
    }
  };

  const loadRealData = async (targetWsId?: string) => {
    // Clear old legacy mock data from browser localStorage
    localStorage.removeItem('adpulse_competitors');
    localStorage.removeItem('adpulse_ads');
    localStorage.removeItem('adpulse_meta_config');

    const wsId = targetWsId || activeWorkspaceId;

    try {
      const dbComps = await ApiService.getCompetitors(wsId);
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

  // Initialize URL & Workspaces on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadWorkspacesData();
      loadRealData(activeWorkspaceId);
    }

    // Initial Path Route Sync
    const path = window.location.pathname.replace('/', '').toLowerCase();
    if (path === 'competitors' || path === 'ad-intelligence') {
      setCurrentRoute('competitors');
    } else if (path === 'forecast') {
      setCurrentRoute('forecast');
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
      else if (p === 'forecast') setCurrentRoute('forecast');
      else if (p === 'admin') setCurrentRoute('admin');
      else if (p === 'ai-copywriter') setCurrentRoute('ai-copywriter');
      else if (p === 'roas-optimizer') setCurrentRoute('roas-optimizer');
      else if (p === '' || p === 'dashboard') setCurrentRoute('dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  // When active workspace changes, reload competitors
  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    localStorage.setItem('roasist_active_workspace_id', id);
    setCompetitors([]);
    setAds([]);
    loadRealData(id);
  };

  // Workspace Modal Handlers
  const handleOpenCreateModal = () => {
    setEditingWorkspace(null);
    setIsWorkspaceModalOpen(true);
  };

  const handleOpenEditModal = (ws: Workspace) => {
    setEditingWorkspace(ws);
    setIsWorkspaceModalOpen(true);
  };

  const handleSaveWorkspace = async (payload: CreateWorkspacePayload, editId?: string) => {
    if (editId) {
      await ApiService.updateWorkspace(editId, payload);
    } else {
      const newWs = await ApiService.createWorkspace(payload);
      if (newWs && newWs.id) {
        handleSelectWorkspace(newWs.id);
      }
    }
    await loadWorkspacesData();
  };

  const handleDeleteWorkspace = async (id: string) => {
    await ApiService.deleteWorkspace(id);
    const updated = workspaces.filter(w => w.id !== id);
    if (updated.length > 0) {
      handleSelectWorkspace(updated[0].id);
    }
    await loadWorkspacesData();
  };

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
      const newComp = await ApiService.addCompetitor(inputUrlOrId, activeWorkspaceId);
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
      
      {/* 1. Sidebar Navigation with Workspace Switcher */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        adminTab={adminTab}
        onSelectAdminTab={(tab) => setAdminTab(tab)}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenCreateWorkspaceModal={handleOpenCreateModal}
        onOpenEditWorkspaceModal={handleOpenEditModal}
        onDeleteWorkspace={handleDeleteWorkspace}
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
              workspaceId={activeWorkspaceId}
              onAddCompetitor={handleAddCompetitor}
              onRemoveCompetitor={handleRemoveCompetitor}
              onExportCsv={handleExportCsv}
            />
          )}

          {currentRoute === 'forecast' && (
            <ForecastModule workspaceId={activeWorkspaceId} />
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

      {/* Workspace Management Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onSave={handleSaveWorkspace}
        onDelete={handleDeleteWorkspace}
        editWorkspace={editingWorkspace}
        totalWorkspacesCount={workspaces.length}
      />

    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
