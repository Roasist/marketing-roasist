import { KeywordMetric, CpcImputationSettings } from '../types/forecast';

export interface KeywordCluster {
  id: string;
  name: string;
  icon: string;
  keywords: KeywordMetric[];
  totalVolume: number;
  avgCpc: number;
  selectedCount?: number;
}

/**
 * Normalizes keyword text for multilingual semantic grouping
 */
const normalizeForSemanticClustering = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[«»""''’`]/g, '')
    .replace(/[-_.,!?/\\()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Groups keywords into highly granular, thematic STAG (Single Theme Ad Groups) clusters
 * with 100% professional Turkish naming and single clean icons.
 */
export const groupKeywordsSemantically = (
  rawKeywords: KeywordMetric[],
  imputationSettings?: CpcImputationSettings
): KeywordCluster[] => {
  if (!rawKeywords || rawKeywords.length === 0) return [];

  // Deduplicate keywords by text
  const seenKw = new Set<string>();
  const uniqueKwList: KeywordMetric[] = [];
  for (const k of rawKeywords) {
    const norm = normalizeForSemanticClustering(k.keyword);
    if (!seenKw.has(norm)) {
      seenKw.add(norm);
      uniqueKwList.push(k);
    }
  }

  const clusters: KeywordCluster[] = [];
  // Impute / scale CPCs within clusters
  const processClusterKeywords = (kws: KeywordMetric[], clusterName: string): KeywordMetric[] => {
    // 1. Calculate cluster medians from keywords with REAL Google Ads data (not estimated)
    const validCpcKeywords = kws.filter(k => {
      if (k.isCpcEstimated || k.cpcEstimationCluster) return false;
      if (typeof k.rawLowCpc === 'number' && k.rawLowCpc > 0.05) return true;
      if (typeof k.rawHighCpc === 'number' && k.rawHighCpc > 0.05) return true;
      return !k.isCpcEstimated && (k.lowCpc > 0.05 || k.highCpc > 0.05);
    });
    
    let clusterMedianLow = 0;
    let clusterMedianHigh = 0;

    if (validCpcKeywords.length > 0) {
      const sortedLows = validCpcKeywords
        .map(k => (typeof k.rawLowCpc === 'number' && k.rawLowCpc > 0.05) ? k.rawLowCpc : k.lowCpc)
        .filter(v => v > 0.05)
        .sort((a, b) => a - b);
      const sortedHighs = validCpcKeywords
        .map(k => (typeof k.rawHighCpc === 'number' && k.rawHighCpc > 0.05) ? k.rawHighCpc : k.highCpc)
        .filter(v => v > 0.05)
        .sort((a, b) => a - b);
      
      clusterMedianLow = sortedLows.length > 0 ? sortedLows[Math.floor(sortedLows.length / 2)] : 0;
      clusterMedianHigh = sortedHighs.length > 0 ? sortedHighs[Math.floor(sortedHighs.length / 2)] : 0;
    }

    // Default sector fallbacks if no real keyword bid data exists in this cluster
    if (clusterMedianLow <= 0.05) clusterMedianLow = 7.60;
    if (clusterMedianHigh <= 0.05) clusterMedianHigh = 28.50;

    const autoImpute = imputationSettings?.autoImputeMissingCpc !== false;
    const transMult = typeof imputationSettings?.transactionalMultiplier === 'number' && !isNaN(imputationSettings.transactionalMultiplier) 
      ? imputationSettings.transactionalMultiplier 
      : 1.15;
    const commMult = typeof imputationSettings?.commercialMultiplier === 'number' && !isNaN(imputationSettings.commercialMultiplier) 
      ? imputationSettings.commercialMultiplier 
      : 1.00;
    const infoMult = typeof imputationSettings?.informationalMultiplier === 'number' && !isNaN(imputationSettings.informationalMultiplier) 
      ? imputationSettings.informationalMultiplier 
      : 0.85;
    const currMult = (typeof imputationSettings?.defaultCurrencyMultiplier === 'number' && imputationSettings.defaultCurrencyMultiplier > 1) 
      ? imputationSettings.defaultCurrencyMultiplier 
      : 1;

    return kws.map(k => {
      const hasExplicitRawData = (typeof k.rawLowCpc === 'number' && k.rawLowCpc > 0.05) || 
                                (typeof k.rawHighCpc === 'number' && k.rawHighCpc > 0.05);

      const isAlreadyEstimated = Boolean(
        k.isCpcEstimated || 
        (typeof k.rawLowCpc === 'number' && k.rawLowCpc <= 0.05) ||
        (typeof k.rawHighCpc === 'number' && k.rawHighCpc <= 0.05) ||
        Boolean(k.cpcEstimationCluster) ||
        (!hasExplicitRawData && (k.lowCpc <= 0.05 || k.highCpc <= 0.05))
      );

      const rawLow = (typeof k.rawLowCpc === 'number') 
        ? k.rawLowCpc 
        : (isAlreadyEstimated ? 0 : (typeof k.lowCpc === 'number' ? k.lowCpc : 0));
      const rawHigh = (typeof k.rawHighCpc === 'number') 
        ? k.rawHighCpc 
        : (isAlreadyEstimated ? 0 : (typeof k.highCpc === 'number' ? k.highCpc : 0));
      const sanitizedIsAiStrategist = Boolean(k.isAiStrategistPick);

      // Determine keyword intent multiplier
      let intentMultiplier = commMult;
      if (k.intent === 'TRANSACTIONAL') {
        intentMultiplier = transMult;
      } else if (k.intent === 'INFORMATIONAL') {
        intentMultiplier = infoMult;
      } else if (k.intent === 'COMMERCIAL') {
        intentMultiplier = commMult;
      } else {
        // Semantic intent detection from keyword text
        const norm = normalizeForSemanticClustering(k.keyword);
        if (/(?:купить|покупк|satılık|satın|almak|fiyat|fiyatı|цен|цены|стоимост|стоимость|внж|гражданств|vatandaşlık|pasaport|cbi|investment|инвестиц|tapu|тапу|residency|citizenship)/ui.test(norm)) {
          intentMultiplier = transMult;
        } else if (/(?:как|что|где|nedir|nasıl|rehber|şartlar|документ|услови|отзыв|форум|yorum|guide|how to)/ui.test(norm)) {
          intentMultiplier = infoMult;
        } else {
          intentMultiplier = commMult;
        }
      }

      const effectiveMult = currMult * intentMultiplier;

      // Case A: Missing BOTH low and high CPC
      if (rawLow <= 0.05 && rawHigh <= 0.05) {
        if (autoImpute && clusterMedianLow > 0.05 && clusterMedianHigh > 0.05) {
          const estimatedLow = Math.round(clusterMedianLow * effectiveMult * 100) / 100;
          const estimatedHigh = Math.round(clusterMedianHigh * effectiveMult * 100) / 100;
          return {
            ...k,
            rawLowCpc: rawLow,
            rawHighCpc: rawHigh,
            lowCpc: estimatedLow,
            highCpc: estimatedHigh,
            isCpcEstimated: true,
            isAiStrategistPick: sanitizedIsAiStrategist,
            cpcEstimationCluster: clusterName,
            cpcEstimationMultiplier: Math.round(effectiveMult * 100) / 100
          };
        } else {
          return {
            ...k,
            rawLowCpc: rawLow,
            rawHighCpc: rawHigh,
            lowCpc: 0,
            highCpc: 0,
            isCpcEstimated: false,
            isAiStrategistPick: sanitizedIsAiStrategist
          };
        }
      } 
      // Case B: Has High CPC but missing Low CPC
      else if (rawLow <= 0.05 && rawHigh > 0.50) {
        if (autoImpute) {
          const estimatedLow = Math.max(0.50, Math.round(rawHigh * 0.35 * effectiveMult * 100) / 100);
          const scaledHigh = Math.round(rawHigh * currMult * 100) / 100;
          return {
            ...k,
            rawLowCpc: rawLow,
            rawHighCpc: rawHigh,
            lowCpc: estimatedLow,
            highCpc: scaledHigh,
            isCpcEstimated: true,
            isAiStrategistPick: sanitizedIsAiStrategist,
            cpcEstimationCluster: clusterName,
            cpcEstimationMultiplier: Math.round(effectiveMult * 100) / 100
          };
        } else {
          return {
            ...k,
            rawLowCpc: rawLow,
            rawHighCpc: rawHigh,
            lowCpc: 0,
            highCpc: Math.round(rawHigh * currMult * 100) / 100,
            isCpcEstimated: false,
            isAiStrategistPick: sanitizedIsAiStrategist
          };
        }
      } 
      // Case C: Has Low CPC but missing High CPC
      else if (rawLow > 0.50 && rawHigh <= 0.05) {
        if (autoImpute) {
          const scaledLow = Math.round(rawLow * currMult * 100) / 100;
          const estimatedHigh = Math.round(rawLow * 2.8 * effectiveMult * 100) / 100;
          return {
            ...k,
            rawLowCpc: rawLow,
            rawHighCpc: rawHigh,
            lowCpc: scaledLow,
            highCpc: estimatedHigh,
            isCpcEstimated: true,
            isAiStrategistPick: sanitizedIsAiStrategist,
            cpcEstimationCluster: clusterName,
            cpcEstimationMultiplier: Math.round(effectiveMult * 100) / 100
          };
        } else {
          return {
            ...k,
            rawLowCpc: rawLow,
            rawHighCpc: rawHigh,
            lowCpc: Math.round(rawLow * currMult * 100) / 100,
            highCpc: 0,
            isCpcEstimated: false,
            isAiStrategistPick: sanitizedIsAiStrategist
          };
        }
      }

      // Case D: Real Google Ads CPC available for both
      const scaledLow = Math.round(rawLow * currMult * 100) / 100;
      const scaledHigh = Math.round(rawHigh * currMult * 100) / 100;

      return {
        ...k,
        rawLowCpc: rawLow,
        rawHighCpc: rawHigh,
        lowCpc: scaledLow,
        highCpc: scaledHigh,
        isCpcEstimated: false,
        isAiStrategistPick: sanitizedIsAiStrategist
      };
    });
  };

  // 2. High-converting Granular STAG Theme Rules (Strict Priority Hierarchy: Specific Intent > Broad Categories)
  const stagRules = [
    // 1. Yatırım Yoluyla Vatandaşlık & CBI (Citizenship by Investment) - HIGHEST SPECIFICITY
    {
      id: 'stag_cbi_investment',
      name: 'Yatırım Yoluyla Vatandaşlık (CBI)',
      icon: '💎',
      regex: /(?:инвестици|инвестор|инвестировать|инвестиций|инвестициям|yatırım|yatırımla|yatırımcı|gayrimenkul yatırımı|fon yatırımı|citizenship by investment|golden visa|cbi|investor|investment|invest in|investition|استثمار|استثماري|مستثمر|فيزا ذهبية|الفيزا الذهبية|سرمایه\s*گذار|سرمایه\s*گزار|سرمایه\s*گذاری|ویزای\s*طلایی)/ui
    },
    // 2. Türk Vatandaşlığı & Pasaport (Citizenship & Passport)
    {
      id: 'stag_citizenship_passport',
      name: 'Türk Vatandaşlığı & Pasaport',
      icon: '🏛️',
      regex: /(?:гражданств|паспорт|паспорта|паспорту|паспортом|vatandaşlık|vatandaslik|türk vatandaşlığı|türkiye vatandaşlığı|tc vatandaslik|pasaport|citizenship|passport|turkish citizenship|turkish passport|staatsbürgerschaft|pass|جنسية|الجنسية|جواز|جواز سفر|جواز تركي|شهروندی|تابعیت|پاسپورت|گذرنامه)/ui
    },
    // 3. İkamet İzni & Oturum (Residency & ВНЖ / İkamet)
    {
      id: 'stag_residency_ikamet',
      name: 'İkamet İzni & Oturum (ВНЖ)',
      icon: '🪪',
      regex: /(?:внж|пмж|икамет|вид на жительство|оформление внж|получить внж|продление внж|отказ в внж|кимлик|ikamet|ikametgah|oturum|oturma|oturum izni|oturma izni|ikamet izni|tapu ile ikamet|residence permit|residency permit|residence|residency|turkey ikamet|turkish residence|aufenthaltserlaubnis|ikamet permit|إقامة|اقامة|اقام|تصريح إقامة|بطاقة إقامة|إقامة عقارية|إقامة سياحية|تجديد الإقامة|اقامت|اقامتی|اقامتگاه|کارت اقامت|اخذ اقامت|اجازه اقامت|تمدید اقامت|کیمیک|کیملیک)/ui
    },
    // 4. Hukuk, Avukat & Resmi Danışmanlık (Legal, Lawyers & Consultation)
    {
      id: 'stag_legal_consulting',
      name: 'Hukuk, Avukat & Danışmanlık',
      icon: '⚖️',
      regex: /(?:адвокат|адвокаты|адвоката|юрист|юристы|юриста|юридическ|нотариус|апостиль|доверенност|avukat|avukatı|hukuk|danışmanlık|danışmanı|danismanlik|hukuki|noter|vekaletname|apostil|lawyer|attorney|legal services|law firm|legal assistance|notary|power of attorney|anwalt|rechtsanwalt|محامي|محاماة|استشارة قانونية|توكيل|نوتر|قانوني|وکیل|وکلا|وکالت|مشاوره حقوقی|حقوقی|نوتر|دفتر اسناد رسمی|دفترخانه)/ui
    },
    // 5. Başvuru, Şartlar, Evraklar & Statü (Applications, Documents & Requirements)
    {
      id: 'stag_process_documents',
      name: 'Başvuru, Evrak & Koşullar',
      icon: '📜',
      regex: /(?:как получить|получен|получить|документ|документы|документов|услови|условия|условиях|требован|требования|подача документов|проверить статус|оформлен|оформление|процедур|процедура|şart|şartlar|şartları|koşul|koşulları|nasıl alınır|başvuru|başvurusu|evrak|evraklar|belge|belgeler|süreç|statü|requirements|how to apply|how to get|documents|documents needed|application process|application|eligibility|antrag|unterlagen|voraussetzungen|شروط|الأوراق المطلوبة|الاوراق المطلوبة|طريقة التقديم|كيفية الحصول|طريقة|كيفية|اجراءات|إجراءات|تقديم|خطوات|مدارک|مدارک لازم|شرایط|شرایط لازم|شرایط اخذ|نحوه دریافت|نحوه|چگونه|مراحل|ثبت نام|درخواست|قوانین|فرآیند|روش)/ui
    },
    // 6. Fiyatlar, Harçlar, Masraflar & Maliyetler (Pricing, Costs & Budget)
    {
      id: 'stag_costs_pricing',
      name: 'Fiyat, Harç & Maliyetler',
      icon: '💰',
      regex: /(?:цен|цены|цена|стоимост|стоимость|сколько стоит|дешев|недорог|расход|расходы|налог|налоги|пошлин|пошлина|рассрочк|fiyat|fiyatı|fiyatlar|fiyatları|ücret|ücreti|masraf|masrafları|maliyet|maliyeti|harç|harçlar|harçları|kaça|ne kadar|en ucuz|uygun fiyat|taksit|taksitli|kelepir|cost of living|prices|price|property prices|cheap|cheapest|fees|fee|taxes|tax|affordable|installment|budget|how much|preise|kosten|günstig|سعر|اسعار|أسعار|تكلفة|تكاليف|رسوم|ضرائب|مصاريف|رخيص|أرخص|تقسيط|بالتقسيط|قیمت|قیمتها|قیمت ها|هزینه|هزینها|هزینه ها|مخارج|ارزان|ارزانترین|ارزان ترین|نرخ|اقساط|اقساطی|چقدر|چند است|بودجه|وام)/ui
    },
    // 7. Müteahhit, İnşaat Firmaları & Sıfır Projeler
    {
      id: 'stag_developers_projects',
      name: 'İnşaat Firmaları & Sıfır Projeler',
      icon: '🏗️',
      regex: /(?:застройщик|застройщики|застройщиков|новостройк|новостройки|новостройку|жилой комплекс|жк|developer|developers|inşaat firmaları|inşaat firması|müteahhit|sıfır projeler|sıfır konut|yeni projeler|new developments|neubau|مشاريع جديدة|مجمعات سكنية|پروژه‌های جدید|شهرک)/ui
    },
    // 8. Kiralık Konut & Daire Kiralama (Rentals & Kiralık)
    {
      id: 'stag_rental',
      name: 'Kiralık Konut & Daire Kiralama',
      icon: '🔑',
      regex: /(?:аренд|аренда|снять|арендовать|посуточн|kiralık|kiralik|kirala|kiralama|kira|yıllık kira|aylık kira|günlük kiralık|rent|rental|for rent|renting|flat for rent|apartment for rent|wohnung mieten|mietwohnung|haus mieten|إيجار|ايجار|للايجار|للإيجار|استئجار|مستأجر|اجار|اجاره|کرایه|رهن|رهن و اجاره)/ui
    },
    // 9. Lüks Projeler, Villalar & Rezidans (Luxury, Villas & New Developments)
    {
      id: 'stag_luxury_villas',
      name: 'Lüks Konut, Villa & Projeler',
      icon: '🏰',
      regex: /(?:вилл|вилла|виллы|элитн|элитное|люкс|пентхаус|villa|villalar|lüks konut|lüks|rezidans|markalı projeler|müstakil ev|müstakil villa|penthouse|site içi|luxury real estate|luxury villas|luxury|penthouses|compound|luxusimmobilien|فلل|فيلا|عقارات فاخرة|فاخر|فاخرة|بنتهاوس|برج|مجمع سكني|ویلا|ویلای لوکس|خرید ویلا|برج‌های مسکونی|برج|لوکس|لاکچری|پنت هاوس|پنت‌هاوس|مجتمع مسکونی)/ui
    },
    // 10. Lokasyon: İstanbul & Bölge Odaklı (Istanbul Focused)
    {
      id: 'stag_geo_istanbul',
      name: 'Lokasyon: İstanbul & Çevresi',
      icon: '📍',
      regex: /(?:стамбул|стамбуле|стамбула|istanbul|istanbulda|istanbul'da|beylikdüzü|başakşehir|esenyurt|kadıköy|beşiktaş|şişli|sarıyer|üsküdar|kartal|pendik|bakırköy|zeytinburnu|fatih|avcılar|küçükçekmece|büyükçekmece|şile|arnavutköy|إسطنبول|اسطنبول|بيليك دوزو|باشاك شهير|شيشلي|استانبول|در استانبول|بیلیکدوزو|بشیکتاش|کادیکوی|باشاک شهیر|اسنیورت|شیشلی|سارییر)/ui
    },
    // 11. Lokasyon: Antalya, Alanya & Akdeniz Sahili (Antalya & Coast Focused)
    {
      id: 'stag_geo_mediterranean',
      name: 'Lokasyon: Antalya, Alanya & Sahil',
      icon: '🏖️',
      regex: /(?:антал|анталья|анталье|анталью|анталий|алан|аланья|аланье|аланью|алании|мерсин|мерсине|бодрум|бодруме|измир|измире|бурса|бурсе|анкара|анкаре|махмутлар|кемер|сиде|фетхие|кипр|antalya|antalyada|alanya|alanyada|bodrum|mersin|fethiye|izmir|bursa|ankara|mahmutlar|kemer|side|çeşme|kuşadası|didim|kıbrıs|أنطاليا|الانيا|ألانيا|مرسين|بودروم|إزمير|ازمير|بورصة|أنقرة|انقرة|قبرص|آنتالیا|انتالیا|آلانیا|الانیا|مرسین|بدروم|ازمیر|بورسا|آنکارا|انکارا|محمودلار|کمر|سیده|قبرس)/ui
    },
    // 12. Göç, Yaşam & Türkiye Rehberi (Living, Relocation & Life in Turkey)
    {
      id: 'stag_relocation_life',
      name: 'Göç, Yaşam & Relokasyon',
      icon: '🌍',
      regex: /(?:жизнь в турции|жизнь|уровень жизни|переезд в турцию|переезд|переехать|эмиграц|иммиграц|релокац|россияне в|русские в|пенсионер|пенсионеров|yaşam|yaşam şartları|türkiye'de yaşam|türkiye rehberi|göç|yerleşim|taşınma|emekli|emekliler|living in turkey|living in|relocation to turkey|relocation|relocate|immigrate|moving to turkey|leben in|auswandern|العيش في تركيا|الحياة في تركيا|الهجرة إلى تركيا|هجرة|زندگی در ترکیه|زندگی|مهاجرت به ترکیه|مهاجرت|کوچ|ایرانیان در ترکیه)/ui
    },
    // 13. En İyi, Yorumlar & Tecrübeler (Reviews, Experiences & Best)
    {
      id: 'stag_reviews_experience',
      name: 'Yorumlar, Deneyim & Tavsiyeler',
      icon: '⭐',
      regex: /(?:отзыв|отзывы|отзывов|опыт|совет|форум|стоит ли|плюсы и минусы|лучшие районы|лучш|топ|yorum|yorumlar|tavsiye|tavsiyeler|deneyim|deneyimler|şikayet|forum|en iyi|en uygun|avantaj|dezavantaj|reviews|review|best areas|experiences|pros and cons|recommendations|erfahrungen|bewertungen|تجارب|تجربة|آراء|رأي|أفضل المناطق|نصائح|مميزات وعيوب|تجرب|تجربه|تجربیات|نظرات|نظر|دیدگاه|بهترین مناطق|معایب|مزایا|توصیه)/ui
    },
    // 14. Gayrimenkul & Konut Satın Alma (Pure Property Buying & Real Estate - BROADEST INTENT)
    {
      id: 'stag_property_buying',
      name: 'Gayrimenkul & Konut Satın Alma',
      icon: '🏢',
      regex: /(?:купить|покупк|недвижимост|квартир|квартиры|квартиру|жилье|жилья|апартамент|апартаменты|дом|дома|продаж|вторичк|тапу|satılık|satın al|satın alma|almak|alımı|daire al|ev al|mülk al|konut al|emlak|gayrimenkul|mülk|konut|daire|ev|arsa|tapu|sahibinden|buy property|buy apartment|buy house|buy flat|purchase|property for sale|apartment for sale|real estate|properties|property|apartments|apartment|flats|condo|housing|title deed|wohnung kaufen|immobilien|haus kaufen|شراء|تملك|عقارات|عقار|شقق|شقة|بيوت|بيت|منازل|منزل|للبيع|طابو|سند ملكية|خرید|خریدن|خرید ملک|خرید خانه|خرید آپارتمان|خرید ویلا|خرید واحد|فروش|فروشی|املاک|ملک|آپارتمان|خانه|مسکن|واحد|سند|تاپو|دلار|ریال|لیر)/ui
    }
  ];

  const assigned = new Map<string, KeywordMetric[]>();
  stagRules.forEach(r => assigned.set(r.id, []));
  const unassigned: KeywordMetric[] = [];

  // SINGLE-PASS MUTUALLY EXCLUSIVE CLASSIFIER WITH NORMALIZED UNICODE MATCHING
  for (const kw of uniqueKwList) {
    const normalizedKeywordText = normalizeForSemanticClustering(kw.keyword);
    let matched = false;
    for (const rule of stagRules) {
      if (rule.regex.test(normalizedKeywordText)) {
        assigned.get(rule.id)!.push(kw);
        matched = true;
        break; // Match exactly one primary group!
      }
    }
    if (!matched) {
      unassigned.push(kw);
    }
  }

  // Add populated STAG groups with processed/imputed keywords
  for (const rule of stagRules) {
    const list = assigned.get(rule.id) || [];
    if (list.length > 0) {
      const processed = processClusterKeywords(list, rule.name);
      const vol = processed.reduce((s, k) => s + k.monthlyVolume, 0);
      const cpcSum = processed.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0);
      clusters.push({
        id: rule.id,
        name: rule.name,
        icon: rule.icon,
        keywords: processed,
        totalVolume: vol,
        avgCpc: processed.length > 0 ? cpcSum / processed.length : 0,
        selectedCount: 0
      });
    }
  }

  // Comprehensive Multilingual Stop Words (Russian, Turkish, English, German, Persian, Arabic)
  const stopWords = new Set([
    'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'التي', 'الذي', 'و', 'یا', 'در', 'به', 'از', 'با', 'برای', 'که', 'این', 'آن', 'the', 'in', 'for', 'to', 'at', 'and', 'of', 'a', 'an', 'is', 'are', 'with', 'by', 've', 'ile', 'için', 'bir', 'de', 'da', 'bu', 'şu', 'olarak', 'gibi',
    'и', 'в', 'во', 'на', 'с', 'со', 'по', 'для', 'как', 'к', 'ко', 'из', 'изо', 'за', 'от', 'до', 'при', 'под', 'над', 'о', 'об', 'обо', 'про', 'через', 'без', 'или', 'но', 'а', 'да', 'что', 'это', 'где', 'куда', 'откуда', 'когда', 'кто', 'кем', 'чем', 'все', 'всё', 'всех', 'всем', 'всей', 'свой', 'своя', 'свое', 'свои', 'своем', 'своей', 'своего', 'тот', 'та', 'то', 'те', 'том', 'той', 'тех', 'только', 'еще', 'ещё', 'уже', 'также', 'так', 'же', 'ли', 'бы', 'был', 'была', 'быli', 'быть', 'есть', 'нет', 'не', 'ни', 'очень', 'много', 'самый', 'самая', 'самое', 'самые',
    'ترکیه', 'ترکی', 'کشور', 'ایران', 'ایرانیان', 'تركيا', 'تركي', 'دولة', 'بلد', 'türkiye', 'turkiye', 'türkiyede', 'türkiye\'de', 'turkey', 'turkish', 'türkei', 'türkisch', 'турция', 'турции', 'турцию', 'турцией', 'в турции', 'турецкий', 'турецкая', 'турецкое', 'турецкие', 'турецкого', 'турецких',
    'год', 'года', 'году', '2024', '2025', '2026', '2027', 'рф', 'россии', 'граждан', 'граждане', 'человек', 'willy'
  ]);

  // Stem helper to prevent duplicate dynamic cluster names
  const getStem = (w: string): string => {
    return w
      .replace(/(ler|lar|den|dan|de|da|nin|nın|in|ın|ye|ya|e|a|lerı|ları|lerın|ların|inde|ında)$/i, '')
      .replace(/(ов|ев|ей|ах|ях|ам|ям|ом|ем|ой|ей|ью|ами|ями|ого|его|ому|ему|ым|им|ую|юю|ая|яя|ое|ее|ые|ие|ии|ия|ию)$/i, '');
  };

  // Comprehensive Multilingual Stem-to-Turkish Theme Mapping Dictionary (Pure Clean Names without Leading Emojis)
  const stemToTurkishTheme: Record<string, { name: string; icon: string }> = {
    'антал': { name: 'Lokasyon: Antalya, Alanya & Sahil', icon: '🏖️' },
    'алан': { name: 'Lokasyon: Antalya, Alanya & Sahil', icon: '🏖️' },
    'стамбул': { name: 'Lokasyon: İstanbul & Çevresi', icon: '📍' },
    'бодрум': { name: 'Lokasyon: Bodrum & Ege Sahili', icon: '⛵' },
    'мерсин': { name: 'Lokasyon: Mersin & Çevresi', icon: '🌴' },
    'измир': { name: 'Lokasyon: İzmir & Ege Bölgesi', icon: '🌊' },
    'анкар': { name: 'Lokasyon: Ankara & Çevresi', icon: '🏙️' },
    'кипр': { name: 'Lokasyon: Kuzey Kıbrıs', icon: '🏝️' },
    'турци': { name: 'Türkiye Geneli Emlak Fırsatları', icon: '🇹🇷' },
    'продаж': { name: 'Satılık & Satış Odaklı Konutlar', icon: '🏢' },
    'инвест': { name: 'Yatırım & Finansman Fırsatları', icon: '💎' },
    'получен': { name: 'İkamet & Oturum Alım Süreci', icon: '📜' },
    'застройщик': { name: 'Müteahhit & İnşaat Projeleri', icon: '🏗️' },
    'икамет': { name: 'İkamet & Oturum İşlemleri', icon: '🪪' },
    'недвижим': { name: 'Gayrimenkul & Emlak Portföyü', icon: '🏢' },
    'квартир': { name: 'Daire & Konut Seçenekleri', icon: '🏠' },
    'гражданств': { name: 'Türk Vatandaşlığı & Başvuru', icon: '🏛️' },
    'паспорт': { name: 'Pasaport & Kimlik Süreçleri', icon: '🛂' },
    'документ': { name: 'Resmi Evraklar & Koşullar', icon: '📋' },
    'оформлен': { name: 'Resmi Başvuru & Kayıt', icon: '📝' },
    'цен': { name: 'Fiyatlandırma & Bütçe', icon: '💰' },
    'стоимост': { name: 'Masraf & Harç Hesaplama', icon: '💳' },
    'вилл': { name: 'Villa & Müstakil Konutlar', icon: '🏰' },
    'аренд': { name: 'Kiralık Daire & Konaklama', icon: '🔑' },
    'жизн': { name: 'Yaşam & Yerleşim Rehberi', icon: '🌍' },
    'переезд': { name: 'Relokasyon & Taşınma Rehberi', icon: '🚚' },
    'отзыв': { name: 'Kullanıcı Yorumları & Deneyimler', icon: '⭐' },
    'юрист': { name: 'Hukuki Danışmanlık & Avukat', icon: '⚖️' },
    'район': { name: 'Popüler Bölgeler & Lokasyonlar', icon: '📍' },
    'море': { name: 'Denize Sıfır & Sahil Konutları', icon: '🏖️' }
  };

  // Dynamic Semantic N-Gram Sub-Clustering for Unassigned Keywords
  if (unassigned.length >= 4) {
    const tokenFreq = new Map<string, number>();
    
    for (const k of unassigned) {
      const normalizedKText = normalizeForSemanticClustering(k.keyword);
      const words = normalizedKText.split(/\s+/).filter(w => w.length >= 3 && !stopWords.has(w));
      for (const w of words) {
        const stem = getStem(w);
        if (stem.length >= 3 && !stopWords.has(stem)) {
          tokenFreq.set(stem, (tokenFreq.get(stem) || 0) + 1);
        }
      }
    }

    const sortedTokens = Array.from(tokenFreq.entries())
      .filter(([_, count]) => count >= 4)
      .sort((a, b) => b[1] - a[1]);

    const claimedIds = new Set<string>();
    const existingThemeNames = new Set(clusters.map(c => c.name.toLowerCase()));
    let dynIdx = 0;
    for (const [stemToken] of sortedTokens) {
      const matched = unassigned.filter(k => !claimedIds.has(k.id) && normalizeForSemanticClustering(k.keyword).includes(stemToken));
      if (matched.length >= 4) {
        let themeName = '';
        let themeIcon = '✨';

        // Check if stem exists in Turkish Theme Dictionary
        const matchedDictKey = Object.keys(stemToTurkishTheme).find(k => stemToken.includes(k) || k.includes(stemToken));
        if (matchedDictKey) {
          themeName = stemToTurkishTheme[matchedDictKey].name;
          themeIcon = stemToTurkishTheme[matchedDictKey].icon;
        } else {
          // If token has non-latin characters, route to clean Turkish theme
          if (/[\u0400-\u04FF\u0600-\u06FF]/.test(stemToken)) {
            themeName = 'Genel Emlak & Fırsat Aramaları';
            themeIcon = '🎯';
          } else {
            const capName = stemToken.charAt(0).toUpperCase() + stemToken.slice(1);
            themeName = capName + ' Odaklı Arama Teması';
          }
        }
        
        // Prevent duplicate theme names
        if (existingThemeNames.has(themeName.toLowerCase())) {
          continue;
        }
        existingThemeNames.add(themeName.toLowerCase());

        matched.forEach(k => claimedIds.add(k.id));
        const processed = processClusterKeywords(matched, themeName);
        const vol = processed.reduce((s, k) => s + k.monthlyVolume, 0);
        const cpcSum = processed.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0);
        dynIdx++;
        clusters.push({
          id: `stag_dyn_${dynIdx}_` + encodeURIComponent(stemToken).replace(/%/g, '').slice(0, 24),
          name: themeName,
          icon: themeIcon,
          keywords: processed,
          totalVolume: vol,
          avgCpc: processed.length > 0 ? cpcSum / processed.length : 0,
          selectedCount: 0
        });
      }
    }

    // Retain only truly unclustered lone keywords into a clean general group
    const remainingUnassigned = unassigned.filter(k => !claimedIds.has(k.id));
    if (remainingUnassigned.length > 0) {
      const processed = processClusterKeywords(remainingUnassigned, 'Genel & Diğer Fırsatlar');
      const vol = processed.reduce((s, k) => s + k.monthlyVolume, 0);
      const cpcSum = processed.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0);
      clusters.push({
        id: 'stag_core_variations',
        name: 'Genel & Diğer Fırsatlar',
        icon: '🎯',
        keywords: processed,
        totalVolume: vol,
        avgCpc: processed.length > 0 ? cpcSum / processed.length : 0,
        selectedCount: 0
      });
    }
  } else if (unassigned.length > 0) {
    const processed = processClusterKeywords(unassigned, 'Genel & Diğer Fırsatlar');
    const vol = processed.reduce((s, k) => s + k.monthlyVolume, 0);
    const cpcSum = processed.reduce((s, k) => s + ((k.lowCpc + k.highCpc) / 2), 0);
    clusters.push({
      id: 'stag_core_variations',
      name: 'Genel & Diğer Fırsatlar',
      icon: '🎯',
      keywords: processed,
      totalVolume: vol,
      avgCpc: processed.length > 0 ? cpcSum / processed.length : 0,
      selectedCount: 0
    });
  }

  // Ensure 100% Globally Unique Cluster IDs across all character sets
  const seenClusterIds = new Set<string>();
  const uniqueClusters: KeywordCluster[] = [];
  for (const c of clusters) {
    let finalId = c.id;
    let counter = 1;
    while (seenClusterIds.has(finalId)) {
      finalId = `${c.id}_${counter++}`;
    }
    seenClusterIds.add(finalId);
    uniqueClusters.push({ ...c, id: finalId });
  }

  return uniqueClusters.sort((a, b) => b.totalVolume - a.totalVolume);
};

/**
 * Returns a flat list of fully enriched and imputed keywords from semantic clusters
 */
export const enrichKeywordsWithClusterCpc = (
  kwList: KeywordMetric[],
  imputationSettings?: CpcImputationSettings
): KeywordMetric[] => {
  if (!kwList || kwList.length === 0) return [];
  
  const clusters = groupKeywordsSemantically(kwList, imputationSettings);
  const result: KeywordMetric[] = [];
  const seen = new Set<string>();

  clusters.forEach(c => {
    c.keywords.forEach(k => {
      if (!seen.has(k.id)) {
        seen.add(k.id);
        result.push(k);
      }
    });
  });

  return result.length > 0 ? result : kwList;
};
