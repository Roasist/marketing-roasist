import React, { useState, useEffect } from 'react';
import { MarketingRoute, AdminTab } from '../types/suite';
import { User, UserRole } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/apiService';
import { 
  Key, 
  Users, 
  ToggleLeft, 
  ToggleRight, 
  Activity, 
  Save, 
  Check, 
  RefreshCw, 
  Plus, 
  Trash2, 
  UserPlus,
  Edit2,
  Clock,
  Globe,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface AdminPanelProps {
  onNavigate: (route: MarketingRoute) => void;
  activeTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onNavigate: _onNavigate,
  activeTab: controlledTab = 'users',
  onTabChange,
}) => {
  const { user: loggedInUser } = useAuth();
  const [internalTab, setInternalTab] = useState<AdminTab>(controlledTab);

  useEffect(() => {
    setInternalTab(controlledTab);
  }, [controlledTab]);

  const activeTab = internalTab;
  const setActiveTab = (tab: AdminTab) => {
    setInternalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // Add User modal state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('MARKETER');
  const [userActionError, setUserActionError] = useState<string | null>(null);

  // Edit User modal state
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('MARKETER');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [editPassword, setEditPassword] = useState('');
  const [editActionError, setEditActionError] = useState<string | null>(null);
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);

  // Settings state
  const [metaToken, setMetaToken] = useState(() => localStorage.getItem('roasist_meta_token') || '');
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('roasist_gemini_api_key') || '');
  const [showMetaToken, setShowMetaToken] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isTestingMeta, setIsTestingMeta] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Feature Flags
  const [flags, setFlags] = useState({
    competitorIntel: true,
    aiCopywriter: true,
    roasOptimizer: true,
    auditLogging: true,
    autoSyncCron: false,
  });

  // Logs state
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const fetched = await ApiService.getUsers();
      setUsers(fetched);
    } catch {
      // Fallback
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const fetched = await ApiService.getAuditLogs();
      setLogs(fetched);
    } catch {
      // Fallback
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await ApiService.getSettings();
      if (res && res.settings) {
        if (res.settings.metaToken) {
          setMetaToken(res.settings.metaToken);
          localStorage.setItem('roasist_meta_token', res.settings.metaToken);
        }
        if (res.settings.geminiApiKey) {
          setGeminiApiKey(res.settings.geminiApiKey);
          localStorage.setItem('roasist_gemini_api_key', res.settings.geminiApiKey);
        }
        if (res.settings.flags) {
          try {
            setFlags(JSON.parse(res.settings.flags));
          } catch {}
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadUsers();
    loadLogs();
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      localStorage.setItem('roasist_meta_token', metaToken);
      localStorage.setItem('roasist_gemini_api_key', geminiApiKey);
      await ApiService.updateSettings({
        metaToken,
        geminiApiKey,
        flags: JSON.stringify(flags),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
      loadLogs();
    } catch (err: any) {
      alert('Ayarlar kaydedilirken hata: ' + err.message);
    }
  };

  const handleTestMetaConnection = async () => {
    setIsTestingMeta(true);
    setTestResult(null);
    try {
      localStorage.setItem('roasist_meta_token', metaToken);
      await ApiService.updateSettings({
        metaToken,
        geminiApiKey,
        flags: JSON.stringify(flags),
      });
      const res = await ApiService.testMetaToken();
      if (res.status === 'success') {
        setTestResult({ success: true, message: res.message });
      } else {
        setTestResult({ success: false, message: res.message });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Bağlantı testi başarısız oldu.' });
    } finally {
      setIsTestingMeta(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionError(null);
    try {
      await ApiService.createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      setIsAddUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      loadUsers();
      loadLogs();
    } catch (err: any) {
      setUserActionError(err.message || 'Kullanıcı oluşturulamadı.');
    }
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditStatus(user.status || 'ACTIVE');
    setEditPassword('');
    setEditActionError(null);
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditActionError(null);
    setIsEditingSubmitting(true);

    try {
      await ApiService.updateUser({
        id: editingUser.id,
        name: editName,
        email: editEmail,
        role: editRole,
        status: editStatus,
        password: editPassword.trim() ? editPassword.trim() : undefined,
      });
      setIsEditUserModalOpen(false);
      setEditingUser(null);
      loadUsers();
      loadLogs();
    } catch (err: any) {
      setEditActionError(err.message || 'Kullanıcı güncellenemedi.');
    } finally {
      setIsEditingSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await ApiService.deleteUser(id);
      loadUsers();
      loadLogs();
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await ApiService.updateUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: newStatus,
      });
      loadUsers();
      loadLogs();
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  const getRoleBadge = (role: UserRole | string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="badge" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', fontSize: '0.68rem' }}>Süper Admin</span>;
      case 'ADMIN':
        return <span className="badge" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning-border)', fontSize: '0.68rem' }}>Yönetici</span>;
      case 'MARKETER':
        return <span className="badge" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)', border: '1px solid var(--info-border)', fontSize: '0.68rem' }}>Pazarlamacı</span>;
      default:
        return <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{role || 'İzleyici'}</span>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'GÜVENLİK':
        return <span className="badge" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>GÜVENLİK</span>;
      case 'KULLANICI':
        return <span className="badge" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)', border: '1px solid var(--info-border)' }}>KULLANICI</span>;
      case 'OTURUM':
        return <span className="badge badge-neutral">OTURUM</span>;
      case 'AYARLAR':
        return <span className="badge" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning-border)' }}>AYARLAR</span>;
      case 'RAKİP':
        return <span className="badge badge-carousel">RAKİP</span>;
      default:
        return <span className="badge badge-neutral">{category || 'SİSTEM'}</span>;
    }
  };

  const formatLogDateTime = (raw: string | undefined) => {
    if (!raw) return '—';
    try {
      const parsed = new Date(raw.includes('T') ? raw : raw.replace(' ', 'T'));
      if (isNaN(parsed.getTime())) return raw;
      return parsed.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return raw || '—';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Kullanıcı & Sistem Yönetim Konsolu
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Ekip yetkilendirmesi, kullanıcı düzenleme, API bağlantıları ve detaylı denetim kayıtları.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="btn-primary"
          style={{ fontSize: '0.825rem' }}
        >
          {isSaved ? <Check size={14} /> : <Save size={14} />}
          {isSaved ? 'Kaydedildi' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        
        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          <Users size={14} /> Kullanıcılar ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('keys')}
          className={activeTab === 'keys' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          <Key size={14} /> API Bağlantıları
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={activeTab === 'flags' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          Modül Ayarları
        </button>

        <button
          onClick={() => { setActiveTab('logs'); loadLogs(); }}
          className={activeTab === 'logs' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          <Activity size={14} /> Denetim Günlüğü ({logs.length})
        </button>

      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Kayıtlı Ekip Üyeleri
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={loadUsers}
                className="btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
              >
                <RefreshCw size={13} className={isLoadingUsers ? 'animate-spin' : ''} /> Yenile
              </button>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              >
                <UserPlus size={14} /> Yeni Kullanıcı
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kullanıcı</th>
                  <th>E-posta</th>
                  <th>Rol</th>
                  <th>Durum</th>
                  <th>Son Giriş</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem',
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>#{u.id}</div>
                      </div>
                    </td>

                    <td style={{ color: 'var(--text-secondary)' }}>
                      {u.email}
                    </td>

                    <td>
                      {getRoleBadge(u.role)}
                    </td>

                    <td>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                        }}
                      >
                        {u.status === 'ACTIVE' ? (
                          <span className="badge badge-active">Aktif</span>
                        ) : (
                          <span className="badge badge-inactive">Pasif</span>
                        )}
                      </button>
                    </td>

                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('tr-TR') : '—'}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        {/* Edit User Button */}
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          title="Bilgileri Düzenle"
                          className="btn-secondary"
                          style={{
                            padding: '0.3rem 0.55rem',
                            fontSize: '0.72rem',
                          }}
                        >
                          <Edit2 size={12} /> Düzenle
                        </button>

                        {/* Delete User Button */}
                        {((loggedInUser?.role === 'SUPER_ADMIN' && u.id !== loggedInUser?.id) ||
                          (loggedInUser?.role === 'ADMIN' && u.id !== loggedInUser?.id && u.role !== 'SUPER_ADMIN')) && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            title="Kullanıcıyı Sil"
                            className="btn-ghost"
                            style={{
                              padding: '0.3rem 0.45rem',
                              color: 'var(--danger)',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 2: API Keys */}
      {activeTab === 'keys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Header Info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                API Anahtarları & Dış Entegrasyonlar
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Meta Ad Library ve AI motoru bağlantı ayarlarını yapılandırın.
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="btn-primary"
              style={{ fontSize: '0.8rem' }}
            >
              {isSaved ? <Check size={14} /> : <Save size={14} />}
              {isSaved ? 'Değişiklikler Kaydedildi!' : 'Değişiklikleri Kaydet'}
            </button>
          </div>

          {testResult && (
            <div style={{
              background: testResult.success ? 'var(--success-bg)' : 'var(--danger-bg)',
              border: `1px solid ${testResult.success ? 'var(--success-border)' : 'var(--danger-border)'}`,
              color: testResult.success ? '#34d399' : 'var(--danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
            
            {/* Meta Ad Library Card */}
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Meta Ad Library Graph API
                </div>
                {metaToken.trim().length > 15 ? (
                  <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                    <CheckCircle2 size={11} /> Token Kayıtlı
                  </span>
                ) : (
                  <span className="badge badge-inactive" style={{ fontSize: '0.7rem' }}>
                    Token Bekleniyor
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Meta Reklam Kütüphanesinden Türkiye ve globaldeki rakiplerin aktif kampanyalarını otomatik çekmek için <strong>Access Token</strong>.
              </p>

              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showMetaToken ? 'text' : 'password'}
                  placeholder="EAA... ile başlayan Meta Access Token'ınızı buraya yapıştırın"
                  value={metaToken}
                  onChange={(e) => setMetaToken(e.target.value)}
                  style={{ width: '100%', paddingRight: '2.5rem', fontFamily: showMetaToken ? 'var(--font-mono)' : 'inherit', fontSize: '0.8rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowMetaToken(!showMetaToken)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showMetaToken ? 'Gizle' : 'Göster'}
                >
                  {showMetaToken ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={handleTestMetaConnection}
                  disabled={isTestingMeta || !metaToken.trim()}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                >
                  <Sparkles size={13} className={isTestingMeta ? 'animate-spin' : ''} />
                  {isTestingMeta ? 'Doğrulanıyor...' : 'Bağlantıyı Doğrula & Test Et'}
                </button>
              </div>
            </div>

            {/* AI Engine Card */}
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  AI Metin & Strateji Motoru
                </div>
                {geminiApiKey.trim().length > 10 ? (
                  <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                    <CheckCircle2 size={11} /> Anahtar Aktif
                  </span>
                ) : (
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    Sistem Varsayılanı
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Rakip reklam metinleri analizi, SWOT stratejisi ve yeni reklam açısı üretimi için AI API Anahtarı.
              </p>

              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  placeholder="AIzaSy... ile başlayan API Anahtarı (İsteğe bağlı)"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  style={{ width: '100%', paddingRight: '2.5rem', fontFamily: showGeminiKey ? 'var(--font-mono)' : 'inherit', fontSize: '0.8rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showGeminiKey ? 'Gizle' : 'Göster'}
                >
                  {showGeminiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab 3: Feature Flags */}
      {activeTab === 'flags' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Modül ve Özellik Denetimi
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Tüm ekip için aktif veya pasif yapılacak sistem modüllerini buradan yönetebilirsiniz.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Rakip Reklam İstihbaratı Modülü</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Meta Ad Library veri akışı ve rakip analizi</div>
              </div>
              <button
                onClick={() => setFlags({ ...flags, competitorIntel: !flags.competitorIntel })}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {flags.competitorIntel ? <ToggleRight size={26} color="var(--brand-primary)" /> : <ToggleLeft size={26} color="var(--text-muted)" />}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-primary)' }}>AI Reklam Metni & Kanca Motoru</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Otomatik metin üretici ve açı simülatörü</div>
              </div>
              <button
                onClick={() => setFlags({ ...flags, aiCopywriter: !flags.aiCopywriter })}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {flags.aiCopywriter ? <ToggleRight size={26} color="var(--brand-primary)" /> : <ToggleLeft size={26} color="var(--text-muted)" />}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-primary)' }}>ROAS & Karlılık Simülatörü</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bütçe ve başabaş analiz hesaplayıcısı</div>
              </div>
              <button
                onClick={() => setFlags({ ...flags, roasOptimizer: !flags.roasOptimizer })}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {flags.roasOptimizer ? <ToggleRight size={26} color="var(--brand-primary)" /> : <ToggleLeft size={26} color="var(--text-muted)" />}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Denetim & Güvenlik Loglama (Audit Logs)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tüm kullanıcı ve sistem hareketlerinin veritabanına kaydı</div>
              </div>
              <button
                onClick={() => setFlags({ ...flags, auditLogging: !flags.auditLogging })}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {flags.auditLogging ? <ToggleRight size={26} color="var(--brand-primary)" /> : <ToggleLeft size={26} color="var(--text-muted)" />}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Sistem ve Güvenlik Denetim Günlüğü
            </div>

            <button
              onClick={loadLogs}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            >
              <RefreshCw size={13} className={isLoadingLogs ? 'animate-spin' : ''} /> Günlüğü Yenile
            </button>
          </div>

          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '150px' }}>Zaman & Tarih</th>
                  <th style={{ minWidth: '180px' }}>İşlemi Yapan</th>
                  <th style={{ minWidth: '160px' }}>Kategori & Eylem</th>
                  <th>İşlem Detayı</th>
                  <th style={{ minWidth: '130px' }}>IP Adresi</th>
                  <th style={{ minWidth: '90px', textAlign: 'right' }}>Durum</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Henüz kayıtlı bir denetim kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any, idx: number) => {
                    const userName = log.user_name || log.userName || 'Sistem';
                    const userEmail = log.user_email || log.userEmail || '';
                    const userRole = log.user_role || log.userRole || '';
                    const category = log.category || 'SİSTEM';
                    const action = log.action || 'İşlem';
                    const details = log.details || '—';
                    const ip = log.ip_address || log.ipAddress || '127.0.0.1';
                    const createdAt = log.created_at || log.createdAt;

                    return (
                      <tr key={log.id || idx}>
                        
                        {/* 1. Time */}
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={12} color="var(--text-muted)" />
                            <span>{formatLogDateTime(createdAt)}</span>
                          </div>
                        </td>

                        {/* 2. User */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-default)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              fontSize: '0.72rem',
                              flexShrink: 0,
                            }}>
                              {userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                                {userName}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <span>{userEmail || 'Sistem Süreci'}</span>
                                {userRole && (
                                  <>
                                    <span>•</span>
                                    <span>{getRoleBadge(userRole)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Category & Action */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                            {getCategoryBadge(category)}
                            <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                              {action}
                            </span>
                          </div>
                        </td>

                        {/* 4. Details */}
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.45 }}>
                          {details}
                        </td>

                        {/* 5. IP Address */}
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Globe size={12} color="var(--text-muted)" />
                            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                              {ip}
                            </code>
                          </div>
                        </td>

                        {/* 6. Status */}
                        <td style={{ textAlign: 'right' }}>
                          <span className="badge badge-active" style={{ fontSize: '0.68rem' }}>
                            <CheckCircle2 size={11} /> Başarılı
                          </span>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Modal: Add User */}
      {isAddUserModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddUserModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '1.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Yeni Kullanıcı Hesabı
              </div>
              <button onClick={() => setIsAddUserModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {userActionError && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', padding: '0.65rem', borderRadius: 'var(--radius-xs)', color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                {userActionError}
              </div>
            )}

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Ad Soyad</label>
                <input
                  type="text"
                  placeholder="Caner Tekdal"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>E-posta</label>
                <input
                  type="email"
                  placeholder="ornek@roasist.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Şifre</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Rol / Yetki</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <option value="MARKETER">Pazarlamacı (Pazarlama Araçlarına Erişim)</option>
                  <option value="ADMIN">Yönetici (Kullanıcı & Sistem Yönetimi)</option>
                  <option value="VIEWER">İzleyici (Salt Okunur)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  İptal
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Plus size={14} /> Oluştur
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {isEditUserModalOpen && editingUser && (
        <div className="modal-overlay" onClick={() => setIsEditUserModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '1.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Kullanıcı Bilgilerini Düzenle
              </div>
              <button onClick={() => setIsEditUserModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {editActionError && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', padding: '0.65rem', borderRadius: 'var(--radius-xs)', color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                {editActionError}
              </div>
            )}

            <form onSubmit={handleUpdateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Ad Soyad</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>E-posta Adresi</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Rol / Yetki Derecesi</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <option value="MARKETER">Pazarlamacı (Pazarlama Araçlarına Erişim)</option>
                  <option value="ADMIN">Yönetici (Kullanıcı & Sistem Yönetimi)</option>
                  <option value="SUPER_ADMIN">Süper Admin (Tam Yetki)</option>
                  <option value="VIEWER">İzleyici (Salt Okunur)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Hesap Durumu</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <option value="ACTIVE">Aktif (Giriş Yapabilir)</option>
                  <option value="INACTIVE">Pasif / Askıda (Giriş Engellendi)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Yeni Şifre Belirle <span style={{ color: 'var(--text-muted)' }}>(İsteğe bağlı)</span>
                </label>
                <input
                  type="password"
                  placeholder="Değiştirmek istemiyorsanız boş bırakın"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Yalnızca şifreyi sıfırlamak istiyorsanız yeni bir şifre girin.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={isEditingSubmitting}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Save size={14} /> Kaydet
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
