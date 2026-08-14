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
  UserPlus,
  Edit2,
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

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="badge" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>Süper Admin</span>;
      case 'ADMIN':
        return <span className="badge" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning-border)' }}>Yönetici</span>;
      case 'MARKETER':
        return <span className="badge" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)', border: '1px solid var(--info-border)' }}>Pazarlamacı</span>;
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
            Kullanıcı & Sistem Yönetim Konsolu
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Ekip yetkilendirmesi, kullanıcı düzenleme, API bağlantıları ve denetim kayıtları.
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
                        {u.role !== 'SUPER_ADMIN' && (
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
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Zaman</th>
                <th>Kullanıcı</th>
                <th>Eylem</th>
                <th>Detay</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Henüz kayıtlı bir denetim kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                logs.map((log: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {log.created_at ? new Date(log.created_at).toLocaleString('tr-TR') : '—'}
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {log.user_name || 'Sistem'}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
