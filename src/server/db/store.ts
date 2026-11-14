import fs from 'fs';
import path from 'path';
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
} from '../types';

const INITIAL_SETTINGS: SiteSettings = {
  brandNameAr: 'شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية',
  brandNameEn: 'Riyadh Mohammed Alzahrani Law Firm & Legal Consultations',
  brandShortAr: 'رياض الزهراني للمحاماة',
  brandShortEn: 'Alzahrani Law Firm',
  taglineAr: 'رؤية قانونية واثقة، وحلول تقوم على المعرفة',
  taglineEn: 'A clear legal perspective. An approach grounded in knowledge.',
  phone: '+966 55 777 5504',
  whatsapp: '+966 55 777 5504',
  email: 'riyadh@riyadhalzahrani.com',
  addressAr: 'المملكة العربية السعودية، الرياض',
  addressEn: 'Riyadh, Kingdom of Saudi Arabia',
  seoTitleAr: 'شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية | الرياض',
  seoTitleEn: 'Riyadh Mohammed Alzahrani Saudi Legal Company | Riyadh',
  seoDescAr: 'شركة محاماة واستشارات قانونية مرخصة بالمملكة تقدم حلولاً قضائية وتجارية وحوكمة رصينة للشركات والأفراد.',
  seoDescEn: 'Licensed Saudi legal firm delivering enterprise governance, commercial dispute resolution, and regulatory advisory.',
  ogImageUrl: '',
  faviconUrl: '/favicon.ico',
  heroHeadlineAr: 'رؤية قانونية واثقة. وحلول تقوم على المعرفة.',
  heroHeadlineEn: 'A clear legal perspective. An approach grounded in knowledge.',
  heroDescAr: 'خدمات قانونية متكاملة للأفراد والمنشآت في المملكة العربية السعودية، تبدأ بفهم عميق لاحتياجاتك وتوضيح دقيق للخطوات والحلول المناسبة.',
  heroDescEn: 'Comprehensive legal services for individuals and corporate entities across Saudi Arabia, beginning with an in-depth understanding of your objectives.',
  aboutTextAr: 'تأسست شركة رياض محمد الزهراني للمحاماة لتكون شريكاً قانونياً موثوقاً للشركات ورجال الأعمال والأفراد، مع التركيز على دقة المشورة، والامتثال لأحدث الأنظمة واللوائح في المملكة العربية السعودية.',
  aboutTextEn: 'Founded to serve as an authoritative legal partner for enterprises and individuals across the Kingdom of Saudi Arabia, upholding rigor, precision, and PDPL compliance.',
};

// Initial Mock Seed Data
const INITIAL_ADMINS: AdminUser[] = [
  {
    uid: 'admin-rma-01',
    email: 'admin@rma-law.sa',
    displayName: 'Riyadh Alzahrani',
    role: 'super_admin',
    isActive: true,
    mfaEnrolled: true,
    createdAt: '2026-11-12T10:00:00Z',
    updatedAt: '2026-11-12T10:00:00Z',
  },
  {
    uid: 'admin-rma-02',
    email: 'counsel@rma-law.sa',
    displayName: 'Associate Counsel',
    role: 'admin',
    isActive: true,
    mfaEnrolled: true,
    createdAt: '2026-11-12T11:00:00Z',
    updatedAt: '2026-11-12T11:00:00Z',
  },
  {
    uid: 'admin-rma-03',
    email: 'editor@rma-law.sa',
    displayName: 'Legal Editor',
    role: 'editor',
    isActive: true,
    mfaEnrolled: true,
    createdAt: '2026-11-12T11:30:00Z',
    updatedAt: '2026-11-12T11:30:00Z',
  },
  {
    uid: 'admin-rma-04',
    email: 'intake@rma-law.sa',
    displayName: 'Intake Officer',
    role: 'inquiry_manager',
    isActive: true,
    mfaEnrolled: true,
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
    title: 'أ. رياض بن محمد الزهراني',
    slug: 'riyadh-alzahrani',
    summary: 'الشريك المؤسس والمدير العام لشركة رياض محمد الزهراني للمحاماة والاستشارات القانونية.',
    fullName: 'أ. رياض بن محمد الزهراني',
    positionTitle: 'الشريك المؤسس والمدير العام',
    practiceAreas: ['حوكمة الشركات', 'التقاضي التجاري', 'الاستثمار الأجنبي'],
    spokenLanguages: ['العربية', 'الإنجليزية'],
    verifiedCredentials: ['محامٍ مرخص من وزارة العدل بالمملكة العربية السعودية', 'عضو الهيئة السعودية للمحامين'],
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        data: { text: 'يتمتع الأستاذ رياض الزهراني بخبرة قانونية ممتدة في قيادة الاستشارات الإستراتيجية للمنشآت الكبرى وتأسيس الاستثمارات الدولية في المملكة.' },
      },
    ],
    seo: {
      title: 'أ. رياض بن محمد الزهراني | شركة رياض محمد الزهراني للمحاماة',
      description: 'السيرة الذاتية للمحامي رياض بن محمد الزهراني الشريك المؤسس.',
    },
    approvalEvidenceRefs: ['MOJ-LICENSE-VERIFIED'],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-12T10:00:00Z',
  },
  'rev-tm-ra-en': {
    id: 'rev-tm-ra-en',
    entityId: 'riyadh-alzahrani',
    schemaVersion: 1,
    locale: 'en',
    title: 'Riyadh M. Alzahrani',
    slug: 'riyadh-alzahrani',
    summary: 'Founding & Managing Partner of Riyadh Mohammed Alzahrani Legal Company.',
    fullName: 'Riyadh M. Alzahrani',
    positionTitle: 'Founding & Managing Partner',
    practiceAreas: ['Corporate Governance', 'Commercial Litigation', 'Foreign Direct Investment'],
    spokenLanguages: ['Arabic', 'English'],
    verifiedCredentials: ['Licensed Advocate - Saudi Ministry of Justice', 'Member - Saudi Bar Association'],
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        data: { text: 'Riyadh Alzahrani leads the firm with a clear focus on corporate advisory, cross-border investment structuring, and dispute settlement.' },
      },
    ],
    seo: {
      title: 'Riyadh M. Alzahrani | Alzahrani Law Firm',
      description: 'Profile of Founding & Managing Partner Riyadh M. Alzahrani.',
    },
    approvalEvidenceRefs: ['MOJ-LICENSE-VERIFIED'],
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
    summary: 'قراءة تحليلية في المزايا التي يقدمها نظام الشركات للشركات العائلية والمساهمة المبسطة في تعزيز بيئة الأعمال بالمملكة.',
    readingTimeMinutes: 5,
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        data: { text: 'يعد نظام الشركات السعودي الجديد نقطة تحول جوهرية في المنظومة التشريعية لبيئة الأعمال، حيث استحدث أشكالاً جديدة من الكيانات كالشركة المساهمة المبسطة.' },
      },
    ],
    seo: {
      title: 'نظام الشركات السعودي الجديد | رؤى شركة رياض الزهراني للمحاماة',
      description: 'تحليل نظام الشركات الجديد وتأثيره على حوكمة واستدامة الأعمال في السعودية.',
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
    summary: 'An analytical review of the operational benefits introduced by the Saudi Companies Law for family businesses and simplified joint-stock entities.',
    readingTimeMinutes: 5,
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        data: { text: 'The new Saudi Companies Law represents a pivotal structural shift for businesses operating in the Kingdom, introducing modern flexible corporate forms.' },
      },
    ],
    seo: {
      title: 'New Saudi Companies Law Analysis | Alzahrani Law Insights',
      description: 'Strategic analysis on the corporate reforms enacted under the new Saudi Companies Law.',
    },
    approvalEvidenceRefs: [],
    createdBy: 'admin-rma-01',
    createdAt: '2026-11-10T08:00:00Z',
  },
};

// Initial Public Projections
function generateInitialProjections(): PublicContentProjection[] {
  const projections: PublicContentProjection[] = [];

  // Services projections
  for (const s of INITIAL_SERVICES) {
    for (const locale of ['ar', 'en'] as const) {
      const revId = s.locales[locale].publishedRevisionId;
      if (!revId) continue;
      const rev = INITIAL_SERVICE_REVISIONS[revId];
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
          readingTimeMinutes: rev.readingTimeMinutes || 5,
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
    // Populate Services
    for (const s of INITIAL_SERVICES) {
      this.services.set(s.id, s);
    }
    for (const [id, rev] of Object.entries(INITIAL_SERVICE_REVISIONS)) {
      this.serviceRevisions.set(id, rev);
    }
    // Populate Team
    for (const t of INITIAL_TEAM) {
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
      email: 'a.saadoun@saadoun-holding.com',
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
      phone: '+966551234567',
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
      phone: '+966559876543',
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
  }
}

// Global instance cache across Next.js dev reloads
const globalStoreKey = Symbol.for('rma.legal.store');
const globalAny = global as any;

if (!globalAny[globalStoreKey]) {
  globalAny[globalStoreKey] = new InMemoryStore();
}

export const store: InMemoryStore = globalAny[globalStoreKey];
