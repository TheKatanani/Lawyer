import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import {
  appendAuditLog,
  deleteServiceDoc,
  getServiceDoc,
  saveServiceDoc,
} from '@/server/db/dal';
import { publishServicePaired } from '@/server/repositories/content';
import { revalidateSiteRoutes } from '@/server/utils/revalidate';
import { ServiceMethodologyStep } from '@/server/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    assertCapability(user.role, 'content.edit');

    const service = await getServiceDoc(params.id);
    if (!service) return NextResponse.json({ error: 'Service not found.' }, { status: 404 });

    const arRev =
      service.revisions?.[service.locales.ar.publishedRevisionId || service.locales.ar.draftRevisionId];
    const enRev =
      service.revisions?.[service.locales.en.publishedRevisionId || service.locales.en.draftRevisionId];

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

    const service = await getServiceDoc(params.id);
    if (!service) return NextResponse.json({ error: 'Service not found.' }, { status: 404 });

    const body = await req.json();
    const {
      titleAr,
      titleEn,
      summaryAr,
      summaryEn,
      deliverablesAr,
      deliverablesEn,
      problemsAr,
      problemsEn,
      methodologyStepsAr,
      methodologyStepsEn,
      valueToClientAr,
      valueToClientEn,
      audiences,
      iconName,
    } = body;

    const nowIso = new Date().toISOString();
    service.revisions = service.revisions || {};

    const arRevId =
      service.locales.ar.publishedRevisionId ||
      service.locales.ar.approvedRevisionId ||
      service.locales.ar.draftRevisionId;
    const arRev = service.revisions[arRevId];
    if (arRev) {
      if (titleAr) {
        arRev.title = titleAr.trim();
        arRev.seo.title = titleAr.trim();
      }
      if (summaryAr !== undefined) {
        arRev.summary = summaryAr.trim();
        arRev.seo.description = summaryAr.trim();
        arRev.blocks = [{ id: 'b1', type: 'paragraph', data: { text: summaryAr.trim() } }];
      }
      if (deliverablesAr && Array.isArray(deliverablesAr)) {
        arRev.deliverables = deliverablesAr.map((s: any) => String(s).trim()).filter(Boolean);
      }
      if (problemsAr && Array.isArray(problemsAr)) {
        arRev.prerequisites = problemsAr.map((s: any) => String(s).trim()).filter(Boolean);
      }
      if (methodologyStepsAr && Array.isArray(methodologyStepsAr)) {
        const cleanSteps: ServiceMethodologyStep[] = methodologyStepsAr
          .map((s: any, idx: number) => ({
            step: Number(s?.step) || idx + 1,
            title: String(s?.title || '').trim(),
            description: String(s?.description || '').trim(),
          }))
          .filter((s) => s.title);
        arRev.methodologySteps = cleanSteps;
      }
      if (valueToClientAr !== undefined) {
        arRev.valueToClient = String(valueToClientAr).trim();
      }
      service.revisions[arRevId] = arRev;
    }

    const enRevId =
      service.locales.en.publishedRevisionId ||
      service.locales.en.approvedRevisionId ||
      service.locales.en.draftRevisionId;
    const enRev = service.revisions[enRevId];
    if (enRev) {
      if (titleEn) {
        enRev.title = titleEn.trim();
        enRev.seo.title = titleEn.trim();
      }
      if (summaryEn !== undefined) {
        enRev.summary = summaryEn.trim();
        enRev.seo.description = summaryEn.trim();
        enRev.blocks = [{ id: 'b1', type: 'paragraph', data: { text: summaryEn.trim() } }];
      }
      if (deliverablesEn && Array.isArray(deliverablesEn)) {
        enRev.deliverables = deliverablesEn.map((s: any) => String(s).trim()).filter(Boolean);
      }
      if (problemsEn && Array.isArray(problemsEn)) {
        enRev.prerequisites = problemsEn.map((s: any) => String(s).trim()).filter(Boolean);
      }
      if (methodologyStepsEn && Array.isArray(methodologyStepsEn)) {
        const cleanSteps: ServiceMethodologyStep[] = methodologyStepsEn
          .map((s: any, idx: number) => ({
            step: Number(s?.step) || idx + 1,
            title: String(s?.title || '').trim(),
            description: String(s?.description || '').trim(),
          }))
          .filter((s) => s.title);
        enRev.methodologySteps = cleanSteps;
      }
      if (valueToClientEn !== undefined) {
        enRev.valueToClient = String(valueToClientEn).trim();
      }
      service.revisions[enRevId] = enRev;
    }

    if (audiences && Array.isArray(audiences)) {
      service.audiences = audiences;
    }
    if (iconName) {
      service.iconName = iconName;
    }
    service.updatedAt = nowIso;
    service.updatedBy = user.uid;

    await saveServiceDoc(service);

    if (service.locales.ar.publishedRevisionId && service.locales.en.publishedRevisionId) {
      await publishServicePaired(service.id, user.uid);
    }

    revalidateSiteRoutes([
      `/ar/services/${service.locales.ar.slug || service.id}`,
      `/en/services/${service.locales.en.slug || service.id}`,
    ]);

    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'SERVICE_UPDATED',
      targetType: 'service',
      targetId: service.id,
      details: { titleAr, titleEn },
      createdAt: nowIso,
    });

    return NextResponse.json({ success: true, service: await getServiceDoc(params.id) });
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

    const service = await getServiceDoc(params.id);
    if (!service) return NextResponse.json({ error: 'Service not found.' }, { status: 404 });

    await deleteServiceDoc(params.id);

    revalidateSiteRoutes([
      `/ar/services/${service.locales.ar.slug || params.id}`,
      `/en/services/${service.locales.en.slug || params.id}`,
    ]);

    await appendAuditLog({
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
