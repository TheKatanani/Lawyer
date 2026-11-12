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
