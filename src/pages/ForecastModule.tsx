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
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  FolderTree,
  BarChart3,
  ArrowUpDown
} from 'lucide-react';
import { KeywordMetric, ForecastSimulation, NegativeCategory, ForecastPlan, CountryOption, CountryMetric, BusinessModel } from '../types/forecast';
import { ApiService } from '../services/apiService';

export interface KeywordCluster {
  id: string;
  name: string;
  icon: string;
  keywords: KeywordMetric[];
  totalVolume: number;
  avgCpc: number;
  selectedCount: number;
}

export const groupKeywordsSemantically = (kwList: KeywordMetric[]): KeywordCluster[] => {
  if (!kwList || kwList.length === 0) return [];

  const clusters: KeywordCluster[] = [];

  // 0. DEDICATED PINNED CLUSTER: AI Senior Performance SEM Strategist (High-Converting Picks)
  const strategistKeywords = kwList.filter(k => !!k.isAiStrategistPick || k.id?.startsWith('ai_strat_') || k.id?.startsWith('ai_alt_'));
  if (strategistKeywords.length > 0) {
    const vol = strategistKeywords.reduce((s, k) => s + k.monthlyVolume, 0);
    const cpcSum = strategistKeywords.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0);
    clusters.push({
      id: 'sem_strategist_picks',
      name: '🚀 SEM Uzman Stratejisi (High-ROAS)',
      icon: '⚡',
      keywords: strategistKeywords,
      totalVolume: vol,
      avgCpc: cpcSum / strategistKeywords.length,
      selectedCount: 0
    });
  }

  const themeRules = [
    // 1. Private Schools, Colleges & K-12 Admissions (Multi-lingual)
    {
      id: 'schools_education',
      name: 'Özel Okul, Kolej & Kayıtlar (School & Education)',
      icon: '🎓',
      regex: /\b(okul|okulu|okulları|ilkokul|ilkokulu|ortaokul|ortaokulu|lise|lisesi|kolej|koleji|kolejler|özel okul|özel okullar|anaokul|anaokulu|kreş|butik okul|eğitim|eğitimi|eğitim kurumu|bursluluk|bursluluk sınavı|erken kayıt|öğrenci kayıt|lgs|yks|schul|school|kindergarten)\b/i
    },
    // 2. Methods, Techniques & Technologies (Medical, Hair, Software, Tech)
    {
      id: 'methods_tech',
      name: 'Yöntemler, Teknikler & Teknolojiler (Methods & Tech)',
      icon: '🔬',
      regex: /\b(technique|techniques|method|methods|technology|technologies|yöntem|yöntemi|yöntemleri|teknik|tekniği|teknikleri|teknoloji|teknolojisi|teknolojileri|fue|dhi|sapphire|safir|procedure|treatment|behandlung|operation|ameliyat|tedavi|cihaz|modül|software|yazılım|app|uygulama)\b/i
    },
    // 3. Pricing, Costs, Packages & Fees (Global / Multi-lingual)
    {
      id: 'pricing_costs',
      name: 'Fiyatlar, Maliyetler & Paketler (Pricing & Cost)',
      icon: '💰',
      regex: /\b(fiyat|fiyatı|fiyatları|fiyat listesi|ücret|ücreti|ücretleri|maliyet|maliyeti|paket|paketleri|price|prices|pricing|cost|costs|fee|fees|package|packages|how much|affordable|cheap|preise|preis|kosten|цена|цены|стоимость|тариф|расход)\b/i
    },
    // 4. Clinics, Hospitals, Centers & Doctors
    {
      id: 'clinics_surgeons',
      name: 'Klinikler, Merkezler & Uzmanlar (Clinics & Specialists)',
      icon: '🏥',
      regex: /\b(clinic|clinics|hospital|hospitals|center|centers|centre|centres|doctor|doctors|surgeon|surgeons|specialist|specialists|physician|klinik|kliniği|klinikleri|hastane|hastanesi|doktor|doktorları|uzman|uzmanları|cerrah|cerrahı|merkez|merkezi)\b/i
    },
    // 5. Reviews, Results, Before-After & Comparisons
    {
      id: 'reviews_results',
      name: 'Yorumlar, Karşılaştırma & Sonuçlar (Reviews & Results)',
      icon: '⭐',
      regex: /\b(review|reviews|best|top|before and after|before & after|results|success rate|rating|ratings|yorum|yorumlar|tavsiye|tavsiyeleri|en iyi|sonuçlar|öncesi sonrası|öncesi ve sonrası|başarı oranı|erfahrungen|bewertung|отзывы|лучший|результаты)\b/i
    },
    // 6. Locations, Destinations & Travel
    {
      id: 'location_destinations',
      name: 'Lokasyon & Şehir Odaklı Aramalar (Locations)',
      icon: '📍',
      regex: /\b(kocaeli|izmit|yahya kaptan|başiskele|gölcük|sakarya|bursa|ankara|izmir|antalya|alanya|bodrum|istanbul|adana|gaziantep|konya|trabzon|eskişehir|cyprus|kıbrıs|dubai|germany|deutschland|berlin|frankfurt|münchen|uk|england|london|türkiye|turkey|yurtdışı|abroad)\b/i
    },
    // 7. Careers, Jobs & Recruitment
    {
      id: 'career_jobs',
      name: 'Kariyer, İş İlanları & Başvuru (Jobs & Karriere)',
      icon: '💼',
      regex: /\b(job|jobs|career|careers|hiring|recruitment|recruiting|vacanc|stellenangebot|stellenanzeig|karriere|bewerbung|iş ilanı|iş ilanları|başvuru|çalışmak|работа|вакансии)\b/i
    },
    // 8. Team, Personnel & Staffing
    {
      id: 'hr_personnel',
      name: 'İK, Personel & İstihdam (Personal & Team)',
      icon: '👥',
      regex: /\b(personal|personaldienst|personnel|mitarbeiter|angestellt|staffing|executive search|insan kaynakları|kadro|ekip|персонал|сотрудник)\b/i
    },
    // 9. Call Center, Support & Customer Service
    {
      id: 'callcenter_service',
      name: 'Çağrı Merkezi & Müşteri Hizmetleri (Callcenter & Support)',
      icon: '📞',
      regex: /\b(callcenter|call center|kundenservice|kundenbetreuung|inbound|outbound|telesales|telefonservice|patientenservice|çağrı merkezi|müşteri hizmetleri|müşteri temsilcisi|support|destek)\b/i
    },
    // 10. Hotel, Resort & Vacation
    {
      id: 'hotel_tourism',
      name: 'Otel, Tatil & Konaklama Fırsatları',
      icon: '🏨',
      regex: /\b(hotel|hotels|otel|otelleri|resort|resorts|tatil|konaklama|pansiyon|butik otel|boutique hotel|all inclusive|her şey dahil|rezervasyon|booking|urlaub|ferien|отель|гостиница)\b/i
    },
    // 11. Real Estate & Property Investments
    {
      id: 'property_realestate',
      name: 'Satılık Daireler & Gayrimenkul Projeleri (Real Estate)',
      icon: '🏢',
      regex: /\b(satılık daire|satılık konut|satılık villa|satılık mülk|satılık ev|apartment for sale|villas for sale|real estate|wohnung kaufen|immobilien|квартиra|гражданство|citizenship|vatandaşlık)\b/i
    },
    // 12. Automotive, Performance & Tuning
    {
      id: 'auto_tuning',
      name: 'Otomotiv, Gaz Pedalı & Performans (Auto & Tuning)',
      icon: '🏎️',
      regex: /\b(pedalbox|chip tuning|chiptuning|gaz pedalı|gaz pedal|gaz tepki|motor güç|araç performans|dte systems)\b/i
    },
    // 13. Digital Marketing & Agency
    {
      id: 'digital_marketing',
      name: 'Dijital Pazarlama & Ajans Danışmanlığı',
      icon: '🚀',
      regex: /\b(dijital pazarlama|google ads|meta ads|reklam ajansı|performans pazarlama|seo ajansı|growth marketing)\b/i
    }
  ];

  const assigned = new Map<string, KeywordMetric[]>();
  let unassigned: KeywordMetric[] = [];

  for (const rule of themeRules) {
    assigned.set(rule.id, []);
  }

  for (const kw of kwList) {
    let matched = false;
    for (const rule of themeRules) {
      if (rule.regex.test(kw.keyword)) {
        assigned.get(rule.id)!.push(kw);
        matched = true;
        break;
      }
    }
    if (!matched) {
      unassigned.push(kw);
    }
  }

  for (const rule of themeRules) {
    const list = assigned.get(rule.id) || [];
    if (list.length > 0) {
      const vol = list.reduce((s, k) => s + k.monthlyVolume, 0);
      const cpcSum = list.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0);
      clusters.push({
        id: rule.id,
        name: rule.name,
        icon: rule.icon,
        keywords: list,
        totalVolume: vol,
        avgCpc: list.length > 0 ? cpcSum / list.length : 0,
        selectedCount: 0
      });
    }
  }

  // 🚀 UNIVERSAL DYNAMIC SUB-CLUSTERING FOR UNASSIGNED KEYWORDS (ANY LANGUAGE / ANY NICHE)
  if (unassigned.length > 0) {
    const stopWords = new Set([
      // German
      'und', 'der', 'die', 'das', 'ein', 'eine', 'für', 'mit', 'von', 'bei', 'aus', 'nach', 'über', 'unter', 'vor',
      'als', 'im', 'den', 'dem', 'des', 'zur', 'zum', 'am', 'zurück', 'nicht', 'wir', 'sie', 'uns', 'ihr',
      // Turkish
      'bir', 've', 'ile', 'için', 'icin', 'de', 'da', 'bu', 'şu', 'su', 'gibi', 'kadar', 'en', 'cok', 'çok', 'daha',
      'her', 'hic', 'hiç', 'var', 'yok', 'olan', 'olarak', 'ben', 'sen', 'biz', 'siz', 'onlar', 'bize', 'size',
      'okul', 'okulu', 'okullari', 'ilk', 'orta', 'lise', 'egitim', 'eğitim',
      // English
      'the', 'and', 'for', 'with', 'from', 'to', 'in', 'on', 'of', 'is', 'are', 'at', 'by', 'an', 'a', 'it', 'its',
      'you', 'your', 'yours', 'we', 'our', 'ours', 'us', 'they', 'them', 'their', 'theirs', 'he', 'him', 'his',
      'she', 'her', 'hers', 'not', 'no', 'nor', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'will',
      'would', 'shall', 'should', 'may', 'might', 'must', 'fit', 'fits', 'good', 'bad', 'get', 'got', 'make', 'see',
      'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so',
      'than', 'too', 'very', 'just', 'now', 'where', 'when', 'why', 'how', 'who', 'what', 'which', 'this', 'that'
    ]);

    // Pre-defined friendly naming dictionary for popular niche roots
    const friendlyRootNames: Record<string, { name: string; icon: string }> = {
      hair: { name: 'Saç Ekimi & Restorasyon (Hair Restoration)', icon: '💇' },
      beard: { name: 'Sakal & Yüz Restorasyonu (Beard Restoration)', icon: '🧔' },
      graft: { name: 'Greft & Kök Sayısı (Graft Count)', icon: '🌱' },
      grafts: { name: 'Greft & Kök Sayısı (Graft Count)', icon: '🌱' },
      greft: { name: 'Greft & Kök Sayısı (Graft Count)', icon: '🌱' },
      women: { name: 'Kadınlara Özel Çözümler (Female Care)', icon: '👩' },
      female: { name: 'Kadınlara Özel Çözümler (Female Care)', icon: '👩' },
      eyebrow: { name: 'Kaş Ekimi & Restorasyonu (Eyebrow)', icon: '✨' },
      dental: { name: 'Diş Tedavileri & İmplant (Dental)', icon: '🦷' },
      teeth: { name: 'Diş Estetiği & Gülüş Tasarımı (Smile)', icon: '🦷' },
      rhinoplasty: { name: 'Burun Estetiği & Rinoplasti', icon: '👃' },
      tuning: { name: 'Tuning & Araç Güçlendirme', icon: '⚡' },
      pedal: { name: 'Gaz Pedalı & Tepkime Modülleri', icon: '🏎️' }
    };

    // Filter out pure junk from unassigned list
    const validUnassigned = unassigned.filter(kw => {
      const words = kw.keyword.toLowerCase().split(/\s+/).filter(w => w.length >= 3 && !stopWords.has(w));
      return words.length > 0;
    });

    // Count token frequencies among unassigned keywords
    const tokenMap = new Map<string, KeywordMetric[]>();
    for (const kw of validUnassigned) {
      const words = kw.keyword.toLowerCase().split(/\s+/).filter(w => w.length >= 4 && !stopWords.has(w));
      for (const w of words) {
        if (!tokenMap.has(w)) tokenMap.set(w, []);
        tokenMap.get(w)!.push(kw);
      }
    }

    // Only create distinct sub-groups for verified friendly roots or significant clusters (>= 4 kws)
    const sortedTokens = Array.from(tokenMap.entries())
      .filter(([token, list]) => (friendlyRootNames[token.toLowerCase()] && list.length >= 2) || list.length >= 4)
      .sort((a, b) => b[1].length - a[1].length);

    const claimedKeywordIds = new Set<string>();

    for (const [token, kws] of sortedTokens) {
      const unclaimed = kws.filter(k => !claimedKeywordIds.has(k.id));
      if (unclaimed.length >= 3 || (friendlyRootNames[token.toLowerCase()] && unclaimed.length >= 2)) {
        unclaimed.forEach(k => claimedKeywordIds.add(k.id));
        const vol = unclaimed.reduce((s, k) => s + k.monthlyVolume, 0);
        const cpcSum = unclaimed.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0);
        
        let groupTitle = `${token.charAt(0).toUpperCase() + token.slice(1)} Odaklı Aramalar`;
        let groupIcon = '💡';

        if (friendlyRootNames[token.toLowerCase()]) {
          groupTitle = friendlyRootNames[token.toLowerCase()].name;
          groupIcon = friendlyRootNames[token.toLowerCase()].icon;
        }

        clusters.push({
          id: `dyn_${token}`,
          name: groupTitle,
          icon: groupIcon,
          keywords: unclaimed,
          totalVolume: vol,
          avgCpc: unclaimed.length > 0 ? cpcSum / unclaimed.length : 0,
          selectedCount: 0
        });
      }
    }

    // Final clean catch-all for remaining individual queries
    const remainingLeftovers = validUnassigned.filter(k => !claimedKeywordIds.has(k.id));
    if (remainingLeftovers.length > 0) {
      const vol = remainingLeftovers.reduce((s, k) => s + k.monthlyVolume, 0);
      const cpcSum = remainingLeftovers.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0);
      clusters.push({
        id: 'other_related',
        name: 'Diğer Özel & Niş Arama Fikirleri',
        icon: '💡',
        keywords: remainingLeftovers,
        totalVolume: vol,
        avgCpc: remainingLeftovers.length > 0 ? cpcSum / remainingLeftovers.length : 0,
        selectedCount: 0
      });
    }
  }

  return clusters.sort((a, b) => b.totalVolume - a.totalVolume);
};

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
  // Stepper State: 1 = Sayfa Kelimeleri, 2 = Hedef Pazarlar, 3 = Hacim & Forecast
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Search & Discovery State
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'URL' | 'KEYWORDS'>('URL');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1 Output: Auto-Detected Language & Page Details
  const [sectorName, setSectorName] = useState<string>('');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('tr');
  const [detectedLanguageName, setDetectedLanguageName] = useState<string>('Türkçe');
  const [pageTitle, setPageTitle] = useState<string>('');
  const [pageSummary, setPageSummary] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('google_gemini_ai');
  const [keywords, setKeywords] = useState<KeywordMetric[]>([]);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<Set<string>>(new Set());
  const [newKeywordInput, setNewKeywordInput] = useState<string>('');

  // Step 1: Master-Detail Clustering & Data Grid State
  const [activeClusterId, setActiveClusterId] = useState<string>('ALL');
  const [step1SortBy, setStep1SortBy] = useState<'VOLUME' | 'CPC_LOW' | 'CPC_HIGH' | 'ALPHABETICAL'>('VOLUME');
  const [step1SearchFilter, setStep1SearchFilter] = useState('');
  const [step1IntentFilter, setStep1IntentFilter] = useState<string>('ALL');

  // Semantic Clusters (Grouped Ideas)
  const keywordClusters = useMemo(() => {
    const rawClusters = groupKeywordsSemantically(keywords);
    return rawClusters.map(cluster => {
      const selectedInCluster = cluster.keywords.filter(k => selectedKeywordIds.has(k.id)).length;
      return {
        ...cluster,
        selectedCount: selectedInCluster
      };
    });
  }, [keywords, selectedKeywordIds]);

  // Active Cluster details for Step 1
  const activeCluster = useMemo(() => {
    if (activeClusterId === 'ALL') {
      const totalVol = keywords.reduce((s, k) => s + k.monthlyVolume, 0);
      const cpcSum = keywords.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0);
      const transactionalCount = keywords.filter(k => k.intent === 'TRANSACTIONAL').length;
      return {
        id: 'ALL',
        name: 'Tüm Anahtar Kelimeler',
        icon: '✨',
        keywords: keywords,
        totalVolume: totalVol,
        avgCpc: keywords.length > 0 ? cpcSum / keywords.length : 0,
        selectedCount: selectedKeywordIds.size,
        transactionalCount
      };
    }
    const found = keywordClusters.find(c => c.id === activeClusterId);
    if (found) {
      const transactionalCount = found.keywords.filter(k => k.intent === 'TRANSACTIONAL').length;
      return { ...found, transactionalCount };
    }
    return {
      id: 'ALL',
      name: 'Tüm Anahtar Kelimeler',
      icon: '✨',
      keywords: keywords,
      totalVolume: 0,
      avgCpc: 0,
      selectedCount: 0,
      transactionalCount: 0
    };
  }, [activeClusterId, keywordClusters, keywords, selectedKeywordIds]);

  // Count of strategist picks in the current view
  const strategistCountInView = useMemo(() => {
    const baseList = activeCluster ? activeCluster.keywords : keywords;
    return baseList.filter(k => !!k.isAiStrategistPick || k.id?.startsWith('ai_strat_') || k.id?.startsWith('ai_alt_')).length;
  }, [activeCluster, keywords]);

  // Filtered & Sorted Keywords for the active right-side data grid
  const activeKeywordsGrid = useMemo(() => {
    const baseList = activeCluster ? activeCluster.keywords : keywords;
    const searchLower = step1SearchFilter.toLowerCase().trim();

    return baseList
      .filter(k => {
        const matchesSearch = !searchLower || k.keyword.toLowerCase().includes(searchLower);
        const isStrategistKw = !!k.isAiStrategistPick || k.id?.startsWith('ai_strat_') || k.id?.startsWith('ai_alt_');
        const matchesIntent = 
          step1IntentFilter === 'ALL' || 
          (step1IntentFilter === 'STRATEGIST' ? isStrategistKw : k.intent === step1IntentFilter);
        return matchesSearch && matchesIntent;
      })
      .sort((a, b) => {
        if (step1SortBy === 'VOLUME') return b.monthlyVolume - a.monthlyVolume;
        if (step1SortBy === 'CPC_LOW') return ((a.lowCpc + a.highCpc) / 2) - ((b.lowCpc + b.highCpc) / 2);
        if (step1SortBy === 'CPC_HIGH') return ((b.lowCpc + b.highCpc) / 2) - ((a.lowCpc + a.highCpc) / 2);
        if (step1SortBy === 'ALPHABETICAL') return a.keyword.localeCompare(b.keyword);
        return 0;
      });
  }, [activeCluster, keywords, step1SearchFilter, step1IntentFilter, step1SortBy]);

  const maxVolumeInGrid = useMemo(() => {
    return Math.max(...activeKeywordsGrid.map(k => k.monthlyVolume), 1);
  }, [activeKeywordsGrid]);

  const toggleGroupSelection = (cluster: { id: string; keywords: KeywordMetric[] }) => {
    const next = new Set(selectedKeywordIds);
    const clusterIds = cluster.keywords.map(k => k.id);
    const allSelected = clusterIds.every(id => next.has(id));

    if (allSelected) {
      clusterIds.forEach(id => next.delete(id));
    } else {
      clusterIds.forEach(id => next.add(id));
    }
    setSelectedKeywordIds(next);
  };

  // Step 2: Target Countries / Multi-Market Selection
  const [availableCountries, setAvailableCountries] = useState<CountryOption[]>(DEFAULT_GLOBAL_COUNTRIES);
  const [selectedCountryCodes, setSelectedCountryCodes] = useState<Set<string>>(new Set(['RU', 'KZ', 'AE', 'TR']));

  // Filter & Sort State
  const [activeTab, setActiveTab] = useState<'matrix' | 'simulator' | 'negatives' | 'saved-plans'>('matrix');
  const [searchFilter, setSearchFilter] = useState('');
  const [intentFilter, setIntentFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'VOLUME' | 'CPC_LOW' | 'CPC_HIGH' | 'OPPORTUNITY' | 'TREND'>('OPPORTUNITY');

  // Simulation & Business Model Parameters
  const [businessModel, setBusinessModel] = useState<BusinessModel>('LEAD_GEN');
  const [budgetMode, setBudgetMode] = useState<'BY_BUDGET' | 'BY_IMPRESSION_SHARE'>('BY_BUDGET');
  const [monthlyBudget, setMonthlyBudget] = useState<number>(35000);
  const [targetImpressionShare, setTargetImpressionShare] = useState<number>(70); // %70 IS
  const [expectedCtr, setExpectedCtr] = useState<number>(7.5); // %7.5 CTR
  const [leadConversionRate, setLeadConversionRate] = useState<number>(3.5); // %3.5 Lead CR
  const [leadCloseRate, setLeadCloseRate] = useState<number>(10.0); // %10 Close rate
  const [ecommerceConversionRate, setEcommerceConversionRate] = useState<number>(2.2); // %2.2 E-com CR
  const [avgOrderValue, setAvgOrderValue] = useState<number>(3500); // 3500 ₺
  const [avgDealValue, setAvgDealValue] = useState<number>(0); // Opsiyonel anlaşma değeri

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
    setLoadingStage(0); // Stage 1: Sayfa Taranıyor (%25)

    const startTime = Date.now();

    // Smoothly progress stages while API is working
    const timer1 = setTimeout(() => setLoadingStage(1), 700);   // Stage 2: Dil & Sektör (%50)
    const timer2 = setTimeout(() => setLoadingStage(2), 1500);  // Stage 3: Google Ads Verileri (%75)

    try {
      const res = await ApiService.discoverKeywords({
        query: q.trim(),
        mode: m,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      // Advance to completion stage (%100)
      setLoadingStage(3);

      // Ensure that user sees the full completed animation with all checkmarks for at least 750ms
      const elapsed = Date.now() - startTime;
      const minTotalTime = 2200; // minimum 2.2s total experience
      const remainingTime = Math.max(minTotalTime - elapsed, 750);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      if (res && res.keywords && res.keywords.length > 0) {
        setKeywords(res.keywords);
        setSectorName(res.sector || 'Genel');
        setDetectedLanguage(res.detectedLanguage || 'tr');
        setDetectedLanguageName(res.detectedLanguageName || 'Türkçe');
        setPageTitle(res.pageTitle || '');
        setPageSummary(res.pageSummary || '');
        if (res.source) {
          setDataSource(res.source);
        }

        // Intelligently default business model based on detected landing page / sector
        const lowerContext = ((res.sector || '') + ' ' + (res.pageTitle || '') + ' ' + (res.pageSummary || '')).toLowerCase();
        if (/emlak|gayrimenkul|citizenship|vatanda|villa|residence|apartments|property|real estate|agency|ajans|consult|danışman|hizmet|b2b|klinik|health|law|avukat|hotel|otel|tatil|resort|turizm/.test(lowerContext)) {
          setBusinessModel('LEAD_GEN');
        } else if (/e-ticaret|eticaret|shop|store|mağaza|ürün|giyim|ayakkabı|kozmetik|parfüm/.test(lowerContext)) {
          setBusinessModel('ECOMMERCE');
        }

        // If AI suggested specific target countries for this language/sector, update them with Turkish localized names
        if (res.suggestedCountries && res.suggestedCountries.length > 0) {
          const turkishNormalized = res.suggestedCountries.map((c: any) => {
            const def = DEFAULT_GLOBAL_COUNTRIES.find(d => d.code === c.code);
            return {
              ...c,
              name: def ? def.name : c.name,
              flag: def ? def.flag : (c.flag || '🌐'),
              region: def ? def.region : (c.region || 'Global')
            };
          });
          setAvailableCountries(turkishNormalized);
          const initialCodes = new Set<string>(turkishNormalized.slice(0, 4).map((c: any) => c.code));
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

        // Switch to Step 1 for user review
        setCurrentStep(1);

        // Fetch negative keywords in the detected language
        loadNegatives(res.sector || 'Genel', res.keywords.map((k: KeywordMetric) => k.keyword), res.detectedLanguage || 'tr');
      } else {
        setErrorMsg('Bu arama için anahtar kelime verisi üretilemedi.');
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setErrorMsg(err.message || 'Veri çekilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomKeyword = () => {
    if (!newKeywordInput.trim()) return;
    const cleanKw = newKeywordInput.trim();
    const newId = 'custom_' + Date.now();
    const newMetric: KeywordMetric = {
      id: newId,
      keyword: cleanKw,
      monthlyVolume: 4200,
      lowCpc: 4.80,
      highCpc: 19.50,
      competition: 'MEDIUM',
      competitionIndex: 65,
      intent: 'TRANSACTIONAL',
      trendChangePercent: 15,
      opportunityScore: 88
    };
    setKeywords(prev => [newMetric, ...prev]);
    setSelectedKeywordIds(prev => new Set([...prev, newId]));
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setKeywords(prev => prev.filter(k => k.id !== id));
    setSelectedKeywordIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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
    return selectedKeywordsPool.reduce((sum, k) => sum + k.monthlyVolume, 0);
  }, [selectedKeywordsPool]);

  const totalSearchVolume = useMemo(() => {
    return Math.round(baseSearchVolume * totalVolumeMultiplier);
  }, [baseSearchVolume, totalVolumeMultiplier]);

  const baseTopPageCpc = useMemo(() => {
    if (selectedKeywordsPool.length === 0) return 0;
    const sumCpc = selectedKeywordsPool.reduce((sum, k) => sum + ((k.lowCpc + k.highCpc) / 2), 0);
    return sumCpc / selectedKeywordsPool.length;
  }, [selectedKeywordsPool]);

  const avgTopPageCpc = useMemo(() => {
    return baseTopPageCpc * blendedCpcMultiplier;
  }, [baseTopPageCpc, blendedCpcMultiplier]);

  const highIntentRatio = useMemo(() => {
    if (selectedKeywordsPool.length === 0) return 0;
    const transactionalCount = selectedKeywordsPool.filter(k => k.intent === 'TRANSACTIONAL').length;
    return Math.round((transactionalCount / selectedKeywordsPool.length) * 100);
  }, [selectedKeywordsPool]);

  // 🎛️ Real-Time Dynamic Simulation Calculation (Strictly Capped by Total Market Search Volume & Impression Share)
  const simulation: ForecastSimulation = useMemo(() => {
    const activeCpc = avgTopPageCpc > 0 ? avgTopPageCpc : 6.50;
    const availableMarketVolume = totalSearchVolume; // Total searches in selected target markets
    
    // 1. Calculate Maximum Market Capacity (95% Impression Share)
    const maxPossibleImpressions = Math.max(1, availableMarketVolume);
    const maxPossibleClicks = Math.max(1, Math.round(maxPossibleImpressions * (expectedCtr / 100)));
    const marketCapacitySpend = Math.round(maxPossibleClicks * activeCpc);

    // 2. Calculate Effective Impression Share and Actual Spend based on Budget Mode
    let effectiveIS = targetImpressionShare;
    let actualSpend = monthlyBudget;
    let isMarketSaturated = false;

    if (budgetMode === 'BY_BUDGET') {
      // Calculate what Impression Share this budget can buy
      const theoreticalClicks = monthlyBudget / activeCpc;
      const theoreticalImpressions = theoreticalClicks / (expectedCtr / 100);
      const calculatedIS = availableMarketVolume > 0 ? (theoreticalImpressions / availableMarketVolume) * 100 : 100;
      
      if (calculatedIS >= 95) {
        effectiveIS = 95; // Capped at 95% IS (market maximum)
        isMarketSaturated = true;
        actualSpend = marketCapacitySpend;
      } else {
        effectiveIS = Math.max(5, Math.min(95, Math.round(calculatedIS)));
        actualSpend = monthlyBudget;
      }
    } else {
      // User specifies target Impression Share (%)
      effectiveIS = Math.max(5, Math.min(95, targetImpressionShare));
      const estImpressionsFromIS = Math.round(availableMarketVolume * (effectiveIS / 100));
      const estClicksFromIS = Math.round(estImpressionsFromIS * (expectedCtr / 100));
      actualSpend = Math.round(estClicksFromIS * activeCpc);
    }

    // 3. Realistic Impressions & Clicks (Strictly bounded by available searches in market)
    const estImpressions = Math.min(availableMarketVolume, Math.round(availableMarketVolume * (effectiveIS / 100)));
    const estClicks = Math.max(1, Math.round(estImpressions * (expectedCtr / 100)));
    const dailyBudget = Math.round(actualSpend / 30.4);

    // 4. Conversions based on Business Model
    const activeConvRate = businessModel === 'LEAD_GEN' ? leadConversionRate : ecommerceConversionRate;
    const estConversions = Math.max(0, Math.round(estClicks * (activeConvRate / 100)));
    const cpa = estConversions > 0 ? Math.round(actualSpend / estConversions) : actualSpend;

    // 5. Deals & CAC (For Lead Gen)
    const estDeals = businessModel === 'LEAD_GEN' ? Math.round(estConversions * (leadCloseRate / 100)) : 0;
    const cac = estDeals > 0 ? Math.round(actualSpend / estDeals) : actualSpend;

    // 6. Revenue & ROAS (For E-Commerce or Deal Value)
    let estRevenue = 0;
    if (businessModel === 'ECOMMERCE') {
      estRevenue = estConversions * avgOrderValue;
    } else if (businessModel === 'LEAD_GEN' && avgDealValue > 0) {
      estRevenue = estDeals * avgDealValue;
    }
    const projectedRoas = actualSpend > 0 ? Math.round((estRevenue / actualSpend) * 10) / 10 : 0;

    return {
      businessModel,
      monthlyBudget,
      dailyBudget,
      actualSpend,
      marketCapacitySpend,
      isMarketSaturated,
      targetImpressionShare: effectiveIS,
      estImpressions,
      estClicks,
      avgCpc: activeCpc,
      avgCtr: expectedCtr,
      conversionRate: activeConvRate,
      estConversions,
      cpa,
      leadCloseRate,
      estDeals,
      cac,
      avgOrderValue,
      estRevenue,
      projectedRoas,
      targetCountries: Array.from(selectedCountryCodes)
    };
  }, [
    businessModel,
    budgetMode,
    monthlyBudget,
    targetImpressionShare,
    expectedCtr,
    avgTopPageCpc,
    totalSearchVolume,
    leadConversionRate,
    leadCloseRate,
    ecommerceConversionRate,
    avgOrderValue,
    avgDealValue,
    selectedCountryCodes
  ]);

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

  // Copy Negative Keywords to Clipboard
  const handleCopyNegatives = (words: string[], categoryTitle: string) => {
    const text = words.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedCategory(categoryTitle);
    setTimeout(() => setCopiedCategory(null), 2000);
  };

  // Save Plan Action
  const handleSavePlan = async () => {
    try {
      await ApiService.saveForecastPlan({
        workspaceId,
        name: `${query} (${sectorName}) - ₺${monthlyBudget.toLocaleString('tr-TR')} Bütçe Planı`,
        targetUrl: mode === 'URL' ? query : '',
        seedKeywords: mode === 'KEYWORDS' ? query : '',
        detectedLanguage,
        detectedLanguageName,
        monthlyBudget,
        selectedKeywords: selectedKeywordsPool,
        simulationResult: simulation,
        negativeKeywords: negativeCategories,
        targetCountries: activeCountries.map(c => c.name),
        countryBreakdown
      });
      setPlanSaveSuccess(true);
      setTimeout(() => setPlanSaveSuccess(false), 2500);
      loadSavedPlans();
    } catch (err: any) {
      alert('Plan kaydedilirken hata: ' + err.message);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (keywords.length === 0) return;
    const headers = ['Anahtar Kelime', 'Dil', 'Hedef Pazarlar', 'Aylık Hacim', '3 Aylık Trend %', 'Rekabet Düzeyi', 'Min TBM (₺)', 'Max TBM (₺)', 'Ort TBM (₺)', 'Arama Niyeti', 'Fırsat Skoru'];
    const activeCountryNames = activeCountries.map(c => c.name).join(' + ');
    const rows = selectedKeywordsPool.map(k => [
      `"${k.keyword}"`,
      `"${detectedLanguageName}"`,
      `"${activeCountryNames}"`,
      Math.round(k.monthlyVolume * totalVolumeMultiplier),
      `${k.trendChangePercent}%`,
      k.competition,
      (k.lowCpc * blendedCpcMultiplier).toFixed(2),
      (k.highCpc * blendedCpcMultiplier).toFixed(2),
      (((k.lowCpc + k.highCpc) / 2) * blendedCpcMultiplier).toFixed(2),
      k.intent,
      k.opportunityScore
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Google_Ads_Forecast_${(query || 'analiz').replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
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
            3 Aşamalı Akıllı Akış: Sayfa Analizi ➔ Hedef Ülke Seçimi ➔ Hacim, TBM & ROAS Simülasyonu.
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
            {['https://grazhdanstvo.23projects.net/', 'summerhomes.com', 'roasist.com', 'dijital pazarlama ajansı'].map((ex) => (
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
            {isLoading ? 'Sayfayı Tara & Kelimeleri Çıkar...' : 'Sayfayı Tara & Kelimeleri Çıkar'}
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', fontSize: '0.8rem' }}>
            {errorMsg}
          </div>
        )}
      </div>

      {/* 3. SCENARIO A: DYNAMIC ANIMATED LOADING SCREEN (When Loading, ONLY this screen is visible) */}
      {isLoading ? (
        <div className="card" style={{
          padding: '2.5rem 2rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1.5px solid var(--brand-primary)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 30px rgba(37, 99, 235, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Live Stage Info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                border: '2px solid var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                position: 'relative'
              }}>
                <span>
                  {loadingStage === 0 && '🌐'}
                  {loadingStage === 1 && '🔍'}
                  {loadingStage === 2 && '⚡'}
                  {loadingStage === 3 && '🎯'}
                </span>
                <div className="animate-ping" style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-primary)',
                  opacity: 0.25
                }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: loadingStage === 3 ? '#10b981' : 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {loadingStage === 3 ? 'TAMAMLANDI (4/4)' : `ADIM ${loadingStage + 1} / 4`}
                  </span>
                  {loadingStage === 3 ? (
                    <span className="badge badge-active" style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <Check size={11} /> Sonuçlar Hazırlandı!
                    </span>
                  ) : (
                    <span className="badge badge-active" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      <RefreshCw size={10} className="animate-spin" /> Canlı İşleniyor...
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {loadingStage === 0 && 'Açılış Sayfası Taranıyor & İçerik Kazınıyor'}
                  {loadingStage === 1 && 'Dil, Sektör & Coğrafi Lokasyon Analizi'}
                  {loadingStage === 2 && 'Google Ads Keyword Planner Verileri Çekiliyor'}
                  {loadingStage === 3 && 'Semantik Reklam Grupları & Bütçe Projeksiyonu'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '650px', lineHeight: 1.45 }}>
                  {loadingStage === 0 && 'Hedef web sitesi ve SPA bileşenleri taranıyor, ana başlıklar ve metin blokları çözümleniyor...'}
                  {loadingStage === 1 && 'Sayfanın dili, hedef coğrafi pazarlar ve iş modeli sektörel olarak sınıflandırılıyor...'}
                  {loadingStage === 2 && 'Resmi Google arama hacimleri, rekabet indeksleri ve sayfa üstü TBM teklifleri alınıyor...'}
                  {loadingStage === 3 && 'Anahtar kelimeler Ad Group temalarına kümeleniyor ve bütçe simülasyonu oluşturuluyor...'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', minWidth: '120px' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: loadingStage === 3 ? '#10b981' : 'var(--brand-primary)' }}>
                %{loadingStage === 0 ? 25 : (loadingStage === 1 ? 50 : (loadingStage === 2 ? 75 : 100))}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {loadingStage === 3 ? 'Veriler aktarılıyor...' : 'Ortalama 2-3 saniye'}
              </div>
            </div>
          </div>

          {/* Animated Smooth Progress Bar */}
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
            <div style={{
              width: `${loadingStage === 0 ? 25 : (loadingStage === 1 ? 50 : (loadingStage === 2 ? 75 : 100))}%`,
              height: '100%',
              backgroundColor: loadingStage === 3 ? '#10b981' : 'var(--brand-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease'
            }} />
          </div>

          {/* 4 Step Horizontal Indicator Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-default)' }}>
            {[
              { title: 'Sayfa Taraması', stage: 0 },
              { title: 'Dil & Sektör Analizi', stage: 1 },
              { title: 'Google Ads Hacimleri', stage: 2 },
              { title: 'Gruplama & Projeksiyon', stage: 3 }
            ].map((st) => {
              const isPast = st.stage < loadingStage || loadingStage === 3;
              const isCurrent = st.stage === loadingStage && loadingStage !== 3;
              return (
                <div key={st.stage} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: isPast ? 'rgba(16, 185, 129, 0.08)' : (isCurrent ? 'rgba(37, 99, 235, 0.08)' : 'transparent'),
                  border: isPast ? '1px solid rgba(16, 185, 129, 0.3)' : (isCurrent ? '1px solid var(--brand-primary)' : '1px solid transparent'),
                  opacity: isCurrent || isPast ? 1 : 0.45,
                  transition: 'all 0.25s ease'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: isPast ? '#10b981' : (isCurrent ? 'var(--brand-primary)' : 'var(--border-default)'),
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}>
                    {isPast ? <Check size={12} /> : (st.stage + 1)}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: isCurrent || isPast ? 700 : 500, color: isPast ? '#10b981' : (isCurrent ? 'var(--brand-primary)' : 'var(--text-primary)'), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {st.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : keywords.length === 0 && activeTab !== 'saved-plans' ? (
        /* SCENARIO B: EMPTY STATE */
        <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={32} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Google Ads Akıllı Tahminleme & Bütçe Planlama
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0.5rem auto 0 auto', lineHeight: 1.5 }}>
              Yukarıdaki arama kutusuna analiz etmek istediğiniz <strong>landing page / web sitesini</strong> (örn: <code>https://grazhdanstvo.23projects.net/</code>) yazın. Sistemimiz sayfanın dilini ve sektörel içeriğini otomatik tarayıp anahtar kelimeleri çıkaracaktır.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hızlı Başlangıç Örnekleri:</span>
            {[
              { label: 'https://grazhdanstvo.23projects.net/', mode: 'URL' as const },
              { label: 'summerhomes.com', mode: 'URL' as const },
              { label: 'roasist.com', mode: 'URL' as const },
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
        /* SCENARIO C: RESULTS LOADED (Clean & Bold 3-Step Wizard) */
        <>
          {/* 3-Step Wizard Navigation Bar */}
          <div className="card" style={{ padding: '0.6rem 0.85rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem', backgroundColor: 'var(--bg-surface)' }}>
            
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: currentStep === 1 ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)',
                backgroundColor: currentStep === 1 ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface-elevated)',
                color: currentStep === 1 ? 'var(--brand-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: currentStep === 1 ? 700 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.15s ease',
                boxShadow: currentStep === 1 ? '0 0 0 1px var(--brand-primary)' : 'none'
              }}
            >
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: currentStep === 1 ? 'var(--brand-primary)' : (currentStep > 1 ? '#10b981' : 'var(--border-default)'),
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                {currentStep > 1 ? <Check size={15} /> : '1'}
              </div>
              <span>1. Adım: Anahtar Kelime Analizi & Gruplar</span>
            </button>

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: currentStep === 2 ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)',
                backgroundColor: currentStep === 2 ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface-elevated)',
                color: currentStep === 2 ? 'var(--brand-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: currentStep === 2 ? 700 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.15s ease',
                boxShadow: currentStep === 2 ? '0 0 0 1px var(--brand-primary)' : 'none'
              }}
            >
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: currentStep === 2 ? 'var(--brand-primary)' : (currentStep > 2 ? '#10b981' : 'var(--border-default)'),
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                {currentStep > 2 ? <Check size={15} /> : '2'}
              </div>
              <span>2. Adım: Hedef Pazar & Ülke Seçimi</span>
            </button>

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: currentStep === 3 ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)',
                backgroundColor: currentStep === 3 ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface-elevated)',
                color: currentStep === 3 ? 'var(--brand-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: currentStep === 3 ? 700 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.15s ease',
                boxShadow: currentStep === 3 ? '0 0 0 1px var(--brand-primary)' : 'none'
              }}
            >
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: currentStep === 3 ? 'var(--brand-primary)' : 'var(--border-default)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                3
              </div>
              <span>3. Adım: Hacim, Bütçe & ROI Simülasyonu</span>
            </button>

          </div>

          {/* ========================================================================= */}
          {/* STEP 1 VIEW: Landing Page Context & Keyword Review / Selection           */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Context Summary Header */}
              <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface)', borderLeft: '4px solid var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)' }}>
                    <Languages size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>AÇILIŞ SAYFASI ANALİZİ</span>
                      <span className="badge badge-active" style={{ fontSize: '0.725rem' }}>
                        <CheckCircle2 size={11} /> {detectedLanguageName} ({detectedLanguage.toUpperCase()}) — Otomatik Algılandı
                      </span>
                      {sectorName && (
                        <span className="badge badge-neutral" style={{ fontSize: '0.725rem' }}>
                          {sectorName}
                        </span>
                      )}
                      {dataSource === 'google_ads_official' ? (
                        <span className="badge badge-active" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.725rem', fontWeight: 600 }}>
                          <Sparkles size={11} /> 🟢 Resmi Google Ads Keyword Planner Verisi
                        </span>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: '0.725rem' }}>
                          🤖 Gemini AI Tahminleme
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

              {/* Master-Detail PPC Keyword & Ad Group Manager */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Top Summary Stats Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-surface)' }}>
                    <div style={{ padding: '8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)' }}>
                      <FolderTree size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>REKLAM GRUBU KÜMELERİ</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {keywordClusters.length} Ad Group Teması
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-surface)' }}>
                    <div style={{ padding: '8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                      <BarChart3 size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOPLAM ARAMA HAVUZU</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {keywords.reduce((s, k) => s + k.monthlyVolume, 0).toLocaleString('tr-TR')} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ay</span>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-surface)' }}>
                    <div style={{ padding: '8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>ORTALAMA SAYFA ÜSTÜ TBM</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₺{(keywords.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0) / (keywords.length || 1)).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-surface)' }}>
                    <div style={{ padding: '8px', borderRadius: 'var(--radius-xs)', backgroundColor: selectedKeywordIds.size > 0 ? 'rgba(37, 99, 235, 0.1)' : 'rgba(100, 116, 139, 0.1)', color: selectedKeywordIds.size > 0 ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>SEÇİLİ KELİME HAVUZU</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                        {selectedKeywordIds.size} <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ {keywords.length} (%{Math.round((selectedKeywordIds.size / (keywords.length || 1)) * 100)})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Master-Detail Split Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '1rem', alignItems: 'stretch' }}>
                  
                  {/* LEFT SIDEBAR: Ad Group Clusters Navigation */}
                  <div className="card" style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: 'var(--bg-surface)' }}>
                    
                    {/* Sidebar Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.65rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FolderTree size={16} color="var(--brand-primary)" />
                        <span>Reklam Grupları ({keywordClusters.length})</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const allIds = new Set(keywords.map(k => k.id));
                            setSelectedKeywordIds(allIds);
                          }}
                          className="btn-ghost"
                          style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}
                        >
                          Tümünü Seç
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedKeywordIds(new Set())}
                          className="btn-ghost"
                          style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}
                        >
                          Temizle
                        </button>
                      </div>
                    </div>

                    {/* Master / All Keywords Item */}
                    <div
                      onClick={() => setActiveClusterId('ALL')}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-xs)',
                        border: activeClusterId === 'ALL' ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                        backgroundColor: activeClusterId === 'ALL' ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-surface-elevated)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontSize: '1rem' }}>✨</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: activeClusterId === 'ALL' ? 700 : 600, color: 'var(--text-primary)' }}>
                            Tüm Kelimeler Havuzu
                          </span>
                        </div>
                        <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {keywords.length}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span>📈 {keywords.reduce((s, k) => s + k.monthlyVolume, 0).toLocaleString('tr-TR')} arama</span>
                        <span>Seçili: <strong style={{ color: 'var(--brand-primary)' }}>{selectedKeywordIds.size}</strong>/{keywords.length}</span>
                      </div>

                      {/* Mini Selection Bar */}
                      <div style={{ height: '3px', width: '100%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(selectedKeywordIds.size / (keywords.length || 1)) * 100}%`, backgroundColor: 'var(--brand-primary)', transition: 'width 0.2s ease' }} />
                      </div>
                    </div>

                    {/* Cluster Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '560px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                      {keywordClusters.map(cluster => {
                        const isActive = activeClusterId === cluster.id;
                        const clusterSelectedCount = cluster.keywords.filter(k => selectedKeywordIds.has(k.id)).length;
                        const isAllClusterSelected = cluster.keywords.length > 0 && clusterSelectedCount === cluster.keywords.length;
                        const isPartialClusterSelected = clusterSelectedCount > 0 && !isAllClusterSelected;
                        const selectionPercent = Math.round((clusterSelectedCount / (cluster.keywords.length || 1)) * 100);

                        return (
                          <div
                            key={cluster.id}
                            onClick={() => setActiveClusterId(cluster.id)}
                            style={{
                              padding: '0.6rem 0.75rem',
                              borderRadius: 'var(--radius-xs)',
                              border: isActive ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                              backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-surface-elevated)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.35rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, flex: 1 }}>
                                <input
                                  type="checkbox"
                                  checked={isAllClusterSelected}
                                  ref={el => {
                                    if (el) el.indeterminate = isPartialClusterSelected;
                                  }}
                                  onChange={() => toggleGroupSelection(cluster)}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{cluster.icon}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {cluster.name}
                                </span>
                              </div>
                              
                              <span className="badge badge-neutral" style={{ fontSize: '0.67rem', padding: '1px 5px', flexShrink: 0 }}>
                                {cluster.keywords.length}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              <span>📈 {cluster.totalVolume.toLocaleString('tr-TR')} arama • ₺{cluster.avgCpc.toFixed(2)}</span>
                              <span>
                                <strong style={{ color: isAllClusterSelected ? '#10b981' : isPartialClusterSelected ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                                  {clusterSelectedCount}/{cluster.keywords.length}
                                </strong>
                              </span>
                            </div>

                            {/* Mini Selection Bar */}
                            <div style={{ height: '3px', width: '100%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${selectionPercent}%`, backgroundColor: isAllClusterSelected ? '#10b981' : 'var(--brand-primary)', transition: 'width 0.2s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>

                  {/* RIGHT MAIN PANEL: Active Selected Ad Group Data Table */}
                  <div className="card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', backgroundColor: 'var(--bg-surface)' }}>
                    
                    {/* Active Group Header Banner */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.85rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.3rem' }}>{activeCluster.icon}</span>
                          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {activeCluster.name}
                          </span>
                          <span className="badge badge-active" style={{ fontSize: '0.72rem' }}>
                            {activeCluster.keywords.length} Kelime
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          Bu reklam grubundaki tohum anahtar kelimeleri inceleyin, arama niyeti ve hacimlerine göre listenizi düzenleyin.
                        </div>
                      </div>

                      {/* Group KPI Badges & Group Action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                            📈 Hacim: <strong style={{ color: 'var(--text-primary)' }}>{activeCluster.totalVolume.toLocaleString('tr-TR')}</strong>
                          </span>
                          <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                            💵 Ort. TBM: <strong style={{ color: 'var(--text-primary)' }}>₺{activeCluster.avgCpc.toFixed(2)}</strong>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleGroupSelection(activeCluster)}
                          className="btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-xs)', whiteSpace: 'nowrap' }}
                        >
                          {activeCluster.keywords.every(k => selectedKeywordIds.has(k.id)) ? 'Gruptaki Seçimi Bırak' : `+ Tüm Grubu Seç (${activeCluster.keywords.length})`}
                        </button>
                      </div>
                    </div>

                    {/* Table Filter & Sort Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
                      
                      {/* Search in Active Group */}
                      <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          placeholder={`${activeCluster.name} içinde filtrele...`}
                          value={step1SearchFilter}
                          onChange={(e) => setStep1SearchFilter(e.target.value)}
                          style={{ width: '100%', fontSize: '0.78rem', padding: '0.35rem 0.6rem 0.35rem 1.9rem' }}
                        />
                      </div>

                      {/* Intent Pills */}
                      <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '2px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                        {[
                          { key: 'ALL', label: 'Tüm Niyetler' },
                          { key: 'STRATEGIST', label: `🚀 SEM Uzman Seçimi (${strategistCountInView})` },
                          { key: 'TRANSACTIONAL', label: 'Satın Alma' },
                          { key: 'COMMERCIAL', label: 'Araştırma / Ticari' }
                        ].map(tab => (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() => setStep1IntentFilter(tab.key)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.68rem',
                              fontWeight: step1IntentFilter === tab.key ? 600 : 400,
                              borderRadius: 'var(--radius-xs)',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: step1IntentFilter === tab.key 
                                ? (tab.key === 'STRATEGIST' ? '#9333ea' : 'var(--brand-primary)') 
                                : 'transparent',
                              color: step1IntentFilter === tab.key ? '#ffffff' : 'var(--text-secondary)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Sort Dropdown */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ArrowUpDown size={13} color="var(--text-muted)" />
                        <select
                          value={step1SortBy}
                          onChange={(e) => setStep1SortBy(e.target.value as any)}
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-xs)' }}
                        >
                          <option value="VOLUME">Arama Hacmi (En Yüksek)</option>
                          <option value="CPC_LOW">TBM Maliyeti (En Düşük)</option>
                          <option value="CPC_HIGH">TBM Maliyeti (En Yüksek)</option>
                          <option value="ALPHABETICAL">Alfabetik (A-Z)</option>
                        </select>
                      </div>

                      {/* Add Custom Keyword to this Group */}
                      <div style={{ display: 'flex', gap: '0.3rem', minWidth: '220px' }}>
                        <input
                          type="text"
                          placeholder="Yeni kelime ekle..."
                          value={newKeywordInput}
                          onChange={(e) => setNewKeywordInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomKeyword(); }}
                          style={{ flex: 1, fontSize: '0.78rem', padding: '0.35rem 0.55rem' }}
                        />
                        <button
                          onClick={handleAddCustomKeyword}
                          disabled={!newKeywordInput.trim()}
                          className="btn-secondary"
                          style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem', whiteSpace: 'nowrap' }}
                        >
                          <Plus size={12} /> Ekle
                        </button>
                      </div>

                    </div>

                    {/* High-Density PPC Data Table */}
                    <div style={{ overflowX: 'auto', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', maxHeight: '460px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-default)', position: 'sticky', top: 0, zIndex: 2 }}>
                            <th style={{ padding: '0.55rem 0.75rem', width: '36px' }}>
                              <input
                                type="checkbox"
                                checked={activeKeywordsGrid.length > 0 && activeKeywordsGrid.every(k => selectedKeywordIds.has(k.id))}
                                onChange={() => {
                                  const allVisibleSelected = activeKeywordsGrid.every(k => selectedKeywordIds.has(k.id));
                                  const next = new Set(selectedKeywordIds);
                                  if (allVisibleSelected) {
                                    activeKeywordsGrid.forEach(k => next.delete(k.id));
                                  } else {
                                    activeKeywordsGrid.forEach(k => next.add(k.id));
                                  }
                                  setSelectedKeywordIds(next);
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                            </th>
                            <th style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ANAHTAR KELİME</th>
                            <th style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: 'var(--text-secondary)', width: '120px' }}>ARAMA NİYETİ</th>
                            <th style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: 'var(--text-secondary)', width: '180px' }}>AYLIK HACİM</th>
                            <th style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: 'var(--text-secondary)', width: '160px' }}>SAYFA ÜSTÜ TBM</th>
                            <th style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: 'var(--text-secondary)', width: '90px' }}>REKABET</th>
                            <th style={{ padding: '0.55rem 0.75rem', width: '40px', textAlign: 'center' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeKeywordsGrid.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Bu filtrelemeyle eşleşen anahtar kelime bulunamadı.
                              </td>
                            </tr>
                          ) : (
                            activeKeywordsGrid.map((kw, idx) => {
                              const isSelected = selectedKeywordIds.has(kw.id);
                              const volumePercent = Math.max(8, Math.min(100, Math.round((kw.monthlyVolume / maxVolumeInGrid) * 100)));

                              return (
                                <tr
                                  key={kw.id}
                                  onClick={() => toggleKeyword(kw.id)}
                                  style={{
                                    borderBottom: '1px solid var(--border-default)',
                                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.04)' : idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-surface-elevated)',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.1s ease'
                                  }}
                                >
                                  {/* Checkbox */}
                                  <td style={{ padding: '0.5rem 0.75rem' }}>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleKeyword(kw.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      style={{ cursor: 'pointer' }}
                                    />
                                  </td>

                                  {/* Keyword */}
                                  <td style={{ padding: '0.5rem 0.75rem' }}>
                                    <div style={{ fontWeight: isSelected ? 600 : 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                      <span>{kw.keyword}</span>
                                      {kw.isAiStrategistPick && (
                                        <span
                                          style={{
                                            fontSize: '0.62rem',
                                            padding: '1px 5px',
                                            borderRadius: '3px',
                                            fontWeight: 700,
                                            backgroundColor: 'rgba(147, 51, 234, 0.12)',
                                            color: '#9333ea',
                                            border: '1px solid rgba(147, 51, 234, 0.25)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '2px',
                                            letterSpacing: '0.02em'
                                          }}
                                          title="Yapay Zeka Kıdemli SEM Direktörü tarafından doğrudan satış/kayıt getirecek şekilde üretildi"
                                        >
                                          ⚡ SEM UZMANI
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Intent */}
                                  <td style={{ padding: '0.5rem 0.75rem' }}>
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        padding: '2px 6px',
                                        borderRadius: '3px',
                                        fontWeight: 600,
                                        backgroundColor: kw.intent === 'TRANSACTIONAL' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                                        color: kw.intent === 'TRANSACTIONAL' ? '#16a34a' : 'var(--brand-primary)'
                                      }}
                                    >
                                      {kw.intent === 'TRANSACTIONAL' ? 'Satın Alma' : 'Araştırma'}
                                    </span>
                                  </td>

                                  {/* Volume with Inline Visual Bar */}
                                  <td style={{ padding: '0.5rem 0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${volumePercent}%`, backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--text-muted)', borderRadius: '3px' }} />
                                      </div>
                                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: '55px', textAlign: 'right' }}>
                                        {kw.monthlyVolume.toLocaleString('tr-TR')}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Top of page CPC */}
                                  <td style={{ padding: '0.5rem 0.75rem' }}>
                                    {kw.lowCpc > 0 ? (
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                                        ₺{kw.lowCpc.toFixed(2)} - ₺{kw.highCpc.toFixed(2)}
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        ₺{(activeCluster.avgCpc * 0.8).toFixed(2)} - ₺{(activeCluster.avgCpc * 1.5).toFixed(2)}
                                      </span>
                                    )}
                                  </td>

                                  {/* Competition */}
                                  <td style={{ padding: '0.5rem 0.75rem' }}>
                                    <span
                                      style={{
                                        fontSize: '0.67rem',
                                        padding: '1px 5px',
                                        borderRadius: '3px',
                                        fontWeight: 600,
                                        backgroundColor: kw.competition === 'HIGH' ? 'rgba(239, 68, 68, 0.12)' : kw.competition === 'MEDIUM' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                        color: kw.competition === 'HIGH' ? '#dc2626' : kw.competition === 'MEDIUM' ? '#d97706' : '#16a34a'
                                      }}
                                    >
                                      {kw.competition === 'HIGH' ? 'Yüksek' : kw.competition === 'MEDIUM' ? 'Orta' : 'Düşük'}
                                    </span>
                                  </td>

                                  {/* Action */}
                                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                                    <button
                                      onClick={(e) => handleRemoveKeyword(kw.id, e)}
                                      title="Kelimeyi Sil"
                                      className="btn-ghost"
                                      style={{ padding: '3px', color: 'var(--text-muted)', borderRadius: '50%' }}
                                    >
                                      <X size={13} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.35rem' }}>
                      <div>
                        Gösterilen: <strong>{activeKeywordsGrid.length}</strong> kelime • Bu grupta seçili: <strong style={{ color: 'var(--brand-primary)' }}>{activeKeywordsGrid.filter(k => selectedKeywordIds.has(k.id)).length}</strong>
                      </div>
                      <div>
                        Toplam Seçili Havuz: <strong style={{ color: 'var(--brand-primary)' }}>{selectedKeywordIds.size} / {keywords.length}</strong>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Step 1 Next Action Bar */}
                <div className="card" style={{ padding: '0.85rem 1.25rem', backgroundColor: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ padding: '6px 10px', borderRadius: 'var(--radius-xs)', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                      {selectedKeywordIds.size} Kelime Seçildi
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Aylık Toplam Hacim Projeksiyonu: <strong>{keywords.filter(k => selectedKeywordIds.has(k.id)).reduce((s, k) => s + k.monthlyVolume, 0).toLocaleString('tr-TR')} arama</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={selectedKeywordIds.size === 0}
                    className="btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.55rem 1.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                  >
                    <span>2. Adım: Hedef Pazar & Ülke Seçimine Geç</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2 VIEW: Target Market & Multi-Country Selection                     */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)' }}>
                    <Globe size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      2. Adım: Hedef Pazar & Ülke Seçimi ({activeCountries.length} Ülke Seçili)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      Seçilen <strong>{selectedKeywordIds.size} anahtar kelimeyi</strong> hangi ülke pazarlarında yayınlayacaksınız? Seçimlerinize göre arama hacimleri ve ortalama TBM anlık hesaplanır.
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
                      style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)' }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country Pills (Multi-Select) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.65rem' }}>
                {availableCountries.map(c => {
                  const isSelected = selectedCountryCodes.has(c.code);
                  return (
                    <button
                      key={c.code}
                      onClick={() => toggleCountry(c.code)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                        backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface-elevated)',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontSize: '0.82rem',
                        fontWeight: isSelected ? 600 : 400,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        transition: 'all 0.15s ease',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{c.flag}</span>
                        <div>
                          <div>{c.name}</div>
                          <div style={{ fontSize: '0.7rem', color: isSelected ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                            TBM Çarpanı: {c.cpcMultiplier}x ({c.currency})
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check size={16} color="var(--brand-primary)" />}
                    </button>
                  );
                })}
              </div>

              {/* Selected Market Impact Summary */}
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Seçili Pazarlar: <strong>{activeCountries.map(c => c.name).join(', ')}</strong>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
                  <span>Toplam Pazar Hacim Çarpanı: <strong style={{ color: 'var(--brand-primary)' }}>{totalVolumeMultiplier.toFixed(2)}x</strong></span>
                  <span>Ağırlıklı TBM Çarpanı: <strong style={{ color: '#34d399' }}>{blendedCpcMultiplier.toFixed(2)}x</strong></span>
                </div>
              </div>

              {/* Navigation Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-default)', paddingTop: '0.85rem' }}>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ArrowLeft size={14} />
                  <span>1. Adım: Kelimelere Dön</span>
                </button>

                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={activeCountries.length === 0}
                  className="btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <span>3. Adım: Hacim & Bütçe Tahminlerini Gör</span>
                  <ArrowRight size={15} />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3 VIEW: KPIs, Matrix, Simulator, Negatives & Saved Plans             */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Step 3 Quick Context Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', backgroundColor: 'var(--bg-surface)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>Dil: <strong>{detectedLanguageName}</strong></span>
                  <span>•</span>
                  <span>Seçili Kelimeler: <strong>{selectedKeywordsPool.length} Adet</strong></span>
                  <span>•</span>
                  <span>Hedef Ülkeler: <strong>{activeCountries.map(c => c.flag + ' ' + c.name).join(', ')}</strong></span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="btn-ghost"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                  >
                    1. Kelimeleri Düzenle
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="btn-ghost"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                  >
                    2. Ülkeleri Değiştir
                  </button>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Top Business Model & Goal Selector */}
          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--bg-surface-elevated)' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                🏢 İş Modeli & Kampanya Dönüşüm Hedefi
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                İşletmenizin türüne uygun performans metriklerini ve projeksiyon modelini seçin.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'LEAD_GEN', label: '🎯 Potansiyel Müşteri & Talep (B2B, Gayrimenkul, Hizmet)' },
                { id: 'ECOMMERCE', label: '🛒 E-Ticaret & Online Sipariş' },
                { id: 'BRAND_REACH', label: '👁️ Pazar Hakimiyeti & Trafik' },
              ].map(bm => (
                <button
                  key={bm.id}
                  onClick={() => setBusinessModel(bm.id as BusinessModel)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.8rem',
                    borderRadius: 'var(--radius-xs)',
                    border: businessModel === bm.id ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                    backgroundColor: businessModel === bm.id ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-surface)',
                    color: businessModel === bm.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    fontWeight: businessModel === bm.id ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {bm.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            
            {/* Controls Column */}
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Bütçe & Gösterim Payı (IS) Değişkenleri
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Pazar hacmine bağlı gerçekçi tıklama ve dönüşüm projeksiyonu.
                  </div>
                </div>

                {/* Budget Mode Selector */}
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface-elevated)', padding: '2px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                  <button
                    onClick={() => setBudgetMode('BY_BUDGET')}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      borderRadius: 'var(--radius-xs)',
                      border: 'none',
                      backgroundColor: budgetMode === 'BY_BUDGET' ? 'var(--brand-primary)' : 'transparent',
                      color: budgetMode === 'BY_BUDGET' ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: budgetMode === 'BY_BUDGET' ? 600 : 400
                    }}
                  >
                    Bütçeye Göre
                  </button>
                  <button
                    onClick={() => setBudgetMode('BY_IMPRESSION_SHARE')}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      borderRadius: 'var(--radius-xs)',
                      border: 'none',
                      backgroundColor: budgetMode === 'BY_IMPRESSION_SHARE' ? 'var(--brand-primary)' : 'transparent',
                      color: budgetMode === 'BY_IMPRESSION_SHARE' ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: budgetMode === 'BY_IMPRESSION_SHARE' ? 600 : 400
                    }}
                  >
                    Gösterim Payına Göre
                  </button>
                </div>
              </div>

              {/* Monthly Budget Slider (when BY_BUDGET) */}
              {budgetMode === 'BY_BUDGET' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Hedef Aylık Reklam Bütçesi
                    </label>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                      ₺{monthlyBudget.toLocaleString('tr-TR')}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={150000}
                    step={1000}
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>₺1.000</span>
                    <span>₺25.000</span>
                    <span>₺75.000</span>
                    <span>₺150.000</span>
                  </div>
                </div>
              ) : (
                /* Target Impression Share Slider (when BY_IMPRESSION_SHARE) */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Hedef Pazar Gösterim Payı (Impression Share - IS)
                    </label>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399' }}>
                      %{targetImpressionShare}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={95}
                    step={5}
                    value={targetImpressionShare}
                    onChange={(e) => setTargetImpressionShare(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>%10 (Giriş)</span>
                    <span>%50 (Orta Rekabet)</span>
                    <span>%75 (Pazar Lideri)</span>
                    <span>%95 (Maksimum Doygunluk)</span>
                  </div>
                </div>
              )}

              {/* Expected CTR (TO %) Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Tahmini Arama Ağı Tıklama Oranı (CTR / TO %)
                  </label>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    %{expectedCtr}
                  </span>
                </div>
                <input
                  type="range"
                  min={3.0}
                  max={15.0}
                  step={0.5}
                  value={expectedCtr}
                  onChange={(e) => setExpectedCtr(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--info)', cursor: 'pointer' }}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Arama Ağı sektör standardı ortalama %5.0 - %10.0 aralığındadır.
                </div>
              </div>

              {/* Model-Specific Conversion Controls */}
              {businessModel === 'LEAD_GEN' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        Form & Talep Dönüşüm Oranı (Lead CR %)
                      </label>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#34d399' }}>
                        %{leadConversionRate}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={12.0}
                      step={0.5}
                      value={leadConversionRate}
                      onChange={(e) => setLeadConversionRate(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        Sağlıklı Lead Oranı (% Healthy Lead)
                      </label>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--brand-primary)' }}>
                        %{leadCloseRate}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={40}
                      step={1}
                      value={leadCloseRate}
                      onChange={(e) => setLeadCloseRate(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                    />
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Gelen toplam form/taleplerin satışa/fırsata dönüştürülebilecek nitelikli (sağlıklı lead) oranı.
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Ortalama Anlaşma / Satış / Komisyon Tutarı (₺ - İsteğe Bağlı)
                    </label>
                    <input
                      type="number"
                      placeholder="Örn: 50000"
                      value={avgDealValue || ''}
                      onChange={(e) => setAvgDealValue(Number(e.target.value) || 0)}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>
                </>
              )}

              {businessModel === 'ECOMMERCE' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        Web Sitesi Sipariş Dönüşüm Oranı (%)
                      </label>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        %{ecommerceConversionRate}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={8.0}
                      step={0.1}
                      value={ecommerceConversionRate}
                      onChange={(e) => setEcommerceConversionRate(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--info)', cursor: 'pointer' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Ortalama Sepet Tutarı (AOV ₺)
                    </label>
                    <input
                      type="number"
                      value={avgOrderValue}
                      onChange={(e) => setAvgOrderValue(Math.max(1, Number(e.target.value)))}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>
                </>
              )}

              {/* Campaign Model Info Badge */}
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                💡 <strong>Matematiksel Model:</strong> Seçili {selectedKeywordsPool.length} anahtar kelimenin toplam aylık pazar hacmi (<strong>{totalSearchVolume.toLocaleString('tr-TR')} arama</strong>), ağırlıklı sayfa üstü TBM (<strong>₺{avgTopPageCpc.toFixed(2)}</strong>) ve <strong>%{simulation.targetImpressionShare} Hedef Gösterim Payı (IS)</strong> esas alınarak hesaplanmıştır.
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    🎯 Tahmini Kampanya Performans Projeksiyonu
                  </div>
                  <div className="badge" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)', fontWeight: 600, fontSize: '0.75rem' }}>
                    %{simulation.targetImpressionShare} Gösterim Payı (IS)
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Aylık <strong>₺{simulation.actualSpend.toLocaleString('tr-TR')}</strong> harcama ile beklenen gerçekçi pazar sonuçları.
                </div>
              </div>

              {/* Market Saturation Warning if Budget exceeds Market Capacity */}
              {simulation.isMarketSaturated && (
                <div style={{ padding: '0.85rem 1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#d97706', lineHeight: 1.45 }}>
                  ⚠️ <strong>Pazar Kapasite Tavanı Uyarısı:</strong> Hedeflediğiniz pazarda bu anahtar kelimelerin toplam aylık arama hacmi <strong>{totalSearchVolume.toLocaleString('tr-TR')}</strong> adettir. %95 maksimum gösterim payında bile aylık harcanabilecek tutar <strong>₺{simulation.marketCapacitySpend.toLocaleString('tr-TR')}</strong> ile sınırlıdır. ₺{monthlyBudget.toLocaleString('tr-TR')} bütçenizi tüketmek için lütfen yeni anahtar kelimeler ekleyin veya 2. Adımdan yeni hedef ülkeler seçin.
                </div>
              )}

              {/* Core Search Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                
                {/* Impressions (Strictly bounded by search volume) */}
                <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Gösterim (Impressions)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {simulation.estImpressions.toLocaleString('tr-TR')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    Pazar Payı: %{simulation.targetImpressionShare} / {totalSearchVolume.toLocaleString('tr-TR')} Hacim
                  </div>
                </div>

                {/* Clicks */}
                <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Tıklama (Aylık Ziyaret)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-primary)', marginTop: '2px' }}>
                    {simulation.estClicks.toLocaleString('tr-TR')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    %{expectedCtr} Tahmini TO • Günlük ~{Math.max(1, Math.round(simulation.estClicks / 30.4))} Tık
                  </div>
                </div>

                {/* Actual Spend */}
                <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Gerçekleşecek Aylık Harcama</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    ₺{simulation.actualSpend.toLocaleString('tr-TR')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    Günlük: ~₺{simulation.dailyBudget.toLocaleString('tr-TR')} • Ort. TBM: ₺{simulation.avgCpc.toFixed(2)}
                  </div>
                </div>

                {/* Conversions or Leads */}
                <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {businessModel === 'LEAD_GEN' ? 'Tahmini Form & Talep (Leads)' : businessModel === 'ECOMMERCE' ? 'Tahmini Sipariş' : 'Toplam Etkileşim'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                    {simulation.estConversions.toLocaleString('tr-TR')} Adet
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {businessModel === 'LEAD_GEN' ? `CPL: ₺${simulation.cpa.toLocaleString('tr-TR')} / talep` : `CPA: ₺${simulation.cpa.toLocaleString('tr-TR')} / sipariş`}
                  </div>
                </div>

              </div>

              {/* Business Model Specific Outcome Box */}
              {businessModel === 'LEAD_GEN' && (
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.06)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tahmini Sağlıklı Lead (Healthy Leads)
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                      ~{simulation.estDeals} Nitelikli Lead
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      %{leadCloseRate} Sağlıklı Lead Oranı ile • Nitelikli Lead Başı Maliyet (Cost / Healthy Lead): <strong>₺{simulation.cac?.toLocaleString('tr-TR') || 0}</strong>
                    </div>
                  </div>

                  {avgDealValue > 0 && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tahmini Proje Geliri</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>
                        ₺{simulation.estRevenue.toLocaleString('tr-TR')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ROAS: {simulation.projectedRoas}x</div>
                    </div>
                  )}
                </div>
              )}

              {businessModel === 'ECOMMERCE' && (
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'rgba(37, 99, 235, 0.06)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(37, 99, 235, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tahmini Net Kâr / Ciro</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: simulation.estRevenue - simulation.actualSpend >= 0 ? '#34d399' : 'var(--danger)', marginTop: '2px' }}>
                      ₺{simulation.estRevenue.toLocaleString('tr-TR')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Net Kâr: ₺{(simulation.estRevenue - simulation.actualSpend).toLocaleString('tr-TR')}</div>
                  </div>
                </div>
              )}

              {businessModel === 'BRAND_REACH' && (
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.06)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Pazar Hakimiyeti & Erişim
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
                      %{simulation.targetImpressionShare} Pazar Payı
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Hedeflenen ülkedeki her 100 aramanın <strong>{simulation.targetImpressionShare}</strong> tanesinde reklamınız ilk sayfada görünecektir.
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aylık Trafik Kazanımı</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      ~{simulation.estClicks.toLocaleString('tr-TR')} Ziyaretçi
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ortalama TBM: ₺{simulation.avgCpc.toFixed(2)}</div>
                  </div>
                </div>
              )}

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
                          <span>Pazar Hacmi: <strong style={{ color: 'var(--text-primary)' }}>{cm.monthlyVolume.toLocaleString('tr-TR')}</strong></span>
                          <span>Ort. TBM: <strong style={{ color: 'var(--text-primary)' }}>₺{cm.avgCpc.toFixed(2)}</strong></span>
                          <span>~{cm.estClicks} Tıklama</span>
                          <span>~{cm.estConversions} {businessModel === 'LEAD_GEN' ? 'Talep' : 'Sipariş'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

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

            </div>
          )}

        </>
      )}

    </div>
  );
};
