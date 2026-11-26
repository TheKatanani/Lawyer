import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { deriveSamplePaymentToken, sealPaymentToken, unsealPaymentToken } from '../payments/tokens';
import {
  AdminUser,
  ServiceEntity,
  TeamMemberEntity,
  ArticleEntity,
  PublicContentProjection,
  ContactRequest,
  AuditLogEntry,
  OutboxJob,
  BaseRevision,
  ServiceRevision,
  TeamMemberRevision,
  ArticleRevision,
  MediaAsset,
  ConsultationRequest,
  SiteSettings,
  PaymentRequest,
} from '../types';
import { hashPassword } from '../auth/password';
import { UNVERIFIED_CLAIMS_CONFIG, FIRM_DETAILS } from '../../config/compliance';
import { computeArticleReadingTimeMinutes } from '../../lib/reading-time';
import {
  PRACTICE_AREAS_SERVICES,
  PRACTICE_AREAS_SERVICE_REVISIONS,
} from './practice-areas-seed';

export const INITIAL_SETTINGS: SiteSettings = {
  brandNameAr: 'شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية',
  brandNameEn: 'Riyadh Mohammed Alzahrani Law Firm & Legal Consultations',
  brandShortAr: 'شركة رياض الزهراني للمحاماة',
  brandShortEn: 'RMA Legal',
  taglineAr: 'نقرأ النزاع قبل أن يصل إلى المحكمة، ونقرأ أدلته قبل أن تتحول إلى مرافعة',
  taglineEn: 'We read the dispute before it reaches court — and its evidence before it becomes a pleading.',
  phone: FIRM_DETAILS.phone,
  whatsapp: FIRM_DETAILS.whatsapp,
  email: FIRM_DETAILS.email,
  addressAr: FIRM_DETAILS.addressAr,
  addressEn: FIRM_DETAILS.addressEn,
  seoTitleAr: 'شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية | جدة',
  seoTitleEn: 'Riyadh Mohammed Alzahrani Law Firm & Legal Consultations | Jeddah',
  seoDescAr: 'شركة محاماة واستشارات قانونية مرخصة بالمملكة تقدم حلولاً قضائية وتجارية وحوكمة رصينة للأفراد والشركات والجهات الاستثمارية.',
  seoDescEn: 'Licensed Saudi legal firm delivering enterprise governance, commercial dispute resolution, and regulatory advisory.',
  ogImageUrl: '/logo-gold-full.png',
  faviconUrl: '/favicon.ico',
  heroHeadlineAr: 'نقرأ النزاع قبل أن يصل إلى المحكمة، ونقرأ أدلته قبل أن تتحول إلى مرافعة',
  heroHeadlineEn: 'We read the dispute before it reaches court — and its evidence before it becomes a pleading.',
  heroDescAr: 'شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية شركة سعودية مقرها جدة، تخدم الأفراد والأسر والشركات والجهات الاستثمارية في طيف واسع من مجالات القانون.',
  heroDescEn: 'Riyadh Mohammed Alzahrani Law Firm & Legal Consultations is a Saudi firm based in Jeddah, serving individuals, families, companies and investment entities across a broad spectrum of legal practice.',
  aboutTextAr: 'القضية لا تُقاس بحجم مستنداتها، بل بقوة مركزها القانوني وسلامة بنائها الإجرائي. شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية شركة سعودية مقرها جدة، تخدم الأفراد والأسر والشركات والجهات الاستثمارية في طيف واسع من مجالات القانون.',
  aboutTextEn: 'A case is measured not by the volume of its documents, but by the strength of its legal position and the soundness of its procedure. Riyadh Mohammed Alzahrani Law Firm & Legal Consultations is a Saudi firm based in Jeddah, serving individuals, families, companies and investment entities.',
  aboutMissionAr: 'تقديم خدمات قانونية دقيقة وعملية تحمي مصالح الموكل وتمنحه وضوحًا كاملًا في كل مرحلة، مع الالتزام بأعلى معايير النزاهة والسرية.',
  aboutMissionEn: 'To deliver precise, practical legal services that safeguard the client’s interests and afford complete clarity at every stage, adhering to the highest standards of integrity and confidentiality.',
  aboutVisionAr: 'أن نكون المرجع القانوني الموثوق للأفراد والأسر والشركات في المملكة، بمنهج يجمع العمق النظامي والرؤية الاستراتيجية والالتزام المهني.',
  aboutVisionEn: 'To be the trusted legal reference for individuals, families and companies in the Kingdom — with a method that unites legal depth, strategic vision and professional commitment.',
  // Payment Gateway Settings (Moyasar) — disabled by default unless PAYMENTS_ENABLED=true
  paymentEnabled: process.env.PAYMENTS_ENABLED === 'true',
  paymentRequirement: 'optional',
  consultationFee: 500,
  consultationCurrency: 'SAR',
  applePayEnabled: false,
  paymentNoticeAr: 'رسوم حجز الاستشارة تُحسم من أتعاب القضية أو العقد في حال التوكيل الرسمي.',
  paymentNoticeEn: 'The initial consultation fee is deductible from overall legal representation fees upon retainer engagement.',
};

const DEFAULT_ADMIN_PASSWORD_HASH = hashPassword(process.env.ADMIN_INITIAL_PASSWORD || 'RMA@Legal2026!');

// Initial Mock Seed Data
const INITIAL_ADMINS: AdminUser[] = [
  {
    uid: 'admin-rma-01',
    email: FIRM_DETAILS.email,
    displayName: 'Riyadh Alzahrani',
    role: 'super_admin',
    isActive: true,
    mfaEnrolled: true,
    passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
    createdAt: '2026-11-12T10:00:00Z',
    updatedAt: '2026-11-12T10:00:00Z',
  },
  {
    uid: 'admin-rma-02',
    email: FIRM_DETAILS.email,
    displayName: 'Associate Counsel',
    role: 'admin',
    isActive: true,
    mfaEnrolled: true,
    passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
    createdAt: '2026-11-12T11:00:00Z',
    updatedAt: '2026-11-12T11:00:00Z',
  },
  {
    uid: 'admin-rma-03',
    email: FIRM_DETAILS.email,
    displayName: 'Legal Editor',
    role: 'editor',
    isActive: true,
    mfaEnrolled: true,
    passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
    createdAt: '2026-11-12T11:30:00Z',
    updatedAt: '2026-11-12T11:30:00Z',
  },
  {
    uid: 'admin-rma-04',
    email: FIRM_DETAILS.email,
    displayName: 'Intake Officer',
    role: 'inquiry_manager',
    isActive: true,
    mfaEnrolled: true,
    passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
    createdAt: '2026-11-12T12:00:00Z',
    updatedAt: '2026-11-12T12:00:00Z',
  },
];

const INITIAL_SERVICES: ServiceEntity[] = [
  {
    id: 'corporate-governance',
    schemaVersion: 1,
    version: 1,
    audiences: ['business'],
    relatedTeamIds: ['riyadh-alzahrani'],
    sortOrder: 1,
    iconName: 'Building2',
    createdAt: '2026-11-12T10:00:00Z',
    updatedAt: '2026-11-12T10:00:00Z',
    createdBy: 'admin-rma-01',
    updatedBy: 'admin-rma-01',
    locales: {
      ar: {
        workflow: 'approved',
        draftRevisionId: 'rev-cg-ar-1',
        approvedRevisionId: 'rev-cg-ar-1',
        publishedRevisionId: 'rev-cg-ar-1',
        slug: 'corporate-governance',
      },
      en: {
        workflow: 'approved',
        draftRevisionId: 'rev-cg-en-1',
        approvedRevisionId: 'rev-cg-en-1',
        publishedRevisionId: 'rev-cg-en-1',
        slug: 'corporate-governance',
      },
    },
  },
  {
    id: 'commercial-litigation',
    schemaVersion: 1,
    version: 1,
    audiences: ['business', 'individual'],
    relatedTeamIds: ['riyadh-alzahrani', 'senior-counsel'],
    sortOrder: 2,
    iconName: 'Scale',
    createdAt: '2026-11-12T10:00:00Z',
    updatedAt: '2026-11-12T10:00:00Z',
    createdBy: 'admin-rma-01',
    updatedBy: 'admin-rma-01',
    locales: {
      ar: {
        workflow: 'approved',
        draftRevisionId: 'rev-cl-ar-1',
        approvedRevisionId: 'rev-cl-ar-1',
        publishedRevisionId: 'rev-cl-ar-1',
        slug: 'commercial-litigation',
      },
      en: {
        workflow: 'approved',
        draftRevisionId: 'rev-cl-en-1',
        approvedRevisionId: 'rev-cl-en-1',
        publishedRevisionId: 'rev-cl-en-1',
        slug: 'commercial-litigation',
      },
    },
  },
  {
    id: 'foreign-investment',
    schemaVersion: 1,
    version: 1,
    audiences: ['business'],
    relatedTeamIds: ['riyadh-alzahrani'],
    sortOrder: 3,
    iconName: 'Globe2',
    createdAt: '2026-11-12T10:00:00Z',
    updatedAt: '2026-11-12T10:00:00Z',
    createdBy: 'admin-rma-01',
    updatedBy: 'admin-rma-01',
    locales: {
      ar: {
        workflow: 'approved',
        draftRevisionId: 'rev-fi-ar-1',
        approvedRevisionId: 'rev-fi-ar-1',
        publishedRevisionId: 'rev-fi-ar-1',
        slug: 'foreign-investment',
      },
      en: {
        workflow: 'approved',
        draftRevisionId: 'rev-fi-en-1',
        approvedRevisionId: 'rev-fi-en-1',
        publishedRevisionId: 'rev-fi-en-1',
        slug: 'foreign-investment',
      },
    },
  },
  {
    id: 'estate-family-wealth',
    schemaVersion: 1,
    version: 1,
    audiences: ['individual', 'business'],
    relatedTeamIds: ['senior-counsel'],
    sortOrder: 4,
    iconName: 'Shield',
    createdAt: '2026-11-12T10:00:00Z',
    updatedAt: '2026-11-12T10:00:00Z',
    createdBy: 'admin-rma-01',
    updatedBy: 'admin-rma-01',
    locales: {
      ar: {
        workflow: 'approved',
        draftRevisionId: 'rev-ef-ar-1',
        approvedRevisionId: 'rev-ef-ar-1',
        publishedRevisionId: 'rev-ef-ar-1',
        slug: 'estate-family-wealth',
      },
      en: {
        workflow: 'approved',
        draftRevisionId: 'rev-ef-en-1',
        approvedRevisionId: 'rev-ef-en-1',
        publishedRevisionId: 'rev-ef-en-1',
        slug: 'estate-family-wealth',
      },
    },
  },
  {
    id: 'labor-employment',
    schemaVersion: 1,
    version: 1,
    audiences: ['individual', 'business'],
    relatedTeamIds: ['senior-counsel'],
    sortOrder: 5,
    iconName: 'Briefcase',
    createdAt: '2026-11-12T10:00:00Z',
    updatedAt: '2026-11-12T10:00:00Z',
    createdBy: 'admin-rma-01',
    updatedBy: 'admin-rma-01',
    locales: {
      ar: {
        workflow: 'approved',
        draftRevisionId: 'rev-le-ar-1',
        approvedRevisionId: 'rev-le-ar-1',
        publishedRevisionId: 'rev-le-ar-1',
        slug: 'labor-employment',
      },
      en: {
        workflow: 'approved',
        draftRevisionId: 'rev-le-en-1',
        approvedRevisionId: 'rev-le-en-1',
        publishedRevisionId: 'rev-le-en-1',
        slug: 'labor-employment',
      },
    },
  },
];

const INITIAL_SERVICE_REVISIONS: Record<string, ServiceRevision> = {
  'rev-cg-ar-1': {
    id: 'rev-cg-ar-1',
    entityId: 'corporate-governance',
    schemaVersion: 1,
    locale: 'ar',
    title: 'الحوكمة وتأسيس الشركات',
    slug: 'corporate-governance',
    summary: 'تقديم الاستشارات المتخصصة في حوكمة الشركات، إعداد اللوائح الداخلية، وتأسيس الكيانات التجارية وفق أحدث الأنظمة السعودية.',
    deliverables: ['صياغة عقود التأسيس وقرارات الشركاء', 'إعداد لوائح الحوكمة وسياسات تعارض المصالح', 'إعادة هيكلة الشركات والاندماج والاستحواذ'],
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        data: { text: 'توفر شركة رياض محمد الزهراني للمحاماة منظومة متكاملة من الاستشارات القانونية التي تدعم تأسيس المنشآت وحمايتها نظامياً.' },
      },
    ],
    seo: {
      title: 'الحوكمة وتأسيس الشركات | شركة رياض محمد الزهراني للمحاماة',
      description: 'استشارات قانونية في حوكمة الشركات وتأسيسها وصياغة لوائحها بالمملكة العربية السعودية.',
    },
    approvalEvidenceRefs: ['EVID-CORP-GOV-01'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
  'rev-cg-en-1': {
    id: 'rev-cg-en-1',
    entityId: 'corporate-governance',
    schemaVersion: 1,
    locale: 'en',
    title: 'Corporate Governance & Incorporation',
    slug: 'corporate-governance',
    summary: 'Comprehensive advisory on corporate governance, internal compliance bylaws, and company incorporation under Saudi corporate laws.',
    deliverables: ['Articles of Association & Shareholder Resolutions', 'Internal Governance Charters & Compliance Policies', 'M&A and Corporate Restructuring'],
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        data: { text: 'Riyadh Mohammed Alzahrani Legal Company provides strategic counsel enabling enterprises to maintain governance compliance.' },
      },
    ],
    seo: {
      title: 'Corporate Governance & Incorporation | Alzahrani Law',
      description: 'Specialized legal counsel on corporate incorporation, charters, and regulatory compliance in Saudi Arabia.',
    },
    approvalEvidenceRefs: ['EVID-CORP-GOV-01'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
  'rev-cl-ar-1': {
    id: 'rev-cl-ar-1',
    entityId: 'commercial-litigation',
    schemaVersion: 1,
    locale: 'ar',
    title: 'الترافع والتقاضي التجاري',
    slug: 'commercial-litigation',
    summary: 'تمثيل المنشآت والأفراد أمام المحاكم التجارية واللجان شبه القضائية وهيئات التحكيم في المنازعات المالية والعقود.',
    deliverables: ['صياغة صحائف الدعوى والمذكرات الجوابية', 'التمثيل في جلسات الترافع والتحكيم التجاري', 'تنفيذ الأحكام القضائية والسندات التنفيذية'],
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        data: { text: 'يمتلك فريقنا خبرة راسخة في الدفاع عن حقوق الموكلين أمام الدوائر التجارية بكافة درجات التقاضي.' },
      },
    ],
    seo: {
      title: 'الترافع والتقاضي التجاري | شركة رياض محمد الزهراني للمحاماة',
      description: 'تمثيل قضائي واحترافي في المنازعات التجارية والعقود المالية بالمملكة.',
    },
    approvalEvidenceRefs: ['EVID-LIT-01'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
  'rev-cl-en-1': {
    id: 'rev-cl-en-1',
    entityId: 'commercial-litigation',
    schemaVersion: 1,
    locale: 'en',
    title: 'Commercial Dispute Resolution & Litigation',
    slug: 'commercial-litigation',
    summary: 'Expert representation before commercial courts, quasi-judicial committees, and arbitration tribunals for complex financial and contractual disputes.',
    deliverables: ['Pleadings, Statement of Claims & Legal Defenses', 'Commercial Arbitration Tribunal Representation', 'Enforcement of Judgments & Commercial Instruments'],
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        data: { text: 'Our dispute resolution team delivers robust advocacy before Saudi commercial tribunals across all litigation tiers.' },
      },
    ],
    seo: {
      title: 'Commercial Litigation & Dispute Resolution | Alzahrani Law',
      description: 'Authoritative commercial court and arbitration representation in Riyadh, Saudi Arabia.',
    },
    approvalEvidenceRefs: ['EVID-LIT-01'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
  'rev-fi-ar-1': {
    id: 'rev-fi-ar-1',
    entityId: 'foreign-investment',
    schemaVersion: 1,
    locale: 'ar',
    title: 'الاستثمار الأجنبي والتراخيص النظامية',
    slug: 'foreign-investment',
    summary: 'مرافقة المستثمرين الدوليين لتأسيس مقراتهم الإقليمية في المملكة والحصول على تراخيص وزارة الاستثمار (MISA).',
    deliverables: ['إصدار تراخيص وزارة الاستثمار (MISA)', 'تأسيس المقرات الإقليمية (RHQ)', 'الاستشارات الضريبية والجمركية والتنظيمية'],
    blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'نساعد الكيانات العالمية على الاستفادة من بيئة الأعمال المزدهرة في السعودية.' } }],
    seo: { title: 'الاستثمار الأجنبي وتراخيص MISA | شركة رياض محمد الزهراني', description: 'تأسيس استثمارات أجنبية ومقرات إقليمية بالرياض.' },
    approvalEvidenceRefs: ['EVID-MISA-01'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
  'rev-fi-en-1': {
    id: 'rev-fi-en-1',
    entityId: 'foreign-investment',
    schemaVersion: 1,
    locale: 'en',
    title: 'Foreign Direct Investment (MISA) & Regulatory Licensing',
    slug: 'foreign-investment',
    summary: 'Assisting global investors in establishing regional headquarters (RHQ) and obtaining Ministry of Investment (MISA) licenses in Saudi Arabia.',
    deliverables: ['MISA License Issuance & Fast-Track Setup', 'Regional Headquarters (RHQ) Licensing', 'Regulatory Tax, Customs & Labor Compliance'],
    blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'Empowering foreign enterprises entering the Saudi business market with comprehensive regulatory support.' } }],
    seo: { title: 'Foreign Investment & MISA Licensing | Alzahrani Law', description: 'Legal advisory for international investors establishing in Saudi Arabia.' },
    approvalEvidenceRefs: ['EVID-MISA-01'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
  'rev-ef-ar-1': {
    id: 'rev-ef-ar-1',
    entityId: 'estate-family-wealth',
    schemaVersion: 1,
    locale: 'ar',
    title: 'إدارة التركات والأوقاف والشركات العائلية',
    slug: 'estate-family-wealth',
    summary: 'صياغة ميثاق العائلة، تنظيم الأوقاف، وتصفية وقسمة التركات العقارية والمالية بما يحقق الاستقرار واستدامة الأصول.',
    deliverables: ['صياغة الميثاق العائلي وحوكمة الملكية', 'حصر وتوثيق الأوقاف وتعيين النظار', 'القسمة الرضائية والقضائية للتركات الكبرى'],
    blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'نحرص على حفظ الروابط العائلية وضمان استمرارية الأعمال وفق الأصول الشرعية والنظامية.' } }],
    seo: { title: 'التركات والشركات العائلية | شركة رياض محمد الزهراني', description: 'استشارات قانونية في حوكمة الشركات العائلية وقسمة التركات.' },
    approvalEvidenceRefs: ['EVID-EST-01'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
  'rev-ef-en-1': {
    id: 'rev-ef-en-1',
    entityId: 'estate-family-wealth',
    schemaVersion: 1,
    locale: 'en',
    title: 'Estates, Waqf & Family Wealth Structuring',
    slug: 'estate-family-wealth',
    summary: 'Structuring family business constitutions, waqf endowments, and estate probate under applicable Sharia and civil statutes.',
    deliverables: ['Family Charters & Generational Ownership Governance', 'Waqf Foundation Setup & Trustee Mandates', 'Amicable & Judicial Probate Estate Division'],
    blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'Preserving family wealth continuity through robust constitutional structuring and Sharia-compliant estate planning.' } }],
    seo: { title: 'Family Wealth & Estate Governance | Alzahrani Law', description: 'Advisory on estate planning and family governance in Saudi Arabia.' },
    approvalEvidenceRefs: ['EVID-EST-01'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
  'rev-le-ar-1': {
    id: 'rev-le-ar-1',
    entityId: 'labor-employment',
    schemaVersion: 1,
    locale: 'ar',
    title: 'القضايا العمالية وعقود العمل',
    slug: 'labor-employment',
    summary: 'صياغة لوائح العمل وتنظيم عقود التوظيف وتسوية النزاعات العمالية لحماية حقوق أطراف العلاقة التعاقدية.',
    deliverables: ['صياغة واعتماد لائحة تنظيم العمل الداخلية', 'عقود القيادات التنفيذية وسياسات عدم المنافسة', 'التمثيل أمام المحاكم العمالية ولجان التسوية'],
    blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'حماية المنشآت وحقوق العاملين وفق نصوص نظام العمل السعودي ولائحته التنفيذية.' } }],
    seo: { title: 'القضايا العمالية وعقود العمل | شركة رياض محمد الزهراني', description: 'استشارات نظام العمل والنزاعات العمالية بالمملكة.' },
    approvalEvidenceRefs: ['EVID-LAB-01'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
  'rev-le-en-1': {
    id: 'rev-le-en-1',
    entityId: 'labor-employment',
    schemaVersion: 1,
    locale: 'en',
    title: 'Employment Law & Workforce Advisory',
    slug: 'labor-employment',
    summary: 'Drafting labor compliance bylaws, executive employment contracts, and resolving workplace disputes before Saudi labor tribunals.',
    deliverables: ['Internal Labor Bylaws Registration & Review', 'Executive Employment & Non-Compete Agreements', 'Labor Court & Amicable Settlement Representation'],
    blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'Safeguarding enterprise compliance and employment equity under the Saudi Labor Law.' } }],
    seo: { title: 'Employment Law & Workplace Advisory | Alzahrani Law', description: 'Employment regulation advisory and dispute resolution in KSA.' },
    approvalEvidenceRefs: ['EVID-LAB-01'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
};

const INITIAL_TEAM: TeamMemberEntity[] = [
  {
    id: 'riyadh-alzahrani',
    schemaVersion: 1,
    version: 1,
    sortOrder: 1,
    relatedServiceIds: ['corporate-governance', 'commercial-litigation', 'foreign-investment'],
    createdAt: '2026-11-12T10:00:00Z',
    updatedAt: '2026-11-12T10:00:00Z',
    createdBy: 'admin-rma-01',
    updatedBy: 'admin-rma-01',
    locales: {
      ar: {
        workflow: 'approved',
        draftRevisionId: 'rev-tm-ra-ar',
        approvedRevisionId: 'rev-tm-ra-ar',
        publishedRevisionId: 'rev-tm-ra-ar',
        slug: 'riyadh-alzahrani',
      },
      en: {
        workflow: 'approved',
        draftRevisionId: 'rev-tm-ra-en',
        approvedRevisionId: 'rev-tm-ra-en',
        publishedRevisionId: 'rev-tm-ra-en',
        slug: 'riyadh-alzahrani',
      },
    },
  },
  {
    id: 'senior-counsel',
    schemaVersion: 1,
    version: 1,
    sortOrder: 2,
    relatedServiceIds: ['commercial-litigation', 'estate-family-wealth', 'labor-employment'],
    createdAt: '2026-11-12T10:00:00Z',
    updatedAt: '2026-11-12T10:00:00Z',
    createdBy: 'admin-rma-01',
    updatedBy: 'admin-rma-01',
    locales: {
      ar: {
        workflow: 'approved',
        draftRevisionId: 'rev-tm-sc-ar',
        approvedRevisionId: 'rev-tm-sc-ar',
        publishedRevisionId: 'rev-tm-sc-ar',
        slug: 'senior-counsel',
      },
      en: {
        workflow: 'approved',
        draftRevisionId: 'rev-tm-sc-en',
        approvedRevisionId: 'rev-tm-sc-en',
        publishedRevisionId: 'rev-tm-sc-en',
        slug: 'senior-counsel',
      },
    },
  },
];

const INITIAL_TEAM_REVISIONS: Record<string, TeamMemberRevision> = {
  'rev-tm-ra-ar': {
    id: 'rev-tm-ra-ar',
    entityId: 'riyadh-alzahrani',
    schemaVersion: 1,
    locale: 'ar',
    title: 'المستشار رياض بن محمد الزهراني',
    slug: 'riyadh-alzahrani',
    summary: 'الشريك المؤسس والمدير العام - محامٍ ومستشار قانوني بخبرة تتجاوز 20 عاماً في التقاضي والتحكيم والصياغة النظامية.',
    fullName: 'المستشار رياض بن محمد الزهراني',
    positionTitle: 'الشريك المؤسس والمدير العام',
    practiceAreas: ['التقاضي والتحكيم التجاري الدولي', 'صياغة العقود والاتفاقيات', 'حوكمة الشركات', 'الأوقاف والتركات والتمويل الإسلامي'],
    spokenLanguages: ['العربية', 'الإنجليزية'],
    verifiedCredentials: [
      'محامٍ ومستشار مرخص من وزارة العدل بالمملكة العربية السعودية',
      'عضو الهيئة السعودية للمحامين',
      'عضو المجمع الملكي البريطاني للمحكمين (CIArb, UK)',
      'محكم تجاري دولي معتمد',
      'مؤلف كتاب "القانون التجاري"',
      'الزمالة الدولية في التحكيم التجاري',
      'زمالة المستشار الشرعي في فقه المعاملات المالية الإسلامية',
      'زمالة مستشار الأوقاف لدى الهيئة العامة للأوقاف',
      'مستشار الصياغة التشريعية',
      'مدرب قانوني معتمد من المؤسسة العامة للتدريب التقني والمهني (TVTC)',
      'الزمالة المهنية في الإدارة القانونية',
    ],
    blocks: [
      {
        id: 'b-quote-leadership',
        type: 'quote',
        data: {
          text: 'يقوم العمل القانوني في جوهره على الثقة: ثقة الموكل بأن مصالحه في أيدٍ أمينة، وبأن كل ما يقع بين أيدينا يبقى في دائرة السرية التامة. على مدى أكثر من عشرين عامًا في التقاضي والتحكيم والصياغة النظامية، تعلّمنا أن النزاع لا يُكسب برفع الصوت، بل بقوة الحجة وسلامة الإجراء.',
          attribution: 'المستشار رياض محمد الزهراني',
        },
      },
      {
        id: 'b-exp-heading',
        type: 'heading',
        data: { text: 'الخبرة والمسيرة المهنية', level: 2 },
      },
      {
        id: 'b-exp-para',
        type: 'paragraph',
        data: { text: 'يمتلك المستشار رياض الزهراني خبرة رصينة تمتد لأكثر من عقدين في قيادة مذكرات التقاضي التجاري المعقد، وإدارة ملفات التحكيم المؤسسي والحر، وصياغة العقود الاستثمارية وحوكمة الكيانات التجارية العائلية في المملكة العربية السعودية.' },
      },
    ],
    seo: {
      title: 'المستشار رياض بن محمد الزهراني',
      description: 'السيرة المهنية للمستشار رياض الزهراني الشريك المؤسس والمدير العام.',
    },
    approvalEvidenceRefs: ['MOJ-LICENSE-VERIFIED', 'AUTH-BOOK-COMMERCIAL-LAW'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
  'rev-tm-ra-en': {
    id: 'rev-tm-ra-en',
    entityId: 'riyadh-alzahrani',
    schemaVersion: 1,
    locale: 'en',
    title: 'Counselor Riyadh M. Alzahrani',
    slug: 'riyadh-alzahrani',
    summary: 'Founding & Managing Partner - Advocate & Legal Consultant with 20+ years of experience in litigation, arbitration and legislative drafting.',
    fullName: 'Counselor Riyadh M. Alzahrani',
    positionTitle: 'Founding & Managing Partner',
    practiceAreas: ['International Commercial Arbitration', 'Contract Drafting', 'Corporate Governance', 'Waqf, Estates & Islamic Finance'],
    spokenLanguages: ['Arabic', 'English'],
    verifiedCredentials: [
      'Licensed Advocate - Saudi Ministry of Justice',
      'Member - Saudi Bar Association',
      'Member - Chartered Institute of Arbitrators (CIArb, UK)',
      'Certified International Commercial Arbitrator',
      'Author of "Commercial Law" (القانون التجاري)',
      'International Fellowship in Commercial Arbitration',
      'Fellowship as Sharia Adviser in Islamic Financial Transactions',
      'Waqf Adviser Fellowship, General Authority for Awqaf',
      'Legislative Drafting Adviser',
      'Certified Legal Trainer, Technical and Vocational Training Corporation (TVTC)',
      'Professional Fellowship in Legal Administration',
    ],
    blocks: [
      {
        id: 'b-quote-leadership-en',
        type: 'quote',
        data: {
          text: 'Legal practice rests on trust: the client’s trust that their interests are in safe hands, and that everything they share with us remains strictly confidential. Over more than twenty years in litigation, arbitration and legislative drafting, we have learned that a dispute is not won by volume, but by the strength of the argument and the integrity of the procedure.',
          attribution: 'Counselor Riyadh M. Alzahrani',
        },
      },
      {
        id: 'b-exp-heading-en',
        type: 'heading',
        data: { text: 'Professional Background & Focus', level: 2 },
      },
      {
        id: 'b-exp-para-en',
        type: 'paragraph',
        data: { text: 'Counselor Riyadh Alzahrani brings over two decades of authoritative experience advising corporate boards, handling complex commercial disputes, conducting arbitral proceedings, and establishing sound governance structures across Saudi Arabia.' },
      },
    ],
    seo: {
      title: 'Counselor Riyadh M. Alzahrani',
      description: 'Professional profile of Founding & Managing Partner Counselor Riyadh M. Alzahrani.',
    },
    approvalEvidenceRefs: ['MOJ-LICENSE-VERIFIED', 'AUTH-BOOK-COMMERCIAL-LAW'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
  'rev-tm-sc-ar': {
    id: 'rev-tm-sc-ar',
    entityId: 'senior-counsel',
    schemaVersion: 1,
    locale: 'ar',
    title: 'د. عبد الرحمن العتيبي',
    slug: 'senior-counsel',
    summary: 'مستشار قانوني رئيسي - المنازعات والتحكيم التجاري وقضايا التركات.',
    fullName: 'د. عبد الرحمن العتيبي',
    positionTitle: 'مستشار قانوني رئيسي',
    practiceAreas: ['التحكيم التجاري', 'إدارة التركات والأوقاف', 'القضايا العمالية'],
    spokenLanguages: ['العربية', 'الإنجليزية'],
    verifiedCredentials: ['محكّم معتمد', 'دكتوراه في الأنظمة التجارية'],
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        data: { text: 'يقود المستشار عبد الرحمن العتيبي قسم المنازعات والتحكيم مع تركيز خاص على صياغة الحلول التوافقية وقسمة التركات الكبرى.' },
      },
    ],
    seo: {
      title: 'د. عبد الرحمن العتيبي | شركة رياض محمد الزهراني للمحاماة',
      description: 'السيرة المهنية للمستشار د. عبد الرحمن العتيبي.',
    },
    approvalEvidenceRefs: ['CERT-ARB-VERIFIED'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
  'rev-tm-sc-en': {
    id: 'rev-tm-sc-en',
    entityId: 'senior-counsel',
    schemaVersion: 1,
    locale: 'en',
    title: 'Dr. Abdulrahman Al-Otaibi',
    slug: 'senior-counsel',
    summary: 'Senior Legal Counsel - Commercial Arbitration, Estates & Labor Law.',
    fullName: 'Dr. Abdulrahman Al-Otaibi',
    positionTitle: 'Senior Legal Counsel',
    practiceAreas: ['Commercial Arbitration', 'Family Wealth & Estates', 'Labor Advisory'],
    spokenLanguages: ['Arabic', 'English'],
    verifiedCredentials: ['Certified Arbitrator', 'Ph.D. in Commercial Law'],
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        data: { text: 'Dr. Al-Otaibi oversees arbitration mandates and estate divisions, providing insightful analysis under Saudi judicial frameworks.' },
      },
    ],
    seo: {
      title: 'Dr. Abdulrahman Al-Otaibi | Alzahrani Law',
      description: 'Professional profile of Senior Counsel Dr. Abdulrahman Al-Otaibi.',
    },
    approvalEvidenceRefs: ['CERT-ARB-VERIFIED'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
};

const INITIAL_ARTICLES: ArticleEntity[] = [
  {
    id: 'new-saudi-companies-law',
    schemaVersion: 1,
    version: 1,
    categoryIds: ['corporate-law'],
    authorTeamMemberId: 'riyadh-alzahrani',
    relatedServiceIds: ['corporate-governance'],
    publishedAt: '2026-11-10T08:00:00Z',
    createdAt: '2026-11-10T08:00:00Z',
    updatedAt: '2026-11-10T08:00:00Z',
    createdBy: 'admin-rma-01',
    updatedBy: 'admin-rma-01',
    locales: {
      ar: {
        workflow: 'approved',
        draftRevisionId: 'rev-art-cl-ar',
        approvedRevisionId: 'rev-art-cl-ar',
        publishedRevisionId: 'rev-art-cl-ar',
        slug: 'new-saudi-companies-law',
      },
      en: {
        workflow: 'approved',
        draftRevisionId: 'rev-art-cl-en',
        approvedRevisionId: 'rev-art-cl-en',
        publishedRevisionId: 'rev-art-cl-en',
        slug: 'new-saudi-companies-law',
      },
    },
  },
];

const INITIAL_ARTICLE_REVISIONS: Record<string, ArticleRevision> = {
  'rev-art-cl-ar': {
    id: 'rev-art-cl-ar',
    entityId: 'new-saudi-companies-law',
    schemaVersion: 1,
    locale: 'ar',
    title: 'الأبعاد الإستراتيجية لنظام الشركات السعودي الجديد',
    slug: 'new-saudi-companies-law',
    summary: 'قراءة تحليلية عامة في أبرز التحولات التشريعية التي استحدثها نظام الشركات السعودي الصادر بالمرسوم الملكي رقم (م/132)، ولا سيما في تنظيم الشركات العائلية واستحداث شركة المساهمة المبسطة وتعزيز مبادئ الحوكمة المؤسسية.',
    readingTimeMinutes: 4,
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        data: {
          text: 'يمثل نظام الشركات السعودي الصادر بالمرسوم الملكي رقم (م/132) وتاريخ 1443/12/1هـ نقطة تحول جوهرية في البنية التشريعية لبيئة الأعمال في المملكة العربية السعودية، إذ أعاد صياغة الإطار النظامي للشركات التجارية وغير الربحية والمهنية في وثيقة تشريعية موحدة تهدف إلى رفع كفاءة السوق، وتقليص القيود الإجرائية، ومواكبة المتغيرات الاقتصادية والاستثمارية المعاصرة.',
        },
      },
      {
        id: 'b2',
        type: 'heading',
        data: {
          text: 'أولاً: استحداث شركة المساهمة المبسطة ومرونة الهيكلة',
          level: 2,
        },
      },
      {
        id: 'b3',
        type: 'paragraph',
        data: {
          text: 'من أبرز المستجدات التي جاء بها النظام إتاحة تأسيس "شركة المساهمة المبسطة" لتلبية احتياجات رواد الأعمال والمشاريع الناشئة وصناديق الاستثمار. فقد استبعد النظام في هذا الكيان اشتراط الحد الأدنى لرأس المال، وسمح بأن تتولى إدارتها شخصية واحدة أو أكثر وفق نظامها الأساس دون إلزام بتشكيل مجلس إدارة تقليدي، مع تمكين الشركاء من استحداث فئات متعددة من الأسهم تتفاوت في حقوق التصويت وتوزيع الأرباح والأولوية عند التصفية. وتمنح هذه المرونة المؤسسين والمستثمرين قدرة أوسع على تصميم اتفاقيات التمويل وجولات الاستثمار بصورة واضحة ومتوازنة.',
        },
      },
      {
        id: 'b4',
        type: 'heading',
        data: {
          text: 'ثانياً: حوكمة الشركات العائلية والمواثيق الملزمة',
          level: 2,
        },
      },
      {
        id: 'b5',
        type: 'paragraph',
        data: {
          text: 'أولى النظام عناية خاصة لاستدامة الشركات العائلية التي تشكل ركيزة أساسية في الاقتصاد الوطني، حيث أجاز تضمين عقد التأسيس أو نظام الشركة الأساس أحكاماً مقتبسة من "الميثاق العائلي"، بما يكفل إضفاء الصفة الإلزامية على قواعد ملكية الحصص أو الأسهم، وضوابط تداولها بين أفراد الأسرة، وآليات التقييم والتخارج، والضوابط الحاكمة لتولي أفراد العائلة المناصب التنفيذية أو مقاعد الإدارة. ويسهم هذا التأصيل النظامي في الحد من نزاعات انتقال الملكية عبر الأجيال، ويمنع تفتت الأصول أو تعطل القرار الإداري عند خلاف الشركاء.',
        },
      },
      {
        id: 'b6',
        type: 'heading',
        data: {
          text: 'ثالثاً: واجبات العناية والولاء ومسؤولية الإدارة',
          level: 2,
        },
      },
      {
        id: 'b7',
        type: 'paragraph',
        data: {
          text: 'رسّخ النظام منظومة صريحة من واجبات المديرين وأعضاء مجالس الإدارة، في مقدمتها واجب العناية والالتزام بأحكام النظام وعقد التأسيس، وواجب الولاء وتجنب حالات تعارض المصالح، والالتزام بالإفصاح المسبق عن أي مصلحة مباشرة أو غير مباشرة في الأعمال والعقود التي تتم لحساب الشركة. كما نظّم النظام قواعد دعوى المسؤولية وأطر الحماية المتوازنة لقرارات الإدارة المبنية على دراسة مهنية سليمة وبحسن نية، مما يعزز الانضباط المؤسسي ويرفع مستوى الشفافية أمام الشركاء والدائنين والجهات الرقابية على حد سواء.',
        },
      },
      {
        id: 'b8',
        type: 'heading',
        data: {
          text: 'رابعاً: أدوات التمويل والتحفيز والوقاية من النزاعات',
          level: 2,
        },
      },
      {
        id: 'b9',
        type: 'paragraph',
        data: {
          text: 'توسّع النظام في إقرار أدوات تعزز جاذبية الشركات واستمراريتها، مثل السماح للشركات ذات المسؤولية المحدودة بإصدار أدوات دين أو صكوك تمويلية قابلة للتداول وفق نظام السوق المالية، وإمكانية تخصيص أسهم أو حصص لتحفيز العاملين واستبقاء الكفاءات القيادية، فضلاً عن الاعتراف النظامي باتفاقيات الشركاء أو المساهمين بشرط عدم تعارضها مع النظام الأساس وأحكام النظام. وتؤكد الخبرة العملية أن مراجعة عقود التأسيس وتحديث اللوائح الداخلية بصورة استباقية هو المسار الأكثر فاعلية لتلافي التعارضات الإجرائية وحماية استقرار المنشأة على المدى الطويل.',
        },
      },
      {
        id: 'b9b',
        type: 'heading',
        data: {
          text: 'خامساً: مواءمة عقود التأسيس وإجراءات التحول والتخارج والوقاية من النزاعات',
          level: 2,
        },
      },
      {
        id: 'b9c',
        type: 'paragraph',
        data: {
          text: 'كما وسّع النظام مرونة عمليات الاندماج والاستحواذ والتحول بين الأشكال النظامية المختلفة للشركات، ونظم إجراءات التقسيم وتصفية الشركات المتعثرة أو التي استنفدت غرضها بصورة أكثر وضوحاً وسرعة. ومن المهم للمنشآت القائمة ألا تكتفي بتعديلات شكلية عابرة على نصوص عقودها السابقة، بل أن تراجع بشكل شامل آليات الدعوة للجمعيات العامة، ونصاب التصويت في القرارات المصيرية، وقواعد تقييم الحصص عند رغبة أحد الشركاء في التخارج أو بيع حصته لطرف ثالث، بما يضمن انسجام الصياغة التعاقدية مع الإطار النظامي الساري ويقلص مساحات الخلاف التفسيري أمام الدوائر التجارية أو هيئات التحكيم.',
        },
      },
      {
        id: 'b9d',
        type: 'list',
        data: {
          title: 'محاور عملية للمراجعة الوقائية لحوكمة الشركات:',
          items: [
            'مراجعة عقود التأسيس والأنظمة الأساسية للتأكد من توافقها مع الضوابط الحديثة لإدارة الشركات ونصاب القرارات غير العادية.',
            'توثيق اتفاقيات الشركاء أو المساهمين وربطها بملاحق واضحة تحدد آليات فض النزاعات واللجوء إلى الوساطة أو التحكيم عند الاقتضاء.',
            'ضبط سياسات الإفصاح عن تعارض المصالح وتنظيم صلاحيات التوقيع والتمثيل الإداري والمالي أمام الجهات الرسمية والمصارف.',
            'تحديث هياكل الملكية العائلية بآليات مدروسة للانتقال السلس للقيادة وحماية الأصول التشغيلية والعقارية للمنشأة.',
          ],
        },
      },
      {
        id: 'b10',
        type: 'paragraph',
        data: {
          text: 'تنبيه معرفي عام: تتناول هذه المادة المبادئ العامة لنظام الشركات السعودي ولوائحه التنفيذية لأغراض التوعية القانونية العامة فحسب، ولا تشكل رأياً قانونياً مخصصاً لأي واقعة أو كيان بعينه، ولا ترتبط بأي عملاء أو ملفات قائمة، وتخضع كل حالة لتقييم مستقل وفق مستنداتها وظروفها النظامية الخاصة.',
        },
      },
    ],
    seo: {
      title: 'الأبعاد الإستراتيجية لنظام الشركات السعودي الجديد',
      description: 'تحليل عام لأبرز أحكام نظام الشركات السعودي الجديد في حوكمة الشركات العائلية، شركة المساهمة المبسطة، وواجبات الإدارة.',
    },
    approvalEvidenceRefs: [],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-10T08:00:00Z',
  },
  'rev-art-cl-en': {
    id: 'rev-art-cl-en',
    entityId: 'new-saudi-companies-law',
    schemaVersion: 1,
    locale: 'en',
    title: 'Strategic Dimensions of the New Saudi Companies Law',
    slug: 'new-saudi-companies-law',
    summary: 'A general analytical overview of key statutory developments under the Saudi Companies Law (Royal Decree No. M/132), highlighting simplified joint-stock entities, family governance charters, and fiduciary accountability.',
    readingTimeMinutes: 4,
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        data: {
          text: 'The Saudi Companies Law enacted by Royal Decree No. (M/132) dated 1/12/1443H marks a foundational modernisation of the Kingdom’s commercial legislative framework. Consolidating commercial, non-profit, and professional companies into a single unified statute, the law streamlines incorporation rules, removes outdated procedural barriers, and equips enterprises with flexible governance tools aligned with international commercial practice.',
        },
      },
      {
        id: 'b2',
        type: 'heading',
        data: {
          text: '1. Simplified Joint-Stock Companies & Structural Flexibility',
          level: 2,
        },
      },
      {
        id: 'b3',
        type: 'paragraph',
        data: {
          text: 'A central innovation of the statute is the Simplified Joint-Stock Company (SJSC), designed to serve venture capital investments, startups, and agile holding vehicles. The law removes mandatory minimum share-capital thresholds for this form and permits management by a single executive, multiple managers, or a board tailored within the articles of association. Shareholders may also structure multiple classes of shares carrying distinct voting, dividend, redemption, or liquidation rights, enabling clear alignment of commercial expectations during financing rounds.',
        },
      },
      {
        id: 'b4',
        type: 'heading',
        data: {
          text: '2. Family Business Continuity & Binding Family Charters',
          level: 2,
        },
      },
      {
        id: 'b5',
        type: 'paragraph',
        data: {
          text: 'Recognising the vital role of family enterprises across the Saudi economy, the law expressly allows companies to incorporate binding provisions derived from a Family Charter directly into their articles of association or bylaws. Properly integrated, these mechanisms govern share transfer restrictions, pre-emption rights, valuation formulas for exiting heirs, dividend distributions, and criteria for family participation in leadership — significantly reducing the likelihood of generational deadlock or asset fragmentation.',
        },
      },
      {
        id: 'b6',
        type: 'heading',
        data: {
          text: '3. Codified Fiduciary Duties & Board Accountability',
          level: 2,
        },
      },
      {
        id: 'b7',
        type: 'paragraph',
        data: {
          text: 'The statute explicitly codifies managers’ and directors’ duties of care and loyalty, requiring informed, diligent decision-making in the company’s best interests alongside strict conflict-of-interest disclosure before executing related-party transactions. By balancing clear liability standards with recognition of sound business judgement taken in good faith, the law strengthens corporate transparency for shareholders, financiers, and regulatory bodies alike.',
        },
      },
      {
        id: 'b8',
        type: 'heading',
        data: {
          text: '4. Financing Instruments, Employee Incentives & Dispute Prevention',
          level: 2,
        },
      },
      {
        id: 'b9',
        type: 'paragraph',
        data: {
          text: 'Additional reforms expand capital-raising and retention options, including enabling limited liability companies to issue negotiable debt or sukuk financing instruments under Capital Market Authority rules, allocating shares for employee incentive plans, and formally recognising binding shareholders’ agreements alongside corporate bylaws. From a preventive legal standpoint, reviewing legacy articles of association and aligning internal governance policies proactively remains the most reliable safeguard against future corporate disputes.',
        },
      },
      {
        id: 'b9b',
        type: 'heading',
        data: {
          text: '5. Aligning Legacy Charters, Conversions & Preventive Governance',
          level: 2,
        },
      },
      {
        id: 'b9c',
        type: 'paragraph',
        data: {
          text: 'The statute further streamlines corporate mergers, conversions between legal forms, corporate divisions, and orderly liquidation procedures, providing enterprises with clearer statutory timelines when restructuring operations. For existing companies, updating corporate charters involves more than minor formal edits: general assembly notice periods, extraordinary resolution quorums, share valuation mechanics on partner exit, and pre-emption workflows should all be harmonised with the statute to minimise interpretive friction in commercial or arbitral proceedings.',
        },
      },
      {
        id: 'b9d',
        type: 'list',
        data: {
          title: 'Practical Corporate Governance Review Checklist:',
          items: [
            'Audit existing articles of association and bylaws against updated statutory quorum and management rules.',
            'Align shareholders’ agreements cleanly with constitutional documents, including deadlock and dispute-resolution clauses.',
            'Formalise conflict-of-interest disclosure procedures and dual-signatory financial authority matrices.',
            'Integrate family-business succession rules to support orderly leadership transition and asset continuity.',
          ],
        },
      },
      {
        id: 'b10',
        type: 'paragraph',
        data: {
          text: 'General Educational Notice: This article outlines general principles of the Saudi Companies Law and its implementing regulations for informational purposes only. It does not constitute legal advice for any specific entity, client, or transaction, and every corporate structure requires independent legal review.',
        },
      },
    ],
    seo: {
      title: 'Strategic Dimensions of the New Saudi Companies Law',
      description: 'General overview of corporate reforms under the Saudi Companies Law: simplified joint-stock companies, family charters, and fiduciary duties.',
    },
    approvalEvidenceRefs: [],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-10T08:00:00Z',
  },
};

// Initial Public Projections
function generateInitialProjections(): PublicContentProjection[] {
  const projections: PublicContentProjection[] = [];

  const allServices = PRACTICE_AREAS_SERVICES;
  const allRevisions = PRACTICE_AREAS_SERVICE_REVISIONS;

  // Services projections
  for (const s of allServices) {
    for (const locale of ['ar', 'en'] as const) {
      const revId = s.locales[locale].publishedRevisionId;
      if (!revId) continue;
      const rev = allRevisions[revId];
      if (!rev) continue;

      projections.push({
        projectionId: `service_${s.id}_${locale}`,
        entityType: 'service',
        entityId: s.id,
        locale,
        slug: rev.slug,
        title: rev.title,
        summary: rev.summary,
        blocks: rev.blocks,
        metadata: {
          audiences: s.audiences,
          sortOrder: s.sortOrder,
          iconName: s.iconName,
          deliverables: rev.deliverables || [],
        },
        seo: {
          title: rev.seo.title,
          description: rev.seo.description,
          canonicalPath: `/${locale}/services/${rev.slug}`,
          alternatePaths: {
            ar: `/ar/services/${s.locales.ar.slug}`,
            en: `/en/services/${s.locales.en.slug}`,
          },
        },
        publishedAt: '2026-11-12T10:00:00Z',
        version: s.version,
      });
    }
  }

  // Team projections
  for (const t of INITIAL_TEAM) {
    if (!UNVERIFIED_CLAIMS_CONFIG.enableUnconfirmedTeamMembers && t.id !== 'riyadh-alzahrani') continue;
    for (const locale of ['ar', 'en'] as const) {
      const revId = t.locales[locale].publishedRevisionId;
      if (!revId) continue;
      const rev = INITIAL_TEAM_REVISIONS[revId];
      if (!rev) continue;

      projections.push({
        projectionId: `teamMember_${t.id}_${locale}`,
        entityType: 'teamMember',
        entityId: t.id,
        locale,
        slug: rev.slug,
        title: rev.title,
        summary: rev.summary,
        blocks: rev.blocks,
        metadata: {
          sortOrder: t.sortOrder,
          fullName: rev.fullName,
          positionTitle: rev.positionTitle,
          practiceAreas: rev.practiceAreas,
          spokenLanguages: rev.spokenLanguages,
          verifiedCredentials: rev.verifiedCredentials,
        },
        seo: {
          title: rev.seo.title,
          description: rev.seo.description,
          canonicalPath: `/${locale}/team/${rev.slug}`,
          alternatePaths: {
            ar: `/ar/team/${t.locales.ar.slug}`,
            en: `/en/team/${t.locales.en.slug}`,
          },
        },
        publishedAt: '2026-11-12T10:00:00Z',
        version: t.version,
      });
    }
  }

  // Articles projections
  for (const a of INITIAL_ARTICLES) {
    for (const locale of ['ar', 'en'] as const) {
      const revId = a.locales[locale].publishedRevisionId;
      if (!revId) continue;
      const rev = INITIAL_ARTICLE_REVISIONS[revId];
      if (!rev) continue;

      projections.push({
        projectionId: `article_${a.id}_${locale}`,
        entityType: 'article',
        entityId: a.id,
        locale,
        slug: rev.slug,
        title: rev.title,
        summary: rev.summary,
        blocks: rev.blocks,
        metadata: {
          readingTimeMinutes: computeArticleReadingTimeMinutes(rev.summary, rev.blocks),
          categoryIds: a.categoryIds,
        },
        seo: {
          title: rev.seo.title,
          description: rev.seo.description,
          canonicalPath: `/${locale}/insights/${rev.slug}`,
          alternatePaths: {
            ar: `/ar/insights/${a.locales.ar.slug}`,
            en: `/en/insights/${a.locales.en.slug}`,
          },
        },
        publishedAt: a.publishedAt || '2026-11-10T08:00:00Z',
        version: a.version,
      });
    }
  }

  return projections;
}

// Global In-Memory Persistent Store singleton across requests
class InMemoryStore {
  admins: Map<string, AdminUser> = new Map();
  services: Map<string, ServiceEntity> = new Map();
  serviceRevisions: Map<string, ServiceRevision> = new Map();
  teamMembers: Map<string, TeamMemberEntity> = new Map();
  teamMemberRevisions: Map<string, TeamMemberRevision> = new Map();
  articles: Map<string, ArticleEntity> = new Map();
  articleRevisions: Map<string, ArticleRevision> = new Map();
  publishedContent: Map<string, PublicContentProjection> = new Map();
  inquiries: Map<string, ContactRequest> = new Map();
  consultations: Map<string, ConsultationRequest> = new Map();
  paymentRequests: Map<string, PaymentRequest> = new Map();
  media: Map<string, MediaAsset> = new Map();
  siteSettings: SiteSettings = { ...INITIAL_SETTINGS };
  auditLogs: AuditLogEntry[] = [];
  outboxJobs: Map<string, OutboxJob> = new Map();
  idempotencyKeys: Map<string, { result: any; expiresAt: number }> = new Map();
  rateLimits: Map<string, { count: number; expiresAt: number }> = new Map();

  constructor() {
    // Populate Initial Admin Data
    for (const admin of INITIAL_ADMINS) {
      this.admins.set(admin.uid, admin);
    }
    // Populate Services: 16 Official Practice Areas from the approved PDF Corporate Profile
    for (const s of PRACTICE_AREAS_SERVICES) {
      this.services.set(s.id, s);
    }
    for (const [id, rev] of Object.entries(PRACTICE_AREAS_SERVICE_REVISIONS)) {
      this.serviceRevisions.set(id, rev);
    }
// Prior legacy duplicate services removed to preserve exact 16 practice areas from official PDF.
    // Populate Team
    for (const t of INITIAL_TEAM) {
    if (!UNVERIFIED_CLAIMS_CONFIG.enableUnconfirmedTeamMembers && t.id !== 'riyadh-alzahrani') continue;
      this.teamMembers.set(t.id, t);
    }
    for (const [id, rev] of Object.entries(INITIAL_TEAM_REVISIONS)) {
      this.teamMemberRevisions.set(id, rev);
    }
    // Populate Articles
    for (const a of INITIAL_ARTICLES) {
      this.articles.set(a.id, a);
    }
    for (const [id, rev] of Object.entries(INITIAL_ARTICLE_REVISIONS)) {
      this.articleRevisions.set(id, rev);
    }
    // Populate Public Projections
    for (const p of generateInitialProjections()) {
      this.publishedContent.set(p.projectionId, p);
    }

    // Seed a couple test inquiries for realistic CMS triage testing
    const sampleInquiry: ContactRequest = {
      id: 'INQ-2026-001',
      audience: 'business',
      name: 'عبدالله السعدون',
      companyName: 'شركة السعدون القابضة',
      phoneE164: '+966501234567',
      email: FIRM_DETAILS.email,
      serviceId: 'corporate-governance',
      message: 'نود مراجعة لوائح الحوكمة وإعادة هيكلة الشركات التابعة لمجموعتنا وفق نظام الشركات الجديد.',
      locale: 'ar',
      status: 'new',
      noticeVersion: '1.0',
      acknowledgedAt: '2026-11-12T14:30:00Z',
      retentionClass: 'INQUIRY_ACTIVE',
      notes: [],
      createdAt: '2026-11-12T14:30:00Z',
      updatedAt: '2026-11-12T14:30:00Z',
    };
    this.inquiries.set(sampleInquiry.id, sampleInquiry);

    // Seed realistic consultation requests for triage testing
    const sampleConsultation1: ConsultationRequest = {
      id: 'CR-2026-001',
      reference: 'CR-2026-001',
      fullName: 'سلطان بن عبدالعزيز التميمي',
      phone: FIRM_DETAILS.phone,
      serviceId: 'commercial-litigation',
      serviceLabelSnapshot: {
        ar: 'التقاضي التجاري وتسوية المنازعات',
        en: 'Commercial Litigation & Dispute Resolution',
      },
      preferredLawyerId: 'riyadh-alzahrani',
      preferredLawyerLabelSnapshot: {
        ar: 'أ. رياض محمد الزهراني',
        en: 'Riyadh M. Alzahrani',
      },
      preferredDate: '2026-11-20',
      assignedLawyerId: null,
      scheduledAt: null,
      appointmentTimezone: 'Asia/Riyadh',
      meetingType: null,
      meetingLink: null,
      meetingAddress: null,
      status: 'pending',
      locale: 'ar',
      sourcePage: '/ar/services/commercial-litigation',
      notes: [],
      history: [
        {
          id: 'H1',
          actorEmail: 'system',
          action: 'CONSULTATION_CREATED',
          toStatus: 'pending',
          details: { via: 'web_form' },
          timestamp: '2026-11-13T10:15:00Z',
        },
      ],
      createdAt: '2026-11-13T10:15:00Z',
      updatedAt: '2026-11-13T10:15:00Z',
    };

    const sampleConsultation2: ConsultationRequest = {
      id: 'CR-2026-002',
      reference: 'CR-2026-002',
      fullName: 'Sarah Jenkins',
      phone: FIRM_DETAILS.phone,
      serviceId: 'foreign-investment',
      serviceLabelSnapshot: {
        ar: 'الاستثمار الأجنبي وتأسيس الشركات',
        en: 'Foreign Direct Investment & Market Entry',
      },
      preferredLawyerId: null,
      preferredLawyerLabelSnapshot: null,
      preferredDate: '2026-11-18',
      assignedLawyerId: 'senior-counsel',
      scheduledAt: '2026-11-18T11:00:00Z',
      appointmentTimezone: 'Asia/Riyadh',
      meetingType: 'online',
      meetingLink: 'https://meet.google.com/rma-legal-consult',
      meetingAddress: null,
      status: 'confirmed',
      locale: 'en',
      sourcePage: '/en/consultation',
      notes: [
        {
          id: 'N1',
          authorUid: 'admin-rma-01',
          authorName: 'Riyadh Alzahrani',
          text: 'Agreed on Google Meet session for Tuesday 2 PM KSA.',
          createdAt: '2026-11-13T11:00:00Z',
        },
      ],
      history: [
        {
          id: 'H2',
          actorEmail: 'system',
          action: 'CONSULTATION_CREATED',
          toStatus: 'pending',
          timestamp: '2026-11-13T09:00:00Z',
        },
        {
          id: 'H3',
          actorEmail: 'admin@rma-law.sa',
          action: 'CONSULTATION_CONFIRMED',
          fromStatus: 'pending',
          toStatus: 'confirmed',
          details: { assignedLawyer: 'senior-counsel', scheduledAt: '2026-11-18T11:00:00Z' },
          timestamp: '2026-11-13T11:00:00Z',
        },
      ],
      createdAt: '2026-11-13T09:00:00Z',
      updatedAt: '2026-11-13T11:00:00Z',
      updatedBy: 'admin@rma-law.sa',
    };

    this.consultations.set(sampleConsultation1.id, sampleConsultation1);
    this.consultations.set(sampleConsultation2.id, sampleConsultation2);

    // Initial sample payment requests if none loaded
    const sampleToken1 = deriveSamplePaymentToken('PR-2026-0001');
    const sampleToken2 = deriveSamplePaymentToken('PR-2026-0002');
    const samplePaymentRequest1: PaymentRequest = {
      id: 'PR-2026-0001',
      token: sampleToken1,
      clientName: 'شركة الأفق للاستثمار العقاري',
      clientPhone: '+966501234567',
      serviceCategory: 'دراسة نزاع عقاري وإعداد مذكرة دفاع',
      amountSar: 3500,
      amountMinor: 350000,
      description: 'أتعاب دراسة ملف النزاع العقاري وتجهيز المذكرة الإجرائية',
      status: 'unpaid',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'عميل محال من الإدارة - نزاع مشروع شمال جدة',
    };
    const samplePaymentRequest2: PaymentRequest = {
      id: 'PR-2026-0002',
      token: sampleToken2,
      clientName: 'مؤسسة التوريدات الخليجية',
      clientPhone: '+966559876543',
      serviceCategory: 'مراجعة وتدقيق اتفاقية امتياز تجاري',
      amountSar: 2000,
      amountMinor: 200000,
      description: 'أتعاب التدقيق النظامي لاتفاقية الامتياز واللوائح التنفيذية',
      status: 'paid',
      moyasarPaymentId: 'pay_sample_test_998124',
      paymentMethod: 'mada',
      paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      notes: 'تم السداد بنجاح عبر بوابة ميسّر (مدى)',
    };
    this.paymentRequests.set(samplePaymentRequest1.id, samplePaymentRequest1);
    this.paymentRequests.set(samplePaymentRequest2.id, samplePaymentRequest2);

    this.loadFromDisk();
  }

  getPaymentRequestById(id: string): PaymentRequest | undefined {
    return this.paymentRequests.get(id);
  }

  getPaymentRequestByToken(token: string): PaymentRequest | undefined {
    for (const req of this.paymentRequests.values()) {
      if (req.token === token) return req;
    }
    const unsealed = unsealPaymentToken(token);
    if (unsealed) {
      if (!this.paymentRequests.has(unsealed.id)) {
        this.paymentRequests.set(unsealed.id, unsealed);
      }
      return unsealed;
    }
    return undefined;
  }

  getNextPaymentRequestId(): string {
    const year = new Date().getFullYear();
    const existingNums = Array.from(this.paymentRequests.keys())
      .map(id => {
        const m = id.match(/^PR-\d{4}-(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      });
    const nextNum = (existingNums.length > 0 ? Math.max(...existingNums) : 0) + 1;
    return `PR-${year}-${String(nextNum).padStart(4, '0')}`;
  }

  generatePaymentRequestToken(
    draft?: Pick<
      PaymentRequest,
      'id' | 'clientName' | 'serviceCategory' | 'amountMinor' | 'description' | 'createdAt' | 'expiresAt'
    >
  ): string {
    if (draft) {
      return sealPaymentToken(draft);
    }
    return crypto.randomBytes(24).toString('base64url');
  }

  private getDataDir(): string {
    if (process.env.VERCEL === '1') {
      return path.join(os.tmpdir(), 'rma-legal-data');
    }
    return path.join(process.cwd(), '.data');
  }

  loadFromDisk() {
    const dataDir = this.getDataDir();
    const filePath = path.join(dataDir, 'store_state.json');
    const backupPath = path.join(dataDir, 'store_state.json.bak');

    const tryParseAndLoad = (targetPath: string, isBackup = false): boolean => {
      try {
        if (!fs.existsSync(targetPath)) return false;
        const raw = fs.readFileSync(targetPath, 'utf-8');
        const data = JSON.parse(raw);

        if (Array.isArray(data.consultations)) {
          for (const c of data.consultations) {
            this.consultations.set(c.id, c);
          }
        }
        if (Array.isArray(data.inquiries)) {
          for (const req of data.inquiries) {
            this.inquiries.set(req.id, req);
          }
        }
        if (Array.isArray(data.paymentRequests)) {
          for (const pr of data.paymentRequests) {
            this.paymentRequests.set(pr.id, pr);
          }
        }
        if (data.siteSettings) {
          this.siteSettings = { ...this.siteSettings, ...data.siteSettings };
        }
        if (isBackup) {
          console.warn('[STORE_RECOVERY] Successfully recovered store state from backup store_state.json.bak');
        }
        return true;
      } catch (err) {
        console.error(`[STORE_LOAD_ERROR] Failed to load store from ${targetPath}:`, err);
        return false;
      }
    };

    const loadedPrimary = tryParseAndLoad(filePath, false);
    if (!loadedPrimary && fs.existsSync(backupPath)) {
      console.warn('[STORE_RECOVERY] Primary store file failed or missing. Attempting backup recovery...');
      tryParseAndLoad(backupPath, true);
    }
  }

  persistToDisk() {
    try {
      const dataDir = this.getDataDir();
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const filePath = path.join(dataDir, 'store_state.json');
      const backupPath = path.join(dataDir, 'store_state.json.bak');
      const tempPath = path.join(dataDir, `store_state.json.tmp.${process.pid}_${Date.now()}`);

      // 1. Maintain backup copy of last known good store state
      if (fs.existsSync(filePath)) {
        try {
          fs.copyFileSync(filePath, backupPath);
        } catch (backupErr) {
          console.warn('[STORE_PERSIST] Warning: Failed to create store backup snapshot:', backupErr);
        }
      }

      // 2. Atomic write: Write serialized JSON to a temporary file
      const payload = {
        consultations: Array.from(this.consultations.values()),
        inquiries: Array.from(this.inquiries.values()),
        paymentRequests: Array.from(this.paymentRequests.values()),
        siteSettings: this.siteSettings,
      };
      fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');

      // 3. Atomically replace the destination file
      fs.renameSync(tempPath, filePath);
    } catch (err) {
      console.error('[STORE_PERSIST_ERROR] Could not persist store state atomically to disk:', err);
    }
  }
}

// Global instance cache across Next.js dev reloads
const globalStoreKey = Symbol.for('rma.legal.store');
const globalAny = global as any;

if (!globalAny[globalStoreKey]) {
  globalAny[globalStoreKey] = new InMemoryStore();
} else if (!globalAny[globalStoreKey].siteSettings) {
  globalAny[globalStoreKey].siteSettings = { ...INITIAL_SETTINGS };
}

export const store: InMemoryStore = globalAny[globalStoreKey];
