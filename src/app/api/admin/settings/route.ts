import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { appendAuditLog, getSiteSettings, updateSiteSettings } from '@/server/db/dal';
import { SiteSettings } from '@/server/types';
import { revalidateSiteRoutes } from '@/server/utils/revalidate';

const StatCardSchema = z.object({
  target: z.number().min(0).max(1000000),
  prefix: z.string().trim().max(10).optional(),
  suffixAr: z.string().trim().max(40),
  suffixEn: z.string().trim().max(40),
  titleAr: z.string().trim().min(1).max(160),
  titleEn: z.string().trim().min(1).max(160),
  descAr: z.string().trim().max(300),
  descEn: z.string().trim().max(300),
});

const NumberedStepSchema = z.object({
  num: z.string().trim().max(20),
  titleAr: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().min(1).max(200),
  descAr: z.string().trim().max(800),
  descEn: z.string().trim().max(800),
});

const TitleDescItemSchema = z.object({
  titleAr: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().min(1).max(200),
  descAr: z.string().trim().max(800),
  descEn: z.string().trim().max(800),
});

const LegalSectionSchema = z.object({
  titleAr: z.string().trim().min(1).max(250),
  titleEn: z.string().trim().min(1).max(250),
  bodyAr: z.string().trim().min(1).max(4000),
  bodyEn: z.string().trim().min(1).max(4000),
});

const UpdateSiteSettingsSchema = z
  .object({
    brandNameAr: z.string().trim().min(1).max(200).optional(),
    brandNameEn: z.string().trim().min(1).max(200).optional(),
    brandShortAr: z.string().trim().min(1).max(120).optional(),
    brandShortEn: z.string().trim().min(1).max(120).optional(),
    taglineAr: z.string().trim().max(300).optional(),
    taglineEn: z.string().trim().max(300).optional(),
    phone: z.string().trim().max(60).optional(),
    whatsapp: z.string().trim().max(60).optional(),
    email: z.string().trim().email().max(150).optional(),
    website: z.string().trim().max(200).optional(),
    websiteUrl: z.string().trim().max(250).optional(),
    addressAr: z.string().trim().max(300).optional(),
    addressEn: z.string().trim().max(300).optional(),
    cityAr: z.string().trim().max(100).optional(),
    cityEn: z.string().trim().max(100).optional(),
    countryAr: z.string().trim().max(120).optional(),
    countryEn: z.string().trim().max(120).optional(),
    seoTitleAr: z.string().trim().max(200).optional(),
    seoTitleEn: z.string().trim().max(200).optional(),
    seoDescAr: z.string().trim().max(500).optional(),
    seoDescEn: z.string().trim().max(500).optional(),
    ogImageUrl: z.string().trim().max(500).optional(),
    faviconUrl: z.string().trim().max(500).optional(),

    heroEyebrowAr: z.string().trim().max(250).optional(),
    heroEyebrowEn: z.string().trim().max(250).optional(),
    heroHeadlineAr: z.string().trim().max(300).optional(),
    heroHeadlineEn: z.string().trim().max(300).optional(),
    heroDescAr: z.string().trim().max(600).optional(),
    heroDescEn: z.string().trim().max(600).optional(),
    heroCtaPrimaryAr: z.string().trim().max(120).optional(),
    heroCtaPrimaryEn: z.string().trim().max(120).optional(),
    heroCtaSecondaryAr: z.string().trim().max(120).optional(),
    heroCtaSecondaryEn: z.string().trim().max(120).optional(),
    heroImageAltAr: z.string().trim().max(300).optional(),
    heroImageAltEn: z.string().trim().max(300).optional(),
    heroTrust1Ar: z.string().trim().max(200).optional(),
    heroTrust1En: z.string().trim().max(200).optional(),
    heroTrust2Ar: z.string().trim().max(200).optional(),
    heroTrust2En: z.string().trim().max(200).optional(),
    heroBadgeTitleAr: z.string().trim().max(200).optional(),
    heroBadgeTitleEn: z.string().trim().max(200).optional(),
    heroBadgeSubAr: z.string().trim().max(200).optional(),
    heroBadgeSubEn: z.string().trim().max(200).optional(),

    statsItems: z.array(StatCardSchema).max(12).optional(),

    leadershipEyebrowAr: z.string().trim().max(160).optional(),
    leadershipEyebrowEn: z.string().trim().max(160).optional(),
    leadershipQuoteAr: z.string().trim().max(600).optional(),
    leadershipQuoteEn: z.string().trim().max(600).optional(),
    leadershipBody1Ar: z.string().trim().max(1500).optional(),
    leadershipBody1En: z.string().trim().max(1500).optional(),
    leadershipBody2Ar: z.string().trim().max(1500).optional(),
    leadershipBody2En: z.string().trim().max(1500).optional(),
    leadershipBody3Ar: z.string().trim().max(1500).optional(),
    leadershipBody3En: z.string().trim().max(1500).optional(),
    leadershipAuthorAr: z.string().trim().max(200).optional(),
    leadershipAuthorEn: z.string().trim().max(200).optional(),
    leadershipRoleAr: z.string().trim().max(250).optional(),
    leadershipRoleEn: z.string().trim().max(250).optional(),
    leadershipExperienceBadgeAr: z.string().trim().max(120).optional(),
    leadershipExperienceBadgeEn: z.string().trim().max(120).optional(),

    methodologyEyebrowAr: z.string().trim().max(160).optional(),
    methodologyEyebrowEn: z.string().trim().max(160).optional(),
    methodologyHeadingAr: z.string().trim().max(400).optional(),
    methodologyHeadingEn: z.string().trim().max(400).optional(),
    methodologyDescAr: z.string().trim().max(600).optional(),
    methodologyDescEn: z.string().trim().max(600).optional(),
    methodologySteps: z.array(NumberedStepSchema).max(12).optional(),

    specialisedEyebrowAr: z.string().trim().max(160).optional(),
    specialisedEyebrowEn: z.string().trim().max(160).optional(),
    specialisedHeadingAr: z.string().trim().max(300).optional(),
    specialisedHeadingEn: z.string().trim().max(300).optional(),
    specialisedDescAr: z.string().trim().max(600).optional(),
    specialisedDescEn: z.string().trim().max(600).optional(),
    specialisedItems: z.array(TitleDescItemSchema).max(15).optional(),

    excellenceEyebrowAr: z.string().trim().max(160).optional(),
    excellenceEyebrowEn: z.string().trim().max(160).optional(),
    excellenceHeadingAr: z.string().trim().max(300).optional(),
    excellenceHeadingEn: z.string().trim().max(300).optional(),
    excellenceDescAr: z.string().trim().max(600).optional(),
    excellenceDescEn: z.string().trim().max(600).optional(),
    excellencePillars: z.array(TitleDescItemSchema).max(12).optional(),

    valuesEyebrowAr: z.string().trim().max(160).optional(),
    valuesEyebrowEn: z.string().trim().max(160).optional(),
    valuesHeadingAr: z.string().trim().max(300).optional(),
    valuesHeadingEn: z.string().trim().max(300).optional(),
    valuesItems: z.array(TitleDescItemSchema).max(12).optional(),

    journeyEyebrowAr: z.string().trim().max(160).optional(),
    journeyEyebrowEn: z.string().trim().max(160).optional(),
    journeyHeadingAr: z.string().trim().max(300).optional(),
    journeyHeadingEn: z.string().trim().max(300).optional(),
    journeySteps: z.array(TitleDescItemSchema).max(12).optional(),

    closingWordEyebrowAr: z.string().trim().max(160).optional(),
    closingWordEyebrowEn: z.string().trim().max(160).optional(),
    closingWordAr: z.string().trim().max(800).optional(),
    closingWordEn: z.string().trim().max(800).optional(),
    closingWordAuthorAr: z.string().trim().max(200).optional(),
    closingWordAuthorEn: z.string().trim().max(200).optional(),
    closingWordRoleAr: z.string().trim().max(200).optional(),
    closingWordRoleEn: z.string().trim().max(200).optional(),
    homeCtaHeadingAr: z.string().trim().max(300).optional(),
    homeCtaHeadingEn: z.string().trim().max(300).optional(),
    homeCtaDescAr: z.string().trim().max(600).optional(),
    homeCtaDescEn: z.string().trim().max(600).optional(),

    servicesSectionEyebrowAr: z.string().trim().max(160).optional(),
    servicesSectionEyebrowEn: z.string().trim().max(160).optional(),
    servicesSectionHeadingAr: z.string().trim().max(300).optional(),
    servicesSectionHeadingEn: z.string().trim().max(300).optional(),
    servicesSectionDescAr: z.string().trim().max(600).optional(),
    servicesSectionDescEn: z.string().trim().max(600).optional(),
    teamSectionEyebrowAr: z.string().trim().max(160).optional(),
    teamSectionEyebrowEn: z.string().trim().max(160).optional(),
    teamSectionHeadingAr: z.string().trim().max(300).optional(),
    teamSectionHeadingEn: z.string().trim().max(300).optional(),
    teamSectionDescAr: z.string().trim().max(600).optional(),
    teamSectionDescEn: z.string().trim().max(600).optional(),
    insightsSectionEyebrowAr: z.string().trim().max(160).optional(),
    insightsSectionEyebrowEn: z.string().trim().max(160).optional(),
    insightsSectionHeadingAr: z.string().trim().max(300).optional(),
    insightsSectionHeadingEn: z.string().trim().max(300).optional(),
    insightsSectionDescAr: z.string().trim().max(600).optional(),
    insightsSectionDescEn: z.string().trim().max(600).optional(),
    contactSectionEyebrowAr: z.string().trim().max(160).optional(),
    contactSectionEyebrowEn: z.string().trim().max(160).optional(),
    contactSectionHeadingAr: z.string().trim().max(300).optional(),
    contactSectionHeadingEn: z.string().trim().max(300).optional(),
    contactSectionDescAr: z.string().trim().max(600).optional(),
    contactSectionDescEn: z.string().trim().max(600).optional(),
    contactDisclaimerAr: z.string().trim().max(1000).optional(),
    contactDisclaimerEn: z.string().trim().max(1000).optional(),

    footerSummaryAr: z.string().trim().max(500).optional(),
    footerSummaryEn: z.string().trim().max(500).optional(),
    footerLicenseNoteAr: z.string().trim().max(300).optional(),
    footerLicenseNoteEn: z.string().trim().max(300).optional(),
    footerPdplNoticeAr: z.string().trim().max(600).optional(),
    footerPdplNoticeEn: z.string().trim().max(600).optional(),

    aboutEyebrowAr: z.string().trim().max(200).optional(),
    aboutEyebrowEn: z.string().trim().max(200).optional(),
    aboutTextAr: z.string().trim().max(2000).optional(),
    aboutTextEn: z.string().trim().max(2000).optional(),
    aboutMissionAr: z.string().trim().max(1000).optional(),
    aboutMissionEn: z.string().trim().max(1000).optional(),
    aboutVisionAr: z.string().trim().max(1000).optional(),
    aboutVisionEn: z.string().trim().max(1000).optional(),
    aboutAccreditationTitleAr: z.string().trim().max(250).optional(),
    aboutAccreditationTitleEn: z.string().trim().max(250).optional(),
    aboutAccreditationDescAr: z.string().trim().max(1000).optional(),
    aboutAccreditationDescEn: z.string().trim().max(1000).optional(),
    aboutPillarsHeadingAr: z.string().trim().max(300).optional(),
    aboutPillarsHeadingEn: z.string().trim().max(300).optional(),
    aboutPillars: z.array(NumberedStepSchema).max(10).optional(),

    termsEyebrowAr: z.string().trim().max(160).optional(),
    termsEyebrowEn: z.string().trim().max(160).optional(),
    termsTitleAr: z.string().trim().max(300).optional(),
    termsTitleEn: z.string().trim().max(300).optional(),
    termsUpdatedAr: z.string().trim().max(160).optional(),
    termsUpdatedEn: z.string().trim().max(160).optional(),
    termsSections: z.array(LegalSectionSchema).max(20).optional(),
    privacyEyebrowAr: z.string().trim().max(160).optional(),
    privacyEyebrowEn: z.string().trim().max(160).optional(),
    privacyTitleAr: z.string().trim().max(300).optional(),
    privacyTitleEn: z.string().trim().max(300).optional(),
    privacyIntroAr: z.string().trim().max(600).optional(),
    privacyIntroEn: z.string().trim().max(600).optional(),
    privacySections: z.array(LegalSectionSchema).max(20).optional(),

    paymentEnabled: z.boolean().optional(),
    paymentRequirement: z.enum(['mandatory', 'optional', 'disabled']).optional(),
    consultationFee: z.number().min(0).max(100000).optional(),
    consultationCurrency: z.string().trim().min(3).max(6).optional(),
    moyasarPublishableKey: z.string().trim().max(200).optional(),
    moyasarSecretKey: z.string().trim().max(200).optional(),
    applePayEnabled: z.boolean().optional(),
    paymentNoticeAr: z.string().trim().max(500).optional(),
    paymentNoticeEn: z.string().trim().max(500).optional(),
  })
  .strict();

function redactSettingsForClient(settings: SiteSettings) {
  const { moyasarSecretKey: _secret, ...rest } = settings;
  return {
    ...rest,
    moyasarSecretKey: '',
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    const settings = await getSiteSettings();
    return NextResponse.json({ settings: redactSettingsForClient(settings) });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.message?.startsWith('Forbidden') ? 403 : 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    const rawBody = await req.json().catch(() => null);
    const parsed = UpdateSiteSettingsSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid settings payload.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = { ...parsed.data } as Partial<SiteSettings>;
    if (!payload.moyasarSecretKey) {
      delete payload.moyasarSecretKey;
    }
    const updatedFields = Object.keys(payload);
    const nextSettings = await updateSiteSettings(payload);

    revalidateSiteRoutes();
    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'SITE_SETTINGS_UPDATED',
      targetType: 'siteSettings',
      targetId: 'global',
      details: { updatedFields },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      settings: redactSettingsForClient(nextSettings),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.message?.startsWith('Forbidden') ? 403 : 400 }
    );
  }
}
