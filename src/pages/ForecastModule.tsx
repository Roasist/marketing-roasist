import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  DollarSign, 
  ShieldAlert, 
  Download, 
  Save, 
  Check, 
  Copy, 
  Trash2, 
  RefreshCw, 
  FolderDown, 
  Globe, 
  Languages, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  X, 
  ChevronRight,
  FolderTree, 
  BarChart3, 
  ArrowUpDown,
  Layers,
  Tag,
  Calendar,
  Building2,
  Bookmark,
  ListPlus,
  Info,
  KeyRound,
  SlidersHorizontal,
  FileText,
  Edit2
} from 'lucide-react';
import { ExportCustomizationModal } from '../components/ExportCustomizationModal';
import { KeywordCluster, groupKeywordsSemantically, enrichKeywordsWithClusterCpc } from '../services/keywordClusteringService';
import { 
  KeywordMetric, 
  ForecastSimulation, 
  NegativeCategory, 
  ForecastPlan, 
  CountryMetric, 
  BusinessModel,
  ChannelType,
  MetaSimulation,
  GdnSimulation,
  YouTubeSimulation,
  OmnichannelMediaMix,
  GeoTargetLocation,
  SavedLocationPreset,
  GrowthScenario,
  CampaignPlatform,
  CampaignObjective,
  SubCampaignItem,
  CpcImputationSettings
} from '../types/forecast';
import { ApiService } from '../services/apiService';

export const COUNTRY_CPC_MULTIPLIERS: Record<string, number> = {
  TR: 1.0,
  US: 1.0,
  CH: 1.0,
  GB: 1.0,
  UK: 1.0,
  NL: 1.0,
  DE: 1.0,
  SE: 1.0,
  NO: 1.0,
  DK: 1.0,
  FI: 1.0,
  AT: 1.0,
  BE: 1.0,
  LU: 1.0,
  IE: 1.0,
  CA: 1.0,
  AU: 1.0,
  NZ: 1.0,
  FR: 1.0,
  IT: 1.0,
  ES: 1.0,
  PT: 1.0,
  AE: 1.0,
  QA: 1.0,
  KW: 1.0,
  SA: 1.0,
  BH: 1.0,
  OM: 1.0,
  IL: 1.0,
  CY: 1.0,
  GR: 1.0,
  PL: 1.0,
  CZ: 1.0,
  HU: 1.0,
  RO: 1.0,
  BG: 1.0,
  RU: 1.0,
  UA: 1.0,
  KZ: 1.0,
  UZ: 1.0,
  AZ: 1.0,
  GE: 1.0,
  KG: 1.0
};

export const getCountryCpcMultiplier = (_countryCode?: string): number => {
  return 1.0;
};

export const CORE_GEO_ENTITIES: Record<string, GeoTargetLocation> = {
  TR: { id: '2792', resourceName: 'geoTargetConstants/2792', name: 'Türkiye', canonicalName: 'Türkiye', countryCode: 'TR', targetType: 'Country', reach: 85000000, flag: '🇹🇷', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  TR_IST: { id: '1012782', resourceName: 'geoTargetConstants/1012782', name: 'İstanbul', canonicalName: 'Istanbul, Turkey', countryCode: 'TR', targetType: 'City', reach: 16000000, flag: '🇹🇷', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  TR_ANTALYA: { id: '1012763', resourceName: 'geoTargetConstants/1012763', name: 'Antalya', canonicalName: 'Antalya, Turkey', countryCode: 'TR', targetType: 'City', reach: 2600000, flag: '🇹🇷', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  TR_ALANYA: { id: '9199343', resourceName: 'geoTargetConstants/9199343', name: 'Alanya', canonicalName: 'Alanya, Antalya, Turkey', countryCode: 'TR', targetType: 'District', reach: 350000, flag: '🇹🇷', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  TR_ANKARA: { id: '1012764', resourceName: 'geoTargetConstants/1012764', name: 'Ankara', canonicalName: 'Ankara, Turkey', countryCode: 'TR', targetType: 'City', reach: 5800000, flag: '🇹🇷', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  TR_IZMIR: { id: '1012783', resourceName: 'geoTargetConstants/1012783', name: 'İzmir', canonicalName: 'Izmir, Turkey', countryCode: 'TR', targetType: 'City', reach: 4500000, flag: '🇹🇷', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  TR_BODRUM: { id: '9199587', resourceName: 'geoTargetConstants/9199587', name: 'Bodrum', canonicalName: 'Bodrum, Mugla, Turkey', countryCode: 'TR', targetType: 'District', reach: 200000, flag: '🇹🇷', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  DE: { id: '2276', resourceName: 'geoTargetConstants/2276', name: 'Almanya', canonicalName: 'Germany', countryCode: 'DE', targetType: 'Country', reach: 83000000, flag: '🇩🇪', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  AT: { id: '2040', resourceName: 'geoTargetConstants/2040', name: 'Avusturya', canonicalName: 'Austria', countryCode: 'AT', targetType: 'Country', reach: 9000000, flag: '🇦🇹', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  CH: { id: '2756', resourceName: 'geoTargetConstants/2756', name: 'İsviçre', canonicalName: 'Switzerland', countryCode: 'CH', targetType: 'Country', reach: 8700000, flag: '🇨🇭', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  NL: { id: '2528', resourceName: 'geoTargetConstants/2528', name: 'Hollanda', canonicalName: 'Netherlands', countryCode: 'NL', targetType: 'Country', reach: 17800000, flag: '🇳🇱', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  UK: { id: '2826', resourceName: 'geoTargetConstants/2826', name: 'Birleşik Krallık (İngiltere)', canonicalName: 'United Kingdom', countryCode: 'GB', targetType: 'Country', reach: 67000000, flag: '🇬🇧', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  SE: { id: '2752', resourceName: 'geoTargetConstants/2752', name: 'İsveç', canonicalName: 'Sweden', countryCode: 'SE', targetType: 'Country', reach: 10500000, flag: '🇸🇪', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  NO: { id: '2578', resourceName: 'geoTargetConstants/2578', name: 'Norveç', canonicalName: 'Norway', countryCode: 'NO', targetType: 'Country', reach: 5400000, flag: '🇳🇴', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  DK: { id: '2208', resourceName: 'geoTargetConstants/2208', name: 'Danimarka', canonicalName: 'Denmark', countryCode: 'DK', targetType: 'Country', reach: 5900000, flag: '🇩🇰', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  FI: { id: '2246', resourceName: 'geoTargetConstants/2246', name: 'Finlandiya', canonicalName: 'Finland', countryCode: 'FI', targetType: 'Country', reach: 5500000, flag: '🇫🇮', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  US: { id: '2840', resourceName: 'geoTargetConstants/2840', name: 'Amerika Birleşik Devletleri', canonicalName: 'United States', countryCode: 'US', targetType: 'Country', reach: 330000000, flag: '🇺🇸', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  CA: { id: '2124', resourceName: 'geoTargetConstants/2124', name: 'Kanada', canonicalName: 'Canada', countryCode: 'CA', targetType: 'Country', reach: 39000000, flag: '🇨🇦', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  AU: { id: '2036', resourceName: 'geoTargetConstants/2036', name: 'Avustralya', canonicalName: 'Australia', countryCode: 'AU', targetType: 'Country', reach: 26000000, flag: '🇦🇺', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  FR: { id: '2250', resourceName: 'geoTargetConstants/2250', name: 'Fransa', canonicalName: 'France', countryCode: 'FR', targetType: 'Country', reach: 68000000, flag: '🇫🇷', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  IT: { id: '2380', resourceName: 'geoTargetConstants/2380', name: 'İtalya', canonicalName: 'Italy', countryCode: 'IT', targetType: 'Country', reach: 59000000, flag: '🇮🇹', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  ES: { id: '2724', resourceName: 'geoTargetConstants/2724', name: 'İspanya', canonicalName: 'Spain', countryCode: 'ES', targetType: 'Country', reach: 47000000, flag: '🇪🇸', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  AE: { id: '2784', resourceName: 'geoTargetConstants/2784', name: 'Birleşik Arap Emirlikleri', canonicalName: 'United Arab Emirates', countryCode: 'AE', targetType: 'Country', reach: 9500000, flag: '🇦🇪', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  AE_DUBAI: { id: '1000013', resourceName: 'geoTargetConstants/1000013', name: 'Dubai', canonicalName: 'Dubai, United Arab Emirates', countryCode: 'AE', targetType: 'City', reach: 3500000, flag: '🇦🇪', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  SA: { id: '2682', resourceName: 'geoTargetConstants/2682', name: 'Suudi Arabistan', canonicalName: 'Saudi Arabia', countryCode: 'SA', targetType: 'Country', reach: 36000000, flag: '🇸🇦', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  QA: { id: '2634', resourceName: 'geoTargetConstants/2634', name: 'Katar', canonicalName: 'Qatar', countryCode: 'QA', targetType: 'Country', reach: 2800000, flag: '🇶🇦', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  KW: { id: '2414', resourceName: 'geoTargetConstants/2414', name: 'Kuveyt', canonicalName: 'Kuwait', countryCode: 'KW', targetType: 'Country', reach: 4300000, flag: '🇰🇼', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  RU: { id: '2643', resourceName: 'geoTargetConstants/2643', name: 'Rusya', canonicalName: 'Russia', countryCode: 'RU', targetType: 'Country', reach: 144000000, flag: '🇷🇺', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  UA: { id: '2804', resourceName: 'geoTargetConstants/2804', name: 'Ukrayna', canonicalName: 'Ukraine', countryCode: 'UA', targetType: 'Country', reach: 38000000, flag: '🇺🇦', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  UA_KYIV: { id: '1012852', resourceName: 'geoTargetConstants/1012852', name: 'Kiev (Kyiv)', canonicalName: 'Kyiv, Ukraine', countryCode: 'UA', targetType: 'City', reach: 3000000, flag: '🇺🇦', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  UA_ODESA: { id: '1012861', resourceName: 'geoTargetConstants/1012861', name: 'Odessa (Odesa)', canonicalName: 'Odesa, Ukraine', countryCode: 'UA', targetType: 'City', reach: 1000000, flag: '🇺🇦', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  KZ: { id: '2398', resourceName: 'geoTargetConstants/2398', name: 'Kazakistan', canonicalName: 'Kazakhstan', countryCode: 'KZ', targetType: 'Country', reach: 19500000, flag: '🇰🇿', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  UZ: { id: '2860', resourceName: 'geoTargetConstants/2860', name: 'Özbekistan', canonicalName: 'Uzbekistan', countryCode: 'UZ', targetType: 'Country', reach: 35000000, flag: '🇺🇿', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  AZ: { id: '2031', resourceName: 'geoTargetConstants/2031', name: 'Azerbaycan', canonicalName: 'Azerbaijan', countryCode: 'AZ', targetType: 'Country', reach: 10200000, flag: '🇦🇿', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
  CY: { id: '2196', resourceName: 'geoTargetConstants/2196', name: 'Kıbrıs (Kuzey & Güney)', canonicalName: 'Cyprus', countryCode: 'CY', targetType: 'Country', reach: 1250000, flag: '🇨🇾', cpcMultiplier: 1.0, volumeMultiplier: 1.0 }
};

export const DEFAULT_LOCATIONS: GeoTargetLocation[] = [
  CORE_GEO_ENTITIES.TR
];

export const SYSTEM_LOCATION_PRESETS = [
  {
    id: 'sys_tr_all',
    name: '🇹🇷 Tüm Türkiye',
    description: 'Türkiye genel pazar aramaları',
    locs: [CORE_GEO_ENTITIES.TR]
  },
  {
    id: 'sys_tr_major',
    name: '🇹🇷 Türkiye Metropol & Akdeniz',
    description: 'İstanbul, Antalya, Alanya, İzmir, Ankara, Bodrum',
    locs: [CORE_GEO_ENTITIES.TR_IST, CORE_GEO_ENTITIES.TR_ANTALYA, CORE_GEO_ENTITIES.TR_ALANYA, CORE_GEO_ENTITIES.TR_IZMIR, CORE_GEO_ENTITIES.TR_ANKARA, CORE_GEO_ENTITIES.TR_BODRUM]
  },
  {
    id: 'sys_dach_europe',
    name: '🇩🇪 DACH & Avrupa Diasporası',
    description: 'Almanya, Avusturya, İsviçre, Hollanda, Birleşik Krallık',
    locs: [CORE_GEO_ENTITIES.DE, CORE_GEO_ENTITIES.AT, CORE_GEO_ENTITIES.CH, CORE_GEO_ENTITIES.NL, CORE_GEO_ENTITIES.UK]
  },
  {
    id: 'sys_cis_russian',
    name: '🌐 BDT & Rusça Konuşan Ülkeler',
    description: 'Rusya, Ukrayna, Kazakistan, Özbekistan, Azerbaycan',
    locs: [CORE_GEO_ENTITIES.RU, CORE_GEO_ENTITIES.UA, CORE_GEO_ENTITIES.KZ, CORE_GEO_ENTITIES.UZ, CORE_GEO_ENTITIES.AZ]
  },
  {
    id: 'sys_gcc_gulf',
    name: '🇦🇪 Körfez (GCC) & Dubai',
    description: 'BAE/Dubai, Suudi Arabistan, Katar, Kuveyt',
    locs: [CORE_GEO_ENTITIES.AE, CORE_GEO_ENTITIES.SA, CORE_GEO_ENTITIES.QA, CORE_GEO_ENTITIES.KW]
  },
  {
    id: 'sys_global_invest',
    name: '🇺🇸 Global Yatırımcı & Diaspora',
    description: 'ABD, Birleşik Krallık, Almanya, BAE',
    locs: [CORE_GEO_ENTITIES.US, CORE_GEO_ENTITIES.UK, CORE_GEO_ENTITIES.DE, CORE_GEO_ENTITIES.AE]
  },
  {
    id: 'sys_cyprus_med',
    name: '🇨🇾 Kıbrıs & Doğu Akdeniz',
    description: 'Kıbrıs, Türkiye, Birleşik Krallık',
    locs: [CORE_GEO_ENTITIES.CY, CORE_GEO_ENTITIES.TR, CORE_GEO_ENTITIES.UK]
  }
];

export const getLocationTypeLabel = (type?: string): string => {
  switch (type?.toLowerCase()) {
    case 'country': return 'Ülke';
    case 'province': return 'İl / Bölge';
    case 'state':
    case 'region': return 'Bölge / Eyalet';
    case 'city': return 'Şehir';
    case 'district':
    case 'county':
    case 'borough': return 'İlçe';
    case 'postal code': return 'Posta Kodu';
    default: return type || 'Bölge';
  }
};

export const formatReachNumber = (reach?: number | null): string => {
  if (!reach) return '— Sınırlı erişim';
  return `${reach.toLocaleString('tr-TR')} erişim`;
};

export interface GoogleAdsLanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const GOOGLE_ADS_LANGUAGES: GoogleAdsLanguageOption[] = [
  { code: 'auto', name: 'Otomatik (Sayfa Dili)', nativeName: 'Otomatik', flag: '🌐' },
  { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'İngilizce', nativeName: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Almanca', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Rusça', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arapça', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Fransızca', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'İspanyolca', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'İtalyanca', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Felemenkçe / Hollandaca', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pt', name: 'Portekizce', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'pl', name: 'Lehçe / Polonyaca', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'sv', name: 'İsveççe', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norveççe', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danca', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Fince', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'el', name: 'Yunanca', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'cs', name: 'Çekçe', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', name: 'Macarca', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Romence', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Bulgarca', nativeName: 'Български', flag: '🇧🇬' },
  { code: 'uk', name: 'Ukraynaca', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'iw', name: 'İbranice', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'fa', name: 'Farsça', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: 'az', name: 'Azerbaycanca', nativeName: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'kk', name: 'Kazakça', nativeName: 'Қазақша', flag: '🇰🇿' },
  { code: 'uz', name: 'Özbekçe', nativeName: 'Oʻzbekcha', flag: '🇺🇿' },
  { code: 'ka', name: 'Gürcüce', nativeName: 'ქართული', flag: '🇬🇪' },
  { code: 'ja', name: 'Japonca', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh_cn', name: 'Çince (Basitleştirilmiş)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh_tw', name: 'Çince (Geleneksel)', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'ko', name: 'Korece', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'Hintçe', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'Tayca', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamca', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Endonezce', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malayca', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'hr', name: 'Hırvatça', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr', name: 'Sırpça', nativeName: 'Српски', flag: '🇷🇸' },
  { code: 'sk', name: 'Slovakça', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovence', nativeName: 'Slovenščina', flag: '🇸🇮' },
  { code: 'et', name: 'Estonca', nativeName: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Letonca', nativeName: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Litvanca', nativeName: 'Lietuvių', flag: '🇱🇹' }
];

// Automatic Context & Keyword Language Detection Helper
export const detectLanguageFromTextOrKeywords = (text: string, kwList: { keyword: string }[] = []): { code: string; name: string; flag: string } => {
  const combined = (text + ' ' + kwList.map(k => k.keyword).join(' ')).trim();
  if (!combined) {
    return { code: 'tr', name: 'Türkçe', flag: '🇹🇷' };
  }

  // 1. Persian / Farsi transliterations or specific characters
  if (/(shahrvandi|sarmaye|kharid|melk|aprteman|farsi|persian|iran|tehran|eghamat|alan(y|i)a|turkey|turkiye)/i.test(combined) && /[\u0600-\u06FF]/.test(combined)) {
    return { code: 'fa', name: 'Farsça', flag: '🇮🇷' };
  }
  if (/[گچپژ]/.test(combined)) {
    return { code: 'fa', name: 'Farsça', flag: '🇮🇷' };
  }
  if (/(در|با|برای|است|این|آن|که|های|شهروندی|ترکیه|سرمایه‌گذاری|سرمایه گذاری|پروژه|خرید|ملک|آپارتمان|خانه|مشاوره|اخذ|ما|شما|پاسپورت|آلانیا|استانبول|اقامت|سازنده|سوالات|سود|هنگام|دریافت|پکیج|سند|تاپو|پشتیبانی|فارسی|دارایی)/i.test(combined)) {
    return { code: 'fa', name: 'Farsça', flag: '🇮🇷' };
  }

  // 2. Arabic
  if (/[\u0600-\u06FF]/.test(combined)) {
    if (/(في|من|على|إلى|عن|مع|هذا|هذه|التي|الذي|شقق|للبيع|للإيجار|عقارات|الجنسية|الاستثمار|اسطنبول|أنطاليا|تركيا|سياحة|فلل|شركة|خدمات)/i.test(combined)) {
      return { code: 'ar', name: 'Arapça', flag: '🇸🇦' };
    }
    if (/[کی]/.test(combined)) {
      return { code: 'fa', name: 'Farsça', flag: '🇮🇷' };
    }
    return { code: 'ar', name: 'Arapça', flag: '🇸🇦' };
  }

  // 3. Cyrillic (Russian)
  if (/[\u0400-\u04FF]/.test(combined)) {
    return { code: 'ru', name: 'Rusça', flag: '🇷🇺' };
  }

  // 4. Turkish
  if (/[ğşIıİĞŞ]/.test(combined) || /\b(ve|ile|için|bir|bu|da|de|olarak|gibi|satılık|kiralık|fiyatları|konut|daire|otel|villa|emlak|vatandaşlık|pasaport|gayrimenkul|yatırım|hakkımızda|iletişim)\b/i.test(combined)) {
    return { code: 'tr', name: 'Türkçe', flag: '🇹🇷' };
  }

  // 5. German
  if (/[äÄß]/.test(combined) || /\b(und|für|mit|der|die|das|dem|den|des|ein|eine|von|bei|aus|nach|über|unter|nicht|wir|sie|ihr|uns|unsere)\b/i.test(combined)) {
    return { code: 'de', name: 'Almanca', flag: '🇩🇪' };
  }

  // 6. English
  if (/\b(the|of|in|and|for|with|by|to|is|are|citizenship|investment|property|real estate|passport|turkey|turkish|houses|villas|apartment|apartments)\b/i.test(combined)) {
    return { code: 'en', name: 'İngilizce', flag: '🇬🇧' };
  }

  return { code: 'tr', name: 'Türkçe', flag: '🇹🇷' };
};

// Official Brand SVG Icons
export const GoogleIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, verticalAlign: 'middle', display: 'inline-block' }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export const MetaIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, verticalAlign: 'middle', display: 'inline-block' }}>
    <path d="M12 8.167C9.37 3.52 4.67 1.84 1.7 4.54C-1.33 7.3 -0.22 13.82 2.9 17.36C6.02 20.9 9.87 17.36 12 13.5C14.13 17.36 17.98 20.9 21.1 17.36C24.22 13.82 25.33 7.3 22.3 4.54C19.33 1.84 14.63 3.52 12 8.167ZM18.52 14.54C16.54 16.54 14.28 14.86 12.82 12.44C14.48 9.68 17.2 6.94 19.3 7.54C21.4 8.14 21.3 12.14 18.52 14.54ZM5.48 14.54C2.7 12.14 2.6 8.14 4.7 7.54C6.8 6.94 9.52 9.68 11.18 12.44C9.72 14.86 7.46 16.54 5.48 14.54Z" fill="#0081FB"/>
  </svg>
);

export const YouTubeIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, verticalAlign: 'middle', display: 'inline-block' }}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000"/>
    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF"/>
  </svg>
);

export const GdnIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, verticalAlign: 'middle', display: 'inline-block' }}>
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="#4285F4" strokeWidth="2" fill="none"/>
    <rect x="5" y="6" width="6" height="4" rx="1" fill="#EA4335"/>
    <rect x="13" y="6" width="6" height="2" rx="0.5" fill="#FBBC05"/>
    <rect x="13" y="9" width="4" height="2" rx="0.5" fill="#34A853"/>
    <path d="M8 21h8M12 17v4" stroke="#4285F4" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const OmnichannelIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, verticalAlign: 'middle', display: 'inline-block' }}>
    <circle cx="12" cy="12" r="9.5" stroke="#3b82f6" strokeWidth="1.75"/>
    <ellipse cx="12" cy="12" rx="4.5" ry="9.5" stroke="#06b6d4" strokeWidth="1.5"/>
    <path d="M2.5 12h19M4 7.5h16M4 16.5h16" stroke="#3b82f6" strokeWidth="1.25" strokeLinecap="round"/>
  </svg>
);

export const TikTokIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, verticalAlign: 'middle', display: 'inline-block' }}>
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.892 2.892 2.896 2.896 0 0 1-2.892-2.892 2.896 2.896 0 0 1 2.892-2.892c.313 0 .614.049.897.139V9.42a6.34 6.34 0 0 0-.897-.064 6.343 6.343 0 1 0 6.344 6.344V8.417c1.332.955 2.96 1.523 4.721 1.554V6.686z" fill="#000000"/>
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.892 2.892 2.896 2.896 0 0 1-2.892-2.892 2.896 2.896 0 0 1 2.892-2.892c.313 0 .614.049.897.139V9.42a6.34 6.34 0 0 0-.897-.064 6.343 6.343 0 1 0 6.344 6.344V8.417c1.332.955 2.96 1.523 4.721 1.554V6.686z" fill="#EE1D52"/>
  </svg>
);

export const YandexIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, verticalAlign: 'middle', display: 'inline-block' }}>
    <circle cx="12" cy="12" r="11" fill="#FC3F1D"/>
    <path d="M13.8 6h2.2l-3.6 5.8 3.9 6.2h-2.3l-2.9-4.7-1.3 2v2.7H7.7V6h2.1v6.2l3.1-4.8c.3-.4.6-.9.9-1.4z" fill="#FFFFFF"/>
  </svg>
);

export const BingIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, verticalAlign: 'middle', display: 'inline-block' }}>
    <path d="M5 3v18l6-3.5 6 3.5V3L5 3z" fill="#008373"/>
  </svg>
);

export const getPlatformIcon = (platform?: CampaignPlatform, size = 14) => {
  switch (platform) {
    case 'GOOGLE': return <GoogleIcon size={size} />;
    case 'META': return <MetaIcon size={size} />;
    case 'TIKTOK': return <TikTokIcon size={size} />;
    case 'YOUTUBE': return <YouTubeIcon size={size} />;
    case 'YANDEX': return <YandexIcon size={size} />;
    case 'BING': return <BingIcon size={size} />;
    default: return <Sparkles size={size} />;
  }
};

export { type KeywordCluster, groupKeywordsSemantically };

interface ForecastModuleProps {
  workspaceId?: string;
}

export const ForecastModule: React.FC<ForecastModuleProps> = ({ workspaceId }) => {
  // Stepper State: 1 = STAG Kelime Keşfi & Gruplar, 2 = Seçilen Kelimeleri İncele & Yapılandır, 3 = 360° Medya Karması & Büyüme Simülatörü
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Search & Discovery State
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'URL' | 'KEYWORDS'>('URL');
  const [targetLanguage, setTargetLanguage] = useState<string>('auto');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1 Output: Auto-Detected Language & Page Details
  const [sectorName, setSectorName] = useState<string>('');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('tr');
  const [detectedLanguageName, setDetectedLanguageName] = useState<string>('Türkçe');
  const [pageTitle, setPageTitle] = useState<string>('');
  const [pageSummary, setPageSummary] = useState<string>('');
  const [keywords, setKeywords] = useState<KeywordMetric[]>([]);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<Set<string>>(new Set());
  const [step2ApprovedKeywordIds, setStep2ApprovedKeywordIds] = useState<Set<string>>(new Set());
  const [newKeywordInput, setNewKeywordInput] = useState<string>('');

  // Guaranteed Non-Auto Resolved Language for UI Display & APIs
  const effectiveLanguage = useMemo(() => {
    if (detectedLanguage && detectedLanguage !== 'auto') {
      const obj = GOOGLE_ADS_LANGUAGES.find(l => l.code === detectedLanguage);
      return {
        code: detectedLanguage,
        name: (detectedLanguageName && detectedLanguageName !== 'Otomatik' && detectedLanguageName !== 'Otomatik (Sayfa Dili)') ? detectedLanguageName : (obj?.name || 'Türkçe'),
        flag: obj?.flag || '🌐'
      };
    }
    // Auto-detect from query, pageTitle and keywords
    return detectLanguageFromTextOrKeywords(query + ' ' + (pageTitle || ''), keywords);
  }, [detectedLanguage, detectedLanguageName, query, pageTitle, keywords]);

  // Target Locations (Google Keyword Planner Style Engine)
  const [selectedLocations, setSelectedLocations] = useState<GeoTargetLocation[]>(DEFAULT_LOCATIONS);
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>('');
  const [locationSearchResults, setLocationSearchResults] = useState<GeoTargetLocation[]>([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState<boolean>(false);

  // Export Customization Modal State
  const [exportModalState, setExportModalState] = useState<{
    isOpen: boolean;
    subCampaign: SubCampaignItem | null;
    format: 'PDF' | 'CSV';
    masterPlan?: { name?: string; clientName?: string; period?: string; startDate?: string; endDate?: string };
  }>({
    isOpen: false,
    subCampaign: null,
    format: 'PDF'
  });

  // Step 1: Master-Detail Clustering & Data Grid State
  const [activeClusterId, setActiveClusterId] = useState<string>('ALL');
  const [step1SortBy, setStep1SortBy] = useState<'VOLUME' | 'CPC_LOW' | 'CPC_HIGH' | 'ALPHABETICAL'>('VOLUME');
  const [step1SearchFilter, setStep1SearchFilter] = useState('');
  const [step1IntentFilter, setStep1IntentFilter] = useState<string>('ALL');
  const [activeLocationScope, setActiveLocationScope] = useState<string>('ALL');
  const [hoveredKwGeoId, setHoveredKwGeoId] = useState<string | null>(null);
  const [includeSuggestions, setIncludeSuggestions] = useState<boolean>(true);
  const [step1SourceFilter, setStep1SourceFilter] = useState<'ALL' | 'USER_SEED' | 'EXPANSION'>('ALL');

  // CPC Imputation Settings (Hierarchical cluster-intent modifiers for low-volume keywords)
  const [cpcImputationSettings, setCpcImputationSettings] = useState<CpcImputationSettings>(() => {
    try {
      const raw = localStorage.getItem('roasist_cpc_imputation_settings');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      transactionalMultiplier: 1.15,
      commercialMultiplier: 1.00,
      informationalMultiplier: 0.85,
      autoImputeMissingCpc: true,
    };
  });
  const [showCpcSettingsModal, setShowCpcSettingsModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('roasist_cpc_imputation_settings', JSON.stringify(cpcImputationSettings));
    } catch (e) {}
  }, [cpcImputationSettings]);

  const handleSaveCpcSettings = (newSettings?: CpcImputationSettings) => {
    const settings = newSettings || cpcImputationSettings;
    setCpcImputationSettings(settings);
    setShowCpcSettingsModal(false);
    try {
      localStorage.setItem('roasist_cpc_imputation_settings', JSON.stringify(settings));
      localStorage.setItem('roasist_user_cpc_imputation_settings', JSON.stringify(settings));
    } catch (e) {}

    // Update active sub-campaign snapshot with new settings
    if (activeSubCampaignId) {
      setSubCampaigns(prev => {
        const next = prev.map(sc => {
          if (sc.id === activeSubCampaignId) {
            return {
              ...sc,
              cpcImputationSettings: settings,
              parameters: {
                ...(sc.parameters || {}),
                cpcImputationSettings: settings
              }
            };
          }
          return sc;
        });

        // Trigger immediate plan sync if an active plan ID is present
        if (currentPlanId) {
          ApiService.saveForecastPlan({
            id: currentPlanId,
            workspaceId,
            name: planName.trim() || `${clientName} - Medya Planı`,
            clientName: clientName.trim(),
            startDate: planStartDate,
            endDate: planEndDate,
            period: formatCampaignDates(planStartDate, planEndDate, planPeriod),
            tags: planTags,
            targetUrl: mode === 'URL' ? query : '',
            seedKeywords: mode === 'KEYWORDS' ? query : '',
            detectedLanguage,
            detectedLanguageName,
            monthlyBudget: totalMasterMonthlyBudget || monthlyBudget,
            selectedKeywords: selectedKeywordsPool,
            simulationResult: simulation,
            negativeKeywords: negativeCategories,
            targetCountries: activeCountries.map(c => c.name),
            countryBreakdown,
            subCampaigns: next
          }).catch(() => {});
        }

        return next;
      });
    }
    setShowCpcSettingsModal(false);
  };

  const parsedSeedList = useMemo(() => {
    if (!query || mode !== 'KEYWORDS') return [];
    return query.split(/[\n\r,;]+/).map(s => s.trim()).filter(s => s.length > 0);
  }, [query, mode]);

  // Keywords normalized with exact multi-location summed volume if geoVolumes exists
  const normalizedKeywords = useMemo(() => {
    const activeGeoCleanIds = new Set(selectedLocations.map(l => String(l.id).replace(/\D/g, '')).filter(Boolean));
    return keywords.map(k => {
      if (k.geoVolumes && Object.keys(k.geoVolumes).length > 0) {
        let sumGeo = 0;
        let hasMatchingGeo = false;
        for (const [gId, vol] of Object.entries(k.geoVolumes)) {
          const cleanGId = String(gId).replace(/\D/g, '');
          if (activeGeoCleanIds.size === 0 || activeGeoCleanIds.has(cleanGId) || activeGeoCleanIds.has(String(gId))) {
            sumGeo += (Number(vol) || 0);
            hasMatchingGeo = true;
          }
        }
        if (hasMatchingGeo && sumGeo > 0) {
          return {
            ...k,
            monthlyVolume: Math.max(k.monthlyVolume || 0, sumGeo)
          };
        }
      }
      return k;
    });
  }, [keywords, selectedLocations]);

  // Semantic Clusters (Base Raw Clusters with Hierarchical CPC Imputation)
  const baseKeywordClusters = useMemo(() => {
    const rawClusters = groupKeywordsSemantically(normalizedKeywords, cpcImputationSettings);
    return rawClusters.map(cluster => {
      const selectedInCluster = cluster.keywords.filter(k => selectedKeywordIds.has(k.id)).length;
      return {
        ...cluster,
        selectedCount: selectedInCluster
      };
    });
  }, [normalizedKeywords, selectedKeywordIds, cpcImputationSettings]);

  // Imputed keywords flat list from base clusters (Single source of truth for semantic enrichment and CPC imputation)
  const imputedKeywords = useMemo(() => {
    const list: KeywordMetric[] = [];
    const seen = new Set<string>();
    baseKeywordClusters.forEach(cluster => {
      cluster.keywords.forEach(kw => {
        if (!seen.has(kw.id)) {
          seen.add(kw.id);
          list.push(kw);
        }
      });
    });
    return list.length > 0 ? list : normalizedKeywords;
  }, [baseKeywordClusters, normalizedKeywords]);

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

  // Saved Custom Location Presets State
  const [savedLocationPresets, setSavedLocationPresets] = useState<SavedLocationPreset[]>(() => {
    try {
      const raw = localStorage.getItem('roasist_saved_location_presets');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading saved location presets:', e);
    }
    return [];
  });
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [isSavingPreset, setIsSavingPreset] = useState<boolean>(false);
  const [presetSaveSuccessMessage, setPresetSaveSuccessMessage] = useState<string>('');

  // Cloud & LocalStorage Sync for Location Presets (Prevents data loss across browser sessions/cPanel edits)
  useEffect(() => {
    let isMounted = true;
    const syncPresets = async () => {
      try {
        const cloudPresets = await ApiService.getLocationPresets(workspaceId);
        if (isMounted && cloudPresets && cloudPresets.length > 0) {
          setSavedLocationPresets(cloudPresets);
          try {
            localStorage.setItem('roasist_saved_location_presets', JSON.stringify(cloudPresets));
          } catch (e) {}
        } else {
          // If cloud has no presets, sync local presets to cloud
          const raw = localStorage.getItem('roasist_saved_location_presets');
          if (raw) {
            const local = JSON.parse(raw);
            if (Array.isArray(local) && local.length > 0) {
              ApiService.saveLocationPresets(local, workspaceId).catch(() => {});
            }
          }
        }
      } catch (e) {
        console.error('Error syncing location presets with server:', e);
      }
    };
    syncPresets();
    return () => { isMounted = false; };
  }, [workspaceId]);

  // Bulk Location Input State
  const [locationInputMode, setLocationInputMode] = useState<'SINGLE' | 'BULK'>('SINGLE');
  const [bulkLocationText, setBulkLocationText] = useState<string>('');
  const [isBatchSearchingLocations, setIsBatchSearchingLocations] = useState<boolean>(false);
  const [batchMatchedLocations, setBatchMatchedLocations] = useState<GeoTargetLocation[]>([]);
  const [batchUnmatchedQueries, setBatchUnmatchedQueries] = useState<string[]>([]);
  const [selectedBatchLocationIds, setSelectedBatchLocationIds] = useState<Set<string>>(new Set());
  const [officialLocationBreakdown, setOfficialLocationBreakdown] = useState<CountryMetric[]>([]);
  const [isLoadingLocationBreakdown, setIsLoadingLocationBreakdown] = useState<boolean>(false);

  // Growth Scenario Projection (Muhafazakar / Beklenen / Agresif)
  const [growthScenario, setGrowthScenario] = useState<GrowthScenario>('REALISTIC');
  const [showScenarioTooltip, setShowScenarioTooltip] = useState<boolean>(false);
  const [isStep1Completed, setIsStep1Completed] = useState<boolean>(false);
  const [isStep2Completed, setIsStep2Completed] = useState<boolean>(false);
  const [isStep3Completed, setIsStep3Completed] = useState<boolean>(false);

  // Simulation & Business Model Parameters
  const [businessModel, setBusinessModel] = useState<BusinessModel>('LEAD_GEN');
  const [budgetMode, setBudgetMode] = useState<'BY_BUDGET' | 'BY_IMPRESSION_SHARE'>('BY_BUDGET');
  const [monthlyBudget, setMonthlyBudget] = useState<number>(35000);
  const [targetImpressionShare, setTargetImpressionShare] = useState<number>(70); // %70 IS
  const [expectedCtr, setExpectedCtr] = useState<number>(7.5); // %7.5 CTR
  const [leadConversionRate, setLeadConversionRate] = useState<number>(3.5); // %3.5 Lead CR
  const [leadCloseRate, setLeadCloseRate] = useState<number>(75.0); // %75 Nitelikli/Sağlıklı Lead Oranı
  const [ecommerceConversionRate, setEcommerceConversionRate] = useState<number>(2.2); // %2.2 E-com CR
  const [avgOrderValue, setAvgOrderValue] = useState<number>(3500); // 3500 ₺
  const [avgDealValue, setAvgDealValue] = useState<number>(0); // Opsiyonel anlaşma değeri

  // Multi-Channel Simulation State (Step 3)
  const [activeChannelTab, setActiveChannelTab] = useState<ChannelType>('OMNICHANNEL');

  // Meta Ads Simulation State
  const [metaCpm, setMetaCpm] = useState<number>(75);
  const [metaCtr, setMetaCtr] = useState<number>(1.6);
  const [metaLeadCr, setMetaLeadCr] = useState<number>(4.5);
  const [metaHealthyLeadRate, setMetaHealthyLeadRate] = useState<number>(50); // % Healthy/Qualified Lead
  const [metaCloseRate, setMetaCloseRate] = useState<number>(15); // % Sales close

  // Google GDN Simulation State
  const [gdnCpm, setGdnCpm] = useState<number>(18);
  const [gdnCtr, setGdnCtr] = useState<number>(0.60);
  const [gdnAssistedCr, setGdnAssistedCr] = useState<number>(1.2);

  // YouTube Ads Simulation State
  const [youtubeCpv, setYoutubeCpv] = useState<number>(0.45);
  const [youtubeVtr, setYoutubeVtr] = useState<number>(32);
  const [youtubeActionRate, setYoutubeActionRate] = useState<number>(1.2);

  // Omnichannel Budget Allocations (%)
  const [allocGoogleSearch, setAllocGoogleSearch] = useState<number>(50);
  const [allocMetaAds, setAllocMetaAds] = useState<number>(30);
  const [allocYouTube, setAllocYouTube] = useState<number>(10);
  const [allocGdn, setAllocGdn] = useState<number>(10);

  // Smart Proportional Channel Allocation (Strictly preserves 100% total sum)
  const updateChannelAllocation = (
    channel: 'google' | 'meta' | 'youtube' | 'gdn',
    newVal: number
  ) => {
    const clampedVal = Math.max(0, Math.min(100, Math.round(newVal)));
    const cur = {
      google: allocGoogleSearch,
      meta: allocMetaAds,
      youtube: allocYouTube,
      gdn: allocGdn
    };

    const otherKeys = (['google', 'meta', 'youtube', 'gdn'] as const).filter(k => k !== channel);
    const sumOthers = otherKeys.reduce((acc, k) => acc + cur[k], 0);
    const remainingPercent = 100 - clampedVal;

    const newOthers: Record<string, number> = {};

    if (sumOthers > 0) {
      let distributedSum = 0;
      otherKeys.forEach((k, idx) => {
        if (idx === otherKeys.length - 1) {
          newOthers[k] = Math.max(0, remainingPercent - distributedSum);
        } else {
          const share = Math.round((cur[k] / sumOthers) * remainingPercent);
          newOthers[k] = Math.max(0, share);
          distributedSum += newOthers[k];
        }
      });
    } else {
      const equalShare = Math.floor(remainingPercent / otherKeys.length);
      let distributedSum = 0;
      otherKeys.forEach((k, idx) => {
        if (idx === otherKeys.length - 1) {
          newOthers[k] = Math.max(0, remainingPercent - distributedSum);
        } else {
          newOthers[k] = equalShare;
          distributedSum += equalShare;
        }
      });
    }

    if (channel === 'google') setAllocGoogleSearch(clampedVal);
    else if (newOthers.google !== undefined) setAllocGoogleSearch(newOthers.google);

    if (channel === 'meta') setAllocMetaAds(clampedVal);
    else if (newOthers.meta !== undefined) setAllocMetaAds(newOthers.meta);

    if (channel === 'youtube') setAllocYouTube(clampedVal);
    else if (newOthers.youtube !== undefined) setAllocYouTube(newOthers.youtube);

    if (channel === 'gdn') setAllocGdn(clampedVal);
    else if (newOthers.gdn !== undefined) setAllocGdn(newOthers.gdn);
  };

  // Prevent signature watcher from invalidating checkmarks during plan/sub-campaign loads
  const isApplyingSubCampaignRef = useRef<boolean>(false);

  // Track parameter changes in Step 2 to invalidate green checkmark
  const prevParamsRef = useRef<string>('');
  useEffect(() => {
    const paramsSignature = JSON.stringify({
      growthScenario,
      businessModel,
      budgetMode,
      monthlyBudget,
      targetImpressionShare,
      expectedCtr,
      leadConversionRate,
      leadCloseRate,
      ecommerceConversionRate,
      avgOrderValue,
      avgDealValue,
      allocGoogleSearch,
      allocMetaAds,
      allocYouTube,
      allocGdn,
      metaCpm,
      metaCtr,
      metaLeadCr,
      metaHealthyLeadRate,
      metaCloseRate,
      youtubeCpv,
      youtubeVtr,
      youtubeActionRate,
      gdnCpm,
      gdnCtr,
      gdnAssistedCr,
      selectedLocationsCount: selectedLocations.length,
      selectedLocationIds: selectedLocations.map(l => l.id).join(',')
    });

    if (isApplyingSubCampaignRef.current) {
      prevParamsRef.current = paramsSignature;
      return;
    }

    if (prevParamsRef.current && prevParamsRef.current !== paramsSignature) {
      setIsStep2Completed(false);
    }
    prevParamsRef.current = paramsSignature;
  }, [
    growthScenario,
    businessModel,
    budgetMode,
    monthlyBudget,
    targetImpressionShare,
    expectedCtr,
    leadConversionRate,
    leadCloseRate,
    ecommerceConversionRate,
    avgOrderValue,
    avgDealValue,
    allocGoogleSearch,
    allocMetaAds,
    allocYouTube,
    allocGdn,
    metaCpm,
    metaCtr,
    metaLeadCr,
    metaHealthyLeadRate,
    metaCloseRate,
    youtubeCpv,
    youtubeVtr,
    youtubeActionRate,
    gdnCpm,
    gdnCtr,
    gdnAssistedCr,
    selectedLocations
  ]);

  // Track keyword selection changes in Step 1 to invalidate green checkmarks
  const prevKeywordsRef = useRef<string>('');
  useEffect(() => {
    const kwSignature = JSON.stringify({
      kwCount: keywords.length,
      selectedCount: selectedKeywordIds.size,
      selectedIds: Array.from(selectedKeywordIds).sort().join(',')
    });

    if (isApplyingSubCampaignRef.current) {
      prevKeywordsRef.current = kwSignature;
      return;
    }

    if (prevKeywordsRef.current && prevKeywordsRef.current !== kwSignature) {
      setIsStep1Completed(false);
      setIsStep2Completed(false);
    }
    prevKeywordsRef.current = kwSignature;
  }, [keywords, selectedKeywordIds]);

  // View mode: 'PORTFOLIO' (All saved Master Plans & Sub-Campaigns Hub) vs 'STUDIO' (Inside specific Master & Sub-Campaign)
  const [viewMode, setViewMode] = useState<'PORTFOLIO' | 'STUDIO'>('PORTFOLIO');
  const [portfolioSearchQuery, setPortfolioSearchQuery] = useState<string>('');

  // Date helper utilities for campaign start & end dates
  const getMonthDateRange = (offsetMonths = 0) => {
    const d = new Date();
    d.setMonth(d.getMonth() + offsetMonths);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(year, d.getMonth() + 1, 0).getDate();
    return {
      start: `${year}-${month}-01`,
      end: `${year}-${month}-${String(lastDay).padStart(2, '0')}`
    };
  };

  const getQuarterDateRange = (quarterOffset = 0) => {
    const now = new Date();
    const year = now.getFullYear();
    let currentQuarter = Math.floor(now.getMonth() / 3) + quarterOffset;
    let targetYear = year;
    if (currentQuarter > 3) {
      targetYear += Math.floor(currentQuarter / 4);
      currentQuarter = currentQuarter % 4;
    }
    const startMonth = String(currentQuarter * 3 + 1).padStart(2, '0');
    const endMonthNum = currentQuarter * 3 + 3;
    const lastDay = new Date(targetYear, endMonthNum, 0).getDate();
    const endMonth = String(endMonthNum).padStart(2, '0');
    return {
      start: `${targetYear}-${startMonth}-01`,
      end: `${targetYear}-${endMonth}-${String(lastDay).padStart(2, '0')}`
    };
  };

  const formatCampaignDates = (startDate?: string, endDate?: string, period?: string): string => {
    if (startDate && endDate) {
      try {
        const s = new Date(startDate);
        const e = new Date(endDate);
        if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
          const sStr = s.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const eStr = e.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          return `${sStr} — ${eStr}`;
        }
      } catch (_) {}
    }
    return period || startDate || 'Tarih Belirtilmedi';
  };

  const initialMonthDates = getMonthDateRange(0);

  // Master Plan Metadata & Tagging State
  const [planName, setPlanName] = useState<string>('Temmuz 2026 Büyüme Kampanyası');
  const [clientName, setClientName] = useState<string>('Acme Sağlık Turizmi');
  const [planStartDate, setPlanStartDate] = useState<string>(initialMonthDates.start);
  const [planEndDate, setPlanEndDate] = useState<string>(initialMonthDates.end);
  const [planPeriod, setPlanPeriod] = useState<string>(formatCampaignDates(initialMonthDates.start, initialMonthDates.end));
  const [planTags, setPlanTags] = useState<string[]>(['#Temmuz2026', '#SağlıkTurizmi']);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  // Master Plan Creation Modal State (Master Level only: Name, Client, Start/End Dates, Tags)
  const [isAddMasterPlanModalOpen, setIsAddMasterPlanModalOpen] = useState<boolean>(false);
  const [newMasterName, setNewMasterName] = useState<string>('');
  const [newMasterClient, setNewMasterClient] = useState<string>('');
  const [newMasterStartDate, setNewMasterStartDate] = useState<string>(initialMonthDates.start);
  const [newMasterEndDate, setNewMasterEndDate] = useState<string>(initialMonthDates.end);
  const [newMasterPeriod, setNewMasterPeriod] = useState<string>('');
  const [newMasterTags, setNewMasterTags] = useState<string[]>(['#Temmuz2026']);
  const [newMasterTagInput, setNewMasterTagInput] = useState<string>('');

  // Multi-Campaign Sub-Campaigns State
  const [subCampaigns, setSubCampaigns] = useState<SubCampaignItem[]>([]);
  const [activeSubCampaignId, setActiveSubCampaignId] = useState<string | null>(null);
  const activeSubCampaign = useMemo(() => {
    return subCampaigns.find(c => c.id === activeSubCampaignId);
  }, [subCampaigns, activeSubCampaignId]);
  const isGoogleSearchActive = useMemo(() => {
    if (!activeSubCampaign) return true;
    return activeSubCampaign.platform === 'GOOGLE' && (!activeSubCampaign.objective || activeSubCampaign.objective === 'GOOGLE_SEARCH');
  }, [activeSubCampaign]);
  const [isAddCampaignModalOpen, setIsAddCampaignModalOpen] = useState<boolean>(false);

  // Sub-Campaign Rename State & Handlers
  const [editingSubCampaignId, setEditingSubCampaignId] = useState<string | null>(null);
  const [tempSubCampaignName, setTempSubCampaignName] = useState<string>('');

  const handleStartRename = (campId: string, currentName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSubCampaignId(campId);
    setTempSubCampaignName(currentName);
  };

  const handleSaveRename = async (campId: string) => {
    const trimmed = tempSubCampaignName.trim();
    if (trimmed && trimmed.length > 0) {
      const updated = subCampaigns.map(c => c.id === campId ? { ...c, name: trimmed } : c);
      setSubCampaigns(updated);

      setExportModalState(prev => {
        if (prev.isOpen && prev.subCampaign && prev.subCampaign.id === campId) {
          return {
            ...prev,
            subCampaign: { ...prev.subCampaign, name: trimmed }
          };
        }
        return prev;
      });

      if (currentPlanId) {
        try {
          const formattedPeriod = formatCampaignDates(planStartDate, planEndDate, planPeriod);
          await ApiService.saveForecastPlan({
            id: currentPlanId,
            workspaceId,
            name: planName.trim() || `${clientName} - ${formattedPeriod} Medya Planı`,
            clientName: clientName.trim(),
            startDate: planStartDate,
            endDate: planEndDate,
            period: formattedPeriod,
            tags: planTags,
            targetUrl: mode === 'URL' ? query : '',
            seedKeywords: mode === 'KEYWORDS' ? query : '',
            detectedLanguage,
            detectedLanguageName,
            monthlyBudget: totalMasterMonthlyBudget || monthlyBudget,
            selectedKeywords: selectedKeywordsPool,
            simulationResult: simulation,
            negativeKeywords: negativeCategories,
            targetCountries: activeCountries.map(c => c.name),
            countryBreakdown,
            subCampaigns: updated
          });
          loadSavedPlans();
        } catch (err) {
          console.error('Error persisting subcampaign rename:', err);
        }
      }
    }
    setEditingSubCampaignId(null);
  };

  const handleRenameSubCampaign = async (campId: string, newName: string) => {
    const trimmed = newName.trim();
    if (trimmed && trimmed.length > 0) {
      const updated = subCampaigns.map(c => c.id === campId ? { ...c, name: trimmed } : c);
      setSubCampaigns(updated);

      setExportModalState(prev => {
        if (prev.isOpen && prev.subCampaign && prev.subCampaign.id === campId) {
          return {
            ...prev,
            subCampaign: { ...prev.subCampaign, name: trimmed }
          };
        }
        return prev;
      });

      if (currentPlanId) {
        try {
          const formattedPeriod = formatCampaignDates(planStartDate, planEndDate, planPeriod);
          await ApiService.saveForecastPlan({
            id: currentPlanId,
            workspaceId,
            name: planName.trim() || `${clientName} - ${formattedPeriod} Medya Planı`,
            clientName: clientName.trim(),
            startDate: planStartDate,
            endDate: planEndDate,
            period: formattedPeriod,
            tags: planTags,
            targetUrl: mode === 'URL' ? query : '',
            seedKeywords: mode === 'KEYWORDS' ? query : '',
            detectedLanguage,
            detectedLanguageName,
            monthlyBudget: totalMasterMonthlyBudget || monthlyBudget,
            selectedKeywords: selectedKeywordsPool,
            simulationResult: simulation,
            negativeKeywords: negativeCategories,
            targetCountries: activeCountries.map(c => c.name),
            countryBreakdown,
            subCampaigns: updated
          });
          loadSavedPlans();
        } catch (err) {
          console.error('Error persisting subcampaign rename:', err);
        }
      }
    }
  };

  // New Sub-Campaign Wizard Form State
  const [newCampName, setNewCampName] = useState<string>('');
  const [newCampPlatform, setNewCampPlatform] = useState<CampaignPlatform>('GOOGLE');
  const [newCampObjective, setNewCampObjective] = useState<CampaignObjective>('GOOGLE_SEARCH');

  // Negative Keywords State
  const [negativeCategories, setNegativeCategories] = useState<NegativeCategory[]>([]);
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null);

  // Saved Plans State
  const [savedPlans, setSavedPlans] = useState<ForecastPlan[]>([]);
  const [planSaveSuccess, setPlanSaveSuccess] = useState(false);

  // Total Master Monthly Budget
  const totalMasterMonthlyBudget = useMemo(() => {
    if (subCampaigns.length === 0) return monthlyBudget || 0;
    return subCampaigns.reduce((sum, c) => sum + (c.monthlyBudget || 0), 0);
  }, [subCampaigns, monthlyBudget]);

  // Whenever monthlyBudget changes in any step/tab, keep active sub-campaign's monthlyBudget synchronized in real time
  useEffect(() => {
    if (isApplyingSubCampaignRef.current) return;
    if (!activeSubCampaignId) return;
    setSubCampaigns(prev => {
      let changed = false;
      const next = prev.map(c => {
        if (c.id === activeSubCampaignId && c.monthlyBudget !== monthlyBudget) {
          changed = true;
          return { ...c, monthlyBudget: monthlyBudget || 0 };
        }
        return c;
      });
      return changed ? next : prev;
    });
  }, [monthlyBudget, activeSubCampaignId]);

  // Sync active sub-campaign snapshot
  const syncActiveSubCampaign = () => {
    setSubCampaigns(prev => prev.map(c => {
      if (c.id !== activeSubCampaignId) return c;
      const availablePool = scopedKeywords.length > 0 ? scopedKeywords : imputedKeywords;
      const selectedKws = Array.from(selectedKeywordIds).map(id => availablePool.find(k => k.id === id)).filter(Boolean) as KeywordMetric[];
      const effectiveSelectedKws = selectedKws.length > 0 ? selectedKws : (availablePool.length > 0 ? availablePool : (c.selectedKeywords || []));
      const effectiveDiscoveredKws = availablePool.length > 0 ? availablePool : (keywords.length > 0 ? keywords : (c.discoveredKeywords || []));
      const subBudget = (monthlyBudget !== undefined && monthlyBudget !== null && monthlyBudget > 0) ? monthlyBudget : 35000;

      const rawTargetLang = targetLanguage || detectedLanguage || 'tr';
      const isAutoLang = rawTargetLang === 'auto' || !rawTargetLang;
      const finalLangCode = isAutoLang ? (detectedLanguage && detectedLanguage !== 'auto' ? detectedLanguage : 'tr') : rawTargetLang;
      const finalLangObj = GOOGLE_ADS_LANGUAGES.find(l => l.code === finalLangCode);
      const finalLangName = isAutoLang 
        ? (detectedLanguageName && detectedLanguageName !== 'Otomatik' && detectedLanguageName !== 'Otomatik (Sayfa Dili)' ? detectedLanguageName : (finalLangObj?.name || 'Türkçe'))
        : (GOOGLE_ADS_LANGUAGES.find(l => l.code === rawTargetLang)?.name || 'Türkçe');
      const finalLangFlag = finalLangObj?.flag || (finalLangCode === 'tr' ? '🇹🇷' : (finalLangCode === 'en' ? '🇬🇧' : '🌐'));

      return {
        ...c,
        targetUrl: mode === 'URL' ? query : '',
        seedKeywords: mode === 'KEYWORDS' ? query : '',
        monthlyBudget: subBudget,
        discoveredKeywords: effectiveDiscoveredKws,
        selectedKeywords: effectiveSelectedKws,
        negativeCategories,
        targetLocations: selectedLocations,
        countryBreakdown: countryBreakdown.length > 0 ? countryBreakdown : c.countryBreakdown,
        businessModel,
        languageCode: finalLangCode,
        languageName: finalLangName,
        languageFlag: finalLangFlag,
        cpcImputationSettings,
        parameters: {
          growthScenario,
          budgetMode,
          avgDealValue,
          allocGoogleSearch,
          allocMetaAds,
          allocYouTube,
          allocGdn,
          targetImpressionShare,
          expectedCtr,
          searchLeadCr: leadConversionRate,
          searchHealthyLeadRate: leadCloseRate,
          searchEcommerceCr: ecommerceConversionRate,
          searchAov: avgOrderValue,
          metaCpm,
          metaCtr,
          metaLeadCr,
          metaHealthyLeadRate,
          metaCloseRate,
          youtubeCpv,
          youtubeVtr,
          youtubeActionRate,
          gdnCpm,
          gdnCtr,
          gdnAssistedCr
        },
        simulationResult: effectiveDiscoveredKws.length > 0 ? simulation : simulation,
        metaSimulationResult: metaSimulation,
        youtubeSimulationResult: youtubeSimulation,
        gdnSimulationResult: gdnSimulation
      };
    }));
  };

  // Apply a sub-campaign's state completely
  const applySubCampaignToState = (target: SubCampaignItem) => {
    isApplyingSubCampaignRef.current = true;
    setActiveSubCampaignId(target.id);
    setKeywords(target.discoveredKeywords || []);
    const loadedSelIds = new Set((target.selectedKeywords || []).map(k => k.id));
    setSelectedKeywordIds(loadedSelIds);
    setStep2ApprovedKeywordIds(loadedSelIds);
    setNegativeCategories(target.negativeCategories || []);
    if (target.targetLocations && target.targetLocations.length > 0) {
      setSelectedLocations(target.targetLocations);
    }
    let lCode = target.languageCode;
    if (!lCode || lCode === 'auto') {
      const autoLang = detectLanguageFromTextOrKeywords(
        (target.targetUrl || target.seedKeywords || '') + ' ' + (target.name || ''),
        target.discoveredKeywords || target.selectedKeywords || []
      );
      lCode = autoLang.code;
    }
    const lObj = GOOGLE_ADS_LANGUAGES.find(l => l.code === lCode);
    const lName = (lCode && lCode !== 'auto') ? (target.languageName && target.languageName !== 'Otomatik (Sayfa Dili)' ? target.languageName : (lObj?.name || 'Türkçe')) : 'Türkçe';
    setTargetLanguage(target.languageCode || 'auto');
    setDetectedLanguage(lCode && lCode !== 'auto' ? lCode : 'tr');
    setDetectedLanguageName(lName);

    if (target.monthlyBudget !== undefined && target.monthlyBudget > 0) {
      setMonthlyBudget(target.monthlyBudget);
    } else {
      setMonthlyBudget(35000);
    }
    if (target.businessModel) {
      setBusinessModel(target.businessModel);
    }
    if (target.targetUrl || target.seedKeywords) {
      setQuery(target.targetUrl || target.seedKeywords || '');
      setMode(target.targetUrl ? 'URL' : 'KEYWORDS');
    } else {
      setQuery('');
    }
    if (target.parameters) {
      if (target.parameters.growthScenario) setGrowthScenario(target.parameters.growthScenario);
      if (target.parameters.budgetMode) setBudgetMode(target.parameters.budgetMode);
      if (target.parameters.targetImpressionShare !== undefined) setTargetImpressionShare(target.parameters.targetImpressionShare);
      if (target.parameters.expectedCtr !== undefined) setExpectedCtr(target.parameters.expectedCtr);
      if (target.parameters.searchLeadCr !== undefined) setLeadConversionRate(target.parameters.searchLeadCr);
      if (target.parameters.searchHealthyLeadRate !== undefined) setLeadCloseRate(target.parameters.searchHealthyLeadRate);
      if (target.parameters.searchEcommerceCr !== undefined) setEcommerceConversionRate(target.parameters.searchEcommerceCr);
      if (target.parameters.searchAov !== undefined) setAvgOrderValue(target.parameters.searchAov);
      if (target.parameters.avgDealValue !== undefined) setAvgDealValue(target.parameters.avgDealValue);
      if (target.parameters.allocGoogleSearch !== undefined) setAllocGoogleSearch(target.parameters.allocGoogleSearch);
      if (target.parameters.allocMetaAds !== undefined) setAllocMetaAds(target.parameters.allocMetaAds);
      if (target.parameters.allocYouTube !== undefined) setAllocYouTube(target.parameters.allocYouTube);
      if (target.parameters.allocGdn !== undefined) setAllocGdn(target.parameters.allocGdn);
      if (target.parameters.metaCpm !== undefined) setMetaCpm(target.parameters.metaCpm);
      if (target.parameters.metaCtr !== undefined) setMetaCtr(target.parameters.metaCtr);
      if (target.parameters.metaLeadCr !== undefined) setMetaLeadCr(target.parameters.metaLeadCr);
      if (target.parameters.metaHealthyLeadRate !== undefined) setMetaHealthyLeadRate(target.parameters.metaHealthyLeadRate);
      if (target.parameters.metaCloseRate !== undefined) setMetaCloseRate(target.parameters.metaCloseRate);
      if (target.parameters.youtubeCpv !== undefined) setYoutubeCpv(target.parameters.youtubeCpv);
      if (target.parameters.youtubeVtr !== undefined) setYoutubeVtr(target.parameters.youtubeVtr);
      if (target.parameters.youtubeActionRate !== undefined) setYoutubeActionRate(target.parameters.youtubeActionRate);
      if (target.parameters.gdnCpm !== undefined) setGdnCpm(target.parameters.gdnCpm);
      if (target.parameters.gdnCtr !== undefined) setGdnCtr(target.parameters.gdnCtr);
      if (target.parameters.gdnAssistedCr !== undefined) setGdnAssistedCr(target.parameters.gdnAssistedCr);
    }

    const targetCpcSettings = target.cpcImputationSettings || (target.parameters as any)?.cpcImputationSettings;
    if (targetCpcSettings) {
      setCpcImputationSettings(targetCpcSettings);
    } else {
      try {
        const userSaved = localStorage.getItem('roasist_user_cpc_imputation_settings') || localStorage.getItem('roasist_cpc_imputation_settings');
        if (userSaved) {
          setCpcImputationSettings(JSON.parse(userSaved));
        }
      } catch (e) {}
    }

    if (target.platform === 'META') {
      setActiveChannelTab('META_ADS');
      setCurrentStep(3);
    } else if (target.platform === 'YOUTUBE') {
      setActiveChannelTab('YOUTUBE');
      setCurrentStep(3);
    } else if (target.platform === 'GOOGLE' && target.objective === 'GOOGLE_GDN') {
      setActiveChannelTab('GDN');
      setCurrentStep(3);
    } else if (target.platform === 'GOOGLE' && target.objective === 'GOOGLE_SEARCH') {
      setActiveChannelTab('GOOGLE_SEARCH');
    }

    const hasKeywords = (target.discoveredKeywords && target.discoveredKeywords.length > 0) || (target.selectedKeywords && target.selectedKeywords.length > 0);
    setIsStep1Completed(hasKeywords);
    setIsStep2Completed(hasKeywords || target.platform !== 'GOOGLE');
    setIsStep3Completed(Boolean(target.simulationResult || (target.monthlyBudget && target.monthlyBudget > 0)));
    if (!hasKeywords && target.platform === 'GOOGLE' && (target.objective === 'GOOGLE_SEARCH' || !target.objective)) {
      setCurrentStep(1);
    }

    setTimeout(() => {
      isApplyingSubCampaignRef.current = false;
    }, 200);
  };

  // Switch to another sub-campaign
  const handleSelectSubCampaign = (campId: string) => {
    if (campId === activeSubCampaignId) return;
    try {
      localStorage.setItem('roasist_active_studio_sub_id', campId);
    } catch (e) {}
    syncActiveSubCampaign();
    const target = subCampaigns.find(c => c.id === campId);
    if (!target) return;
    applySubCampaignToState(target);
  };

  // Create new Sub-Campaign
  const handleCreateNewSubCampaign = async () => {
    syncActiveSubCampaign();

    const newId = 'sub_' + Date.now();
    const campTitle = newCampName.trim() || `${newCampPlatform} Kampanya ${subCampaigns.length + 1}`;
    const defaultBudget = (monthlyBudget && monthlyBudget > 0) ? monthlyBudget : 35000;
    const newCamp: SubCampaignItem = {
      id: newId,
      name: campTitle,
      platform: newCampPlatform,
      objective: newCampObjective,
      languageCode: 'auto',
      languageName: 'Otomatik (Sayfa Dili)',
      languageFlag: '🌐',
      targetLocations: DEFAULT_LOCATIONS,
      monthlyBudget: defaultBudget,
      selectedKeywords: [],
      discoveredKeywords: [],
      negativeCategories: [],
      businessModel: newCampObjective.includes('SALES') ? 'ECOMMERCE' : 'LEAD_GEN',
      parameters: {
        targetImpressionShare: 70,
        expectedCtr: 7.5,
        searchLeadCr: 3.5,
        searchHealthyLeadRate: 50,
        searchCloseRate: 10,
        metaCpm: 75,
        metaCtr: 1.6,
        metaLeadCr: 4.5,
        metaHealthyLeadRate: 50,
        metaCloseRate: 15,
        youtubeCpv: 0.45,
        youtubeVtr: 32,
        youtubeActionRate: 1.2,
        gdnCpm: 18,
        gdnCtr: 0.60,
        gdnAssistedCr: 1.2
      }
    };

    const updatedSubs = [...subCampaigns, newCamp];
    setSubCampaigns(updatedSubs);
    setActiveSubCampaignId(newId);
    setKeywords([]);
    setSelectedKeywordIds(new Set());
    setNegativeCategories([]);
    setSelectedLocations(DEFAULT_LOCATIONS);
    setTargetLanguage('auto');
    setDetectedLanguage('auto');
    setDetectedLanguageName('Otomatik (Sayfa Dili)');
    setMonthlyBudget(defaultBudget);
    setQuery('');
    setIsAddCampaignModalOpen(false);
    setNewCampName('');
    setIsStep1Completed(false);
    setIsStep2Completed(false);
    setCurrentStep(1);
    
    // Switch channel sub tab to match objective
    if (newCampPlatform === 'META') {
      setActiveChannelTab('META_ADS');
      setCurrentStep(3);
    } else if (newCampPlatform === 'YOUTUBE') {
      setActiveChannelTab('YOUTUBE');
      setCurrentStep(3);
    } else if (newCampPlatform === 'GOOGLE' && newCampObjective === 'GOOGLE_GDN') {
      setActiveChannelTab('GDN');
      setCurrentStep(3);
    } else if (newCampPlatform === 'GOOGLE' && newCampObjective === 'GOOGLE_SEARCH') {
      setActiveChannelTab('GOOGLE_SEARCH');
      setCurrentStep(1);
    }

    // Persist updated plan with new sub-campaign immediately
    try {
      const formattedPeriod = formatCampaignDates(planStartDate, planEndDate, planPeriod);
      await ApiService.saveForecastPlan({
        id: currentPlanId || undefined,
        workspaceId,
        name: planName.trim() || `${clientName} - ${formattedPeriod} Medya Planı`,
        clientName: clientName.trim(),
        startDate: planStartDate,
        endDate: planEndDate,
        period: formattedPeriod,
        tags: planTags,
        targetUrl: mode === 'URL' ? query : '',
        seedKeywords: mode === 'KEYWORDS' ? query : '',
        detectedLanguage: 'auto',
        detectedLanguageName: 'Otomatik (Sayfa Dili)',
        monthlyBudget: updatedSubs.reduce((acc, curr) => acc + (curr.monthlyBudget || 0), 0),
        selectedKeywords: [],
        simulationResult: simulation,
        negativeKeywords: [],
        targetCountries: DEFAULT_LOCATIONS.map((c: any) => c.name),
        countryBreakdown,
        subCampaigns: updatedSubs
      });
      loadSavedPlans();
    } catch (err) {
      console.error('Sub-campaign saving error:', err);
    }
  };

  // Delete Sub-Campaign
  const handleDeleteSubCampaign = async (campId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bu alt kampanyayı silmek istediğinize emin misiniz?')) {
      const remaining = subCampaigns.filter(c => c.id !== campId);
      setSubCampaigns(remaining);
      if (activeSubCampaignId === campId) {
        if (remaining.length > 0) {
          handleSelectSubCampaign(remaining[0].id);
        } else {
          setActiveSubCampaignId(null);
          setKeywords([]);
          setSelectedKeywordIds(new Set());
          setMonthlyBudget(0);
        }
      }

      // Persist plan after deletion
      try {
        const formattedPeriod = formatCampaignDates(planStartDate, planEndDate, planPeriod);
        await ApiService.saveForecastPlan({
          id: currentPlanId || undefined,
          workspaceId,
          name: planName.trim() || `${clientName} - ${formattedPeriod} Medya Planı`,
          clientName: clientName.trim(),
          startDate: planStartDate,
          endDate: planEndDate,
          period: formattedPeriod,
          tags: planTags,
          targetUrl: '',
          seedKeywords: '',
          detectedLanguage,
          detectedLanguageName,
          monthlyBudget: remaining.reduce((acc, curr) => acc + (curr.monthlyBudget || 0), 0),
          selectedKeywords: [],
          simulationResult: simulation,
          negativeKeywords: [],
          targetCountries: activeCountries.map(c => c.name),
          countryBreakdown,
          subCampaigns: remaining
        });
        loadSavedPlans();
      } catch (err) {
        console.error('Plan update error after sub-campaign deletion:', err);
      }
    }
  };

  // Tag helper for studio
  const handleAddTag = () => {
    const t = newTagInput.trim().replace(/^#*/, '#');
    if (t.length > 1 && !planTags.includes(t)) {
      setPlanTags(prev => [...prev, t]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPlanTags(prev => prev.filter(t => t !== tagToRemove));
  };

  // Tag helper for master plan modal
  const handleAddMasterTag = () => {
    const t = newMasterTagInput.trim().replace(/^#*/, '#');
    if (t.length > 1 && !newMasterTags.includes(t)) {
      setNewMasterTags(prev => [...prev, t]);
    }
    setNewMasterTagInput('');
  };

  const handleRemoveMasterTag = (tagToRemove: string) => {
    setNewMasterTags(prev => prev.filter(t => t !== tagToRemove));
  };

  // Create new Master Plan from scratch: Pure Master (0 sub-campaigns) and immediately save to database!
  const handleCreateNewMasterPlan = async () => {
    const sDate = newMasterStartDate || initialMonthDates.start;
    const eDate = newMasterEndDate || initialMonthDates.end;
    const formattedPeriod = formatCampaignDates(sDate, eDate, newMasterPeriod);
    const cName = newMasterClient.trim() || 'Genel Müşteri';
    const pName = newMasterName.trim() || `${cName} - ${formattedPeriod} Kampanyası`;
    const tags = newMasterTags.length > 0 ? newMasterTags : ['#YeniKampanya'];

    // State setup: pure Master Plan without automatic sub-campaign
    const newMasterId = 'plan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setCurrentPlanId(newMasterId);
    setPlanName(pName);
    setClientName(cName);
    setPlanStartDate(sDate);
    setPlanEndDate(eDate);
    setPlanPeriod(formattedPeriod);
    setPlanTags(tags);
    setSubCampaigns([]);
    setActiveSubCampaignId(null);
    setKeywords([]);
    setSelectedKeywordIds(new Set());
    setNegativeCategories([]);
    setSelectedLocations(DEFAULT_LOCATIONS);
    setTargetLanguage('auto');
    setMonthlyBudget(0);
    setQuery('');

    setActiveChannelTab('OMNICHANNEL');
    setCurrentStep(2);
    setIsAddMasterPlanModalOpen(false);
    setViewMode('STUDIO');
    setNewMasterName('');
    setNewMasterClient('');
    setNewMasterTags([]);

    // Immediately save Master Plan to Database so user sees it in Portfolio Hub without needing sub-campaigns!
    try {
      await ApiService.saveForecastPlan({
        id: newMasterId,
        workspaceId,
        name: pName,
        clientName: cName,
        startDate: sDate,
        endDate: eDate,
        period: formattedPeriod,
        tags,
        targetUrl: '',
        seedKeywords: '',
        detectedLanguage: 'tr',
        detectedLanguageName: 'Türkçe',
        monthlyBudget: 0,
        selectedKeywords: [],
        simulationResult: simulation,
        negativeKeywords: [],
        targetCountries: ['Türkiye'],
        countryBreakdown: [],
        subCampaigns: []
      });
      setPlanSaveSuccess(true);
      setTimeout(() => setPlanSaveSuccess(false), 2500);
      loadSavedPlans();
    } catch (err) {
      console.error('Master plan initial save error:', err);
    }
  };

  // Open Master Plan & Target Sub Campaign in Studio
  const handleOpenMasterPlanStudio = (plan: ForecastPlan, targetSubId?: string) => {
    try {
      localStorage.setItem('roasist_active_studio_plan_id', plan.id);
      if (targetSubId) {
        localStorage.setItem('roasist_active_studio_sub_id', targetSubId);
      }
    } catch (e) {}

    setCurrentPlanId(plan.id);
    if (plan.name) setPlanName(plan.name);
    if (plan.clientName) setClientName(plan.clientName);
    if (plan.startDate) setPlanStartDate(plan.startDate);
    if (plan.endDate) setPlanEndDate(plan.endDate);
    setPlanPeriod(plan.period || formatCampaignDates(plan.startDate, plan.endDate, plan.period));
    if (plan.tags) setPlanTags(plan.tags);

    if (Array.isArray(plan.subCampaigns)) {
      const sanitizedSubs = plan.subCampaigns.map(c => ({
        ...c,
        monthlyBudget: (c.monthlyBudget && c.monthlyBudget > 0) ? c.monthlyBudget : (plan.monthlyBudget || 35000)
      }));
      setSubCampaigns(sanitizedSubs);
      if (sanitizedSubs.length > 0) {
        const chosenSub = targetSubId 
          ? (sanitizedSubs.find(c => c.id === targetSubId) || sanitizedSubs[0])
          : sanitizedSubs[0];
        
        applySubCampaignToState(chosenSub);
      } else {
        // Plan has 0 sub-campaigns: keep clean empty state!
        setActiveSubCampaignId(null);
        setKeywords([]);
        setSelectedKeywordIds(new Set());
        setNegativeCategories([]);
        setMonthlyBudget(0);
        setQuery('');
        setActiveChannelTab('OMNICHANNEL');
        setIsStep1Completed(false);
        setIsStep2Completed(false);
      }
    } else {
      // Legacy single plan (only if subCampaigns property was never an array)
      const legacySub: SubCampaignItem = {
        id: 'sub_legacy_' + plan.id,
        name: plan.name || 'Ana Kampanya',
        platform: 'GOOGLE',
        objective: 'GOOGLE_SEARCH',
        languageCode: plan.detectedLanguage || 'tr',
        languageName: plan.detectedLanguageName || 'Türkçe',
        languageFlag: '🇹🇷',
        targetLocations: DEFAULT_LOCATIONS,
        monthlyBudget: plan.monthlyBudget || 35000,
        selectedKeywords: plan.selectedKeywords || [],
        discoveredKeywords: plan.selectedKeywords || [],
        negativeCategories: plan.negativeKeywords || [],
        businessModel: 'LEAD_GEN',
        parameters: {
          growthScenario: 'REALISTIC',
          targetImpressionShare: 70,
          expectedCtr: 7.5,
          searchLeadCr: 3.5,
          searchHealthyLeadRate: 50,
          searchCloseRate: 10
        }
      };
      setSubCampaigns([legacySub]);
      applySubCampaignToState(legacySub);
    }

    setViewMode('STUDIO');
  };

  // Back to Portfolio
  const handleBackToPortfolio = () => {
    try {
      localStorage.removeItem('roasist_active_studio_plan_id');
      localStorage.removeItem('roasist_active_studio_sub_id');
    } catch (e) {}
    syncActiveSubCampaign();
    loadSavedPlans();
    setCurrentPlanId(null);
    setViewMode('PORTFOLIO');
  };

  // Load Saved Master Plan
  const handleLoadSavedMasterPlan = (plan: ForecastPlan) => {
    handleOpenMasterPlanStudio(plan);
  };

  // Delete Plan
  const handleDeletePlan = async (id: string, name?: string) => {
    if (window.confirm(`"${name || 'Bu plan'}" planını silmek istediğinize emin misiniz?`)) {
      try {
        await ApiService.deleteForecastPlan(id);
        if (localStorage.getItem('roasist_active_studio_plan_id') === id) {
          localStorage.removeItem('roasist_active_studio_plan_id');
          localStorage.removeItem('roasist_active_studio_sub_id');
        }
        loadSavedPlans();
      } catch (err: any) {
        alert('Plan silinirken hata: ' + err.message);
      }
    }
  };

  const isInitialPlansLoadedRef = useRef<boolean>(false);

  // Load Saved Plans on Workspace change
  const loadSavedPlans = async () => {
    try {
      const plans = await ApiService.getForecastPlans(workspaceId);
      setSavedPlans(plans || []);

      if (!isInitialPlansLoadedRef.current && plans && plans.length > 0) {
        isInitialPlansLoadedRef.current = true;
        const savedPlanId = localStorage.getItem('roasist_active_studio_plan_id');
        const savedSubId = localStorage.getItem('roasist_active_studio_sub_id');
        if (savedPlanId) {
          const match = plans.find(p => p.id === savedPlanId);
          if (match) {
            handleOpenMasterPlanStudio(match, savedSubId || undefined);
          }
        }
      }
    } catch {
      setSavedPlans([]);
    }
  };

  useEffect(() => {
    loadSavedPlans();
  }, [workspaceId]);

  const filteredSavedPlans = useMemo(() => {
    const q = portfolioSearchQuery.toLowerCase().trim();
    if (!q) return savedPlans;
    return savedPlans.filter(p => {
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchClient = (p.clientName || '').toLowerCase().includes(q);
      const matchPeriod = (p.period || '').toLowerCase().includes(q);
      const matchTags = (p.tags || []).some(t => t.toLowerCase().includes(q));
      const matchSub = (p.subCampaigns || []).some(s => (s.name || '').toLowerCase().includes(q) || (s.languageName || '').toLowerCase().includes(q));
      return matchName || matchClient || matchPeriod || matchTags || matchSub;
    });
  }, [savedPlans, portfolioSearchQuery]);

  const totalAllSubCampaigns = useMemo(() => {
    return savedPlans.reduce((sum, p) => sum + (Array.isArray(p.subCampaigns) ? p.subCampaigns.length : (p.selectedKeywords && p.selectedKeywords.length > 0 ? 1 : 0)), 0);
  }, [savedPlans]);

  const totalAllBudget = useMemo(() => {
    return savedPlans.reduce((sum, p) => sum + (p.monthlyBudget || 0), 0);
  }, [savedPlans]);

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

    const seeds = m === 'KEYWORDS' ? q.split(/[\n\r,;]+/).map(s => s.trim()).filter(s => s.length > 0) : [];

    try {
      const res = await ApiService.discoverKeywords({
        query: q.trim(),
        mode: m,
        language: targetLanguage !== 'auto' ? targetLanguage : undefined,
        countryCode: selectedLocations[0]?.countryCode || undefined,
        geoTargetConstants: selectedLocations.map(l => l.id),
        locations: selectedLocations,
        includeSuggestions: includeSuggestions,
        seedKeywords: seeds.length > 0 ? seeds : undefined,
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
        let langCode = res.detectedLanguage;
        if (!langCode || langCode === 'auto') {
          const autoL = detectLanguageFromTextOrKeywords(q + ' ' + (res.pageTitle || ''), res.keywords);
          langCode = autoL.code;
        }
        const langObj = GOOGLE_ADS_LANGUAGES.find(l => l.code === langCode);
        const langName = (res.detectedLanguageName && res.detectedLanguageName !== 'Otomatik' && res.detectedLanguageName !== 'Otomatik (Sayfa Dili)')
          ? res.detectedLanguageName
          : (langObj?.name || 'Türkçe');
        setDetectedLanguage(langCode);
        setDetectedLanguageName(langName);
        setTargetLanguage(langCode);
        setPageTitle(res.pageTitle || '');
        setPageSummary(res.pageSummary || '');

        // Intelligently default business model based on detected landing page / sector
        const lowerContext = ((res.sector || '') + ' ' + (res.pageTitle || '') + ' ' + (res.pageSummary || '')).toLowerCase();
        if (/emlak|gayrimenkul|citizenship|vatanda|villa|residence|apartments|property|real estate|agency|ajans|consult|danışman|hizmet|b2b|klinik|health|law|avukat|hotel|otel|tatil|resort|turizm/.test(lowerContext)) {
          setBusinessModel('LEAD_GEN');
        } else if (/e-ticaret|eticaret|shop|store|mağaza|ürün|giyim|ayakkabı|kozmetik|parfüm/.test(lowerContext)) {
          setBusinessModel('ECOMMERCE');
        }

        // Only initialize locations if user hasn't explicitly customized them yet
        if (!selectedLocations || selectedLocations.length === 0) {
          if (res.detectedLanguage === 'ru') {
            setSelectedLocations([
              { id: '2643', resourceName: 'geoTargetConstants/2643', name: 'Rusya', canonicalName: 'Rusya', countryCode: 'RU', targetType: 'Country', reach: 145000000, flag: '🇷🇺', cpcMultiplier: 1.6, volumeMultiplier: 1.8 },
              { id: '2398', resourceName: 'geoTargetConstants/2398', name: 'Kazakistan', canonicalName: 'Kazakistan', countryCode: 'KZ', targetType: 'Country', reach: 19500000, flag: '🇰🇿', cpcMultiplier: 1.4, volumeMultiplier: 0.9 }
            ]);
          } else if (res.detectedLanguage === 'fa') {
            setSelectedLocations([
              { id: '2792', resourceName: 'geoTargetConstants/2792', name: 'Türkiye', canonicalName: 'Türkiye', countryCode: 'TR', targetType: 'Country', reach: 85000000, flag: '🇹🇷', cpcMultiplier: 1.0, volumeMultiplier: 1.0 },
              { id: '1000010', resourceName: 'geoTargetConstants/1000010', name: 'Dubai', canonicalName: 'Dubai, Birleşik Arap Emirlikleri', countryCode: 'AE', targetType: 'City', reach: 3400000, flag: '🇦🇪', cpcMultiplier: 2.4, volumeMultiplier: 0.8 },
              { id: '2276', resourceName: 'geoTargetConstants/2276', name: 'Almanya', canonicalName: 'Almanya', countryCode: 'DE', targetType: 'Country', reach: 84000000, flag: '🇩🇪', cpcMultiplier: 2.8, volumeMultiplier: 1.4 }
            ]);
          } else if (res.detectedLanguage === 'ar') {
            setSelectedLocations([
              { id: '1000010', resourceName: 'geoTargetConstants/1000010', name: 'Dubai', canonicalName: 'Dubai, Birleşik Arap Emirlikleri', countryCode: 'AE', targetType: 'City', reach: 3400000, flag: '🇦🇪', cpcMultiplier: 2.4, volumeMultiplier: 0.8 },
              { id: '2682', resourceName: 'geoTargetConstants/2682', name: 'Suudi Arabistan', canonicalName: 'Suudi Arabistan', countryCode: 'SA', targetType: 'Country', reach: 35000000, flag: '🇸🇦', cpcMultiplier: 2.1, volumeMultiplier: 1.2 }
            ]);
          } else if (res.detectedLanguage === 'de') {
            setSelectedLocations([
              { id: '2276', resourceName: 'geoTargetConstants/2276', name: 'Almanya', canonicalName: 'Almanya', countryCode: 'DE', targetType: 'Country', reach: 84000000, flag: '🇩🇪', cpcMultiplier: 2.8, volumeMultiplier: 1.4 }
            ]);
          } else if (res.detectedLanguage === 'en') {
            setSelectedLocations([
              { id: '2826', resourceName: 'geoTargetConstants/2826', name: 'Birleşik Krallık', canonicalName: 'Birleşik Krallık', countryCode: 'GB', targetType: 'Country', reach: 67000000, flag: '🇬🇧', cpcMultiplier: 3.2, volumeMultiplier: 1.3 },
              { id: '2840', resourceName: 'geoTargetConstants/2840', name: 'Amerika Birleşik Devletleri', canonicalName: 'Amerika Birleşik Devletleri', countryCode: 'US', targetType: 'Country', reach: 335000000, flag: '🇺🇸', cpcMultiplier: 3.5, volumeMultiplier: 2.0 }
            ]);
          } else {
            setSelectedLocations([DEFAULT_LOCATIONS[0]]);
          }
        }

        if ((res as any).locationBreakdown && (res as any).locationBreakdown.length > 0) {
          setOfficialLocationBreakdown((res as any).locationBreakdown);
        }

        // Dynamic Multi-Channel CPM & CPV benchmarks based on Sector & Target Market
        const isIntl = (res.detectedLanguage && res.detectedLanguage !== 'tr') || (res.suggestedCountries && res.suggestedCountries.some((c: any) => ['DE', 'GB', 'US', 'AE', 'SA', 'RU'].includes(c.code)));
        if (/emlak|gayrimenkul|citizenship|vatandaşlık|villa|property|real estate|klinik|health|saç ekim|hair transplant|estetik|hastane/.test(lowerContext)) {
          setMetaCpm(isIntl ? 320 : 120);
          setGdnCpm(isIntl ? 28 : 16);
          setYoutubeCpv(isIntl ? 0.75 : 0.40);
        } else if (/otel|hotel|tatil|resort|turizm|pansiyon/.test(lowerContext)) {
          setMetaCpm(isIntl ? 190 : 85);
          setGdnCpm(16);
          setYoutubeCpv(0.35);
        } else if (/e-ticaret|eticaret|shop|store|giyim|ayakkabı/.test(lowerContext)) {
          setMetaCpm(isIntl ? 110 : 55);
          setGdnCpm(12);
          setYoutubeCpv(0.28);
        } else {
          setMetaCpm(isIntl ? 140 : 70);
          setGdnCpm(15);
          setYoutubeCpv(0.35);
        }

        // Auto-select all keywords by default
        const allIds = new Set<string>(res.keywords.map((k: KeywordMetric) => k.id));
        setSelectedKeywordIds(allIds);

        // Switch to Step 1 for user review
        setCurrentStep(1);

        // Populate negative keywords in the detected language & intent
        if (res.negativeCategories && res.negativeCategories.length > 0) {
          setNegativeCategories(res.negativeCategories);
        } else {
          loadNegatives(res.sector || 'Genel', res.keywords.map((k: KeywordMetric) => k.keyword), res.detectedLanguage || 'tr', res.pageTitle, res.pageSummary);
        }
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
    if (currentStep === 2) {
      setSelectedKeywordIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setStep2ApprovedKeywordIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setKeywords(prev => prev.filter(k => k.id !== id));
      setSelectedKeywordIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setStep2ApprovedKeywordIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const loadNegatives = async (sector: string, kwList: string[], lang: string, pageTitle?: string, pageSummary?: string) => {
    try {
      const cats = await ApiService.generateNegativeKeywords({
        sector,
        keywords: kwList.slice(0, 15),
        language: lang,
        pageTitle,
        pageSummary,
        url: query
      });
      setNegativeCategories(cats || []);
    } catch {
      // Non-blocking
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

  // Country & Location Selection Handlers (Step 2)
  // Debounced Search for Google Ads Geo Target Constants
  useEffect(() => {
    if (!locationSearchQuery.trim()) {
      setLocationSearchResults([]);
      setIsSearchingLocations(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocations(true);
      try {
        const results = await ApiService.searchLocations(locationSearchQuery, detectedLanguage || 'tr');
        setLocationSearchResults(results || []);
      } catch {
        setLocationSearchResults([]);
      } finally {
        setIsSearchingLocations(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [locationSearchQuery, detectedLanguage]);

  const toggleLocation = (loc: GeoTargetLocation) => {
    setSelectedLocations(prev => {
      const exists = prev.some(l => l.id === loc.id || l.name.toLowerCase() === loc.name.toLowerCase());
      if (exists) {
        if (prev.length === 1) return prev; // Keep at least 1 location
        return prev.filter(l => l.id !== loc.id && l.name.toLowerCase() !== loc.name.toLowerCase());
      } else {
        return [...prev, loc];
      }
    });
  };

  const removeLocation = (id: string) => {
    setSelectedLocations(prev => {
      if (prev.length === 1) return prev;
      return prev.filter(l => l.id !== id);
    });
  };

  const handleSaveLocationPreset = () => {
    const name = newPresetName.trim();
    if (!name || selectedLocations.length === 0) return;

    const newPreset: SavedLocationPreset = {
      id: 'preset_' + Date.now(),
      name,
      locations: [...selectedLocations],
      createdAt: Date.now()
    };

    const updated = [newPreset, ...savedLocationPresets.filter(p => p.name.toLowerCase() !== name.toLowerCase())];
    setSavedLocationPresets(updated);
    try {
      localStorage.setItem('roasist_saved_location_presets', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving preset locally:', e);
    }
    // Cloud persist
    ApiService.saveLocationPresets(updated, workspaceId).catch(err => console.error('Cloud preset save error:', err));

    setNewPresetName('');
    setIsSavingPreset(false);
    setPresetSaveSuccessMessage(`"${name}" paketi (${selectedLocations.length} bölge) başarıyla kaydedildi!`);
    setTimeout(() => setPresetSaveSuccessMessage(''), 3500);
  };

  const handleDeleteLocationPreset = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = savedLocationPresets.filter(p => p.id !== id);
    setSavedLocationPresets(updated);
    try {
      localStorage.setItem('roasist_saved_location_presets', JSON.stringify(updated));
    } catch (e) {
      console.error('Error deleting preset locally:', e);
    }
    // Cloud persist
    ApiService.saveLocationPresets(updated, workspaceId).catch(err => console.error('Cloud preset delete error:', err));
  };

  const handleApplyLocationPreset = (preset: SavedLocationPreset) => {
    if (preset.locations && preset.locations.length > 0) {
      setSelectedLocations(preset.locations);
      setPresetSaveSuccessMessage(`"${preset.name}" paketi yüklendi (${preset.locations.length} bölge).`);
      setTimeout(() => setPresetSaveSuccessMessage(''), 2500);
    }
  };

  const handleClearAllLocations = () => {
    setSelectedLocations([DEFAULT_LOCATIONS[0]]);
  };

  const handleBatchVerifyLocations = async () => {
    const raw = bulkLocationText.trim();
    if (!raw) return;

    const lines = raw.split(/[\n,;]+/).map(s => s.trim()).filter(s => s.length >= 2);
    if (lines.length === 0) return;

    setIsBatchSearchingLocations(true);
    setBatchMatchedLocations([]);
    setBatchUnmatchedQueries([]);

    try {
      const res = await ApiService.batchSearchLocations(lines, detectedLanguage || 'tr');
      const matchedLocs: GeoTargetLocation[] = (res.matched || []).map((m: any) => ({
        id: m.location.id,
        resourceName: m.location.resourceName || `geoTargetConstants/${m.location.id}`,
        name: m.location.name,
        canonicalName: m.location.canonicalName || m.location.name,
        countryCode: m.location.countryCode || 'TR',
        targetType: m.location.targetType || 'City',
        reach: m.location.reach,
        flag: m.location.flag || '📍',
        cpcMultiplier: m.location.cpcMultiplier || getCountryCpcMultiplier(m.location.countryCode),
        volumeMultiplier: m.location.volumeMultiplier || 1.0
      }));

      setBatchMatchedLocations(matchedLocs);
      setBatchUnmatchedQueries(res.unmatched || []);
      setSelectedBatchLocationIds(new Set(matchedLocs.map(l => l.id)));
    } catch (err) {
      console.error('Error batch searching locations:', err);
    } finally {
      setIsBatchSearchingLocations(false);
    }
  };

  const handleApplyBatchLocations = (mode: 'APPEND' | 'REPLACE' = 'APPEND') => {
    const locsToAdd = batchMatchedLocations.filter(l => selectedBatchLocationIds.has(l.id));
    if (locsToAdd.length === 0) return;

    if (mode === 'REPLACE') {
      setSelectedLocations(locsToAdd);
    } else {
      setSelectedLocations(prev => {
        const next = [...prev];
        locsToAdd.forEach(newLoc => {
          if (!next.some(l => l.id === newLoc.id || l.name.toLowerCase() === newLoc.name.toLowerCase())) {
            next.push(newLoc);
          }
        });
        return next;
      });
    }

    setPresetSaveSuccessMessage(`${locsToAdd.length} konum listeye başarıyla eklendi!`);
    setTimeout(() => setPresetSaveSuccessMessage(''), 3000);
    setBulkLocationText('');
    setBatchMatchedLocations([]);
    setBatchUnmatchedQueries([]);
    setLocationInputMode('SINGLE');
  };

  // Strategic Scenario Multiplier
  const scenarioMultiplier = useMemo(() => {
    if (growthScenario === 'CONSERVATIVE') {
      return {
        crMult: 0.85,
        cpcMult: 1.15,
        healthyLeadMult: 0.85,
        label: '🛡️ Muhafazakar (Temkinli)',
        description: 'Temkinli projeksiyon: Daha yüksek TBM/CPM maliyeti ve taban dönüşüm oranları ile taban getiri senaryosu.'
      };
    }
    if (growthScenario === 'AGGRESSIVE') {
      return {
        crMult: 1.20,
        cpcMult: 0.90,
        healthyLeadMult: 1.15,
        label: '🚀 Agresif (Ölçeklenme)',
        description: 'Optimize kampanya projeksiyonu: Yüksek reklam alaka düzeyi, artan dönüşüm ve yüksek nitelikli lead hacmi.'
      };
    }
    return {
      crMult: 1.0,
      cpcMult: 1.0,
      healthyLeadMult: 1.0,
      label: '⚖️ Beklenen (Realist)',
      description: 'Sektör ortalamaları ve Google Ads resmi geçmiş verilerine dayalı standart projeksiyon.'
    };
  }, [growthScenario]);

  // Active Locations List
  const activeCountries = useMemo(() => {
    return selectedLocations;
  }, [selectedLocations]);

  // Selected Keyword Pool for Simulation (Pure Official Google Ads metrics)
  const selectedKeywordsPool = useMemo(() => {
    if (selectedKeywordIds.size === 0) return imputedKeywords;
    return imputedKeywords.filter(k => selectedKeywordIds.has(k.id));
  }, [imputedKeywords, selectedKeywordIds]);

  // Overall Aggregate KPIs (Pure Official Sum across selected locations - Zero proportional estimation)
  const baseSearchVolume = useMemo(() => {
    return selectedKeywordsPool.reduce((sum, k) => sum + k.monthlyVolume, 0);
  }, [selectedKeywordsPool]);

  const totalSearchVolume = useMemo(() => {
    return baseSearchVolume;
  }, [baseSearchVolume]);

  const baseTopPageCpc = useMemo(() => {
    // 1. Prioritize the active keyword pool's average CPC (fully imputed, user multipliers applied)
    if (selectedKeywordsPool.length > 0) {
      const cpcSum = selectedKeywordsPool.reduce((sum, k) => sum + (((Number(k.lowCpc) || 0) + (Number(k.highCpc) || 0)) / 2), 0);
      const avg = cpcSum / selectedKeywordsPool.length;
      if (avg > 0) {
        return Math.round(avg * 100) / 100;
      }
    }

    // 2. If official location breakdown is present, calculate exact blended weighted CPC across selected target locations
    if (officialLocationBreakdown && officialLocationBreakdown.length > 0 && selectedLocations.length > 0) {
      let totalWeightedCpc = 0;
      let totalLocationVol = 0;
      for (const loc of selectedLocations) {
        const off = officialLocationBreakdown.find(b => 
          String((b as any).id) === String(loc.id) || 
          b.name.toLowerCase() === loc.name.toLowerCase() ||
          (loc.canonicalName && b.canonicalName && b.canonicalName.toLowerCase() === loc.canonicalName.toLowerCase())
        );
        if (off && (off.monthlyVolume || 0) > 0 && (off.avgCpc || 0) > 0) {
          totalWeightedCpc += (off.monthlyVolume * off.avgCpc);
          totalLocationVol += off.monthlyVolume;
        }
      }
      if (totalLocationVol > 0 && totalWeightedCpc > 0) {
        return Math.round((totalWeightedCpc / totalLocationVol) * 100) / 100;
      }
    }

    // 3. Fallback
    return 25.00;
  }, [selectedKeywordsPool, officialLocationBreakdown, selectedLocations]);

  const avgTopPageCpc = useMemo(() => {
    return baseTopPageCpc;
  }, [baseTopPageCpc]);

  // 🎯 Active Google Search CPC with scenario multiplier
  const activeSearchCpc = useMemo(() => {
    return (avgTopPageCpc > 0 ? avgTopPageCpc : 6.50) * scenarioMultiplier.cpcMult;
  }, [avgTopPageCpc, scenarioMultiplier.cpcMult]);

  // 🔄 Bidirectional Synchronization Handlers (Budget <-> Impression Share <-> CTR)
  const handleGoogleBudgetChange = (newSpend: number) => {
    const validSpend = isNaN(newSpend) ? 0 : Math.max(0, Math.round(newSpend));
    if (isGoogleSearchActive || allocGoogleSearch === 100) {
      setMonthlyBudget(validSpend);
    } else {
      const currentGoogleSpend = Math.round((monthlyBudget * allocGoogleSearch) / 100);
      const otherSpend = Math.max(0, monthlyBudget - currentGoogleSpend);
      if (otherSpend > 0) {
        const newTotal = validSpend + otherSpend;
        setMonthlyBudget(newTotal);
        const newAlloc = newTotal > 0 ? Math.max(1, Math.min(100, Math.round((validSpend / newTotal) * 100))) : 50;
        updateChannelAllocation('google', newAlloc);
      } else {
        const alloc = allocGoogleSearch > 0 ? allocGoogleSearch : 50;
        const newTotal = Math.round(validSpend / (alloc / 100));
        setMonthlyBudget(newTotal);
        // If allocGoogleSearch was 0, set it to 50% so the input reflects the spend
        if (allocGoogleSearch === 0 && newTotal > 0) {
          updateChannelAllocation('google', 50);
        }
      }
    }

    if (activeSearchCpc > 0 && expectedCtr > 0 && totalSearchVolume > 0 && validSpend > 0) {
      const theoreticalClicks = validSpend / activeSearchCpc;
      const theoreticalImpressions = theoreticalClicks / (expectedCtr / 100);
      const calculatedIS = Math.max(1, Math.min(95, Math.round((theoreticalImpressions / totalSearchVolume) * 100)));
      setTargetImpressionShare(calculatedIS);
    } else if (validSpend === 0) {
      setTargetImpressionShare(0);
    }
  };

  const handleImpressionShareChange = (newIS: number) => {
    const clampedIS = Math.max(5, Math.min(95, Math.round(newIS)));
    setTargetImpressionShare(clampedIS);
    // In BY_IMPRESSION_SHARE mode, dynamically compute required spend and update channel allocation
    if (activeSearchCpc > 0 && expectedCtr > 0 && totalSearchVolume > 0) {
      const estImps = Math.round(totalSearchVolume * (clampedIS / 100));
      const estClicks = Math.round(estImps * (expectedCtr / 100));
      const requiredSpend = Math.round(estClicks * activeSearchCpc);
      if (isGoogleSearchActive || allocGoogleSearch === 100) {
        setMonthlyBudget(requiredSpend);
      } else {
        const currentGoogleSpend = Math.round((monthlyBudget * allocGoogleSearch) / 100);
        const otherSpend = Math.max(0, monthlyBudget - currentGoogleSpend);
        if (otherSpend > 0) {
          const newTotal = requiredSpend + otherSpend;
          setMonthlyBudget(newTotal);
          const newAlloc = newTotal > 0 ? Math.max(1, Math.min(100, Math.round((requiredSpend / newTotal) * 100))) : 50;
          updateChannelAllocation('google', newAlloc);
        } else {
          const alloc = allocGoogleSearch > 0 ? allocGoogleSearch : 50;
          const newTotal = Math.round(requiredSpend / (alloc / 100));
          setMonthlyBudget(newTotal);
        }
      }
    }
  };

  const handleExpectedCtrChange = (newCtr: number) => {
    setExpectedCtr(newCtr);
  };

  // Keep targetImpressionShare in sync when monthlyBudget or allocGoogleSearch changes from other tabs
  useEffect(() => {
    if (budgetMode === 'BY_BUDGET') {
      const currentSpend = isGoogleSearchActive ? monthlyBudget : Math.round((monthlyBudget * allocGoogleSearch) / 100);
      if (activeSearchCpc > 0 && expectedCtr > 0 && totalSearchVolume > 0 && currentSpend > 0) {
        const clicks = currentSpend / activeSearchCpc;
        const impressions = clicks / (expectedCtr / 100);
        const calculatedIS = Math.max(1, Math.min(95, Math.round((impressions / totalSearchVolume) * 100)));
        setTargetImpressionShare(prev => (prev !== calculatedIS ? calculatedIS : prev));
      } else if (currentSpend === 0) {
        setTargetImpressionShare(0);
      }
    }
  }, [budgetMode, monthlyBudget, allocGoogleSearch, isGoogleSearchActive, expectedCtr, activeSearchCpc, totalSearchVolume]);

  // 🎛️ Real-Time Dynamic Simulation Calculation (Strictly Capped by Total Market Search Volume & Impression Share)
  const simulation: ForecastSimulation = useMemo(() => {
    const activeCpc = activeSearchCpc;
    const availableMarketVolume = totalSearchVolume; // Total searches in selected target markets
    const googleSearchBudget = isGoogleSearchActive ? monthlyBudget : Math.round((monthlyBudget * allocGoogleSearch) / 100);
    
    // 1. Calculate Maximum Market Capacity (95% Impression Share)
    const maxPossibleImpressions = Math.max(1, availableMarketVolume);
    const maxPossibleClicks = Math.max(1, Math.round(maxPossibleImpressions * (expectedCtr / 100)));
    const marketCapacitySpend = Math.round(maxPossibleClicks * activeCpc);

    const baseConvRate = businessModel === 'LEAD_GEN' ? leadConversionRate : ecommerceConversionRate;
    const activeConvRate = Number((baseConvRate * scenarioMultiplier.crMult).toFixed(2));
    const activeCloseRate = Number((leadCloseRate * scenarioMultiplier.crMult).toFixed(2));

    // If budget is zero, return clean zero projection without fake impressions/clicks
    if (googleSearchBudget <= 0 && budgetMode === 'BY_BUDGET') {
      return {
        businessModel,
        monthlyBudget: 0,
        dailyBudget: 0,
        actualSpend: 0,
        marketCapacitySpend,
        isMarketSaturated: false,
        targetImpressionShare: 0,
        estImpressions: 0,
        estClicks: 0,
        avgCpc: activeCpc,
        avgCtr: expectedCtr,
        conversionRate: activeConvRate,
        estConversions: 0,
        cpa: 0,
        leadCloseRate: activeCloseRate,
        estDeals: 0,
        cac: 0,
        avgOrderValue,
        estRevenue: 0,
        projectedRoas: 0,
        targetCountries: selectedLocations.map(l => l.name)
      };
    }

    // 2. Calculate Effective Impression Share and Actual Spend based on Budget Mode
    let effectiveIS = targetImpressionShare;
    let actualSpend = googleSearchBudget;
    let isMarketSaturated = false;

    if (budgetMode === 'BY_BUDGET') {
      // Calculate what Impression Share this allocated Google Search budget can buy
      const theoreticalClicks = activeCpc > 0 ? googleSearchBudget / activeCpc : 0;
      const theoreticalImpressions = theoreticalClicks / (expectedCtr / 100);
      const calculatedIS = availableMarketVolume > 0 ? (theoreticalImpressions / availableMarketVolume) * 100 : 100;
      
      if (calculatedIS >= 95) {
        effectiveIS = 95; // Capped at 95% IS (market maximum)
        isMarketSaturated = true;
        actualSpend = marketCapacitySpend;
      } else {
        effectiveIS = Math.max(1, Math.min(94, Math.round(calculatedIS)));
        actualSpend = googleSearchBudget;
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
    const estClicks = Math.max(actualSpend > 0 ? 1 : 0, Math.round(estImpressions * (expectedCtr / 100)));
    const dailyBudget = Math.round(actualSpend / 30.4);

    // 4. Conversions based on Business Model
    const estConversions = Math.max(0, Math.round(estClicks * (activeConvRate / 100)));
    const cpa = estConversions > 0 ? Math.round(actualSpend / estConversions) : 0;

    // 5. Deals & CAC (For Lead Gen)
    const estDeals = businessModel === 'LEAD_GEN' ? Math.round(estConversions * (activeCloseRate / 100)) : (businessModel === 'ECOMMERCE' ? estConversions : 0);
    const cac = estDeals > 0 ? Math.round(actualSpend / estDeals) : 0;

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
      monthlyBudget: googleSearchBudget,
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
      leadCloseRate: activeCloseRate,
      estDeals,
      cac,
      avgOrderValue,
      estRevenue,
      projectedRoas,
      targetCountries: selectedLocations.map(l => l.name)
    };
  }, [
    businessModel,
    budgetMode,
    monthlyBudget,
    allocGoogleSearch,
    isGoogleSearchActive,
    targetImpressionShare,
    expectedCtr,
    activeSearchCpc,
    totalSearchVolume,
    leadConversionRate,
    leadCloseRate,
    ecommerceConversionRate,
    avgOrderValue,
    avgDealValue,
    selectedLocations,
    scenarioMultiplier
  ]);

  // 🔵 Meta Ads Simulation Calculation (Full Funnel & Healthy Lead Rate)
  const metaSimulation: MetaSimulation = useMemo(() => {
    const budget = (monthlyBudget * allocMetaAds) / 100;
    const effectiveCpm = Math.max(1, metaCpm * scenarioMultiplier.cpcMult);
    const impressions = effectiveCpm > 0 ? Math.round((budget / effectiveCpm) * 1000) : 0;
    const clicks = Math.round(impressions * (metaCtr / 100));
    const cpc = clicks > 0 ? Math.round((budget / clicks) * 100) / 100 : 0;
    const effectiveLeadCr = Number((metaLeadCr * scenarioMultiplier.crMult).toFixed(2));
    const grossLeads = Math.round(clicks * (effectiveLeadCr / 100));
    const cpl = grossLeads > 0 ? Math.round(budget / grossLeads) : 0;
    const effectiveHealthyRate = Number(Math.min(100, Math.max(10, metaHealthyLeadRate * scenarioMultiplier.healthyLeadMult)).toFixed(1));
    const healthyLeads = Math.round(grossLeads * (effectiveHealthyRate / 100));
    const cpql = healthyLeads > 0 ? Math.round(budget / healthyLeads) : 0;
    const effectiveCloseRate = Number((metaCloseRate * scenarioMultiplier.crMult).toFixed(2));
    const deals = Math.round(healthyLeads * (effectiveCloseRate / 100));
    const cac = deals > 0 ? Math.round(budget / deals) : 0;
    const revenue = deals * (avgDealValue > 0 ? avgDealValue : (businessModel === 'ECOMMERCE' ? avgOrderValue : 0));
    const roas = budget > 0 ? Math.round((revenue / budget) * 10) / 10 : 0;

    return {
      budget,
      cpm: effectiveCpm,
      impressions,
      ctr: metaCtr,
      clicks,
      cpc,
      leadConversionRate: effectiveLeadCr,
      grossLeads,
      cpl,
      healthyLeadRate: effectiveHealthyRate,
      healthyLeads,
      cpql,
      closeRate: effectiveCloseRate,
      deals,
      cac,
      revenue,
      roas
    };
  }, [monthlyBudget, allocMetaAds, metaCpm, metaCtr, metaLeadCr, metaHealthyLeadRate, metaCloseRate, avgDealValue, avgOrderValue, businessModel, scenarioMultiplier]);

  // 🟢 Google GDN Simulation Calculation
  const gdnSimulation: GdnSimulation = useMemo(() => {
    const budget = (monthlyBudget * allocGdn) / 100;
    const effectiveCpm = Math.max(1, gdnCpm * scenarioMultiplier.cpcMult);
    const impressions = effectiveCpm > 0 ? Math.round((budget / effectiveCpm) * 1000) : 0;
    const clicks = Math.round(impressions * (gdnCtr / 100));
    const cpc = clicks > 0 ? Math.round((budget / clicks) * 100) / 100 : 0;
    const effectiveAssistedCr = Number((gdnAssistedCr * scenarioMultiplier.crMult).toFixed(2));
    const assistedConversions = Math.round(clicks * (effectiveAssistedCr / 100));
    return {
      budget,
      cpm: effectiveCpm,
      impressions,
      ctr: gdnCtr,
      clicks,
      cpc,
      assistedConversionRate: effectiveAssistedCr,
      assistedConversions
    };
  }, [monthlyBudget, allocGdn, gdnCpm, gdnCtr, gdnAssistedCr, scenarioMultiplier]);

  // 🔴 YouTube Ads Simulation Calculation
  const youtubeSimulation: YouTubeSimulation = useMemo(() => {
    const budget = (monthlyBudget * allocYouTube) / 100;
    const effectiveCpv = Math.max(0.05, youtubeCpv * scenarioMultiplier.cpcMult);
    const videoViews = effectiveCpv > 0 ? Math.round(budget / effectiveCpv) : 0;
    const impressions = youtubeVtr > 0 ? Math.round(videoViews / (youtubeVtr / 100)) : videoViews * 3;
    const effectiveActionRate = Number((youtubeActionRate * scenarioMultiplier.crMult).toFixed(2));
    const actions = Math.round(videoViews * (effectiveActionRate / 100));
    return {
      budget,
      cpv: effectiveCpv,
      videoViews,
      vtr: youtubeVtr,
      impressions,
      actionRate: effectiveActionRate,
      actions
    };
  }, [monthlyBudget, allocYouTube, youtubeCpv, youtubeVtr, youtubeActionRate, scenarioMultiplier]);

  // 🌐 360° Omnichannel Media Mix Consolidated Simulation
  const omnichannelMix: OmnichannelMediaMix = useMemo(() => {
    const googleSpend = (monthlyBudget * allocGoogleSearch) / 100;
    const metaSpend = (monthlyBudget * allocMetaAds) / 100;
    const ytSpend = (monthlyBudget * allocYouTube) / 100;
    const gdnSpend = (monthlyBudget * allocGdn) / 100;

    const googleWeight = allocGoogleSearch / 100;
    const googleImpressions = Math.round(simulation.estImpressions * googleWeight);
    const googleClicks = Math.round(simulation.estClicks * googleWeight);
    const googleLeads = Math.round(simulation.estConversions * googleWeight);
    const googleHealthyLeads = Math.round(googleLeads * (leadCloseRate / 100)); // Qualified Search Leads
    const googleDeals = Math.round(googleHealthyLeads * 0.15); // Deals
    const googleRevenue = googleDeals * (avgDealValue > 0 ? avgDealValue : (businessModel === 'ECOMMERCE' ? avgOrderValue : 0));

    const totalImpressions = googleImpressions + metaSimulation.impressions + youtubeSimulation.impressions + gdnSimulation.impressions;
    const totalClicks = googleClicks + metaSimulation.clicks + gdnSimulation.clicks + youtubeSimulation.actions;
    const blendedCtr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0;
    const totalGrossLeads = googleLeads + metaSimulation.grossLeads + gdnSimulation.assistedConversions + youtubeSimulation.actions;
    const totalHealthyLeads = googleHealthyLeads + metaSimulation.healthyLeads;
    const blendedCpql = totalHealthyLeads > 0 ? Math.round(monthlyBudget / totalHealthyLeads) : 0;
    const totalDeals = googleDeals + metaSimulation.deals;
    const blendedCac = totalDeals > 0 ? Math.round(monthlyBudget / totalDeals) : 0;
    const totalRevenue = googleRevenue + metaSimulation.revenue;
    const blendedRoas = monthlyBudget > 0 ? Math.round((totalRevenue / monthlyBudget) * 10) / 10 : 0;

    return {
      totalBudget: monthlyBudget,
      allocations: {
        googleSearch: allocGoogleSearch,
        metaAds: allocMetaAds,
        youtube: allocYouTube,
        gdn: allocGdn
      },
      googleSearchSpend: googleSpend,
      metaAdsSpend: metaSpend,
      youtubeSpend: ytSpend,
      gdnSpend: gdnSpend,
      totalImpressions,
      totalClicks,
      blendedCtr,
      totalGrossLeads,
      totalHealthyLeads,
      blendedCpql,
      totalDeals,
      blendedCac,
      totalRevenue,
      blendedRoas
    };
  }, [
    monthlyBudget,
    allocGoogleSearch,
    allocMetaAds,
    allocYouTube,
    allocGdn,
    simulation,
    metaSimulation,
    youtubeSimulation,
    gdnSimulation,
    leadCloseRate,
    avgDealValue,
    avgOrderValue,
    businessModel
  ]);

  // Fetch real Google Ads Location Breakdown whenever selectedLocations or keywords change
  useEffect(() => {
    if (!selectedLocations || selectedLocations.length < 2 || !keywords || keywords.length === 0) {
      return;
    }

    let isMounted = true;
    const fetchBreakdown = async () => {
      setIsLoadingLocationBreakdown(true);
      try {
        const targetKws = keywords;

        const res = await ApiService.getLocationBreakdown({
          query: mode === 'URL' ? query : targetKws.map(k => k.keyword).join(', '),
          mode,
          language: detectedLanguage || 'tr',
          geoTargetConstants: selectedLocations.map(l => l.id),
          keywords: targetKws,
          locations: selectedLocations
        });
        if (isMounted && res) {
          if (res.breakdown && res.breakdown.length > 0) {
            setOfficialLocationBreakdown(res.breakdown);
          }
          if (res.keywordGeoMap && Object.keys(res.keywordGeoMap).length > 0) {
            setKeywords(prev => prev.map(k => {
              const kNorm = k.keyword.toLowerCase().trim();
              const geoData = res.keywordGeoMap[kNorm];
              if (geoData) {
                const newGeoVolumes = { ...(k.geoVolumes || {}) };
                const newGeoCpc = { ...(k.geoCpc || {}) };
                for (const [gId, metrics] of Object.entries(geoData as Record<string, any>)) {
                  newGeoVolumes[gId] = metrics.monthlyVolume;
                  newGeoCpc[gId] = { lowCpc: metrics.lowCpc, highCpc: metrics.highCpc };
                }
                return {
                  ...k,
                  geoVolumes: newGeoVolumes,
                  geoCpc: newGeoCpc
                };
              }
              return k;
            }));
          }
        }
      } catch (err) {
        console.warn('Error fetching official location breakdown:', err);
      } finally {
        if (isMounted) setIsLoadingLocationBreakdown(false);
      }
    };

    const timeout = setTimeout(fetchBreakdown, 300);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [selectedLocations, detectedLanguage, mode, query, selectedKeywordIds.size, activeClusterId]);

  // Location / Country Breakdown Metrics with Real Google Ads API data & Keyword GeoVolumes
  const countryBreakdown: CountryMetric[] = useMemo(() => {
    if (selectedLocations.length === 0) return [];

    const activePool = selectedKeywordsPool.length > 0 ? selectedKeywordsPool : keywords;

    // Helper to find location match in officialLocationBreakdown
    const findOfficial = (loc: GeoTargetLocation) => {
      if (!officialLocationBreakdown || officialLocationBreakdown.length === 0) return null;
      const cleanLocId = String(loc.id).replace(/\D/g, '');
      const locCc = (loc.countryCode || '').toUpperCase();
      const locName = (loc.name || '').toLowerCase();
      const locCanonical = (loc.canonicalName || '').toLowerCase();

      return officialLocationBreakdown.find(b => {
        const bCleanId = String(b.id || '').replace(/\D/g, '');
        if (cleanLocId && bCleanId && cleanLocId === bCleanId) return true;
        const bCc = (b.code || (b as any).countryCode || '').toUpperCase();
        if (locCc && bCc && locCc === bCc) return true;
        const bName = (b.name || '').toLowerCase();
        const bCanonical = (b.canonicalName || '').toLowerCase();
        if (bName && (bName === locName || bName === locCanonical)) return true;
        if (bCanonical && (bCanonical === locName || bCanonical === locCanonical)) return true;
        return false;
      }) || null;
    };

    // 1. Calculate direct geo volumes and CPC sums from active keywords pool
    const locGeoVolumes: Record<string, number> = {};
    const locGeoCpcData: Record<string, { weightedCpcSum: number; volSum: number; simpleCpcSum: number; count: number }> = {};

    for (const loc of selectedLocations) {
      const locKey = String(loc.id);
      const cleanId = locKey.replace(/\D/g, '');
      const locCc = loc.countryCode?.toUpperCase();
      let volSum = 0;
      let weightedCpcSum = 0;
      let volForCpc = 0;
      let simpleCpcSum = 0;
      let cpcCount = 0;

      for (const k of activePool) {
        let kwVol = 0;
        if (k.geoVolumes && Object.keys(k.geoVolumes).length > 0) {
          const keysToTry = [
            cleanId,
            locKey,
            `geoTargetConstants/${cleanId}`,
            locCc,
            locCc?.toLowerCase(),
            loc.name?.toLowerCase(),
            loc.canonicalName?.toLowerCase()
          ].filter(Boolean) as string[];

          for (const key of keysToTry) {
            if (k.geoVolumes[key] !== undefined) {
              kwVol = Number(k.geoVolumes[key]) || 0;
              break;
            }
          }

          if (kwVol > 0) {
            volSum += kwVol;
          }
        }

        // Check if keyword has geoCpc for this location, or use its known top of page CPC
        const geoCpcObj = (k as any).geoCpc?.[cleanId] || (k as any).geoCpc?.[locKey];
        const kwMidCpc = (geoCpcObj && geoCpcObj.highCpc > 0)
          ? ((geoCpcObj.lowCpc + geoCpcObj.highCpc) / 2)
          : (((Number(k.lowCpc) || 0) + (Number(k.highCpc) || 0)) / 2);

        if (kwMidCpc > 0) {
          simpleCpcSum += kwMidCpc;
          cpcCount++;
          if (kwVol > 0) {
            weightedCpcSum += (kwMidCpc * kwVol);
            volForCpc += kwVol;
          }
        }
      }

      locGeoVolumes[locKey] = volSum;
      locGeoCpcData[locKey] = { weightedCpcSum, volSum: volForCpc, simpleCpcSum, count: cpcCount };
    }

    const items: CountryMetric[] = selectedLocations.map(loc => {
      const locKey = String(loc.id);
      const off = findOfficial(loc);
      const cpcData = locGeoCpcData[locKey];

      // 1. Ülkenin Ham Hacmi: Seçili kelimelerin geoVolumes toplamı, yoksa Google Ads resmi bölge dökümü, yoksa erişim ağırlığı
      let cVol = 0;
      if (locGeoVolumes[locKey] && locGeoVolumes[locKey] > 0) {
        cVol = locGeoVolumes[locKey];
      } else if (off && (off.monthlyVolume || 0) > 0) {
        cVol = off.monthlyVolume;
      } else {
        const reach = (loc as any).reach || 500000;
        cVol = Math.max(50, Math.round(reach / 10000));
      }

      // 2. Ülkenin Ortalama TBM'si: Seçili kelimelerin hacim ağırlıklı veya doğrudan ortalama TBM'si
      let locBaseCpc = 0;
      if (cpcData && cpcData.volSum > 0 && cpcData.weightedCpcSum > 0) {
        locBaseCpc = cpcData.weightedCpcSum / cpcData.volSum;
      } else if (cpcData && cpcData.count > 0 && cpcData.simpleCpcSum > 0) {
        locBaseCpc = cpcData.simpleCpcSum / cpcData.count;
      } else if (off && (off.avgCpc || 0) > 0) {
        locBaseCpc = off.avgCpc;
      } else {
        locBaseCpc = avgTopPageCpc || 25.0;
      }

      const finalCpc = Number((locBaseCpc * scenarioMultiplier.cpcMult).toFixed(2));

      return {
        id: String(loc.id),
        code: loc.countryCode || off?.code || 'XX',
        name: loc.canonicalName || loc.name,
        canonicalName: loc.canonicalName || loc.name,
        flag: loc.flag || off?.flag || '🌍',
        sharePercent: 0,
        monthlyVolume: cVol,
        avgCpc: finalCpc,
        estClicks: 0,
        estConversions: 0,
      };
    });

    const totalPoolVol = activePool.reduce((s, k) => s + (Number(k.monthlyVolume) || 0), 0);
    const sumRawBreakdownVol = items.reduce((s, item) => s + (item.monthlyVolume || 0), 0);

    if (totalPoolVol > 0 && sumRawBreakdownVol > 0) {
      let distributedSum = 0;
      items.forEach((item, idx) => {
        if (idx === items.length - 1) {
          item.monthlyVolume = Math.max(10, totalPoolVol - distributedSum);
        } else {
          const share = item.monthlyVolume / sumRawBreakdownVol;
          const scaled = Math.max(10, Math.round(totalPoolVol * share));
          item.monthlyVolume = scaled;
          distributedSum += scaled;
        }
      });
      // Second pass to ensure exact total match
      const currentSum = items.reduce((s, item) => s + item.monthlyVolume, 0);
      const diff = totalPoolVol - currentSum;
      if (diff !== 0 && items.length > 0) {
        const maxItem = items.reduce((prev, curr) => (curr.monthlyVolume > prev.monthlyVolume ? curr : prev), items[0]);
        maxItem.monthlyVolume = Math.max(10, maxItem.monthlyVolume + diff);
      }
    }

    const finalSumVol = items.reduce((s, item) => s + item.monthlyVolume, 0);
    items.forEach(item => {
      const share = finalSumVol > 0 ? (item.monthlyVolume / finalSumVol) : (1 / items.length);
      item.sharePercent = Math.max(1, Math.round(share * 100));
      item.estClicks = Math.round((simulation.estClicks || 0) * share);
      item.estConversions = Math.round((simulation.estConversions || 0) * share);
    });

    return items;
  }, [
    selectedLocations,
    selectedKeywordsPool,
    keywords,
    officialLocationBreakdown,
    avgTopPageCpc,
    scenarioMultiplier.cpcMult,
    simulation.estClicks,
    simulation.estConversions
  ]);

  // -------------------------------------------------------------
  // LOCATION SCOPE ADAPTIVE KEYWORD & GROUP METRICS
  // -------------------------------------------------------------
  // Selected locations grouped & sorted primarily by Country and secondarily by City/Region Name
  const selectedLocationsGrouped = useMemo(() => {
    return [...selectedLocations].sort((a, b) => {
      const getCountry = (loc: GeoTargetLocation) => {
        if (loc.countryName) return loc.countryName;
        if (loc.canonicalName) {
          const parts = loc.canonicalName.split(',');
          if (parts.length > 1) return parts[parts.length - 1].trim();
        }
        return loc.countryCode || loc.name;
      };
      const countryA = getCountry(a).toLowerCase();
      const countryB = getCountry(b).toLowerCase();
      if (countryA !== countryB) {
        return countryA.localeCompare(countryB, 'tr');
      }
      const nameA = (a.canonicalName || a.name || '').toLowerCase();
      const nameB = (b.canonicalName || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB, 'tr');
    });
  }, [selectedLocations]);

  const activeScopeLocation = useMemo(() => {
    if (activeLocationScope === 'ALL') return null;
    return selectedLocations.find(l => String(l.id) === String(activeLocationScope)) || null;
  }, [activeLocationScope, selectedLocations]);

  const activeScopeMetric = useMemo(() => {
    if (activeLocationScope === 'ALL' || !activeScopeLocation) return null;
    return countryBreakdown.find(c => 
      String(c.id) === String(activeScopeLocation.id) || 
      c.name.toLowerCase() === activeScopeLocation.name.toLowerCase() ||
      (activeScopeLocation.canonicalName && c.canonicalName && c.canonicalName.toLowerCase() === activeScopeLocation.canonicalName.toLowerCase())
    ) || null;
  }, [activeLocationScope, activeScopeLocation, countryBreakdown]);



  // Scoped keywords adapted to chosen location (or aggregated if ALL), retaining full CPC imputation
  const scopedKeywords = useMemo(() => {
    const activeGeoCleanIds = new Set(selectedLocations.map(l => String(l.id).replace(/\D/g, '')).filter(Boolean));

    if (activeLocationScope === 'ALL' || !activeScopeLocation) {
      return imputedKeywords.map(k => {
        if (k.geoVolumes && Object.keys(k.geoVolumes).length > 0) {
          let sumGeo = 0;
          let hasMatchingGeo = false;
          for (const [gId, vol] of Object.entries(k.geoVolumes)) {
            const cleanGId = String(gId).replace(/\D/g, '');
            if (activeGeoCleanIds.size === 0 || activeGeoCleanIds.has(cleanGId) || activeGeoCleanIds.has(String(gId))) {
              sumGeo += (Number(vol) || 0);
              hasMatchingGeo = true;
            }
          }
          if (hasMatchingGeo && sumGeo > 0) {
            return {
              ...k,
              monthlyVolume: Math.max(k.monthlyVolume || 0, sumGeo)
            };
          }
        }
        return k;
      });
    }

    const targetGeoId = String(activeScopeMetric?.id || activeScopeLocation?.id || '');
    const cleanGeoId = targetGeoId.replace(/[^0-9]/g, '');
    const locCc = (activeScopeLocation?.countryCode || '').toUpperCase();
    const poolHasGeoData = imputedKeywords.some(k => k.geoVolumes && Object.keys(k.geoVolumes).length > 0);

    return imputedKeywords.map(k => {
      // 1. Direct official Google Ads volume for this exact location
      let directLocVol: number | undefined = undefined;
      if (k.geoVolumes && Object.keys(k.geoVolumes).length > 0) {
        const keysToTry = [
          cleanGeoId,
          targetGeoId,
          `geoTargetConstants/${cleanGeoId}`,
          locCc,
          locCc.toLowerCase(),
          activeScopeLocation?.name?.toLowerCase(),
          activeScopeLocation?.canonicalName?.toLowerCase()
        ].filter(Boolean) as string[];

        for (const key of keysToTry) {
          if (k.geoVolumes[key] !== undefined) {
            directLocVol = Number(k.geoVolumes[key]) || 0;
            break;
          }
        }
        if (directLocVol === undefined && poolHasGeoData) {
          directLocVol = 0;
        }
      } else if (poolHasGeoData) {
        directLocVol = 0;
      }

      const directCpcObj = k.geoCpc ? (
        k.geoCpc[cleanGeoId] || k.geoCpc[targetGeoId] || k.geoCpc['geoTargetConstants/' + cleanGeoId]
      ) : undefined;
      const directLocLowCpc = directCpcObj?.lowCpc;
      const directLocHighCpc = directCpcObj?.highCpc;

      const intentMultiplier = k.cpcEstimationMultiplier || (
        k.intent === 'TRANSACTIONAL' ? cpcImputationSettings.transactionalMultiplier :
        k.intent === 'INFORMATIONAL' ? cpcImputationSettings.informationalMultiplier :
        cpcImputationSettings.commercialMultiplier
      ) || 1.0;

      const baseLow = (directLocLowCpc !== undefined && directLocLowCpc > 0) 
        ? directLocLowCpc * intentMultiplier
        : (k.lowCpc > 0 ? k.lowCpc : 0);
      const baseHigh = (directLocHighCpc !== undefined && directLocHighCpc > 0) 
        ? directLocHighCpc * intentMultiplier
        : (k.highCpc > 0 ? k.highCpc : 0);
      const hasDirectLocCpc = directLocLowCpc !== undefined && directLocLowCpc > 0.05;
      const isEstimated = !hasDirectLocCpc && Boolean(k.isCpcEstimated || k.cpcEstimationMultiplier || k.cpcEstimationCluster);

      if (directLocVol !== undefined) {
        return {
          ...k,
          monthlyVolume: directLocVol,
          lowCpc: Math.round(baseLow * 100) / 100,
          highCpc: Math.round(baseHigh * 100) / 100,
          isCpcEstimated: isEstimated,
          cpcEstimationMultiplier: isEstimated ? intentMultiplier : undefined
        };
      }

      return {
        ...k,
        lowCpc: Math.round(baseLow * 100) / 100,
        highCpc: Math.round(baseHigh * 100) / 100,
        isCpcEstimated: isEstimated,
        cpcEstimationMultiplier: isEstimated ? intentMultiplier : undefined
      };
    });
  }, [imputedKeywords, activeLocationScope, activeScopeMetric, activeScopeLocation, selectedLocations, cpcImputationSettings]);

  // In Step 2, the pool of keywords is strictly the approved keywords carried over from Step 1
  const step2WorkingKeywords = useMemo(() => {
    if (currentStep === 2) {
      const approvedSet = step2ApprovedKeywordIds.size > 0 ? step2ApprovedKeywordIds : selectedKeywordIds;
      return scopedKeywords.filter(k => approvedSet.has(k.id));
    }
    return scopedKeywords;
  }, [currentStep, scopedKeywords, step2ApprovedKeywordIds, selectedKeywordIds]);

  // Scoped clusters (Ad Group Themes)
  const keywordClusters = useMemo(() => {
    const kwMap = new Map(step2WorkingKeywords.map(k => [k.id, k]));
    return baseKeywordClusters
      .map(cluster => {
        const cKws = cluster.keywords
          .map(k => {
            const scopedK = kwMap.get(k.id);
            if (!scopedK) return null;
            const isEstimated = Boolean(k.isCpcEstimated || scopedK.isCpcEstimated);
            return {
              ...k,
              ...scopedK,
              isCpcEstimated: isEstimated,
              cpcEstimationCluster: isEstimated ? (k.cpcEstimationCluster || scopedK.cpcEstimationCluster || cluster.name) : undefined,
              cpcEstimationMultiplier: isEstimated ? (k.cpcEstimationMultiplier || scopedK.cpcEstimationMultiplier) : undefined
            };
          })
          .filter(Boolean) as KeywordMetric[];

        if (currentStep === 2 && cKws.length === 0) return null;

        const totalVol = cKws.reduce((s, k) => s + k.monthlyVolume, 0);
        const cpcSum = cKws.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0);
        const avgCpc = cKws.length > 0 ? (cpcSum / cKws.length) : 0;
        const selectedCount = cKws.filter(k => selectedKeywordIds.has(k.id)).length;
        return {
          ...cluster,
          keywords: cKws,
          totalVolume: totalVol,
          avgCpc: Math.round(avgCpc * 100) / 100,
          selectedCount
        };
      })
      .filter(Boolean) as KeywordCluster[];
  }, [baseKeywordClusters, step2WorkingKeywords, selectedKeywordIds, currentStep]);

  // Active Cluster details for Step 1 & Step 2
  const activeCluster = useMemo(() => {
    const activeKwList = step2WorkingKeywords;
    if (activeClusterId === 'ALL') {
      const totalVol = activeKwList.reduce((s, k) => s + k.monthlyVolume, 0);
      const cpcSum = activeKwList.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0);
      const transactionalCount = activeKwList.filter(k => k.intent === 'TRANSACTIONAL').length;
      return {
        id: 'ALL',
        name: currentStep === 2 ? 'Tüm Seçilen Kelimeler' : 'Tüm Anahtar Kelimeler',
        icon: '✨',
        keywords: activeKwList,
        totalVolume: totalVol,
        avgCpc: activeKwList.length > 0 ? cpcSum / activeKwList.length : 0,
        selectedCount: currentStep === 2 ? activeKwList.filter(k => selectedKeywordIds.has(k.id)).length : selectedKeywordIds.size,
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
      name: currentStep === 2 ? 'Tüm Seçilen Kelimeler' : 'Tüm Anahtar Kelimeler',
      icon: '✨',
      keywords: activeKwList,
      totalVolume: 0,
      avgCpc: 0,
      selectedCount: 0,
      transactionalCount: 0
    };
  }, [activeClusterId, keywordClusters, step2WorkingKeywords, selectedKeywordIds, currentStep]);

  // Count of strategist picks in the current view
  const strategistCountInView = useMemo(() => {
    const baseList = activeCluster ? activeCluster.keywords : step2WorkingKeywords;
    return baseList.filter(k => !!k.isAiStrategistPick || k.id?.startsWith('ai_strat_') || k.id?.startsWith('ai_alt_')).length;
  }, [activeCluster, step2WorkingKeywords]);

  // Count of user seeds vs suggestions in the current view
  const userSeedsCountInView = useMemo(() => {
    const baseList = activeCluster ? activeCluster.keywords : step2WorkingKeywords;
    return baseList.filter(k => !!k.isUserSeed || k.source === 'USER_SEED' || k.id?.startsWith('seed_kw_') || k.id?.startsWith('user_seed_')).length;
  }, [activeCluster, step2WorkingKeywords]);

  const expansionCountInView = useMemo(() => {
    const baseList = activeCluster ? activeCluster.keywords : step2WorkingKeywords;
    return baseList.filter(k => !k.isUserSeed && k.source !== 'USER_SEED' && !k.id?.startsWith('seed_kw_') && !k.id?.startsWith('user_seed_')).length;
  }, [activeCluster, step2WorkingKeywords]);

  // Filtered & Sorted Keywords for the active right-side data grid
  const activeKeywordsGrid = useMemo(() => {
    const baseList = activeCluster ? activeCluster.keywords : step2WorkingKeywords;
    const searchLower = step1SearchFilter.toLowerCase().trim();

    return baseList
      .filter(k => {
        const matchesSearch = !searchLower || k.keyword.toLowerCase().includes(searchLower);
        const isStrategistKw = !!k.isAiStrategistPick || k.id?.startsWith('ai_strat_') || k.id?.startsWith('ai_alt_');
        const isUserSeed = !!k.isUserSeed || k.source === 'USER_SEED' || k.id?.startsWith('seed_kw_') || k.id?.startsWith('user_seed_');
        const matchesSource = 
          mode !== 'KEYWORDS' ||
          step1SourceFilter === 'ALL' || 
          (step1SourceFilter === 'USER_SEED' ? isUserSeed : !isUserSeed);
        const matchesIntent = 
          step1IntentFilter === 'ALL' || 
          (step1IntentFilter === 'STRATEGIST' ? isStrategistKw : k.intent === step1IntentFilter);
        return matchesSearch && matchesSource && matchesIntent;
      })
      .sort((a, b) => {
        if (step1SortBy === 'VOLUME') return b.monthlyVolume - a.monthlyVolume;
        if (step1SortBy === 'CPC_LOW') return ((a.lowCpc + a.highCpc) / 2) - ((b.lowCpc + b.highCpc) / 2);
        if (step1SortBy === 'CPC_HIGH') return ((b.lowCpc + b.highCpc) / 2) - ((a.lowCpc + a.highCpc) / 2);
        if (step1SortBy === 'ALPHABETICAL') return a.keyword.localeCompare(b.keyword);
        return 0;
      });
  }, [activeCluster, step2WorkingKeywords, step1SearchFilter, step1SourceFilter, step1IntentFilter, step1SortBy, mode]);

  const maxVolumeInGrid = useMemo(() => {
    return Math.max(...activeKeywordsGrid.map(k => k.monthlyVolume), 1);
  }, [activeKeywordsGrid]);

  const selectedScopedKeywords = useMemo(() => {
    const allAvailable = scopedKeywords.length > 0 ? scopedKeywords : imputedKeywords;
    return allAvailable.filter(k => selectedKeywordIds.has(k.id));
  }, [scopedKeywords, imputedKeywords, selectedKeywordIds]);

  const selectedTotalVolume = useMemo(() => {
    return selectedScopedKeywords.reduce((s, k) => s + (Number(k.monthlyVolume) || 0), 0);
  }, [selectedScopedKeywords]);

  const selectedAvgCpc = useMemo(() => {
    if (selectedScopedKeywords.length === 0) return 0;
    const cpcSum = selectedScopedKeywords.reduce((s, k) => s + (((Number(k.lowCpc) || 0) + (Number(k.highCpc) || 0)) / 2), 0);
    return Math.round((cpcSum / selectedScopedKeywords.length) * 100) / 100;
  }, [selectedScopedKeywords]);

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
      isApplyingSubCampaignRef.current = true;
      // First sync current active sub campaign
      const availablePool = scopedKeywords.length > 0 ? scopedKeywords : imputedKeywords;
      const selectedKws = Array.from(selectedKeywordIds).map(id => availablePool.find(k => k.id === id)).filter(Boolean) as KeywordMetric[];
      const effectiveSelectedKws = selectedKws.length > 0 ? selectedKws : (availablePool.length > 0 ? availablePool : []);
      const effectiveDiscoveredKws = availablePool.length > 0 ? availablePool : (keywords.length > 0 ? keywords : []);

      const updatedSubCampaigns = subCampaigns.map(c => {
        if (c.id !== activeSubCampaignId) return c;
        const rawTargetLang = targetLanguage || detectedLanguage || 'tr';
        const isAutoLang = rawTargetLang === 'auto' || !rawTargetLang;
        const finalLangCode = isAutoLang ? (detectedLanguage && detectedLanguage !== 'auto' ? detectedLanguage : 'tr') : rawTargetLang;
        const finalLangObj = GOOGLE_ADS_LANGUAGES.find(l => l.code === finalLangCode);
        const finalLangName = isAutoLang 
          ? (detectedLanguageName && detectedLanguageName !== 'Otomatik' && detectedLanguageName !== 'Otomatik (Sayfa Dili)' ? detectedLanguageName : (finalLangObj?.name || 'Türkçe'))
          : (GOOGLE_ADS_LANGUAGES.find(l => l.code === rawTargetLang)?.name || 'Türkçe');
        const finalLangFlag = finalLangObj?.flag || (finalLangCode === 'tr' ? '🇹🇷' : (finalLangCode === 'en' ? '🇬🇧' : '🌐'));

        return {
          ...c,
          targetUrl: mode === 'URL' ? query : '',
          seedKeywords: mode === 'KEYWORDS' ? query : '',
          monthlyBudget,
          discoveredKeywords: effectiveDiscoveredKws,
          selectedKeywords: effectiveSelectedKws,
          negativeCategories,
          targetLocations: selectedLocations,
          countryBreakdown: countryBreakdown.length > 0 ? countryBreakdown : c.countryBreakdown,
          businessModel,
          languageCode: finalLangCode,
          languageName: finalLangName,
          languageFlag: finalLangFlag,
          cpcImputationSettings,
          parameters: {
            growthScenario,
            budgetMode,
            avgDealValue,
            allocGoogleSearch,
            allocMetaAds,
            allocYouTube,
            allocGdn,
            targetImpressionShare,
            expectedCtr,
            searchLeadCr: leadConversionRate,
            searchHealthyLeadRate: leadCloseRate,
            searchEcommerceCr: ecommerceConversionRate,
            searchAov: avgOrderValue,
            metaCpm,
            metaCtr,
            metaLeadCr,
            metaHealthyLeadRate,
            metaCloseRate,
            youtubeCpv,
            youtubeVtr,
            youtubeActionRate,
            gdnCpm,
            gdnCtr,
            gdnAssistedCr
          },
          simulationResult: simulation,
          metaSimulationResult: metaSimulation,
          youtubeSimulationResult: youtubeSimulation,
          gdnSimulationResult: gdnSimulation
        };
      });

      const formattedPeriod = formatCampaignDates(planStartDate, planEndDate, planPeriod);
      const res = await ApiService.saveForecastPlan({
        id: currentPlanId || undefined,
        workspaceId,
        name: planName.trim() || `${clientName} - ${formattedPeriod} Medya Planı`,
        clientName: clientName.trim(),
        startDate: planStartDate,
        endDate: planEndDate,
        period: formattedPeriod,
        tags: planTags,
        targetUrl: mode === 'URL' ? query : '',
        seedKeywords: mode === 'KEYWORDS' ? query : '',
        detectedLanguage,
        detectedLanguageName,
        monthlyBudget: totalMasterMonthlyBudget || monthlyBudget,
        selectedKeywords: selectedKeywordsPool,
        simulationResult: simulation,
        negativeKeywords: negativeCategories,
        targetCountries: activeCountries.map(c => c.name),
        countryBreakdown,
        subCampaigns: updatedSubCampaigns
      });
      if (res && res.planId && !currentPlanId) {
        setCurrentPlanId(res.planId);
      }
      setSubCampaigns(updatedSubCampaigns);
      setIsStep1Completed(true);
      setIsStep2Completed(true);
      setIsStep3Completed(true);
      setPlanSaveSuccess(true);
      setTimeout(() => setPlanSaveSuccess(false), 2500);
      setTimeout(() => {
        isApplyingSubCampaignRef.current = false;
      }, 200);
      loadSavedPlans();
    } catch (err: any) {
      isApplyingSubCampaignRef.current = false;
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
      k.monthlyVolume,
      `${k.trendChangePercent}%`,
      k.competition,
      k.lowCpc.toFixed(2),
      k.highCpc.toFixed(2),
      (((k.lowCpc + k.highCpc) / 2)).toFixed(2),
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

  // Helper to compile sub-campaign with latest in-memory studio state if active
  const getSubCampaignToExport = (subCamp?: SubCampaignItem): SubCampaignItem | null => {
    const target = subCamp || activeSubCampaign;
    if (!target) return null;
    const availablePool = scopedKeywords.length > 0 ? scopedKeywords : imputedKeywords;
    const selectedKws = Array.from(selectedKeywordIds).map(id => availablePool.find(k => k.id === id)).filter(Boolean) as KeywordMetric[];
    const currentSelected = selectedKws.length > 0 ? selectedKws : (selectedKeywordsPool.length > 0 ? selectedKeywordsPool : availablePool);
    
    if (target.id === activeSubCampaignId) {
      return {
        ...target,
        monthlyBudget: monthlyBudget || target.monthlyBudget || 35000,
        selectedKeywords: currentSelected.length > 0 ? currentSelected : target.selectedKeywords,
        discoveredKeywords: availablePool.length > 0 ? availablePool : (target.discoveredKeywords || []),
        negativeCategories,
        targetLocations: selectedLocations,
        countryBreakdown: countryBreakdown.length > 0 ? countryBreakdown : target.countryBreakdown,
        businessModel,
        simulationResult: simulation,
        metaSimulationResult: metaSimulation,
        youtubeSimulationResult: youtubeSimulation,
        gdnSimulationResult: gdnSimulation
      };
    }

    // For any saved sub-campaign, ensure keywords are enriched if they have missing CPCs
    const targetKws = target.selectedKeywords && target.selectedKeywords.length > 0
      ? target.selectedKeywords
      : (target.discoveredKeywords || []);
    const enrichedKws = enrichKeywordsWithClusterCpc(targetKws, cpcImputationSettings);
    return {
      ...target,
      selectedKeywords: target.selectedKeywords && target.selectedKeywords.length > 0
        ? enrichKeywordsWithClusterCpc(target.selectedKeywords, cpcImputationSettings)
        : enrichedKws,
      discoveredKeywords: target.discoveredKeywords && target.discoveredKeywords.length > 0
        ? enrichKeywordsWithClusterCpc(target.discoveredKeywords, cpcImputationSettings)
        : enrichedKws
    };
  };

  // Open Export Customization Modal
  const handleOpenExportModal = (
    subCamp?: SubCampaignItem, 
    format: 'PDF' | 'CSV' = 'PDF',
    customMasterPlan?: { name?: string; clientName?: string; period?: string; startDate?: string; endDate?: string }
  ) => {
    const target = getSubCampaignToExport(subCamp);
    if (!target) {
      alert('Dışa aktarılacak alt kampanya bulunamadı.');
      return;
    }
    setExportModalState({
      isOpen: true,
      subCampaign: target,
      format,
      masterPlan: customMasterPlan || {
        name: planName,
        clientName: clientName,
        period: planPeriod,
        startDate: planStartDate,
        endDate: planEndDate
      }
    });
  };

  // Direct handlers for CSV and PDF buttons
  const handleExportSubCampaignCsv = (subCamp?: SubCampaignItem, customMasterPlan?: any) => {
    handleOpenExportModal(subCamp, 'CSV', customMasterPlan);
  };

  const handleExportSubCampaignPdf = (subCamp?: SubCampaignItem, customMasterPlan?: any) => {
    handleOpenExportModal(subCamp, 'PDF', customMasterPlan);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ========================================================================= */}
      {/* VIEW 1: PORTFOLIO HUB (MASTER PLANS & SUB-CAMPAIGNS MANAGEMENT)           */}
      {/* ========================================================================= */}
      {viewMode === 'PORTFOLIO' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Header Banner */}
          <div 
            className="card"
            style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(147, 51, 234, 0.06) 100%)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.6rem' }}>👑</span>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Kampanya & Medya Planlama Portföyü
                </h1>
                <span className="badge badge-active" style={{ fontSize: '0.72rem' }}>
                  {savedPlans.length} Master Plan • {totalAllSubCampaigns} Alt Kampanya
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '720px' }}>
                Çatı kampanyalarınızı, diller ve pazarlar bazındaki alt kampanyaları (Google, Meta, Yandex, TikTok) tek merkezden yönetin ve içine girip simüle edin.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const curDates = getMonthDateRange(0);
                setNewMasterName(`Master Kampanya ${savedPlans.length + 1}`);
                setNewMasterClient(clientName || '');
                setNewMasterStartDate(curDates.start);
                setNewMasterEndDate(curDates.end);
                setNewMasterPeriod(formatCampaignDates(curDates.start, curDates.end));
                setIsAddMasterPlanModalOpen(true);
              }}
              className="btn-primary"
              style={{
                fontSize: '0.9rem',
                padding: '0.65rem 1.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              <Plus size={18} />
              <span>Yeni Çatı Kampanya Ekle</span>
            </button>
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>TOPLAM ÇATI KAMPANYA</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {savedPlans.length} Plan
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Farklı dönem ve müşteriler</div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>TOPLAM ALT KAMPANYA</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '2px' }}>
                {totalAllSubCampaigns} Kampanya
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Çok dilli & çok kanallı</div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>PORTFÖY TOPLAM BÜTÇE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                ₺{totalAllBudget.toLocaleString('tr-TR')}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                ₺{Math.round(totalAllBudget / 30.4).toLocaleString('tr-TR')} / gün
              </div>
            </div>
          </div>

          {/* Search Filter */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Kampanya adı, müşteri, dönem veya etiket (#Temmuz2026) ara..."
                value={portfolioSearchQuery}
                onChange={(e) => setPortfolioSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.4rem', fontSize: '0.85rem' }}
              />
            </div>
            {portfolioSearchQuery && (
              <button
                type="button"
                onClick={() => setPortfolioSearchQuery('')}
                className="btn-ghost"
                style={{ fontSize: '0.8rem' }}
              >
                Temizle
              </button>
            )}
          </div>

          {/* Cards Grid */}
          {filteredSavedPlans.length === 0 ? (
            <div className="card" style={{ padding: '4rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                👑
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {portfolioSearchQuery ? 'Aramanızla Eşleşen Kampanya Bulunamadı' : 'Henüz Kayıtlı Bir Çatı Kampanya Planı Yok'}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0.35rem auto 0 auto' }}>
                  {portfolioSearchQuery 
                    ? 'Farklı bir anahtar kelime veya etiket deneyebilirsiniz.' 
                    : 'Müşterileriniz veya dönemleriniz için çok dilli ve çok kanallı ilk çatı kampanyanızı oluşturarak başlayın.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const curDates = getMonthDateRange(0);
                  setNewMasterName(`Temmuz 2026 Büyüme Kampanyası`);
                  setNewMasterClient(`Acme Sağlık Turizmi`);
                  setNewMasterStartDate(curDates.start);
                  setNewMasterEndDate(curDates.end);
                  setNewMasterPeriod(formatCampaignDates(curDates.start, curDates.end));
                  setIsAddMasterPlanModalOpen(true);
                }}
                className="btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}
              >
                <Plus size={16} />
                <span>İlk Çatı Kampanyayı Oluştur</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {filteredSavedPlans.map((plan) => {
                const subs = Array.isArray(plan.subCampaigns) 
                  ? plan.subCampaigns 
                  : (plan.selectedKeywords && plan.selectedKeywords.length > 0 ? [{
                      id: 'legacy_' + plan.id,
                      name: plan.name || 'Ana Kampanya',
                      platform: 'GOOGLE' as CampaignPlatform,
                      objective: 'GOOGLE_SEARCH' as CampaignObjective,
                      languageCode: plan.detectedLanguage || 'tr',
                      languageName: plan.detectedLanguageName || 'Türkçe',
                      languageFlag: '🇹🇷',
                      targetLocations: DEFAULT_LOCATIONS,
                      monthlyBudget: plan.monthlyBudget || 0,
                      selectedKeywords: plan.selectedKeywords || [],
                      negativeCategories: plan.negativeKeywords || [],
                      parameters: {}
                    }] : []);

                const planTotalBudget = subs.reduce((s, c) => s + (c.monthlyBudget || 0), 0) || (Array.isArray(plan.subCampaigns) && plan.subCampaigns.length === 0 ? 0 : (plan.monthlyBudget || 0));

                return (
                  <div 
                    key={plan.id}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Card Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '1rem' }}>👑</span>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            {plan.name}
                          </h3>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                          {plan.clientName && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                              <Building2 size={12} color="var(--brand-primary)" /> {plan.clientName}
                            </span>
                          )}
                          {(plan.startDate || plan.endDate || plan.period) && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                              <Calendar size={12} color="var(--brand-primary)" /> {formatCampaignDates(plan.startDate, plan.endDate, plan.period)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Total Budget Pill */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                          ₺{planTotalBudget.toLocaleString('tr-TR')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          ₺{Math.round(planTotalBudget / 30.4).toLocaleString('tr-TR')} / gün
                        </div>
                      </div>
                    </div>

                    {/* Tags List */}
                    {plan.tags && plan.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {plan.tags.map((t, idx) => (
                          <span key={idx} style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: 'var(--brand-primary)', fontWeight: 600 }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Sub-Campaigns List (Interactive) */}
                    <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Layers size={12} /> Alt Kampanyalar ({subs.length}):
                      </div>

                      {subs.length === 0 ? (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                          Henüz alt kampanya eklenmedi.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {subs.map((sc) => (
                            <div
                              key={sc.id}
                              onClick={() => handleOpenMasterPlanStudio(plan, sc.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '6px 10px',
                                backgroundColor: 'var(--bg-surface-elevated)',
                                borderRadius: 'var(--radius-xs)',
                                border: '1px solid var(--border-subtle)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                              title={`${sc.name} alt kampanyasını stüdyoda aç`}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                {getPlatformIcon(sc.platform, 14)}
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {sc.name}
                                </span>
                                <span style={{ fontSize: '0.7rem' }}>
                                  {sc.languageFlag || '🌐'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenExportModal(sc, 'PDF', { 
                                      name: plan.name, 
                                      clientName: plan.clientName, 
                                      period: plan.period, 
                                      startDate: plan.startDate, 
                                      endDate: plan.endDate 
                                    });
                                  }}
                                  className="btn-ghost"
                                  style={{ padding: '3px 6px', fontSize: '0.7rem', color: 'var(--brand-primary)' }}
                                  title="Alt Kampanya Raporunu Özelleştir & PDF Al"
                                >
                                  <FileText size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenExportModal(sc, 'CSV', { 
                                      name: plan.name, 
                                      clientName: plan.clientName, 
                                      period: plan.period, 
                                      startDate: plan.startDate, 
                                      endDate: plan.endDate 
                                    });
                                  }}
                                  className="btn-ghost"
                                  style={{ padding: '3px 6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}
                                  title="Alt Kampanya CSV Raporunu Özelleştir & İndir"
                                >
                                  <Download size={13} />
                                </button>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-primary)', marginLeft: '2px' }}>
                                  ₺{(sc.monthlyBudget || 0).toLocaleString('tr-TR')}
                                </span>
                                <ChevronRight size={12} color="var(--text-muted)" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        ID: #{plan.id.slice(-6)}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(plan.id);
                          }}
                          className="btn-ghost"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#ef4444' }}
                          title="Planı Sil"
                        >
                          <Trash2 size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenMasterPlanStudio(plan)}
                          className="btn-primary"
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <span>Stüdyoyu Aç</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2: STUDIO WORKSPACE (FOCUSED MASTER + SUB-CAMPAIGNS WORKSPACE)        */
        /* ========================================================================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Master Campaign Top Identity & Navigation Bar */}
          <div 
            className="card" 
            style={{ 
              padding: '0.85rem 1.25rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.85rem',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
          >
            {/* Top Row: Master Plan Title, Client, Dates & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleBackToPortfolio}
                  className="btn-secondary"
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.4rem 0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 600
                  }}
                  title="Kampanya Portföyüne Dön"
                >
                  <ArrowLeft size={14} />
                  <span>Portföye Dön</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>👑</span>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="Master Kampanya Adı..."
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      backgroundColor: 'transparent',
                      border: '1px solid transparent',
                      borderRadius: 'var(--radius-xs)',
                      padding: '3px 6px',
                      minWidth: '220px'
                    }}
                    onFocus={(e) => e.target.style.border = '1px solid var(--brand-primary)'}
                    onBlur={(e) => e.target.style.border = '1px solid transparent'}
                  />
                </div>

                {/* Client / Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--bg-surface)', padding: '4px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)', fontSize: '0.8rem' }}>
                  <Building2 size={14} color="var(--brand-primary)" />
                  <span style={{ color: 'var(--text-muted)' }}>Müşteri:</span>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Müşteri / Marka"
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      width: '120px',
                      fontSize: '0.82rem',
                      padding: 0
                    }}
                  />
                </div>

                {/* Campaign Start & End Dates */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--bg-surface)', padding: '4px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)', fontSize: '0.8rem' }}>
                  <Calendar size={14} color="var(--brand-primary)" />
                  <span style={{ color: 'var(--text-muted)' }}>Tarihler:</span>
                  <input
                    type="date"
                    value={planStartDate}
                    onChange={(e) => {
                      setPlanStartDate(e.target.value);
                      setPlanPeriod(formatCampaignDates(e.target.value, planEndDate));
                    }}
                    title="Başlangıç Tarihi"
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.78rem',
                      padding: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                  <input
                    type="date"
                    value={planEndDate}
                    onChange={(e) => {
                      setPlanEndDate(e.target.value);
                      setPlanPeriod(formatCampaignDates(planStartDate, e.target.value));
                    }}
                    title="Bitiş Tarihi"
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.78rem',
                      padding: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              {/* Right: Master Consolidated Budget & Quick Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'right', paddingRight: '0.35rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                    KONSOLİDE TOPLAM BÜTÇE
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-primary)', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                    ₺{totalMasterMonthlyBudget.toLocaleString('tr-TR')}
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      (₺{Math.round(totalMasterMonthlyBudget / 30.4).toLocaleString('tr-TR')} / gün)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddMasterPlanModalOpen(true)}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
                  title="Yeni Çatı Kampanya Oluştur"
                >
                  <Plus size={14} /> Yeni Çatı Kampanya
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={keywords.length === 0}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
                >
                  <Download size={14} /> CSV
                </button>

                <button
                  type="button"
                  onClick={handleSavePlan}
                  className="btn-primary"
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem' }}
                >
                  {planSaveSuccess ? <Check size={14} /> : <Save size={14} />}
                  {planSaveSuccess ? 'Plan Kaydedildi!' : 'Master Planı Kaydet'}
                </button>
              </div>

            </div>

            {/* Bottom Row: Tags Management */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Tag size={13} />
                <span>Etiketler:</span>
              </div>

              {planTags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--brand-primary)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    border: '1px solid rgba(37, 99, 235, 0.2)'
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}

              {/* Add Tag Input */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="text"
                  placeholder="+ Etiket ekle (#Temmuz, #UK)..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px dashed var(--border-default)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    width: '150px'
                  }}
                />
                {newTagInput && (
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn-ghost"
                    style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                  >
                    Ekle
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 0.5 SUB-CAMPAIGNS SELECTOR STRIP */}
          <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--border-default)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflowX: 'auto', flex: 1, paddingBottom: '2px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '0.35rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Layers size={14} color="var(--brand-primary)" /> Alt Kampanyalar ({subCampaigns.length}):
          </span>

          {subCampaigns.length === 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginRight: '0.4rem' }}>
              💡 Henüz alt kampanya oluşturulmadı.
            </span>
          )}

          {subCampaigns.map((camp) => {
            const isActive = camp.id === activeSubCampaignId;
            return (
              <div
                key={camp.id}
                onClick={() => handleSelectSubCampaign(camp.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: isActive ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                  backgroundColor: isActive ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface)',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-primary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{camp.languageFlag || '🌐'}</span>
                {getPlatformIcon(camp.platform, 14)}
                
                {editingSubCampaignId === camp.id ? (
                  <input
                    type="text"
                    value={tempSubCampaignName}
                    onChange={(e) => setTempSubCampaignName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(camp.id);
                      if (e.key === 'Escape') setEditingSubCampaignId(null);
                    }}
                    onBlur={() => handleSaveRename(camp.id)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    style={{
                      padding: '1px 6px',
                      fontSize: '0.8rem',
                      borderRadius: '3px',
                      border: '1px solid var(--brand-primary)',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      width: '120px'
                    }}
                  />
                ) : (
                  <span 
                    onDoubleClick={(e) => handleStartRename(camp.id, camp.name, e)}
                    title="İsmi düzenlemek için çift tıklayın veya kaleme basın"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    <span>{camp.name}</span>
                    <button
                      type="button"
                      onClick={(e) => handleStartRename(camp.id, camp.name, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '1px',
                        color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
                        opacity: isActive ? 0.9 : 0.45,
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                      title="Alt Kampanya İsmini Düzenle"
                    >
                      <Edit2 size={11} />
                    </button>
                  </span>
                )}

                <span 
                  style={{ 
                    fontSize: '0.7rem', 
                    padding: '1px 5px', 
                    borderRadius: 'var(--radius-xs)', 
                    backgroundColor: isActive ? 'var(--brand-primary)' : 'var(--bg-surface-elevated)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 600 
                  }}
                >
                  ₺{(isActive ? (monthlyBudget || camp.monthlyBudget || 0) : (camp.monthlyBudget || 0)).toLocaleString('tr-TR')}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleDeleteSubCampaign(camp.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '1px',
                    marginLeft: '2px',
                    display: 'flex',
                    color: 'var(--text-muted)'
                  }}
                  title="Bu alt kampanyayı sil"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}

          {/* Add Sub-Campaign Button */}
          <button
            type="button"
            onClick={() => {
              setNewCampName(`Kampanya ${subCampaigns.length + 1}`);
              setIsAddCampaignModalOpen(true);
            }}
            className="btn-secondary"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px dashed var(--brand-primary)',
              color: 'var(--brand-primary)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={13} />
            <span>Yeni Alt Kampanya Ekle</span>
          </button>
        </div>

        {/* 360 Consolidated Report Button */}
        <button
          type="button"
          onClick={() => {
            syncActiveSubCampaign();
            setCurrentStep(3);
            setActiveChannelTab('OMNICHANNEL');
          }}
          className="btn-secondary"
          style={{
            padding: '0.4rem 0.8rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: activeChannelTab === 'OMNICHANNEL' && currentStep === 3 ? '#ffffff' : 'var(--brand-primary)',
            backgroundColor: activeChannelTab === 'OMNICHANNEL' && currentStep === 3 ? 'var(--brand-primary)' : 'transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            whiteSpace: 'nowrap'
          }}
        >
          <BarChart3 size={14} />
          <span>360° Konsolide Özet</span>
        </button>

        {/* Sub-Campaign Fast Export Actions */}
        {activeSubCampaign && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleOpenExportModal(activeSubCampaign, 'PDF')}
              className="btn-secondary"
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
                color: 'var(--brand-primary)',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                borderColor: 'rgba(37, 99, 235, 0.25)'
              }}
              title="Rapor Özelleştirme ve PDF / Baskı Raporunu Aç"
            >
              <SlidersHorizontal size={13} />
              <span>Rapor Özelleştir</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportSubCampaignPdf()}
              className="btn-ghost"
              style={{
                padding: '0.4rem 0.6rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                whiteSpace: 'nowrap',
                color: 'var(--brand-primary)'
              }}
              title="PDF Raporu Özelleştir & Aç"
            >
              <FileText size={13} />
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportSubCampaignCsv()}
              className="btn-ghost"
              style={{
                padding: '0.4rem 0.6rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                whiteSpace: 'nowrap',
                color: 'var(--text-secondary)'
              }}
              title="CSV Raporu Özelleştir & İndir"
            >
              <Download size={13} />
              <span>CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* NEW SUB-CAMPAIGN CREATION MODAL */}
      {isAddCampaignModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setIsAddCampaignModalOpen(false)}
        >
          <div 
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🚀</span>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Yeni Alt Kampanya Ekle
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Master Planınız altına hedef dili, platformu ve modeli belirleyin.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddCampaignModalOpen(false)}
                className="btn-ghost"
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Campaign Name */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                Kampanya Adı:
              </label>
              <input
                type="text"
                value={newCampName}
                onChange={(e) => setNewCampName(e.target.value)}
                placeholder="Örn: Google Search - İngilizce Saç Ekimi..."
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            {/* Platform Selection */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.45rem' }}>
                Reklam Platformu / Kaynağı:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'GOOGLE', label: 'Google Ads', icon: <GoogleIcon size={18} /> },
                  { id: 'META', label: 'Meta Ads', icon: <MetaIcon size={18} /> },
                  { id: 'YOUTUBE', label: 'YouTube Video', icon: <YouTubeIcon size={18} /> },
                  { id: 'TIKTOK', label: 'TikTok Ads', icon: <TikTokIcon size={18} /> },
                  { id: 'YANDEX', label: 'Yandex Direct', icon: <YandexIcon size={18} /> },
                  { id: 'BING', label: 'Microsoft Bing', icon: <BingIcon size={18} /> },
                ].map((p) => {
                  const isSelected = newCampPlatform === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setNewCampPlatform(p.id as CampaignPlatform);
                        if (p.id === 'GOOGLE') setNewCampObjective('GOOGLE_SEARCH');
                        else if (p.id === 'META') setNewCampObjective('META_LEADS');
                        else if (p.id === 'TIKTOK') setNewCampObjective('TIKTOK_LEADS');
                        else if (p.id === 'YOUTUBE') setNewCampObjective('GOOGLE_YOUTUBE');
                        else if (p.id === 'YANDEX') setNewCampObjective('YANDEX_SEARCH');
                      }}
                      style={{
                        padding: '0.65rem 0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.35rem',
                        borderRadius: 'var(--radius-xs)',
                        border: isSelected ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                        backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface-elevated)',
                        color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.78rem'
                      }}
                    >
                      {p.icon}
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campaign Objective / Model */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                Kampanya Amacı / Modeli:
              </label>
              <select
                value={newCampObjective}
                onChange={(e) => setNewCampObjective(e.target.value as CampaignObjective)}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}
              >
                {newCampPlatform === 'GOOGLE' && (
                  <>
                    <option value="GOOGLE_SEARCH">🔍 Google Search (Arama Ağı)</option>
                    <option value="GOOGLE_PMAX">⚡ Google Performance Max (PMax)</option>
                    <option value="GOOGLE_GDN">🖼️ Google Display Network (GDN)</option>
                    <option value="GOOGLE_DEMAND_GEN">✨ Google Demand Gen</option>
                  </>
                )}
                {newCampPlatform === 'META' && (
                  <>
                    <option value="META_LEADS">🎯 Meta Lead Ads (Anlık Form & Potansiyel Müşteri)</option>
                    <option value="META_SALES">🛒 Meta Satış & E-Ticaret (Katalog / Satın Alma)</option>
                    <option value="META_TRAFFIC">🚀 Meta Web Sitesi Trafiği & Tıklama</option>
                    <option value="META_AWARENESS">👁️ Meta Marka Bilinirliği & Erişim</option>
                    <option value="META_APP">📱 Meta Uygulama Yükleme (App Promotion)</option>
                  </>
                )}
                {newCampPlatform === 'TIKTOK' && (
                  <>
                    <option value="TIKTOK_LEADS">🎯 TikTok Lead Generation</option>
                    <option value="TIKTOK_VIEWS">🎬 TikTok Video Views & Engagement</option>
                    <option value="TIKTOK_SALES">🛒 TikTok Shop & Web Sales</option>
                  </>
                )}
                {newCampPlatform === 'YANDEX' && (
                  <>
                    <option value="YANDEX_SEARCH">🔍 Yandex Direct - Arama Ağı</option>
                    <option value="YANDEX_RSYA">🖼️ Yandex Direct - RSYA (Görüntülü Reklam)</option>
                  </>
                )}
                {newCampPlatform === 'YOUTUBE' && (
                  <>
                    <option value="GOOGLE_YOUTUBE">🎬 YouTube In-Stream & Shorts Video Actions</option>
                  </>
                )}
                {newCampPlatform === 'BING' && (
                  <>
                    <option value="GOOGLE_SEARCH">🔍 Bing Search Network</option>
                  </>
                )}
              </select>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsAddCampaignModalOpen(false)}
                className="btn-ghost"
                style={{ fontSize: '0.82rem' }}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleCreateNewSubCampaign}
                className="btn-primary"
                style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
              >
                🚀 Kampanyayı Ekle & Yapılandır
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CASE 2: GOOGLE SEARCH SUB-CAMPAIGN ACTIVE -> SHOW SEM SEARCH & 2-STEP WIZARD */}
      {subCampaigns.length > 0 && isGoogleSearchActive && activeChannelTab === 'GOOGLE_SEARCH' && (
        <>
          {/* 2. Unified Smart Search & Discovery Control Card */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        
            {/* Top Meta Bar: Mode Toggle & Curated Quick Samples */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.75rem' }}>
              {/* Mode Toggle Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '3px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('URL');
                    if (query && !query.includes('.')) setQuery('');
                  }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.78rem',
                    fontWeight: mode === 'URL' ? 700 : 500,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: mode === 'URL' ? 'var(--brand-primary)' : 'transparent',
                    color: mode === 'URL' ? '#ffffff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Globe size={13} />
                  <span>Web Sitesi / URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('KEYWORDS');
                    if (query && (query.startsWith('http') || (query.includes('.') && !query.includes(' ')))) setQuery('');
                  }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.78rem',
                    fontWeight: mode === 'KEYWORDS' ? 700 : 500,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: mode === 'KEYWORDS' ? 'var(--brand-primary)' : 'transparent',
                    color: mode === 'KEYWORDS' ? '#ffffff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <KeyRound size={13} />
                  <span>Anahtar Kelimeler (Toplu Ekle)</span>
                </button>
              </div>

              {/* Quick Curated Samples */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span>Örnekler:</span>
                {(mode === 'URL' ? [
                  'summerhomes.com',
                  'dusbahcesiilkokulu.com',
                  'diksiyonkursu.com'
                ] : [
                  'alanya satılık villa',
                  'alanya satılık lüks daire',
                  'oba mahallesi satılık konut',
                  'alanya emlak danışmanı'
                ]).map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      if (mode === 'KEYWORDS') {
                        setQuery(prev => prev ? `${prev}\n${ex}` : ex);
                      } else {
                        setQuery(ex);
                        handleDiscover(ex, 'URL');
                      }
                    }}
                    className="btn-ghost"
                    style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-default)' }}
                  >
                    + {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form Area */}
            {mode === 'URL' ? (
              /* URL Single Input Bar */
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 2, minWidth: '260px', position: 'relative' }}>
                  <Globe size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Web sitesi veya açılış sayfası URL'si girin (örn: summerhomes.com veya https://example.com)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleDiscover(); }}
                    style={{ width: '100%', paddingLeft: '2.4rem', fontSize: '0.875rem' }}
                  />
                </div>

                {/* Location Selector */}
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="btn-secondary"
                  title="Google Ads Coğrafi Lokasyon Hedeflemesi Seçin"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.82rem',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--brand-primary)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Globe size={15} color="var(--brand-primary)" />
                  <span>
                    {selectedLocations.length === 1
                      ? `${selectedLocations[0].flag || '📍'} ${selectedLocations[0].name}`
                      : `📍 ${selectedLocations.length} Bölge (${selectedLocations[0]?.name || ''}...)`}
                  </span>
                </button>

                {/* Target Language Selector */}
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.82rem',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    maxWidth: '230px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="auto">🌐 Dil: Otomatik (Sayfa Dili)</option>
                  <optgroup label="── Popüler Hedef Diller ──">
                    {GOOGLE_ADS_LANGUAGES.slice(1, 6).map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="── Tüm Google Ads Dilleri ──">
                    {GOOGLE_ADS_LANGUAGES.slice(6).map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </optgroup>
                </select>

                {/* Action Button */}
                <button
                  onClick={() => handleDiscover()}
                  disabled={isLoading || !query.trim()}
                  className="btn-primary"
                  style={{ padding: '0.55rem 1.35rem', fontSize: '0.875rem', whiteSpace: 'nowrap', fontWeight: 600 }}
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  {isLoading ? 'Google Ads Verileri Analiz Ediliyor...' : '🚀 Analiz Et & Keşfet'}
                </button>
              </div>
            ) : (
              /* KEYWORDS Multi-line Bulk Textarea Input */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <textarea
                    rows={3}
                    placeholder={`Hedeflemek istediğiniz anahtar kelimeleri satır satır veya virgülle ayırarak girin / yapıştırın...\nÖrn:\nalanya satılık villa\nalanya satılık lüks daire\noba mahallesi satılık konut\nalanya emlak danışmanı`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: '85px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-default)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      lineHeight: 1.5
                    }}
                  />
                </div>

                {/* Lower Action & Settings Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {/* Left: Seed Counter Badge & Suggestion Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {parsedSeedList.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="badge badge-active" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                          <CheckCircle2 size={12} /> {parsedSeedList.length} Anahtar Kelime Girildi
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuery('')}
                          className="btn-ghost"
                          style={{ fontSize: '0.72rem', padding: '2px 6px', color: 'var(--text-muted)' }}
                        >
                          Temizle
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        💡 İpucu: Listeyi kopyalayıp doğrudan yapıştırabilirsiniz (%100 Google Ads API gerçek verileri çekilir).
                      </span>
                    )}

                    {/* Suggestion Expansion Toggle */}
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none', backgroundColor: 'var(--bg-surface-elevated)', padding: '4px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                      <input
                        type="checkbox"
                        checked={includeSuggestions}
                        onChange={(e) => setIncludeSuggestions(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>✨ Ek Önerileri Getir (<strong>"Bunu da Hedefleyebilirsiniz"</strong>)</span>
                    </label>
                  </div>

                  {/* Right: Location, Language & Discover Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Location Selector */}
                    <button
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      className="btn-secondary"
                      title="Google Ads Coğrafi Lokasyon Hedeflemesi Seçin"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.5rem 0.8rem',
                        fontSize: '0.8rem',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--brand-primary)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Globe size={14} color="var(--brand-primary)" />
                      <span>
                        {selectedLocations.length === 1
                          ? `${selectedLocations[0].flag || '📍'} ${selectedLocations[0].name}`
                          : `📍 ${selectedLocations.length} Bölge (${selectedLocations[0]?.name || ''}...)`}
                      </span>
                    </button>

                    {/* Language Selector */}
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      style={{
                        padding: '0.5rem 0.7rem',
                        fontSize: '0.8rem',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                        maxWidth: '200px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="auto">🌐 Dil: Otomatik (Kelime Dili)</option>
                      <optgroup label="── Popüler Hedef Diller ──">
                        {GOOGLE_ADS_LANGUAGES.slice(1, 6).map(lang => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name} ({lang.nativeName})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="── Tüm Google Ads Dilleri ──">
                        {GOOGLE_ADS_LANGUAGES.slice(6).map(lang => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name} ({lang.nativeName})
                          </option>
                        ))}
                      </optgroup>
                    </select>

                    {/* Discover Action Button */}
                    <button
                      onClick={() => handleDiscover()}
                      disabled={isLoading || !query.trim()}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', whiteSpace: 'nowrap', fontWeight: 600 }}
                    >
                      <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                      {isLoading ? 'Google Ads Verileri Analiz Ediliyor...' : '🚀 Analiz Et & Keşfet'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', fontSize: '0.8rem' }}>
                {errorMsg}
              </div>
            )}
          </div>

      {/* 3. SCENARIO A: DYNAMIC ANIMATED LOADING SCREEN (When Loading, ONLY this screen is visible) */}
      {isLoading && (
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
      )}

      {/* 3-Step Wizard Navigation Bar (Only visible after analysis results arrive) */}
      {keywords.length > 0 && (
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
              padding: '0.85rem 1.15rem',
              borderRadius: 'var(--radius-sm)',
              border: currentStep === 1 ? '2px solid var(--brand-primary)' : (isStep1Completed ? '1.5px solid #10b981' : '1px solid var(--border-default)'),
              backgroundColor: currentStep === 1 ? 'rgba(37, 99, 235, 0.12)' : (isStep1Completed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface-elevated)'),
              color: currentStep === 1 ? 'var(--brand-primary)' : (isStep1Completed ? '#10b981' : 'var(--text-secondary)'),
              cursor: 'pointer',
              fontWeight: currentStep === 1 ? 700 : 500,
              fontSize: '0.85rem',
              transition: 'all 0.15s ease',
              boxShadow: currentStep === 1 ? '0 0 0 1px var(--brand-primary)' : 'none'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: isStep1Completed ? '#10b981' : (currentStep === 1 ? 'var(--brand-primary)' : 'var(--border-default)'),
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {isStep1Completed ? <Check size={14} /> : '1'}
            </div>
            <span>1. Adım: STAG Kelime Keşfi ({keywords.length.toLocaleString('tr-TR')})</span>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => {
              if (selectedKeywordIds.size > 0) {
                if (step2ApprovedKeywordIds.size === 0) {
                  setStep2ApprovedKeywordIds(new Set(selectedKeywordIds));
                }
                setCurrentStep(2);
              }
            }}
            disabled={selectedKeywordIds.size === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1.15rem',
              borderRadius: 'var(--radius-sm)',
              border: currentStep === 2 ? '2px solid var(--brand-primary)' : (isStep2Completed ? '1.5px solid #10b981' : '1px solid var(--border-default)'),
              backgroundColor: currentStep === 2 ? 'rgba(37, 99, 235, 0.12)' : (isStep2Completed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface-elevated)'),
              color: currentStep === 2 ? 'var(--brand-primary)' : (isStep2Completed ? '#10b981' : 'var(--text-secondary)'),
              cursor: selectedKeywordIds.size === 0 ? 'not-allowed' : 'pointer',
              opacity: selectedKeywordIds.size === 0 ? 0.6 : 1,
              fontWeight: currentStep === 2 ? 700 : 500,
              fontSize: '0.85rem',
              transition: 'all 0.15s ease',
              boxShadow: currentStep === 2 ? '0 0 0 1px var(--brand-primary)' : 'none'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: isStep2Completed ? '#10b981' : (currentStep === 2 ? 'var(--brand-primary)' : 'var(--border-default)'),
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {isStep2Completed ? <Check size={14} /> : '2'}
            </div>
            <span>2. Adım: Seçili Kelimeleri İncele ({selectedKeywordIds.size})</span>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => {
              if (selectedKeywordIds.size > 0) setCurrentStep(3);
            }}
            disabled={selectedKeywordIds.size === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1.15rem',
              borderRadius: 'var(--radius-sm)',
              border: currentStep === 3 ? '2px solid var(--brand-primary)' : (isStep3Completed ? '1.5px solid #10b981' : '1px solid var(--border-default)'),
              backgroundColor: currentStep === 3 ? 'rgba(37, 99, 235, 0.12)' : (isStep3Completed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface-elevated)'),
              color: currentStep === 3 ? 'var(--brand-primary)' : (isStep3Completed ? '#10b981' : 'var(--text-secondary)'),
              cursor: selectedKeywordIds.size === 0 ? 'not-allowed' : 'pointer',
              opacity: selectedKeywordIds.size === 0 ? 0.6 : 1,
              fontWeight: currentStep === 3 ? 700 : 500,
              fontSize: '0.85rem',
              transition: 'all 0.15s ease',
              boxShadow: currentStep === 3 ? '0 0 0 1px var(--brand-primary)' : 'none'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: isStep3Completed ? '#10b981' : (currentStep === 3 ? 'var(--brand-primary)' : 'var(--border-default)'),
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {isStep3Completed ? <Check size={14} /> : '3'}
            </div>
            <span>3. Adım: 360° Medya Karması & Büyüme Simülatörü</span>
          </button>

        </div>
      )}

          {/* ========================================================================= */}
          {/* STEP 1 & STEP 2 VIEW: Keyword Discovery (Step 1) & Review Selected (Step 2) */}
          {/* ========================================================================= */}
          {(currentStep === 1 || currentStep === 2) && (
            keywords.length === 0 ? (
              <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={28} />
                </div>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Bu Alt Kampanya İçin Anahtar Kelime Analizi Başlatın
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0.4rem auto 0 auto', lineHeight: 1.5 }}>
                    Yukarıdaki SEM Keşif çubuğuna hedef web sitesi URL'sini veya sektörel anahtar kelimeleri girip <strong>"Analiz Et & Keşfet"</strong> butonuna tıklayın.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hızlı Başlangıç Örnekleri:</span>
                  {['summerhomes.com', 'alanya butik oteller', 'diksiyon kursu istanbul', 'dusbahcesiilkokulu.com', 'buy apartment alanya'].map(label => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setQuery(label);
                        const isUrl = label.includes('.') && !label.includes(' ');
                        const newMode = isUrl ? 'URL' : 'KEYWORDS';
                        setMode(newMode);
                        handleDiscover(label, newMode);
                      }}
                      className="btn-ghost"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)' }}
                    >
                      + {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Context Summary Header */}
              <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface)', borderLeft: '4px solid var(--brand-primary)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)', flexShrink: 0 }}>
                    <Languages size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                        {mode === 'URL' ? 'AÇILIŞ SAYFASI ANALİZİ' : 'TOHUM ANAHTAR KELİME ANALİZİ'}
                      </span>
                      <span className="badge badge-active" style={{ fontSize: '0.725rem' }}>
                        <CheckCircle2 size={11} /> {effectiveLanguage.name} ({effectiveLanguage.code.toUpperCase()})
                      </span>
                      {sectorName && (
                        <span className="badge badge-neutral" style={{ fontSize: '0.725rem' }}>
                          {sectorName}
                        </span>
                      )}
                      <span className="badge badge-active" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.725rem', fontWeight: 600 }}>
                        <Sparkles size={11} /> 🟢 Resmi Google Ads Keyword Planner Verisi
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem', wordBreak: 'break-word' }}>
                      {pageTitle || query}
                    </div>
                  </div>
                </div>

                {pageSummary && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', width: '100%', lineHeight: 1.4, backgroundColor: 'var(--bg-surface-elevated)', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span>💡</span>
                    <span>{pageSummary}</span>
                  </div>
                )}
              </div>

              {/* 📍 Active Target Locations Interactive Strip */}
              <div className="card" style={{ padding: '0.75rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <Globe size={16} color="var(--brand-primary)" />
                    <span>Hedef Lokasyonlar ({selectedLocations.length}):</span>
                  </div>

                  {/* 🌐 All Locations Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setActiveLocationScope('ALL')}
                      className={`badge ${activeLocationScope === 'ALL' ? 'badge-primary' : 'badge-neutral'}`}
                      style={{
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        border: activeLocationScope === 'ALL' ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                        backgroundColor: activeLocationScope === 'ALL' ? 'var(--brand-primary)' : 'var(--bg-surface)',
                        color: activeLocationScope === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
                        fontWeight: activeLocationScope === 'ALL' ? 700 : 500,
                        boxShadow: activeLocationScope === 'ALL' ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>🌐</span>
                      <span>Tüm Lokasyonlar (Toplam)</span>
                    </button>

                    {/* Individual Location Buttons */}
                    {selectedLocationsGrouped.map(loc => {
                      const isScopeActive = activeLocationScope === String(loc.id);
                      return (
                        <div
                          key={loc.id}
                          onClick={() => setActiveLocationScope(isScopeActive ? 'ALL' : String(loc.id))}
                          className={`badge ${isScopeActive ? 'badge-primary' : 'badge-active'}`}
                          style={{
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            padding: '4px 9px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            border: isScopeActive ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                            backgroundColor: isScopeActive ? 'var(--brand-primary)' : 'var(--bg-surface)',
                            color: isScopeActive ? '#ffffff' : 'var(--text-primary)',
                            fontWeight: isScopeActive ? 700 : 500,
                            boxShadow: isScopeActive ? '0 0 0 2px rgba(37, 99, 235, 0.25)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{loc.flag || '📍'}</span>
                          <strong>{loc.name}</strong>
                          <span style={{ fontSize: '0.68rem', opacity: isScopeActive ? 0.9 : 0.65 }}>({getLocationTypeLabel(loc.targetType)})</span>
                          {selectedLocations.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (activeLocationScope === String(loc.id)) {
                                  setActiveLocationScope('ALL');
                                }
                                removeLocation(loc.id);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: '2px', display: 'flex', alignItems: 'center', color: isScopeActive ? '#ffffff' : 'var(--text-muted)' }}
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="btn-ghost"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-primary)', fontWeight: 600 }}
                  >
                    <Plus size={13} />
                    <span>Lokasyon Ekle / Değiştir</span>
                  </button>
                </div>
              </div>

              {/* Master-Detail PPC Keyword & Ad Group Manager */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Active Specific Location Scope Notification Banner */}
                {activeLocationScope !== 'ALL' && activeScopeLocation && (
                  <div className="card" style={{ padding: '0.65rem 1rem', backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>📍 Aktif Lokasyon Görünümü:</span>
                      <span className="badge badge-active" style={{ fontSize: '0.8rem', padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span>{activeScopeLocation.flag}</span>
                        <strong>{activeScopeLocation.canonicalName || activeScopeLocation.name}</strong>
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>Pazar Payı: %{activeScopeMetric?.sharePercent ?? 0}</span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>Bölgesel Ort. TBM: ₺{(activeScopeMetric?.avgCpc ?? 0).toFixed(2)}</span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>Arama Havuzu: {(activeScopeMetric?.monthlyVolume ?? 0).toLocaleString('tr-TR')} /ay</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveLocationScope('ALL')}
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <X size={12} />
                      <span>Tüm Lokasyonlara Dön</span>
                    </button>
                  </div>
                )}
                
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
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {activeLocationScope !== 'ALL' && activeScopeLocation ? `${activeScopeLocation.name.toUpperCase()} SEÇİLİ ARAMA HAVUZU` : 'SEÇİLİ TOPLAM ARAMA HAVUZU'}
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {selectedTotalVolume.toLocaleString('tr-TR')} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ay</span>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-surface)' }}>
                    <div style={{ padding: '8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {activeLocationScope !== 'ALL' && activeScopeLocation ? `${activeScopeLocation.name.toUpperCase()} SEÇİLİ ORT. TBM` : 'SEÇİLİ ORTALAMA SAYFA ÜSTÜ TBM'}
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₺{selectedAvgCpc.toFixed(2)}
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
                        {selectedKeywordIds.size} <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ {scopedKeywords.length} (%{Math.round((selectedKeywordIds.size / (scopedKeywords.length || 1)) * 100)})</span>
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
                            if (currentStep === 2) {
                              const pool = step2ApprovedKeywordIds.size > 0 ? step2ApprovedKeywordIds : selectedKeywordIds;
                              setSelectedKeywordIds(new Set(pool));
                            } else {
                              const allIds = new Set(keywords.map(k => k.id));
                              setSelectedKeywordIds(allIds);
                            }
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
                            {currentStep === 2 ? 'Tüm Seçilen Kelimeler' : 'Tüm Kelimeler Havuzu'}
                          </span>
                        </div>
                        <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {currentStep === 2 ? step2WorkingKeywords.length : keywords.length}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span>📈 {selectedTotalVolume.toLocaleString('tr-TR')} arama (Seçili)</span>
                        <span>Seçili: <strong style={{ color: 'var(--brand-primary)' }}>{selectedKeywordIds.size}</strong>/{currentStep === 2 ? step2WorkingKeywords.length : keywords.length}</span>
                      </div>

                      {/* Mini Selection Bar */}
                      <div style={{ height: '3px', width: '100%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${((selectedKeywordIds.size / ((currentStep === 2 ? step2WorkingKeywords.length : keywords.length) || 1)) * 100)}%`, backgroundColor: 'var(--brand-primary)', transition: 'width 0.2s ease' }} />
                      </div>
                    </div>

                    {/* Cluster Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '560px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                      {keywordClusters.filter(cluster => currentStep !== 2 || cluster.keywords.some(k => selectedKeywordIds.has(k.id))).map(cluster => {
                        const isActive = activeClusterId === cluster.id;
                        const clusterSelectedKws = cluster.keywords.filter(k => selectedKeywordIds.has(k.id));
                        const clusterSelectedCount = clusterSelectedKws.length;
                        const clusterSelectedVol = clusterSelectedKws.reduce((s, k) => s + k.monthlyVolume, 0);
                        const clusterSelectedAvgCpc = clusterSelectedKws.length > 0 
                          ? clusterSelectedKws.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0) / clusterSelectedKws.length 
                          : 0;
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
                                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{cluster.icon || '🎯'}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {cluster.name.replace(/^[\p{Emoji}\u200d\s]+/u, '').trim() || cluster.name}
                                </span>
                              </div>
                              
                              <span className="badge badge-neutral" style={{ fontSize: '0.67rem', padding: '1px 5px', flexShrink: 0 }}>
                                {currentStep === 2 ? clusterSelectedCount : cluster.keywords.length}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              <span>📈 {clusterSelectedVol.toLocaleString('tr-TR')} arama • ₺{clusterSelectedAvgCpc.toFixed(2)}</span>
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
                          <span style={{ fontSize: '1.3rem' }}>{currentStep === 2 ? '🎯' : (activeCluster.icon || '✨')}</span>
                          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {currentStep === 2 
                              ? (activeClusterId === 'ALL' ? 'Seçilen Anahtar Kelimeler' : activeCluster.name.replace(/^[\p{Emoji}\u200d\s]+/u, '').trim())
                              : (activeCluster.name.replace(/^[\p{Emoji}\u200d\s]+/u, '').trim() || activeCluster.name)}
                          </span>
                          <span className="badge badge-active" style={{ fontSize: '0.72rem' }}>
                            {activeKeywordsGrid.length} Kelime
                          </span>
                          {currentStep === 2 && (
                            <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.72rem', fontWeight: 700 }}>
                              <CheckCircle2 size={12} /> 2. Adım: Sadece Seçilenler
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {currentStep === 2 
                            ? `Bu adımda yalnızca simülasyona dahil ettiğiniz ${selectedKeywordIds.size} adet seçili kelime yer almaktadır. Listenizi son kez gözden geçirebilir, gerekirse kelimeleri çıkarabilir veya 1. adıma dönerek havuzdan yeni kelimeler ekleyebilirsiniz.`
                            : 'Bu reklam grubundaki tohum anahtar kelimeleri inceleyin, arama niyeti ve hacimlerine göre listenizi düzenleyin.'}
                        </div>
                      </div>

                      {/* Group KPI Badges & Group Action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {(() => {
                          const activeSelectedKws = activeCluster.keywords.filter(k => selectedKeywordIds.has(k.id));
                          const activeSelectedVol = activeSelectedKws.reduce((s, k) => s + k.monthlyVolume, 0);
                          const activeSelectedAvgCpc = activeSelectedKws.length > 0 
                            ? activeSelectedKws.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0) / activeSelectedKws.length 
                            : 0;
                          return (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                                📈 Seçili Hacim: <strong style={{ color: 'var(--text-primary)' }}>{activeSelectedVol.toLocaleString('tr-TR')}</strong>
                              </span>
                              <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                                💵 Seçili Ort. TBM: <strong style={{ color: 'var(--text-primary)' }}>₺{activeSelectedAvgCpc.toFixed(2)}</strong>
                              </span>
                            </div>
                          );
                        })()}

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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {/* Top Filter Row: Search + Source Filters + Intent Pills */}
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

                        {/* Source Filter Pills: ONLY in KEYWORDS mode */}
                        {mode === 'KEYWORDS' && (
                          <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '2px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                            {[
                              { key: 'ALL', label: `Tümü (${activeCluster.keywords.length})` },
                              { key: 'USER_SEED', label: `🎯 Girdiğiniz Tohumlar (${userSeedsCountInView})` },
                              { key: 'EXPANSION', label: `✨ Bunu da Hedefleyebilirsiniz (${expansionCountInView})` }
                            ].map(tab => (
                              <button
                                key={tab.key}
                                type="button"
                                onClick={() => setStep1SourceFilter(tab.key as any)}
                                style={{
                                  padding: '0.25rem 0.55rem',
                                  fontSize: '0.68rem',
                                  fontWeight: step1SourceFilter === tab.key ? 700 : 500,
                                  borderRadius: 'var(--radius-xs)',
                                  border: 'none',
                                  cursor: 'pointer',
                                  backgroundColor: step1SourceFilter === tab.key 
                                    ? (tab.key === 'USER_SEED' ? 'var(--brand-primary)' : (tab.key === 'EXPANSION' ? '#059669' : 'var(--brand-primary)')) 
                                    : 'transparent',
                                  color: step1SourceFilter === tab.key ? '#ffffff' : 'var(--text-secondary)',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        )}

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
                      </div>

                      {/* Second Row: Location + Sort + Quick Bulk Selection Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem', paddingTop: '0.25rem' }}>
                        {/* Quick Selection Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hızlı Seçim:</span>
                          {mode === 'KEYWORDS' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = new Set(selectedKeywordIds);
                                  activeKeywordsGrid.forEach(k => {
                                    const isUser = !!k.isUserSeed || k.source === 'USER_SEED' || k.id?.startsWith('seed_kw_') || k.id?.startsWith('user_seed_');
                                    if (isUser) next.add(k.id);
                                  });
                                  setSelectedKeywordIds(next);
                                }}
                                className="btn-ghost"
                                style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(37, 99, 235, 0.3)', color: 'var(--brand-primary)', fontWeight: 600 }}
                              >
                                🎯 Yalnızca Girdiğim Tohumları Seç
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = new Set(selectedKeywordIds);
                                  activeKeywordsGrid.forEach(k => {
                                    const isUser = !!k.isUserSeed || k.source === 'USER_SEED' || k.id?.startsWith('seed_kw_') || k.id?.startsWith('user_seed_');
                                    if (!isUser) next.add(k.id);
                                  });
                                  setSelectedKeywordIds(next);
                                }}
                                className="btn-ghost"
                                style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#059669', fontWeight: 600 }}
                              >
                                ✨ Yalnızca Ek Önerileri Seç
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const next = new Set(selectedKeywordIds);
                              activeKeywordsGrid.forEach(k => next.add(k.id));
                              setSelectedKeywordIds(next);
                            }}
                            className="btn-ghost"
                            style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                          >
                            Tümünü Seç ({activeKeywordsGrid.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = new Set(selectedKeywordIds);
                              activeKeywordsGrid.forEach(k => next.delete(k.id));
                              setSelectedKeywordIds(next);
                            }}
                            className="btn-ghost"
                            style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 'var(--radius-xs)', color: 'var(--text-muted)' }}
                          >
                            Temizle
                          </button>
                        </div>

                        {/* Location & Sort Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {/* Location Scope Selector Dropdown */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Globe size={13} color="var(--brand-primary)" />
                            <select
                              value={activeLocationScope}
                              onChange={(e) => setActiveLocationScope(e.target.value)}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.55rem',
                                borderRadius: 'var(--radius-xs)',
                                border: activeLocationScope !== 'ALL' ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                                backgroundColor: activeLocationScope !== 'ALL' ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-surface-elevated)',
                                color: activeLocationScope !== 'ALL' ? 'var(--brand-primary)' : 'var(--text-primary)',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              <option value="ALL">🌐 Tüm Lokasyonlar ({selectedLocations.length} Toplam)</option>
                              {selectedLocationsGrouped.map(loc => (
                                <option key={loc.id} value={String(loc.id)}>
                                  {loc.flag || '📍'} {loc.name} ({getLocationTypeLabel(loc.targetType)})
                                </option>
                              ))}
                            </select>
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

                          {/* TBM Imputation Multipliers Button */}
                          <button
                            type="button"
                            onClick={() => setShowCpcSettingsModal(true)}
                            className="btn-secondary"
                            title="Google açık artırma verisi bulunmayan düşük hacimli kelimelerin TBM çarpanlarını özelleştirin"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.74rem',
                              padding: '0.35rem 0.65rem',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px solid rgba(139, 92, 246, 0.35)',
                              backgroundColor: 'rgba(139, 92, 246, 0.08)',
                              color: '#8b5cf6',
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <SlidersHorizontal size={13} />
                            <span>TBM Çarpanları</span>
                            <span style={{ fontSize: '0.62rem', backgroundColor: '#8b5cf6', color: '#fff', borderRadius: '10px', padding: '1px 5px' }}>
                              {Number(cpcImputationSettings.transactionalMultiplier || 1.15).toFixed(2)}x
                            </span>
                          </button>

                          {/* Add Custom Keyword to this Group */}
                          <div style={{ display: 'flex', gap: '0.3rem', minWidth: '180px' }}>
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
                            <th style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: 'var(--text-secondary)', width: '180px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>AYLIK HACİM</span>
                                {activeScopeLocation && (
                                  <span className="badge badge-primary" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                                    {activeScopeLocation.flag} {activeScopeLocation.name}
                                  </span>
                                )}
                              </div>
                            </th>
                            <th style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '190px', width: '200px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>SAYFA ÜSTÜ TBM</span>
                                {activeScopeLocation && (
                                  <span className="badge badge-primary" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                                    {activeScopeLocation.flag} {activeScopeLocation.name}
                                  </span>
                                )}
                              </div>
                            </th>
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
                              const isUserSeed = !!kw.isUserSeed || kw.source === 'USER_SEED' || kw.id?.startsWith('seed_kw_') || kw.id?.startsWith('user_seed_');
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
                                      
                                      {/* Seed vs Expansion Badges (Only in KEYWORDS mode) */}
                                      {mode === 'KEYWORDS' && (
                                        isUserSeed ? (
                                          <span
                                            style={{
                                              fontSize: '0.62rem',
                                              padding: '1px 6px',
                                              borderRadius: '3px',
                                              fontWeight: 700,
                                              backgroundColor: 'rgba(37, 99, 235, 0.12)',
                                              color: 'var(--brand-primary)',
                                              border: '1px solid rgba(37, 99, 235, 0.25)',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '2px'
                                            }}
                                            title="Sizin doğrudan girdiğiniz tohum anahtar kelime"
                                          >
                                            🎯 Girdiğiniz Tohum
                                          </span>
                                        ) : (
                                          <span
                                            style={{
                                              fontSize: '0.62rem',
                                              padding: '1px 6px',
                                              borderRadius: '3px',
                                              fontWeight: 600,
                                              backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                              color: '#059669',
                                              border: '1px solid rgba(16, 185, 129, 0.25)',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '2px'
                                            }}
                                            title="Google Ads API & AI tarafından arama grafiğinden keşfedilen ek öneri"
                                          >
                                            ✨ Bunu da Hedefleyebilirsiniz
                                          </span>
                                        )
                                      )}

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
                                          title="Yüksek dönüşümlü satın alma terimi"
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

                                  {/* Volume with Inline Visual Bar & Hover Breakdown Tooltip */}
                                  <td 
                                    style={{ padding: '0.5rem 0.75rem', position: 'relative' }}
                                    onMouseEnter={() => setHoveredKwGeoId(kw.id)}
                                    onMouseLeave={() => setHoveredKwGeoId(null)}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${volumePercent}%`, backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--text-muted)', borderRadius: '3px' }} />
                                      </div>
                                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: '55px', textAlign: 'right' }}>
                                        {kw.monthlyVolume.toLocaleString('tr-TR')}
                                      </span>
                                    </div>

                                    {/* Regional Breakdown Popover on Hover */}
                                    {hoveredKwGeoId === kw.id && selectedLocations.length > 1 && (
                                      <div style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        right: 0,
                                        marginBottom: '6px',
                                        backgroundColor: 'var(--bg-surface-elevated)',
                                        border: '1px solid var(--border-default)',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: '0.65rem 0.85rem',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.35), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
                                        zIndex: 50,
                                        minWidth: '240px',
                                        maxWidth: '300px',
                                        pointerEvents: 'none'
                                      }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.3rem' }}>
                                          <span>🌍 Bölgesel Arama Dağılımı</span>
                                          <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
                                            {activeLocationScope === 'ALL' ? kw.monthlyVolume.toLocaleString('tr-TR') : `${kw.monthlyVolume.toLocaleString('tr-TR')} (${activeScopeLocation?.name})`}
                                          </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '220px', overflowY: 'auto' }}>
                                          {countryBreakdown.map(loc => {
                                            const cleanId = String(loc.id).replace(/[^0-9]/g, "");
                                            const officialKw = keywords.find(k => k.id === kw.id) || kw;
                                            const exactLocVol = officialKw.geoVolumes ? (
                                              officialKw.geoVolumes[cleanId] !== undefined ? officialKw.geoVolumes[cleanId] :
                                              (officialKw.geoVolumes[String(loc.id)] !== undefined ? officialKw.geoVolumes[String(loc.id)] :
                                              officialKw.geoVolumes["geoTargetConstants/" + cleanId])
                                            ) : undefined;
                                            const locVol = exactLocVol !== undefined ? exactLocVol : 0;
                                            const totalVol = officialKw.monthlyVolume || 1;
                                            const exactShare = totalVol > 0 ? Math.round((locVol / totalVol) * 100) : 0;
                                            const isThisLocActive = activeLocationScope === String(loc.id) || activeLocationScope === cleanId;
                                            return (
                                              <div key={loc.code + loc.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', gap: '0.5rem', fontWeight: isThisLocActive ? 700 : 400, color: isThisLocActive ? 'var(--brand-primary)' : 'inherit' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                  <span>{loc.flag}</span>
                                                  <span style={{ color: isThisLocActive ? 'var(--brand-primary)' : 'var(--text-secondary)' }}>{loc.name}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                                  <span style={{ fontWeight: 600, color: isThisLocActive ? 'var(--brand-primary)' : (locVol > 0 ? 'var(--text-primary)' : 'var(--text-muted)') }}>{locVol.toLocaleString('tr-TR')}</span>
                                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>(%{exactShare})</span>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </td>

                                  {/* Top of page CPC */}
                                  <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>
                                    {kw.isCpcEstimated ? (
                                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                          ≈ ₺{kw.lowCpc.toFixed(2)} - ₺{kw.highCpc.toFixed(2)}
                                        </span>
                                        <span 
                                          title={`Google açık artırma verisi az olduğundan, '${kw.cpcEstimationCluster || activeCluster.name}' kümesi ortalaması ve ${kw.cpcEstimationMultiplier || (kw.intent === 'TRANSACTIONAL' ? cpcImputationSettings.transactionalMultiplier : kw.intent === 'INFORMATIONAL' ? cpcImputationSettings.informationalMultiplier : cpcImputationSettings.commercialMultiplier) || 1.0}x niyet çarpanı ile hesaplanmıştır.\n\nOrijinal TBM: ₺${(kw.rawLowCpc ?? 0).toFixed(2)} - ₺${(kw.rawHighCpc ?? 0).toFixed(2)}\nUygulanan Çarpan: ${kw.cpcEstimationMultiplier || (kw.intent === 'TRANSACTIONAL' ? cpcImputationSettings.transactionalMultiplier : kw.intent === 'INFORMATIONAL' ? cpcImputationSettings.informationalMultiplier : cpcImputationSettings.commercialMultiplier) || 1.0}x\nNiyet: ${kw.intent}`} 
                                          style={{ 
                                            fontSize: '0.62rem', 
                                            fontWeight: 600, 
                                            padding: '1px 5px', 
                                            borderRadius: '3px', 
                                            backgroundColor: 'rgba(139, 92, 246, 0.12)', 
                                            color: '#8b5cf6',
                                            border: '1px solid rgba(139, 92, 246, 0.22)',
                                            cursor: 'help',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '2px',
                                            lineHeight: '1.1',
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          <span>Tahmin</span>
                                          <span style={{ fontWeight: 700 }}>
                                            ({Number(kw.cpcEstimationMultiplier || (kw.intent === 'TRANSACTIONAL' ? cpcImputationSettings.transactionalMultiplier : kw.intent === 'INFORMATIONAL' ? cpcImputationSettings.informationalMultiplier : cpcImputationSettings.commercialMultiplier) || 1.0).toFixed(2)}x)
                                          </span>
                                        </span>
                                      </div>
                                    ) : kw.lowCpc > 0 ? (
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                        ₺{kw.lowCpc.toFixed(2)} - ₺{kw.highCpc.toFixed(2)}
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                        ₺0.00 - ₺0.00
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
                        Toplam Seçili Havuz: <strong style={{ color: 'var(--brand-primary)' }}>{selectedKeywordIds.size} / {currentStep === 2 ? step2WorkingKeywords.length : keywords.length}</strong>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Step 1 & Step 2 Bottom Action Bar */}
                <div className="card" style={{ padding: '0.85rem 1.25rem', backgroundColor: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  
                  {/* Left Side Info / Back Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {currentStep === 2 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="btn-secondary"
                        style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                      >
                        <ArrowLeft size={14} />
                        <span>1. Adıma Dön (Daha Fazla Kelime Ekle)</span>
                      </button>
                    ) : (
                      <div style={{ padding: '6px 10px', borderRadius: 'var(--radius-xs)', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                        {selectedKeywordIds.size} Kelime Seçildi
                      </div>
                    )}

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Aylık Toplam Hacim: <strong>{totalSearchVolume.toLocaleString('tr-TR')} arama</strong> • Ort. TBM: <strong style={{ color: 'var(--brand-primary)' }}>₺{selectedAvgCpc.toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* Right Side Forward Button */}
                  {currentStep === 1 ? (
                    <button
                      onClick={() => {
                        setStep2ApprovedKeywordIds(new Set(selectedKeywordIds));
                        setIsStep1Completed(true);
                        setCurrentStep(2);
                      }}
                      disabled={selectedKeywordIds.size === 0}
                      className="btn-primary"
                      style={{ 
                        fontSize: '0.85rem', 
                        padding: '0.55rem 1.35rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.45rem',
                        fontWeight: 600
                      }}
                    >
                      <span>Seçilenleri İncele & Yapılandır ({selectedKeywordIds.size})</span>
                      <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        let b = monthlyBudget;
                        if (b <= 0) {
                          const selVol = totalSearchVolume;
                          const avgCpc = avgTopPageCpc > 0 ? avgTopPageCpc : 12.0;
                          b = Math.max(25000, Math.round((selVol > 0 ? selVol : 1000) * 0.15 * avgCpc * 2));
                          setMonthlyBudget(b);
                        }
                        setIsStep2Completed(true);
                        setCurrentStep(3);
                        // sync after state update or pass explicit update
                        setTimeout(() => {
                          syncActiveSubCampaign();
                        }, 50);
                      }}
                      disabled={selectedKeywordIds.size === 0}
                      className="btn-primary"
                      style={{ 
                        fontSize: '0.85rem', 
                        padding: '0.55rem 1.35rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.45rem',
                        fontWeight: 600,
                        backgroundColor: '#10b981'
                      }}
                    >
                      <span>Kaydet ve Simülatöre Geç ({selectedKeywordIds.size})</span>
                      <ArrowRight size={15} />
                    </button>
                  )}
                </div>

              </div>

            </div>
            )
          )}
        </>
      )}

          {/* ========================================================================= */}
          {/* STEP 3 VIEW: Omnichannel & Platform Dedicated Studios                     */}
          {/* ========================================================================= */}
          {subCampaigns.length > 0 && (currentStep === 3 || !isGoogleSearchActive) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Step 2 Quick Context & Strategic Growth Scenario Selector Bar */}
              <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--bg-surface)' }}>
                
                {/* Left: Summary Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {activeChannelTab === 'OMNICHANNEL' && '360° Medya Karması & Konsolide Büyüme Simülatörü'}
                      {activeChannelTab === 'GOOGLE_SEARCH' && 'Google Search (Arama Ağı) Performans Projeksiyonu'}
                      {activeChannelTab === 'META_ADS' && 'Meta Ads (Facebook & Instagram) Performans Projeksiyonu'}
                      {activeChannelTab === 'YOUTUBE' && 'YouTube Video & Shorts Performans Projeksiyonu'}
                      {activeChannelTab === 'GDN' && 'Google GDN (Görüntülü Reklam) Performans Projeksiyonu'}
                      {activeChannelTab === 'NEGATIVES' && 'AI Negatif Kelime Kalkanı'}
                    </span>
                    <span className="badge badge-active" style={{ fontSize: '0.72rem' }}>
                      {activeChannelTab === 'OMNICHANNEL' && '📊 360° Konsolide'}
                      {activeChannelTab === 'GOOGLE_SEARCH' && '🔍 Google Arama'}
                      {activeChannelTab === 'META_ADS' && '📱 Meta Ads'}
                      {activeChannelTab === 'YOUTUBE' && '🎬 YouTube Video'}
                      {activeChannelTab === 'GDN' && '🌐 Google GDN'}
                      {activeChannelTab === 'NEGATIVES' && '🛡️ Negatif Koruma'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span>Dil: <strong>{effectiveLanguage.name}</strong></span>
                    <span>•</span>
                    <span>Aylık Bütçe: <strong>₺{monthlyBudget.toLocaleString('tr-TR')}</strong></span>
                    <span>•</span>
                    <span>Hedef Bölgeler: <strong>{selectedLocationsGrouped.map(l => (l.flag || '📍') + ' ' + (l.canonicalName || l.name)).join(', ')}</strong></span>
                  </div>
                </div>

                {/* Right: Strategic Growth Scenario 3-Toggle Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div 
                    style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
                    onMouseEnter={() => setShowScenarioTooltip(true)}
                    onMouseLeave={() => setShowScenarioTooltip(false)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        🎯 Büyüme Senaryosu:
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowScenarioTooltip(prev => !prev)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: 'rgba(37, 99, 235, 0.12)',
                          color: 'var(--brand-primary)',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title="Büyüme Senaryosu Bilgi"
                      >
                        <Info size={11} />
                      </button>
                    </div>

                    {showScenarioTooltip && (
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: '-20px',
                        width: '340px',
                        padding: '0.9rem 1rem',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.25), 0 8px 12px -6px rgba(0, 0, 0, 0.15)',
                        zIndex: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.55rem',
                        fontSize: '0.75rem',
                        lineHeight: 1.45,
                        color: 'var(--text-secondary)'
                      }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>🎯</span> Büyüme Senaryosu Projeksiyon Modeli
                        </div>
                        <div style={{ fontSize: '0.74rem' }}>
                          Pazar rekabeti, risk toleransı ve açılış sayfası performansına göre tüm kanallardaki <strong>TBM maliyetlerini</strong> ve <strong>dönüşüm oranlarını</strong> dinamik olarak çarpar:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div style={{ padding: '0.4rem 0.55rem', backgroundColor: 'rgba(100, 116, 139, 0.08)', borderRadius: 'var(--radius-xs)', borderLeft: '3px solid #64748b' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>🛡️ Muhafazakar:</strong> Maliyetler +%15 artırılır, dönüşüm oranları -%15 temkinli tutulur. <em>(Taban / En Kötü Durum Projeksiyonu)</em>
                          </div>
                          <div style={{ padding: '0.4rem 0.55rem', backgroundColor: 'rgba(37, 99, 235, 0.08)', borderRadius: 'var(--radius-xs)', borderLeft: '3px solid var(--brand-primary)' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>⚖️ Beklenen:</strong> Google Ads pazar medyanı ve sektörün baz metrikleri (1.0x) kullanılır. <em>(Standart Pazar Projeksiyonu)</em>
                          </div>
                          <div style={{ padding: '0.4rem 0.55rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-xs)', borderLeft: '3px solid #10b981' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>🚀 Agresif:</strong> Yüksek reklam alaka düzeyi & optimize açılış sayfası varsayılır; dönüşüm +%20, nitelikli lead +%15 artırılır. <em>(Büyüme & Ölçeklenme Projeksiyonu)</em>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)', paddingTop: '0.45rem' }}>
                          💡 <em>Google Ads'in TBM verisi veremediği niş kelimeler de dahil olmak üzere seçili pazar rayici bu senaryo çarpanıyla modellenir.</em>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {[
                    { id: 'CONSERVATIVE', label: '🛡️ Muhafazakar', desc: 'Temkinli Projeksiyon (-15% CR, +15% Maliyet)', color: '#64748b' },
                    { id: 'REALISTIC', label: '⚖️ Beklenen', desc: 'Sektör & Pazar Medyanı (1.0x)', color: 'var(--brand-primary)' },
                    { id: 'AGGRESSIVE', label: '🚀 Agresif', desc: 'Optimizasyon & Ölçeklenme (+20% CR, +15% Nitelikli Lead)', color: '#10b981' }
                  ].map(sc => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setGrowthScenario(sc.id as GrowthScenario)}
                      title={sc.desc}
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.8rem',
                        borderRadius: 'var(--radius-xs)',
                        border: growthScenario === sc.id ? `1.5px solid ${sc.color}` : '1px solid var(--border-default)',
                        backgroundColor: growthScenario === sc.id ? (sc.id === 'CONSERVATIVE' ? 'rgba(100, 116, 139, 0.15)' : (sc.id === 'AGGRESSIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(37, 99, 235, 0.15)')) : 'var(--bg-surface-elevated)',
                        color: growthScenario === sc.id ? (sc.id === 'CONSERVATIVE' ? '#475569' : (sc.id === 'AGGRESSIVE' ? '#10b981' : 'var(--brand-primary)')) : 'var(--text-secondary)',
                        fontWeight: growthScenario === sc.id ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: growthScenario === sc.id ? `0 0 0 1px ${sc.color}` : 'none'
                      }}
                    >
                      {sc.label}
                    </button>
                  ))}

                  <div style={{ display: 'flex', gap: '0.45rem', marginLeft: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      className="btn-ghost"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--brand-primary)', fontWeight: 600 }}
                    >
                      <Globe size={13} />
                      <span>Lokasyon ({selectedLocations.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenExportModal(activeSubCampaign, 'PDF')}
                      className="btn-secondary"
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.35rem 0.75rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem', 
                        fontWeight: 600,
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        borderColor: 'rgba(37, 99, 235, 0.25)',
                        color: 'var(--brand-primary)'
                      }}
                      title="Raporu Özelleştir ve PDF / CSV formatında dışa aktar"
                    >
                      <SlidersHorizontal size={13} />
                      <span>Rapor Özelleştir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportSubCampaignPdf()}
                      className="btn-ghost"
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.35rem 0.55rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.3rem', 
                        fontWeight: 600,
                        color: 'var(--brand-primary)'
                      }}
                      title="PDF Raporu Özelleştir & Aç"
                    >
                      <FileText size={13} />
                      <span>PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportSubCampaignCsv()}
                      className="btn-ghost"
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.35rem 0.55rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.3rem', 
                        fontWeight: 600,
                        color: 'var(--text-secondary)'
                      }}
                      title="CSV Raporu Özelleştir & İndir"
                    >
                      <Download size={13} />
                      <span>CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSavePlan}
                      className="btn-primary"
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.35rem 0.75rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem', 
                        fontWeight: 600,
                        backgroundColor: (planSaveSuccess || isStep3Completed) ? '#10b981' : undefined
                      }}
                    >
                      {planSaveSuccess || isStep3Completed ? <Check size={13} /> : <Save size={13} />}
                      <span>{planSaveSuccess ? 'Alt Kampanya Kaydedildi!' : (isStep3Completed ? 'Alt Kampanya Kayıtlı' : 'Alt Kampanyayı Kaydet')}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Business Model & Goal Selector */}
              <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--bg-surface-elevated)' }}>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    🏢 İş Modeli & Kampanya Hedefi
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    İşletmenizin türüne uygun performans metriklerini ve projeksiyon modelini seçin.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'LEAD_GEN', label: '🎯 Potansiyel Müşteri & Talep (B2B, Gayrimenkul, Hizmet)' },
                    { id: 'ECOMMERCE', label: '🛒 E-Ticaret & Online Sipariş' },
                    { id: 'BRAND_REACH', label: '👁️ Pazar Hakimiyeti & Trafik' },
                  ].map(bm => (
                    <button
                      key={bm.id}
                      type="button"
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

              {/* Channel Selector Sub-Tabs (Filtered per active campaign type) */}
              {(isGoogleSearchActive || activeChannelTab === 'OMNICHANNEL') && (
                <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.65rem', overflowX: 'auto' }}>
                  {(activeChannelTab === 'OMNICHANNEL' ? [
                    { id: 'OMNICHANNEL', label: '360° Medya Karması (Omnichannel)', icon: <OmnichannelIcon size={16} /> },
                    { id: 'SAVED_PLANS', label: `Kayıtlı Planlar (${savedPlans.length})`, icon: <FolderDown size={15} /> }
                  ] : [
                    { id: 'GOOGLE_SEARCH', label: 'Google Search (Arama Ağı)', icon: <GoogleIcon size={16} /> },
                    { id: 'NEGATIVES', label: `AI Negatif Kalkanı (${negativeCategories.reduce((a, c) => a + c.words.length, 0)})`, icon: <ShieldAlert size={15} /> },
                  ]).map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveChannelTab(tab.id as ChannelType);
                        if (tab.id === 'SAVED_PLANS') loadSavedPlans();
                      }}
                      style={{
                        padding: '0.5rem 0.95rem',
                        fontSize: '0.825rem',
                        borderRadius: 'var(--radius-xs)',
                        border: activeChannelTab === tab.id ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                        backgroundColor: activeChannelTab === tab.id ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface)',
                        color: activeChannelTab === tab.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                        fontWeight: activeChannelTab === tab.id ? 700 : 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              )}

          {/* ========================================================================= */}
          {/* CHANNEL 1: 360° OMNICHANNEL CONSOLIDATED MEDIA MIX                        */}
          {/* ========================================================================= */}
          {activeChannelTab === 'OMNICHANNEL' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
              
              {/* Left Column: Budget Allocation Sliders & Presets */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Çok Kanallı Bütçe Dağılımı & Medya Karması
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Toplam bütçeyi reklam kanallarına paylaştırın ve konsolide sağlıklı lead hacmini simüle edin.
                  </div>
                </div>

                {/* Total Monthly Budget */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Toplam Aylık Medya Bütçesi
                      </label>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Günlük ortalama: <strong>₺{Math.round((monthlyBudget || 0) / 30.4).toLocaleString('tr-TR')}</strong> / gün
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-secondary)' }}>₺</span>
                      <input
                        type="number"
                        min={0}
                        max={10000000}
                        step={500}
                        value={monthlyBudget === 0 ? '' : monthlyBudget}
                        placeholder="0"
                        onChange={(e) => {
                          const val = e.target.value;
                          setMonthlyBudget(val === '' ? 0 : Math.max(0, Number(val)));
                        }}
                        style={{
                          width: '120px',
                          padding: '3px 8px',
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                  {(() => {
                    const maxBudgetSlider = Math.max(500000, Math.round((monthlyBudget || 35000) * 1.5));
                    const fillPercent = maxBudgetSlider > 0 ? Math.min(100, Math.max(0, Math.round(((monthlyBudget || 0) / maxBudgetSlider) * 100))) : 0;
                    return (
                      <>
                        <input
                          type="range"
                          min={0}
                          max={maxBudgetSlider}
                          step={500}
                          value={monthlyBudget || 0}
                          onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                          style={{
                            width: '100%',
                            accentColor: '#2563eb',
                            cursor: 'pointer',
                            background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${fillPercent}%, var(--border-default) ${fillPercent}%, var(--border-default) 100%)`,
                            height: '6px',
                            borderRadius: 'var(--radius-full)'
                          }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Hızlı Bütçe:</span>
                          {[
                            { label: '₺5.000', val: 5000 },
                            { label: '₺15.000', val: 15000 },
                            { label: '₺35.000', val: 35000 },
                            { label: '₺75.000', val: 75000 },
                            { label: '₺150.000', val: 150000 },
                            { label: '₺300.000', val: 300000 }
                          ].map(chip => (
                            <button
                              key={chip.label}
                              type="button"
                              onClick={() => setMonthlyBudget(chip.val)}
                              style={{
                                padding: '2px 7px',
                                fontSize: '0.68rem',
                                borderRadius: 'var(--radius-xs)',
                                border: monthlyBudget === chip.val ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                                backgroundColor: monthlyBudget === chip.val ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface-elevated)',
                                color: monthlyBudget === chip.val ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: monthlyBudget === chip.val ? 700 : 500
                              }}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Quick Presets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Stratejik Dağılım Önayarları:</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    <button
                      onClick={() => { setAllocGoogleSearch(50); setAllocMetaAds(30); setAllocYouTube(10); setAllocGdn(10); }}
                      className="btn-ghost"
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', textAlign: 'left' }}
                    >
                      ⚖️ <strong>Dengeli (50/30/10/10)</strong>
                    </button>
                    <button
                      onClick={() => { setAllocGoogleSearch(70); setAllocMetaAds(20); setAllocYouTube(5); setAllocGdn(5); }}
                      className="btn-ghost"
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', textAlign: 'left' }}
                    >
                      🔍 <strong>Google Odaklı (70/20/5/5)</strong>
                    </button>
                    <button
                      onClick={() => { setAllocGoogleSearch(25); setAllocMetaAds(60); setAllocYouTube(10); setAllocGdn(5); }}
                      className="btn-ghost"
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', textAlign: 'left' }}
                    >
                      📱 <strong>Meta Lead Odaklı (25/60/10/5)</strong>
                    </button>
                    <button
                      onClick={() => { setAllocGoogleSearch(30); setAllocMetaAds(30); setAllocYouTube(25); setAllocGdn(15); }}
                      className="btn-ghost"
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', textAlign: 'left' }}
                    >
                      🚀 <strong>Marka Büyüme (30/30/25/15)</strong>
                    </button>
                  </div>
                </div>

                {/* Total Distribution Progress Bar & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Bütçe Dağılım Dengesi:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {(allocGoogleSearch + allocMetaAds + allocYouTube + allocGdn) === 100 ? '✓ Tam Dengeli (%100)' : `⚠️ Toplam: %${allocGoogleSearch + allocMetaAds + allocYouTube + allocGdn}`}
                    </span>
                  </div>
                  {/* Gradient Progress Bar */}
                  <div style={{ height: '8px', width: '100%', borderRadius: 'var(--radius-full)', overflow: 'hidden', background: 'linear-gradient(90deg, #93c5fd 0%, #60a5fa 25%, #3b82f6 50%, #2563eb 75%, #1d4ed8 100%)' }} />
                </div>

                {/* Individual Channel Sliders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                  
                  {/* Google Search Allocation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <GoogleIcon size={15} /> Google Search (%{allocGoogleSearch})
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                          (₺{Math.round(omnichannelMix.googleSearchSpend / 30.4).toLocaleString('tr-TR')}/gün)
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>₺</span>
                        <input
                          type="number"
                          min={0}
                          max={Math.max(10000000, monthlyBudget)}
                          step={250}
                          value={Math.round(omnichannelMix.googleSearchSpend) === 0 ? '' : Math.round(omnichannelMix.googleSearchSpend)}
                          placeholder="0"
                          onChange={(e) => {
                            const newSpend = e.target.value === '' ? 0 : Number(e.target.value);
                            const currentGoogleSpend = Math.round((monthlyBudget * allocGoogleSearch) / 100);
                            const otherSpend = Math.max(0, monthlyBudget - currentGoogleSpend);
                            if (otherSpend > 0) {
                              const newTotal = newSpend + otherSpend;
                              setMonthlyBudget(newTotal);
                              const newAlloc = newTotal > 0 ? Math.max(1, Math.min(100, Math.round((newSpend / newTotal) * 100))) : 50;
                              updateChannelAllocation('google', newAlloc);
                            } else {
                              const alloc = allocGoogleSearch > 0 ? allocGoogleSearch : 50;
                              const newTotal = Math.round(newSpend / (alloc / 100));
                              setMonthlyBudget(newTotal);
                            }
                          }}
                          style={{
                            width: '82px',
                            padding: '2px 5px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textAlign: 'right',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-default)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={allocGoogleSearch}
                      onChange={(e) => updateChannelAllocation('google', Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: '#2563eb',
                        cursor: 'pointer',
                        background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${allocGoogleSearch}%, var(--border-default) ${allocGoogleSearch}%, var(--border-default) 100%)`,
                        height: '6px',
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
                  </div>

                  {/* Meta Ads Allocation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MetaIcon size={15} /> Meta Ads (FB & IG) (%{allocMetaAds})
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                          (₺{Math.round(omnichannelMix.metaAdsSpend / 30.4).toLocaleString('tr-TR')}/gün)
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>₺</span>
                        <input
                          type="number"
                          min={0}
                          max={Math.max(10000000, monthlyBudget)}
                          step={250}
                          value={Math.round(omnichannelMix.metaAdsSpend) === 0 ? '' : Math.round(omnichannelMix.metaAdsSpend)}
                          placeholder="0"
                          onChange={(e) => {
                            const newSpend = e.target.value === '' ? 0 : Number(e.target.value);
                            const currentMetaSpend = Math.round((monthlyBudget * allocMetaAds) / 100);
                            const otherSpend = Math.max(0, monthlyBudget - currentMetaSpend);
                            if (otherSpend > 0) {
                              const newTotal = newSpend + otherSpend;
                              setMonthlyBudget(newTotal);
                              const newAlloc = newTotal > 0 ? Math.max(1, Math.min(100, Math.round((newSpend / newTotal) * 100))) : 30;
                              updateChannelAllocation('meta', newAlloc);
                            } else {
                              const alloc = allocMetaAds > 0 ? allocMetaAds : 30;
                              const newTotal = Math.round(newSpend / (alloc / 100));
                              setMonthlyBudget(newTotal);
                            }
                          }}
                          style={{
                            width: '82px',
                            padding: '2px 5px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textAlign: 'right',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-default)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={allocMetaAds}
                      onChange={(e) => updateChannelAllocation('meta', Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: '#2563eb',
                        cursor: 'pointer',
                        background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${allocMetaAds}%, var(--border-default) ${allocMetaAds}%, var(--border-default) 100%)`,
                        height: '6px',
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
                  </div>

                  {/* YouTube Allocation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <YouTubeIcon size={15} /> YouTube Video (%{allocYouTube})
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                          (₺{Math.round(omnichannelMix.youtubeSpend / 30.4).toLocaleString('tr-TR')}/gün)
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>₺</span>
                        <input
                          type="number"
                          min={0}
                          max={Math.max(10000000, monthlyBudget)}
                          step={250}
                          value={Math.round(omnichannelMix.youtubeSpend) === 0 ? '' : Math.round(omnichannelMix.youtubeSpend)}
                          placeholder="0"
                          onChange={(e) => {
                            const newSpend = e.target.value === '' ? 0 : Number(e.target.value);
                            const currentSpend = Math.round((monthlyBudget * allocYouTube) / 100);
                            const otherSpend = Math.max(0, monthlyBudget - currentSpend);
                            if (otherSpend > 0) {
                              const newTotal = newSpend + otherSpend;
                              setMonthlyBudget(newTotal);
                              const newAlloc = newTotal > 0 ? Math.max(1, Math.min(100, Math.round((newSpend / newTotal) * 100))) : 10;
                              updateChannelAllocation('youtube', newAlloc);
                            } else {
                              const alloc = allocYouTube > 0 ? allocYouTube : 10;
                              const newTotal = Math.round(newSpend / (alloc / 100));
                              setMonthlyBudget(newTotal);
                            }
                          }}
                          style={{
                            width: '82px',
                            padding: '2px 5px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textAlign: 'right',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-default)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={allocYouTube}
                      onChange={(e) => updateChannelAllocation('youtube', Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: '#2563eb',
                        cursor: 'pointer',
                        background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${allocYouTube}%, var(--border-default) ${allocYouTube}%, var(--border-default) 100%)`,
                        height: '6px',
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
                  </div>

                  {/* GDN Allocation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <GdnIcon size={15} /> Google GDN (%{allocGdn})
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                          (₺{Math.round(omnichannelMix.gdnSpend / 30.4).toLocaleString('tr-TR')}/gün)
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>₺</span>
                        <input
                          type="number"
                          min={0}
                          max={Math.max(10000000, monthlyBudget)}
                          step={250}
                          value={Math.round(omnichannelMix.gdnSpend) === 0 ? '' : Math.round(omnichannelMix.gdnSpend)}
                          placeholder="0"
                          onChange={(e) => {
                            const newSpend = e.target.value === '' ? 0 : Number(e.target.value);
                            const currentSpend = Math.round((monthlyBudget * allocGdn) / 100);
                            const otherSpend = Math.max(0, monthlyBudget - currentSpend);
                            if (otherSpend > 0) {
                              const newTotal = newSpend + otherSpend;
                              setMonthlyBudget(newTotal);
                              const newAlloc = newTotal > 0 ? Math.max(1, Math.min(100, Math.round((newSpend / newTotal) * 100))) : 10;
                              updateChannelAllocation('gdn', newAlloc);
                            } else {
                              const alloc = allocGdn > 0 ? allocGdn : 10;
                              const newTotal = Math.round(newSpend / (alloc / 100));
                              setMonthlyBudget(newTotal);
                            }
                          }}
                          style={{
                            width: '82px',
                            padding: '2px 5px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textAlign: 'right',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-default)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={allocGdn}
                      onChange={(e) => updateChannelAllocation('gdn', Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: '#2563eb',
                        cursor: 'pointer',
                        background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${allocGdn}%, var(--border-default) ${allocGdn}%, var(--border-default) 100%)`,
                        height: '6px',
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
                  </div>

                </div>

                <button
                  onClick={handleSavePlan}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.65rem',
                    fontSize: '0.85rem'
                  }}
                >
                  {planSaveSuccess ? <Check size={16} /> : <Save size={16} />}
                  {planSaveSuccess ? '360° Medya Planı Kaydedildi!' : '360° Medya Planını Çalışma Alanına Kaydet'}
                </button>

              </div>

              {/* Right Column: 360 Consolidated Projections & Breakdown Table */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      360° Konsolide Kampanya Çıktıları
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Tüm kanalların birleşimiyle elde edilecek toplam erişim, lead ve gelir simülasyonu.
                    </div>
                  </div>
                  <span className="badge" style={{ fontSize: '0.75rem' }}>
                    4 Kanal Entegre
                  </span>
                </div>

                {/* 4 Core Consolidated KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  
                  {/* Total Impressions */}
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Toplam Gösterim & Erişim</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {omnichannelMix.totalImpressions.toLocaleString('tr-TR')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Tüm kanallarda aylık marka görünürlüğü
                    </div>
                  </div>

                  {/* Total Clicks & Web Traffic */}
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Toplam Tıklama & Ziyaretçi</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {omnichannelMix.totalClicks.toLocaleString('tr-TR')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Karma TO: %{omnichannelMix.blendedCtr} • Günlük {Math.max(1, Math.round(omnichannelMix.totalClicks / 30.4))} Ziyaret
                    </div>
                  </div>

                  {/* Total Gross Leads */}
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Toplam Brüt Form & Talep</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {omnichannelMix.totalGrossLeads.toLocaleString('tr-TR')} Lead
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Ortalama CPL: ₺{omnichannelMix.totalGrossLeads > 0 ? Math.round(monthlyBudget / omnichannelMix.totalGrossLeads) : 0} / talep
                    </div>
                  </div>

                  {/* Total Healthy / Qualified Leads */}
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SAĞLIKLI LEAD (MQL)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {omnichannelMix.totalHealthyLeads.toLocaleString('tr-TR')} Nitelikli
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Sağlıklı Lead Başı Maliyet (CPQL): <strong>₺{omnichannelMix.blendedCpql}</strong>
                    </div>
                  </div>

                </div>

                {/* Consolidated ROAS & Revenue Box - Only displayed for ECOMMERCE */}
                {businessModel === 'ECOMMERCE' && (
                  <div style={{
                    padding: '1.15rem',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Konsolide Projeksiyon ROAS
                      </div>
                      <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {omnichannelMix.blendedRoas}x
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Tahmini Satış: <strong>{omnichannelMix.totalDeals} Sipariş</strong> • CPA / CAC: <strong>₺{omnichannelMix.blendedCac}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toplam Beklenen Ciro</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        ₺{omnichannelMix.totalRevenue.toLocaleString('tr-TR')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Net Kâr: ₺{(omnichannelMix.totalRevenue - monthlyBudget).toLocaleString('tr-TR')}</div>
                    </div>
                  </div>
                )}

                {/* Channel-by-Channel Breakdown Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    📋 Kanal Bazlı Performans Karşılaştırma Matrisi:
                  </span>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ fontSize: '0.75rem' }}>
                      <thead>
                        <tr>
                          <th>Kanal</th>
                          <th>Bütçe</th>
                          <th style={{ textAlign: 'right' }}>Gösterim</th>
                          <th style={{ textAlign: 'right' }}>Tıklama</th>
                          <th style={{ textAlign: 'right' }}>Birim Maliyet</th>
                          <th style={{ textAlign: 'right' }}>Sağlıklı Lead</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                              <GoogleIcon size={14} /> Google Search
                            </div>
                          </td>
                          <td>₺{omnichannelMix.googleSearchSpend.toLocaleString('tr-TR')} (%{allocGoogleSearch})</td>
                          <td style={{ textAlign: 'right' }}>{Math.round(simulation.estImpressions * (allocGoogleSearch / 100)).toLocaleString('tr-TR')}</td>
                          <td style={{ textAlign: 'right' }}>{Math.round(simulation.estClicks * (allocGoogleSearch / 100)).toLocaleString('tr-TR')}</td>
                          <td style={{ textAlign: 'right' }}>₺{simulation.avgCpc.toFixed(2)} TBM</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{Math.round((simulation.estDeals || 0) * (allocGoogleSearch / 100))}</td>
                        </tr>
                        <tr>
                          <td>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                              <MetaIcon size={14} /> Meta Ads (FB & IG)
                            </div>
                          </td>
                          <td>₺{omnichannelMix.metaAdsSpend.toLocaleString('tr-TR')} (%{allocMetaAds})</td>
                          <td style={{ textAlign: 'right' }}>{metaSimulation.impressions.toLocaleString('tr-TR')}</td>
                          <td style={{ textAlign: 'right' }}>{metaSimulation.clicks.toLocaleString('tr-TR')}</td>
                          <td style={{ textAlign: 'right' }}>₺{metaSimulation.cpm} CPM</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{metaSimulation.healthyLeads}</td>
                        </tr>
                        <tr>
                          <td>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                              <YouTubeIcon size={14} /> YouTube Video
                            </div>
                          </td>
                          <td>₺{omnichannelMix.youtubeSpend.toLocaleString('tr-TR')} (%{allocYouTube})</td>
                          <td style={{ textAlign: 'right' }}>{youtubeSimulation.impressions.toLocaleString('tr-TR')}</td>
                          <td style={{ textAlign: 'right' }}>{youtubeSimulation.videoViews.toLocaleString('tr-TR')} İzlenme</td>
                          <td style={{ textAlign: 'right' }}>₺{youtubeSimulation.cpv} CPV</td>
                          <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{youtubeSimulation.actions} Eylem</td>
                        </tr>
                        <tr>
                          <td>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                              <GdnIcon size={14} /> Google GDN
                            </div>
                          </td>
                          <td>₺{omnichannelMix.gdnSpend.toLocaleString('tr-TR')} (%{allocGdn})</td>
                          <td style={{ textAlign: 'right' }}>{gdnSimulation.impressions.toLocaleString('tr-TR')}</td>
                          <td style={{ textAlign: 'right' }}>{gdnSimulation.clicks.toLocaleString('tr-TR')}</td>
                          <td style={{ textAlign: 'right' }}>₺{gdnSimulation.cpm} CPM</td>
                          <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{gdnSimulation.assistedConversions} Asist</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Master Plan Sub-Campaigns Breakdown Section */}
                {subCampaigns.length > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        👑 Çok Dilli Alt Kampanyalar Dağılımı ({subCampaigns.length} Kampanya):
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                        Toplam Bütçe: ₺{totalMasterMonthlyBudget.toLocaleString('tr-TR')}
                      </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table" style={{ fontSize: '0.75rem' }}>
                        <thead>
                          <tr>
                            <th>Alt Kampanya Adı</th>
                            <th>Hedef Dil & Pazar</th>
                            <th>Platform</th>
                            <th>Aylık Bütçe</th>
                            <th style={{ textAlign: 'right' }}>Bütçe Payı</th>
                            <th style={{ textAlign: 'right' }}>İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subCampaigns.map((sc) => {
                            const share = totalMasterMonthlyBudget > 0 ? Math.round((sc.monthlyBudget / totalMasterMonthlyBudget) * 100) : 0;
                            const isActive = sc.id === activeSubCampaignId;
                            return (
                              <tr 
                                key={sc.id}
                                style={{ backgroundColor: isActive ? 'rgba(37, 99, 235, 0.04)' : undefined }}
                              >
                                <td>
                                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    {editingSubCampaignId === sc.id ? (
                                      <input
                                        type="text"
                                        value={tempSubCampaignName}
                                        onChange={(e) => setTempSubCampaignName(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveRename(sc.id);
                                          if (e.key === 'Escape') setEditingSubCampaignId(null);
                                        }}
                                        onBlur={() => handleSaveRename(sc.id)}
                                        autoFocus
                                        style={{
                                          padding: '2px 6px',
                                          fontSize: '0.75rem',
                                          borderRadius: '3px',
                                          border: '1px solid var(--brand-primary)',
                                          outline: 'none',
                                          backgroundColor: '#ffffff',
                                          fontWeight: 600,
                                          width: '130px'
                                        }}
                                      />
                                    ) : (
                                      <>
                                        <span 
                                          onDoubleClick={() => handleStartRename(sc.id, sc.name)}
                                          title="İsmi düzenlemek için çift tıklayın veya kaleme basın"
                                          style={{ cursor: 'pointer' }}
                                        >
                                          {sc.name}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleStartRename(sc.id, sc.name)}
                                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', color: 'var(--text-muted)' }}
                                          title="İsmi Düzenle"
                                        >
                                          <Edit2 size={11} />
                                        </button>
                                        {isActive && (
                                          <span style={{ fontSize: '0.62rem', padding: '1px 4px', borderRadius: '2px', backgroundColor: 'var(--brand-primary)', color: '#ffffff', fontWeight: 700 }}>
                                            AKTİF
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <span>{sc.languageFlag || '🌐'}</span>
                                    <span>{sc.languageName || sc.languageCode}</span>
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                    {getPlatformIcon(sc.platform, 13)}
                                    <span>{sc.platform}</span>
                                  </div>
                                </td>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                  ₺{sc.monthlyBudget.toLocaleString('tr-TR')}
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--brand-primary)' }}>
                                  %{share}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleOpenExportModal(sc, 'PDF', {
                                          name: planName,
                                          clientName: clientName,
                                          period: planPeriod,
                                          startDate: planStartDate,
                                          endDate: planEndDate
                                        });
                                      }}
                                      className="btn-ghost"
                                      style={{ padding: '2px 5px', fontSize: '0.7rem', color: 'var(--brand-primary)' }}
                                      title="Alt Kampanya PDF Raporu Al"
                                    >
                                      <FileText size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleOpenExportModal(sc, 'CSV', {
                                          name: planName,
                                          clientName: clientName,
                                          period: planPeriod,
                                          startDate: planStartDate,
                                          endDate: planEndDate
                                        });
                                      }}
                                      className="btn-ghost"
                                      style={{ padding: '2px 5px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}
                                      title="Alt Kampanya CSV İndir"
                                    >
                                      <Download size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSelectSubCampaign(sc.id)}
                                      className="btn-ghost"
                                      style={{ fontSize: '0.7rem', padding: '2px 6px', color: 'var(--brand-primary)', fontWeight: 600 }}
                                    >
                                      Düzenle
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* CHANNEL 2: META ADS (FACEBOOK & INSTAGRAM) DEEP DIVE                      */}
          {/* ========================================================================= */}
          {activeChannelTab === 'META_ADS' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
              
              {/* Meta Controls Column */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <MetaIcon size={18} /> Meta Ads (FB & Instagram) Lead Huni Parametreleri
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    1.000 Gösterim Başı Maliyet (CPM), Form Dönüşüm ve Sağlıklı Lead Oranını ayarlayın.
                  </div>
                </div>

                {/* Sektörel CPM Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Sektörel Ortalama CPM (1.000 Gösterim Maliyeti ₺)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>₺</span>
                      <input
                        type="number"
                        min={5}
                        max={3000}
                        step={1}
                        value={metaCpm}
                        onChange={(e) => setMetaCpm(Math.max(1, Number(e.target.value)))}
                        style={{
                          width: '74px',
                          padding: '2px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={1000}
                    step={5}
                    value={metaCpm}
                    onChange={(e) => setMetaCpm(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((metaCpm - 10) / 990) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((metaCpm - 10) / 990) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hızlı Sektör Benchmarkları:</span>
                    <button onClick={() => setMetaCpm(55)} className="btn-ghost" style={{ padding: '1px 5px', fontSize: '0.68rem' }}>E-Ticaret (₺55)</button>
                    <button onClick={() => setMetaCpm(85)} className="btn-ghost" style={{ padding: '1px 5px', fontSize: '0.68rem' }}>Turizm/Otel (₺85)</button>
                    <button onClick={() => setMetaCpm(130)} className="btn-ghost" style={{ padding: '1px 5px', fontSize: '0.68rem' }}>Yerel Gayrimenkul (₺130)</button>
                    <button onClick={() => setMetaCpm(320)} className="btn-ghost" style={{ padding: '1px 5px', fontSize: '0.68rem' }}>Sağlık/Yabancıya Konut (₺320)</button>
                  </div>
                </div>

                {/* Link Tıklama Oranı (CTR %) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Ortalama Tıklama Oranı (CTR / TO %)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                      <input
                        type="number"
                        min={0.1}
                        max={50.0}
                        step={0.1}
                        value={metaCtr}
                        onChange={(e) => setMetaCtr(Math.max(0.1, Number(e.target.value)))}
                        style={{
                          width: '64px',
                          padding: '2px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={20.0}
                    step={0.1}
                    value={metaCtr}
                    onChange={(e) => setMetaCtr(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((metaCtr - 0.2) / 19.8) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((metaCtr - 0.2) / 19.8) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Meta akış ve hikaye reklamlarında ortalama CTR %1.2 - %2.2 aralığındadır.
                  </div>
                </div>

                {/* Form & Lead Dönüşüm Oranı (CR %) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Form & Talep Dönüşüm Oranı (Lead CR %)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                      <input
                        type="number"
                        min={0.1}
                        max={80.0}
                        step={0.1}
                        value={metaLeadCr}
                        onChange={(e) => setMetaLeadCr(Math.max(0.1, Number(e.target.value)))}
                        style={{
                          width: '64px',
                          padding: '2px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={35.0}
                    step={0.1}
                    value={metaLeadCr}
                    onChange={(e) => setMetaLeadCr(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((metaLeadCr - 0.5) / 34.5) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((metaLeadCr - 0.5) / 34.5) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Instant Lead Formlarında %5-%10, Web Sitesi Landing Page'lerinde %2.5-%5.0 arasındadır.
                  </div>
                </div>

                {/* 🎯 SAĞLIKLI LEAD ORANI (%) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Sağlıklı & Nitelikli Lead Oranı (Healthy Lead %)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        step={1}
                        value={metaHealthyLeadRate}
                        onChange={(e) => setMetaHealthyLeadRate(Math.max(1, Math.min(100, Number(e.target.value))))}
                        style={{
                          width: '64px',
                          padding: '2px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={1}
                    value={metaHealthyLeadRate}
                    onChange={(e) => setMetaHealthyLeadRate(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((metaHealthyLeadRate - 5) / 95) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((metaHealthyLeadRate - 5) / 95) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    Gelen ham formların bütçesi olan, telefona bakan ve gerçek alıcı potansiyeline sahip nitelikli lead oranı.
                  </div>
                </div>

                {/* Satış Kapanış Oranı (%) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Sağlıklı Lead'den Satışa Kapanış Oranı (%)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        step={1}
                        value={metaCloseRate}
                        onChange={(e) => setMetaCloseRate(Math.max(1, Math.min(100, Number(e.target.value))))}
                        style={{
                          width: '64px',
                          padding: '2px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={metaCloseRate}
                    onChange={(e) => setMetaCloseRate(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((metaCloseRate - 1) / 99) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((metaCloseRate - 1) / 99) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>

              </div>

              {/* Meta Outcomes Column */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <MetaIcon size={18} /> Meta Ads Kampanya Projeksiyonu & Funnel
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Aylık <strong>₺{metaSimulation.budget.toLocaleString('tr-TR')}</strong> Meta bütçesiyle beklenen performans çıktısı.
                  </div>
                </div>

                {/* 4 Core Meta Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  
                  {/* Impressions */}
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Toplam Gösterim (Impressions)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {metaSimulation.impressions.toLocaleString('tr-TR')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Ortalama CPM: ₺{metaSimulation.cpm}
                    </div>
                  </div>

                  {/* Clicks */}
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Link Tıklaması (Trafik)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {metaSimulation.clicks.toLocaleString('tr-TR')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      %{metaSimulation.ctr} CTR • Ort. TBM: ₺{metaSimulation.cpc.toFixed(2)}
                    </div>
                  </div>

                  {/* Gross Leads & CPL */}
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Toplam Brüt Form (Lead)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {metaSimulation.grossLeads.toLocaleString('tr-TR')} Form
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Brüt Lead Başı Maliyet (CPL): <strong>₺{metaSimulation.cpl}</strong>
                    </div>
                  </div>

                  {/* Healthy Qualified Leads & CPQL */}
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SAĞLIKLI LEAD (MQL)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {metaSimulation.healthyLeads.toLocaleString('tr-TR')} Nitelikli
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Sağlıklı Lead Maliyeti (CPQL): <strong>₺{metaSimulation.cpql}</strong>
                    </div>
                  </div>

                </div>

                {/* Visual Lead Funnel Progress */}
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Meta Ads Huni Düşüş Akışı (Lead Funnel):
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', textAlign: 'center' }}>
                    <div style={{ flex: 1, padding: '0.4rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>1. Gösterim</div>
                      <strong style={{ fontSize: '0.85rem' }}>{metaSimulation.impressions.toLocaleString('tr-TR')}</strong>
                    </div>
                    <span style={{ padding: '0 0.3rem', color: 'var(--text-muted)' }}>➔</span>
                    <div style={{ flex: 1, padding: '0.4rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>2. Tıklama</div>
                      <strong style={{ fontSize: '0.85rem' }}>{metaSimulation.clicks.toLocaleString('tr-TR')}</strong>
                    </div>
                    <span style={{ padding: '0 0.3rem', color: 'var(--text-muted)' }}>➔</span>
                    <div style={{ flex: 1, padding: '0.4rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>3. Brüt Form</div>
                      <strong style={{ fontSize: '0.85rem' }}>{metaSimulation.grossLeads}</strong>
                    </div>
                    <span style={{ padding: '0 0.3rem', color: 'var(--text-muted)' }}>➔</span>
                    <div style={{ flex: 1, padding: '0.4rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600 }}>4. Sağlıklı Lead</div>
                      <strong style={{ fontSize: '0.85rem' }}>{metaSimulation.healthyLeads}</strong>
                    </div>
                  </div>
                </div>

                {/* ROAS & Deals Box - Only displayed for ECOMMERCE */}
                {businessModel === 'ECOMMERCE' && (
                  <div style={{
                    padding: '1.15rem',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Meta Kampanyası Projeksiyon ROAS
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {metaSimulation.roas}x
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Tahmini Satış: <strong>{metaSimulation.deals} Adet</strong> • CAC: <strong>₺{metaSimulation.cac}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Meta Kaynaklı Gelir</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        ₺{metaSimulation.revenue.toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* CHANNEL 3: GOOGLE SEARCH (SEM) DEEP DIVE                                  */}
          {/* ========================================================================= */}
          {activeChannelTab === 'GOOGLE_SEARCH' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
              
              {/* Controls Column */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <GoogleIcon size={18} /> Google Search (Arama Ağı) Parametreleri
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Pazar hacmine bağlı gerçekçi tıklama ve dönüşüm projeksiyonu.
                    </div>
                  </div>

                  {/* Budget Mode Selector */}
                  <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface-elevated)', padding: '2px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                    <button
                      onClick={() => {
                        setBudgetMode('BY_BUDGET');
                        const currentSpend = isGoogleSearchActive ? monthlyBudget : Math.round((monthlyBudget * allocGoogleSearch) / 100);
                        if (activeSearchCpc > 0 && expectedCtr > 0 && totalSearchVolume > 0 && currentSpend > 0) {
                          const clicks = currentSpend / activeSearchCpc;
                          const impressions = clicks / (expectedCtr / 100);
                          const calculatedIS = Math.max(1, Math.min(95, Math.round((impressions / totalSearchVolume) * 100)));
                          setTargetImpressionShare(calculatedIS);
                        }
                      }}
                      style={{
                        padding: '4px 10px',
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
                      onClick={() => {
                        setBudgetMode('BY_IMPRESSION_SHARE');
                        if (totalSearchVolume > 0 && expectedCtr > 0 && activeSearchCpc > 0) {
                          const clampedIS = Math.max(5, Math.min(95, targetImpressionShare || 70));
                          const impressions = totalSearchVolume * (clampedIS / 100);
                          const clicks = impressions * (expectedCtr / 100);
                          const requiredSpend = Math.round(clicks * activeSearchCpc);
                          if (isGoogleSearchActive || allocGoogleSearch === 100) {
                            setMonthlyBudget(requiredSpend);
                          } else {
                            const currentGoogleSpend = Math.round((monthlyBudget * allocGoogleSearch) / 100);
                            const otherSpend = Math.max(0, monthlyBudget - currentGoogleSpend);
                            if (otherSpend > 0) {
                              const newTotal = requiredSpend + otherSpend;
                              setMonthlyBudget(newTotal);
                              const newAlloc = newTotal > 0 ? Math.max(1, Math.min(100, Math.round((requiredSpend / newTotal) * 100))) : 50;
                              updateChannelAllocation('google', newAlloc);
                            } else {
                              const alloc = allocGoogleSearch > 0 ? allocGoogleSearch : 50;
                              const newTotal = Math.round(requiredSpend / (alloc / 100));
                              setMonthlyBudget(newTotal);
                            }
                          }
                        }
                      }}
                      style={{
                        padding: '4px 10px',
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

                {/* Monthly Budget Slider */}
                {budgetMode === 'BY_BUDGET' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>{isGoogleSearchActive ? 'Google Search Aylık Bütçesi' : `Google Search Ayrılan Bütçe (%${allocGoogleSearch})`}</span>
                        </label>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {isGoogleSearchActive ? (
                            <span>
                              <span>Günlük ortalama: </span>
                              <strong>₺{Math.round((monthlyBudget || 0) / 30.4).toLocaleString('tr-TR')}/gün</strong>
                              <span> • Tahmini Gösterim Payı: </span>
                              <strong>%{simulation.targetImpressionShare}</strong>
                            </span>
                          ) : (
                            <span>
                              <span>Toplam ₺{(monthlyBudget || 0).toLocaleString('tr-TR')} medya bütçesinin %{allocGoogleSearch}'i • </span>
                              <strong>Günlük: ₺{Math.round(Math.round(((monthlyBudget || 0) * allocGoogleSearch) / 100) / 30.4).toLocaleString('tr-TR')}/gün</strong>
                              <span> • </span>
                              <strong>Tahmini Gösterim Payı: %{simulation.targetImpressionShare}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>₺</span>
                        <input
                          type="number"
                          min={0}
                          max={10000000}
                          step={250}
                          value={isGoogleSearchActive ? ((monthlyBudget || 0) === 0 ? '' : monthlyBudget) : (Math.round(((monthlyBudget || 0) * allocGoogleSearch) / 100) === 0 ? '' : Math.round(((monthlyBudget || 0) * allocGoogleSearch) / 100))}
                          placeholder="0"
                          onChange={(e) => {
                            const raw = e.target.value;
                            const num = raw === '' ? 0 : Number(raw);
                            handleGoogleBudgetChange(isNaN(num) ? 0 : num);
                          }}
                          style={{
                            width: '110px',
                            padding: '3px 6px',
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            textAlign: 'right',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-default)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                    {(() => {
                      const curGoogleSpend = isGoogleSearchActive ? (monthlyBudget || 0) : Math.round((monthlyBudget * allocGoogleSearch) / 100);
                      const maxSliderVal = Math.max(50000, Math.round((simulation.marketCapacitySpend || 50000) * 1.3), Math.round(curGoogleSpend * 1.3));
                      const percentFill = maxSliderVal > 0 ? Math.min(100, Math.max(0, Math.round((curGoogleSpend / maxSliderVal) * 100))) : 0;
                      return (
                        <>
                          <input
                            type="range"
                            min={0}
                            max={maxSliderVal}
                            step={250}
                            value={curGoogleSpend}
                            onChange={(e) => {
                              const num = Number(e.target.value);
                              handleGoogleBudgetChange(isNaN(num) ? 0 : num);
                            }}
                            style={{
                              width: '100%',
                              accentColor: '#2563eb',
                              cursor: 'pointer',
                              background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${percentFill}%, var(--border-default) ${percentFill}%, var(--border-default) 100%)`,
                              height: '6px',
                              borderRadius: 'var(--radius-full)'
                            }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Hızlı Bütçe:</span>
                            {[
                              { label: '₺2.500', val: 2500 },
                              { label: '₺5.000', val: 5000 },
                              { label: '₺10.000', val: 10000 },
                              { label: '₺25.000', val: 25000 },
                              { label: '₺50.000', val: 50000 },
                              ...(simulation.marketCapacitySpend > 0 ? [{ label: `🎯 Pazar Tavanı (₺${Math.round(simulation.marketCapacitySpend).toLocaleString('tr-TR')})`, val: Math.round(simulation.marketCapacitySpend) }] : [])
                            ].map(chip => (
                              <button
                                key={chip.label}
                                type="button"
                                onClick={() => handleGoogleBudgetChange(chip.val)}
                                style={{
                                  padding: '2px 7px',
                                  fontSize: '0.68rem',
                                  borderRadius: 'var(--radius-xs)',
                                  border: curGoogleSpend === chip.val ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                                  backgroundColor: curGoogleSpend === chip.val ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface-elevated)',
                                  color: curGoogleSpend === chip.val ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                  cursor: 'pointer',
                                  fontWeight: curGoogleSpend === chip.val ? 700 : 500
                                }}
                              >
                                {chip.label}
                              </button>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <span>Hedef Pazar Gösterim Payı (IS %)</span>
                        </label>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span>
                            <span>Ayrılan Bütçe: </span>
                            <strong>₺{(simulation.actualSpend || 0).toLocaleString('tr-TR')}</strong>
                            <span>/ay {isGoogleSearchActive ? '' : `(%${allocGoogleSearch})`}</span>
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                        <input
                          type="number"
                          min={5}
                          max={95}
                          step={1}
                          value={targetImpressionShare}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const num = raw === '' ? 50 : Number(raw);
                            handleImpressionShareChange(isNaN(num) ? 50 : Math.max(5, Math.min(95, num)));
                          }}
                          style={{
                            width: '64px',
                            padding: '2px 6px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            textAlign: 'right',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-default)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={95}
                      step={1}
                      value={targetImpressionShare}
                      onChange={(e) => {
                        const num = Number(e.target.value);
                        handleImpressionShareChange(isNaN(num) ? 50 : num);
                      }}
                      style={{
                        width: '100%',
                        accentColor: '#2563eb',
                        cursor: 'pointer',
                        background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round((( (Number(targetImpressionShare) || 50) - 5) / 90) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round((( (Number(targetImpressionShare) || 50) - 5) / 90) * 100)))}%, var(--border-default) 100%)`,
                        height: '6px',
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Hedef Pay:</span>
                      {[
                        { label: '%25 Başlangıç', val: 25 },
                        { label: '%50 Dengeli', val: 50 },
                        { label: '%70 Rekabetçi', val: 70 },
                        { label: '%85 Yüksek', val: 85 },
                        { label: '%95 Pazar Hakimiyeti', val: 95 }
                      ].map(chip => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => handleImpressionShareChange(chip.val)}
                          style={{
                            padding: '2px 7px',
                            fontSize: '0.68rem',
                            borderRadius: 'var(--radius-xs)',
                            border: targetImpressionShare === chip.val ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                            backgroundColor: targetImpressionShare === chip.val ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface-elevated)',
                            color: targetImpressionShare === chip.val ? 'var(--brand-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: targetImpressionShare === chip.val ? 700 : 500
                          }}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                    <div style={{
                      padding: '0.55rem 0.75rem',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.73rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>
                        <span>Bu pay için gereken bütçe: </span>
                        <strong>₺{(simulation.actualSpend || 0).toLocaleString('tr-TR')}</strong>
                        <span>/ay</span>
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span>✓ Otomatik Senkronize {isGoogleSearchActive ? '' : `(%${allocGoogleSearch})`}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Expected CTR Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      <span>Tahmini Arama Ağı Tıklama Oranı (CTR / TO %)</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                      <input
                        type="number"
                        min={0.1}
                        max={80.0}
                        step={0.1}
                        value={expectedCtr}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const num = raw === '' ? 7.5 : Number(raw);
                          handleExpectedCtrChange(isNaN(num) ? 7.5 : Math.max(0.1, Math.min(80, num)));
                        }}
                        style={{
                          width: '64px',
                          padding: '2px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={40.0}
                    step={0.1}
                    value={expectedCtr}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      handleExpectedCtrChange(isNaN(num) ? 7.5 : num);
                    }}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round((( (Number(expectedCtr) || 7.5) - 1.0) / 39.0) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round((( (Number(expectedCtr) || 7.5) - 1.0) / 39.0) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>

                {/* Lead CR Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      <span>Form & Talep Dönüşüm Oranı (Lead CR %)</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                      <input
                        type="number"
                        min={0.1}
                        max={80.0}
                        step={0.1}
                        value={leadConversionRate}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const num = raw === '' ? 2.0 : Number(raw);
                          setLeadConversionRate(isNaN(num) ? 2.0 : Math.max(0.1, Math.min(80, num)));
                        }}
                        style={{
                          width: '64px',
                          padding: '2px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={35.0}
                    step={0.1}
                    value={leadConversionRate}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      setLeadConversionRate(isNaN(num) ? 2.0 : num);
                    }}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round((( (Number(leadConversionRate) || 2.0) - 0.5) / 34.5) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round((( (Number(leadConversionRate) || 2.0) - 0.5) / 34.5) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>

                {/* Business Model Specific Conversion Controls for Search */}
                {businessModel === 'LEAD_GEN' && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                          <span>Sağlıklı Lead Oranı (% Healthy Lead)</span>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            step={1}
                            value={leadCloseRate}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const num = raw === '' ? 50 : Number(raw);
                              setLeadCloseRate(isNaN(num) ? 50 : Math.max(1, Math.min(100, num)));
                            }}
                            style={{
                              width: '64px',
                              padding: '2px 6px',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              textAlign: 'right',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px solid var(--border-default)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-primary)'
                            }}
                          />
                        </div>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={100}
                        step={1}
                        value={leadCloseRate}
                        onChange={(e) => {
                          const num = Number(e.target.value);
                          setLeadCloseRate(isNaN(num) ? 50 : num);
                        }}
                        style={{
                          width: '100%',
                          accentColor: '#2563eb',
                          cursor: 'pointer',
                          background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round((( (Number(leadCloseRate) || 50) - 1) / 99) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round((( (Number(leadCloseRate) || 50) - 1) / 99) * 100)))}%, var(--border-default) 100%)`,
                          height: '6px',
                          borderRadius: 'var(--radius-full)'
                        }}
                      />
                    </div>
                  </>
                )}

                {businessModel === 'ECOMMERCE' && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                          Sipariş Dönüşüm Oranı (%)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                          <input
                            type="number"
                            min={0.1}
                            max={50.0}
                            step={0.1}
                            value={ecommerceConversionRate}
                            onChange={(e) => setEcommerceConversionRate(Math.max(0.1, Number(e.target.value)))}
                            style={{
                              width: '64px',
                              padding: '2px 6px',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              textAlign: 'right',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px solid var(--border-default)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-primary)'
                            }}
                          />
                        </div>
                      </div>
                      <input
                        type="range"
                        min={0.2}
                        max={20.0}
                        step={0.1}
                        value={ecommerceConversionRate}
                        onChange={(e) => setEcommerceConversionRate(Number(e.target.value))}
                        style={{
                          width: '100%',
                          accentColor: '#2563eb',
                          cursor: 'pointer',
                          background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((ecommerceConversionRate - 0.2) / 19.8) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((ecommerceConversionRate - 0.2) / 19.8) * 100)))}%, var(--border-default) 100%)`,
                          height: '6px',
                          borderRadius: 'var(--radius-full)'
                        }}
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

              </div>

              {/* Outcomes Column */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <GoogleIcon size={18} /> Google Search Performans Projeksiyonu
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Aylık <strong>₺{simulation.actualSpend.toLocaleString('tr-TR')}</strong> harcama ile beklenen arama ağı sonuçları.
                  </div>
                </div>

                {/* Market Saturation Alert */}
                {simulation.isMarketSaturated && (
                  <div style={{
                    padding: '0.75rem 0.9rem',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>💡</span> Pazar Hacmi Tavanı Ulaşıldı (%95 Gösterim Payı)
                    </div>
                    <div>
                      Seçili lokasyondaki toplam arama talebini yakalamak için aylık maksimum <strong>₺{simulation.actualSpend.toLocaleString('tr-TR')}</strong> arama ağı harcaması yeterlidir. Artan bütçenizi <strong>Meta Ads</strong> veya <strong>Google GDN</strong> gibi talep yaratma kanallarına aktararak genel dönüşümünüzü katlayabilirsiniz.
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  
                  {/* Impression Share KPI Card */}
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Pazar Gösterim Payı (IS)</div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {simulation.targetImpressionShare >= 80 ? 'Yüksek Pazar Hakimiyeti' : (simulation.targetImpressionShare >= 40 ? 'Rekabetçi Pay' : 'Büyüme Fırsatı')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '3px' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        %{simulation.targetImpressionShare}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Toplam {totalSearchVolume.toLocaleString('tr-TR')} aylık arama hacminin
                      </span>
                    </div>
                    {/* Mini Progress Bar */}
                    <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border-default)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '6px' }}>
                      <div style={{ height: '100%', width: `${simulation.targetImpressionShare}%`, backgroundColor: '#2563eb', transition: 'width 0.2s ease' }} />
                    </div>
                  </div>

                  <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Gösterim</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {simulation.estImpressions.toLocaleString('tr-TR')}
                    </div>
                  </div>

                  <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Tıklama</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {simulation.estClicks.toLocaleString('tr-TR')}
                    </div>
                  </div>

                  <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Ort. TBM</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--brand-primary)', marginTop: '2px' }}>
                      ₺{(simulation.avgCpc > 0 ? simulation.avgCpc : (simulation.estClicks > 0 ? simulation.actualSpend / simulation.estClicks : 0)).toFixed(2)}
                    </div>
                  </div>

                  <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Tıklama Oranı (CTR)</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      %{(simulation.avgCtr || (simulation.estImpressions > 0 ? (simulation.estClicks / simulation.estImpressions) * 100 : expectedCtr)).toFixed(1)}
                    </div>
                  </div>

                  {businessModel === 'LEAD_GEN' ? (
                    <>
                      <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Arama Başı Talep (Lead)</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {simulation.estConversions.toLocaleString('tr-TR')} Adet
                        </div>
                      </div>

                      <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SAĞLIKLI LEAD</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {simulation.estDeals} Nitelikli
                        </div>
                      </div>

                      <div style={{ padding: '0.8rem', backgroundColor: 'rgba(37, 99, 235, 0.07)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 700 }}>TAHMİNİ CPL (Lead Başı)</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '2px' }}>
                          {simulation.cpa > 0 ? `₺${simulation.cpa.toLocaleString('tr-TR')}` : '—'}
                        </div>
                      </div>

                      <div style={{ padding: '0.8rem', backgroundColor: 'rgba(16, 185, 129, 0.07)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                        <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>NİTELİKLİ CPL (Sağlıklı Lead)</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                          {(simulation.cac || 0) > 0 ? `₺${(simulation.cac || 0).toLocaleString('tr-TR')}` : '—'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Satış (Sipariş)</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {simulation.estConversions.toLocaleString('tr-TR')} Adet
                        </div>
                      </div>

                      <div style={{ padding: '0.8rem', backgroundColor: 'rgba(37, 99, 235, 0.07)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 700 }}>TAHMİNİ CPA (Sipariş Başı)</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '2px' }}>
                          {simulation.cpa > 0 ? `₺${simulation.cpa.toLocaleString('tr-TR')}` : '—'}
                        </div>
                      </div>

                      <div style={{ padding: '0.8rem', backgroundColor: 'rgba(16, 185, 129, 0.07)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                        <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>TAHMİNİ ROAS</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                          {simulation.projectedRoas > 0 ? `${simulation.projectedRoas}x` : '—'}
                        </div>
                      </div>

                      <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Ciro Projeksiyonu</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                          ₺{simulation.estRevenue.toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Official Google Ads Regional Breakdown Rows */}
                {countryBreakdown.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pazar Kırılımı:</span>
                        <span className="badge badge-active" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                          <Sparkles size={10} /> Google Ads API
                        </span>
                      </div>
                      {isLoadingLocationBreakdown ? (
                        <span style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <RefreshCw size={11} className="animate-spin" /> Veriler alınıyor...
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {countryBreakdown.length} Hedef Bölge
                        </span>
                      )}
                    </div>
                    {countryBreakdown.map((cm, idx) => {
                      return (
                        <div key={`${cm.code || ''}_${cm.name || ''}_${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', padding: '0.25rem 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: '0.95rem' }}>{cm.flag || '🌐'}</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cm.name}</span>
                            {(cm.sharePercent || 0) > 0 && (
                              <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '1px 4px' }}>
                                %{cm.sharePercent}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              <strong style={{ color: 'var(--text-primary)' }}>{(cm.monthlyVolume || 0).toLocaleString('tr-TR')}</strong>
                              <span> arama</span>
                            </span>
                            <span style={{ color: 'var(--border-default)' }}>•</span>
                            <span 
                              title={`Seçili Kelimelerin Bu Pazara Ait Ortalama TBM'si: ₺${(cm.avgCpc || 0).toFixed(2)}`}
                              style={{ color: (cm.avgCpc || 0) > 0 ? 'var(--brand-primary)' : 'var(--text-muted)', fontWeight: 700 }}
                            >
                              {(cm.avgCpc || 0) > 0 ? `₺${(cm.avgCpc || 0).toFixed(2)} TBM` : 'TBM Yok'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* CHANNEL 4: YOUTUBE ADS                                                    */}
          {/* ========================================================================= */}
          {activeChannelTab === 'YOUTUBE' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <YouTubeIcon size={18} /> YouTube Video Reklam Parametreleri
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    In-Stream, Video Action ve Shorts için Görüntüleme Başı Maliyet (CPV) simülasyonu.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Ortalama CPV (Görüntüleme Başı Maliyet ₺)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>₺</span>
                      <input
                        type="number"
                        min={0.01}
                        max={20.00}
                        step={0.01}
                        value={youtubeCpv}
                        onChange={(e) => setYoutubeCpv(Math.max(0.01, Number(e.target.value)))}
                        style={{
                          width: '74px',
                          padding: '2px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={3.00}
                    step={0.01}
                    value={youtubeCpv}
                    onChange={(e) => setYoutubeCpv(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((youtubeCpv - 0.05) / 2.95) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((youtubeCpv - 0.05) / 2.95) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Video İzleme Oranı (VTR / View Rate %)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                      <input
                        type="number"
                        min={1}
                        max={95}
                        step={1}
                        value={youtubeVtr}
                        onChange={(e) => setYoutubeVtr(Math.max(1, Math.min(95, Number(e.target.value))))}
                        style={{
                          width: '64px',
                          padding: '2px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={85}
                    step={1}
                    value={youtubeVtr}
                    onChange={(e) => setYoutubeVtr(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((youtubeVtr - 5) / 80) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((youtubeVtr - 5) / 80) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Video Tıklama & Eylem Oranı (%)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                      <input
                        type="number"
                        min={0.1}
                        max={30.0}
                        step={0.1}
                        value={youtubeActionRate}
                        onChange={(e) => setYoutubeActionRate(Math.max(0.1, Number(e.target.value)))}
                        style={{
                          width: '64px',
                          padding: '2px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={10.0}
                    step={0.1}
                    value={youtubeActionRate}
                    onChange={(e) => setYoutubeActionRate(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((youtubeActionRate - 0.1) / 9.9) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((youtubeActionRate - 0.1) / 9.9) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <YouTubeIcon size={18} /> YouTube Kampanya Çıktıları
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Toplam Video Gösterimi</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {youtubeSimulation.impressions.toLocaleString('tr-TR')}
                    </div>
                  </div>
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tamamlanan İzlenmeler</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {youtubeSimulation.videoViews.toLocaleString('tr-TR')}
                    </div>
                  </div>
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Kazanılan Eylemler (Tıklama/Form)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {youtubeSimulation.actions}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CHANNEL 5: GOOGLE GDN (DISPLAY & RETARGETING)                             */}
          {/* ========================================================================= */}
          {activeChannelTab === 'GDN' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <GdnIcon size={18} /> Google GDN (Display Network & Remarketing)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Web sitelerinde banner gösterimi ve yeniden pazarlama desteği.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      GDN Ortalama CPM (1.000 Banner Gösterimi ₺)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>₺</span>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        step={1}
                        value={gdnCpm}
                        onChange={(e) => setGdnCpm(Math.max(1, Number(e.target.value)))}
                        style={{
                          width: '74px',
                          padding: '2px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={200}
                    step={1}
                    value={gdnCpm}
                    onChange={(e) => setGdnCpm(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((gdnCpm - 5) / 195) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((gdnCpm - 5) / 195) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      GDN Tıklama Oranı (CTR / TO %)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                      <input
                        type="number"
                        min={0.05}
                        max={20.00}
                        step={0.05}
                        value={gdnCtr}
                        onChange={(e) => setGdnCtr(Math.max(0.05, Number(e.target.value)))}
                        style={{
                          width: '64px',
                          padding: '2px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={5.0}
                    step={0.05}
                    value={gdnCtr}
                    onChange={(e) => setGdnCtr(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((gdnCtr - 0.1) / 4.9) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((gdnCtr - 0.1) / 4.9) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      GDN Destekli Dönüşüm Katkısı (%)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>+</span>
                      <input
                        type="number"
                        min={0.1}
                        max={50.0}
                        step={0.1}
                        value={gdnAssistedCr}
                        onChange={(e) => setGdnAssistedCr(Math.max(0.1, Number(e.target.value)))}
                        style={{
                          width: '64px',
                          padding: '2px 6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={15.0}
                    step={0.1}
                    value={gdnAssistedCr}
                    onChange={(e) => setGdnAssistedCr(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((gdnAssistedCr - 0.1) / 14.9) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((gdnAssistedCr - 0.1) / 14.9) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <GdnIcon size={18} /> GDN Kampanya Çıktıları
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Toplam Banner Gösterimi</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {gdnSimulation.impressions.toLocaleString('tr-TR')}
                    </div>
                  </div>
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Banner Tıklamaları</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {gdnSimulation.clicks.toLocaleString('tr-TR')}
                    </div>
                  </div>
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Asist Edilen Dönüşümler</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                      {gdnSimulation.assistedConversions}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CHANNEL 6: AI NEGATIVE KEYWORD SHIELD                                     */}
          {/* ========================================================================= */}
          {activeChannelTab === 'NEGATIVES' && (
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
                  type="button"
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
                        type="button"
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

          {/* ========================================================================= */}
          {/* CHANNEL 7: SAVED FORECAST PLANS                                           */}
          {/* ========================================================================= */}
          {activeChannelTab === 'SAVED_PLANS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    👑 Kayıtlı Master Medya & Kampanya Planları ({savedPlans.length})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Geçmişte oluşturduğunuz çok dilli ve çok kanallı tüm bütçe planlarını tek tıkla geri yükleyebilirsiniz.
                  </div>
                </div>
                <button type="button" onClick={loadSavedPlans} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}>
                  <RefreshCw size={13} /> Yenile
                </button>
              </div>

              <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>Master Plan & Müşteri</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Dönem & Etiketler</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Alt Kampanyalar</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Aylık & Günlük Bütçe</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Kayıt Tarihi</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedPlans.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          Henüz bu çalışma alanında kayıtlı bir Master medya planı bulunmuyor. Yukarıdaki "Master Planı Kaydet" butonunu kullanarak mevcut planınızı arşivleyebilirsiniz.
                        </td>
                      </tr>
                    ) : (
                      savedPlans.map((plan) => {
                        const hasSubCamps = Array.isArray(plan.subCampaigns) && plan.subCampaigns.length > 0;
                        const subCount = Array.isArray(plan.subCampaigns) ? plan.subCampaigns.length : (plan.selectedKeywords && plan.selectedKeywords.length > 0 ? 1 : 0);
                        const subSummary = hasSubCamps 
                          ? plan.subCampaigns!.map(c => `${c.languageFlag || '🌐'} ${c.name}`).join(' • ')
                          : (subCount > 0 ? (plan.targetUrl || plan.seedKeywords || 'Standart Kampanya') : 'Henüz alt kampanya yok');

                        return (
                          <tr key={plan.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span>👑</span>
                                <span>{plan.name}</span>
                              </div>
                              {plan.clientName && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Building2 size={12} /> {plan.clientName}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 0.85rem' }}>
                              {plan.period && (
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '3px' }}>
                                  <Calendar size={12} color="var(--brand-primary)" /> {plan.period}
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                                {plan.tags && plan.tags.length > 0 ? (
                                  plan.tags.map((t, idx) => (
                                    <span key={idx} style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)', fontWeight: 600 }}>
                                      {t}
                                    </span>
                                  ))
                                ) : (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 0.85rem', maxWidth: '280px' }}>
                              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--brand-primary)', marginBottom: '2px' }}>
                                {subCount} Alt Kampanya
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={subSummary}>
                                {subSummary}
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 0.85rem' }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                                ₺{plan.monthlyBudget?.toLocaleString('tr-TR')}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                ₺{Math.round((plan.monthlyBudget || 0) / 30.4).toLocaleString('tr-TR')} / gün
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {plan.createdAt ? new Date(plan.createdAt).toLocaleString('tr-TR') : '—'}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleLoadSavedMasterPlan(plan)}
                                  className="btn-primary"
                                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  <FolderDown size={13} />
                                  <span>Planı Yükle & Aç</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm(`"${plan.name}" planını silmek istediğinize emin misiniz?`)) {
                                      await ApiService.deleteForecastPlan(plan.id);
                                      loadSavedPlans();
                                    }
                                  }}
                                  className="btn-ghost"
                                  style={{ color: 'var(--danger)', padding: '0.35rem 0.5rem' }}
                                  title="Planı Sil"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Step 2 Bottom Navigation & Save Action Bar */}
              <div className="card" style={{ 
                padding: '0.85rem 1.25rem', 
                backgroundColor: 'var(--bg-surface-elevated)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                flexWrap: 'wrap', 
                gap: '0.85rem',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <ArrowLeft size={15} />
                    <span>2. Adıma (Seçili Kelimeler) Geri Dön</span>
                  </button>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Alt Kampanya: <strong style={{ color: 'var(--text-primary)' }}>{activeSubCampaign?.name || 'Ana Kampanya'}</strong> • Bütçe: <strong style={{ color: 'var(--brand-primary)' }}>₺{monthlyBudget.toLocaleString('tr-TR')}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={handleSavePlan}
                    className="btn-primary"
                    style={{ 
                      fontSize: '0.85rem', 
                      padding: '0.55rem 1.35rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.45rem', 
                      fontWeight: 600,
                      backgroundColor: (planSaveSuccess || isStep3Completed) ? '#10b981' : undefined
                    }}
                  >
                    {planSaveSuccess || isStep3Completed ? <Check size={16} /> : <Save size={16} />}
                    <span>{planSaveSuccess ? 'Alt Kampanya Çatı Plana Kaydedildi!' : (isStep3Completed ? 'Alt Kampanya Çatı Plana Kayıtlı' : 'Alt Kampanyayı Çatı Plana Kaydet')}</span>
                    {!planSaveSuccess && !isStep3Completed && <ArrowRight size={15} />}
                  </button>
                </div>
              </div>

            </div>
          )}

            </div>
          )}

        </div>
      )}

      {/* 👑 New Master Plan Creation Wizard Modal */}
      {isAddMasterPlanModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div 
            className="card" 
            style={{ 
              width: '100%', 
              maxWidth: '560px', 
              backgroundColor: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>👑</span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Yeni Çatı Kampanya Oluştur
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Müşteri, dönem ve ilk alt kampanya ayarlarını belirleyin.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddMasterPlanModalOpen(false)}
                className="btn-ghost"
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Master Plan Name */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                Çatı Kampanya / Plan Adı:
              </label>
              <input
                type="text"
                value={newMasterName}
                onChange={(e) => setNewMasterName(e.target.value)}
                placeholder="Örn: Temmuz 2026 Büyüme & Lead Kampanyası..."
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            {/* Client / Brand */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                Müşteri / Marka Adı:
              </label>
              <input
                type="text"
                value={newMasterClient}
                onChange={(e) => setNewMasterClient(e.target.value)}
                placeholder="Örn: Acme Sağlık Turizmi"
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            {/* Campaign Start & End Dates with Quick Preset Shortcuts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Kampanya Planlama Tarihleri:
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                  {formatCampaignDates(newMasterStartDate, newMasterEndDate)}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    Başlangıç Tarihi:
                  </label>
                  <input
                    type="date"
                    value={newMasterStartDate}
                    onChange={(e) => {
                      setNewMasterStartDate(e.target.value);
                      setNewMasterPeriod(formatCampaignDates(e.target.value, newMasterEndDate));
                    }}
                    style={{ width: '100%', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    Bitiş Tarihi:
                  </label>
                  <input
                    type="date"
                    value={newMasterEndDate}
                    onChange={(e) => {
                      setNewMasterEndDate(e.target.value);
                      setNewMasterPeriod(formatCampaignDates(newMasterStartDate, e.target.value));
                    }}
                    style={{ width: '100%', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Date Quick Shortcuts */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hızlı Seçim:</span>
                {[
                  { label: 'Bu Ay', fn: () => getMonthDateRange(0) },
                  { label: 'Gelecek Ay', fn: () => getMonthDateRange(1) },
                  { label: '3 Aylık (Çeyrek)', fn: () => getQuarterDateRange(0) },
                  { label: 'Yıllık', fn: () => {
                    const y = new Date().getFullYear();
                    return { start: `${y}-01-01`, end: `${y}-12-31` };
                  }}
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const range = preset.fn();
                      setNewMasterStartDate(range.start);
                      setNewMasterEndDate(range.end);
                      setNewMasterPeriod(formatCampaignDates(range.start, range.end));
                    }}
                    className="btn-ghost"
                    style={{ fontSize: '0.7rem', padding: '2px 7px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)' }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                Kampanya Etiketleri:
              </label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                {newMasterTags.map(t => (
                  <span key={t} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {t}
                    <button type="button" onClick={() => handleRemoveMasterTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  placeholder="+ Etiket (#Temmuz2026, #B2B, #Sağlık)..."
                  value={newMasterTagInput}
                  onChange={(e) => setNewMasterTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMasterTag();
                    }
                  }}
                  style={{ flex: 1, fontSize: '0.8rem' }}
                />
                <button
                  type="button"
                  onClick={handleAddMasterTag}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                >
                  Ekle
                </button>
              </div>
            </div>

            {/* Info Notice about Sub-Campaigns */}
            <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span>💡</span>
              <span>
                <strong>Not:</strong> Reklam dili, hedef pazarlar/lokasyonlar ve kanal bütçeleri oluşturduktan sonra alt kampanyalar içerisinde ayrı ayrı yönetilecektir.
              </span>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.65rem', borderTop: '1px solid var(--border-default)', paddingTop: '0.85rem' }}>
              <button
                type="button"
                onClick={() => setIsAddMasterPlanModalOpen(false)}
                className="btn-secondary"
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem' }}
              >
                İptal
              </button>

              <button
                type="button"
                onClick={handleCreateNewMasterPlan}
                className="btn-primary"
                style={{ fontSize: '0.82rem', padding: '0.5rem 1.15rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <span>👑 Çatı Kampanyayı Oluştur & Stüdyoyu Aç</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📍 Google Ads Geo-Targeting / Location Modal */}
      {isLocationModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--brand-primary)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.12)', color: 'var(--brand-primary)' }}>
                  <Globe size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span>Hedef Pazar & Lokasyon Seçimi</span>
                    <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                      <Sparkles size={10} /> Google Ads API
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Google Ads resmi veri tabanından ülke, şehir veya ilçe arayarak ekleyin.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="btn-ghost"
                style={{ padding: '6px', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Location Input Mode Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setLocationInputMode('SINGLE')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-xs)',
                  border: locationInputMode === 'SINGLE' ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                  backgroundColor: locationInputMode === 'SINGLE' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface)',
                  color: locationInputMode === 'SINGLE' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <Search size={14} /> Tek Tek Ara
              </button>
              <button
                type="button"
                onClick={() => setLocationInputMode('BULK')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-xs)',
                  border: locationInputMode === 'BULK' ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                  backgroundColor: locationInputMode === 'BULK' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface)',
                  color: locationInputMode === 'BULK' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <ListPlus size={15} /> 📋 Toplu Konum Ekle
              </button>
            </div>

            {/* Mode 1: Single Search */}
            {locationInputMode === 'SINGLE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Lokasyon Ara (Şehir, İlçe, Ülke veya Eyalet):
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="örn: Alanya, Kadıköy, İstanbul, Antalya, Bodrum, Berlin, Dubai, London..."
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      paddingLeft: '2.5rem',
                      paddingRight: isSearchingLocations || locationSearchQuery ? '2.5rem' : '1rem',
                      height: '42px',
                      fontSize: '0.875rem',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1.5px solid var(--brand-primary)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                  {isSearchingLocations ? (
                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                      <RefreshCw size={15} className="animate-spin" color="var(--brand-primary)" />
                    </div>
                  ) : locationSearchQuery ? (
                    <button
                      type="button"
                      onClick={() => setLocationSearchQuery('')}
                      className="btn-ghost"
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }}
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>

                {/* Autocomplete Suggestions Dropdown Panel */}
                {locationSearchQuery.trim().length > 0 && (
                  <div style={{
                    marginTop: '0.25rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    zIndex: 100
                  }}>
                    {locationSearchResults.length > 0 ? (
                      locationSearchResults.map((loc) => {
                        const isSelected = selectedLocations.some(l => l.id === loc.id || l.name.toLowerCase() === loc.name.toLowerCase());
                        return (
                          <div
                            key={loc.id}
                            onClick={() => toggleLocation(loc)}
                            style={{
                              padding: '0.65rem 0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--border-subtle)',
                              backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                              transition: 'background-color 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span style={{ fontSize: '1.1rem' }}>{loc.flag || '📍'}</span>
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                                  {loc.name}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {loc.canonicalName}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                                {getLocationTypeLabel(loc.targetType)}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: loc.reach ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                                {formatReachNumber(loc.reach)}
                              </span>
                              <button
                                type="button"
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: 'var(--radius-xs)',
                                  border: isSelected ? '1px solid #10b981' : '1px solid var(--brand-primary)',
                                  backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                                  color: isSelected ? '#10b981' : 'var(--brand-primary)',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                              >
                                {isSelected ? '✓ Eklendi' : '+ Ekle'}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : !isSearchingLocations ? (
                      <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        "{locationSearchQuery}" için sonuç bulunamadı. Lütfen farklı bir şehir veya ilçe adı yazın.
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Bulk Location Input */}
            {locationInputMode === 'BULK' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', border: '1.5px solid var(--brand-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ListPlus size={16} color="var(--brand-primary)" />
                    <span>Toplu Konum Listesi Yapıştırın:</span>
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Her satıra bir şehir/ülke veya virgülle ayırın
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={bulkLocationText}
                  onChange={(e) => setBulkLocationText(e.target.value)}
                  placeholder={"Almaty\nAstana\nBishkek\nTashkent\nOsh\nİstanbul\nBerlin\nLondon\nDubai"}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    fontSize: '0.82rem',
                    fontFamily: 'monospace',
                    lineHeight: '1.5',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-xs)',
                    resize: 'vertical'
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleBatchVerifyLocations}
                    disabled={isBatchSearchingLocations || !bulkLocationText.trim()}
                    className="btn-primary"
                    style={{
                      padding: '0.45rem 1rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem'
                    }}
                  >
                    {isBatchSearchingLocations ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Google Ads API ile Eşleştiriliyor...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>⚡ Konumları Eşle & Doğrula</span>
                      </>
                    )}
                  </button>

                  {bulkLocationText.trim() && (
                    <button
                      type="button"
                      onClick={() => { setBulkLocationText(''); setBatchMatchedLocations([]); setBatchUnmatchedQueries([]); }}
                      className="btn-ghost"
                      style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                    >
                      Metni Temizle
                    </button>
                  )}
                </div>

                {/* Batch Verification Results */}
                {batchMatchedLocations.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={15} />
                        <span>Eşleşen Resmi Konumlar ({batchMatchedLocations.length}):</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedBatchLocationIds(new Set(batchMatchedLocations.map(l => l.id)))}
                          className="btn-ghost"
                          style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', padding: '2px 5px' }}
                        >
                          Tümünü Seç
                        </button>
                        <span style={{ color: 'var(--border-default)' }}>|</span>
                        <button
                          type="button"
                          onClick={() => setSelectedBatchLocationIds(new Set())}
                          className="btn-ghost"
                          style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '2px 5px' }}
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto', padding: '0.25rem' }}>
                      {batchMatchedLocations.map(loc => {
                        const isChecked = selectedBatchLocationIds.has(loc.id);
                        return (
                          <div
                            key={loc.id}
                            onClick={() => {
                              const next = new Set(selectedBatchLocationIds);
                              if (next.has(loc.id)) next.delete(loc.id);
                              else next.add(loc.id);
                              setSelectedBatchLocationIds(next);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.3rem 0.6rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                              border: isChecked ? '1.5px solid #10b981' : '1px solid var(--border-default)',
                              backgroundColor: isChecked ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-elevated)',
                              color: isChecked ? '#10b981' : 'var(--text-primary)',
                              fontWeight: isChecked ? 600 : 400
                            }}
                          >
                            <span>{isChecked ? '✓' : '○'}</span>
                            <span>{loc.flag || '📍'}</span>
                            <span>{loc.name}</span>
                            <span style={{ fontSize: '0.66rem', opacity: 0.75 }}>({loc.canonicalName})</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action buttons to apply matched */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleApplyBatchLocations('APPEND')}
                        disabled={selectedBatchLocationIds.size === 0}
                        className="btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 600 }}
                      >
                        ✓ Seçili Konumları Listeye Ekle ({selectedBatchLocationIds.size} Bölge)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyBatchLocations('REPLACE')}
                        disabled={selectedBatchLocationIds.size === 0}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                      >
                        🔄 Mevcutları Temizle & Sadece Bunları Kullan
                      </button>
                    </div>
                  </div>
                )}

                {/* Unmatched Notice */}
                {batchUnmatchedQueries.length > 0 && (
                  <div style={{ padding: '0.6rem 0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', color: '#ef4444' }}>
                    <strong>⚠️ Eşleşmeyen Konumlar ({batchUnmatchedQueries.length}):</strong> {batchUnmatchedQueries.join(', ')}
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Bu konumlar Google Ads resmi coğrafi veritabanında bulunamadı. Lütfen yazılışını kontrol edin.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Selected Locations Chips & Save Preset Action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Seçili Hedef Lokasyonlar ({selectedLocations.length}):
                  </label>
                  {selectedLocations.length > 1 && (
                    <button
                      type="button"
                      onClick={handleClearAllLocations}
                      className="btn-ghost"
                      style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: 'var(--radius-xs)' }}
                    >
                      Tümünü Temizle
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Seçili: <strong style={{ color: 'var(--brand-primary)' }}>{selectedLocations.length} Bölge</strong>
                  </span>
                  {!isSavingPreset ? (
                    <button
                      type="button"
                      onClick={() => setIsSavingPreset(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--brand-primary)',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        color: 'var(--brand-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <Bookmark size={13} /> Bu Seti Kaydet
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Inline Save Preset Form */}
              {isSavingPreset && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 0.8rem',
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  border: '1.5px solid var(--brand-primary)',
                  borderRadius: 'var(--radius-xs)',
                  marginTop: '0.1rem'
                }}>
                  <Bookmark size={16} color="var(--brand-primary)" />
                  <input
                    type="text"
                    placeholder="Lokasyon Paketi Adı (örn: BDT & Orta Asya 14 Şehir, Körfez Ülkeleri...)"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveLocationPreset()}
                    autoFocus
                    style={{
                      flex: 1,
                      height: '32px',
                      fontSize: '0.8rem',
                      padding: '0 0.65rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-xs)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveLocationPreset}
                    disabled={!newPresetName.trim()}
                    className="btn-primary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Save size={13} /> Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsSavingPreset(false); setNewPresetName(''); }}
                    className="btn-ghost"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    İptal
                  </button>
                </div>
              )}

              {/* Feedback Success Message */}
              {presetSaveSuccessMessage && (
                <div style={{
                  padding: '0.4rem 0.65rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid #10b981',
                  borderRadius: 'var(--radius-xs)',
                  color: '#10b981',
                  fontSize: '0.76rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600
                }}>
                  <CheckCircle2 size={14} />
                  <span>{presetSaveSuccessMessage}</span>
                </div>
              )}

              {/* Selected Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', minHeight: '38px', padding: '0.5rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                {selectedLocationsGrouped.map(loc => (
                  <div
                    key={loc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.78rem'
                    }}
                  >
                    <span>{loc.flag || '📍'}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{loc.name}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      ({getLocationTypeLabel(loc.targetType)})
                    </span>
                    {selectedLocations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLocation(loc.id)}
                        className="btn-ghost"
                        style={{ padding: '1px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Saved Presets Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>⭐ Özel Kayıtlı Lokasyon Paketlerim ({savedLocationPresets.length}):</span>
              </div>
              {savedLocationPresets.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {savedLocationPresets.map(preset => (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyLocationPreset(preset)}
                      title={`Tıkla ve Uygula: ${preset.locations.map(l => (l.flag || '📍') + ' ' + l.name).join(', ')}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.3rem 0.65rem',
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        border: '1.5px solid rgba(37, 99, 235, 0.35)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>⭐</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{preset.name}</span>
                      <span className="badge badge-active" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                        {preset.locations.length} Bölge
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteLocationPreset(preset.id, e)}
                        title="Bu kayıtlı paketi sil"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2px',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          marginLeft: '2px'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  fontSize: '0.73rem',
                  color: 'var(--text-muted)',
                  padding: '0.45rem 0.65rem',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px dashed var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <Bookmark size={13} color="var(--brand-primary)" />
                  <span>Henüz özel kayıtlı paketiniz yok. Şehir veya ülkeleri seçtikten sonra yukarıdaki <strong>"Bu Seti Kaydet"</strong> butonuyla kendi hazır lokasyon grubunuzu oluşturabilirsiniz.</span>
                </div>
              )}
            </div>

            {/* Quick System Presets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={12} color="var(--brand-primary)" />
                <span>⚡ Hızlı Hazır Sistem Paketleri:</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {SYSTEM_LOCATION_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedLocations(preset.locs);
                      setPresetSaveSuccessMessage(`"${preset.name}" paketi seçildi (${preset.locs.length} bölge).`);
                      setTimeout(() => setPresetSaveSuccessMessage(''), 2500);
                    }}
                    className="btn-ghost"
                    title={preset.description}
                    style={{
                      fontSize: '0.74rem',
                      padding: '0.3rem 0.65rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{preset.name}</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.75, backgroundColor: 'var(--bg-app)', padding: '1px 5px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      {preset.locs.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                ✓ Lokasyonları Onayla ({selectedLocations.length} Bölge)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ CPC Imputation & Multiplier Settings Modal */}
      {showCpcSettingsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowCpcSettingsModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                  <SlidersHorizontal size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    TBM Tahmin & Rekabet Çarpanı Ayarları
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Düşük hacimli kelimeler için küme ortalaması ve niyet çarpanı ile dinamik TBM tamamlama
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCpcSettingsModal(false)}
                className="btn-ghost"
                style={{ padding: '0.35rem', borderRadius: '50%', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Info Callout */}
            <div style={{
              backgroundColor: 'rgba(139, 92, 246, 0.06)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'flex-start'
            }}>
              <Info size={16} color="#8b5cf6" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Neden TBM Tahmini Yapılır?</strong> Google Ads API, arama hacmi düşük olan veya son 30 günde açık artırma verisi kısıtlı kelimeler için TBM aralığı (0 / boş) döndürmez. Roasist, bu kelimeleri ait oldukları STAG kümesinin ağırlıklı ortalaması ve aşağıdaki niyet çarpanlarıyla tamamlar.
              </div>
            </div>

            {/* Auto-Impute Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)'
            }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Eksik TBM'leri Küme Ortalamasıyla Otomatik Tamamla
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Kapalıyken Google'dan TBM gelmeyen kelimeler ₺0.00 görünür.
                </div>
              </div>
              <input
                type="checkbox"
                checked={cpcImputationSettings.autoImputeMissingCpc}
                onChange={(e) => setCpcImputationSettings(prev => ({ ...prev, autoImputeMissingCpc: e.target.checked }))}
                style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
              />
            </div>

            {/* Multiplier Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Arama Niyetine Göre Rekabet Çarpanları
              </div>

              {/* 1. Transactional Multiplier */}
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>🎯 Satın Alma & Dönüşüm Niyeti</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                      "satın al", "fiyatı", "kiralık", "başvuru" gibi yüksek dönüşümlü aramalar
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      {cpcImputationSettings.transactionalMultiplier.toFixed(2)}x
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="range"
                    min="0.50"
                    max="3.00"
                    step="0.05"
                    value={cpcImputationSettings.transactionalMultiplier}
                    onChange={(e) => setCpcImputationSettings(prev => ({ ...prev, transactionalMultiplier: parseFloat(e.target.value) }))}
                    style={{ flex: 1, accentColor: '#10b981', cursor: 'pointer' }}
                  />
                  <input
                    type="number"
                    min="0.50"
                    max="3.00"
                    step="0.05"
                    value={cpcImputationSettings.transactionalMultiplier}
                    onChange={(e) => setCpcImputationSettings(prev => ({ ...prev, transactionalMultiplier: parseFloat(e.target.value) || 1.0 }))}
                    style={{ width: '65px', fontSize: '0.75rem', padding: '0.25rem 0.4rem', textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* 2. Commercial Multiplier */}
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-primary)' }}>🔍 Ticari & Karşılaştırma Niyeti</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                      "en iyi", "karşılaştırma", "projeler", "hizmetler" gibi araştırma aramaları
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      {cpcImputationSettings.commercialMultiplier.toFixed(2)}x
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="range"
                    min="0.50"
                    max="3.00"
                    step="0.05"
                    value={cpcImputationSettings.commercialMultiplier}
                    onChange={(e) => setCpcImputationSettings(prev => ({ ...prev, commercialMultiplier: parseFloat(e.target.value) }))}
                    style={{ flex: 1, accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                  />
                  <input
                    type="number"
                    min="0.50"
                    max="3.00"
                    step="0.05"
                    value={cpcImputationSettings.commercialMultiplier}
                    onChange={(e) => setCpcImputationSettings(prev => ({ ...prev, commercialMultiplier: parseFloat(e.target.value) || 1.0 }))}
                    style={{ width: '65px', fontSize: '0.75rem', padding: '0.25rem 0.4rem', textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* 3. Informational Multiplier */}
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b' }}>💡 Bilgi & Rehber Niyeti</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                      "nedir", "nasıl alınır", "şartları", "rehber" gibi üst huni bilgi aramaları
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      {cpcImputationSettings.informationalMultiplier.toFixed(2)}x
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="range"
                    min="0.50"
                    max="3.00"
                    step="0.05"
                    value={cpcImputationSettings.informationalMultiplier}
                    onChange={(e) => setCpcImputationSettings(prev => ({ ...prev, informationalMultiplier: parseFloat(e.target.value) }))}
                    style={{ flex: 1, accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                  <input
                    type="number"
                    min="0.50"
                    max="3.00"
                    step="0.05"
                    value={cpcImputationSettings.informationalMultiplier}
                    onChange={(e) => setCpcImputationSettings(prev => ({ ...prev, informationalMultiplier: parseFloat(e.target.value) || 0.85 }))}
                    style={{ width: '65px', fontSize: '0.75rem', padding: '0.25rem 0.4rem', textAlign: 'center' }}
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation Preview Box */}
            <div style={{
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px dashed var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                📊 Canlı Hesaplama Örneği (Küme TBM Ortalaması ₺10.00 ise):
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span>🎯 Satın Alma: <strong style={{ color: '#10b981' }}>₺{(10 * cpcImputationSettings.transactionalMultiplier).toFixed(2)}</strong></span>
                <span>🔍 Ticari: <strong style={{ color: 'var(--brand-primary)' }}>₺{(10 * cpcImputationSettings.commercialMultiplier).toFixed(2)}</strong></span>
                <span>💡 Bilgi: <strong style={{ color: '#f59e0b' }}>₺{(10 * cpcImputationSettings.informationalMultiplier).toFixed(2)}</strong></span>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setCpcImputationSettings({
                  transactionalMultiplier: 1.15,
                  commercialMultiplier: 1.00,
                  informationalMultiplier: 0.85,
                  autoImputeMissingCpc: true,
                })}
                className="btn-ghost"
                style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
              >
                Varsayılanlara Sıfırla
              </button>

              <button
                type="button"
                onClick={() => handleSaveCpcSettings()}
                className="btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem', fontWeight: 600 }}
              >
                ✓ Değişiklikleri Uygula & Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Campaign Report Export Customization Modal */}
      {exportModalState.isOpen && exportModalState.subCampaign && (
        <ExportCustomizationModal
          isOpen={exportModalState.isOpen}
          onClose={() => setExportModalState(prev => ({ ...prev, isOpen: false }))}
          subCampaign={exportModalState.subCampaign}
          initialFormat={exportModalState.format}
          onRenameSubCampaign={handleRenameSubCampaign}
          masterPlan={exportModalState.masterPlan || {
            name: planName,
            clientName: clientName,
            period: planPeriod,
            startDate: planStartDate,
            endDate: planEndDate
          }}
        />
      )}

    </div>
  );
};

