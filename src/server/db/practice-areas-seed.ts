import { ServiceEntity, ServiceRevision } from '../types';
import { PRACTICE_AREAS } from '../../data/practice-areas';

export const PRACTICE_AREAS_SERVICES: ServiceEntity[] = PRACTICE_AREAS.map((area) => ({
  id: area.id,
  schemaVersion: 1,
  version: 1,
  audiences: area.audiences,
  relatedTeamIds: ['riyadh-alzahrani'],
  sortOrder: area.sortOrder,
  iconName: area.iconName,
  createdAt: '2026-11-12T10:00:00Z',
  updatedAt: '2026-11-12T10:00:00Z',
  createdBy: 'admin-rma-01',
  updatedBy: 'admin-rma-01',
  locales: {
    ar: {
      workflow: 'approved',
      draftRevisionId: `rev-svc-${area.id}-ar`,
      approvedRevisionId: `rev-svc-${area.id}-ar`,
      publishedRevisionId: `rev-svc-${area.id}-ar`,
      slug: area.id,
    },
    en: {
      workflow: 'approved',
      draftRevisionId: `rev-svc-${area.id}-en`,
      approvedRevisionId: `rev-svc-${area.id}-en`,
      publishedRevisionId: `rev-svc-${area.id}-en`,
      slug: area.id,
    },
  },
}));

export const PRACTICE_AREAS_SERVICE_REVISIONS: Record<string, ServiceRevision> = {};

for (const area of PRACTICE_AREAS) {
  // Arabic revision
  PRACTICE_AREAS_SERVICE_REVISIONS[`rev-svc-${area.id}-ar`] = {
    id: `rev-svc-${area.id}-ar`,
    entityId: area.id,
    schemaVersion: 1,
    locale: 'ar',
    title: area.titleAr,
    slug: area.id,
    summary: area.leadAxiomAr,
    deliverables: area.scopeOfServicesAr,
    prerequisites: area.problemsAddressedAr,
    blocks: [
      {
        id: `b-quote-${area.id}`,
        type: 'quote',
        data: {
          text: area.leadAxiomAr,
          attribution: 'شركة رياض محمد الزهراني للمحاماة',
        },
      },
      {
        id: `b-heading-scope-${area.id}`,
        type: 'heading',
        data: { text: 'نطاق الخدمات والتمثيل النظامي', level: 2 },
      },
      {
        id: `b-list-scope-${area.id}`,
        type: 'list',
        data: { items: area.scopeOfServicesAr },
      },
      {
        id: `b-heading-problems-${area.id}`,
        type: 'heading',
        data: { text: 'طبيعة المشكلات التي نعالجها', level: 2 },
      },
      {
        id: `b-list-problems-${area.id}`,
        type: 'list',
        data: { items: area.problemsAddressedAr },
      },
      {
        id: `b-heading-method-${area.id}`,
        type: 'heading',
        data: { text: 'منهجية التعامل مع الملف', level: 2 },
      },
      {
        id: `b-accordion-method-${area.id}`,
        type: 'accordion',
        data: {
          items: area.methodologySteps.map((s) => ({
            title: `${s.step}. ${s.titleAr}`,
            content: s.descriptionAr,
          })),
        },
      },
      {
        id: `b-callout-val-${area.id}`,
        type: 'callout',
        data: {
          title: 'القيمة للعميل',
          text: area.valueToClientAr,
        },
      },
    ],
    seo: {
      title: `${area.titleAr} | شركة رياض محمد الزهراني للمحاماة`,
      description: area.leadAxiomAr,
    },
    approvalEvidenceRefs: ['PROFILE-PDF-PAGE-' + area.sortOrder],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  };

  // English revision
  PRACTICE_AREAS_SERVICE_REVISIONS[`rev-svc-${area.id}-en`] = {
    id: `rev-svc-${area.id}-en`,
    entityId: area.id,
    schemaVersion: 1,
    locale: 'en',
    title: area.titleEn,
    slug: area.id,
    summary: area.leadAxiomEn,
    deliverables: area.scopeOfServicesEn,
    prerequisites: area.problemsAddressedEn,
    blocks: [
      {
        id: `b-quote-en-${area.id}`,
        type: 'quote',
        data: {
          text: area.leadAxiomEn,
          attribution: 'Riyadh Mohammed Alzahrani Law Firm',
        },
      },
      {
        id: `b-heading-scope-en-${area.id}`,
        type: 'heading',
        data: { text: 'Scope of Services', level: 2 },
      },
      {
        id: `b-list-scope-en-${area.id}`,
        type: 'list',
        data: { items: area.scopeOfServicesEn },
      },
      {
        id: `b-heading-problems-en-${area.id}`,
        type: 'heading',
        data: { text: 'Problems We Address', level: 2 },
      },
      {
        id: `b-list-problems-en-${area.id}`,
        type: 'list',
        data: { items: area.problemsAddressedEn },
      },
      {
        id: `b-heading-method-en-${area.id}`,
        type: 'heading',
        data: { text: 'How We Handle the Matter', level: 2 },
      },
      {
        id: `b-accordion-method-en-${area.id}`,
        type: 'accordion',
        data: {
          items: area.methodologySteps.map((s) => ({
            title: `${s.step}. ${s.titleEn}`,
            content: s.descriptionEn,
          })),
        },
      },
      {
        id: `b-callout-val-en-${area.id}`,
        type: 'callout',
        data: {
          title: 'VALUE TO THE CLIENT',
          text: area.valueToClientEn,
        },
      },
    ],
    seo: {
      title: `${area.titleEn} | Riyadh Alzahrani Law Firm`,
      description: area.leadAxiomEn,
    },
    approvalEvidenceRefs: ['PROFILE-PDF-PAGE-' + area.sortOrder],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  };
}
