import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { store } from '@/server/db/store';
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

    const member = store.teamMembers.get(params.id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }

    const arRev = store.teamMemberRevisions.get(member.locales.ar.publishedRevisionId || member.locales.ar.draftRevisionId);
    const enRev = store.teamMemberRevisions.get(member.locales.en.publishedRevisionId || member.locales.en.draftRevisionId);

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

    const member = store.teamMembers.get(params.id);
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

    // Handle Publish / Unpublish actions
    if (action === 'publish') {
      await publishTeamMemberPaired(params.id, user.uid);
      store.persistToDisk();
      revalidateSiteRoutes([
        `/ar/team/${member.locales.ar.slug || params.id}`,
        `/en/team/${member.locales.en.slug || params.id}`,
      ]);
      return NextResponse.json({ success: true, isPublished: true });
    }
    if (action === 'unpublish') {
      await unpublishTeamMember(params.id, user.uid);
      store.persistToDisk();
      revalidateSiteRoutes([
        `/ar/team/${member.locales.ar.slug || params.id}`,
        `/en/team/${member.locales.en.slug || params.id}`,
      ]);
      return NextResponse.json({ success: true, isPublished: false });
    }

    // Update revisions
    const nowIso = new Date().toISOString();
    const arRevId = member.locales.ar.draftRevisionId || member.locales.ar.publishedRevisionId;
    const enRevId = member.locales.en.draftRevisionId || member.locales.en.publishedRevisionId;

    let arRev = arRevId ? store.teamMemberRevisions.get(arRevId) : undefined;
    let enRev = enRevId ? store.teamMemberRevisions.get(enRevId) : undefined;

    if (arRev) {
      if (fullNameAr) arRev.fullName = fullNameAr.trim();
      if (fullNameAr) arRev.title = fullNameAr.trim();
      if (positionTitleAr !== undefined) arRev.positionTitle = positionTitleAr.trim();
      if (summaryAr !== undefined) {
        arRev.summary = summaryAr.trim();
        arRev.blocks = [{ id: 'b1', type: 'paragraph', data: { text: summaryAr.trim() } }];
      }
      if (practiceAreasAr !== undefined) arRev.practiceAreas = Array.isArray(practiceAreasAr) ? practiceAreasAr.filter(Boolean) : [];
      if (spokenLanguagesAr !== undefined) arRev.spokenLanguages = Array.isArray(spokenLanguagesAr) ? spokenLanguagesAr.filter(Boolean) : [];
      if (verifiedCredentialsAr !== undefined) arRev.verifiedCredentials = Array.isArray(verifiedCredentialsAr) ? verifiedCredentialsAr.filter(Boolean) : [];
      if (portraitAssetId !== undefined) arRev.portraitAssetId = portraitAssetId.trim() || undefined;
    }

    if (enRev) {
      if (fullNameEn) enRev.fullName = fullNameEn.trim();
      if (fullNameEn) enRev.title = fullNameEn.trim();
      if (positionTitleEn !== undefined) enRev.positionTitle = positionTitleEn.trim();
      if (summaryEn !== undefined) {
        enRev.summary = summaryEn.trim();
        enRev.blocks = [{ id: 'b1', type: 'paragraph', data: { text: summaryEn.trim() } }];
      }
      if (practiceAreasEn !== undefined) enRev.practiceAreas = Array.isArray(practiceAreasEn) ? practiceAreasEn.filter(Boolean) : [];
      if (spokenLanguagesEn !== undefined) enRev.spokenLanguages = Array.isArray(spokenLanguagesEn) ? spokenLanguagesEn.filter(Boolean) : [];
      if (verifiedCredentialsEn !== undefined) enRev.verifiedCredentials = Array.isArray(verifiedCredentialsEn) ? verifiedCredentialsEn.filter(Boolean) : [];
      if (portraitAssetId !== undefined) enRev.portraitAssetId = portraitAssetId.trim() || undefined;
    }

    if (sortOrder !== undefined) {
      member.sortOrder = Number(sortOrder) || member.sortOrder;
    }
    member.updatedAt = nowIso;
    member.updatedBy = user.uid;

    // If currently published, re-sync projections
    if (member.locales.ar.publishedRevisionId && member.locales.en.publishedRevisionId) {
      await publishTeamMemberPaired(params.id, user.uid);
    }

    store.persistToDisk();
    revalidateSiteRoutes([
      `/ar/team/${member.locales.ar.slug || params.id}`,
      `/en/team/${member.locales.en.slug || params.id}`,
    ]);

    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
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

    const member = store.teamMembers.get(params.id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
    }

    // Unpublish and remove projections first
    store.publishedContent.delete(`teamMember_${params.id}_ar`);
    store.publishedContent.delete(`teamMember_${params.id}_en`);

    // Clean up revisions
    const arRevId = member.locales.ar.publishedRevisionId || member.locales.ar.draftRevisionId;
    const enRevId = member.locales.en.publishedRevisionId || member.locales.en.draftRevisionId;
    if (arRevId) store.teamMemberRevisions.delete(arRevId);
    if (enRevId) store.teamMemberRevisions.delete(enRevId);

    // Delete entity
    store.teamMembers.delete(params.id);
    store.persistToDisk();
    revalidateSiteRoutes([
      `/ar/team/${member.locales.ar.slug || params.id}`,
      `/en/team/${member.locales.en.slug || params.id}`,
    ]);

    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
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
