import React, { useState, useEffect } from 'react';
import { MarketingRoute } from '../types/suite';
import { User, UserRole } from '../types/auth';
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
  ShieldCheck,
  UserPlus,
  X
} from 'lucide-react';

interface AdminPanelProps {
  onNavigate: (route: MarketingRoute) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate: _onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'keys' | 'flags' | 'logs'>('users');
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('MARKETER');
  const [userActionError, setUserActionError] = useState<string | null>(null);

  // Settings state
  const [metaToken, setMetaToken] = useState('EAAG...RoasistLiveToken_2026');
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSy...RoasistAiEngine_Key');
  const [isSaved, setIsSaved] = useState(false);

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
    try {
      const fetched = await ApiService.getAuditLogs();
      setLogs(fetched);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadUsers();
    loadLogs();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await ApiService.updateSettings({
        metaToken,
        geminiApiKey,
        flags: JSON.stringify(flags),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      loadLogs();
    } catch (err: any) {
      alert('Ayarlar kaydedilirken hata: ' + err.message);
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
        role: user.role,
        status: newStatus,
      });
      loadUsers();
      loadLogs();
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)' }}>Süper Admin</span>;
      case 'ADMIN':
        return <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.25)' }}>Yönetici</span>;
      case 'MARKETER':
        return <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.25)' }}>Pazarlamacı</span>;
      case 'VIEWER':
        return <span className="badge badge-neutral">İzleyici</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Kullanıcı & Sistem Yönetimi
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Ekip yetkilendirmesi, API bağlantıları ve sistem güvenlik kayıtları.
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
      <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        
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
          <Activity size={14} /> Denetim Günlüğü
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
                  <th style={{ textAlign: 'right' }}>İşlem</th>
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
                      {u.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          title="Sil"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            padding: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Meta Ad Library Graph API
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              Meta reklam kütüphanesinden otomatik canlı veri çekmek için Access Token.
            </p>
            <input
              type="password"
              value={metaToken}
              onChange={(e) => setMetaToken(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              AI Metin Motoru Anahtarı
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              SWOT analizleri ve AI metin yazarı motoru için API anahtarı.
            </p>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

        </div>
      )}

      {/* Tab 3: Feature Flags */}
      {activeTab === 'flags' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Modül ve Özellik Toggles
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { key: 'competitorIntel', name: 'Rakip Reklam İstihbaratı (/competitors)', desc: 'Meta reklam arşivi ve kanca analizi' },
              { key: 'aiCopywriter', name: 'AI Reklam Metni Yazarı (/ai-copywriter)', desc: 'Yapay zekâ metin motoru' },
              { key: 'roasOptimizer', name: 'ROAS Simülatörü (/roas-optimizer)', desc: 'Karlılık ve bütçe tahminleme' },
              { key: 'auditLogging', name: 'Sistem ve Güvenlik Günlükleri', desc: 'Kullanıcı hareketlerini veritabanında saklar' },
            ].map((f) => (
              <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{f.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.desc}</div>
                </div>

                <button
                  onClick={() => setFlags({ ...flags, [f.key]: !flags[f.key as keyof typeof flags] })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                >
                  {flags[f.key as keyof typeof flags] ? (
                    <ToggleRight size={28} color="#10b981" />
                  ) : (
                    <ToggleLeft size={28} color="#64748b" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
            Sistem Güvenlik & Denetim Günlüğü
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Henüz log kaydı yok.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldCheck size={14} color="#10b981" />
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{log.userName || 'Sistem'}:</strong> {log.action} - <span style={{ color: 'var(--text-secondary)' }}>{log.details}</span>
                    </div>
                  </div>

                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString('tr-TR') : 'Şimdi'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddUserModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '1.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Yeni Kullanıcı Hesabı
              </div>
              <button onClick={() => setIsAddUserModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {userActionError && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', padding: '0.65rem', borderRadius: 'var(--radius-xs)', color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem' }}>
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

    </div>
  );
};
