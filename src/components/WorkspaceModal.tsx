import React, { useState, useEffect } from 'react';
import { Workspace, CreateWorkspacePayload } from '../types/workspace';
import { X, Globe, Building2, Palette, Coins, Loader2, Trash2 } from 'lucide-react';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateWorkspacePayload, editId?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  editWorkspace?: Workspace | null;
  totalWorkspacesCount?: number;
}

const INDUSTRY_OPTIONS = [
  'Genel & Çoklu Sektör',
  'Turizm, Otelcilik & Konaklama',
  'Gayrimenkul & Emlak',
  'E-Ticaret & Perakende',
  'SaaS & Teknoloji',
  'Sağlık, Klinik & Medikal',
  'Eğitim & Akademi',
  'Otomotiv & Lojistik',
  'Finans & Sigorta',
  'Ajans & Danışmanlık'
];

const PRESET_COLORS = [
  '#2563eb', // Blue
  '#059669', // Emerald
  '#7c3aed', // Purple
  '#ea580c', // Orange
  '#db2777', // Pink
  '#0284c7', // Sky
  '#475569', // Slate
  '#b91c1c'  // Red
];

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editWorkspace,
  totalWorkspacesCount = 1,
}) => {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [currency, setCurrency] = useState('TRY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editWorkspace) {
      setName(editWorkspace.name || '');
      setDomain(editWorkspace.domain || '');
      setIndustry(editWorkspace.industry || INDUSTRY_OPTIONS[0]);
      setColor(editWorkspace.color || PRESET_COLORS[0]);
      setCurrency(editWorkspace.currency || 'TRY');
    } else {
      setName('');
      setDomain('');
      setIndustry(INDUSTRY_OPTIONS[0]);
      setColor(PRESET_COLORS[0]);
      setCurrency('TRY');
    }
    setErrorMsg(null);
  }, [editWorkspace, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Lütfen çalışma alanı / marka adını girin.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase();
      await onSave({
        name: name.trim(),
        domain: cleanDomain,
        industry,
        color,
        currency,
        logoUrl: cleanDomain ? `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128` : undefined
      }, editWorkspace?.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Çalışma alanı kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editWorkspace || !onDelete) return;
    if (!window.confirm(`"${editWorkspace.name}" çalışma alanını ve içindeki tüm rakip verilerini silmek istediğinize emin misiniz?`)) return;

    setIsSubmitting(true);
    try {
      await onDelete(editWorkspace.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Silme işlemi başarısız oldu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!editWorkspace;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease-out',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: `${color}18`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${color}35`,
            }}>
              <Building2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isEditing ? 'Çalışma Alanını Düzenle' : 'Yeni Marka / Çalışma Alanı'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {isEditing ? 'Marka profilini ve sektör ayarlarını güncelleyin' : 'Yöneteceğiniz yeni bir marka veya müşteri hesabı oluşturun'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '4px', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.8rem',
            }}>
              {errorMsg}
            </div>
          )}

          {/* Workspace Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Marka / Çalışma Alanı Adı <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Örn: Summer Homes, Livane Hotels, 23 Projects..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          {/* Brand Domain */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Resmi Web Sitesi / Domain (İsteğe Bağlı)
            </label>
            <div style={{ position: 'relative' }}>
              <Globe size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Örn: summerhomes.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.2rem' }}
              />
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Domain girildiğinde markanın logosu ve varsayılan rakip havuzu otomatik hazırlanır.
            </p>
          </div>

          {/* Industry Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Sektör / Faaliyet Alanı
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              style={{ width: '100%' }}
            >
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Color & Currency Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            {/* Accent Color */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                <Palette size={13} /> Tema Rengi
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {PRESET_COLORS.map((c) => (
                  <div
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      cursor: 'pointer',
                      border: color === c ? '2.5px solid #ffffff' : '1px solid rgba(0,0,0,0.1)',
                      boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                      transition: 'transform 0.1s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Currency */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                <Coins size={13} /> Para Birimi
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="TRY">₺ Türk Lirası (TRY)</option>
                <option value="USD">$ Amerikan Doları (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ İngiliz Sterlini (GBP)</option>
                <option value="AED">د.إ BAE Dirhemi (AED)</option>
              </select>
            </div>

          </div>

          {/* Footer Actions */}
          <div style={{
            marginTop: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isEditing && totalWorkspacesCount > 1 ? 'space-between' : 'flex-end',
          }}>
            {isEditing && totalWorkspacesCount > 1 && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Trash2 size={14} /> Alanı Sil
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost"
                disabled={isSubmitting}
                style={{ fontSize: '0.825rem' }}
              >
                İptal
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ fontSize: '0.825rem', padding: '0.45rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                <span>{isEditing ? 'Değişiklikleri Kaydet' : 'Çalışma Alanı Oluştur'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
