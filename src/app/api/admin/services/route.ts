import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { appendAuditLog, getServiceDoc, listServiceDocs, saveServiceDoc } from '@/server/db/dal';
import { ServiceDocument, ServiceMethodologyStep, ServiceRevision } from '@/server/types';
import { publishServicePaired } from '@/server/repositories/content';
import { revalidateSiteRoutes } from '@/server/utils/revalidate';

function buildServiceBlocks(
  summary: string,
  deliverables: string[],
  problems: string[],
  steps: ServiceMethodologyStep[],
  valueToClient: string,
  locale: 'ar' | 'en'
) {
  return [
    { id: `b-quote-${locale}`, type: 'quote' as const, data: { text: summary } },
    ...(deliverables.length > 0
      ? [{ id: `b-list-scope-${locale}`, type: 'list' as const, data: { items: deliverables } }]
      : []),
    ...(problems.length > 0
      ? [{ id: `b-list-problems-${locale}`, type: 'list' as const, data: { items: problems } }]
      : []),
    ...(steps.length > 0
      ? [
          {
            id: `b-accordion-method-${locale}`,
            type: 'accordion' as const,
            data: {
              items: steps.map((s) => ({
                title: `${s.step}. ${s.title}`,
                content: s.description,
              })),
            },
          },
        ]
      : []),
    ...(valueToClient
      ? [
          {
            id: `b-callout-val-${locale}`,
            type: 'callout' as const,
            data: {
              title: locale === 'ar' ? 'القيمة للعميل' : 'VALUE TO THE CLIENT',
              text: valueToClient,
            },
          },
        ]
      : []),
  ];
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    const services = await listServiceDocs();
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
      problemsAr = [],
      problemsEn = [],
      methodologyStepsAr = [],
      methodologyStepsEn = [],
      valueToClientAr = '',
      valueToClientEn = '',
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

    const rawSlug =
      customSlug ||
      titleEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const serviceId = rawSlug || `service-${Date.now()}`;

    if (await getServiceDoc(serviceId)) {
      return NextResponse.json(
        { error: 'A service with this ID/slug already exists.' },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const arRevId = `rev-${serviceId}-ar-1`;
    const enRevId = `rev-${serviceId}-en-1`;
    const existingCount = (await listServiceDocs()).length;

    const cleanDeliverablesAr = Array.isArray(deliverablesAr)
      ? deliverablesAr.map((s: any) => String(s).trim()).filter(Boolean)
      : [];
    const cleanDeliverablesEn = Array.isArray(deliverablesEn)
      ? deliverablesEn.map((s: any) => String(s).trim()).filter(Boolean)
      : [];
    const cleanProblemsAr = Array.isArray(problemsAr)
      ? problemsAr.map((s: any) => String(s).trim()).filter(Boolean)
      : [];
    const cleanProblemsEn = Array.isArray(problemsEn)
      ? problemsEn.map((s: any) => String(s).trim()).filter(Boolean)
      : [];
    const cleanStepsAr: ServiceMethodologyStep[] = Array.isArray(methodologyStepsAr)
      ? methodologyStepsAr
          .map((s: any, i: number) => ({
            step: Number(s?.step) || i + 1,
            title: String(s?.title || '').trim(),
            description: String(s?.description || '').trim(),
          }))
          .filter((s) => s.title)
      : [];
    const cleanStepsEn: ServiceMethodologyStep[] = Array.isArray(methodologyStepsEn)
      ? methodologyStepsEn
          .map((s: any, i: number) => ({
            step: Number(s?.step) || i + 1,
            title: String(s?.title || '').trim(),
            description: String(s?.description || '').trim(),
          }))
          .filter((s) => s.title)
      : [];

    const arSum = summaryAr?.trim() || titleAr.trim();
    const enSum = summaryEn?.trim() || titleEn.trim();
    const arVal = String(valueToClientAr || '').trim();
    const enVal = String(valueToClientEn || '').trim();

    const arRev: ServiceRevision = {
      id: arRevId,
      entityId: serviceId,
      schemaVersion: 1,
      locale: 'ar',
      title: titleAr.trim(),
      slug: serviceId,
      summary: arSum,
      deliverables: cleanDeliverablesAr,
      prerequisites: cleanProblemsAr,
      methodologySteps: cleanStepsAr,
      valueToClient: arVal,
      blocks: buildServiceBlocks(
        arSum,
        cleanDeliverablesAr,
        cleanProblemsAr,
        cleanStepsAr,
        arVal,
        'ar'
      ),
      seo: {
        title: titleAr.trim(),
        description: arSum,
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
      summary: enSum,
      deliverables: cleanDeliverablesEn,
      prerequisites: cleanProblemsEn,
      methodologySteps: cleanStepsEn,
      valueToClient: enVal,
      blocks: buildServiceBlocks(
        enSum,
        cleanDeliverablesEn,
        cleanProblemsEn,
        cleanStepsEn,
        enVal,
        'en'
      ),
      seo: {
        title: titleEn.trim(),
        description: enSum,
      },
      approvalEvidenceRefs: ['EVID-NEW-SERVICE'],
      createdBy: user.uid,
      createdAt: nowIso,
    };

    const newService: ServiceDocument = {
      id: serviceId,
      schemaVersion: 1,
      version: 1,
      audiences: Array.isArray(audiences) && audiences.length > 0 ? audiences : ['business'],
      relatedTeamIds: ['riyadh-alzahrani'],
      sortOrder: existingCount + 1,
      iconName: iconName || 'Scale',
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: user.uid,
      updatedBy: user.uid,
      isPublished: false,
      locales: {
        ar: {
          workflow: publishImmediately ? 'approved' : 'draft',
          draftRevisionId: arRevId,
          approvedRevisionId: publishImmediately ? arRevId : undefined,
          slug: serviceId,
        },
        en: {
          workflow: publishImmediately ? 'approved' : 'draft',
          draftRevisionId: enRevId,
          approvedRevisionId: publishImmediately ? enRevId : undefined,
          slug: serviceId,
        },
      },
      revisions: {
        [arRevId]: arRev,
        [enRevId]: enRev,
      },
    };

    await saveServiceDoc(newService);

    if (publishImmediately) {
      await publishServicePaired(serviceId, user.uid);
    }

    revalidateSiteRoutes([`/ar/services/${serviceId}`, `/en/services/${serviceId}`]);
    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'SERVICE_CREATED',
      targetType: 'service',
      targetId: serviceId,
      details: { titleAr, titleEn, publishImmediately },
      createdAt: nowIso,
    });

    return NextResponse.json(
      { success: true, serviceId, service: await getServiceDoc(serviceId) },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
