import { store } from '../db/store';
import {
  PublicContentProjection,
  ServiceEntity,
  TeamMemberEntity,
  ArticleEntity,
  SupportedLocale,
  AudienceTag,
} from '../types';
import { assertCapability } from '../permissions/rbac';

export async function getPublishedProjection(
  entityType: string,
  slug: string,
  locale: SupportedLocale
): Promise<PublicContentProjection | null> {
  for (const proj of Array.from(store.publishedContent.values())) {
    if (proj.entityType === entityType && proj.locale === locale && proj.slug === slug) {
      return proj;
    }
  }
  return null;
}

export async function listPublishedProjections(
  entityType: string,
  locale: SupportedLocale,
  audienceFilter?: AudienceTag
): Promise<PublicContentProjection[]> {
  const results: PublicContentProjection[] = [];
  for (const proj of Array.from(store.publishedContent.values())) {
    if (proj.entityType === entityType && proj.locale === locale) {
      if (audienceFilter && proj.metadata?.audiences) {
        if (!proj.metadata.audiences.includes(audienceFilter)) {
          continue;
        }
      }
      results.push(proj);
    }
  }
  return results.sort((a, b) => (a.metadata?.sortOrder || 0) - (b.metadata?.sortOrder || 0));
}

export async function getAllServices(): Promise<ServiceEntity[]> {
  return Array.from(store.services.values()).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getServiceById(id: string): Promise<ServiceEntity | null> {
  return store.services.get(id) || null;
}

export async function getServiceRevision(revId: string) {
  return store.serviceRevisions.get(revId) || null;
}

export async function getAllTeamMembers(): Promise<TeamMemberEntity[]> {
  return Array.from(store.teamMembers.values()).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getAllArticles(): Promise<ArticleEntity[]> {
  return Array.from(store.articles.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function publishServicePaired(id: string, actorUid: string) {
  const actor = store.admins.get(actorUid);
  if (!actor) throw new Error('Unauthorized');
  assertCapability(actor.role, 'content.publish');

  const service = store.services.get(id);
  if (!service) throw new Error('Service not found');

  // Verify dual locale approved revisions
  const arRevId = service.locales.ar.approvedRevisionId || service.locales.ar.draftRevisionId;
  const enRevId = service.locales.en.approvedRevisionId || service.locales.en.draftRevisionId;

  const arRev = store.serviceRevisions.get(arRevId);
  const enRev = store.serviceRevisions.get(enRevId);

  if (!arRev || !enRev) {
    throw new Error('Publication blocked: Both Arabic and English approved revisions are strictly required.');
  }

  // Update entity publication pointers
  service.locales.ar.publishedRevisionId = arRev.id;
  service.locales.ar.workflow = 'approved';
  service.locales.en.publishedRevisionId = enRev.id;
  service.locales.en.workflow = 'approved';
  service.version += 1;
  service.updatedAt = new Date().toISOString();
  service.updatedBy = actorUid;

  // Atomically update public projections
  store.publishedContent.set(`service_${id}_ar`, {
    projectionId: `service_${id}_ar`,
    entityType: 'service',
    entityId: id,
    locale: 'ar',
    slug: arRev.slug,
    title: arRev.title,
    summary: arRev.summary,
    blocks: arRev.blocks,
    metadata: {
      audiences: service.audiences,
      sortOrder: service.sortOrder,
      iconName: service.iconName,
      deliverables: arRev.deliverables || [],
    },
    seo: {
      title: arRev.seo.title,
      description: arRev.seo.description,
      canonicalPath: `/ar/services/${arRev.slug}`,
      alternatePaths: {
        ar: `/ar/services/${arRev.slug}`,
        en: `/en/services/${enRev.slug}`,
      },
    },
    publishedAt: new Date().toISOString(),
    version: service.version,
  });

  store.publishedContent.set(`service_${id}_en`, {
    projectionId: `service_${id}_en`,
    entityType: 'service',
    entityId: id,
    locale: 'en',
    slug: enRev.slug,
    title: enRev.title,
    summary: enRev.summary,
    blocks: enRev.blocks,
    metadata: {
      audiences: service.audiences,
      sortOrder: service.sortOrder,
      iconName: service.iconName,
      deliverables: enRev.deliverables || [],
    },
    seo: {
      title: enRev.seo.title,
      description: enRev.seo.description,
      canonicalPath: `/en/services/${enRev.slug}`,
      alternatePaths: {
        ar: `/ar/services/${arRev.slug}`,
        en: `/en/services/${enRev.slug}`,
      },
    },
    publishedAt: new Date().toISOString(),
    version: service.version,
  });

  // Log audit
  store.auditLogs.unshift({
    id: `AUDIT-${Date.now()}`,
    actorUid,
    actorEmail: actor.email,
    action: 'SERVICE_PUBLISHED_PAIRED',
    targetType: 'service',
    targetId: id,
    details: { arRevId: arRev.id, enRevId: enRev.id, version: service.version },
    createdAt: new Date().toISOString(),
  });

  return { success: true, version: service.version };
}

export async function unpublishService(id: string, actorUid: string) {
  const actor = store.admins.get(actorUid);
  if (!actor) throw new Error('Unauthorized');
  assertCapability(actor.role, 'content.publish');

  const service = store.services.get(id);
  if (!service) throw new Error('Service not found');

  service.locales.ar.publishedRevisionId = undefined;
  service.locales.en.publishedRevisionId = undefined;
  service.version += 1;
  service.updatedAt = new Date().toISOString();

  // Remove projections immediately
  store.publishedContent.delete(`service_${id}_ar`);
  store.publishedContent.delete(`service_${id}_en`);

  store.auditLogs.unshift({
    id: `AUDIT-${Date.now()}`,
    actorUid,
    actorEmail: actor.email,
    action: 'SERVICE_UNPUBLISHED',
    targetType: 'service',
    targetId: id,
    details: { version: service.version },
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

export async function publishTeamMemberPaired(id: string, actorUid: string) {
  const actor = store.admins.get(actorUid);
  if (!actor) throw new Error('Unauthorized');
  assertCapability(actor.role, 'content.publish');

  const member = store.teamMembers.get(id);
  if (!member) throw new Error('Team member not found');

  const arRevId = member.locales.ar.approvedRevisionId || member.locales.ar.draftRevisionId;
  const enRevId = member.locales.en.approvedRevisionId || member.locales.en.draftRevisionId;

  const arRev = store.teamMemberRevisions.get(arRevId);
  const enRev = store.teamMemberRevisions.get(enRevId);

  if (!arRev || !enRev) {
    throw new Error('Publication blocked: Both Arabic and English revisions are strictly required.');
  }

  member.locales.ar.publishedRevisionId = arRev.id;
  member.locales.ar.workflow = 'approved';
  member.locales.en.publishedRevisionId = enRev.id;
  member.locales.en.workflow = 'approved';
  member.version += 1;
  member.updatedAt = new Date().toISOString();
  member.updatedBy = actorUid;

  store.publishedContent.set(`teamMember_${id}_ar`, {
    projectionId: `teamMember_${id}_ar`,
    entityType: 'teamMember',
    entityId: id,
    locale: 'ar',
    slug: arRev.slug,
    title: arRev.fullName,
    summary: arRev.summary,
    blocks: arRev.blocks,
    metadata: {
      sortOrder: member.sortOrder,
      fullName: arRev.fullName,
      positionTitle: arRev.positionTitle,
      practiceAreas: arRev.practiceAreas,
      spokenLanguages: arRev.spokenLanguages,
      verifiedCredentials: arRev.verifiedCredentials,
      portraitAssetId: arRev.portraitAssetId,
    },
    seo: {
      title: arRev.seo.title,
      description: arRev.seo.description,
      canonicalPath: `/ar/team/${arRev.slug}`,
      alternatePaths: {
        ar: `/ar/team/${arRev.slug}`,
        en: `/en/team/${enRev.slug}`,
      },
    },
    publishedAt: new Date().toISOString(),
    version: member.version,
  });

  store.publishedContent.set(`teamMember_${id}_en`, {
    projectionId: `teamMember_${id}_en`,
    entityType: 'teamMember',
    entityId: id,
    locale: 'en',
    slug: enRev.slug,
    title: enRev.fullName,
    summary: enRev.summary,
    blocks: enRev.blocks,
    metadata: {
      sortOrder: member.sortOrder,
      fullName: enRev.fullName,
      positionTitle: enRev.positionTitle,
      practiceAreas: enRev.practiceAreas,
      spokenLanguages: enRev.spokenLanguages,
      verifiedCredentials: enRev.verifiedCredentials,
      portraitAssetId: enRev.portraitAssetId,
    },
    seo: {
      title: enRev.seo.title,
      description: enRev.seo.description,
      canonicalPath: `/en/team/${enRev.slug}`,
      alternatePaths: {
        ar: `/ar/team/${arRev.slug}`,
        en: `/en/team/${enRev.slug}`,
      },
    },
    publishedAt: new Date().toISOString(),
    version: member.version,
  });

  store.auditLogs.unshift({
    id: `AUDIT-${Date.now()}`,
    actorUid,
    actorEmail: actor.email,
    action: 'TEAM_MEMBER_PUBLISHED_PAIRED',
    targetType: 'teamMember',
    targetId: id,
    details: { arRevId: arRev.id, enRevId: enRev.id, version: member.version },
    createdAt: new Date().toISOString(),
  });

  return { success: true, version: member.version };
}

export async function unpublishTeamMember(id: string, actorUid: string) {
  const actor = store.admins.get(actorUid);
  if (!actor) throw new Error('Unauthorized');
  assertCapability(actor.role, 'content.publish');

  const member = store.teamMembers.get(id);
  if (!member) throw new Error('Team member not found');

  member.locales.ar.publishedRevisionId = undefined;
  member.locales.en.publishedRevisionId = undefined;
  member.version += 1;
  member.updatedAt = new Date().toISOString();

  store.publishedContent.delete(`teamMember_${id}_ar`);
  store.publishedContent.delete(`teamMember_${id}_en`);

  store.auditLogs.unshift({
    id: `AUDIT-${Date.now()}`,
    actorUid,
    actorEmail: actor.email,
    action: 'TEAM_MEMBER_UNPUBLISHED',
    targetType: 'teamMember',
    targetId: id,
    details: { version: member.version },
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

export async function publishArticlePaired(id: string, actorUid: string) {
  const actor = store.admins.get(actorUid);
  if (!actor) throw new Error('Unauthorized');
  assertCapability(actor.role, 'content.publish');

  const article = store.articles.get(id);
  if (!article) throw new Error('Article not found');

  const arRevId = article.locales.ar.approvedRevisionId || article.locales.ar.draftRevisionId;
  const enRevId = article.locales.en.approvedRevisionId || article.locales.en.draftRevisionId;

  const arRev = store.articleRevisions.get(arRevId);
  const enRev = store.articleRevisions.get(enRevId);

  if (!arRev || !enRev) {
    throw new Error('Publication blocked: Both Arabic and English article revisions are required.');
  }

  article.locales.ar.publishedRevisionId = arRev.id;
  article.locales.ar.workflow = 'approved';
  article.locales.en.publishedRevisionId = enRev.id;
  article.locales.en.workflow = 'approved';
  article.version += 1;
  const now = new Date().toISOString();
  article.publishedAt = article.publishedAt || now;
  article.updatedAt = now;
  article.updatedBy = actorUid;

  store.publishedContent.set(`article_${id}_ar`, {
    projectionId: `article_${id}_ar`,
    entityType: 'article',
    entityId: id,
    locale: 'ar',
    slug: arRev.slug,
    title: arRev.title,
    summary: arRev.summary,
    blocks: arRev.blocks,
    metadata: {
      readingTimeMinutes: arRev.readingTimeMinutes || 5,
      categoryIds: article.categoryIds,
      authorTeamMemberId: article.authorTeamMemberId,
      relatedServiceIds: article.relatedServiceIds,
      coverAssetId: arRev.coverAssetId,
    },
    seo: {
      title: arRev.seo.title,
      description: arRev.seo.description,
      canonicalPath: `/ar/insights/${arRev.slug}`,
      alternatePaths: {
        ar: `/ar/insights/${arRev.slug}`,
        en: `/en/insights/${enRev.slug}`,
      },
    },
    publishedAt: article.publishedAt,
    version: article.version,
  });

  store.publishedContent.set(`article_${id}_en`, {
    projectionId: `article_${id}_en`,
    entityType: 'article',
    entityId: id,
    locale: 'en',
    slug: enRev.slug,
    title: enRev.title,
    summary: enRev.summary,
    blocks: enRev.blocks,
    metadata: {
      readingTimeMinutes: enRev.readingTimeMinutes || 5,
      categoryIds: article.categoryIds,
      authorTeamMemberId: article.authorTeamMemberId,
      relatedServiceIds: article.relatedServiceIds,
      coverAssetId: enRev.coverAssetId,
    },
    seo: {
      title: enRev.seo.title,
      description: enRev.seo.description,
      canonicalPath: `/en/insights/${enRev.slug}`,
      alternatePaths: {
        ar: `/ar/insights/${arRev.slug}`,
        en: `/en/insights/${enRev.slug}`,
      },
    },
    publishedAt: article.publishedAt,
    version: article.version,
  });

  store.auditLogs.unshift({
    id: `AUDIT-${Date.now()}`,
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
  const actor = store.admins.get(actorUid);
  if (!actor) throw new Error('Unauthorized');
  assertCapability(actor.role, 'content.publish');

  const article = store.articles.get(id);
  if (!article) throw new Error('Article not found');

  article.locales.ar.publishedRevisionId = undefined;
  article.locales.en.publishedRevisionId = undefined;
  article.version += 1;
  article.updatedAt = new Date().toISOString();

  store.publishedContent.delete(`article_${id}_ar`);
  store.publishedContent.delete(`article_${id}_en`);

  store.auditLogs.unshift({
    id: `AUDIT-${Date.now()}`,
    actorUid,
    actorEmail: actor.email,
    action: 'ARTICLE_UNPUBLISHED',
    targetType: 'article',
    targetId: id,
    details: { version: article.version },
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}
