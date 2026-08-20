import React, { useState } from 'react';
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
import { SubCampaignItem } from '../types/forecast';
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

  // Sync format with initialFormat when opened
  React.useEffect(() => {
    if (isOpen) {
      setFormat(initialFormat);
    }
  }, [isOpen, initialFormat]);

  if (!isOpen || !subCampaign) return null;

  const totalKws = (subCampaign.selectedKeywords && subCampaign.selectedKeywords.length > 0)
    ? subCampaign.selectedKeywords.length
    : (subCampaign.discoveredKeywords || []).length;

  const aiPicksCount = (subCampaign.selectedKeywords && subCampaign.selectedKeywords.length > 0
    ? subCampaign.selectedKeywords
    : (subCampaign.discoveredKeywords || [])).filter(k => k.isAiStrategistPick).length;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Rapor Özelleştirme & Dışa Aktarma</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {format}
                </span>
              </div>
              <p className="text-xs text-slate-400">Raporda yer alacak bölümleri ve detay filtrelerini yapılandırın.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Campaign Info Ribbon */}
        <div className="px-6 py-3 bg-slate-800/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="text-base">{subCampaign.languageFlag || '🌐'}</span>
            <span className="font-semibold text-slate-200 truncate">{subCampaign.name || 'Alt Kampanya'}</span>
            <span className="text-slate-400">• {subCampaign.platform}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 shrink-0 font-medium">
            <span className="text-indigo-300 font-bold">₺{(subCampaign.monthlyBudget || 0).toLocaleString('tr-TR')} / ay</span>
            {masterPlan?.name && <span className="text-slate-400 hidden sm:inline">({masterPlan.name})</span>}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          
          {/* Format Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Çıktı Formatı
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('PDF')}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  format === 'PDF'
                    ? 'bg-indigo-600/20 border-indigo-500/80 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${format === 'PDF' ? 'bg-indigo-600 text-white' : 'bg-slate-700/60 text-slate-400'}`}>
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">PDF & Baskı Raporu</div>
                  <div className="text-[11px] text-slate-400">Yönetici sunum ve görsel rapor</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('CSV')}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  format === 'CSV'
                    ? 'bg-emerald-600/20 border-emerald-500/80 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${format === 'CSV' ? 'bg-emerald-600 text-white' : 'bg-slate-700/60 text-slate-400'}`}>
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Excel / CSV Tablosu</div>
                  <div className="text-[11px] text-slate-400">Ham veri ve Excel analiz seti</div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Hızlı Şablonlar
              </label>
              <span className="text-[11px] text-slate-400">{activeSectionsCount} / 7 Bölüm Seçili</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('ALL')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Tam Rapor (Tümü)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('EXECUTIVE')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                Yönetici KPI & Huni
              </button>
              <button
                type="button"
                onClick={() => applyPreset('KEYWORDS_ONLY')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                Kelime & Fırsat Analizi
              </button>
            </div>
          </div>

          {/* Sections Customization */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Rapora Dahil Edilecek Bölümler
            </label>
            <div className="space-y-2.5">
              
              {/* 1. General Info */}
              <div 
                onClick={() => handleToggle('includeGeneralInfo')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  config.includeGeneralInfo 
                    ? 'bg-slate-800/80 border-indigo-500/50' 
                    : 'bg-slate-800/30 border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                  config.includeGeneralInfo ? 'bg-indigo-600 text-white' : 'border border-slate-600 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-slate-200">Genel Bilgiler & Çatı Kampanya Eşleşmesi</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kampanya adı, platform hedefi, hedef dil ({subCampaign.languageName || 'Türkçe'}), hedef lokasyonlar ve bütçe.
                  </p>
                </div>
              </div>

              {/* 2. KPI Summary */}
              <div 
                onClick={() => handleToggle('includeKpiSummary')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  config.includeKpiSummary 
                    ? 'bg-slate-800/80 border-indigo-500/50' 
                    : 'bg-slate-800/30 border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                  config.includeKpiSummary ? 'bg-indigo-600 text-white' : 'border border-slate-600 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">Temel Metrikler & KPI Performans Özeti</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Aylık medya yatırımı, tahmini gösterim, trafik (tıklama), ortalama TBM ve TO (CTR).
                  </p>
                </div>
              </div>

              {/* 3. Funnel */}
              <div 
                onClick={() => handleToggle('includeFunnel')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  config.includeFunnel 
                    ? 'bg-slate-800/80 border-indigo-500/50' 
                    : 'bg-slate-800/30 border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                  config.includeFunnel ? 'bg-indigo-600 text-white' : 'border border-slate-600 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-200">4 Aşamalı Büyüme Hunisi & ROAS / Ciro Projeksiyonu</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Gösterim ➔ Trafik ➔ Talep (Lead/Satış) ➔ Nitelikli Lead (CPQL) ➔ Ciro ve ROAS çarpanı.
                  </p>
                </div>
              </div>

              {/* 4. Keywords Table & Nested Filters */}
              <div 
                className={`p-3.5 rounded-xl border transition-all ${
                  config.includeKeywords 
                    ? 'bg-slate-800/80 border-indigo-500/50' 
                    : 'bg-slate-800/30 border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <div 
                  onClick={() => handleToggle('includeKeywords')}
                  className="flex items-start gap-3 cursor-pointer"
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                    config.includeKeywords ? 'bg-indigo-600 text-white' : 'border border-slate-600 text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-slate-200">Anahtar Kelime & TBM Rekabet Tablosu</span>
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-300">
                        {totalKws} Kelime Mevcut
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Kelime listesi, arama niyetleri, aylık aranma hacimleri, 3 aylık trendler, rekabet ve TBM aralıkları.
                    </p>
                  </div>
                </div>

                {/* Sub-options for keywords (only shown when keywords enabled) */}
                {config.includeKeywords && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60 pl-8 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Kelime Kapsamı
                        </label>
                        <select
                          value={config.keywordFilter}
                          onChange={e => setConfig(prev => ({ ...prev, keywordFilter: e.target.value as any }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="ALL">Tüm Kelimeler ({totalKws})</option>
                          <option value="SELECTED_ONLY">Sadece Seçilen Kelimeler</option>
                          <option value="AI_PICKS_ONLY">Sadece SEM Stratejist Önerileri ({aiPicksCount})</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Tablo Satır Limiti
                        </label>
                        <select
                          value={config.maxKeywordCount}
                          onChange={e => setConfig(prev => ({ ...prev, maxKeywordCount: Number(e.target.value) }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="25">İlk 25 Kelime</option>
                          <option value="50">İlk 50 Kelime (Standart)</option>
                          <option value="100">İlk 100 Kelime</option>
                          <option value="0">Tüm Kelimeleri Dahil Et (Sınırsız)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Negative Safeguards */}
              <div 
                onClick={() => handleToggle('includeNegativeKeywords')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  config.includeNegativeKeywords 
                    ? 'bg-slate-800/80 border-indigo-500/50' 
                    : 'bg-slate-800/30 border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                  config.includeNegativeKeywords ? 'bg-indigo-600 text-white' : 'border border-slate-600 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-slate-200">Negatif Kelime Kalkanı & Koruma Listeleri</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hariç tutulan negatif kategoriler ({subCampaign.negativeCategories?.length || 0} kategori) ve örnek negatif terimler.
                  </p>
                </div>
              </div>

              {/* 6. Channel Parameters */}
              <div 
                onClick={() => handleToggle('includeChannelParameters')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  config.includeChannelParameters 
                    ? 'bg-slate-800/80 border-indigo-500/50' 
                    : 'bg-slate-800/30 border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                  config.includeChannelParameters ? 'bg-indigo-600 text-white' : 'border border-slate-600 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200">Kanal & Simülasyon Hesaplama Parametreleri</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hedef gösterim payı, beklenen TO, lead dönüşüm oranı (CR), sağlıklı lead ve kapanış yüzdeleri.
                  </p>
                </div>
              </div>

              {/* 7. Strategic Notes */}
              <div 
                onClick={() => handleToggle('includeStrategicNotes')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  config.includeStrategicNotes 
                    ? 'bg-slate-800/80 border-indigo-500/50' 
                    : 'bg-slate-800/30 border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                  config.includeStrategicNotes ? 'bg-indigo-600 text-white' : 'border border-slate-600 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-slate-200">Stratejik Uygulama & Kampanya Başlatma Notları</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Optimizasyon hedefleri, günlük harcama tavanı ve piksel/CAPI doğrulama yönergeleri.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-10">
          <div className="text-xs text-slate-400">
            {format === 'CSV' ? 'Excel UTF-8 BOM destekli .csv dosyası' : 'A4 ve ekran uyumlu yüksek çözünürlüklü PDF'}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={activeSectionsCount === 0}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                activeSectionsCount === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : format === 'CSV'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-500/20'
              }`}
            >
              {format === 'CSV' ? (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>CSV Olarak İndir</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
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
