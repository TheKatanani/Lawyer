import { SiteSettings, SupportedLocale } from '@/server/types';

export function pickLocalized(
  locale: SupportedLocale | string,
  arValue?: string,
  enValue?: string
): string {
  const isAr = locale === 'ar';
  const primary = isAr ? arValue : enValue;
  const fallback = isAr ? enValue : arValue;
  return (primary || fallback || '').trim();
}

export function getHeroMessages(settings: SiteSettings, locale: SupportedLocale | string) {
  return {
    eyebrow: pickLocalized(locale, settings.heroEyebrowAr, settings.heroEyebrowEn),
    heading: pickLocalized(locale, settings.heroHeadlineAr, settings.heroHeadlineEn),
    description: pickLocalized(locale, settings.heroDescAr, settings.heroDescEn),
    ctaPrimary: pickLocalized(locale, settings.heroCtaPrimaryAr, settings.heroCtaPrimaryEn),
    ctaSecondary: pickLocalized(locale, settings.heroCtaSecondaryAr, settings.heroCtaSecondaryEn),
    imageAlt: pickLocalized(locale, settings.heroImageAltAr, settings.heroImageAltEn),
    trust1: pickLocalized(locale, settings.heroTrust1Ar, settings.heroTrust1En),
    trust2: pickLocalized(locale, settings.heroTrust2Ar, settings.heroTrust2En),
    badgeTitle: pickLocalized(locale, settings.heroBadgeTitleAr, settings.heroBadgeTitleEn),
    badgeSub: pickLocalized(locale, settings.heroBadgeSubAr, settings.heroBadgeSubEn),
  };
}

export function getStatsBannerItems(settings: SiteSettings, locale: SupportedLocale | string) {
  const isAr = locale === 'ar';
  return (settings.statsItems || []).map((item) => ({
    target: item.target,
    prefix: item.prefix || '',
    suffix: isAr ? item.suffixAr : item.suffixEn,
    title: isAr ? item.titleAr : item.titleEn,
    desc: isAr ? item.descAr : item.descEn,
  }));
}

export function getLeadershipContent(settings: SiteSettings, locale: SupportedLocale | string) {
  return {
    eyebrow: pickLocalized(locale, settings.leadershipEyebrowAr, settings.leadershipEyebrowEn),
    quote: pickLocalized(locale, settings.leadershipQuoteAr, settings.leadershipQuoteEn),
    body1: pickLocalized(locale, settings.leadershipBody1Ar, settings.leadershipBody1En),
    body2: pickLocalized(locale, settings.leadershipBody2Ar, settings.leadershipBody2En),
    body3: pickLocalized(locale, settings.leadershipBody3Ar, settings.leadershipBody3En),
    author: pickLocalized(locale, settings.leadershipAuthorAr, settings.leadershipAuthorEn),
    role: pickLocalized(locale, settings.leadershipRoleAr, settings.leadershipRoleEn),
    experienceBadge: pickLocalized(
      locale,
      settings.leadershipExperienceBadgeAr,
      settings.leadershipExperienceBadgeEn
    ),
  };
}

export function getMethodologyProps(settings: SiteSettings, locale: SupportedLocale | string) {
  const isAr = locale === 'ar';
  return {
    eyebrow: pickLocalized(locale, settings.methodologyEyebrowAr, settings.methodologyEyebrowEn),
    heading: pickLocalized(locale, settings.methodologyHeadingAr, settings.methodologyHeadingEn),
    description: pickLocalized(locale, settings.methodologyDescAr, settings.methodologyDescEn),
    steps: (settings.methodologySteps || []).map((s) => ({
      num: s.num,
      title: isAr ? s.titleAr : s.titleEn,
      desc: isAr ? s.descAr : s.descEn,
    })),
  };
}

export function getSpecialisedProps(settings: SiteSettings, locale: SupportedLocale | string) {
  const isAr = locale === 'ar';
  return {
    eyebrow: pickLocalized(locale, settings.specialisedEyebrowAr, settings.specialisedEyebrowEn),
    heading: pickLocalized(locale, settings.specialisedHeadingAr, settings.specialisedHeadingEn),
    description: pickLocalized(locale, settings.specialisedDescAr, settings.specialisedDescEn),
    items: (settings.specialisedItems || []).map((item) => ({
      title: isAr ? item.titleAr : item.titleEn,
      desc: isAr ? item.descAr : item.descEn,
    })),
  };
}

export function getExcellenceProps(settings: SiteSettings, locale: SupportedLocale | string) {
  const isAr = locale === 'ar';
  return {
    eyebrow: pickLocalized(locale, settings.excellenceEyebrowAr, settings.excellenceEyebrowEn),
    heading: pickLocalized(locale, settings.excellenceHeadingAr, settings.excellenceHeadingEn),
    description: pickLocalized(locale, settings.excellenceDescAr, settings.excellenceDescEn),
    pillars: (settings.excellencePillars || []).map((item) => ({
      title: isAr ? item.titleAr : item.titleEn,
      desc: isAr ? item.descAr : item.descEn,
    })),
  };
}

export function getValuesMessages(settings: SiteSettings, locale: SupportedLocale | string) {
  const isAr = locale === 'ar';
  return {
    eyebrow: pickLocalized(locale, settings.valuesEyebrowAr, settings.valuesEyebrowEn),
    heading: pickLocalized(locale, settings.valuesHeadingAr, settings.valuesHeadingEn),
    items: (settings.valuesItems || []).map((item) => ({
      title: isAr ? item.titleAr : item.titleEn,
      desc: isAr ? item.descAr : item.descEn,
    })),
  };
}

export function getJourneyMessages(settings: SiteSettings, locale: SupportedLocale | string) {
  const isAr = locale === 'ar';
  return {
    eyebrow: pickLocalized(locale, settings.journeyEyebrowAr, settings.journeyEyebrowEn),
    heading: pickLocalized(locale, settings.journeyHeadingAr, settings.journeyHeadingEn),
    steps: (settings.journeySteps || []).map((step) => ({
      title: isAr ? step.titleAr : step.titleEn,
      desc: isAr ? step.descAr : step.descEn,
    })),
  };
}

export function getClosingWordProps(settings: SiteSettings, locale: SupportedLocale | string) {
  return {
    eyebrow: pickLocalized(locale, settings.closingWordEyebrowAr, settings.closingWordEyebrowEn),
    quote: pickLocalized(locale, settings.closingWordAr, settings.closingWordEn),
    author: pickLocalized(locale, settings.closingWordAuthorAr, settings.closingWordAuthorEn),
    role: pickLocalized(locale, settings.closingWordRoleAr, settings.closingWordRoleEn),
  };
}
