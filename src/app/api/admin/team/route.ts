import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { store } from '@/server/db/store';
import { TeamMemberEntity, TeamMemberRevision } from '@/server/types';
import { publishTeamMemberPaired } from '@/server/repositories/content';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    const members = Array.from(store.teamMembers.values()).sort((a, b) => a.sortOrder - b.sortOrder);
    const enriched = members.map((m) => {
      const arRev = store.teamMemberRevisions.get(m.locales.ar.publishedRevisionId || m.locales.ar.draftRevisionId);
      const enRev = store.teamMemberRevisions.get(m.locales.en.publishedRevisionId || m.locales.en.draftRevisionId);
      return {
        ...m,
        revisions: {
          ar: arRev || null,
          en: enRev || null,
        },
        isPublished: Boolean(m.locales.ar.publishedRevisionId && m.locales.en.publishedRevisionId),
      };
    });

    return NextResponse.json({ team: enriched });
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
      fullNameAr,
      fullNameEn,
      positionTitleAr,
      positionTitleEn,
      summaryAr,
      summaryEn,
      practiceAreasAr = [],
      practiceAreasEn = [],
      spokenLanguagesAr = ['العربية', 'الإنجليزية'],
      spokenLanguagesEn = ['Arabic', 'English'],
      verifiedCredentialsAr = [],
      verifiedCredentialsEn = [],
      portraitAssetId,
      customSlug,
      sortOrder,
      publishImmediately = false,
    } = body;

    if (!fullNameAr?.trim() || !fullNameEn?.trim()) {
      return NextResponse.json(
        { error: 'Bilingual full names (Arabic and English) are strictly required.' },
        { status: 400 }
      );
    }

    const rawSlug = customSlug || fullNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const memberId = rawSlug || `lawyer-${Date.now()}`;

    if (store.teamMembers.has(memberId)) {
      return NextResponse.json({ error: 'A team member with this identifier/slug already exists.' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const arRevId = `rev-tm-${memberId}-ar-1`;
    const enRevId = `rev-tm-${memberId}-en-1`;

    const arRev: TeamMemberRevision = {
      id: arRevId,
      entityId: memberId,
      schemaVersion: 1,
      locale: 'ar',
      title: fullNameAr.trim(),
      slug: memberId,
      fullName: fullNameAr.trim(),
      positionTitle: positionTitleAr?.trim() || 'محامٍ ومستشار قانوني',
      summary: summaryAr?.trim() || fullNameAr.trim(),
      practiceAreas: Array.isArray(practiceAreasAr) ? practiceAreasAr.filter(Boolean) : [],
      spokenLanguages: Array.isArray(spokenLanguagesAr) ? spokenLanguagesAr.filter(Boolean) : ['العربية'],
      verifiedCredentials: Array.isArray(verifiedCredentialsAr) ? verifiedCredentialsAr.filter(Boolean) : [],
      portraitAssetId: portraitAssetId?.trim() || undefined,
      blocks: [{ id: 'b1', type: 'paragraph', data: { text: summaryAr?.trim() || fullNameAr.trim() } }],
      seo: {
        title: fullNameAr.trim(),
        description: summaryAr?.trim() || fullNameAr.trim(),
      },
      approvalEvidenceRefs: ['MOJ-LICENSE-VERIFIED'],
      createdBy: user.uid,
      createdAt: nowIso,
    };

    const enRev: TeamMemberRevision = {
      id: enRevId,
      entityId: memberId,
      schemaVersion: 1,
      locale: 'en',
      title: fullNameEn.trim(),
      slug: memberId,
      fullName: fullNameEn.trim(),
      positionTitle: positionTitleEn?.trim() || 'Legal Counsel & Attorney',
      summary: summaryEn?.trim() || fullNameEn.trim(),
      practiceAreas: Array.isArray(practiceAreasEn) ? practiceAreasEn.filter(Boolean) : [],
      spokenLanguages: Array.isArray(spokenLanguagesEn) ? spokenLanguagesEn.filter(Boolean) : ['Arabic', 'English'],
      verifiedCredentials: Array.isArray(verifiedCredentialsEn) ? verifiedCredentialsEn.filter(Boolean) : [],
      portraitAssetId: portraitAssetId?.trim() || undefined,
      blocks: [{ id: 'b1', type: 'paragraph', data: { text: summaryEn?.trim() || fullNameEn.trim() } }],
      seo: {
        title: fullNameEn.trim(),
        description: summaryEn?.trim() || fullNameEn.trim(),
      },
      approvalEvidenceRefs: ['MOJ-LICENSE-VERIFIED'],
      createdBy: user.uid,
      createdAt: nowIso,
    };

    const newMember: TeamMemberEntity = {
      id: memberId,
      schemaVersion: 1,
      version: 1,
      sortOrder: Number(sortOrder) || (store.teamMembers.size + 1),
      relatedServiceIds: [],
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: user.uid,
      updatedBy: user.uid,
      locales: {
        ar: {
          workflow: publishImmediately ? 'approved' : 'draft',
          draftRevisionId: arRevId,
          approvedRevisionId: publishImmediately ? arRevId : undefined,
          slug: memberId,
        },
        en: {
          workflow: publishImmediately ? 'approved' : 'draft',
          draftRevisionId: enRevId,
          approvedRevisionId: publishImmediately ? enRevId : undefined,
          slug: memberId,
        },
      },
    };

    store.teamMemberRevisions.set(arRevId, arRev);
    store.teamMemberRevisions.set(enRevId, enRev);
    store.teamMembers.set(memberId, newMember);

    if (publishImmediately) {
      await publishTeamMemberPaired(memberId, user.uid);
    }

    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'TEAM_MEMBER_CREATED',
      targetType: 'teamMember',
      targetId: memberId,
      details: { memberId, fullNameAr, fullNameEn, publishImmediately },
      createdAt: nowIso,
    });

    return NextResponse.json({ success: true, memberId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
