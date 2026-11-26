import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { store, INITIAL_SETTINGS } from '@/server/db/store';
import { SiteSettings } from '@/server/types';

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
    addressAr: z.string().trim().max(300).optional(),
    addressEn: z.string().trim().max(300).optional(),
    seoTitleAr: z.string().trim().max(200).optional(),
    seoTitleEn: z.string().trim().max(200).optional(),
    seoDescAr: z.string().trim().max(500).optional(),
    seoDescEn: z.string().trim().max(500).optional(),
    ogImageUrl: z.string().trim().max(500).optional(),
    faviconUrl: z.string().trim().max(500).optional(),
    heroHeadlineAr: z.string().trim().max(300).optional(),
    heroHeadlineEn: z.string().trim().max(300).optional(),
    heroDescAr: z.string().trim().max(600).optional(),
    heroDescEn: z.string().trim().max(600).optional(),
    aboutTextAr: z.string().trim().max(2000).optional(),
    aboutTextEn: z.string().trim().max(2000).optional(),
    aboutMissionAr: z.string().trim().max(1000).optional(),
    aboutMissionEn: z.string().trim().max(1000).optional(),
    aboutVisionAr: z.string().trim().max(1000).optional(),
    aboutVisionEn: z.string().trim().max(1000).optional(),
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

    if (!store.siteSettings) {
      store.siteSettings = { ...INITIAL_SETTINGS };
    }

    return NextResponse.json({ settings: redactSettingsForClient(store.siteSettings) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
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

    const sanitized = { ...parsed.data };
    // Do not wipe a previously configured server secret if the masked field is submitted blank
    if (!sanitized.moyasarSecretKey) {
      delete sanitized.moyasarSecretKey;
    }

    store.siteSettings = {
      ...store.siteSettings,
      ...sanitized,
    };

    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'SITE_SETTINGS_UPDATED',
      targetType: 'site_settings',
      targetId: 'global',
      details: { updatedKeys: Object.keys(sanitized) },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, settings: redactSettingsForClient(store.siteSettings) });
  } catch (err: any) {
    const msg = err.message || 'Settings update failed.';
    return NextResponse.json({ error: msg }, { status: msg.startsWith('Forbidden') ? 403 : 400 });
  }
}
