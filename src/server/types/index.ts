export type SupportedLocale = 'ar' | 'en';
export type WorkflowState = 'draft' | 'inReview' | 'approved' | 'archived';
export type AudienceTag = 'individual' | 'business';

export type Role = 'super_admin' | 'admin' | 'editor' | 'inquiry_manager';
export type AdminRole = Role;

export type Capability =
  | 'content.edit'
  | 'content.review'
  | 'content.publish'
  | 'media.upload'
  | 'media.delete'
  | 'settings.presentation'
  | 'settings.identity'
  | 'inquiries.read'
  | 'inquiries.update'
  | 'inquiries.export'
  | 'inquiries.purge'
  | 'seo.edit'
  | 'redirects.approve'
  | 'admins.manage'
  | 'audit.read';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  isActive: boolean;
  mfaEnrolled: boolean;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  invitedBy?: string;
}

export interface AdminInvite {
  id: string;
  email: string;
  role: Role;
  invitedBy: string;
  tokenHash: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
}

export interface ApprovedBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'callout' | 'quote' | 'list' | 'image' | 'accordion';
  data: Record<string, any>;
}

export interface LocalePointers {
  workflow: WorkflowState;
  draftRevisionId: string;
  approvedRevisionId?: string;
  publishedRevisionId?: string;
  slug: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface BaseEntity {
  id: string;
  schemaVersion: 1;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  locales: {
    ar: LocalePointers;
    en: LocalePointers;
  };
}

export interface ServiceEntity extends BaseEntity {
  audiences: AudienceTag[];
  relatedTeamIds: string[];
  sortOrder: number;
  iconName?: string;
}

export interface TeamMemberEntity extends BaseEntity {
  sortOrder: number;
  relatedServiceIds: string[];
}

export interface ArticleEntity extends BaseEntity {
  categoryIds: string[];
  authorTeamMemberId?: string;
  relatedServiceIds: string[];
  publishedAt?: string;
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
    title: string;
    description: string;
    imageAssetId?: string;
  };
  approvalEvidenceRefs: string[];
  createdBy: string;
  createdAt: string;
}

export interface ServiceRevision extends BaseRevision {
  deliverables?: string[];
  prerequisites?: string[];
}

export interface TeamMemberRevision extends BaseRevision {
  fullName: string;
  positionTitle: string;
  practiceAreas: string[];
  spokenLanguages: string[];
  verifiedCredentials: string[];
  portraitAssetId?: string;
}

export interface ArticleRevision extends BaseRevision {
  readingTimeMinutes?: number;
  coverAssetId?: string;
}

export interface PublicContentProjection {
  projectionId: string;
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

export type InquiryStatus = 'new' | 'triaged' | 'inProgress' | 'closed' | 'spam';

export interface InquiryNote {
  id: string;
  authorUid: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface ContactRequest {
  id: string;
  audience: AudienceTag;
  name: string;
  phoneE164: string;
  email?: string;
  companyName?: string;
  serviceId?: string;
  message: string;
  locale: SupportedLocale;
  status: InquiryStatus;
  assignedTo?: string;
  noticeVersion: string;
  acknowledgedAt: string;
  retentionClass: string;
  retentionExpiresAt?: string;
  notes: InquiryNote[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  altText: {
    ar: string;
    en: string;
  };
  uploadedBy: string;
  createdAt: string;
}

export type ConsultationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface ConsultationNote {
  id: string;
  authorUid: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface ConsultationHistoryEntry {
  id: string;
  actorEmail: string;
  action: string;
  fromStatus?: ConsultationStatus;
  toStatus?: ConsultationStatus;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ConsultationRequest {
  id: string;
  reference: string;
  fullName: string;
  phone: string;
  serviceId: string;
  serviceLabelSnapshot: {
    ar: string;
    en: string;
  };
  preferredLawyerId?: string | null;
  preferredLawyerLabelSnapshot?: {
    ar: string;
    en: string;
  } | null;
  preferredDate?: string | null;
  assignedLawyerId?: string | null;
  scheduledAt?: string | null;
  appointmentTimezone: string;
  meetingType?: 'online' | 'office' | 'unassigned' | null;
  meetingLink?: string | null;
  meetingAddress?: string | null;
  status: ConsultationStatus;
  locale: SupportedLocale;
  sourcePage?: string | null;
  notes: ConsultationNote[];
  history: ConsultationHistoryEntry[];
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface SiteSettings {
  brandNameAr: string;
  brandNameEn: string;
  brandShortAr: string;
  brandShortEn: string;
  taglineAr: string;
  taglineEn: string;
  phone: string;
  whatsapp: string;
  email: string;
  addressAr: string;
  addressEn: string;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescAr: string;
  seoDescEn: string;
  ogImageUrl: string;
  faviconUrl: string;
  heroHeadlineAr: string;
  heroHeadlineEn: string;
  heroDescAr: string;
  heroDescEn: string;
  aboutTextAr: string;
  aboutTextEn: string;
  aboutMissionAr?: string;
  aboutMissionEn?: string;
  aboutVisionAr?: string;
  aboutVisionEn?: string;
}

export interface OutboxJob {
  id: string;
  type: 'inquiry_notification' | 'cache_invalidation';
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}
