import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Eye, 
  ShieldAlert, 
  Download, 
  Save, 
  Layers, 
  Sliders, 
  Check, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Target,
  FolderDown,
  Globe,
  Languages,
  CheckCircle2
} from 'lucide-react';
import { KeywordMetric, ForecastSimulation, NegativeCategory, ForecastPlan, CountryOption, CountryMetric } from '../types/forecast';
import { ApiService } from '../services/apiService';

const DEFAULT_GLOBAL_COUNTRIES: CountryOption[] = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷', region: 'Yerel', cpcMultiplier: 1.0, volumeMultiplier: 1.0, currency: 'TRY' },
  { code: 'RU', name: 'Rusya', flag: '🇷🇺', region: 'BDT', cpcMultiplier: 0.95, volumeMultiplier: 1.2, currency: 'RUB' },
  { code: 'KZ', name: 'Kazakistan', flag: '🇰🇿', region: 'BDT', cpcMultiplier: 0.75, volumeMultiplier: 0.45, currency: 'KZT' },
  { code: 'UZ', name: 'Özbekistan', flag: '🇺🇿', region: 'BDT', cpcMultiplier: 0.65, volumeMultiplier: 0.35, currency: 'UZS' },
  { code: 'AE', name: 'BAE / Dubai', flag: '🇦🇪', region: 'Körfez', cpcMultiplier: 2.2, volumeMultiplier: 0.25, currency: 'AED' },
  { code: 'SA', name: 'Suudi Arabistan', flag: '🇸🇦', region: 'Körfez', cpcMultiplier: 1.8, volumeMultiplier: 0.4, currency: 'SAR' },
  { code: 'DE', name: 'Almanya', flag: '🇩🇪', region: 'Avrupa', cpcMultiplier: 1.9, volumeMultiplier: 0.6, currency: 'EUR' },
  { code: 'GB', name: 'İngiltere', flag: '🇬🇧', region: 'Avrupa', cpcMultiplier: 2.1, volumeMultiplier: 0.55, currency: 'GBP' },
  { code: 'US', name: 'Amerika (ABD)', flag: '🇺🇸', region: 'Amerika', cpcMultiplier: 2.5, volumeMultiplier: 1.5, currency: 'USD' },
  { code: 'NL', name: 'Hollanda', flag: '🇳🇱', region: 'Avrupa', cpcMultiplier: 1.85, volumeMultiplier: 0.3, currency: 'EUR' },
  { code: 'AZ', name: 'Azerbaycan', flag: '🇦🇿', region: 'Kafkas', cpcMultiplier: 0.7, volumeMultiplier: 0.3, currency: 'AZN' },
];

interface ForecastModuleProps {
  workspaceId?: string;
}

export const ForecastModule: React.FC<ForecastModuleProps> = ({ workspaceId }) => {
  // Search & Discovery State
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'URL' | 'KEYWORDS'>('URL');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1 Output: Auto-Detected Language & Page Details
  const [sectorName, setSectorName] = useState<string>('');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('tr');
  const [detectedLanguageName, setDetectedLanguageName] = useState<string>('Türkçe');
  const [pageTitle, setPageTitle] = useState<string>('');
  const [pageSummary, setPageSummary] = useState<string>('');
  const [keywords, setKeywords] = useState<KeywordMetric[]>([]);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<Set<string>>(new Set());

  // Step 2: Target Countries / Multi-Market Selection
  const [availableCountries, setAvailableCountries] = useState<CountryOption[]>(DEFAULT_GLOBAL_COUNTRIES);
  const [selectedCountryCodes, setSelectedCountryCodes] = useState<Set<string>>(new Set(['RU', 'KZ', 'AE', 'TR']));

  // Filter & Sort State
  const [activeTab, setActiveTab] = useState<'matrix' | 'simulator' | 'negatives' | 'saved-plans'>('matrix');
  const [searchFilter, setSearchFilter] = useState('');
  const [intentFilter, setIntentFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'VOLUME' | 'CPC_LOW' | 'CPC_HIGH' | 'OPPORTUNITY' | 'TREND'>('OPPORTUNITY');

  // Simulation Parameters
  const [monthlyBudget, setMonthlyBudget] = useState<number>(35000);
  const [conversionRate, setConversionRate] = useState<number>(2.4); // 2.4%
  const [avgOrderValue, setAvgOrderValue] = useState<number>(3500); // 3500 ₺

  // Negative Keywords State
  const [negativeCategories, setNegativeCategories] = useState<NegativeCategory[]>([]);
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null);

  // Saved Plans State
  const [savedPlans, setSavedPlans] = useState<ForecastPlan[]>([]);
  const [planSaveSuccess, setPlanSaveSuccess] = useState(false);

  // Load Saved Plans on Workspace change
  const loadSavedPlans = async () => {
    try {
      const plans = await ApiService.getForecastPlans(workspaceId);
      setSavedPlans(plans || []);
    } catch {
      setSavedPlans([]);
    }
  };

  useEffect(() => {
    loadSavedPlans();
  }, [workspaceId]);

  // Execute Keyword Discovery (Step 1)
  const handleDiscover = async (customQuery?: string, customMode?: 'URL' | 'KEYWORDS') => {
    const q = customQuery || query;
    const m = customMode || mode;
    if (!q.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await ApiService.discoverKeywords({
        query: q.trim(),
        mode: m,
      });

      if (res && res.keywords && res.keywords.length > 0) {
        setKeywords(res.keywords);
        setSectorName(res.sector || 'Genel');
        setDetectedLanguage(res.detectedLanguage || 'tr');
        setDetectedLanguageName(res.detectedLanguageName || 'Türkçe');
        setPageTitle(res.pageTitle || '');
        setPageSummary(res.pageSummary || '');

        // If AI suggested specific target countries for this language/sector, update them
        if (res.suggestedCountries && res.suggestedCountries.length > 0) {
          setAvailableCountries(res.suggestedCountries);
          const initialCodes = new Set<string>(res.suggestedCountries.slice(0, 4).map((c: any) => c.code));
          setSelectedCountryCodes(initialCodes);
        } else {
          // Default selection based on language
          if (res.detectedLanguage === 'ru') {
            setSelectedCountryCodes(new Set(['RU', 'KZ', 'UZ', 'AE', 'TR']));
          } else if (res.detectedLanguage === 'ar') {
            setSelectedCountryCodes(new Set(['SA', 'AE', 'KW', 'QA', 'TR']));
          } else if (res.detectedLanguage === 'de') {
            setSelectedCountryCodes(new Set(['DE', 'AT', 'CH', 'TR']));
          } else if (res.detectedLanguage === 'en') {
            setSelectedCountryCodes(new Set(['US', 'GB', 'AE', 'CA']));
          } else {
            setSelectedCountryCodes(new Set(['TR']));
          }
        }

        // Auto-select all keywords by default
        const allIds = new Set<string>(res.keywords.map((k: KeywordMetric) => k.id));
        setSelectedKeywordIds(allIds);

        // Fetch negative keywords in the detected language
        loadNegatives(res.sector || 'Genel', res.keywords.map((k: KeywordMetric) => k.keyword), res.detectedLanguage || 'tr');
      } else {
        setErrorMsg('Bu arama için anahtar kelime verisi üretilemedi.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Veri çekilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNegatives = async (sector: string, kwList: string[], lang: string) => {
    try {
      const cats = await ApiService.generateNegativeKeywords({
        sector,
        keywords: kwList.slice(0, 15),
        language: lang
      });
      setNegativeCategories(cats || []);
    } catch {
      // Non-blocking
    }
  };

  // Keyword Selection Handlers
  const toggleSelectAll = () => {
    if (selectedKeywordIds.size === filteredKeywords.length) {
      setSelectedKeywordIds(new Set());
    } else {
      setSelectedKeywordIds(new Set(filteredKeywords.map(k => k.id)));
    }
  };

  const toggleKeyword = (id: string) => {
    const next = new Set(selectedKeywordIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedKeywordIds(next);
  };

  // Country Selection Handlers (Step 2)
  const toggleCountry = (code: string) => {
    const next = new Set(selectedCountryCodes);
    if (next.has(code)) {
      if (next.size > 1) {
        next.delete(code);
      }
    } else {
      next.add(code);
    }
    setSelectedCountryCodes(next);
  };

  const selectRegionPreset = (codes: string[]) => {
    setSelectedCountryCodes(new Set(codes));
  };

  // Active Countries List
  const activeCountries = useMemo(() => {
    return availableCountries.filter(c => selectedCountryCodes.has(c.code));
  }, [availableCountries, selectedCountryCodes]);

  // Combined Multipliers for Multi-Country Targeting
  const totalVolumeMultiplier = useMemo(() => {
    if (activeCountries.length === 0) return 1.0;
    return activeCountries.reduce((sum, c) => sum + c.volumeMultiplier, 0);
  }, [activeCountries]);

  const blendedCpcMultiplier = useMemo(() => {
    if (activeCountries.length === 0) return 1.0;
    const totalVol = activeCountries.reduce((sum, c) => sum + c.volumeMultiplier, 0);
    if (totalVol === 0) return 1.0;
    const weightedSum = activeCountries.reduce((sum, c) => sum + (c.cpcMultiplier * c.volumeMultiplier), 0);
    return weightedSum / totalVol;
  }, [activeCountries]);

  // Filtered & Sorted Keywords
  const filteredKeywords = useMemo(() => {
    return keywords
      .filter(k => {
        const matchesQuery = k.keyword.toLowerCase().includes(searchFilter.toLowerCase());
        const matchesIntent = intentFilter === 'ALL' || k.intent === intentFilter;
        return matchesQuery && matchesIntent;
      })
      .sort((a, b) => {
        if (sortBy === 'VOLUME') return b.monthlyVolume - a.monthlyVolume;
        if (sortBy === 'CPC_LOW') return a.lowCpc - b.lowCpc;
        if (sortBy === 'CPC_HIGH') return b.highCpc - a.highCpc;
        if (sortBy === 'OPPORTUNITY') return b.opportunityScore - a.opportunityScore;
        if (sortBy === 'TREND') return b.trendChangePercent - a.trendChangePercent;
        return 0;
      });
  }, [keywords, searchFilter, intentFilter, sortBy]);

  // Selected Keyword Pool for Simulation
  const selectedKeywordsPool = useMemo(() => {
    if (selectedKeywordIds.size === 0) return keywords;
    return keywords.filter(k => selectedKeywordIds.has(k.id));
  }, [keywords, selectedKeywordIds]);

  // Overall Aggregate KPIs (Scaled with Active Target Countries)
  const baseSearchVolume = useMemo(() => {
    return selectedKeywordsPool.reduce((acc, k) => acc + k.monthlyVolume, 0);
  }, [selectedKeywordsPool]);

  const totalSearchVolume = useMemo(() => {
    return Math.round(baseSearchVolume * totalVolumeMultiplier);
  }, [baseSearchVolume, totalVolumeMultiplier]);

  const avgTopPageCpc = useMemo(() => {
    if (selectedKeywordsPool.length === 0) return 0;
    const sum = selectedKeywordsPool.reduce((acc, k) => acc + ((k.lowCpc + k.highCpc) / 2), 0);
    const baseAvg = sum / selectedKeywordsPool.length;
    return Math.round(baseAvg * blendedCpcMultiplier * 100) / 100;
  }, [selectedKeywordsPool, blendedCpcMultiplier]);

  const highIntentRatio = useMemo(() => {
    if (selectedKeywordsPool.length === 0) return 0;
    const high = selectedKeywordsPool.filter(k => k.intent === 'TRANSACTIONAL').length;
    return Math.round((high / selectedKeywordsPool.length) * 100);
  }, [selectedKeywordsPool]);

  // 🎛️ Real-Time Dynamic Simulation Calculation
  const simulation: ForecastSimulation = useMemo(() => {
    const activeCpc = avgTopPageCpc > 0 ? avgTopPageCpc : 6.50;
    const dailyBudget = monthlyBudget / 30.4;
    const rawClicks = Math.floor(monthlyBudget / activeCpc);
    const estClicks = Math.max(10, rawClicks);
    const avgCtr = 4.8;
    const estImpressions = Math.round(estClicks / (avgCtr / 100));
    const convPct = conversionRate / 100;
    const estConversions = Math.round(estClicks * convPct);
    const cpa = estConversions > 0 ? Math.round(monthlyBudget / estConversions) : monthlyBudget;
    const estRevenue = estConversions * avgOrderValue;
    const projectedRoas = monthlyBudget > 0 ? Math.round((estRevenue / monthlyBudget) * 10) / 10 : 0;

    return {
      monthlyBudget,
      dailyBudget: Math.round(dailyBudget),
      estClicks,
      estImpressions,
      avgCpc: activeCpc,
      avgCtr,
      conversionRate,
      estConversions,
      cpa,
      avgOrderValue,
      estRevenue,
      projectedRoas,
      targetCountries: Array.from(selectedCountryCodes)
    };
  }, [monthlyBudget, avgTopPageCpc, conversionRate, avgOrderValue, selectedCountryCodes]);

  // Country Breakdown Metrics
  const countryBreakdown: CountryMetric[] = useMemo(() => {
    if (activeCountries.length === 0) return [];
    const totalWeight = activeCountries.reduce((s, c) => s + c.volumeMultiplier, 0);
    return activeCountries.map(c => {
      const share = totalWeight > 0 ? (c.volumeMultiplier / totalWeight) : (1 / activeCountries.length);
      const cVol = Math.round(baseSearchVolume * c.volumeMultiplier);
      const cCpc = Math.round((avgTopPageCpc / blendedCpcMultiplier) * c.cpcMultiplier * 100) / 100;
      const cClicks = Math.round((simulation.estClicks || 0) * share);
      const cConvs = Math.round((simulation.estConversions || 0) * share);
      return {
        code: c.code,
        name: c.name,
        flag: c.flag,
        sharePercent: Math.round(share * 100),
        monthlyVolume: cVol,
        avgCpc: cCpc,
        estClicks: cClicks,
        estConversions: cConvs,
      };
    });
  }, [activeCountries, baseSearchVolume, avgTopPageCpc, blendedCpcMultiplier, simulation]);

  // Save Plan Action
  const handleSavePlan = async () => {
    try {
      await ApiService.saveForecastPlan({
        workspaceId,
        name: `${query} (${sectorName}) - ₺${monthlyBudget.toLocaleString('tr-TR')} Bütçe Planı`,
        targetUrl: mode === 'URL' ? query : '',
        seedKeywords: mode === 'KEYWORDS' ? query : '',
        monthlyBudget,
        selectedKeywords: selectedKeywordsPool,
        simulationResult: simulation,
        negativeKeywords: negativeCategories
      });
      setPlanSaveSuccess(true);
      setTimeout(() => setPlanSaveSuccess(false), 2500);
      loadSavedPlans();
    } catch (err: any) {
      alert('Plan kaydedilirken hata: ' + err.message);
    }
  };

  // Copy Negative Keywords to Clipboard
  const handleCopyNegatives = (words: string[], categoryTitle: string) => {
    const text = words.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedCategory(categoryTitle);
    setTimeout(() => setCopiedCategory(null), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Anahtar Kelime', 'Aylık Hacim', 'Min TBM (TL)', 'Max TBM (TL)', 'Rekabet', 'Arama Niyeti', 'Fırsat Skoru'];
    const rows = filteredKeywords.map(k => [
      `"${k.keyword}"`,
      k.monthlyVolume,
      k.lowCpc,
      k.highCpc,
      k.competition,
      k.intent,
      k.opportunityScore
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Roasist_Forecast_${query.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* 1. Header & Value Proposition */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Google Ads Kampanya & Bütçe Tahminleme (Forecast)
            </h1>
            <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
              <Sparkles size={12} /> AI & Google Verisi
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Arama hacimleri, TBM maliyetleri, canlı bütçe simülasyonu ve bütçe israfını önleyen negatif kelime kalkanı.
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleExportCsv}
            disabled={keywords.length === 0}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <Download size={14} /> Excel / CSV İndir
          </button>

          <button
            onClick={handleSavePlan}
            disabled={keywords.length === 0}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            {planSaveSuccess ? <Check size={14} /> : <Save size={14} />}
            {planSaveSuccess ? 'Plan Kaydedildi!' : 'Simülasyon Planını Kaydet'}
          </button>
        </div>
      </div>

      {/* 2. Search & Discovery Control Card */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Mode Toggle Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <button
              onClick={() => setMode('URL')}
              style={{
                background: mode === 'URL' ? 'var(--brand-primary)' : 'transparent',
                color: mode === 'URL' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              🌐 Web Sitesi / Rakip URL ile Keşfet
            </button>
            <button
              onClick={() => setMode('KEYWORDS')}
              style={{
                background: mode === 'KEYWORDS' ? 'var(--brand-primary)' : 'transparent',
                color: mode === 'KEYWORDS' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              ✍️ Anahtar Kelimeler ile Başla
            </button>
          </div>

          {/* Quick Examples */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Örnekler:</span>
            {['summerhomes.com', '23projects.net', 'villa kiralama alanya', 'dijital pazarlama ajansı'].map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setQuery(ex);
                  setMode(ex.includes('.') ? 'URL' : 'KEYWORDS');
                  handleDiscover(ex, ex.includes('.') ? 'URL' : 'KEYWORDS');
                }}
                className="btn-ghost"
                style={{ padding: '2px 6px', fontSize: '0.72rem' }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={mode === 'URL' ? 'Web sitesi veya Landing Page adresi girin (örn: https://grazhdanstvo.23projects.net/)...' : 'Anahtar kelime(ler) yazın (örn: antalya emlak, villa kiralama)...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDiscover(); }}
              style={{ width: '100%', paddingLeft: '2.4rem', fontSize: '0.85rem' }}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={() => handleDiscover()}
            disabled={isLoading || !query.trim()}
            className="btn-primary"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Sayfa Kazınıyor & Analiz Ediliyor...' : 'Analiz Et & Keşfet'}
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', fontSize: '0.8rem' }}>
            {errorMsg}
          </div>
        )}
      </div>

      {/* 3. Empty State OR (Step 1 + Step 2 + KPIs) */}
      {keywords.length === 0 && activeTab !== 'saved-plans' ? (
        <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={32} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Google Ads Akıllı Tahminleme & Bütçe Planlama
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0.5rem auto 0 auto', lineHeight: 1.5 }}>
              Yukarıdaki arama kutusuna analiz etmek istediğiniz <strong>landing page / web sitesini</strong> (örn: <code>https://grazhdanstvo.23projects.net/</code>) yazın. Sistemimiz sayfanın dilini ve sektörel içeriğini otomatik algılayacaktır.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hızlı Başlangıç Örnekleri:</span>
            {[
              { label: 'https://grazhdanstvo.23projects.net/', mode: 'URL' as const },
              { label: 'summerhomes.com', mode: 'URL' as const },
              { label: 'livanelihotels.com', mode: 'URL' as const },
              { label: 'dijital pazarlama ajansı', mode: 'KEYWORDS' as const },
            ].map(chip => (
              <button
                key={chip.label}
                onClick={() => {
                  setQuery(chip.label);
                  setMode(chip.mode);
                  handleDiscover(chip.label, chip.mode);
                }}
                className="btn-ghost"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)' }}
              >
                + {chip.label}
              </button>
            ))}
          </div>

          {savedPlans.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <button
                onClick={() => { setActiveTab('saved-plans'); loadSavedPlans(); }}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              >
                <FolderDown size={14} /> Kayıtlı Planları Görüntüle ({savedPlans.length})
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* STEP 1: Auto-Detected Language & Page Summary Card */}
          <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface)', borderLeft: '4px solid var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)' }}>
                <Languages size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>1. ADIM: SAYFA DİLİ & BAĞLAM</span>
                  <span className="badge badge-active" style={{ fontSize: '0.725rem' }}>
                    <CheckCircle2 size={11} /> {detectedLanguageName} ({detectedLanguage.toUpperCase()}) — Otomatik Algılandı
                  </span>
                  {sectorName && (
                    <span className="badge badge-neutral" style={{ fontSize: '0.725rem' }}>
                      {sectorName}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {pageTitle || query}
                </div>
              </div>
            </div>

            {pageSummary && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '450px', lineHeight: 1.45, backgroundColor: 'var(--bg-surface-elevated)', padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-xs)' }}>
                💡 {pageSummary}
              </div>
            )}
          </div>

          {/* STEP 2: Multi-Country Target Market Selection */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '6px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)' }}>
                  <Globe size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    2. Adım: Hedef Pazar & Ülke Seçimi ({activeCountries.length} Ülke Seçili)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Bu kampanyayı hangi ülkelerde yayınlayacaksınız? Seçtiğiniz pazarlara göre arama hacimleri ve TBM (tıklama maliyetleri) anlık hesaplanır.
                  </div>
                </div>
              </div>

              {/* Quick Region Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hazır Pazar Paketleri:</span>
                {[
                  { label: '🇷🇺 BDT & Rusça', codes: ['RU', 'KZ', 'UZ'] },
                  { label: '🇦🇪 Körfez / GCC', codes: ['AE', 'SA'] },
                  { label: '🇹🇷 Türkiye İçi', codes: ['TR'] },
                  { label: '🇩🇪 Avrupa', codes: ['DE', 'GB', 'NL'] },
                  { label: '✨ Tümünü Seç', codes: availableCountries.map(c => c.code) },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => selectRegionPreset(p.codes)}
                    className="btn-ghost"
                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)' }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Country Pills (Multi-Select) */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {availableCountries.map(c => {
                const isSelected = selectedCountryCodes.has(c.code);
                return (
                  <button
                    key={c.code}
                    onClick={() => toggleCountry(c.code)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface-elevated)',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.05rem' }}>{c.flag}</span>
                    <span>{c.name}</span>
                    <span style={{ fontSize: '0.7rem', color: isSelected ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                      ({c.cpcMultiplier}x TBM)
                    </span>
                    {isSelected && <Check size={13} color="var(--brand-primary)" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aggregate KPI Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            
            {/* Total Volume */}
            <div className="card" style={{ padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Toplam Aylık Pazar Hacmi</span>
                <div style={{ padding: '6px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--brand-primary)' }}>
                  <Eye size={15} />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                {totalSearchVolume.toLocaleString('tr-TR')}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Seçili {activeCountries.length} ülke pazarında toplam aylık arama
              </div>
            </div>

            {/* Avg Top of Page CPC */}
            <div className="card" style={{ padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ağırlıklı Ort. Sayfa Üstü TBM</span>
                <div style={{ padding: '6px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-elevated)', color: '#34d399' }}>
                  <DollarSign size={15} />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#34d399', marginTop: '0.35rem' }}>
                ₺{avgTopPageCpc.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Hedeflenen pazarların ağırlıklı ortalama tıklama maliyeti
              </div>
            </div>

            {/* High-Intent Ratio */}
            <div className="card" style={{ padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Satın Alma Odaklı Kelimeler</span>
                <div style={{ padding: '6px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--info)' }}>
                  <Target size={15} />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                %{highIntentRatio}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Doğrudan sipariş veya talep getiren yüksek niyetli kelime oranı
              </div>
            </div>

            {/* Active Target Markets */}
            <div className="card" style={{ padding: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Hedeflenen Pazarlar</span>
                <div style={{ padding: '6px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-elevated)', color: '#facc15' }}>
                  <Globe size={15} />
                </div>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {activeCountries.slice(0, 5).map(c => c.flag).join(' ')}
                {activeCountries.length > 5 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+{activeCountries.length - 5}</span>}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {activeCountries.map(c => c.name).join(', ')}
              </div>
            </div>

          </div>

      {/* 4. Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('matrix')}
          className={activeTab === 'matrix' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          <Layers size={14} /> Anahtar Kelime & Trend Matrisi ({keywords.length})
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={activeTab === 'simulator' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          <Sliders size={14} /> Akıllı Bütçe & ROI Simülatörü
        </button>

        <button
          onClick={() => setActiveTab('negatives')}
          className={activeTab === 'negatives' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          <ShieldAlert size={14} /> AI Negatif Kelime Kalkanı ({negativeCategories.reduce((a, c) => a + c.words.length, 0)})
        </button>

        <button
          onClick={() => { setActiveTab('saved-plans'); loadSavedPlans(); }}
          className={activeTab === 'saved-plans' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          <FolderDown size={14} /> Kayıtlı Planlar ({savedPlans.length})
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: KEYWORD & TREND MATRIX */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Filter & Sort Bar */}
          <div className="card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              
              {/* Quick Search */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Kelimelerde filtrele..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{ width: '100%', paddingLeft: '2.1rem', fontSize: '0.78rem', height: '34px' }}
                />
              </div>

              {/* Intent Filter */}
              <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '2px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                {[
                  { id: 'ALL', label: 'Tüm Niyetler' },
                  { id: 'TRANSACTIONAL', label: '🛒 Satın Alma' },
                  { id: 'COMMERCIAL', label: '🔍 Araştırma' },
                  { id: 'INFORMATIONAL', label: 'ℹ️ Bilgi' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setIntentFilter(item.id)}
                    style={{
                      background: intentFilter === item.id ? 'var(--brand-primary)' : 'transparent',
                      color: intentFilter === item.id ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.72rem',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      fontWeight: intentFilter === item.id ? 600 : 400
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort & Bulk Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', height: '34px', cursor: 'pointer' }}
              >
                <option value="OPPORTUNITY">⭐ Fırsat Skoru (En Yüksek)</option>
                <option value="VOLUME">📈 Arama Hacmi (En Çok)</option>
                <option value="CPC_LOW">💵 TBM (En Ucuz)</option>
                <option value="CPC_HIGH">💰 TBM (En Yüksek)</option>
                <option value="TREND">🚀 Trend Artışı (%)</option>
              </select>

              <button
                onClick={toggleSelectAll}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', height: '34px', padding: '0 0.65rem' }}
              >
                {selectedKeywordIds.size === filteredKeywords.length ? 'Seçimi Kaldır' : 'Tümünü Seç'} ({selectedKeywordIds.size})
              </button>
            </div>

          </div>

          {/* Keywords Table */}
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedKeywordIds.size === filteredKeywords.length && filteredKeywords.length > 0}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th>Anahtar Kelime</th>
                  <th>Arama Niyeti</th>
                  <th style={{ textAlign: 'right' }}>Aylık Hacim</th>
                  <th>3 Aylık Trend</th>
                  <th>Rekabet Düzeyi</th>
                  <th style={{ textAlign: 'right' }}>Sayfa Üstü TBM</th>
                  <th style={{ textAlign: 'center' }}>Fırsat Skoru</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeywords.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Eşleşen anahtar kelime bulunamadı. Lütfen yukarıdan yeni bir web sitesi veya kelime arayın.
                    </td>
                  </tr>
                ) : (
                  filteredKeywords.map((k) => {
                    const isSelected = selectedKeywordIds.has(k.id);
                    return (
                      <tr 
                        key={k.id}
                        onClick={() => toggleKeyword(k.id)}
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.04)' : undefined
                        }}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleKeyword(k.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            {k.keyword}
                          </div>
                        </td>
                        <td>
                          {k.intent === 'TRANSACTIONAL' && (
                            <span className="badge" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', fontSize: '0.68rem' }}>
                              🛒 Satın Alma
                            </span>
                          )}
                          {k.intent === 'COMMERCIAL' && (
                            <span className="badge" style={{ backgroundColor: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.3)', fontSize: '0.68rem' }}>
                              🔍 Araştırma
                            </span>
                          )}
                          {k.intent === 'INFORMATIONAL' && (
                            <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                              ℹ️ Bilgi
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {k.monthlyVolume.toLocaleString('tr-TR')}
                        </td>
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: k.trendChangePercent >= 0 ? '#34d399' : 'var(--danger)' }}>
                            {k.trendChangePercent >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                            <span>{k.trendChangePercent >= 0 ? `+${k.trendChangePercent}%` : `${k.trendChangePercent}%`}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ flex: 1, width: '60px', height: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${k.competitionIndex}%`,
                                height: '100%',
                                backgroundColor: k.competition === 'HIGH' ? 'var(--danger)' : (k.competition === 'MEDIUM' ? '#facc15' : '#34d399')
                              }} />
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              {k.competition === 'HIGH' ? 'Yüksek' : (k.competition === 'MEDIUM' ? 'Orta' : 'Düşük')}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₺{k.lowCpc.toFixed(2)}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 3px' }}>-</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>₺{k.highCpc.toFixed(2)}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge" style={{
                            backgroundColor: k.opportunityScore >= 80 ? 'rgba(52, 211, 153, 0.15)' : (k.opportunityScore >= 60 ? 'rgba(250, 204, 21, 0.15)' : 'var(--bg-surface-elevated)'),
                            color: k.opportunityScore >= 80 ? '#34d399' : (k.opportunityScore >= 60 ? '#facc15' : 'var(--text-secondary)'),
                            border: `1px solid ${k.opportunityScore >= 80 ? 'rgba(52, 211, 153, 0.3)' : 'var(--border-default)'}`,
                            fontWeight: 700,
                            fontSize: '0.75rem'
                          }}>
                            {k.opportunityScore}
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

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: INTERACTIVE BUDGET SIMULATOR & ROI PLAYGROUND */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          
          {/* Controls Column */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Bütçe & Dönüşüm Değişkenleri
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Bütçenizi kaydırarak anlık tıklama, satış ve tahmini ciro simülasyonunu test edin.
              </div>
            </div>

            {/* Monthly Budget Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Aylık Hedef Reklam Bütçesi
                </label>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                  ₺{monthlyBudget.toLocaleString('tr-TR')}
                </div>
              </div>
              <input
                type="range"
                min={5000}
                max={300000}
                step={5000}
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>₺5.000 (Giriş)</span>
                <span>₺75.000 (Ölçek)</span>
                <span>₺300.000 (Agresif Büyüme)</span>
              </div>
            </div>

            {/* Conversion Rate (%) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Tahmini Web Sitesi Dönüşüm Oranı (%)
                </label>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  %{conversionRate}
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={8.0}
                step={0.1}
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--info)', cursor: 'pointer' }}
              />
            </div>

            {/* Average Order Value (AOV ₺) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Ortalama Sipariş / Talep Değeri (AOV ₺)
              </label>
              <input
                type="number"
                value={avgOrderValue}
                onChange={(e) => setAvgOrderValue(Math.max(1, Number(e.target.value)))}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            {/* Campaign Summary Badge */}
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              💡 <strong>Model Açıklaması:</strong> Seçili {selectedKeywordsPool.length} anahtar kelimenin ortalama sayfa üstü TBM'si (<strong>₺{avgTopPageCpc.toFixed(2)}</strong>) ve Google Arama TO (%4.85) referans alınarak hesaplanmıştır.
            </div>

            <button
              onClick={handleSavePlan}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', fontSize: '0.85rem' }}
            >
              {planSaveSuccess ? <Check size={16} /> : <Save size={16} />}
              {planSaveSuccess ? 'Plan Başarıyla Kaydedildi!' : 'Bu Simülasyonu Çalışma Alanına Kaydet'}
            </button>

          </div>

          {/* Projected Outcomes Column */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                🎯 Tahmini Kampanya Performans Projeksiyonu
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Aylık ₺{monthlyBudget.toLocaleString('tr-TR')} bütçe ile beklenen tahmini sonuçlar.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              
              {/* Clicks */}
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Tıklama (Aylık)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-primary)', marginTop: '2px' }}>
                  {simulation.estClicks.toLocaleString('tr-TR')}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Günlük ~{Math.round(simulation.estClicks / 30.4)} Tıklama</div>
              </div>

              {/* Impressions */}
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Gösterim</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {simulation.estImpressions.toLocaleString('tr-TR')}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>%4.85 Tahmini TO</div>
              </div>

              {/* Conversions */}
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Satış / Talep</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                  {simulation.estConversions.toLocaleString('tr-TR')} Adet
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>CPA: ₺{simulation.cpa.toLocaleString('tr-TR')} / sipariş</div>
              </div>

              {/* Revenue */}
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Toplam Ciro</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                  ₺{simulation.estRevenue.toLocaleString('tr-TR')}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>AOV: ₺{avgOrderValue.toLocaleString('tr-TR')}</div>
              </div>

            </div>

            {/* Huge ROAS Metric Box */}
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(37, 99, 235, 0.06)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(37, 99, 235, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Projeksiyon ROAS (Getiri Oranı)
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '2px' }}>
                  {simulation.projectedRoas}x
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Her <strong>1 ₺</strong> reklam harcaması için <strong>₺{simulation.projectedRoas}</strong> ciro projeksiyonu
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tahmini Net Kâr</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: simulation.estRevenue - monthlyBudget >= 0 ? '#34d399' : 'var(--danger)', marginTop: '2px' }}>
                  ₺{(simulation.estRevenue - monthlyBudget).toLocaleString('tr-TR')}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Reklam maliyeti düşülmüş</div>
              </div>
            </div>

            {/* Country Breakdown & Market Share Table */}
            {countryBreakdown.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Globe size={15} color="var(--brand-primary)" /> Hedef Ülke Dağılımı ve Tahmin Kırılımı
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {countryBreakdown.length} Aktif Pazar
                  </span>
                </div>

                {/* Visual Stacked Progress Bar */}
                <div style={{ height: '8px', borderRadius: '4px', display: 'flex', overflow: 'hidden', backgroundColor: 'var(--border-default)' }}>
                  {countryBreakdown.map((cm, idx) => {
                    const colors = ['#2563eb', '#34d399', '#facc15', '#f97316', '#a855f7', '#ec4899'];
                    return (
                      <div
                        key={cm.code}
                        style={{
                          width: `${cm.sharePercent}%`,
                          backgroundColor: colors[idx % colors.length],
                          height: '100%'
                        }}
                        title={`${cm.flag} ${cm.name}: %${cm.sharePercent}`}
                      />
                    );
                  })}
                </div>

                {/* Country Breakdown Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {countryBreakdown.map((cm) => (
                    <div key={cm.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.35rem 0.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 500 }}>
                        <span>{cm.flag}</span>
                        <span>{cm.name}</span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '1px 4px' }}>%{cm.sharePercent}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span>Ort. TBM: <strong style={{ color: 'var(--text-primary)' }}>₺{cm.avgCpc.toFixed(2)}</strong></span>
                        <span>~{cm.estClicks} Tıklama</span>
                        <span>~{cm.estConversions} Talep</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: AI NEGATIVE KEYWORD SHIELD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'negatives' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                🛡️ AI Destekli Bütçe Koruma & Negatif Kelime Kalkanı
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {sectorName} sektörü için dönüşüm getirmeyen, bütçe israfına yol açacak alakasız aramalar filtrelenmiştir.
              </div>
            </div>

            <button
              onClick={() => {
                const allWords = negativeCategories.flatMap(c => c.words);
                handleCopyNegatives(allWords, 'TÜMÜ');
              }}
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              {copiedCategory === 'TÜMÜ' ? <Check size={14} /> : <Copy size={14} />}
              {copiedCategory === 'TÜMÜ' ? 'Tüm Liste Kopyalandı!' : 'Tüm Negatifleri Kopyala (Google Ads Uyumlu)'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {negativeCategories.map((cat, idx) => (
              <div key={idx} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {cat.category}
                  </div>
                  <button
                    onClick={() => handleCopyNegatives(cat.words, cat.category)}
                    className="btn-ghost"
                    style={{ fontSize: '0.72rem', padding: '2px 6px' }}
                  >
                    {copiedCategory === cat.category ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                    {copiedCategory === cat.category ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {cat.words.map((w, wIdx) => (
                    <span 
                      key={wIdx} 
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      -{w}
                    </span>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: SAVED FORECAST PLANS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'saved-plans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Kayıtlı Kampanya Bütçe Planları ({savedPlans.length})
            </div>
            <button onClick={loadSavedPlans} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}>
              <RefreshCw size={13} /> Yenile
            </button>
          </div>

          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan Adı</th>
                  <th>Hedef / Tohum</th>
                  <th>Aylık Bütçe</th>
                  <th>Tahmini Tıklama</th>
                  <th>Projeksiyon ROAS</th>
                  <th>Oluşturulma Tarihi</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {savedPlans.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Henüz bu çalışma alanında kayıtlı bir tahminleme planı bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  savedPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{plan.name}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {plan.targetUrl || plan.seedKeywords || '—'}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>
                        ₺{plan.monthlyBudget?.toLocaleString('tr-TR')}
                      </td>
                      <td>
                        {plan.simulationResult?.estClicks?.toLocaleString('tr-TR') || '—'} Tıklama
                      </td>
                      <td>
                        <span className="badge badge-active" style={{ fontSize: '0.72rem' }}>
                          {plan.simulationResult?.projectedRoas || 0}x
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {plan.createdAt ? new Date(plan.createdAt).toLocaleString('tr-TR') : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={async () => {
                            if (window.confirm('Bu planı silmek istediğinize emin misiniz?')) {
                              await ApiService.deleteForecastPlan(plan.id);
                              loadSavedPlans();
                            }
                          }}
                          className="btn-ghost"
                          style={{ color: 'var(--danger)', padding: '0.3rem 0.5rem' }}
                          title="Planı Sil"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

        </>
      )}

    </div>
  );
};
