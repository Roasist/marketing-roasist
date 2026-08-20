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
  SlidersHorizontal,
  Settings,
  Layers,
  BarChart2,
  Table
} from 'lucide-react';
import { SubCampaignItem, KeywordMetric } from '../types/forecast';
import { 
  ExportService, 
  SubCampaignExportConfig, 
  DEFAULT_EXPORT_CONFIG,
  VisibleMetricsConfig,
  VisibleKeywordColumnsConfig,
  DEFAULT_VISIBLE_METRICS,
  DEFAULT_VISIBLE_COLUMNS
} from '../services/exportService';

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
  const [activeTab, setActiveTab] = useState<'SECTIONS' | 'METRICS' | 'COLUMNS'>('SECTIONS');

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

  const handleMetricToggle = (key: keyof VisibleMetricsConfig) => {
    setConfig(prev => ({
      ...prev,
      visibleMetrics: {
        ...prev.visibleMetrics,
        [key]: !prev.visibleMetrics[key]
      }
    }));
  };

  const handleColumnToggle = (key: keyof VisibleKeywordColumnsConfig) => {
    setConfig(prev => ({
      ...prev,
      visibleKeywordColumns: {
        ...prev.visibleKeywordColumns,
        [key]: !prev.visibleKeywordColumns[key]
      }
    }));
  };

  const toggleAllMetrics = (select: boolean) => {
    const newMetrics: VisibleMetricsConfig = {
      budget: select,
      impressions: select,
      clicks: select,
      ctr: select,
      cpc: select,
      cpm: select,
      conversions: select,
      cpl: select,
      healthyLeads: select,
      cpql: select,
      deals: select,
      cac: select,
      revenue: select,
      roas: select
    };
    setConfig(prev => ({ ...prev, visibleMetrics: newMetrics }));
  };

  const toggleAllColumns = (select: boolean) => {
    const newColumns: VisibleKeywordColumnsConfig = {
      keyword: select,
      intent: select,
      volume: select,
      trend: select,
      competition: select,
      lowCpc: select,
      highCpc: select,
      avgCpc: select,
      opportunity: select,
      aiPick: select
    };
    setConfig(prev => ({ ...prev, visibleKeywordColumns: newColumns }));
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
        maxKeywordCount: 0,
        visibleMetrics: DEFAULT_VISIBLE_METRICS,
        visibleKeywordColumns: DEFAULT_VISIBLE_COLUMNS
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
        maxKeywordCount: 50,
        visibleMetrics: DEFAULT_VISIBLE_METRICS,
        visibleKeywordColumns: DEFAULT_VISIBLE_COLUMNS
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
        maxKeywordCount: 0,
        visibleMetrics: DEFAULT_VISIBLE_METRICS,
        visibleKeywordColumns: DEFAULT_VISIBLE_COLUMNS
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

  const activeSectionsCount = [
    config.includeGeneralInfo,
    config.includeKpiSummary,
    config.includeFunnel,
    config.includeKeywords,
    config.includeNegativeKeywords,
    config.includeChannelParameters,
    config.includeStrategicNotes
  ].filter(Boolean).length;

  const activeMetricsCount = Object.values(config.visibleMetrics).filter(Boolean).length;
  const activeColumnsCount = Object.values(config.visibleKeywordColumns).filter(Boolean).length;

  const metricLabels: { key: keyof VisibleMetricsConfig; label: string; desc: string; icon: string }[] = [
    { key: 'budget', label: 'Aylık Medya Bütçesi', desc: 'Net harcama tavanı ve günlük bütçe', icon: '💰' },
    { key: 'impressions', label: 'Gösterim (Impressions)', desc: 'Pazar içi toplam görüntülenme', icon: '👁️' },
    { key: 'clicks', label: 'Tıklama (Clicks)', desc: 'Web sitesi/Landing page trafiği', icon: '🖱️' },
    { key: 'ctr', label: 'Tıklama Oranı (CTR / TO)', desc: 'Gösterim / Tıklama verimliliği', icon: '📈' },
    { key: 'cpc', label: 'Tıklama Başı Maliyet (TBM / CPC)', desc: 'Sistem gerçek ortalama TBM', icon: '🏷️' },
    { key: 'cpm', label: 'Bin Gösterim Maliyeti (CPM)', desc: '1.000 gösterim maliyeti', icon: '📊' },
    { key: 'conversions', label: 'Brüt Dönüşüm (Leads / Satış)', desc: 'Form, WhatsApp, arama ve satış', icon: '🎯' },
    { key: 'cpl', label: 'Dönüşüm Başı Maliyet (CPL/CPA)', desc: 'Brüt talep / lead maliyeti', icon: '💵' },
    { key: 'healthyLeads', label: 'Nitelikli Talep (SQL Leads)', desc: 'Satışa uygun doğrulanmış lead', icon: '⭐' },
    { key: 'cpql', label: 'Nitelikli Lead Başı Maliyet (CPQL)', desc: 'Cost per Qualified Lead', icon: '💎' },
    { key: 'deals', label: 'Kapanan Müşteri (Deals)', desc: 'Satışa dönüşen nihai müşteri', icon: '🤝' },
    { key: 'cac', label: 'Müşteri Edinme Maliyeti (CAC)', desc: 'Müşteri başına net reklam maliyeti', icon: '💳' },
    { key: 'revenue', label: 'Ciro Projeksiyonu (Revenue)', desc: 'Tahmini toplam gelir', icon: '🚀' },
    { key: 'roas', label: 'Yatırım Getirisi (ROAS)', desc: 'Gelir / Harcama katı', icon: '🏆' }
  ];

  const columnLabels: { key: keyof VisibleKeywordColumnsConfig; label: string; desc: string }[] = [
    { key: 'keyword', label: 'Anahtar Kelime', desc: 'Kelime metni' },
    { key: 'intent', label: 'Arama Niyeti', desc: 'Ticari, Satın Alma, Bilgi' },
    { key: 'volume', label: 'Aylık Aranma Hacmi', desc: 'Resmi Google aylık arama adedi' },
    { key: 'trend', label: '3 Aylık Trend', desc: 'Yükseliş / Düşüş yüzdesi' },
    { key: 'competition', label: 'Rekabet Derecesi', desc: 'Düşük, Orta, Yüksek' },
    { key: 'lowCpc', label: 'Min TBM (₺)', desc: 'Sayfa üstü alt aralık TBM' },
    { key: 'highCpc', label: 'Max TBM (₺)', desc: 'Sayfa üstü üst aralık TBM' },
    { key: 'avgCpc', label: 'Ortalama TBM (₺)', desc: 'Sistem ortalama TBM' },
    { key: 'opportunity', label: 'Fırsat Skoru', desc: '1-100 ROAS potansiyeli' },
    { key: 'aiPick', label: 'SEM Uzmanı / AI Önerisi', desc: 'Yüksek dönüşümlü kelime etiketi' }
  ];

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
          maxWidth: '680px',
          maxHeight: '92vh',
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
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'linear-gradient(135deg, var(--brand-primary, #4f46e5) 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)'
            }}>
              <Sliders size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Rapor & Metrik Özelleştirme
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
                Alt kampanya raporunda görünecek metrikleri, sütunları ve bölümleri seçin.
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
            <X size={20} />
          </button>
        </div>

        {/* Sub-Campaign Prominent Ribbon (Alt Kampanya İsmi) */}
        <div style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(37, 99, 235, 0.07)',
          borderBottom: '1px solid rgba(37, 99, 235, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
            <span style={{ fontSize: '1.25rem' }}>{subCampaign.languageFlag || '🎯'}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary, #2563eb)', letterSpacing: '0.5px' }}>
                  Alt Kampanya:
                </span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                  {subCampaign.name || 'Alt Kampanya'}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {subCampaign.platform} ({subCampaign.objective}) • {subCampaign.languageName || 'Türkçe'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, flexShrink: 0, textAlign: 'right' }}>
            <div>
              <div style={{ color: '#2563eb', fontSize: '0.88rem' }}>
                ₺{(subCampaign.monthlyBudget || 0).toLocaleString('tr-TR')}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Aylık Bütçe</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '0 1rem',
          gap: '0.5rem',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('SECTIONS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'SECTIONS' ? 700 : 500,
              color: activeTab === 'SECTIONS' ? 'var(--brand-primary, #2563eb)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'SECTIONS' ? '2px solid var(--brand-primary, #2563eb)' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            <Layers size={15} />
            Bölüm & Kapsam
            <span style={{
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: '99px',
              backgroundColor: activeTab === 'SECTIONS' ? 'rgba(37,99,235,0.15)' : 'var(--bg-surface)',
              fontWeight: 700
            }}>
              {activeSectionsCount}/7
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('METRICS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'METRICS' ? 700 : 500,
              color: activeTab === 'METRICS' ? 'var(--brand-primary, #2563eb)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'METRICS' ? '2px solid var(--brand-primary, #2563eb)' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            <BarChart2 size={15} />
            KPI & Huni Metrikleri
            <span style={{
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: '99px',
              backgroundColor: activeTab === 'METRICS' ? 'rgba(37,99,235,0.15)' : 'var(--bg-surface)',
              fontWeight: 700
            }}>
              {activeMetricsCount}/14
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COLUMNS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'COLUMNS' ? 700 : 500,
              color: activeTab === 'COLUMNS' ? 'var(--brand-primary, #2563eb)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'COLUMNS' ? '2px solid var(--brand-primary, #2563eb)' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            <Table size={15} />
            Kelime Tablosu Sütunları
            <span style={{
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: '99px',
              backgroundColor: activeTab === 'COLUMNS' ? 'rgba(37,99,235,0.15)' : 'var(--bg-surface)',
              fontWeight: 700
            }}>
              {activeColumnsCount}/10
            </span>
          </button>
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

          {/* TAB 1: SECTIONS & PRESETS */}
          {activeTab === 'SECTIONS' && (
            <>
              {/* Output Format Selector */}
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
                      opacity: config.includeGeneralInfo ? 1 : 0.65
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
                        <SlidersHorizontal size={14} color="#6366f1" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>1. Alt Kampanya & Künye Bilgileri</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Alt kampanya adı ({subCampaign.name}), çatı plan, dil ({subCampaign.languageName || 'Türkçe'}), hedef lokasyonlar ve iş modeli.
                      </div>
                    </div>
                  </div>

                  {/* 2. UNIFIED GROWTH BLOCK WITH SUB-TOGGLES */}
                  <div style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'rgba(248, 250, 252, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border-subtle, #e2e8f0)', paddingBottom: '0.4rem' }}>
                      <TrendingUp size={15} color="#4f46e5" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        2. Kampanya Büyüme Modeli, Simülasyon & Dönüşüm Hunisi
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingLeft: '0.25rem' }}>
                      {/* 2.1 Parameters */}
                      <div 
                        onClick={() => handleToggle('includeChannelParameters')}
                        style={{
                          padding: '0.5rem 0.65rem',
                          borderRadius: '6px',
                          border: `1px solid ${config.includeChannelParameters ? 'var(--brand-primary, #4f46e5)' : 'var(--border-default)'}`,
                          backgroundColor: config.includeChannelParameters ? 'rgba(79, 70, 229, 0.05)' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          cursor: 'pointer',
                          opacity: config.includeChannelParameters ? 1 : 0.65
                        }}
                      >
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: config.includeChannelParameters ? 'var(--brand-primary, #4f46e5)' : 'transparent',
                          border: `1px solid ${config.includeChannelParameters ? 'var(--brand-primary, #4f46e5)' : 'var(--border-strong)'}`,
                          color: '#ffffff'
                        }}>
                          {config.includeChannelParameters && <Check size={11} strokeWidth={3} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Settings size={12} color="#64748b" />
                            <span>Simülasyon Hesaplama Parametreleri</span>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                            Hedef Gösterim Payı (IS), TO, CR, SQL oranı ve satış kapatma oranları.
                          </div>
                        </div>
                      </div>

                      {/* 2.2 Funnel */}
                      <div 
                        onClick={() => handleToggle('includeFunnel')}
                        style={{
                          padding: '0.5rem 0.65rem',
                          borderRadius: '6px',
                          border: `1px solid ${config.includeFunnel ? 'var(--brand-primary, #4f46e5)' : 'var(--border-default)'}`,
                          backgroundColor: config.includeFunnel ? 'rgba(79, 70, 229, 0.05)' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          cursor: 'pointer',
                          opacity: config.includeFunnel ? 1 : 0.65
                        }}
                      >
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: config.includeFunnel ? 'var(--brand-primary, #4f46e5)' : 'transparent',
                          border: `1px solid ${config.includeFunnel ? 'var(--brand-primary, #4f46e5)' : 'var(--border-strong)'}`,
                          color: '#ffffff'
                        }}>
                          {config.includeFunnel && <Check size={11} strokeWidth={3} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Target size={12} color="#8b5cf6" />
                            <span>Uçtan Uca Dönüşüm Hunisi Projeksiyonu</span>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                            Pazar Gösterimi → Nitelikli Trafik → SQL Lead / Satış Akışı.
                          </div>
                        </div>
                      </div>

                      {/* 2.3 KPI Summary */}
                      <div 
                        onClick={() => handleToggle('includeKpiSummary')}
                        style={{
                          padding: '0.5rem 0.65rem',
                          borderRadius: '6px',
                          border: `1px solid ${config.includeKpiSummary ? 'var(--brand-primary, #4f46e5)' : 'var(--border-default)'}`,
                          backgroundColor: config.includeKpiSummary ? 'rgba(79, 70, 229, 0.05)' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          cursor: 'pointer',
                          opacity: config.includeKpiSummary ? 1 : 0.65
                        }}
                      >
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: config.includeKpiSummary ? 'var(--brand-primary, #4f46e5)' : 'transparent',
                          border: `1px solid ${config.includeKpiSummary ? 'var(--brand-primary, #4f46e5)' : 'var(--border-strong)'}`,
                          color: '#ffffff'
                        }}>
                          {config.includeKpiSummary && <Check size={11} strokeWidth={3} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <TrendingUp size={12} color="#10b981" />
                            <span>Temel Performans & Finansal KPI Kartları</span>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                            Aylık Bütçe, Ortalama TBM/CPM, CPL/CPQL veya Ciro/ROAS.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Keywords */}
                  <div 
                    onClick={() => handleToggle('includeKeywords')}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-md, 8px)',
                      border: `1px solid ${config.includeKeywords ? 'var(--brand-primary, #4f46e5)' : 'var(--border-default)'}`,
                      backgroundColor: config.includeKeywords ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      cursor: 'pointer',
                      opacity: config.includeKeywords ? 1 : 0.65
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Search size={14} color="#3b82f6" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>3. Anahtar Kelimeler & TBM Analiz Tablosu</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Arama hacmi, niyet, min/max/ort TBM ve fırsat skoru ({totalKws} kelime mevcut).
                      </div>
                    </div>
                  </div>

                  {/* 4. Negatives */}
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
                      opacity: config.includeNegativeKeywords ? 1 : 0.65
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
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>4. Negatif Kelime Koruma Kalkanı</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Bütçe israfını önleyen negatif anahtar kelime kategorileri ve filtreler.
                      </div>
                    </div>
                  </div>

                  {/* 5. Strategic Notes */}
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
                      opacity: config.includeStrategicNotes ? 1 : 0.65
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
                        <Sparkles size={14} color="#f59e0b" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>5. Stratejik Uygulama & Kampanya Notları</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Kanal lansman tavsiyeleri, piksel doğrulama ve optimizasyon ipuçları.
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}

          {/* TAB 2: METRICS VISIBILITY SELECTION */}
          {activeTab === 'METRICS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Raporda Gösterilecek Metrikler</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Raporda ve KPI kartlarında yer almasını istediğiniz metrikleri seçin veya gizleyin.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => toggleAllMetrics(true)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Tümünü Seç
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAllMetrics(false)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Temizle
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {metricLabels.map(m => {
                  const isChecked = config.visibleMetrics[m.key];
                  return (
                    <div
                      key={m.key}
                      onClick={() => handleMetricToggle(m.key)}
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-md, 8px)',
                        border: `1px solid ${isChecked ? 'var(--brand-primary, #2563eb)' : 'var(--border-default)'}`,
                        backgroundColor: isChecked ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        cursor: 'pointer',
                        opacity: isChecked ? 1 : 0.6,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isChecked ? 'var(--brand-primary, #2563eb)' : 'transparent',
                        border: `1px solid ${isChecked ? 'var(--brand-primary, #2563eb)' : 'var(--border-strong)'}`,
                        color: '#ffffff',
                        flexShrink: 0
                      }}>
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.85rem' }}>{m.icon}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.label}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: KEYWORD COLUMNS & FILTERS */}
          {activeTab === 'COLUMNS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Keyword Filters */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                  Kelime Filtresi & Kapsamı
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, keywordFilter: 'ALL' }))}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md, 8px)',
                      border: config.keywordFilter === 'ALL' ? '2px solid var(--brand-primary, #4f46e5)' : '1px solid var(--border-default)',
                      backgroundColor: config.keywordFilter === 'ALL' ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    <div>Tüm Kelimeler</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{totalKws} Kelime</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, keywordFilter: 'SELECTED_ONLY' }))}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md, 8px)',
                      border: config.keywordFilter === 'SELECTED_ONLY' ? '2px solid #10b981' : '1px solid var(--border-default)',
                      backgroundColor: config.keywordFilter === 'SELECTED_ONLY' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    <div>Seçilenler</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      {subCampaign.selectedKeywords?.length || totalKws} Kelime
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, keywordFilter: 'AI_PICKS_ONLY' }))}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md, 8px)',
                      border: config.keywordFilter === 'AI_PICKS_ONLY' ? '2px solid #8b5cf6' : '1px solid var(--border-default)',
                      backgroundColor: config.keywordFilter === 'AI_PICKS_ONLY' ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    <div>SEM / AI Önerileri</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{aiPicksCount} Kelime</div>
                  </button>
                </div>
              </div>

              {/* Keyword Table Columns Selection */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tabloda Görünecek Kelime Sütunları
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => toggleAllColumns(true)}
                      style={{
                        padding: '3px 7px',
                        fontSize: '0.68rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border-default)',
                        background: 'var(--bg-surface-elevated)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Tümünü Seç
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllColumns(false)}
                      style={{
                        padding: '3px 7px',
                        fontSize: '0.68rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border-default)',
                        background: 'var(--bg-surface-elevated)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Temizle
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {columnLabels.map(col => {
                    const isChecked = config.visibleKeywordColumns[col.key];
                    return (
                      <div
                        key={col.key}
                        onClick={() => handleColumnToggle(col.key)}
                        style={{
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-md, 8px)',
                          border: `1px solid ${isChecked ? 'var(--brand-primary, #2563eb)' : 'var(--border-default)'}`,
                          backgroundColor: isChecked ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          cursor: 'pointer',
                          opacity: isChecked ? 1 : 0.6,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isChecked ? 'var(--brand-primary, #2563eb)' : 'transparent',
                          border: `1px solid ${isChecked ? 'var(--brand-primary, #2563eb)' : 'var(--border-strong)'}`,
                          color: '#ffffff',
                          flexShrink: 0
                        }}>
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {col.label}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                            {col.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Max Keyword Limit */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                  Kelime Adedi Limiti (0 = Tüm Kelimeler)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={config.maxKeywordCount}
                  onChange={e => setConfig(prev => ({ ...prev, maxKeywordCount: parseInt(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="0 (Sınırsız)"
                />
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface-elevated, var(--bg-surface))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <strong>{activeSectionsCount}</strong> bölüm • <strong>{activeMetricsCount}</strong> metrik • <strong>{activeColumnsCount}</strong> sütun
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleExport}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: 'none',
                background: format === 'CSV' 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, var(--brand-primary, #4f46e5) 0%, #2563eb 100%)',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: format === 'CSV' 
                  ? '0 4px 12px rgba(16, 185, 129, 0.3)' 
                  : '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
            >
              {format === 'CSV' ? <FileSpreadsheet size={16} /> : <Printer size={16} />}
              {format === 'CSV' ? 'CSV Olarak İndir' : 'PDF Olarak Yazdır / Kaydet'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
