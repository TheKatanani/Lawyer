import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import {
  appendAuditLog,
  deleteArticleDoc,
  getArticleDoc,
  saveArticleDoc,
} from '@/server/db/dal';
import { publishArticlePaired, unpublishArticle } from '@/server/repositories/content';
import { computeArticleReadingTimeMinutes } from '@/lib/reading-time';
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

    const article = await getArticleDoc(params.id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    const arRev =
      article.revisions?.[article.locales.ar.publishedRevisionId || article.locales.ar.draftRevisionId];
    const enRev =
      article.revisions?.[article.locales.en.publishedRevisionId || article.locales.en.draftRevisionId];

    return NextResponse.json({
      article,
      revisions: { ar: arRev, en: enRev },
      isPublished: Boolean(article.locales.ar.publishedRevisionId && article.locales.en.publishedRevisionId),
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

    const article = await getArticleDoc(params.id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    const body = await req.json();
    const {
      titleAr,
      titleEn,
      summaryAr,
      summaryEn,
      contentAr,
      contentEn,
      categoryIds,
      authorTeamMemberId,
      coverAssetId,
      action,
    } = body;

    if (action === 'publish') {
      await publishArticlePaired(params.id, user.uid);
      revalidateSiteRoutes([
        `/ar/insights/${article.locales.ar.slug || params.id}`,
        `/en/insights/${article.locales.en.slug || params.id}`,
      ]);
      return NextResponse.json({ success: true, isPublished: true });
    }
    if (action === 'unpublish') {
      await unpublishArticle(params.id, user.uid);
      revalidateSiteRoutes([
        `/ar/insights/${article.locales.ar.slug || params.id}`,
        `/en/insights/${article.locales.en.slug || params.id}`,
      ]);
      return NextResponse.json({ success: true, isPublished: false });
    }

    const nowIso = new Date().toISOString();
    article.revisions = article.revisions || {};
    const arRevId = article.locales.ar.draftRevisionId || article.locales.ar.publishedRevisionId;
    const enRevId = article.locales.en.draftRevisionId || article.locales.en.publishedRevisionId;

    const arRev = arRevId ? article.revisions[arRevId] : undefined;
    const enRev = enRevId ? article.revisions[enRevId] : undefined;

    if (arRev) {
      if (titleAr) arRev.title = titleAr.trim();
      if (summaryAr !== undefined) arRev.summary = summaryAr.trim();
      if (contentAr !== undefined) {
        arRev.blocks = [{ id: 'b1', type: 'paragraph', data: { text: contentAr.trim() } }];
      }
      arRev.readingTimeMinutes = computeArticleReadingTimeMinutes(arRev.summary, arRev.blocks);
      if (coverAssetId !== undefined) arRev.coverAssetId = coverAssetId.trim() || undefined;
      arRev.seo.title = arRev.title;
      arRev.seo.description = arRev.summary;
      arRev.seo.imageAssetId = arRev.coverAssetId;
      article.revisions[arRev.id] = arRev;
    }

    if (enRev) {
      if (titleEn) enRev.title = titleEn.trim();
      if (summaryEn !== undefined) enRev.summary = summaryEn.trim();
      if (contentEn !== undefined) {
        enRev.blocks = [{ id: 'b1', type: 'paragraph', data: { text: contentEn.trim() } }];
      }
      enRev.readingTimeMinutes = computeArticleReadingTimeMinutes(enRev.summary, enRev.blocks);
      if (coverAssetId !== undefined) enRev.coverAssetId = coverAssetId.trim() || undefined;
      enRev.seo.title = enRev.title;
      enRev.seo.description = enRev.summary;
      enRev.seo.imageAssetId = enRev.coverAssetId;
      article.revisions[enRev.id] = enRev;
    }

    if (categoryIds !== undefined) {
      article.categoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
    }
    if (authorTeamMemberId !== undefined) {
      article.authorTeamMemberId = authorTeamMemberId || undefined;
    }

    article.updatedAt = nowIso;
    article.updatedBy = user.uid;

    await saveArticleDoc(article);

    if (article.locales.ar.publishedRevisionId && article.locales.en.publishedRevisionId) {
      await publishArticlePaired(params.id, user.uid);
    }

    revalidateSiteRoutes([
      `/ar/insights/${article.locales.ar.slug || params.id}`,
      `/en/insights/${article.locales.en.slug || params.id}`,
    ]);

    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'ARTICLE_UPDATED',
      targetType: 'article',
      targetId: params.id,
      details: { articleId: params.id },
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

    const article = await getArticleDoc(params.id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    await deleteArticleDoc(params.id);

    revalidateSiteRoutes([
      `/ar/insights/${article.locales.ar.slug || params.id}`,
      `/en/insights/${article.locales.en.slug || params.id}`,
    ]);

    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'ARTICLE_DELETED',
      targetType: 'article',
      targetId: params.id,
      details: { articleId: params.id },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
