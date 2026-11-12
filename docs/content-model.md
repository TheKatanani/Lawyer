# Content Model & Firestore Schema Specification

**System:** Riyadh Mohammed Alzahrani Legal Platform  
**Schema Version:** 1.0.0  
**Storage Engine:** Google Cloud Firestore (Server Data Access Layer)  

---

## 1. Top-Level Collections Inventory

| Collection Path | Scope | Purpose & Storage Invariants |
|---|---|---|
| `pages/{id}` | Internal CMS | Fixed and editorial pages (Home, About, Contact, Terms, Privacy, Custom). |
| `services/{id}` | Internal CMS | Legal practice areas, audience classification, related professionals. |
| `teamMembers/{id}` | Internal CMS | Lawyers, counsel, verified credentials, display ordering. |
| `articles/{id}` | Internal CMS | Published insights, legal analysis, categories, attributions. |
| `{entity}/{id}/revisions/{revId}` | Subcollection | Immutable snapshots of historical edits per locale with audit evidence. |
| `siteSettings/{id}` | Internal CMS | Singleton records (`identity`, `contact`, `navigation`, `footer`, `seo`). |
| `taxonomies/{id}` | Internal CMS | Standardized categories, practice tags, and audience types. |
| `publishedContent/{projectionId}` | Public Access | Read-optimized public projections. Strictly no drafts, PII, or internal notes. |
| `routeRegistry/{pathHash}` | Public Routing | Deterministic routing lookup mapping URL paths to projection IDs or redirects. |
| `slugReservations/{pathHash}` | Internal Locks | Prevents colliding slug assignments across drafts and entities. |
| `mediaAssets/{id}` | Media Registry | Cloudinary assets, dimensions, format, localized alt, license verification. |
| `mediaUsages/{usageId}` | Media Registry | Reference tracking between media assets and entity revisions. |
| `contactRequests/{id}` | Private Intake | Incoming consultation requests, E.164 phone, audit state, retention metadata. |
| `contactRequests/{id}/notes/{id}` | Private Sub | Operational intake notes authored by authorized intake staff. |
| `adminUsers/{uid}` | Security Core | Authoritative admin user accounts, roles, active flags, and MFA indicators. |
| `adminInvites/{id}` | Security Core | Time-limited cryptographically hashed invitations for new administrators. |
| `auditLogs/{id}` | Compliance | Append-only operational audit entries capturing actor, action, and target. |
| `redirects/{id}` | SEO / Routing | Legacy mapping records and approved 301/308 redirect rules. |
| `outboxJobs/{id}` | Operational | Durable jobs for asynchronous email dispatch and cache invalidation. |
| `idempotencyKeys/{hash}` | Operational | SHA-256 request digest ensuring zero duplicate form submissions. |
| `rateLimitBuckets/{hash}` | Security Core | Distributed sliding-window rate counters for intake and auth endpoints. |
| `previewTokens/{hash}` | CMS Utility | Short-lived authorized tokens granting draft preview privileges. |

---

## 2. Shared Entity & Revision TypeScript Definitions

```typescript
export type SupportedLocale = 'ar' | 'en';
export type WorkflowState = 'draft' | 'inReview' | 'approved' | 'archived';
export type AudienceTag = 'individual' | 'business';

export interface LocaleWorkflowPointer {
  workflow: WorkflowState;
  draftRevisionId: string;
  approvedRevisionId?: string;
  publishedRevisionId?: string;
  slug: string;
  approvedBy?: string;
  approvedAt?: string; // ISO 8601 UTC
}

export interface BaseEntity {
  id: string;
  schemaVersion: 1;
  version: number; // Optimistic Concurrency Control
  createdAt: string; // ISO 8601 UTC
  updatedAt: string;
  createdBy: string; // Admin UID
  updatedBy: string;
  locales: {
    ar: LocaleWorkflowPointer;
    en: LocaleWorkflowPointer;
  };
}

export interface ApprovedBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'callout' | 'quote' | 'list' | 'image' | 'accordion';
  data: Record<string, any>;
}

export interface BaseRevision {
  id: string;
  entityId: string;
  schemaVersion: 1;
  locale: SupportedLocale;
  title: string;
  slug: string;
  summary: string;
  blocks: ApprovedBlock[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImageAssetId?: string;
  };
  approvalEvidenceRefs: string[]; // Private internal documents verifying claims
  createdBy: string;
  createdAt: string;
}
```

---

## 3. Entity Specializations

### Service Entity (`services/{id}`)
```typescript
export interface ServiceEntity extends BaseEntity {
  audiences: AudienceTag[]; // ['individual'], ['business'], or both
  relatedTeamIds: string[];
  sortOrder: number;
  iconName?: string;
}

export interface ServiceRevision extends BaseRevision {
  scopeSummary: string;
  deliverables: string[];
  intakePrerequisites: string[];
}
```

### Team Member Entity (`teamMembers/{id}`)
```typescript
export interface TeamMemberEntity extends BaseEntity {
  sortOrder: number;
  relatedServiceIds: string[];
}

export interface TeamMemberRevision extends BaseRevision {
  fullName: string;
  positionTitle: string;
  practiceAreas: string[];
  spokenLanguages: string[];
  verifiedCredentials: string[]; // Only MOJ verified licenses permitted
  portraitAssetId?: string;
}
```

### Insight Article Entity (`articles/{id}`)
```typescript
export interface ArticleEntity extends BaseEntity {
  categoryIds: string[];
  authorTeamMemberId?: string;
  relatedServiceIds: string[];
  publishedAt?: string;
}

export interface ArticleRevision extends BaseRevision {
  readingTimeMinutes: number;
  coverImageAssetId?: string;
  disclaimerRequired: boolean;
}
```

---

## 4. Public Projection Schema (`publishedContent/{projectionId}`)

Public visitors never query full entity documents or revisions. They read scrubbed projections keyed by `${type}_${id}_${locale}`.

```typescript
export interface PublicContentProjection {
  projectionId: string; // e.g. "service_corporate-advisory_ar"
  entityType: 'page' | 'service' | 'teamMember' | 'article' | 'siteSettings';
  entityId: string;
  locale: SupportedLocale;
  slug: string;
  title: string;
  summary: string;
  blocks: ApprovedBlock[];
  metadata: Record<string, any>;
  seo: {
    title: string;
    description: string;
    ogImageUrl?: string;
    canonicalPath: string;
    alternatePaths: Record<SupportedLocale, string>;
  };
  publishedAt: string;
  version: number;
}
```
