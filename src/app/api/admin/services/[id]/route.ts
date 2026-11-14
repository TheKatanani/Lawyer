import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { store } from '@/server/db/store';
import { publishServicePaired } from '@/server/repositories/content';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    assertCapability(user.role, 'content.edit');

    const service = store.services.get(params.id);
    if (!service) return NextResponse.json({ error: 'Service not found.' }, { status: 404 });

    const arRev = store.serviceRevisions.get(service.locales.ar.publishedRevisionId || service.locales.ar.draftRevisionId);
    const enRev = store.serviceRevisions.get(service.locales.en.publishedRevisionId || service.locales.en.draftRevisionId);

    return NextResponse.json({ service, arRev, enRev });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    assertCapability(user.role, 'content.edit');

    const service = store.services.get(params.id);
    if (!service) return NextResponse.json({ error: 'Service not found.' }, { status: 404 });

    const body = await req.json();
    const {
      titleAr,
      titleEn,
      summaryAr,
      summaryEn,
      deliverablesAr,
      deliverablesEn,
      audiences,
      iconName,
    } = body;

    const nowIso = new Date().toISOString();

    // Update Arabic Revision
    const arRevId = service.locales.ar.approvedRevisionId || service.locales.ar.draftRevisionId;
    const arRev = store.serviceRevisions.get(arRevId);
    if (arRev) {
      if (titleAr) arRev.title = titleAr.trim();
      if (summaryAr) {
        arRev.summary = summaryAr.trim();
        arRev.blocks = [{ id: 'b1', type: 'paragraph', data: { text: summaryAr.trim() } }];
      }
      if (deliverablesAr && Array.isArray(deliverablesAr)) {
        arRev.deliverables = deliverablesAr.filter(Boolean);
      }
      if (titleAr) arRev.seo.title = `${titleAr.trim()} | شركة رياض محمد الزهراني للمحاماة`;
      if (summaryAr) arRev.seo.description = summaryAr.trim();
    }

    // Update English Revision
    const enRevId = service.locales.en.approvedRevisionId || service.locales.en.draftRevisionId;
    const enRev = store.serviceRevisions.get(enRevId);
    if (enRev) {
      if (titleEn) enRev.title = titleEn.trim();
      if (summaryEn) {
        enRev.summary = summaryEn.trim();
        enRev.blocks = [{ id: 'b1', type: 'paragraph', data: { text: summaryEn.trim() } }];
      }
      if (deliverablesEn && Array.isArray(deliverablesEn)) {
        enRev.deliverables = deliverablesEn.filter(Boolean);
      }
      if (titleEn) enRev.seo.title = `${titleEn.trim()} | Riyadh Alzahrani Law Firm`;
      if (summaryEn) enRev.seo.description = summaryEn.trim();
    }

    // Update Entity
    if (audiences && Array.isArray(audiences)) {
      service.audiences = audiences;
    }
    if (iconName) {
      service.iconName = iconName;
    }
    service.updatedAt = nowIso;
    service.updatedBy = user.uid;

    // If already published, re-publish projections so public changes appear immediately!
    if (service.locales.ar.publishedRevisionId && service.locales.en.publishedRevisionId) {
      await publishServicePaired(service.id, user.uid);
    }

    // Audit log
    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'SERVICE_UPDATED',
      targetType: 'service',
      targetId: service.id,
      details: { titleAr, titleEn },
      createdAt: nowIso,
    });

    return NextResponse.json({ success: true, service });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    assertCapability(user.role, 'content.edit');

    const service = store.services.get(params.id);
    if (!service) return NextResponse.json({ error: 'Service not found.' }, { status: 404 });

    // Clean up revisions
    store.serviceRevisions.delete(service.locales.ar.draftRevisionId);
    store.serviceRevisions.delete(service.locales.en.draftRevisionId);
    if (service.locales.ar.approvedRevisionId) store.serviceRevisions.delete(service.locales.ar.approvedRevisionId);
    if (service.locales.en.approvedRevisionId) store.serviceRevisions.delete(service.locales.en.approvedRevisionId);

    // Clean up projections
    store.publishedContent.delete(`service_${params.id}_ar`);
    store.publishedContent.delete(`service_${params.id}_en`);

    store.services.delete(params.id);

    // Audit log
    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'SERVICE_DELETED',
      targetType: 'service',
      targetId: params.id,
      details: {},
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
