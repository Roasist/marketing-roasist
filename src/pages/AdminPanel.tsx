import React, { useState } from 'react';
import { AdminSettings, AuditLogItem } from '../types/suite';
import { 
  Sliders, 
  Key, 
  CheckCircle2, 
  Activity, 
  ToggleLeft, 
  ToggleRight, 
  Layers, 
  Save, 
  Clock
} from 'lucide-react';

interface AdminPanelProps {
  onNavigate?: (route: any) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = () => {
  const [activeTab, setActiveTab] = useState<'integrations' | 'modules' | 'usage' | 'logs'>('integrations');

  const [settings, setSettings] = useState<AdminSettings>({
    siteName: 'Roasist AI Marketing Suite',
    metaAccessToken: 'EAAO9ZBa... (Meta App Token)',
    aiApiKey: 'sk-proj-78192039...',
    maxMonthlyCredits: 10000,
    usedCredits: 3420,
    enabledModules: {
      dashboard: true,
      competitors: true,
      'ai-copywriter': true,
      'roas-optimizer': true,
      admin: true,
    },
    webhooksEnabled: true,
    systemEnvironment: 'Production',
  });

  const [savedMsg, setSavedMsg] = useState(false);

  const logs: AuditLogItem[] = [
    {
      id: 'log-101',
      timestamp: '2026-08-14 01:50:24',
      user: 'admin@roasist.com',
      action: 'GitHub & Veridyen Webhook Otomatik Dağıtım Tamamlandı',
      category: 'SYSTEM',
      status: 'SUCCESS',
    },
    {
      id: 'log-102',
      timestamp: '2026-08-14 01:40:12',
      user: 'admin@roasist.com',
      action: 'Meta Sayfası Ekledi: Trendyol (ID: 10382959102)',
      category: 'API',
      status: 'SUCCESS',
    },
    {
      id: 'log-103',
      timestamp: '2026-08-14 01:30:00',
      user: 'System Cron',
      action: 'Meta Ad Library API Token Yenileme Kontrolü',
      category: 'SECURITY',
      status: 'SUCCESS',
    },
    {
      id: 'log-104',
      timestamp: '2026-08-14 01:15:00',
      user: 'admin@roasist.com',
      action: 'PDF İhracı Oluşturuldu: Nike Strategy Report',
      category: 'MODULE',
      status: 'SUCCESS',
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const toggleModule = (modId: keyof typeof settings.enabledModules) => {
    setSettings(prev => ({
      ...prev,
      enabledModules: {
        ...prev.enabledModules,
        [modId]: !prev.enabledModules[modId],
      }
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Admin Panel Header */}
      <div className="glass-panel" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(99, 102, 241, 0.1))',
        border: '1px solid var(--border-accent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)', marginBottom: '0.4rem' }}>
              <Sliders size={22} />
              <span style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Roasist Platform Yönetimi
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Admin Yönetim Paneli (`/admin`)</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              API entegrasyonları, modül izinleri, sistem kotaları ve güvenlik günlüklerini buradan yönetebilirsiniz.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-active" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              ● Ortam: {settings.systemEnvironment}
            </span>
          </div>
        </div>

        {/* Tab Sub-Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
          <button
            onClick={() => setActiveTab('integrations')}
            className={activeTab === 'integrations' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Key size={15} /> API & Entegrasyonlar
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={activeTab === 'modules' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Layers size={15} /> Modül & Araç Yönetimi
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={activeTab === 'usage' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Activity size={15} /> Kullanım & Kotalar
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Clock size={15} /> Sistem Günlükleri (Audit Logs)
          </button>
        </div>
      </div>

      {savedMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          padding: '0.85rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <CheckCircle2 size={18} /> Admin panel ayarları başarıyla kaydedildi!
        </div>
      )}

      {/* Tab 1: API & Integrations */}
      {activeTab === 'integrations' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>API Anahtarları & Webhook Bağlantıları</h3>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Meta Ad Library API Token
              </label>
              <input
                type="password"
                value={settings.metaAccessToken}
                onChange={(e) => setSettings(prev => ({ ...prev, metaAccessToken: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Meta Ad Library sorguları için kullanılan Graph API Token.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                AI Motoru API Key (Gemini / OpenAI)
              </label>
              <input
                type="password"
                value={settings.aiApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, aiApiKey: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Reklam kancaları ve strateji analizleri üreten yapay zekâ motoru.
              </span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Veridyen Subdomain & Webhook Adresi
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                https://marketing.roasist.com/deploy.php
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.65rem 1.25rem' }}>
              <Save size={16} /> API Değişikliklerini Kaydet
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Module Management (Feature Toggles) */}
      {activeTab === 'modules' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Marketing Suite Modül & Araç Yönetimi (Feature Flags)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Module 1: Competitors */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🎯 Rakip Reklam İstihbaratı (`/competitors`)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Meta Ad Library entegrasyonu, aktif vs geçmiş reklam analizi ve zaman çizelgesi.
                </div>
              </div>
              <button
                onClick={() => toggleModule('competitors')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings.enabledModules.competitors ? '#34d399' : '#6b7280' }}
              >
                {settings.enabledModules.competitors ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>

            {/* Module 2: AI Copywriter */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>✍️ AI Reklam Metni & Kanca Üretici (`/ai-copywriter`)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Yapay zekâ ile yüksek dönüşüm sağlayan reklam başlıkları ve kancalar oluşturucu.
                </div>
              </div>
              <button
                onClick={() => toggleModule('ai-copywriter')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings.enabledModules['ai-copywriter'] ? '#34d399' : '#6b7280' }}
              >
                {settings.enabledModules['ai-copywriter'] ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>

            {/* Module 3: ROAS Optimizer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>📈 ROAS & Bütçe Simülatörü (`/roas-optimizer`)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Kampanya harcamaları ve hedef başabaş noktası (Break-even ROAS) hesaplayıcı.
                </div>
              </div>
              <button
                onClick={() => toggleModule('roas-optimizer')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings.enabledModules['roas-optimizer'] ? '#34d399' : '#6b7280' }}
              >
                {settings.enabledModules['roas-optimizer'] ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Tab 3: Usage & Credits */}
      {activeTab === 'usage' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Kullanım Kotaları & API Kredileri</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span>Aylık API Sorgu Kredisi:</span>
                <span style={{ fontWeight: 700 }}>{settings.usedCredits} / {settings.maxMonthlyCredits} Kullanıldı (%{Math.round((settings.usedCredits/settings.maxMonthlyCredits)*100)})</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${(settings.usedCredits/settings.maxMonthlyCredits)*100}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', borderRadius: '5px' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Sistem & Güvenlik Günlükleri (Audit Logs)</h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Tarih</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Kullanıcı</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Kategori</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{log.timestamp}</td>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{log.user}</td>
                  <td style={{ padding: '10px' }}>
                    <span className="badge badge-image" style={{ fontSize: '0.65rem' }}>{log.category}</span>
                  </td>
                  <td style={{ padding: '10px' }}>{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
