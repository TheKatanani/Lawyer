import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import {
  appendAuditLog,
  getArticleDoc,
  getTeamMemberDoc,
  listArticleDocs,
  saveArticleDoc,
} from '@/server/db/dal';
import { ArticleDocument, ArticleRevision } from '@/server/types';
import { publishArticlePaired } from '@/server/repositories/content';
import { computeArticleReadingTimeMinutes } from '@/lib/reading-time';
import { revalidateSiteRoutes } from '@/server/utils/revalidate';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'content.edit');

    const articles = await listArticleDocs();
    const enriched = await Promise.all(
      articles.map(async (a) => {
        const arRev =
          a.revisions?.[a.locales.ar.publishedRevisionId || a.locales.ar.draftRevisionId];
        const enRev =
          a.revisions?.[a.locales.en.publishedRevisionId || a.locales.en.draftRevisionId];
        const author = a.authorTeamMemberId
          ? await getTeamMemberDoc(a.authorTeamMemberId)
          : null;
        const authorArRev = author
          ? author.revisions?.[
              author.locales.ar.publishedRevisionId || author.locales.ar.draftRevisionId
            ]
          : null;

        return {
          ...a,
          authorName: authorArRev?.fullName || a.authorTeamMemberId || 'شركة رياض الزهراني للمحاماة',
          revisions: {
            ar: arRev || null,
            en: enRev || null,
          },
          isPublished: Boolean(a.locales.ar.publishedRevisionId && a.locales.en.publishedRevisionId),
        };
      })
    );

    return NextResponse.json({ articles: enriched });
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
      contentAr,
      contentEn,
      categoryIds = ['corporate-law'],
      authorTeamMemberId = 'riyadh-alzahrani',
      relatedServiceIds = [],
      coverAssetId,
      customSlug,
      publishImmediately = false,
    } = body;

    if (!titleAr?.trim() || !titleEn?.trim()) {
      return NextResponse.json(
        { error: 'Bilingual article titles (Arabic and English) are strictly required.' },
        { status: 400 }
      );
    }

    const rawSlug =
      customSlug ||
      titleEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const articleId = rawSlug || `article-${Date.now()}`;

    if (await getArticleDoc(articleId)) {
      return NextResponse.json(
        { error: 'An article with this slug/ID already exists.' },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const arRevId = `rev-art-${articleId}-ar-1`;
    const enRevId = `rev-art-${articleId}-en-1`;

    const arBlocks = [
      {
        id: 'b1',
        type: 'paragraph' as const,
        data: { text: contentAr?.trim() || summaryAr?.trim() || titleAr.trim() },
      },
    ];
    const enBlocks = [
      {
        id: 'b1',
        type: 'paragraph' as const,
        data: { text: contentEn?.trim() || summaryEn?.trim() || titleEn.trim() },
      },
    ];

    const arRev: ArticleRevision = {
      id: arRevId,
      entityId: articleId,
      schemaVersion: 1,
      locale: 'ar',
      title: titleAr.trim(),
      slug: articleId,
      summary: summaryAr?.trim() || titleAr.trim(),
      readingTimeMinutes: computeArticleReadingTimeMinutes(summaryAr?.trim() || titleAr.trim(), arBlocks),
      coverAssetId: coverAssetId?.trim() || undefined,
      blocks: arBlocks,
      seo: {
        title: titleAr.trim(),
        description: summaryAr?.trim() || titleAr.trim(),
        imageAssetId: coverAssetId?.trim() || undefined,
      },
      approvalEvidenceRefs: ['LEGAL-EDITORIAL-REVIEW'],
      createdBy: user.uid,
      createdAt: nowIso,
    };

    const enRev: ArticleRevision = {
      id: enRevId,
      entityId: articleId,
      schemaVersion: 1,
      locale: 'en',
      title: titleEn.trim(),
      slug: articleId,
      summary: summaryEn?.trim() || titleEn.trim(),
      readingTimeMinutes: computeArticleReadingTimeMinutes(summaryEn?.trim() || titleEn.trim(), enBlocks),
      coverAssetId: coverAssetId?.trim() || undefined,
      blocks: enBlocks,
      seo: {
        title: titleEn.trim(),
        description: summaryEn?.trim() || titleEn.trim(),
        imageAssetId: coverAssetId?.trim() || undefined,
      },
      approvalEvidenceRefs: ['LEGAL-EDITORIAL-REVIEW'],
      createdBy: user.uid,
      createdAt: nowIso,
    };

    const newArticle: ArticleDocument = {
      id: articleId,
      schemaVersion: 1,
      version: 1,
      categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds],
      authorTeamMemberId: authorTeamMemberId || undefined,
      relatedServiceIds: Array.isArray(relatedServiceIds) ? relatedServiceIds : [],
      publishedAt: publishImmediately ? nowIso : undefined,
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
          slug: articleId,
        },
        en: {
          workflow: publishImmediately ? 'approved' : 'draft',
          draftRevisionId: enRevId,
          approvedRevisionId: publishImmediately ? enRevId : undefined,
          slug: articleId,
        },
      },
      revisions: {
        [arRevId]: arRev,
        [enRevId]: enRev,
      },
    };

    await saveArticleDoc(newArticle);

    if (publishImmediately) {
      await publishArticlePaired(articleId, user.uid);
    }

    revalidateSiteRoutes([`/ar/insights/${articleId}`, `/en/insights/${articleId}`]);
    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'ARTICLE_CREATED',
      targetType: 'article',
      targetId: articleId,
      details: { articleId, titleAr, titleEn, publishImmediately },
      createdAt: nowIso,
    });

    return NextResponse.json({ success: true, articleId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
