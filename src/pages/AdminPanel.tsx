import React, { useState, useEffect } from 'react';
import { MarketingRoute } from '../types/suite';
import { User, UserRole } from '../types/auth';
import { ApiService } from '../services/apiService';
import { 
  Sliders, 
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
  UserPlus
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
      setTimeout(() => setIsSaved(false), 2500);
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
        return <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)' }}>👑 Süper Admin</span>;
      case 'ADMIN':
        return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>⚙️ Yönetici (Admin)</span>;
      case 'MARKETER':
        return <span className="badge" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#c084fc', border: '1px solid rgba(124, 58, 237, 0.3)' }}>🎯 Pazarlamacı</span>;
      case 'VIEWER':
        return <span className="badge" style={{ background: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: '1px solid rgba(107, 114, 128, 0.3)' }}>👁️ İzleyici</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(124, 58, 237, 0.12) 100%)',
        border: '1px solid var(--border-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            <Sliders size={18} /> SİSTEM YÖNETİM MERKEZİ (`/admin`)
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Admin & Yetkilendirme Paneli</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Kullanıcı yetkilerini yönetin, API anahtarlarını yapılandırın ve sistem güvenlik loglarını inceleyin.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="btn-primary"
          style={{ background: isSaved ? '#10b981' : undefined }}
        >
          {isSaved ? <Check size={18} /> : <Save size={18} />}
          {isSaved ? 'Ayarlar Kaydedildi!' : 'Tüm Değişiklikleri Kaydet'}
        </button>
      </div>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        
        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem' }}
        >
          <Users size={16} /> Kullanıcı Yönetimi ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('keys')}
          className={activeTab === 'keys' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem' }}
        >
          <Key size={16} /> API Anahtarları
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={activeTab === 'flags' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem' }}
        >
          <Sliders size={16} /> Modül Toggles
        </button>

        <button
          onClick={() => { setActiveTab('logs'); loadLogs(); }}
          className={activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem' }}
        >
          <Activity size={16} /> Sistem Günlükleri
        </button>

      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Kayıtlı Kullanıcılar & Yetkiler</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Ekip üyelerinize sisteme giriş erişimi verin veya rollerini güncelleyin.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={loadUsers}
                className="btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
              >
                <RefreshCw size={14} className={isLoadingUsers ? 'animate-spin' : ''} /> Yenile
              </button>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <UserPlus size={16} /> Yeni Kullanıcı Ekle
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem' }}>Kullanıcı</th>
                  <th style={{ padding: '1rem' }}>E-posta</th>
                  <th style={{ padding: '1rem' }}>Rol / Yetki</th>
                  <th style={{ padding: '1rem' }}>Durum</th>
                  <th style={{ padding: '1rem' }}>Son Giriş</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s ease' }}>
                    
                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: 'white',
                        fontSize: '0.85rem',
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: #{u.id}</div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {u.email}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      {getRoleBadge(u.role)}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        {u.status === 'ACTIVE' ? (
                          <span className="badge badge-active">● Aktif</span>
                        ) : (
                          <span className="badge badge-inactive">● Pasif</span>
                        )}
                      </button>
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('tr-TR') : 'Henüz Giriş Yapmadı'}
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {u.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          title="Kullanıcıyı Sil"
                          style={{
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            borderRadius: '6px',
                            color: '#fb7185',
                            padding: '0.35rem 0.65rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Key size={18} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Meta Ad Library API Token</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Meta Reklam Kütüphanesi üzerinden canlı reklamları otomatik çekmek için Graph API Token.
            </p>
            <input
              type="password"
              value={metaToken}
              onChange={(e) => setMetaToken(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none' }}
            />
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Key size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>AI Strateji Motoru API Key</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              SWOT analizleri ve AI metin yazarı için OpenAI / Gemini API anahtarı.
            </p>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none' }}
            />
          </div>

        </div>
      )}

      {/* Tab 3: Feature Flags */}
      {activeTab === 'flags' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Modül & Fonksiyon Toggles</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { key: 'competitorIntel', name: 'Rakip Reklam İstihbaratı (/competitors)', desc: 'Meta reklam arşivi ve kanca analizi' },
              { key: 'aiCopywriter', name: 'AI Reklam Metni & Kanca Üretici (/ai-copywriter)', desc: 'Yapay zekâ destekli metin motoru' },
              { key: 'roasOptimizer', name: 'ROAS & Bütçe Simülatörü (/roas-optimizer)', desc: 'Karlılık ve bütçe tahminleme' },
              { key: 'auditLogging', name: 'Detaylı Sistem ve Güvenlik Loglaması', desc: 'Tüm kullanıcı işlemlerini veritabanına kaydeder' },
            ].map((f) => (
              <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.desc}</div>
                </div>

                <button
                  onClick={() => setFlags({ ...flags, [f.key]: !flags[f.key as keyof typeof flags] })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                >
                  {flags[f.key as keyof typeof flags] ? (
                    <ToggleRight size={32} color="#34d399" />
                  ) : (
                    <ToggleLeft size={32} color="#6b7280" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Gerçek Zamanlı Sistem & Güvenlik Günlükleri</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Henüz log kaydı bulunmuyor.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldCheck size={16} color="var(--accent-cyan)" />
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{log.userName || 'Sistem'}:</strong> {log.action} - <span style={{ color: 'var(--text-secondary)' }}>{log.details}</span>
                    </div>
                  </div>

                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '1.75rem' }}>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Yeni Kullanıcı Hesabı Ekle</h3>

            {userActionError && (
              <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: '#fb7185', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {userActionError}
              </div>
            )}

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Ad Soyad</label>
                <input
                  type="text"
                  placeholder="Örn: Caner Tekdal"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>E-posta Adresi</label>
                <input
                  type="email"
                  placeholder="ornek@roasist.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Başlangıç Şifresi</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Kullanıcı Rolü & Yetki Seviyesi</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="MARKETER">🎯 Pazarlamacı (Marketing Araçlarına Tam Erişim)</option>
                  <option value="ADMIN">⚙️ Yönetici (Admin & Kullanıcı Yönetimi)</option>
                  <option value="VIEWER">👁️ İzleyici (Salt Okunur Rapor Görüntüleme)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
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
                  <Plus size={16} /> Kullanıcıyı Oluştur
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
