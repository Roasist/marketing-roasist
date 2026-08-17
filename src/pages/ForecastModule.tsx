import React, { useState, useEffect, useMemo } from 'react';
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
  Building2
} from 'lucide-react';
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
  GrowthScenario,
  CampaignPlatform,
  CampaignObjective,
  SubCampaignItem
} from '../types/forecast';
import { ApiService } from '../services/apiService';

export const DEFAULT_LOCATIONS: GeoTargetLocation[] = [
  {
    id: '2792',
    resourceName: 'geoTargetConstants/2792',
    name: 'Türkiye',
    canonicalName: 'Türkiye',
    countryCode: 'TR',
    targetType: 'Country',
    reach: 85000000,
    flag: '🇹🇷',
    cpcMultiplier: 1.0,
    volumeMultiplier: 1.0
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

  // 1. Deduplicate incoming list by normalized keyword string
  const uniqueKwList: KeywordMetric[] = [];
  const seenKws = new Set<string>();
  for (const kw of kwList) {
    const norm = kw.keyword.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!seenKws.has(norm)) {
      seenKws.add(norm);
      uniqueKwList.push(kw);
    }
  }

  const clusters: KeywordCluster[] = [];

  // 2. High-converting Granular STAG Theme Rules (Multi-Lingual: Russian, Turkish, English, German, Arabic)
  const stagRules = [
    // 1. Fiyat, Harç & Maliyetler (Pricing, Costs & Investment Amount)
    {
      id: 'stag_pricing',
      name: '💰 Fiyat, Harç & Maliyetler',
      icon: '💰',
      regex: /(?:^|[^\p{L}\p{N}])(цена|цены|цену|ценам|стоимост|стоимость|сколько стоит|расход|расходы|пошлин|пошлина|пошлины|тариф|тарифы|дешев|дешево|недорог|недорого|прайс|минимальн|fiyat|fiyatı|fiyatları|ücret|ücreti|ücretleri|maliyet|maliyeti|paket|paketleri|kaç para|ne kadar|masraf|harç|teklif al|bütçe|hesaplama|price|prices|pricing|cost|costs|fee|fees|package|packages|how much|budget|cheap|affordable|quote|rates|calculator|preise|preis|kosten|gebühr)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 2. Yatırım Yoluyla Vatandaşlık & CBI (Citizenship by Investment)
    {
      id: 'stag_cbi_investment',
      name: '💎 Yatırım Yoluyla Vatandaşlık (CBI)',
      icon: '💎',
      regex: /(?:^|[^\p{L}\p{N}])(за инвестиции|через инвестиции|инвестиции в недвижимость|инвестиционн|инвестиции|инвестор|инвесторов|инвестировать|yatırım yoluyla|yatırımla|yatırım ile|yatırımcı|gayrimenkul yatırımı|citizenship by investment|golden visa|cbi|investor visa|invest in property|investition|investor)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 3. Gayrimenkul & Daire Satın Alma (Real Estate & Property Buying)
    {
      id: 'stag_realestate',
      name: '🏢 Gayrimenkul & Konut Satın Alma',
      icon: '🏢',
      regex: /(?:^|[^\p{L}\p{N}])(купить квартиру|купить апартаменты|купить дом|купить виллу|купить жилье|купить|покупк|покупка|недвижим|недвижимость|недвижимости|квартир|квартира|квартиры|квартиру|вилл|вилла|виллы|новостройк|новостройка|новостройки|жк|жилой комплекс|апартамент|апартаменты|застройщик|застройщика|собственност|собственность|satılık daire|satılık konut|satılık villa|satılık mülk|satılık ev|kiralık daire|kiralık villa|konut projeleri|emlak|gayrimenkul|satılık|kiralık|daire|villa|ev|mülk|proje|rezidans|arsa|satın al|yazlık|penthouse|real estate|property|properties|apartment|apartments|villas|house|houses|flat|flats|buy property|for sale|wohnung|wohnungen|immobilien|kaufen)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 4. Hukuk & Danışmanlık Hizmetleri (Legal, Lawyers & Professional Help)
    {
      id: 'stag_legal_services',
      name: '⚖️ Hukuk, Avukat & Danışmanlık',
      icon: '⚖️',
      regex: /(?:^|[^\p{L}\p{N}])(юрист|юристы|юриста|адвокат|адвокаты|агентств|агентство|услуг|услуги|консультац|консультация|помощь|сопровожден|сопровождение|под ключ|специалист|эксперт|avukat|danışmanlık|danışmanı|hukuk|hukuk bürosu|ajans|ajansı|hizmet|hizmetleri|müşavirlik|lawyer|legal|services|agency|firm|consulting|consultant|attorney|expert|turnkey|anwalt|beratung|agentur)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 5. Başvuru, Evrak & Statü Kontrolü (Application, Documents & Status)
    {
      id: 'stag_application_process',
      name: '📜 Başvuru, Evrak & Statü Kontrolü',
      icon: '📜',
      regex: /(?:^|[^\p{L}\p{N}])(проверить статус|статус внж|статус|проверить|проверка|список документов|документ|документы|документов|пакет документов|подать|подача|подача заявления|анкета|сроки|срок действия|отказ|продлен|продление|şart|şartlar|şartları|evrak|evraklar|gerekli belgeler|gerekli|süreç|nasıl alınır|başvuru|başvurusu|başvuruları|status|requirements|conditions|documents|process|procedure|how to get|how to apply|eligibility|antrag|beantragen|voraussetzungen|dokumente)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 6. Turistik İkamet & Tatil (Tourist Residency & Travel)
    {
      id: 'stag_tourist_permit',
      name: '🏖️ Turistik İkamet (ВНЖ)',
      icon: '🏖️',
      regex: /(?:^|[^\p{L}\p{N}])(туристическ|туристический|туристического|туризм|турист|путешеств|отдых|отпуск|отель|гостиница|turistik|turizm|tatil|konaklama|otel|tourist|tourism|vacation|holiday|hotel|urlaub|ferien)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 7. Göç, Yaşam & Türkiye Rehberi (Living, Relocation & Life in Turkey)
    {
      id: 'stag_relocation_life',
      name: '🌍 Göç, Yaşam & Relokasyon',
      icon: '🌍',
      regex: /(?:^|[^\p{L}\p{N}])(жизнь в|жизнь|жизни|уровень жизни|переезд|переехать|эмиграц|эмиграция|иммиграц|иммиграция|релокац|релокация|россияне в|русские в|как переехать|yaşam|yaşam şartları|göç|yerleşim|living in|relocation|relocate|immigrate|leben in|auswandern)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 8. En İyi, Yorumlar & Tecrübeler (Reviews, Experiences & Best)
    {
      id: 'stag_reviews',
      name: '⭐ En İyi, Yorumlar & Tecrübeler',
      icon: '⭐',
      regex: /(?:^|[^\p{L}\p{N}])(отзывы|отзыв|лучший|лучшие|лучш|рейтинг|плюсы и минусы|опыт|форум|надежн|надежный|проверенный|сравнение|реальный опыт|истории|история|en iyi|en uygun|tavsiye|tavsiyeleri|yorum|yorumları|yorumlar|şikayet|karşılaştırma|güvenilir|tecrübe|deneyim|best|top|top rated|reviews|review|before and after|rating|ratings|comparison|compare|pros and cons|trusted|experience|forum|testimonials|erfahrungen|bewertung|erfahrung|vergleich)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 9. Türk Vatandaşlığı & Pasaport (Citizenship & Passport)
    {
      id: 'stag_citizenship_passport',
      name: '🏛️ Türk Vatandaşlığı & Pasaport',
      icon: '🏛️',
      regex: /(?:^|[^\p{L}\p{N}])(гражданств|гражданство|гражданства|паспорт|паспорта|турецкое гражданство|паспорт турции|vatandaşlık|vatandaslik|pasaport|türk vatandaşlığı|citizenship|passport|turkish citizenship|turkish passport|staatsbürgerschaft|pass|reisepass)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 10. İkamet İzni & Oturum (Residency & Residence Permit / ВНЖ и ПМЖ)
    {
      id: 'stag_residency_permit',
      name: '🪪 İkamet İzni & Oturum (ВНЖ)',
      icon: '🪪',
      regex: /(?:^|[^\p{L}\p{N}])(внж|пмж|икамет|вид на жительство|ikamet|oturum|oturum izni|ikamet izni|residence permit|residency|residence|aufenthalt|aufenthaltstitel|residenz)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 11. Lokasyon: Alanya, Antalya & Bölge (Location Specific)
    {
      id: 'stag_locations',
      name: '📍 Lokasyon: Alanya, Antalya & Bölge',
      icon: '📍',
      regex: /(?:^|[^\p{L}\p{N}])(алань|аланья|аланье|аланьи|аланью|анталь|анталья|анталии|анталию|стамбул|стамбуле|бодрум|мерсин|махмутlar|оба|кестель|каргыджак|авсалlar|у моря|первая линия|alanya|antalya|istanbul|bodrum|mersin|denize sıfır|seafront|beachfront)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 12. Otel, Konaklama & Tatil (Hotels & Vacation)
    {
      id: 'stag_hotel_tourism',
      name: '🏨 Otel, Konaklama & Tatil',
      icon: '🏨',
      regex: /(?:^|[^\p{L}\p{N}])(hotel|hotels|otel|otelleri|resort|resorts|pansiyon|pansiyonlar|butik otel|boutique hotel|apart otel|apart|all inclusive|her şey dahil|oda kahvaltı|bungalov|glamping|accommodation|stay)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 13. Klinik, Hastane & Uzmanlar (Medical & Clinics)
    {
      id: 'stag_clinics_medical',
      name: '🏥 Klinik, Hastane & Uzmanlar',
      icon: '🏥',
      regex: /(?:^|[^\p{L}\p{N}])(klinik|kliniği|klinikleri|hastane|hastanesi|doktor|doktoru|doktorları|uzman doktor|cerrah|cerrahı|diş hekimi|sağlık merkezi|tıp merkezi|estetik merkezi|saç ekim merkezi|saç ekimi|diş|estetik|tedavi|ameliyat|clinic|clinics|hospital|hospitals|surgeon|surgeons|physician|hair transplant|dental|aesthetic|surgery|treatment|medical|arzt|zahn|behandlung|клиник|клиника|больниц|больница|врач|хирург|пересадка волос|стоматолог|лечение|операция)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 14. Eğitim, Okul & Kurslar (Education & Schools)
    {
      id: 'stag_education',
      name: '🎓 Eğitim, Okul & Kurslar',
      icon: '🎓',
      regex: /(?:^|[^\p{L}\p{N}])(okul|okulu|okulları|ilkokul|ortaokul|lise|kolej|koleji|özel okul|butik okul|kurs|kursu|kursları|eğitim|eğitimi|eğitimleri|akademi|dershane|üniversite|öğrenci|school|schul|education|academy|college|university|student|tuition|schule|kolleg|ausbildung|школ|школа|колледж|курс|курсы|обучение|образование|академия|университет|студент)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 15. Kariyer & İş İlanları (Careers & Jobs)
    {
      id: 'stag_careers',
      name: '💼 Kariyer & İş İlanları',
      icon: '💼',
      regex: /(?:^|[^\p{L}\p{N}])(iş ilanı|iş ilanları|iş arama|eleman ilanı|eleman arayanlar|iş başvurusu|kariyer|istihdam|eleman|personel|job|jobs|career|careers|hiring|recruitment|employment|vacancy|vacancies|karriere|stellenangebot|stellenangebote|arbeit|bewerbung|работ|работа|ваканси|вакансии|трудоустройство|поиск работы|резюме|зарплата)(?:[^\p{L}\p{N}]|$)/ui
    },
    // 16. Otomotiv, Yazılım & Performans (Automotive & Tuning)
    {
      id: 'stag_automotive',
      name: '🏎️ Otomotiv, Yazılım & Performans',
      icon: '🏎️',
      regex: /(?:^|[^\p{L}\p{N}])(pedalbox|chip tuning|chiptuning|gaz pedalı|gaz pedal|gaz tepki|motor güç|araç yazılım|araç performans|dte systems|тюнинг|чип тюнинг|автомобиль|авто)(?:[^\p{L}\p{N}]|$)/ui
    }
  ];

  const assigned = new Map<string, KeywordMetric[]>();
  stagRules.forEach(r => assigned.set(r.id, []));
  const unassigned: KeywordMetric[] = [];

  // SINGLE-PASS MUTUALLY EXCLUSIVE CLASSIFIER WITH UNICODE MATCHING
  for (const kw of uniqueKwList) {
    let matched = false;
    for (const rule of stagRules) {
      if (rule.regex.test(kw.keyword)) {
        assigned.get(rule.id)!.push(kw);
        matched = true;
        break; // Match exactly one primary group!
      }
    }
    if (!matched) {
      unassigned.push(kw);
    }
  }

  // Add populated STAG groups
  for (const rule of stagRules) {
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

  // Core Service Variations (Unassigned)
  if (unassigned.length > 0) {
    const vol = unassigned.reduce((s, k) => s + k.monthlyVolume, 0);
    const cpcSum = unassigned.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0);
    clusters.push({
      id: 'stag_core_variations',
      name: '🎯 Ana Hizmet & Varyasyonlar',
      icon: '🎯',
      keywords: unassigned,
      totalVolume: vol,
      avgCpc: unassigned.length > 0 ? cpcSum / unassigned.length : 0,
      selectedCount: 0
    });
  }

  return clusters.sort((a, b) => b.totalVolume - a.totalVolume);
};

interface ForecastModuleProps {
  workspaceId?: string;
}

export const ForecastModule: React.FC<ForecastModuleProps> = ({ workspaceId }) => {
  // Stepper State: 1 = STAG Kelime Keşfi & Gruplar, 2 = 360° Medya Karması & Büyüme Simülatörü
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

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

  // Step 2: Target Locations (Google Keyword Planner Style Engine)
  const [selectedLocations, setSelectedLocations] = useState<GeoTargetLocation[]>(DEFAULT_LOCATIONS);
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>('');
  const [locationSearchResults, setLocationSearchResults] = useState<GeoTargetLocation[]>([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState<boolean>(false);

  // Growth Scenario Projection (Muhafazakar / Beklenen / Agresif)
  const [growthScenario, setGrowthScenario] = useState<GrowthScenario>('REALISTIC');

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
  const [isAddCampaignModalOpen, setIsAddCampaignModalOpen] = useState<boolean>(false);

  // New Sub-Campaign Wizard Form State
  const [newCampName, setNewCampName] = useState<string>('');
  const [newCampPlatform, setNewCampPlatform] = useState<CampaignPlatform>('GOOGLE');
  const [newCampObjective, setNewCampObjective] = useState<CampaignObjective>('GOOGLE_SEARCH');
  const [newCampLang, setNewCampLang] = useState<string>('en');
  const [newCampBudget, setNewCampBudget] = useState<number>(30000);

  // Negative Keywords State
  const [negativeCategories, setNegativeCategories] = useState<NegativeCategory[]>([]);
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null);

  // Saved Plans State
  const [savedPlans, setSavedPlans] = useState<ForecastPlan[]>([]);
  const [planSaveSuccess, setPlanSaveSuccess] = useState(false);

  // Total Master Monthly Budget
  const totalMasterMonthlyBudget = useMemo(() => {
    return subCampaigns.reduce((sum, c) => sum + (c.monthlyBudget || 0), 0);
  }, [subCampaigns]);

  // Sync active sub-campaign snapshot
  const syncActiveSubCampaign = () => {
    setSubCampaigns(prev => prev.map(c => {
      if (c.id !== activeSubCampaignId) return c;
      const selectedKws = Array.from(selectedKeywordIds).map(id => keywords.find(k => k.id === id)).filter(Boolean) as KeywordMetric[];
      return {
        ...c,
        targetUrl: mode === 'URL' ? query : '',
        seedKeywords: mode === 'KEYWORDS' ? query : '',
        monthlyBudget,
        discoveredKeywords: keywords,
        selectedKeywords: selectedKws,
        negativeCategories,
        targetLocations: selectedLocations,
        businessModel,
        languageCode: targetLanguage,
        parameters: {
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
    }));
  };

  // Switch to another sub-campaign
  const handleSelectSubCampaign = (campId: string) => {
    if (campId === activeSubCampaignId) return;
    syncActiveSubCampaign();
    const target = subCampaigns.find(c => c.id === campId);
    if (!target) return;

    setActiveSubCampaignId(campId);
    setKeywords(target.discoveredKeywords || []);
    setSelectedKeywordIds(new Set((target.selectedKeywords || []).map(k => k.id)));
    setNegativeCategories(target.negativeCategories || []);
    if (target.targetLocations && target.targetLocations.length > 0) {
      setSelectedLocations(target.targetLocations);
    }
    if (target.languageCode) {
      setTargetLanguage(target.languageCode);
    }
    if (target.monthlyBudget) {
      setMonthlyBudget(target.monthlyBudget);
    }
    if (target.businessModel) {
      setBusinessModel(target.businessModel);
    }
    if (target.targetUrl || target.seedKeywords) {
      setQuery(target.targetUrl || target.seedKeywords || '');
      setMode(target.targetUrl ? 'URL' : 'KEYWORDS');
    }
    if (target.parameters) {
      if (target.parameters.targetImpressionShare !== undefined) setTargetImpressionShare(target.parameters.targetImpressionShare);
      if (target.parameters.expectedCtr !== undefined) setExpectedCtr(target.parameters.expectedCtr);
      if (target.parameters.searchLeadCr !== undefined) setLeadConversionRate(target.parameters.searchLeadCr);
      if (target.parameters.searchHealthyLeadRate !== undefined) setLeadCloseRate(target.parameters.searchHealthyLeadRate);
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

    if (target.platform === 'META') {
      setActiveChannelTab('META_ADS');
      setCurrentStep(2);
    } else if (target.platform === 'YOUTUBE') {
      setActiveChannelTab('YOUTUBE');
      setCurrentStep(2);
    } else if (target.platform === 'GOOGLE' && target.objective === 'GOOGLE_GDN') {
      setActiveChannelTab('GDN');
      setCurrentStep(2);
    } else if (target.platform === 'GOOGLE' && target.objective === 'GOOGLE_SEARCH') {
      setActiveChannelTab('GOOGLE_SEARCH');
    }
  };

  // Create new Sub-Campaign
  const handleCreateNewSubCampaign = async () => {
    syncActiveSubCampaign();
    const langObj = GOOGLE_ADS_LANGUAGES.find(l => l.code === newCampLang) || { code: newCampLang, name: newCampLang, nativeName: newCampLang, flag: '🌐' };
    
    // Suggest default locations by language
    let defaultLocs = DEFAULT_LOCATIONS;
    if (newCampLang === 'en') {
      defaultLocs = [{ id: '2826', resourceName: 'geoTargetConstants/2826', name: 'Birleşik Krallık', canonicalName: 'Birleşik Krallık', countryCode: 'GB', targetType: 'Country', reach: 67000000, flag: '🇬🇧', cpcMultiplier: 3.2, volumeMultiplier: 1.3 }];
    } else if (newCampLang === 'ru') {
      defaultLocs = [{ id: '2643', resourceName: 'geoTargetConstants/2643', name: 'Rusya', canonicalName: 'Rusya', countryCode: 'RU', targetType: 'Country', reach: 145000000, flag: '🇷🇺', cpcMultiplier: 1.6, volumeMultiplier: 1.8 }];
    } else if (newCampLang === 'ar') {
      defaultLocs = [{ id: '1000010', resourceName: 'geoTargetConstants/1000010', name: 'Dubai', canonicalName: 'Dubai, Birleşik Arap Emirlikleri', countryCode: 'AE', targetType: 'City', reach: 3400000, flag: '🇦🇪', cpcMultiplier: 2.4, volumeMultiplier: 0.8 }];
    } else if (newCampLang === 'de') {
      defaultLocs = [{ id: '2276', resourceName: 'geoTargetConstants/2276', name: 'Almanya', canonicalName: 'Almanya', countryCode: 'DE', targetType: 'Country', reach: 84000000, flag: '🇩🇪', cpcMultiplier: 2.8, volumeMultiplier: 1.4 }];
    }

    const newId = 'sub_' + Date.now();
    const campTitle = newCampName.trim() || `${newCampPlatform} (${langObj.name})`;
    const newCamp: SubCampaignItem = {
      id: newId,
      name: campTitle,
      platform: newCampPlatform,
      objective: newCampObjective,
      languageCode: newCampLang,
      languageName: langObj.name,
      languageFlag: langObj.flag,
      targetLocations: defaultLocs,
      monthlyBudget: newCampBudget,
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
    setSelectedLocations(defaultLocs);
    setTargetLanguage(newCampLang);
    setMonthlyBudget(newCampBudget);
    setQuery('');
    setIsAddCampaignModalOpen(false);
    setNewCampName('');
    
    // Switch channel sub tab to match objective
    if (newCampPlatform === 'META') {
      setActiveChannelTab('META_ADS');
      setCurrentStep(2);
    } else if (newCampPlatform === 'YOUTUBE') {
      setActiveChannelTab('YOUTUBE');
      setCurrentStep(2);
    } else if (newCampPlatform === 'GOOGLE' && newCampObjective === 'GOOGLE_GDN') {
      setActiveChannelTab('GDN');
      setCurrentStep(2);
    } else if (newCampPlatform === 'GOOGLE' && newCampObjective === 'GOOGLE_SEARCH') {
      setActiveChannelTab('GOOGLE_SEARCH');
      setCurrentStep(1);
    }

    // Persist updated plan with new sub-campaign immediately
    try {
      const formattedPeriod = formatCampaignDates(planStartDate, planEndDate, planPeriod);
      await ApiService.saveForecastPlan({
        workspaceId,
        name: planName.trim() || `${clientName} - ${formattedPeriod} Medya Planı`,
        clientName: clientName.trim(),
        startDate: planStartDate,
        endDate: planEndDate,
        period: formattedPeriod,
        tags: planTags,
        targetUrl: mode === 'URL' ? query : '',
        seedKeywords: mode === 'KEYWORDS' ? query : '',
        detectedLanguage: newCampLang,
        detectedLanguageName: langObj.name,
        monthlyBudget: updatedSubs.reduce((acc, curr) => acc + (curr.monthlyBudget || 0), 0),
        selectedKeywords: [],
        simulationResult: simulation,
        negativeKeywords: [],
        targetCountries: defaultLocs.map(c => c.name),
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
    if (plan.name) setPlanName(plan.name);
    if (plan.clientName) setClientName(plan.clientName);
    if (plan.startDate) setPlanStartDate(plan.startDate);
    if (plan.endDate) setPlanEndDate(plan.endDate);
    setPlanPeriod(plan.period || formatCampaignDates(plan.startDate, plan.endDate, plan.period));
    if (plan.tags) setPlanTags(plan.tags);

    if (Array.isArray(plan.subCampaigns)) {
      setSubCampaigns(plan.subCampaigns);
      if (plan.subCampaigns.length > 0) {
        const chosenSub = targetSubId 
          ? (plan.subCampaigns.find(c => c.id === targetSubId) || plan.subCampaigns[0])
          : plan.subCampaigns[0];
        
        setActiveSubCampaignId(chosenSub.id);
        setKeywords(chosenSub.discoveredKeywords || plan.selectedKeywords || []);
        setSelectedKeywordIds(new Set((chosenSub.selectedKeywords || plan.selectedKeywords || []).map(k => k.id)));
        setNegativeCategories(chosenSub.negativeCategories || plan.negativeKeywords || []);
        if (chosenSub.targetLocations && chosenSub.targetLocations.length > 0) {
          setSelectedLocations(chosenSub.targetLocations);
        }
        if (chosenSub.languageCode) setTargetLanguage(chosenSub.languageCode);
        if (chosenSub.monthlyBudget) setMonthlyBudget(chosenSub.monthlyBudget);
        if (chosenSub.targetUrl || chosenSub.seedKeywords) {
          setQuery(chosenSub.targetUrl || chosenSub.seedKeywords || '');
          setMode(chosenSub.targetUrl ? 'URL' : 'KEYWORDS');
        }

        if (chosenSub.platform === 'META') setActiveChannelTab('META_ADS');
        else if (chosenSub.platform === 'YOUTUBE') setActiveChannelTab('YOUTUBE');
        else if (chosenSub.platform === 'GOOGLE') setActiveChannelTab('GOOGLE_SEARCH');
        else setActiveChannelTab('OMNICHANNEL');
      } else {
        // Plan has 0 sub-campaigns: keep clean empty state!
        setActiveSubCampaignId(null);
        setKeywords([]);
        setSelectedKeywordIds(new Set());
        setNegativeCategories([]);
        setMonthlyBudget(0);
        setQuery('');
        setActiveChannelTab('OMNICHANNEL');
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
          targetImpressionShare: 70,
          expectedCtr: 7.5,
          searchLeadCr: 3.5,
          searchHealthyLeadRate: 50,
          searchCloseRate: 10
        }
      };
      setSubCampaigns([legacySub]);
      setActiveSubCampaignId(legacySub.id);
      setKeywords(plan.selectedKeywords || []);
      setSelectedKeywordIds(new Set((plan.selectedKeywords || []).map(k => k.id)));
      setNegativeCategories(plan.negativeKeywords || []);
      if (plan.monthlyBudget) setMonthlyBudget(plan.monthlyBudget);
      if (plan.targetUrl || plan.seedKeywords) setQuery(plan.targetUrl || plan.seedKeywords || '');
      setActiveChannelTab('GOOGLE_SEARCH');
    }

    setViewMode('STUDIO');
  };

  // Back to Portfolio
  const handleBackToPortfolio = () => {
    syncActiveSubCampaign();
    loadSavedPlans();
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
        loadSavedPlans();
      } catch (err: any) {
        alert('Plan silinirken hata: ' + err.message);
      }
    }
  };

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
    return savedPlans.reduce((sum, p) => sum + (p.subCampaigns?.length || 1), 0);
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

    try {
      const res = await ApiService.discoverKeywords({
        query: q.trim(),
        mode: m,
        language: targetLanguage !== 'auto' ? targetLanguage : undefined,
        countryCode: selectedLocations[0]?.countryCode || undefined,
        geoTargetConstants: selectedLocations.map(l => l.id),
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

  // Combined Multipliers for Multi-Location Targeting
  const totalVolumeMultiplier = useMemo(() => {
    if (selectedLocations.length === 0) return 1.0;
    return selectedLocations.reduce((sum, loc) => sum + (loc.volumeMultiplier ?? 1.0), 0);
  }, [selectedLocations]);

  const blendedCpcMultiplier = useMemo(() => {
    if (selectedLocations.length === 0) return 1.0;
    const totalVol = selectedLocations.reduce((sum, loc) => sum + (loc.volumeMultiplier ?? 1.0), 0);
    if (totalVol === 0) return 1.0;
    const weightedSum = selectedLocations.reduce((sum, loc) => {
      const mult = loc.cpcMultiplier ?? (loc.countryCode === 'TR' ? 1.0 : (loc.countryCode === 'DE' ? 2.8 : (loc.countryCode === 'US' || loc.countryCode === 'GB' ? 3.2 : 1.8)));
      const vol = loc.volumeMultiplier ?? 1.0;
      return sum + (mult * vol);
    }, 0);
    return weightedSum / totalVol;
  }, [selectedLocations]);

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

  // 🎯 Active Google Search CPC with scenario multiplier
  const activeSearchCpc = useMemo(() => {
    return (avgTopPageCpc > 0 ? avgTopPageCpc : 6.50) * scenarioMultiplier.cpcMult;
  }, [avgTopPageCpc, scenarioMultiplier.cpcMult]);

  // 🔄 Bidirectional Synchronization Handlers (Budget <-> Impression Share <-> CTR)
  const handleGoogleBudgetChange = (newSpend: number) => {
    if (monthlyBudget > 0) {
      const newAlloc = Math.max(0, Math.min(100, Math.round((newSpend / monthlyBudget) * 100)));
      updateChannelAllocation('google', newAlloc);
      if (activeSearchCpc > 0 && expectedCtr > 0 && totalSearchVolume > 0) {
        const theoreticalClicks = newSpend / activeSearchCpc;
        const theoreticalImpressions = theoreticalClicks / (expectedCtr / 100);
        const calculatedIS = Math.max(5, Math.min(95, Math.round((theoreticalImpressions / totalSearchVolume) * 100)));
        setTargetImpressionShare(calculatedIS);
      }
    }
  };

  const handleImpressionShareChange = (newIS: number) => {
    setTargetImpressionShare(newIS);
    if (totalSearchVolume > 0 && expectedCtr > 0 && activeSearchCpc > 0 && monthlyBudget > 0) {
      const clampedIS = Math.max(5, Math.min(95, newIS));
      const impressions = totalSearchVolume * (clampedIS / 100);
      const clicks = impressions * (expectedCtr / 100);
      const requiredSpend = Math.round(clicks * activeSearchCpc);
      const newAlloc = Math.max(0, Math.min(100, Math.round((requiredSpend / monthlyBudget) * 100)));
      updateChannelAllocation('google', newAlloc);
    }
  };

  const handleExpectedCtrChange = (newCtr: number) => {
    setExpectedCtr(newCtr);
    if (budgetMode === 'BY_BUDGET') {
      const currentGoogleSpend = Math.round((monthlyBudget * allocGoogleSearch) / 100);
      if (activeSearchCpc > 0 && newCtr > 0 && totalSearchVolume > 0) {
        const clicks = currentGoogleSpend / activeSearchCpc;
        const impressions = clicks / (newCtr / 100);
        const calculatedIS = Math.max(5, Math.min(95, Math.round((impressions / totalSearchVolume) * 100)));
        setTargetImpressionShare(calculatedIS);
      }
    } else {
      if (totalSearchVolume > 0 && newCtr > 0 && activeSearchCpc > 0 && monthlyBudget > 0) {
        const clampedIS = Math.max(5, Math.min(95, targetImpressionShare));
        const impressions = totalSearchVolume * (clampedIS / 100);
        const clicks = impressions * (newCtr / 100);
        const requiredSpend = Math.round(clicks * activeSearchCpc);
        const newAlloc = Math.max(0, Math.min(100, Math.round((requiredSpend / monthlyBudget) * 100)));
        updateChannelAllocation('google', newAlloc);
      }
    }
  };

  // Keep targetImpressionShare in sync when monthlyBudget or allocGoogleSearch changes from other tabs
  useEffect(() => {
    if (budgetMode === 'BY_BUDGET') {
      const currentSpend = Math.round((monthlyBudget * allocGoogleSearch) / 100);
      if (activeSearchCpc > 0 && expectedCtr > 0 && totalSearchVolume > 0) {
        const clicks = currentSpend / activeSearchCpc;
        const impressions = clicks / (expectedCtr / 100);
        const calculatedIS = Math.max(5, Math.min(95, Math.round((impressions / totalSearchVolume) * 100)));
        setTargetImpressionShare(prev => (prev !== calculatedIS ? calculatedIS : prev));
      }
    }
  }, [budgetMode, monthlyBudget, allocGoogleSearch, expectedCtr, activeSearchCpc, totalSearchVolume]);

  // 🎛️ Real-Time Dynamic Simulation Calculation (Strictly Capped by Total Market Search Volume & Impression Share)
  const simulation: ForecastSimulation = useMemo(() => {
    const activeCpc = activeSearchCpc;
    const availableMarketVolume = totalSearchVolume; // Total searches in selected target markets
    const googleSearchBudget = Math.round((monthlyBudget * allocGoogleSearch) / 100);
    
    // 1. Calculate Maximum Market Capacity (95% Impression Share)
    const maxPossibleImpressions = Math.max(1, availableMarketVolume);
    const maxPossibleClicks = Math.max(1, Math.round(maxPossibleImpressions * (expectedCtr / 100)));
    const marketCapacitySpend = Math.round(maxPossibleClicks * activeCpc);

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
        effectiveIS = Math.max(5, Math.min(95, Math.round(calculatedIS)));
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
    const estClicks = Math.max(1, Math.round(estImpressions * (expectedCtr / 100)));
    const dailyBudget = Math.round(actualSpend / 30.4);

    // 4. Conversions based on Business Model
    const baseConvRate = businessModel === 'LEAD_GEN' ? leadConversionRate : ecommerceConversionRate;
    const activeConvRate = Number((baseConvRate * scenarioMultiplier.crMult).toFixed(2));
    const estConversions = Math.max(0, Math.round(estClicks * (activeConvRate / 100)));
    const cpa = estConversions > 0 ? Math.round(actualSpend / estConversions) : actualSpend;

    // 5. Deals & CAC (For Lead Gen)
    const activeCloseRate = Number((leadCloseRate * scenarioMultiplier.crMult).toFixed(2));
    const estDeals = businessModel === 'LEAD_GEN' ? Math.round(estConversions * (activeCloseRate / 100)) : 0;
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
    targetImpressionShare,
    expectedCtr,
    avgTopPageCpc,
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
    const googleHealthyLeads = Math.round(googleLeads * 0.85); // High intent search leads
    const googleDeals = Math.round(googleHealthyLeads * (leadCloseRate / 100));
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

  // Location / Country Breakdown Metrics
  const countryBreakdown: CountryMetric[] = useMemo(() => {
    if (selectedLocations.length === 0) return [];
    const totalWeight = selectedLocations.reduce((s, c) => s + (c.volumeMultiplier ?? 1.0), 0);
    return selectedLocations.map(loc => {
      const volMult = loc.volumeMultiplier ?? 1.0;
      const share = totalWeight > 0 ? (volMult / totalWeight) : (1 / selectedLocations.length);
      const cVol = Math.round(baseSearchVolume * volMult);
      const cpcMult = loc.cpcMultiplier ?? (loc.countryCode === 'TR' ? 1.0 : 2.5);
      const cCpc = Math.round((avgTopPageCpc / blendedCpcMultiplier) * cpcMult * 100) / 100;
      const cClicks = Math.round((simulation.estClicks || 0) * share);
      const cConvs = Math.round((simulation.estConversions || 0) * share);
      return {
        code: loc.countryCode,
        name: loc.canonicalName || loc.name,
        flag: loc.flag || '🌍',
        sharePercent: Math.round(share * 100),
        monthlyVolume: cVol,
        avgCpc: cCpc,
        estClicks: cClicks,
        estConversions: cConvs,
      };
    });
  }, [selectedLocations, baseSearchVolume, avgTopPageCpc, blendedCpcMultiplier, simulation]);

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
      // First sync current active sub campaign
      const selectedKws = Array.from(selectedKeywordIds).map(id => keywords.find(k => k.id === id)).filter(Boolean) as KeywordMetric[];
      const updatedSubCampaigns = subCampaigns.map(c => {
        if (c.id !== activeSubCampaignId) return c;
        return {
          ...c,
          targetUrl: mode === 'URL' ? query : '',
          seedKeywords: mode === 'KEYWORDS' ? query : '',
          monthlyBudget,
          discoveredKeywords: keywords,
          selectedKeywords: selectedKws,
          negativeCategories,
          targetLocations: selectedLocations,
          businessModel,
          languageCode: targetLanguage,
          parameters: {
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
      await ApiService.saveForecastPlan({
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
      setSubCampaigns(updatedSubCampaigns);
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

  const activeSubCampaign = subCampaigns.find(c => c.id === activeSubCampaignId);
  const isGoogleSearchActive = activeSubCampaign?.platform === 'GOOGLE' && activeSubCampaign?.objective === 'GOOGLE_SEARCH';

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
                const subs = (plan.subCampaigns && plan.subCampaigns.length > 0) 
                  ? plan.subCampaigns 
                  : [{
                      id: 'legacy_' + plan.id,
                      name: plan.name || 'Ana Kampanya',
                      platform: 'GOOGLE' as CampaignPlatform,
                      objective: 'GOOGLE_SEARCH' as CampaignObjective,
                      languageCode: plan.detectedLanguage || 'tr',
                      languageName: plan.detectedLanguageName || 'Türkçe',
                      languageFlag: '🇹🇷',
                      targetLocations: DEFAULT_LOCATIONS,
                      monthlyBudget: plan.monthlyBudget || 35000,
                      selectedKeywords: plan.selectedKeywords || [],
                      negativeCategories: plan.negativeKeywords || [],
                      parameters: {}
                    }];

                const planTotalBudget = plan.monthlyBudget || subs.reduce((s, c) => s + (c.monthlyBudget || 0), 0);

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

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                                ₺{(sc.monthlyBudget || 0).toLocaleString('tr-TR')}
                              </span>
                              <ChevronRight size={12} color="var(--text-muted)" />
                            </div>
                          </div>
                        ))}
                      </div>
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
                <span>{camp.name}</span>
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
                  ₺{camp.monthlyBudget?.toLocaleString('tr-TR')}
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
            setCurrentStep(2);
            setActiveChannelTab('OMNICHANNEL');
          }}
          className="btn-secondary"
          style={{
            padding: '0.4rem 0.8rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: activeChannelTab === 'OMNICHANNEL' && currentStep === 2 ? '#ffffff' : 'var(--brand-primary)',
            backgroundColor: activeChannelTab === 'OMNICHANNEL' && currentStep === 2 ? 'var(--brand-primary)' : 'transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            whiteSpace: 'nowrap'
          }}
        >
          <BarChart3 size={14} />
          <span>360° Konsolide Özet</span>
        </button>
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

            {/* Language Selection */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                Hedef Dil:
              </label>
              <select
                value={newCampLang}
                onChange={(e) => setNewCampLang(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}
              >
                {GOOGLE_ADS_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Budget */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                Bu Kampanya İçin Aylık Bütçe (₺):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={newCampBudget}
                  onChange={(e) => setNewCampBudget(Number(e.target.value))}
                  style={{ flex: 1, fontSize: '0.85rem' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  ₺{Math.round(newCampBudget / 30.4).toLocaleString('tr-TR')} / gün
                </span>
              </div>
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
        
        {/* Top Meta Bar with Title and Curated Examples */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={15} color="var(--brand-primary)" /> Akıllı SEM Keşif & Hacim Motoru
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Web Sitesi URL'si veya Anahtar Kelime girin)
            </span>
          </div>

          {/* Quick Examples */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span>Örnekler:</span>
            {[
              'summerhomes.com',
              'alanya butik oteller',
              'diksiyon kursu istanbul',
              'dusbahcesiilkokulu.com',
              'buy apartment alanya'
            ].map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setQuery(ex);
                  const isUrl = ex.includes('.') && !ex.includes(' ');
                  const newMode = isUrl ? 'URL' : 'KEYWORDS';
                  setMode(newMode);
                  handleDiscover(ex, newMode);
                }}
                className="btn-ghost"
                style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-default)' }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Unified Input Bar with Integrated Location & Language Selectors */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Query Input */}
          <div style={{ flex: 2, minWidth: '260px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Web sitesi URL'si veya anahtar kelime(ler) girin (örn: summerhomes.com veya alanya satılık villa)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDiscover(); }}
              style={{ width: '100%', paddingLeft: '2.4rem', fontSize: '0.875rem' }}
            />
          </div>

          {/* 📍 Location Selector Button */}
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

          {/* 🌐 Target Language Selector (Google Keyword Planner Style) */}
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

      {/* 2-Step Wizard Navigation Bar */}
          <div className="card" style={{ padding: '0.6rem 0.85rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem', backgroundColor: 'var(--bg-surface)' }}>
            
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
                backgroundColor: currentStep === 1 ? 'var(--brand-primary)' : '#10b981',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                {currentStep === 2 ? <Check size={15} /> : '1'}
              </div>
              <span>1. Adım: STAG Kelime Keşfi & Gruplar</span>
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
                backgroundColor: currentStep === 2 ? 'var(--brand-primary)' : 'var(--border-default)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                2
              </div>
              <span>2. Adım: 360° Medya Karması & Büyüme Simülatörü</span>
            </button>

          </div>

          {/* ========================================================================= */}
          {/* STEP 1 VIEW: Landing Page Context & Keyword Review / Selection           */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
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
              <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-surface)', borderLeft: '4px solid var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-primary)' }}>
                    <Languages size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                        {mode === 'URL' ? 'AÇILIŞ SAYFASI ANALİZİ' : 'TOHUM ANAHTAR KELİME ANALİZİ'}
                      </span>
                      <span className="badge badge-active" style={{ fontSize: '0.725rem' }}>
                        <CheckCircle2 size={11} /> {detectedLanguageName} ({detectedLanguage.toUpperCase()})
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

              {/* 📍 Active Target Locations Interactive Strip */}
              <div className="card" style={{ padding: '0.75rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <Globe size={16} color="var(--brand-primary)" />
                    <span>Hedef Lokasyonlar ({selectedLocations.length}):</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedLocations.map(loc => (
                      <span key={loc.id} className="badge badge-active" style={{ fontSize: '0.75rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>{loc.flag || '📍'}</span>
                        <strong>{loc.name}</strong>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({getLocationTypeLabel(loc.targetType)})</span>
                        {selectedLocations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLocation(loc.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: '2px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </span>
                    ))}
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
                    <span>2. Adım: 360° Medya Karması & Büyüme Simülatörüne Geç</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

              </div>

            </div>
            )
          )}
        </>
      )}

          {/* ========================================================================= */}
          {/* STEP 2 VIEW: Omnichannel & Platform Dedicated Studios                     */}
          {/* ========================================================================= */}
          {subCampaigns.length > 0 && (currentStep === 2 || !isGoogleSearchActive) && (
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
                    <span>Dil: <strong>{detectedLanguageName}</strong></span>
                    <span>•</span>
                    <span>Aylık Bütçe: <strong>₺{monthlyBudget.toLocaleString('tr-TR')}</strong></span>
                    <span>•</span>
                    <span>Hedef Bölgeler: <strong>{selectedLocations.map(l => (l.flag || '📍') + ' ' + (l.canonicalName || l.name)).join(', ')}</strong></span>
                  </div>
                </div>

                {/* Right: Strategic Growth Scenario 3-Toggle Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    🎯 Büyüme Senaryosu:
                  </span>
                  
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

                  <div style={{ display: 'flex', gap: '0.45rem', marginLeft: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      className="btn-ghost"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--brand-primary)', fontWeight: 600 }}
                    >
                      <Globe size={13} />
                      <span>Lokasyon ({selectedLocations.length})</span>
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
                        Günlük ortalama: <strong>₺{Math.round(monthlyBudget / 30.4).toLocaleString('tr-TR')}</strong> / gün
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-secondary)' }}>₺</span>
                      <input
                        type="number"
                        min={1000}
                        max={2000000}
                        step={1000}
                        value={monthlyBudget}
                        onChange={(e) => setMonthlyBudget(Math.max(1000, Number(e.target.value)))}
                        style={{
                          width: '115px',
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
                  <input
                    type="range"
                    min={5000}
                    max={500000}
                    step={2500}
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((monthlyBudget - 5000) / 495000) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((monthlyBudget - 5000) / 495000) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>₺5.000</span>
                    <span>₺50.000</span>
                    <span>₺125.000</span>
                    <span>₺250.000</span>
                    <span>₺500.000</span>
                  </div>
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
                          max={monthlyBudget}
                          step={250}
                          value={omnichannelMix.googleSearchSpend}
                          onChange={(e) => {
                            const newSpend = Number(e.target.value);
                            if (monthlyBudget > 0) {
                              const newAlloc = Math.max(0, Math.min(100, Math.round((newSpend / monthlyBudget) * 100)));
                              updateChannelAllocation('google', newAlloc);
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
                          max={monthlyBudget}
                          step={250}
                          value={omnichannelMix.metaAdsSpend}
                          onChange={(e) => {
                            const newSpend = Number(e.target.value);
                            if (monthlyBudget > 0) {
                              const newAlloc = Math.max(0, Math.min(100, Math.round((newSpend / monthlyBudget) * 100)));
                              updateChannelAllocation('meta', newAlloc);
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
                          max={monthlyBudget}
                          step={250}
                          value={omnichannelMix.youtubeSpend}
                          onChange={(e) => {
                            const newSpend = Number(e.target.value);
                            if (monthlyBudget > 0) {
                              const newAlloc = Math.max(0, Math.min(100, Math.round((newSpend / monthlyBudget) * 100)));
                              updateChannelAllocation('youtube', newAlloc);
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
                          max={monthlyBudget}
                          step={250}
                          value={omnichannelMix.gdnSpend}
                          onChange={(e) => {
                            const newSpend = Number(e.target.value);
                            if (monthlyBudget > 0) {
                              const newAlloc = Math.max(0, Math.min(100, Math.round((newSpend / monthlyBudget) * 100)));
                              updateChannelAllocation('gdn', newAlloc);
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
                                    <span>{sc.name}</span>
                                    {isActive && (
                                      <span style={{ fontSize: '0.62rem', padding: '1px 4px', borderRadius: '2px', backgroundColor: 'var(--brand-primary)', color: '#ffffff', fontWeight: 700 }}>
                                        AKTİF
                                      </span>
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
                                  <button
                                    type="button"
                                    onClick={() => handleSelectSubCampaign(sc.id)}
                                    className="btn-ghost"
                                    style={{ fontSize: '0.7rem', padding: '2px 6px', color: 'var(--brand-primary)' }}
                                  >
                                    Düzenle
                                  </button>
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
                        const currentSpend = Math.round((monthlyBudget * allocGoogleSearch) / 100);
                        if (activeSearchCpc > 0 && expectedCtr > 0 && totalSearchVolume > 0) {
                          const clicks = currentSpend / activeSearchCpc;
                          const impressions = clicks / (expectedCtr / 100);
                          const calculatedIS = Math.max(5, Math.min(95, Math.round((impressions / totalSearchVolume) * 100)));
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
                        if (totalSearchVolume > 0 && expectedCtr > 0 && activeSearchCpc > 0 && monthlyBudget > 0) {
                          const clampedIS = Math.max(5, Math.min(95, targetImpressionShare));
                          const impressions = totalSearchVolume * (clampedIS / 100);
                          const clicks = impressions * (expectedCtr / 100);
                          const requiredSpend = Math.round(clicks * activeSearchCpc);
                          const newAlloc = Math.max(0, Math.min(100, Math.round((requiredSpend / monthlyBudget) * 100)));
                          updateChannelAllocation('google', newAlloc);
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          Google Search Ayrılan Bütçe (%{allocGoogleSearch})
                        </label>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Toplam ₺{monthlyBudget.toLocaleString('tr-TR')} medya bütçesinin %{allocGoogleSearch}'i • <strong>Günlük: ₺{Math.round(Math.round((monthlyBudget * allocGoogleSearch) / 100) / 30.4).toLocaleString('tr-TR')}/gün</strong> • <strong>Tahmini Gösterim Payı: %{simulation.targetImpressionShare}</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>₺</span>
                        <input
                          type="number"
                          min={100}
                          max={Math.max(1000, monthlyBudget)}
                          step={250}
                          value={Math.round((monthlyBudget * allocGoogleSearch) / 100)}
                          onChange={(e) => handleGoogleBudgetChange(Number(e.target.value))}
                          style={{
                            width: '90px',
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
                    <input
                      type="range"
                      min={500}
                      max={Math.max(1000, monthlyBudget)}
                      step={250}
                      value={Math.round((monthlyBudget * allocGoogleSearch) / 100)}
                      onChange={(e) => handleGoogleBudgetChange(Number(e.target.value))}
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
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Hedef Pazar Gösterim Payı (IS %)
                        </label>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Ayrılan Bütçe: <strong>₺{Math.round((monthlyBudget * allocGoogleSearch) / 100).toLocaleString('tr-TR')}</strong>/ay (%{allocGoogleSearch})
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
                          onChange={(e) => handleImpressionShareChange(Math.max(5, Math.min(95, Number(e.target.value))))}
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
                      onChange={(e) => handleImpressionShareChange(Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: '#2563eb',
                        cursor: 'pointer',
                        background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((targetImpressionShare - 5) / 90) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((targetImpressionShare - 5) / 90) * 100)))}%, var(--border-default) 100%)`,
                        height: '6px',
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
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
                      <span>Bu pay için gereken bütçe: <strong>₺{simulation.actualSpend.toLocaleString('tr-TR')}</strong>/ay</span>
                      <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        ✓ Otomatik Senkronize (%{allocGoogleSearch})
                      </span>
                    </div>
                  </div>
                )}

                {/* Expected CTR Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Tahmini Arama Ağı Tıklama Oranı (CTR / TO %)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                      <input
                        type="number"
                        min={0.1}
                        max={80.0}
                        step={0.1}
                        value={expectedCtr}
                        onChange={(e) => handleExpectedCtrChange(Math.max(0.1, Number(e.target.value)))}
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
                    onChange={(e) => handleExpectedCtrChange(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((expectedCtr - 1.0) / 39.0) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((expectedCtr - 1.0) / 39.0) * 100)))}%, var(--border-default) 100%)`,
                      height: '6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>

                {/* Lead CR Slider */}
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
                        value={leadConversionRate}
                        onChange={(e) => setLeadConversionRate(Math.max(0.1, Number(e.target.value)))}
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
                    onChange={(e) => setLeadConversionRate(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#2563eb',
                      cursor: 'pointer',
                      background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((leadConversionRate - 0.5) / 34.5) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((leadConversionRate - 0.5) / 34.5) * 100)))}%, var(--border-default) 100%)`,
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
                          Sağlıklı Lead Oranı (% Healthy Lead)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</span>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            step={1}
                            value={leadCloseRate}
                            onChange={(e) => setLeadCloseRate(Math.max(1, Math.min(100, Number(e.target.value))))}
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
                        onChange={(e) => setLeadCloseRate(Number(e.target.value))}
                        style={{
                          width: '100%',
                          accentColor: '#2563eb',
                          cursor: 'pointer',
                          background: `linear-gradient(90deg, #60a5fa 0%, #2563eb ${Math.min(100, Math.max(0, Math.round(((leadCloseRate - 1) / 99) * 100)))}%, var(--border-default) ${Math.min(100, Math.max(0, Math.round(((leadCloseRate - 1) / 99) * 100)))}%, var(--border-default) 100%)`,
                          height: '6px',
                          borderRadius: 'var(--radius-full)'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Ortalama Anlaşma / Satış Tutarı (₺ - İsteğe Bağlı)
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

                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Gösterim</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {simulation.estImpressions.toLocaleString('tr-TR')}
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tahmini Tıklama</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {simulation.estClicks.toLocaleString('tr-TR')}
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Arama Başı Talep (Lead)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {simulation.estConversions.toLocaleString('tr-TR')} Adet
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SAĞLIKLI LEAD</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {simulation.estDeals} Nitelikli
                    </div>
                  </div>
                </div>

                {/* Country Breakdown Rows */}
                {countryBreakdown.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>Pazar Kırılımı:</span>
                    {countryBreakdown.map((cm) => (
                      <div key={cm.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span>{cm.flag} {cm.name}</span>
                        <span><strong>{cm.monthlyVolume.toLocaleString('tr-TR')}</strong> arama • ₺{cm.avgCpc.toFixed(2)} TBM</span>
                      </div>
                    ))}
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
                        const hasSubCamps = plan.subCampaigns && plan.subCampaigns.length > 0;
                        const subCount = hasSubCamps ? plan.subCampaigns!.length : 1;
                        const subSummary = hasSubCamps 
                          ? plan.subCampaigns!.map(c => `${c.languageFlag || '🌐'} ${c.name}`).join(' • ')
                          : (plan.targetUrl || plan.seedKeywords || 'Standart Kampanya');

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

            {/* Search Input */}
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

            {/* Selected Locations Chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Seçili Hedef Lokasyonlar ({selectedLocations.length}):
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Ağırlıklı TBM Çarpanı: <strong style={{ color: 'var(--brand-primary)' }}>{blendedCpcMultiplier.toFixed(2)}x</strong>
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', minHeight: '38px', padding: '0.5rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)' }}>
                {selectedLocations.map(loc => (
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

            {/* Quick Presets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Hızlı Önerilen Pazar Paketleri & Şehirler:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {[
                  { name: '🇹🇷 Tüm Türkiye', locs: [DEFAULT_LOCATIONS[0]] },
                  { name: '🇹🇷 İstanbul', locs: [DEFAULT_LOCATIONS[1]] },
                  { name: '🇹🇷 Antalya & Alanya', locs: [DEFAULT_LOCATIONS[2], DEFAULT_LOCATIONS[3]] },
                  { name: '🇹🇷 İzmir & Ege', locs: [DEFAULT_LOCATIONS[5], DEFAULT_LOCATIONS[6]] },
                  { name: '🇩🇪 Almanya (Gurbetçi & Diaspora)', locs: [DEFAULT_LOCATIONS[7]] },
                  { name: '🇬🇧 Birleşik Krallık', locs: [DEFAULT_LOCATIONS[8]] },
                  { name: '🇺🇸 ABD (Global Yatırım)', locs: [DEFAULT_LOCATIONS[9]] },
                  { name: '🇦🇪 Dubai / BAE', locs: [DEFAULT_LOCATIONS[10]] },
                  { name: '🇷🇺 Rusya & BDT', locs: [DEFAULT_LOCATIONS[11], DEFAULT_LOCATIONS[12]] }
                ].map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setSelectedLocations(preset.locs)}
                    className="btn-ghost"
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.25rem 0.6rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-surface-elevated)'
                    }}
                  >
                    + {preset.name}
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

    </div>
  );
};
