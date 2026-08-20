import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Printer, 
  Check, 
  Sliders, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  TrendingUp, 
  Search, 
  Info,
  Settings
} from 'lucide-react';
import { SubCampaignItem, KeywordMetric } from '../types/forecast';
import { ExportService, SubCampaignExportConfig, DEFAULT_EXPORT_CONFIG } from '../services/exportService';

interface ExportCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  subCampaign: SubCampaignItem | null;
  masterPlan?: { name?: string; clientName?: string; period?: string; startDate?: string; endDate?: string };
  initialFormat?: 'PDF' | 'CSV';
}

export const ExportCustomizationModal: React.FC<ExportCustomizationModalProps> = ({
  isOpen,
  onClose,
  subCampaign,
  masterPlan,
  initialFormat = 'PDF'
}) => {
  const [format, setFormat] = useState<'PDF' | 'CSV'>(initialFormat);
  const [config, setConfig] = useState<SubCampaignExportConfig>(DEFAULT_EXPORT_CONFIG);

  // Sync format with initialFormat when opened & handle Escape key
  useEffect(() => {
    if (isOpen) {
      setFormat(initialFormat);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, initialFormat, onClose]);

  if (!isOpen || !subCampaign) return null;

  const totalKws = (subCampaign.selectedKeywords && subCampaign.selectedKeywords.length > 0)
    ? subCampaign.selectedKeywords.length
    : (subCampaign.discoveredKeywords || []).length;

  const aiPicksCount = (subCampaign.selectedKeywords && subCampaign.selectedKeywords.length > 0
    ? subCampaign.selectedKeywords
    : (subCampaign.discoveredKeywords || [])).filter((k: KeywordMetric) => k.isAiStrategistPick).length;

  const handleToggle = (key: keyof SubCampaignExportConfig) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Presets
  const applyPreset = (preset: 'ALL' | 'EXECUTIVE' | 'KEYWORDS_ONLY') => {
    if (preset === 'ALL') {
      setConfig({
        includeGeneralInfo: true,
        includeKpiSummary: true,
        includeFunnel: true,
        includeKeywords: true,
        includeNegativeKeywords: true,
        includeChannelParameters: true,
        includeStrategicNotes: true,
        keywordFilter: 'ALL',
        maxKeywordCount: 0
      });
    } else if (preset === 'EXECUTIVE') {
      setConfig({
        includeGeneralInfo: true,
        includeKpiSummary: true,
        includeFunnel: true,
        includeKeywords: false,
        includeNegativeKeywords: true,
        includeChannelParameters: false,
        includeStrategicNotes: true,
        keywordFilter: 'ALL',
        maxKeywordCount: 50
      });
    } else if (preset === 'KEYWORDS_ONLY') {
      setConfig({
        includeGeneralInfo: true,
        includeKpiSummary: false,
        includeFunnel: false,
        includeKeywords: true,
        includeNegativeKeywords: true,
        includeChannelParameters: false,
        includeStrategicNotes: false,
        keywordFilter: 'ALL',
        maxKeywordCount: 0
      });
    }
  };

  const handleExport = () => {
    if (format === 'CSV') {
      ExportService.exportSubCampaignToCsv(subCampaign, masterPlan, config);
    } else {
      ExportService.printSubCampaignReport(subCampaign, masterPlan, config);
    }
    onClose();
  };

  // Count active sections
  const activeSectionsCount = [
    config.includeGeneralInfo,
    config.includeKpiSummary,
    config.includeFunnel,
    config.includeKeywords,
    config.includeNegativeKeywords,
    config.includeChannelParameters,
    config.includeStrategicNotes
  ].filter(Boolean).length;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg, 12px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--text-primary)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface-elevated, var(--bg-surface))',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'linear-gradient(135deg, var(--brand-primary, #4f46e5) 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)'
            }}>
              <Sliders size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Rapor Özelleştirme & Dışa Aktarma
                </h3>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: format === 'CSV' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(79, 70, 229, 0.15)',
                  color: format === 'CSV' ? '#10b981' : 'var(--brand-primary, #4f46e5)',
                  border: `1px solid ${format === 'CSV' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(79, 70, 229, 0.3)'}`
                }}>
                  {format}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Raporda yer alacak bölümleri ve filtreleri yapılandırın.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              borderRadius: 'var(--radius-sm, 6px)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Sub-Campaign Info Ribbon */}
        <div style={{
          padding: '0.65rem 1.25rem',
          backgroundColor: 'var(--bg-surface-elevated, #f1f5f9)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '1rem' }}>{subCampaign.languageFlag || '🌐'}</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{subCampaign.name || 'Alt Kampanya'}</span>
            <span style={{ color: 'var(--text-muted)' }}>• {subCampaign.platform} ({subCampaign.objective})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, flexShrink: 0 }}>
            <span style={{ color: 'var(--brand-primary, #4f46e5)' }}>
              ₺{(subCampaign.monthlyBudget || 0).toLocaleString('tr-TR')} / ay
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          flex: 1
        }}>
          
          {/* Format Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
              Çıktı Formatı
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setFormat('PDF')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: format === 'PDF' ? '2px solid var(--brand-primary, #4f46e5)' : '1px solid var(--border-default)',
                  backgroundColor: format === 'PDF' ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  backgroundColor: format === 'PDF' ? 'var(--brand-primary, #4f46e5)' : 'var(--bg-surface-elevated)',
                  color: format === 'PDF' ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Printer size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>PDF & Baskı Raporu</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Yönetici sunum ve görsel rapor</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('CSV')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: format === 'CSV' ? '2px solid #10b981' : '1px solid var(--border-default)',
                  backgroundColor: format === 'CSV' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  backgroundColor: format === 'CSV' ? '#10b981' : 'var(--bg-surface-elevated)',
                  color: format === 'CSV' ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileSpreadsheet size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Excel / CSV Tablosu</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ham veri ve Excel analiz seti</div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Hızlı Şablonlar
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {activeSectionsCount} / 7 Bölüm Seçili
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => applyPreset('ALL')}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Sparkles size={13} color="#f59e0b" />
                Tam Rapor (Tümü)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('EXECUTIVE')}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <TrendingUp size={13} color="#6366f1" />
                Yönetici KPI & Huni
              </button>
              <button
                type="button"
                onClick={() => applyPreset('KEYWORDS_ONLY')}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Search size={13} color="#10b981" />
                Kelime & Fırsat Analizi
              </button>
            </div>
          </div>

          {/* Sections Customization */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
              Rapora Dahil Edilecek Bölümler
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              
              {/* 1. General Info */}
              <div 
                onClick={() => handleToggle('includeGeneralInfo')}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: `1px solid ${config.includeGeneralInfo ? 'var(--brand-primary, #4f46e5)' : 'var(--border-default)'}`,
                  backgroundColor: config.includeGeneralInfo ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  opacity: config.includeGeneralInfo ? 1 : 0.65,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  marginTop: '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: config.includeGeneralInfo ? 'var(--brand-primary, #4f46e5)' : 'transparent',
                  border: `1px solid ${config.includeGeneralInfo ? 'var(--brand-primary, #4f46e5)' : 'var(--border-strong)'}`,
                  color: '#ffffff'
                }}>
                  {config.includeGeneralInfo && <Check size={12} strokeWidth={3} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Info size={14} color="#3b82f6" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Genel Bilgiler & Çatı Kampanya Eşleşmesi
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Kampanya adı, platform, hedef dil ({subCampaign.languageName || 'Türkçe'}), hedef lokasyonlar ve bütçe.
                  </p>
                </div>
              </div>

              {/* 2. KPI Summary */}
              <div 
                onClick={() => handleToggle('includeKpiSummary')}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: `1px solid ${config.includeKpiSummary ? 'var(--brand-primary, #4f46e5)' : 'var(--border-default)'}`,
                  backgroundColor: config.includeKpiSummary ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  opacity: config.includeKpiSummary ? 1 : 0.65,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  marginTop: '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: config.includeKpiSummary ? 'var(--brand-primary, #4f46e5)' : 'transparent',
                  border: `1px solid ${config.includeKpiSummary ? 'var(--brand-primary, #4f46e5)' : 'var(--border-strong)'}`,
                  color: '#ffffff'
                }}>
                  {config.includeKpiSummary && <Check size={12} strokeWidth={3} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <TrendingUp size={14} color="#10b981" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Temel Metrikler & KPI Performans Özeti
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Aylık medya yatırımı, tahmini gösterim, trafik (tıklama), ortalama TBM ve TO (CTR).
                  </p>
                </div>
              </div>

              {/* 3. Funnel */}
              <div 
                onClick={() => handleToggle('includeFunnel')}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: `1px solid ${config.includeFunnel ? 'var(--brand-primary, #4f46e5)' : 'var(--border-default)'}`,
                  backgroundColor: config.includeFunnel ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  opacity: config.includeFunnel ? 1 : 0.65,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  marginTop: '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: config.includeFunnel ? 'var(--brand-primary, #4f46e5)' : 'transparent',
                  border: `1px solid ${config.includeFunnel ? 'var(--brand-primary, #4f46e5)' : 'var(--border-strong)'}`,
                  color: '#ffffff'
                }}>
                  {config.includeFunnel && <Check size={12} strokeWidth={3} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Target size={14} color="#6366f1" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      4 Aşamalı Büyüme Hunisi & ROAS / Ciro Projeksiyonu
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Gösterim ➔ Trafik ➔ Talep (Lead/Satış) ➔ Nitelikli Lead (CPQL) ➔ Ciro ve ROAS çarpanı.
                  </p>
                </div>
              </div>

              {/* 4. Keywords Table & Nested Filters */}
              <div 
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: `1px solid ${config.includeKeywords ? 'var(--brand-primary, #4f46e5)' : 'var(--border-default)'}`,
                  backgroundColor: config.includeKeywords ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-surface)',
                  opacity: config.includeKeywords ? 1 : 0.65,
                  transition: 'all 0.15s ease'
                }}
              >
                <div 
                  onClick={() => handleToggle('includeKeywords')}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    marginTop: '2px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: config.includeKeywords ? 'var(--brand-primary, #4f46e5)' : 'transparent',
                    border: `1px solid ${config.includeKeywords ? 'var(--brand-primary, #4f46e5)' : 'var(--border-strong)'}`,
                    color: '#ffffff'
                  }}>
                    {config.includeKeywords && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Search size={14} color="#f59e0b" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Anahtar Kelime & TBM Rekabet Tablosu
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-primary, #4f46e5)' }}>
                        {totalKws} Kelime Mevcut
                      </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                      Kelime listesi, arama niyetleri, aylık hacimler, 3 aylık trendler ve TBM aralıkları.
                    </p>
                  </div>
                </div>

                {/* Sub-options for keywords */}
                {config.includeKeywords && (
                  <div style={{
                    marginTop: '0.65rem',
                    paddingTop: '0.65rem',
                    borderTop: '1px solid var(--border-default)',
                    paddingLeft: '1.75rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.65rem'
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Kelime Kapsamı:
                      </label>
                      <select
                        value={config.keywordFilter}
                        onChange={e => setConfig(prev => ({ ...prev, keywordFilter: e.target.value as any }))}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-input, var(--bg-surface))',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 'var(--radius-sm, 6px)',
                          padding: '0.35rem 0.5rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-primary)',
                          outline: 'none'
                        }}
                      >
                        <option value="ALL">Tüm Kelimeler ({totalKws})</option>
                        <option value="SELECTED_ONLY">Sadece Seçilen Kelimeler</option>
                        <option value="AI_PICKS_ONLY">Sadece SEM Önerileri ({aiPicksCount})</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Satır Limiti:
                      </label>
                      <select
                        value={config.maxKeywordCount}
                        onChange={e => setConfig(prev => ({ ...prev, maxKeywordCount: Number(e.target.value) }))}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-input, var(--bg-surface))',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 'var(--radius-sm, 6px)',
                          padding: '0.35rem 0.5rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-primary)',
                          outline: 'none'
                        }}
                      >
                        <option value="25">İlk 25 Kelime</option>
                        <option value="50">İlk 50 Kelime (Standart)</option>
                        <option value="100">İlk 100 Kelime</option>
                        <option value="0">Tüm Kelimeleri Dahil Et (Sınırsız)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Negative Safeguards */}
              <div 
                onClick={() => handleToggle('includeNegativeKeywords')}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: `1px solid ${config.includeNegativeKeywords ? 'var(--brand-primary, #4f46e5)' : 'var(--border-default)'}`,
                  backgroundColor: config.includeNegativeKeywords ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  opacity: config.includeNegativeKeywords ? 1 : 0.65,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  marginTop: '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: config.includeNegativeKeywords ? 'var(--brand-primary, #4f46e5)' : 'transparent',
                  border: `1px solid ${config.includeNegativeKeywords ? 'var(--brand-primary, #4f46e5)' : 'var(--border-strong)'}`,
                  color: '#ffffff'
                }}>
                  {config.includeNegativeKeywords && <Check size={12} strokeWidth={3} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheck size={14} color="#ef4444" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Negatif Kelime Kalkanı & Koruma Listeleri
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Hariç tutulan negatif kategoriler ({subCampaign.negativeCategories?.length || 0} kategori) ve örnek terimler.
                  </p>
                </div>
              </div>

              {/* 6. Channel Parameters */}
              <div 
                onClick={() => handleToggle('includeChannelParameters')}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: `1px solid ${config.includeChannelParameters ? 'var(--brand-primary, #4f46e5)' : 'var(--border-default)'}`,
                  backgroundColor: config.includeChannelParameters ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  opacity: config.includeChannelParameters ? 1 : 0.65,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  marginTop: '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: config.includeChannelParameters ? 'var(--brand-primary, #4f46e5)' : 'transparent',
                  border: `1px solid ${config.includeChannelParameters ? 'var(--brand-primary, #4f46e5)' : 'var(--border-strong)'}`,
                  color: '#ffffff'
                }}>
                  {config.includeChannelParameters && <Check size={12} strokeWidth={3} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Settings size={14} color="#06b6d4" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Kanal & Simülasyon Hesaplama Parametreleri
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Hedef gösterim payı, beklenen TO, lead dönüşüm oranı (CR), sağlıklı lead oranları.
                  </p>
                </div>
              </div>

              {/* 7. Strategic Notes */}
              <div 
                onClick={() => handleToggle('includeStrategicNotes')}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: `1px solid ${config.includeStrategicNotes ? 'var(--brand-primary, #4f46e5)' : 'var(--border-default)'}`,
                  backgroundColor: config.includeStrategicNotes ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  opacity: config.includeStrategicNotes ? 1 : 0.65,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  marginTop: '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: config.includeStrategicNotes ? 'var(--brand-primary, #4f46e5)' : 'transparent',
                  border: `1px solid ${config.includeStrategicNotes ? 'var(--brand-primary, #4f46e5)' : 'var(--border-strong)'}`,
                  color: '#ffffff'
                }}>
                  {config.includeStrategicNotes && <Check size={12} strokeWidth={3} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={14} color="#a855f7" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Stratejik Uygulama & Kampanya Başlatma Notları
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Optimizasyon hedefleri, günlük harcama tavanı ve piksel/CAPI doğrulama yönergeleri.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface-elevated, var(--bg-surface))',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {format === 'CSV' ? 'Excel UTF-8 BOM destekli .csv dosyası' : 'A4 ve ekran uyumlu yüksek çözünürlüklü PDF'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-md, 8px)',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={activeSectionsCount === 0}
              style={{
                padding: '0.45rem 1.1rem',
                borderRadius: 'var(--radius-md, 8px)',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: activeSectionsCount === 0 ? 'not-allowed' : 'pointer',
                opacity: activeSectionsCount === 0 ? 0.5 : 1,
                border: 'none',
                color: '#ffffff',
                backgroundColor: format === 'CSV' ? '#10b981' : 'var(--brand-primary, #4f46e5)',
                boxShadow: format === 'CSV' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              {format === 'CSV' ? (
                <>
                  <FileSpreadsheet size={15} />
                  <span>CSV Olarak İndir</span>
                </>
              ) : (
                <>
                  <Printer size={15} />
                  <span>PDF Raporunu Aç</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
