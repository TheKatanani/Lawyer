import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { store } from '@/server/db/store';
import { ServiceEntity, ServiceRevision } from '@/server/types';
import { publishServicePaired } from '@/server/repositories/content';
import { revalidateSiteRoutes } from '@/server/utils/revalidate';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    const services = Array.from(store.services.values()).sort((a, b) => a.sortOrder - b.sortOrder);
    return NextResponse.json({ services });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    const body = await req.json();
    const {
      titleAr,
      titleEn,
      summaryAr,
      summaryEn,
      deliverablesAr = [],
      deliverablesEn = [],
      audiences = ['business'],
      iconName = 'Scale',
      customSlug,
      publishImmediately = false,
    } = body;

    if (!titleAr?.trim() || !titleEn?.trim()) {
      return NextResponse.json(
        { error: 'Bilingual titles (Arabic and English) are strictly mandatory.' },
        { status: 400 }
      );
    }

    const rawSlug = customSlug || titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const serviceId = rawSlug || `service-${Date.now()}`;

    if (store.services.has(serviceId)) {
      return NextResponse.json({ error: 'A service with this ID/slug already exists.' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const arRevId = `rev-${serviceId}-ar-1`;
    const enRevId = `rev-${serviceId}-en-1`;

    const arRev: ServiceRevision = {
      id: arRevId,
      entityId: serviceId,
      schemaVersion: 1,
      locale: 'ar',
      title: titleAr.trim(),
      slug: serviceId,
      summary: summaryAr?.trim() || titleAr.trim(),
      deliverables: Array.isArray(deliverablesAr) ? deliverablesAr.filter(Boolean) : [],
      blocks: [{ id: 'b1', type: 'paragraph', data: { text: summaryAr?.trim() || titleAr.trim() } }],
      seo: {
        title: titleAr.trim(),
        description: summaryAr?.trim() || titleAr.trim(),
      },
      approvalEvidenceRefs: ['EVID-NEW-SERVICE'],
      createdBy: user.uid,
      createdAt: nowIso,
    };

    const enRev: ServiceRevision = {
      id: enRevId,
      entityId: serviceId,
      schemaVersion: 1,
      locale: 'en',
      title: titleEn.trim(),
      slug: serviceId,
      summary: summaryEn?.trim() || titleEn.trim(),
      deliverables: Array.isArray(deliverablesEn) ? deliverablesEn.filter(Boolean) : [],
      blocks: [{ id: 'b1', type: 'paragraph', data: { text: summaryEn?.trim() || titleEn.trim() } }],
      seo: {
        title: titleEn.trim(),
        description: summaryEn?.trim() || titleEn.trim(),
      },
      approvalEvidenceRefs: ['EVID-NEW-SERVICE'],
      createdBy: user.uid,
      createdAt: nowIso,
    };

    store.serviceRevisions.set(arRevId, arRev);
    store.serviceRevisions.set(enRevId, enRev);

    const newService: ServiceEntity = {
      id: serviceId,
      schemaVersion: 1,
      version: 1,
      audiences: audiences.length > 0 ? audiences : ['business'],
      relatedTeamIds: ['riyadh-alzahrani'],
      sortOrder: store.services.size + 1,
      iconName: iconName || 'Scale',
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: user.uid,
      updatedBy: user.uid,
      locales: {
        ar: {
          workflow: 'approved',
          draftRevisionId: arRevId,
          approvedRevisionId: arRevId,
          publishedRevisionId: publishImmediately ? arRevId : undefined,
          slug: serviceId,
        },
        en: {
          workflow: 'approved',
          draftRevisionId: enRevId,
          approvedRevisionId: enRevId,
          publishedRevisionId: publishImmediately ? enRevId : undefined,
          slug: serviceId,
        },
      },
    };

    store.services.set(serviceId, newService);

    if (publishImmediately) {
      await publishServicePaired(serviceId, user.uid);
    }

    store.persistToDisk();
    revalidateSiteRoutes([`/ar/services/${serviceId}`, `/en/services/${serviceId}`]);

    // Audit log
    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'SERVICE_CREATED',
      targetType: 'service',
      targetId: serviceId,
      details: { titleAr, titleEn, publishImmediately },
      createdAt: nowIso,
    });

    return NextResponse.json({ success: true, service: newService, serviceId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create service.' }, { status: 403 });
  }
}
