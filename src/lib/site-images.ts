export type ImageLocale = 'ar' | 'en';

export interface SiteImageMeta {
  src: string;
  width: number;
  height: number;
  alt: Record<ImageLocale, string>;
}

export const SITE_IMAGES = {
  'home-hero': {
    src: '/images/home-hero.webp',
    width: 1600,
    height: 1200,
    alt: {
      en: 'Executive Saudi law office table with stacked navy leather volumes and a brass scale of justice beside limestone pillars and a coastal skyline at dusk',
      ar: 'طاولة مكتب محاماة سعودي تنفيذي تضم مجلدات قانونية جلدية كحلية وميزان عدالة نحاسي بجانب أعمدة من الحجر الجيري وإطلالة على أفق ساحلي عند الغسق',
    },
  },
  'about-library': {
    src: '/images/about-library.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Prestigious Saudi law library with dark walnut bookshelves, leather-bound volumes, a limestone arch, and a brass scale of justice on a marble table',
      ar: 'مكتبة قانونية سعودية رصينة تضم أرفف خشب الجوز الداكن ومجلدات جلدية وقوساً حجرياً وميزان عدالة نحاسياً على طاولة رخامية',
    },
  },
  'criminal-litigation': {
    src: '/images/criminal-litigation.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Two open dark navy leather case folders, a sealed cream dossier, and a brass magnifying glass on a walnut desk with a brass scale of justice and city skyline',
      ar: 'ملفا قضية جلديان كحليان مفتوحان ومظروف كريمي مختوم وعدسة مكبرة نحاسية على مكتب من خشب الجوز مع ميزان عدالة نحاسي وأفق المدينة',
    },
  },
  'civil-litigation': {
    src: '/images/civil-litigation.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Three dark navy leather desk trays holding neatly tied stacks of ivory legal documents beside a brass scale of justice and mashrabiya window view',
      ar: 'ثلاث صوانٍ مكتبية من الجلد الكحلي تحتوي على رزم وثائق قانونية عاجية مربوطة بجانب ميزان عدالة نحاسي ونافذة مشربية',
    },
  },
  'family-law': {
    src: '/images/about-library.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Quiet private legal consultation library with a limestone arch, dark walnut bookshelves, a closed navy dossier, and a brass scale of justice',
      ar: 'مكتبة استشارات قانونية خاصة وهادئة تضم قوساً من الحجر الجيري وأرفف خشب الجوز وملفاً كحلياً مغلقاً وميزان عدالة نحاسياً',
    },
  },
  'estate-disputes': {
    src: '/images/estate-disputes.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Open dark navy estate ledger flanked by four ivory folders with brass corner clips, a brass divider compass, calibrated weights, and a gold fountain pen on a walnut desk',
      ar: 'سجل تركة جلدي كحلي مفتوح تحفّه أربعة ملفات عاجية بزوايا نحاسية وفرجار وأوزان معايرة وقلم حبر ذهبي على مكتب من خشب الجوز',
    },
  },
  'administrative-litigation': {
    src: '/images/administrative-litigation.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Closed dark navy leather clasp dossier on a travertine stone ledge in front of a grand limestone colonnade with golden mashrabiya arches and a brass scale of justice',
      ar: 'ملف جلدي كحلي مغلق بمشبك نحاسي على حافة من الحجر الجيري أمام رواق أعمدة وأقواس مشربية ذهبية وميزان عدالة نحاسي',
    },
  },
  'commercial-corporate': {
    src: '/images/commercial-corporate.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Three stacked dark navy corporate minute books beside a heavy brass embossing seal press and ivory sheet on a walnut boardroom table',
      ar: 'ثلاثة دفاتر محاضر شركات جلدية كحلية مرصوصة بجانب مكبس ختم نحاسي ثقيل وورقة عاجية على طاولة اجتماعات خشبية',
    },
  },
  'banking-finance': {
    src: '/images/banking-finance.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Heavy brass vault key resting beside a dark navy leather portfolio inside an open steel safe with bound ledgers and brass scales in the background',
      ar: 'مفتاح خزنة نحاسي ثقيل بجانب ملف جلدي كحلي داخل خزنة مفتوحة تضم سجلات مجلدة مع ميزان عدالة نحاسي في الخلفية',
    },
  },
  'enforcement-debt-recovery': {
    src: '/images/enforcement-debt-recovery.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Polished brass official seal stamp beside a cord-bound ivory enforcement dossier and brass paperweight on a dark marble desk',
      ar: 'ختم رسمي نحاسي مصقول بجانب ملف تنفيذ عاجي مربوط بحبل ومثقل ورق نحاسي على مكتب من الرخام الداكن',
    },
  },
  'real-estate-construction': {
    src: '/images/administrative-litigation.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Closed dark navy leather portfolio resting on a travertine stone ledge overlooking a limestone architectural colonnade with golden arches and brass scales',
      ar: 'ملف جلدي كحلي مغلق على حافة من حجر الترافرتين يطل على رواق أعمدة وأقواس معمارية ذهبية وميزان عدالة نحاسي',
    },
  },
  'labour-employment': {
    src: '/images/labour-employment.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Two symmetrical closed dark navy leather contract folios with ivory pages beside a gold fountain pen and brushed brass desk timepiece on a dark walnut table',
      ar: 'ملفا عقود جلديان كحليان متناظران بأوراق عاجية بجانب قلم حبر ذهبي وساعة مكتبية نحاسية على طاولة من خشب الجوز الداكن',
    },
  },
  'arbitration-mediation': {
    src: '/images/arbitration-mediation.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Symmetrical arbitration boardroom table with two facing dark navy leather chairs and a walnut and brass gavel resting on a dark veined marble block between two navy dossiers',
      ar: 'طاولة تحكيم متناظرة يتقابل حولها كرسيان جلديان كحليان وتتوسطها مطرقة خشبية ونحاسية فوق قاعدة رخامية داكنة بين ملفين كحليين',
    },
  },
  'bankruptcy-restructuring': {
    src: '/images/enforcement-debt-recovery.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Bound ivory financial restructuring ledger secured with cord beside a brushed brass official seal and geometric counterweight on a dark marble desk',
      ar: 'سجل مالي عاجي لإعادة التنظيم المالي مربوط بحبل بجانب ختم رسمي نحاسي ومثقل ورق هندسي على مكتب من الرخام الداكن',
    },
  },
  'waqf-family-wealth': {
    src: '/images/waqf-family-wealth.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Gold Islamic geometric eight-pointed star lattice casting crisp shadows across an open dark navy leather folio with ivory deed pages on a walnut desk',
      ar: 'مجسم هندسي إسلامي ذهبي بنجمة ثمانية يُلقي ظلاله على ملف جلدي كحلي مفتوح يضم وثيقة وقف عاجية على مكتب من الجوز',
    },
  },
  'ip-franchising': {
    src: '/images/ip-franchising.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Warm ivory presentation certificate embossed with a raised gold eight-pointed star seal sliding from a dark navy leather portfolio beside a brass stylus',
      ar: 'شهادة عاجية ممهورة بختم هندسي ذهبي بارز تخرج من حافظة جلدية كحلية بجانب أداة نقش نحاسية',
    },
  },
  'foreign-investment': {
    src: '/images/foreign-investment.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Brushed brass globe centered on Saudi Arabia beside a closed navy leather dossier and model container vessel overlooking port cranes at dusk',
      ar: 'كرة أرضية نحاسية تُبرز المملكة العربية السعودية بجانب ملف جلدي كحلي ومجسم سفينة شحن مع إطلالة على رافعات ميناء عند الغسق',
    },
  },
  'legal-advisory-governance': {
    src: '/images/legal-advisory-governance.webp',
    width: 1600,
    height: 900,
    alt: {
      en: 'Open dark navy leather governance binder with tabbed ivory index dividers, gold fountain pen, and brushed brass paperweight on a walnut boardroom table',
      ar: 'ملف حوكمة جلدي كحلي مفتوح بفواصل عاجية وقلم حبر ذهبي ومثقل ورق نحاسي على طاولة اجتماعات من خشب الجوز',
    },
  },
} as const satisfies Record<string, SiteImageMeta>;

export type SiteImageSlug = keyof typeof SITE_IMAGES;

export function isSiteImageSlug(slug: string): slug is SiteImageSlug {
  return Object.prototype.hasOwnProperty.call(SITE_IMAGES, slug);
}

export function getSiteImage(slug: string): SiteImageMeta | undefined {
  return isSiteImageSlug(slug) ? SITE_IMAGES[slug] : undefined;
}
