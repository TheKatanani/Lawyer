import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { store } from '@/server/db/store';
import { publishArticlePaired, unpublishArticle } from '@/server/repositories/content';
import { computeArticleReadingTimeMinutes } from '@/lib/reading-time';

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

    const article = store.articles.get(params.id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    const arRev = store.articleRevisions.get(article.locales.ar.publishedRevisionId || article.locales.ar.draftRevisionId);
    const enRev = store.articleRevisions.get(article.locales.en.publishedRevisionId || article.locales.en.draftRevisionId);

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

    const article = store.articles.get(params.id);
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
      readingTimeMinutes,
      coverAssetId,
      action,
    } = body;

    // Handle Publish / Unpublish actions
    if (action === 'publish') {
      await publishArticlePaired(params.id, user.uid);
      return NextResponse.json({ success: true, isPublished: true });
    }
    if (action === 'unpublish') {
      await unpublishArticle(params.id, user.uid);
      return NextResponse.json({ success: true, isPublished: false });
    }

    const nowIso = new Date().toISOString();
    const arRevId = article.locales.ar.draftRevisionId || article.locales.ar.publishedRevisionId;
    const enRevId = article.locales.en.draftRevisionId || article.locales.en.publishedRevisionId;

    let arRev = arRevId ? store.articleRevisions.get(arRevId) : undefined;
    let enRev = enRevId ? store.articleRevisions.get(enRevId) : undefined;

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
    }

    if (categoryIds !== undefined) {
      article.categoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
    }
    if (authorTeamMemberId !== undefined) {
      article.authorTeamMemberId = authorTeamMemberId || undefined;
    }

    article.updatedAt = nowIso;
    article.updatedBy = user.uid;

    // If currently published, re-sync projections
    if (article.locales.ar.publishedRevisionId && article.locales.en.publishedRevisionId) {
      await publishArticlePaired(params.id, user.uid);
    }

    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
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

    const article = store.articles.get(params.id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    // Delete projections
    store.publishedContent.delete(`article_${params.id}_ar`);
    store.publishedContent.delete(`article_${params.id}_en`);

    // Delete revisions
    const arRevId = article.locales.ar.publishedRevisionId || article.locales.ar.draftRevisionId;
    const enRevId = article.locales.en.publishedRevisionId || article.locales.en.draftRevisionId;
    if (arRevId) store.articleRevisions.delete(arRevId);
    if (enRevId) store.articleRevisions.delete(enRevId);

    // Delete entity
    store.articles.delete(params.id);

    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
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
