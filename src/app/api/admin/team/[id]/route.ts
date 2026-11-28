import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import {
  appendAuditLog,
  deleteTeamMemberDoc,
  getTeamMemberDoc,
  saveTeamMemberDoc,
} from '@/server/db/dal';
import { publishTeamMemberPaired, unpublishTeamMember } from '@/server/repositories/content';
import { revalidateSiteRoutes } from '@/server/utils/revalidate';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    const member = await getTeamMemberDoc(params.id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }

    const arRev =
      member.revisions?.[member.locales.ar.publishedRevisionId || member.locales.ar.draftRevisionId];
    const enRev =
      member.revisions?.[member.locales.en.publishedRevisionId || member.locales.en.draftRevisionId];

    return NextResponse.json({
      member,
      revisions: { ar: arRev, en: enRev },
      isPublished: Boolean(member.locales.ar.publishedRevisionId && member.locales.en.publishedRevisionId),
    });
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    const member = await getTeamMemberDoc(params.id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }

    const body = await req.json();
    const {
      fullNameAr,
      fullNameEn,
      positionTitleAr,
      positionTitleEn,
      summaryAr,
      summaryEn,
      practiceAreasAr,
      practiceAreasEn,
      spokenLanguagesAr,
      spokenLanguagesEn,
      verifiedCredentialsAr,
      verifiedCredentialsEn,
      portraitAssetId,
      sortOrder,
      action,
    } = body;

    if (action === 'publish') {
      await publishTeamMemberPaired(params.id, user.uid);
      revalidateSiteRoutes([
        `/ar/team/${member.locales.ar.slug || params.id}`,
        `/en/team/${member.locales.en.slug || params.id}`,
      ]);
      return NextResponse.json({ success: true, isPublished: true });
    }
    if (action === 'unpublish') {
      await unpublishTeamMember(params.id, user.uid);
      revalidateSiteRoutes([
        `/ar/team/${member.locales.ar.slug || params.id}`,
        `/en/team/${member.locales.en.slug || params.id}`,
      ]);
      return NextResponse.json({ success: true, isPublished: false });
    }

    const nowIso = new Date().toISOString();
    member.revisions = member.revisions || {};
    const arRevId = member.locales.ar.draftRevisionId || member.locales.ar.publishedRevisionId;
    const enRevId = member.locales.en.draftRevisionId || member.locales.en.publishedRevisionId;

    const arRev = arRevId ? member.revisions[arRevId] : undefined;
    const enRev = enRevId ? member.revisions[enRevId] : undefined;

    if (arRev) {
      if (fullNameAr) {
        arRev.fullName = fullNameAr.trim();
        arRev.title = fullNameAr.trim();
        arRev.seo.title = fullNameAr.trim();
      }
      if (positionTitleAr !== undefined) arRev.positionTitle = positionTitleAr.trim();
      if (summaryAr !== undefined) {
        arRev.summary = summaryAr.trim();
        arRev.seo.description = summaryAr.trim();
        arRev.blocks = [{ id: 'b1', type: 'paragraph', data: { text: summaryAr.trim() } }];
      }
      if (practiceAreasAr !== undefined)
        arRev.practiceAreas = Array.isArray(practiceAreasAr) ? practiceAreasAr.filter(Boolean) : [];
      if (spokenLanguagesAr !== undefined)
        arRev.spokenLanguages = Array.isArray(spokenLanguagesAr) ? spokenLanguagesAr.filter(Boolean) : [];
      if (verifiedCredentialsAr !== undefined)
        arRev.verifiedCredentials = Array.isArray(verifiedCredentialsAr)
          ? verifiedCredentialsAr.filter(Boolean)
          : [];
      if (portraitAssetId !== undefined) arRev.portraitAssetId = portraitAssetId.trim() || undefined;
      member.revisions[arRev.id] = arRev;
    }

    if (enRev) {
      if (fullNameEn) {
        enRev.fullName = fullNameEn.trim();
        enRev.title = fullNameEn.trim();
        enRev.seo.title = fullNameEn.trim();
      }
      if (positionTitleEn !== undefined) enRev.positionTitle = positionTitleEn.trim();
      if (summaryEn !== undefined) {
        enRev.summary = summaryEn.trim();
        enRev.seo.description = summaryEn.trim();
        enRev.blocks = [{ id: 'b1', type: 'paragraph', data: { text: summaryEn.trim() } }];
      }
      if (practiceAreasEn !== undefined)
        enRev.practiceAreas = Array.isArray(practiceAreasEn) ? practiceAreasEn.filter(Boolean) : [];
      if (spokenLanguagesEn !== undefined)
        enRev.spokenLanguages = Array.isArray(spokenLanguagesEn) ? spokenLanguagesEn.filter(Boolean) : [];
      if (verifiedCredentialsEn !== undefined)
        enRev.verifiedCredentials = Array.isArray(verifiedCredentialsEn)
          ? verifiedCredentialsEn.filter(Boolean)
          : [];
      if (portraitAssetId !== undefined) enRev.portraitAssetId = portraitAssetId.trim() || undefined;
      member.revisions[enRev.id] = enRev;
    }

    if (sortOrder !== undefined) {
      member.sortOrder = Number(sortOrder) || member.sortOrder;
    }
    member.updatedAt = nowIso;
    member.updatedBy = user.uid;

    await saveTeamMemberDoc(member);

    if (member.locales.ar.publishedRevisionId && member.locales.en.publishedRevisionId) {
      await publishTeamMemberPaired(params.id, user.uid);
    }

    revalidateSiteRoutes([
      `/ar/team/${member.locales.ar.slug || params.id}`,
      `/en/team/${member.locales.en.slug || params.id}`,
    ]);

    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'TEAM_MEMBER_UPDATED',
      targetType: 'teamMember',
      targetId: params.id,
      details: { memberId: params.id },
      createdAt: nowIso,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    const member = await getTeamMemberDoc(params.id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }

    await deleteTeamMemberDoc(params.id);

    revalidateSiteRoutes([
      `/ar/team/${member.locales.ar.slug || params.id}`,
      `/en/team/${member.locales.en.slug || params.id}`,
    ]);

    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'TEAM_MEMBER_DELETED',
      targetType: 'teamMember',
      targetId: params.id,
      details: { memberId: params.id },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
