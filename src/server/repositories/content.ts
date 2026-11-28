import 'server-only';
import {
  appendAuditLog,
  getAdminByUid,
  getArticleBySlugOrId,
  getArticleDoc,
  getServiceBySlugOrId,
  getServiceDoc,
  getTeamMemberBySlugOrId,
  getTeamMemberDoc,
  listArticleDocs,
  listPublishedArticleDocs,
  listPublishedServiceDocs,
  listPublishedTeamMemberDocs,
  listServiceDocs,
  listTeamMemberDocs,
  saveArticleDoc,
  saveServiceDoc,
  saveTeamMemberDoc,
} from '../db/dal';
import {
  ArticleDocument,
  AudienceTag,
  PublicContentProjection,
  ServiceDocument,
  SupportedLocale,
  TeamMemberDocument,
} from '../types';
import { assertCapability } from '../permissions/rbac';
import { computeArticleReadingTimeMinutes } from '@/lib/reading-time';

function projectService(
  doc: ServiceDocument,
  locale: SupportedLocale
): PublicContentProjection | null {
  if (!doc.isPublished) return null;
  const arPtr = doc.locales?.ar;
  const enPtr = doc.locales?.en;
  if (!arPtr?.publishedRevisionId || !enPtr?.publishedRevisionId) return null;

  const revId = locale === 'ar' ? arPtr.publishedRevisionId : enPtr.publishedRevisionId;
  const rev = doc.revisions?.[revId];
  if (!rev) return null;

  return {
    projectionId: `service_${doc.id}_${locale}`,
    entityType: 'service',
    entityId: doc.id,
    locale,
    slug: rev.slug,
    title: rev.title,
    summary: rev.summary,
    blocks: rev.blocks || [],
    metadata: {
      audiences: doc.audiences,
      sortOrder: doc.sortOrder,
      iconName: doc.iconName,
      deliverables: rev.deliverables || [],
      problems: rev.prerequisites || [],
      methodologySteps: rev.methodologySteps || [],
      valueToClient: rev.valueToClient || '',
    },
    seo: {
      title: rev.seo?.title || rev.title,
      description: rev.seo?.description || rev.summary,
      canonicalPath: `/${locale}/services/${rev.slug}`,
      alternatePaths: {
        ar: `/ar/services/${arPtr.slug || doc.id}`,
        en: `/en/services/${enPtr.slug || doc.id}`,
      },
    },
    publishedAt: doc.updatedAt,
    version: doc.version,
  };
}

function projectTeamMember(
  doc: TeamMemberDocument,
  locale: SupportedLocale
): PublicContentProjection | null {
  if (!doc.isPublished) return null;
  const arPtr = doc.locales?.ar;
  const enPtr = doc.locales?.en;
  if (!arPtr?.publishedRevisionId || !enPtr?.publishedRevisionId) return null;

  const revId = locale === 'ar' ? arPtr.publishedRevisionId : enPtr.publishedRevisionId;
  const rev = doc.revisions?.[revId];
  if (!rev) return null;

  return {
    projectionId: `teamMember_${doc.id}_${locale}`,
    entityType: 'teamMember',
    entityId: doc.id,
    locale,
    slug: rev.slug,
    title: rev.fullName,
    summary: rev.summary,
    blocks: rev.blocks || [],
    metadata: {
      sortOrder: doc.sortOrder,
      fullName: rev.fullName,
      positionTitle: rev.positionTitle,
      practiceAreas: rev.practiceAreas || [],
      spokenLanguages: rev.spokenLanguages || [],
      verifiedCredentials: rev.verifiedCredentials || [],
      portraitAssetId: rev.portraitAssetId,
    },
    seo: {
      title: rev.seo?.title || rev.fullName,
      description: rev.seo?.description || rev.summary,
      canonicalPath: `/${locale}/team/${rev.slug}`,
      alternatePaths: {
        ar: `/ar/team/${arPtr.slug || doc.id}`,
        en: `/en/team/${enPtr.slug || doc.id}`,
      },
    },
    publishedAt: doc.updatedAt,
    version: doc.version,
  };
}

function projectArticle(
  doc: ArticleDocument,
  locale: SupportedLocale
): PublicContentProjection | null {
  if (!doc.isPublished) return null;
  const arPtr = doc.locales?.ar;
  const enPtr = doc.locales?.en;
  if (!arPtr?.publishedRevisionId || !enPtr?.publishedRevisionId) return null;

  const revId = locale === 'ar' ? arPtr.publishedRevisionId : enPtr.publishedRevisionId;
  const rev = doc.revisions?.[revId];
  if (!rev) return null;

  return {
    projectionId: `article_${doc.id}_${locale}`,
    entityType: 'article',
    entityId: doc.id,
    locale,
    slug: rev.slug,
    title: rev.title,
    summary: rev.summary,
    blocks: rev.blocks || [],
    metadata: {
      readingTimeMinutes: computeArticleReadingTimeMinutes(rev.summary, rev.blocks || []),
      categoryIds: doc.categoryIds || [],
      authorTeamMemberId: doc.authorTeamMemberId,
      relatedServiceIds: doc.relatedServiceIds || [],
      coverAssetId: rev.coverAssetId,
    },
    seo: {
      title: rev.seo?.title || rev.title,
      description: rev.seo?.description || rev.summary,
      canonicalPath: `/${locale}/insights/${rev.slug}`,
      alternatePaths: {
        ar: `/ar/insights/${arPtr.slug || doc.id}`,
        en: `/en/insights/${enPtr.slug || doc.id}`,
      },
    },
    publishedAt: doc.publishedAt || doc.updatedAt,
    version: doc.version,
  };
}

export async function getPublishedProjection(
  entityType: string,
  slug: string,
  locale: SupportedLocale
): Promise<PublicContentProjection | null> {
  if (entityType === 'service') {
    const doc = await getServiceBySlugOrId(slug);
    return doc ? projectService(doc, locale) : null;
  }
  if (entityType === 'teamMember') {
    const doc = await getTeamMemberBySlugOrId(slug);
    return doc ? projectTeamMember(doc, locale) : null;
  }
  if (entityType === 'article') {
    const doc = await getArticleBySlugOrId(slug);
    return doc ? projectArticle(doc, locale) : null;
  }
  return null;
}

export async function listPublishedProjections(
  entityType: string,
  locale: SupportedLocale,
  audienceFilter?: AudienceTag
): Promise<PublicContentProjection[]> {
  if (entityType === 'service') {
    const docs = await listPublishedServiceDocs();
    return docs
      .map((d) => projectService(d, locale))
      .filter((p): p is PublicContentProjection => {
        if (!p) return false;
        if (audienceFilter && p.metadata?.audiences) {
          return p.metadata.audiences.includes(audienceFilter);
        }
        return true;
      })
      .sort((a, b) => (a.metadata?.sortOrder || 0) - (b.metadata?.sortOrder || 0));
  }

  if (entityType === 'teamMember') {
    const docs = await listPublishedTeamMemberDocs();
    return docs
      .map((d) => projectTeamMember(d, locale))
      .filter((p): p is PublicContentProjection => Boolean(p))
      .sort((a, b) => (a.metadata?.sortOrder || 0) - (b.metadata?.sortOrder || 0));
  }

  if (entityType === 'article') {
    const docs = await listPublishedArticleDocs();
    return docs
      .map((d) => projectArticle(d, locale))
      .filter((p): p is PublicContentProjection => Boolean(p));
  }

  return [];
}

export async function listAllPublishedProjections(): Promise<PublicContentProjection[]> {
  const [svcAr, svcEn, tmAr, tmEn, artAr, artEn] = await Promise.all([
    listPublishedProjections('service', 'ar'),
    listPublishedProjections('service', 'en'),
    listPublishedProjections('teamMember', 'ar'),
    listPublishedProjections('teamMember', 'en'),
    listPublishedProjections('article', 'ar'),
    listPublishedProjections('article', 'en'),
  ]);
  return [...svcAr, ...svcEn, ...tmAr, ...tmEn, ...artAr, ...artEn];
}

export async function getAllServices(): Promise<ServiceDocument[]> {
  return listServiceDocs();
}

export async function getServiceById(id: string): Promise<ServiceDocument | null> {
  return getServiceDoc(id);
}

export async function getAllTeamMembers(): Promise<TeamMemberDocument[]> {
  return listTeamMemberDocs();
}

export async function getAllArticles(): Promise<ArticleDocument[]> {
  return listArticleDocs();
}

export async function publishServicePaired(id: string, actorUid: string) {
  const actor = await getAdminByUid(actorUid);
  if (!actor) throw new Error('Unauthorized');
  assertCapability(actor.role, 'content.publish');

  const service = await getServiceDoc(id);
  if (!service) throw new Error('Service not found');

  const arRevId = service.locales.ar.approvedRevisionId || service.locales.ar.draftRevisionId;
  const enRevId = service.locales.en.approvedRevisionId || service.locales.en.draftRevisionId;

  const arRev = service.revisions?.[arRevId];
  const enRev = service.revisions?.[enRevId];

  if (!arRev || !enRev) {
    throw new Error(
      'Publication blocked: Both Arabic and English approved revisions are strictly required.'
    );
  }

  service.locales.ar.publishedRevisionId = arRev.id;
  service.locales.ar.workflow = 'approved';
  service.locales.en.publishedRevisionId = enRev.id;
  service.locales.en.workflow = 'approved';
  service.isPublished = true;
  service.version += 1;
  service.updatedAt = new Date().toISOString();
  service.updatedBy = actorUid;

  await saveServiceDoc(service);
  await appendAuditLog({
    actorUid,
    actorEmail: actor.email,
    action: 'SERVICE_PUBLISHED_PAIRED',
    targetType: 'service',
    targetId: id,
    details: { arRevId: arRev.id, enRevId: enRev.id, version: service.version },
    createdAt: service.updatedAt,
  });

  return { success: true, version: service.version };
}

export async function unpublishService(id: string, actorUid: string) {
  const actor = await getAdminByUid(actorUid);
  if (!actor) throw new Error('Unauthorized');
  assertCapability(actor.role, 'content.publish');

  const service = await getServiceDoc(id);
  if (!service) throw new Error('Service not found');

  service.locales.ar.publishedRevisionId = undefined;
  service.locales.en.publishedRevisionId = undefined;
  service.isPublished = false;
  service.version += 1;
  service.updatedAt = new Date().toISOString();
  service.updatedBy = actorUid;

  await saveServiceDoc(service);
  await appendAuditLog({
    actorUid,
    actorEmail: actor.email,
    action: 'SERVICE_UNPUBLISHED',
    targetType: 'service',
    targetId: id,
    details: { version: service.version },
    createdAt: service.updatedAt,
  });

  return { success: true };
}

export async function publishTeamMemberPaired(id: string, actorUid: string) {
  const actor = await getAdminByUid(actorUid);
  if (!actor) throw new Error('Unauthorized');
  assertCapability(actor.role, 'content.publish');

  const member = await getTeamMemberDoc(id);
  if (!member) throw new Error('Team member not found');

  const arRevId = member.locales.ar.approvedRevisionId || member.locales.ar.draftRevisionId;
  const enRevId = member.locales.en.approvedRevisionId || member.locales.en.draftRevisionId;

  const arRev = member.revisions?.[arRevId];
  const enRev = member.revisions?.[enRevId];

  if (!arRev || !enRev) {
    throw new Error('Publication blocked: Both Arabic and English revisions are strictly required.');
  }

  member.locales.ar.publishedRevisionId = arRev.id;
  member.locales.ar.workflow = 'approved';
  member.locales.en.publishedRevisionId = enRev.id;
  member.locales.en.workflow = 'approved';
  member.isPublished = true;
  member.version += 1;
  member.updatedAt = new Date().toISOString();
  member.updatedBy = actorUid;

  await saveTeamMemberDoc(member);
  await appendAuditLog({
    actorUid,
    actorEmail: actor.email,
    action: 'TEAM_MEMBER_PUBLISHED_PAIRED',
    targetType: 'teamMember',
    targetId: id,
    details: { arRevId: arRev.id, enRevId: enRev.id, version: member.version },
    createdAt: member.updatedAt,
  });

  return { success: true, version: member.version };
}

export async function unpublishTeamMember(id: string, actorUid: string) {
  const actor = await getAdminByUid(actorUid);
  if (!actor) throw new Error('Unauthorized');
  assertCapability(actor.role, 'content.publish');

  const member = await getTeamMemberDoc(id);
  if (!member) throw new Error('Team member not found');

  member.locales.ar.publishedRevisionId = undefined;
  member.locales.en.publishedRevisionId = undefined;
  member.isPublished = false;
  member.version += 1;
  member.updatedAt = new Date().toISOString();
  member.updatedBy = actorUid;

  await saveTeamMemberDoc(member);
  await appendAuditLog({
    actorUid,
    actorEmail: actor.email,
    action: 'TEAM_MEMBER_UNPUBLISHED',
    targetType: 'teamMember',
    targetId: id,
    details: { version: member.version },
    createdAt: member.updatedAt,
  });

  return { success: true };
}

export async function publishArticlePaired(id: string, actorUid: string) {
  const actor = await getAdminByUid(actorUid);
  if (!actor) throw new Error('Unauthorized');
  assertCapability(actor.role, 'content.publish');

  const article = await getArticleDoc(id);
  if (!article) throw new Error('Article not found');

  const arRevId = article.locales.ar.approvedRevisionId || article.locales.ar.draftRevisionId;
  const enRevId = article.locales.en.approvedRevisionId || article.locales.en.draftRevisionId;

  const arRev = article.revisions?.[arRevId];
  const enRev = article.revisions?.[enRevId];

  if (!arRev || !enRev) {
    throw new Error('Publication blocked: Both Arabic and English article revisions are required.');
  }

  const now = new Date().toISOString();
  article.locales.ar.publishedRevisionId = arRev.id;
  article.locales.ar.workflow = 'approved';
  article.locales.en.publishedRevisionId = enRev.id;
  article.locales.en.workflow = 'approved';
  article.isPublished = true;
  article.version += 1;
  article.publishedAt = article.publishedAt || now;
  article.updatedAt = now;
  article.updatedBy = actorUid;

  await saveArticleDoc(article);
  await appendAuditLog({
    actorUid,
    actorEmail: actor.email,
    action: 'ARTICLE_PUBLISHED_PAIRED',
    targetType: 'article',
    targetId: id,
    details: { arRevId: arRev.id, enRevId: enRev.id, version: article.version },
    createdAt: now,
  });

  return { success: true, version: article.version };
}

export async function unpublishArticle(id: string, actorUid: string) {
  const actor = await getAdminByUid(actorUid);
  if (!actor) throw new Error('Unauthorized');
  assertCapability(actor.role, 'content.publish');

  const article = await getArticleDoc(id);
  if (!article) throw new Error('Article not found');

  article.locales.ar.publishedRevisionId = undefined;
  article.locales.en.publishedRevisionId = undefined;
  article.isPublished = false;
  article.version += 1;
  article.updatedAt = new Date().toISOString();
  article.updatedBy = actorUid;

  await saveArticleDoc(article);
  await appendAuditLog({
    actorUid,
    actorEmail: actor.email,
    action: 'ARTICLE_UNPUBLISHED',
    targetType: 'article',
    targetId: id,
    details: { version: article.version },
    createdAt: article.updatedAt,
  });

  return { success: true };
}
