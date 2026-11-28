import {
  AdminUser,
  ArticleDocument,
  ConsultationRequest,
  ContactRequest,
  PaymentRequest,
  ServiceDocument,
  SiteSettings,
  TeamMemberDocument,
} from '../types';
import { hashPassword } from '../auth/password';
import { deriveSamplePaymentToken } from '../payments/tokens';
import { FIRM_DETAILS, UNVERIFIED_CLAIMS_CONFIG } from '../../config/compliance';
import {
  PRACTICE_AREAS_SERVICES,
  PRACTICE_AREAS_SERVICE_REVISIONS,
} from './practice-areas-seed';

export function buildSeedSettings(): SiteSettings {
  return {
    brandNameAr: FIRM_DETAILS.nameAr,
    brandNameEn: FIRM_DETAILS.nameEn,
    brandShortAr: 'رياض الزهراني للمحاماة',
    brandShortEn: 'Alzahrani Law Firm',
    taglineAr: FIRM_DETAILS.taglineAr,
    taglineEn: FIRM_DETAILS.taglineEn,
    phone: FIRM_DETAILS.phone,
    whatsapp: FIRM_DETAILS.whatsapp,
    email: FIRM_DETAILS.email,
    website: FIRM_DETAILS.website,
    websiteUrl: FIRM_DETAILS.websiteUrl,
    addressAr: FIRM_DETAILS.addressAr,
    addressEn: FIRM_DETAILS.addressEn,
    cityAr: FIRM_DETAILS.cityAr,
    cityEn: FIRM_DETAILS.cityEn,
    countryAr: FIRM_DETAILS.countryAr,
    countryEn: FIRM_DETAILS.countryEn,
    seoTitleAr: 'شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية | جدة',
    seoTitleEn: 'Riyadh Mohammed Alzahrani Law Firm & Legal Consultations | Jeddah',
    seoDescAr:
      'شركة محاماة واستشارات قانونية مرخصة بالمملكة تقدم حلولاً قضائية وتجارية وحوكمة رصينة للأفراد والشركات والجهات الاستثمارية.',
    seoDescEn:
      'Licensed Saudi legal firm delivering enterprise governance, commercial dispute resolution, and regulatory advisory.',
    ogImageUrl: '/images/home-hero.webp',
    faviconUrl: '/favicon.ico',

    // Hero
    heroEyebrowAr: 'شركة محاماة واستشارات قانونية مرخصة بالمملكة',
    heroEyebrowEn: 'Licensed Saudi Law Practice & Legal Advisory',
    heroHeadlineAr:
      'نقرأ النزاع قبل أن يصل إلى المحكمة، ونقرأ أدلته قبل أن تتحول إلى مرافعة',
    heroHeadlineEn:
      'We read the dispute before it reaches court — and its evidence before it becomes a pleading.',
    heroDescAr:
      'شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية شركة سعودية مقرها جدة، تخدم الأفراد والأسر والشركات والجهات الاستثمارية في طيف واسع من مجالات القانون.',
    heroDescEn:
      'Riyadh Mohammed Alzahrani Law Firm & Legal Consultations is a Saudi firm based in Jeddah, serving individuals, families, companies and investment entities across a broad spectrum of legal practice.',
    heroCtaPrimaryAr: 'استكشف خدماتنا',
    heroCtaPrimaryEn: 'Explore our services',
    heroCtaSecondaryAr: 'طلب استشارة أولية',
    heroCtaSecondaryEn: 'Schedule a Consultation',
    heroImageAltAr: 'عمارة سعودية حديثة تمثل الرصانة والتطور القانوني',
    heroImageAltEn: 'Contemporary Saudi architecture reflecting prestige and legal precision',
    heroTrust1Ar: 'امتثال تام لنظام المحاماة السعودي',
    heroTrust1En: 'Full Compliance with Saudi Legal Regulations',
    heroTrust2Ar: 'سرية مهنية وحوكمة موثوقة',
    heroTrust2En: 'Strict Professional Confidentiality',
    heroBadgeTitleAr: 'شركة محاماة مرخصة رسمياً',
    heroBadgeTitleEn: 'Officially Licensed Saudi Legal Firm',
    heroBadgeSubAr: UNVERIFIED_CLAIMS_CONFIG.enableMojLicenseNumber
      ? `ترخيص وزارة العدل رقم ${UNVERIFIED_CLAIMS_CONFIG.mojLicenseNumber}`
      : 'عضو الهيئة السعودية للمحامين',
    heroBadgeSubEn: UNVERIFIED_CLAIMS_CONFIG.enableMojLicenseNumber
      ? `MOJ License No. ${UNVERIFIED_CLAIMS_CONFIG.mojLicenseNumber} · SBA Member`
      : 'Saudi Bar Association Member',

    // Stats Banner
    statsItems: [
      {
        target: 20,
        prefix: '+',
        suffixAr: ' عاماً',
        suffixEn: ' Yrs',
        titleAr: 'خبرة رصينة متراكمة',
        titleEn: 'Years of Experience',
        descAr: 'في التقاضي، التحكيم، والصياغة النظامية',
        descEn: 'In litigation, arbitration & legislative drafting',
      },
      {
        target: 16,
        prefix: '',
        suffixAr: ' مجالاً',
        suffixEn: ' Areas',
        titleAr: 'مجال ممارسة متخصص',
        titleEn: 'Specialised Practice Areas',
        descAr: 'تغطية شاملة للنزاعات والمعاملات النظامية',
        descEn: 'Comprehensive coverage of statutory disciplines',
      },
      {
        target: 5,
        prefix: '',
        suffixAr: ' خطوات',
        suffixEn: ' Steps',
        titleAr: 'منهجية العمل المعتمدة',
        titleEn: 'Structured Method Stages',
        descAr: 'التشخيص، الإثبات، الإجراء، الخيارات، الوقاية',
        descEn: 'Diagnosis, proof, procedure, options, prevention',
      },
      {
        target: 7,
        prefix: '',
        suffixAr: ' مسارات',
        suffixEn: ' Tracks',
        titleAr: 'خدمات متخصصة ومؤسسية',
        titleEn: 'Specialised Client Programs',
        descAr: 'لكبار العملاء والمجموعات والثروات والنزاعات',
        descEn: 'Private clients, groups, family wealth & cross-border',
      },
    ],

    // Leadership Message
    leadershipEyebrowAr: 'كلمة القيادة',
    leadershipEyebrowEn: 'Leadership Message',
    leadershipQuoteAr:
      'يقوم العمل القانوني في جوهره على الثقة: ثقة الموكل بأن مصالحه في أيدٍ أمينة، وبأن كل ما يقع بين أيدينا يبقى في دائرة السرية التامة.',
    leadershipQuoteEn:
      'Legal practice rests on trust: the client’s trust that their interests are in safe hands, and that everything they share with us remains strictly confidential.',
    leadershipBody1Ar:
      'على مدى أكثر من عشرين عامًا في التقاضي والتحكيم والصياغة النظامية، تعلّمنا أن القضايا لا تُكسب بكثرة الأوراق، بل بوضوح المركز القانوني وسلامة الإجراء. ولذلك نبدأ كل ملف بسؤال واحد: ما الذي يمكن إثباته، وكيف؟',
    leadershipBody1En:
      'Over more than twenty years in litigation, arbitration and legislative drafting, we have learned that cases are not won by the weight of their files, but by the clarity of the legal position and the soundness of the procedure. So every matter begins with one question: what can be proven, and how?',
    leadershipBody2Ar:
      'يأتينا الموكل أحيانًا في أصعب لحظاته: متهماً يبحث عن دفاع عادل، أو أسرة يمزقها خلاف، أو منشأة يهدد النزاع استمرارها. ومسؤوليتنا أن نمنحه رأياً صادقاً لا مجاملة فيه، ومساراً واضحاً يعرف فيه خياراته وكلفتها.',
    leadershipBody2En:
      'Clients often come to us at their most difficult moments — accused and seeking a fair defence, a family divided by conflict, a business whose future is threatened by a dispute. Our duty is to give them candid advice, without flattery, and a clear path on which they understand their options and what each will cost.',
    leadershipBody3Ar:
      'ونؤمن بأن أفضل نزاع هو الذي لم يقع؛ لذلك نعمل مع عملائنا على الوقاية بقدر ما نعمل على المعالجة، في العقود والقرارات والحوكمة. نتشرف بثقتكم، ونتطلع إلى أن نكون شريككم القانوني في كل مرحلة.',
    leadershipBody3En:
      'We believe the best dispute is the one that never arises; so we work with our clients on prevention as much as on resolution — in their contracts, their decisions and their governance. We are honoured by your trust, and look forward to serving as your legal partner at every stage.',
    leadershipAuthorAr: 'المستشار رياض بن محمد الزهراني',
    leadershipAuthorEn: 'Counselor Riyadh Mohammed Alzahrani',
    leadershipRoleAr: 'الشريك المؤسس والمدير العام · محكم تجاري دولي معتمد',
    leadershipRoleEn:
      'Founding & Managing Partner · Certified International Commercial Arbitrator',
    leadershipExperienceBadgeAr: 'خبرة تتجاوز 20 عاماً',
    leadershipExperienceBadgeEn: '20+ Years Experience',

    // 5-Step Methodology
    methodologyEyebrowAr: 'فلسفتنا ومنهجنا',
    methodologyEyebrowEn: 'Our Philosophy & Method',
    methodologyHeadingAr:
      'القضية لا تُقاس بحجم مستنداتها، بل بقوة مركزها القانوني وسلامة بنائها الإجرائي',
    methodologyHeadingEn:
      'A case is measured not by the volume of its documents, but by the strength of its legal position and procedural soundness',
    methodologyDescAr:
      'منهج عمل مكتوب ومحدد من 5 مراحل إجرائية يضمن وضوح المسار، وتجنب المفاجآت، وتحقيق أعلى معايير الحماية القانونية.',
    methodologyDescEn:
      'A structured, written 5-stage method ensuring complete clarity, eliminating surprises, and maintaining rigorous legal safeguards.',
    methodologySteps: [
      {
        num: '01',
        titleAr: 'التشخيص قبل الرأي',
        titleEn: 'Diagnosis Before Opinion',
        descAr:
          'لا نقدم رأياً قبل فهم الوقائع كاملة وتكييفها نظامياً؛ فالتكييف الخاطئ يقود إلى طريق خاطئ مهما أُتقن السير فيه.',
        descEn:
          'We give no opinion until the facts are fully understood and characterised in law; a mistaken characterisation leads down the wrong path however skillfully walked.',
      },
      {
        num: '02',
        titleAr: 'الإثبات قبل المرافعة',
        titleEn: 'Proof Before Pleading',
        descAr:
          'نحدد عبء الإثبات ووسائله مبكراً، ونحفظ الدليل في وقته، لأن المرافعة القوية لا تعوّض دليلاً غائباً.',
        descEn:
          'We establish the burden and means of proof early, and preserve evidence in time; strong advocacy cannot make up for missing proof.',
      },
      {
        num: '03',
        titleAr: 'الإجراء جزء من الحق',
        titleEn: 'Procedure is Part of the Right',
        descAr:
          'نفحص الاختصاص والمواعيد وسلامة الإجراءات بالعناية نفسها التي نفحص بها موضوع النزاع.',
        descEn:
          'We examine jurisdiction, time limits and procedural integrity with the same care we give to the merits.',
      },
      {
        num: '04',
        titleAr: 'الخيارات قبل القرار',
        titleEn: 'Options Before Decision',
        descAr:
          'نعرض على الموكل البدائل القضائية والتفاوضية بكلفتها ومخاطرها، ونترك له القرار على بيّنة تامة.',
        descEn:
          'We present litigation and negotiation alternatives with their costs and risks, leaving the client to decide with eyes open.',
      },
      {
        num: '05',
        titleAr: 'الوقاية قبل النزاع',
        titleEn: 'Prevention Before Dispute',
        descAr:
          'نصوغ العقود والسياسات بعين من يتوقع النزاع، حتى لا يقع، أو يقع والموكل في أقوى مراكزه القانونية.',
        descEn:
          'We draft contracts and policies with the foresight of dispute, so that none arises — or if it does, the client stands in the strongest position.',
      },
    ],

    // Specialised Services
    specialisedEyebrowAr: 'حلول مؤسسية متقدمة',
    specialisedEyebrowEn: 'Institutional Solutions',
    specialisedHeadingAr: 'الخدمات المتخصصة',
    specialisedHeadingEn: 'Specialised Services',
    specialisedDescAr:
      'حزم استشارية واستراتيجية متقدمة صُممت لتلبية متطلبات كبار العملاء والشركات القابضة والمجموعات الاستثمارية.',
    specialisedDescEn:
      'Advanced strategic counsel designed for private clients, holding companies and multi-entity corporate groups.',
    specialisedItems: [
      {
        titleAr: 'خدمات كبار العملاء',
        titleEn: 'Private Client Services',
        descAr:
          'خدمة قانونية خاصة لرجال الأعمال وأصحاب الثروات، بتواصل مباشر مع القيادة، ومتابعة شخصية، وأعلى درجات التحفظ في كل ما يتعلق بالأصول والعلاقات والقرارات.',
        descEn:
          'Dedicated counsel for business leaders and high-net-worth individuals — with direct access to leadership, personal follow-up and the utmost discretion in all matters of assets, relationships and decisions.',
      },
      {
        titleAr: 'خدمات الشركات والمجموعات',
        titleEn: 'Corporate Groups',
        descAr:
          'دعم قانوني متكامل للمجموعات متعددة الكيانات: هيكلة العلاقات بين الشركات التابعة، وتوحيد العقود والسياسات، وإدارة منازعات المجموعة من مركز واحد.',
        descEn:
          'Integrated support for multi-entity groups: structuring relationships between subsidiaries, standardising contracts and policies, and managing group disputes from a single point.',
      },
      {
        titleAr: 'إدارة الثروات العائلية',
        titleEn: 'Family Wealth Management',
        descAr:
          'تنظيم الأصول العائلية عبر الشركات القابضة والأوقاف والمواثيق العائلية، بما يدعم انتقال الثروة بين الأجيال وفق الأحكام الشرعية والنظامية، دون ادعاء حماية مطلقة.',
        descEn:
          'Organising family assets through holding companies, waqf and family charters, supporting the transfer of wealth across generations under Sharia and statutory rules — without claiming absolute protection.',
      },
      {
        titleAr: 'إدارة النزاعات المعقدة',
        titleEn: 'Complex Dispute Management',
        descAr:
          'للنزاعات متعددة الأطراف أو الجهات أو الدول: فريق عمل موحد، وخطة نزاع مكتوبة، وتنسيق بين المسارات القضائية والتحكيمية والتفاوضية.',
        descEn:
          'For disputes spanning several parties, authorities or countries: a single team, a written dispute plan, and coordination across litigation, arbitration and negotiation.',
      },
      {
        titleAr: 'الخدمات القانونية الوقائية',
        titleEn: 'Preventive Legal Services',
        descAr:
          'مراجعة دورية للعقود والقرارات والسياسات لرصد المخاطر قبل أن تتحول إلى نزاع، مع تقرير مكتوب بالتوصيات القابلة للتنفيذ.',
        descEn:
          'Periodic review of contracts, decisions and policies to identify risk before it becomes a dispute, with a written report of recommendations.',
      },
      {
        titleAr: 'المنازعات العابرة للحدود',
        titleEn: 'Cross-Border Disputes',
        descAr:
          'معالجة المنازعات ذات العنصر الأجنبي، من اختيار القانون والاختصاص إلى تنفيذ الأحكام، بالتنسيق مع مختصين في الولايات القضائية الأخرى عند الحاجة.',
        descEn:
          'Resolving disputes with a foreign element — from choice of law and forum to enforcement of judgments — coordinating with specialists in other jurisdictions where needed.',
      },
      {
        titleAr: 'الاستشارات القانونية المستمرة',
        titleEn: 'Retained Legal Advisory',
        descAr:
          'اتفاقية خدمة شهرية أو سنوية توفر رأياً قانونياً سريعاً، ومراجعة للعقود، وحضوراً في القرارات المهمة، بكلفة محددة ومعروفة مسبقاً.',
        descEn:
          'A monthly or annual service agreement providing prompt legal opinions, contract review and presence at key decisions, at a cost known in advance.',
      },
    ],

    // Institutional Excellence
    excellenceEyebrowAr: 'لماذا يختارنا العملاء؟',
    excellenceEyebrowEn: 'Why Clients Choose Us',
    excellenceHeadingAr: 'التميز المؤسسي',
    excellenceHeadingEn: 'Institutional Excellence',
    excellenceDescAr:
      'خبرة تمتد لأكثر من عشرين عاماً، ومنهج مكتوب، ورأي صادق، وتواصل مباشر مع من يتولى الملف.',
    excellenceDescEn:
      'More than twenty years of experience, a written method, candid advice and direct contact with the person handling the matter.',
    excellencePillars: [
      {
        titleAr: 'منهجية دراسة القضية',
        titleEn: 'Case Study Method',
        descAr:
          'مذكرة دراسة أولية لكل ملف: الوقائع، والتكييف، والأدلة، والمخاطر، والخيارات المتاحة.',
        descEn:
          'An initial study memo for every matter: facts, characterisation, evidence, risks and options.',
      },
      {
        titleAr: 'إدارة المخاطر',
        titleEn: 'Risk Management',
        descAr:
          'تقييم المخاطر القانونية والمالية والإجرائية لكل مسار قبل اتخاذ القرار الاستراتيجي.',
        descEn:
          'Assessing the legal, financial and procedural risks of each route before a decision is taken.',
      },
      {
        titleAr: 'السرية وحماية البيانات',
        titleEn: 'Confidentiality & Data Protection',
        descAr:
          'التزام صارم بالسر المهني وبنظام حماية البيانات الشخصية (PDPL)، وقصر الاطلاع على الفريق المكلف، وفحص تعارض المصالح قبل قبول التكليف.',
        descEn:
          'Professional secrecy and compliance with the Personal Data Protection Law (PDPL); access limited to the assigned team; conflict checks before any engagement.',
      },
      {
        titleAr: 'معايير التواصل مع العملاء',
        titleEn: 'Client Communication Standards',
        descAr:
          'تحديث دوري بعد كل إجراء، ورد على الاستفسارات في وقت معلوم، ولغة قانونية واضحة يفهمها غير المتخصص.',
        descEn:
          'Regular updates after every step, responses within a known timeframe, and language a non-specialist understands.',
      },
      {
        titleAr: 'جودة الخدمة القانونية',
        titleEn: 'Quality of Legal Service',
        descAr:
          'مراجعة ثانية مستقلة لكل مذكرة وعقد قبل تقديمه، ومتابعة للمواعيد والمهل النظامية عبر سجل موحد.',
        descEn:
          'A second review of every submission and contract before it is filed, and statutory deadlines tracked in a single register.',
      },
    ],

    // Values
    valuesEyebrowAr: 'ركائز العمل',
    valuesEyebrowEn: 'Core Pillars',
    valuesHeadingAr: 'قيمنا الراسخة ومبادئ التمثيل',
    valuesHeadingEn: 'Our Core Values & Principles',
    valuesItems: [
      {
        titleAr: 'المعرفة والتمكين النظامي',
        titleEn: 'Regulatory Depth & Precision',
        descAr:
          'نستند إلى فهم عميق للأنظمة السعودية وأحدث السوابق القضائية لتحقيق أفضل المصالح لعملائنا.',
        descEn:
          "Grounded in deep mastery of Saudi laws and evolving judicial precedents to safeguard our clients' strategic interests.",
      },
      {
        titleAr: 'النزاهة والشفافية',
        titleEn: 'Integrity & Absolute Clarity',
        descAr:
          'وضوح تام منذ اللقاء الأول فيما يتعلق بالفرص، المخاطر، والإطار الزمني والمالي لكل قضية.',
        descEn:
          'Complete transparency from day one regarding risks, realistic outcomes, timelines, and commercial fee structures.',
      },
      {
        titleAr: 'السرية والاحترافية',
        titleEn: 'Confidentiality & Professionalism',
        descAr:
          'نلتزم بأعلى معايير السرية المهنية لحماية بيانات العملاء ووثائقهم ومصالحهم التجارية.',
        descEn:
          'Uncompromising adherence to professional secrecy, safeguarding private data and enterprise trade secrets.',
      },
    ],

    // Client Engagement Journey
    journeyEyebrowAr: 'منهجية العمل',
    journeyEyebrowEn: 'Engagement Model',
    journeyHeadingAr: 'خطوات واضحة، من التواصل إلى المتابعة',
    journeyHeadingEn: 'Clear steps, from first contact to follow-up',
    journeySteps: [
      {
        titleAr: '1. طلب التواصل الأولي',
        titleEn: '1. Initial Inquiry',
        descAr:
          'تقديم تفاصيل عامة عن طلبك من خلال النموذج المعتمد دون إدراج مستندات سرية.',
        descEn:
          'Submit general information regarding your inquiry via the secure form without transmitting sensitive documents.',
      },
      {
        titleAr: '2. الفرز ودراسة الطلب',
        titleEn: '2. Conflict Check & Triage',
        descAr:
          'يقوم فريق العمل بمراجعة الطلب والتأكد من خلوه من تعارض المصالح وتحديد المسار الملائم.',
        descEn:
          'Our team reviews the inquiry to confirm absence of conflicts of interest and determines the suitable practice group.',
      },
      {
        titleAr: '3. الجلسة الاستشارية والاتفاق',
        titleEn: '3. Consultation & Engagement',
        descAr:
          'توضيح نطاق التمثيل والاتعاب عبر اتفاقية مهنية موثقة تحدد التزامات كل طرف بدقة.',
        descEn:
          'We outline representation scope and terms through a formal legal engagement agreement defining exact deliverables.',
      },
      {
        titleAr: '4. المتابعة والإنجاز',
        titleEn: '4. Execution & Regular Updates',
        descAr:
          'إفادة العميل بانتظام بكافة المستجدات والإجراءات المتخذة حتى إنهاء الإجراء المطلوب.',
        descEn:
          'Regular milestone reports and proactive representation until the required legal matter is fully resolved.',
      },
    ],

    // Closing Word & Home CTA
    closingWordEyebrowAr: 'رسالة ختامية',
    closingWordEyebrowEn: 'A Closing Word',
    closingWordAr:
      '«كل ملف يصلنا يحمل حقاً ينتظر من يحسن عرضه، وقراراً ينتظر من يحسن قراءته. نعد عملاءنا برأي صادق، وعمل منظم، وسرية لا تُمس، ومتابعة لا تنقطع حتى يصل الملف إلى نهايته.»',
    closingWordEn:
      '“Every matter that reaches us carries a right waiting to be presented well, and a decision waiting to be read well. We promise our clients candid advice, organised work, inviolable confidentiality, and follow-through that does not stop until the matter is concluded.”',
    closingWordAuthorAr: 'المستشار رياض بن محمد الزهراني',
    closingWordAuthorEn: 'Counselor Riyadh Mohammed Alzahrani',
    closingWordRoleAr: 'الشريك المؤسس والمدير العام',
    closingWordRoleEn: 'Founding & Managing Partner',
    homeCtaHeadingAr: 'تواصل مع فريق الشركة',
    homeCtaHeadingEn: 'Contact the company team',
    homeCtaDescAr:
      'يسعدنا الرد على استفساراتكم وتنسيق جلسة استشارية أولية مع المحامي المختص.',
    homeCtaDescEn:
      'We welcome your inquiry and look forward to coordinating an initial consultation with the specialized legal team.',

    // Section Headers
    servicesSectionEyebrowAr: 'مجالات الاختصاص',
    servicesSectionEyebrowEn: 'Practice Areas',
    servicesSectionHeadingAr: 'خدمات قانونية تلائم احتياجاتك',
    servicesSectionHeadingEn: 'Legal services suited to your needs',
    servicesSectionDescAr:
      'نقدم حلولاً متخصصة مصممة بعناية لتلبية المتطلبات القانونية للأفراد والشركات في شتى القطاعات.',
    servicesSectionDescEn:
      'We deliver tailored legal solutions designed to address the specific complexities encountered by enterprises and individuals.',
    teamSectionEyebrowAr: 'الكفاءات والخبرات',
    teamSectionEyebrowEn: 'Our Advocates',
    teamSectionHeadingAr: 'فريق من المحامين والمستشارين المعتمدين',
    teamSectionHeadingEn: 'Certified Advocates & Specialized Counsel',
    teamSectionDescAr:
      'يضم فريقنا نخبة من المحامين والباحثين القانونيين المؤهلين في القضاء التجاري، المدني، والإداري.',
    teamSectionDescEn:
      'Our team comprises certified advocates and legal researchers admitted before the Saudi commercial and civil courts.',
    insightsSectionEyebrowAr: 'الرأي القانوني والمقالات',
    insightsSectionEyebrowEn: 'Analysis & Briefings',
    insightsSectionHeadingAr: 'أحدث المقالات والرؤى القانونية',
    insightsSectionHeadingEn: 'Latest Legal Insights & Publications',
    insightsSectionDescAr:
      'تحليلات متخصصة في الأنظمة التجارية والاستثمارية والشخصية في المملكة.',
    insightsSectionDescEn:
      'Authoritative analysis on Saudi commercial regulations, foreign investment, and dispute resolution.',
    contactSectionEyebrowAr: 'بدء التواصل',
    contactSectionEyebrowEn: 'Initiate Contact',
    contactSectionHeadingAr: 'تواصل مع فريق الشركة',
    contactSectionHeadingEn: 'Contact the company team',
    contactSectionDescAr:
      'يسعدنا الرد على استفساراتكم وتنسيق جلسة استشارية أولية مع المحامي المختص.',
    contactSectionDescEn:
      'We welcome your inquiry and look forward to coordinating an initial consultation with the specialized legal team.',
    contactDisclaimerAr:
      'إرسال الطلب لا ينشئ علاقة تمثيل قانوني، ولا يعني قبول القضية أو تقديم استشارة مجانية. سيُوضح الفريق الخطوات والشروط ذات الصلة بعد التواصل.',
    contactDisclaimerEn:
      'Submitting this request does not establish legal representation, confirm acceptance of a matter, or include a free consultation. The team will explain the relevant next steps and terms.',

    // Footer
    footerSummaryAr:
      'شركة محاماة واستشارات قانونية مرخصة بالمملكة العربية السعودية، تقدم حلولاً تقوم على المعرفة والالتزام النظامي الصارم.',
    footerSummaryEn:
      'Licensed Saudi law practice and legal advisory providing authoritative counsel grounded in regulatory precision.',
    footerLicenseNoteAr: UNVERIFIED_CLAIMS_CONFIG.enableMojLicenseNumber
      ? `مرخصة ومسجلة بوزارة العدل · ترخيص رقم ${UNVERIFIED_CLAIMS_CONFIG.mojLicenseNumber}`
      : 'مرخصة ومسجلة بوزارة العدل',
    footerLicenseNoteEn: UNVERIFIED_CLAIMS_CONFIG.enableMojLicenseNumber
      ? `Licensed by Saudi Ministry of Justice · No. ${UNVERIFIED_CLAIMS_CONFIG.mojLicenseNumber}`
      : 'Licensed by Saudi Ministry of Justice',
    footerPdplNoticeAr:
      'تخضع كافة البيانات المقدمة لأحكام نظام حماية البيانات الشخصية السعودي (PDPL). إرسال الطلبات لا يعد تمثيلاً قانونياً ما لم يتم توقيع اتفاقية أتعاب معتمدة.',
    footerPdplNoticeEn:
      'All submissions are governed under the Saudi Personal Data Protection Law (PDPL). Submitting an inquiry does not constitute legal representation.',

    // About
    aboutEyebrowAr: 'عن الشركة / الرؤية والمنهجية',
    aboutEyebrowEn: 'About Firm / Vision & Principles',
    aboutTextAr:
      'القضية لا تُقاس بحجم مستنداتها، بل بقوة مركزها القانوني وسلامة بنائها الإجرائي. شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية شركة سعودية مقرها جدة، تخدم الأفراد والأسر والشركات والجهات الاستثمارية في طيف واسع من مجالات القانون.',
    aboutTextEn:
      'A case is measured not by the volume of its documents, but by the strength of its legal position and the soundness of its procedure. Riyadh Mohammed Alzahrani Law Firm & Legal Consultations is a Saudi firm based in Jeddah, serving individuals, families, companies and investment entities.',
    aboutMissionAr:
      'تقديم خدمات قانونية دقيقة وعملية تحمي مصالح الموكل وتمنحه وضوحًا كاملًا في كل مرحلة، مع الالتزام بأعلى معايير النزاهة والسرية.',
    aboutMissionEn:
      'To deliver precise, practical legal services that safeguard the client’s interests and afford complete clarity at every stage, adhering to the highest standards of integrity and confidentiality.',
    aboutVisionAr:
      'أن نكون المرجع القانوني الموثوق للأفراد والأسر والشركات في المملكة، بمنهج يجمع العمق النظامي والرؤية الاستراتيجية والالتزام المهني.',
    aboutVisionEn:
      'To be the trusted legal reference for individuals, families and companies in the Kingdom — with a method that unites legal depth, strategic vision and professional commitment.',
    aboutAccreditationTitleAr: 'الترخيص والاعتماد النظامي',
    aboutAccreditationTitleEn: 'Official Licensing & Accreditation',
    aboutAccreditationDescAr:
      'تمارس الشركة أعمالها بموجب تراخيص رسمية معتمدة من وزارة العدل بالمملكة العربية السعودية، وعضوية الهيئة السعودية للمحامين.',
    aboutAccreditationDescEn:
      'The practice operates under formal accreditation from the Saudi Ministry of Justice and membership in the Saudi Bar Association.',
    aboutPillarsHeadingAr: 'منهجيتنا في تقديم الحلول القانونية',
    aboutPillarsHeadingEn: 'Our Legal Advisory Framework',
    aboutPillars: [
      {
        num: '01',
        titleAr: 'الفهم العميق لبيئة الأعمال',
        titleEn: 'Commercial Context Mastery',
        descAr:
          'دراسة واقع السوق السعودي واللوائح التنفيذية الصادرة عن الهيئات الحكومية لضمان جدوى المشورة نظامياً وتجارياً.',
        descEn:
          'Mastery of Saudi market realpolitik and ministerial bylaws ensures practical, commercially viable legal outcomes.',
      },
      {
        num: '02',
        titleAr: 'الوضوح والشفافية',
        titleEn: 'Objective Clarity',
        descAr:
          'تقديم تقييم موضوعي وصادق للموقف القضائي أو التعاقدي دون إعطاء وعود غير واقعية أو ضمانات وهمية.',
        descEn:
          'Delivering unvarnished risk assessments without hyperbolic promises or unfounded guarantees of court outcomes.',
      },
      {
        num: '03',
        titleAr: 'الاستدامة والوقاية النظامية',
        titleEn: 'Regulatory Prevention',
        descAr:
          'صياغة العقود ولوائح الحوكمة بطريقة وقائية تحمي المنشأة من نشوء النزاعات المستقبلية وتقلل مخاطر التقاضي.',
        descEn:
          'Drafting preemptive charters and agreements designed to inoculate enterprises against protracted litigation.',
      },
    ],

    // Legal Pages (Terms & Privacy)
    termsEyebrowAr: 'الضوابط النظامية',
    termsEyebrowEn: 'Legal Terms',
    termsTitleAr: 'الشروط والأحكام العامة للموقع',
    termsTitleEn: 'Website Terms of Use & Disclaimer',
    termsUpdatedAr: 'آخر تحديث: 12 نوفمبر 2026',
    termsUpdatedEn: 'Last Updated: 12 November 2026',
    termsSections: [
      {
        titleAr: '1. عدم قيام علاقة التوكيل أو التمثيل القانوني',
        titleEn: '1. No Attorney-Client Relationship Established',
        bodyAr:
          'إن تصفح هذا الموقع الإلكتروني، أو إرسال استفسار عبر نموذج التواصل، أو تبادل الرسائل عبر القنوات الموضحة لا يُنشئ بأي حال من الأحوال علاقة توكيل أو تمثيل قانوني بينك وبين شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية. لا تنشأ هذه العلاقة إلا بعد إتمام الفحص النظامي لتعارض المصالح وتوقيع اتفاقية أتعاب رسمية معتمدة من الطرفين.',
        bodyEn:
          'Visiting this website, submitting an inquiry, or communicating through listed channels does not create an attorney-client relationship. Representation commences only after completing formal conflict checks and executing a signed written engagement agreement.',
      },
      {
        titleAr: '2. إخلاء المسؤولية عن المحتوى الإرشادي',
        titleEn: '2. General Information Disclaimer',
        bodyAr:
          'تُقدّم المقالات والتحليلات والمعلومات المنشورة في الموقع لأغراض التوعية العامة فقط. ولا تُعد بديلاً عن استشارة قانونية مهنية تراعي وقائع ومستندات كل حالة على حدة. تخلي الشركة مسؤوليتها عن أي تصرف أو قرار يُتخذ بناءً على المحتوى العام للموقع.',
        bodyEn:
          'Articles, legal insights, and website content are provided for general educational purposes and do not constitute specific legal counsel tailored to your circumstances. The firm disclaims all liability for decisions made solely based on general web content.',
      },
      {
        titleAr: '3. حقوق الملكية الفكرية',
        titleEn: '3. Intellectual Property Rights',
        bodyAr: `كافة النصوص، التصاميم، الشعارات، والمقالات المنشورة في هذا الموقع مملوكة حصراً لـ ${FIRM_DETAILS.nameAr}، ومحمية بموجب أنظمة حماية حقوق المؤلف وحقوق الملكية الفكرية في المملكة العربية السعودية.`,
        bodyEn: `All written materials, design tokens, trademarks, and articles on this platform are the intellectual property of ${FIRM_DETAILS.nameEn} and protected under Saudi copyright statutes.`,
      },
      {
        titleAr: '4. الاختصاص القضائي والنظام الحاكم',
        titleEn: '4. Governing Law & Jurisdiction',
        bodyAr: `تخضع هذه الشروط والأحكام وتُفسر وفقاً للأنظمة المعمول بها في المملكة العربية السعودية، وتختص المحاكم السعودية بمدينة ${FIRM_DETAILS.cityAr} بالفصل في أي نزاع قد ينشأ عنها.`,
        bodyEn: `These terms are governed by the laws and regulations of the Kingdom of Saudi Arabia, and any disputes shall be adjudicated before the competent courts of ${FIRM_DETAILS.cityEn}.`,
      },
    ],
    privacyEyebrowAr: 'الامتثال النظامي',
    privacyEyebrowEn: 'Regulatory Compliance',
    privacyTitleAr: 'إشعار الخصوصية وحماية البيانات الشخصية (PDPL)',
    privacyTitleEn: 'Privacy Notice & Data Protection Policy (PDPL)',
    privacyIntroAr:
      'مُعدّ وفقاً لنظام حماية البيانات الشخصية الصادر بالمرسوم الملكي رقم (م/19) ولائحته التنفيذية بالمملكة العربية السعودية.',
    privacyIntroEn:
      'Formulated in accordance with the Saudi Personal Data Protection Law (Royal Decree No. M/19) and Executive Regulations.',
    privacySections: [
      {
        titleAr: '1. جهة التحكم في البيانات',
        titleEn: '1. Data Controller Identity',
        bodyAr: `تُعد ${FIRM_DETAILS.nameAr}، ومقرها مدينة ${FIRM_DETAILS.cityAr} بالمملكة العربية السعودية، هي "جهة التحكم" المسؤولة عن معالجة بياناتك الشخصية التي تُجمع عبر هذا الموقع الإلكتروني.`,
        bodyEn: `${FIRM_DETAILS.nameEn}, headquartered in ${FIRM_DETAILS.cityEn}, Kingdom of Saudi Arabia, acts as the designated Data Controller responsible for processing personal data submitted across this website.`,
      },
      {
        titleAr: '2. فئات البيانات الشخصية التي نجمعها',
        titleEn: '2. Categories of Personal Data Collected',
        bodyAr:
          'بيانات الهوية والتواصل (الاسم الكامل، رقم الجوال بصيغة E.164 الدولية، والبريد الإلكتروني)، البيانات التجارية للمنشآت، موضوع الاستشارة العامة، والبيانات التقنية الأمنية (بصمة الشبكة وتوقيت الإرسال لمنع الهجمات الإلكترونية).',
        bodyEn:
          'Identity & Contact Data (full name, international E.164 phone number, email address), Commercial Data (company name and representative title), Inquiry Scope, and Technical Security Telemetry for DDoS prevention.',
      },
      {
        titleAr: '3. الغرض والمسوغ النظامي للمعالجة',
        titleEn: '3. Purpose & Lawful Basis of Processing',
        bodyAr:
          'تُعالج البيانات الشخصية استناداً إلى موافقتك الصريحة عند تقديم الطلب، ولغرض التحقق المبدئي من خلو التمثيل من تعارض المصالح وفق لوائح الهيئة السعودية للمحامين، والرد على استفسارك وتنسيق الموعد الاستشاري.',
        bodyEn:
          'Personal data is processed based upon your explicit consent and legitimate interests to conduct pre-engagement conflict-of-interest checks and coordinate initial legal consultations.',
      },
      {
        titleAr: '4. معالجة البيانات ونقلها عبر الحدود',
        titleEn: '4. Processing & Cross-Border Data Transfer Safeguards',
        bodyAr:
          'تلتزم الشركة بضوابط نقل البيانات الشخصية خارج المملكة الصادرة عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا). تُحفظ قواعد البيانات في خوادم سحابية آمنة، ولا يتم تمرير مستندات القضايا السرية عبر خوادم عامة غير مشفرة.',
        bodyEn:
          'The firm strictly adheres to Cross-Border Data Transfer Regulations issued by SDAIA. Database repositories are provisioned within approved secure cloud infrastructure.',
      },
      {
        titleAr: '5. حقوق صاحب البيانات الشخصية',
        titleEn: '5. Data Subject Rights Under Saudi PDPL',
        bodyAr:
          'بموجب نظام حماية البيانات الشخصية، يحق لك: العلم بمسوغ المعالجة، الوصول إلى بياناتك الشخصية وطلب نسخة منها، طلب تصحيحها أو تحديثها، وطلب إتلافها متى ما انتهى الغرض من جمعها ما لم يُلزمنا النظام بحفظها لمدد نظامية محددة.',
        bodyEn:
          'Under the Saudi PDPL, you hold the right to be informed, access and request copies of your personal data, rectify inaccuracies, and request destruction when the processing purpose concludes.',
      },
      {
        titleAr: '6. التواصل بشأن حماية البيانات',
        titleEn: '6. Privacy Inquiries & Data Protection Contact',
        bodyAr: `لممارسة حقوقك أو لتقديم أي استفسار حول سياسة الخصوصية، يرجى مراسلة مسؤول حماية البيانات عبر البريد: ${FIRM_DETAILS.email}`,
        bodyEn: `To exercise your statutory rights or submit a privacy inquiry, contact our Data Protection Officer at: ${FIRM_DETAILS.email}`,
      },
    ],

    // Moyasar payment settings
    paymentEnabled: process.env.PAYMENTS_ENABLED === 'true',
    paymentRequirement: 'optional',
    consultationFee: 500,
    consultationCurrency: 'SAR',
    applePayEnabled: false,
    paymentNoticeAr: 'رسوم حجز الاستشارة تُحسم من أتعاب القضية أو العقد في حال التوكيل الرسمي.',
    paymentNoticeEn:
      'The initial consultation fee is deductible from overall legal representation fees upon retainer engagement.',
  };
}

export function buildSeedAdmins(): AdminUser[] {
  const defaultPasswordHash = hashPassword(
    process.env.ADMIN_INITIAL_PASSWORD || 'RMA@Legal2026!'
  );
  return [
    {
      uid: 'admin-rma-01',
      email: 'admin@rma-law.sa',
      displayName: 'Riyadh Alzahrani',
      role: 'super_admin',
      isActive: true,
      mfaEnrolled: true,
      passwordHash: defaultPasswordHash,
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
      passwordHash: defaultPasswordHash,
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
      passwordHash: defaultPasswordHash,
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
      passwordHash: defaultPasswordHash,
      createdAt: '2026-11-12T12:00:00Z',
      updatedAt: '2026-11-12T12:00:00Z',
    },
  ];
}

export function buildSeedServices(): ServiceDocument[] {
  return PRACTICE_AREAS_SERVICES.map((svc) => {
    const arRev = PRACTICE_AREAS_SERVICE_REVISIONS[svc.locales.ar.draftRevisionId];
    const enRev = PRACTICE_AREAS_SERVICE_REVISIONS[svc.locales.en.draftRevisionId];
    const revisions: Record<string, any> = {};
    if (arRev) revisions[arRev.id] = arRev;
    if (enRev) revisions[enRev.id] = enRev;

    return {
      ...svc,
      isPublished: Boolean(
        svc.locales.ar.publishedRevisionId && svc.locales.en.publishedRevisionId
      ),
      revisions,
    };
  });
}

export function buildSeedTeamMembers(): TeamMemberDocument[] {
  const members: TeamMemberDocument[] = [
    {
      id: 'riyadh-alzahrani',
      schemaVersion: 1,
      version: 1,
      sortOrder: 1,
      relatedServiceIds: ['commercial-corporate', 'arbitration-mediation', 'foreign-investment'],
      createdAt: '2026-11-12T10:00:00Z',
      updatedAt: '2026-11-12T10:00:00Z',
      createdBy: 'admin-rma-01',
      updatedBy: 'admin-rma-01',
      isPublished: true,
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
      revisions: {
        'rev-tm-ra-ar': {
          id: 'rev-tm-ra-ar',
          entityId: 'riyadh-alzahrani',
          schemaVersion: 1,
          locale: 'ar',
          title: 'المستشار رياض بن محمد الزهراني',
          slug: 'riyadh-alzahrani',
          summary:
            'الشريك المؤسس والمدير العام - محامٍ ومستشار قانوني بخبرة تتجاوز 20 عاماً في التقاضي والتحكيم والصياغة النظامية.',
          fullName: 'المستشار رياض بن محمد الزهراني',
          positionTitle: 'الشريك المؤسس والمدير العام',
          practiceAreas: [
            'التقاضي والتحكيم التجاري الدولي',
            'صياغة العقود والاتفاقيات',
            'حوكمة الشركات',
            'الأوقاف والتركات والتمويل الإسلامي',
          ],
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
              data: {
                text: 'يمتلك المستشار رياض الزهراني خبرة رصينة تمتد لأكثر من عقدين في قيادة مذكرات التقاضي التجاري المعقد، وإدارة ملفات التحكيم المؤسسي والحر، وصياغة العقود الاستثمارية وحوكمة الكيانات التجارية العائلية في المملكة العربية السعودية.',
              },
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
          summary:
            'Founding & Managing Partner - Advocate & Legal Consultant with 20+ years of experience in litigation, arbitration and legislative drafting.',
          fullName: 'Counselor Riyadh M. Alzahrani',
          positionTitle: 'Founding & Managing Partner',
          practiceAreas: [
            'International Commercial Arbitration',
            'Contract Drafting',
            'Corporate Governance',
            'Waqf, Estates & Islamic Finance',
          ],
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
              data: {
                text: 'Counselor Riyadh Alzahrani brings over two decades of authoritative experience advising corporate boards, handling complex commercial disputes, conducting arbitral proceedings, and establishing sound governance structures across Saudi Arabia.',
              },
            },
          ],
          seo: {
            title: 'Counselor Riyadh M. Alzahrani',
            description:
              'Professional profile of Founding & Managing Partner Counselor Riyadh M. Alzahrani.',
          },
          approvalEvidenceRefs: ['MOJ-LICENSE-VERIFIED', 'AUTH-BOOK-COMMERCIAL-LAW'],
          createdBy: 'admin-rma-01',
          createdAt: '2026-11-12T10:00:00Z',
        },
      },
    },
  ];

  if (UNVERIFIED_CLAIMS_CONFIG.enableUnconfirmedTeamMembers) {
    members.push({
      id: 'senior-counsel',
      schemaVersion: 1,
      version: 1,
      sortOrder: 2,
      relatedServiceIds: ['commercial-corporate', 'estate-disputes', 'labour-employment'],
      createdAt: '2026-11-12T10:00:00Z',
      updatedAt: '2026-11-12T10:00:00Z',
      createdBy: 'admin-rma-01',
      updatedBy: 'admin-rma-01',
      isPublished: true,
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
      revisions: {
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
              data: {
                text: 'يقود المستشار عبد الرحمن العتيبي قسم المنازعات والتحكيم مع تركيز خاص على صياغة الحلول التوافقية وقسمة التركات الكبرى.',
              },
            },
          ],
          seo: {
            title: 'د. عبد الرحمن العتيبي',
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
              data: {
                text: 'Dr. Al-Otaibi oversees arbitration mandates and estate divisions, providing insightful analysis under Saudi judicial frameworks.',
              },
            },
          ],
          seo: {
            title: 'Dr. Abdulrahman Al-Otaibi',
            description: 'Professional profile of Senior Counsel Dr. Abdulrahman Al-Otaibi.',
          },
          approvalEvidenceRefs: ['CERT-ARB-VERIFIED'],
          createdBy: 'admin-rma-01',
          createdAt: '2026-11-12T10:00:00Z',
        },
      },
    });
  }

  return members;
}

export function buildSeedArticles(): ArticleDocument[] {
  return [
    {
      id: 'new-saudi-companies-law',
      schemaVersion: 1,
      version: 1,
      categoryIds: ['corporate-law'],
      authorTeamMemberId: 'riyadh-alzahrani',
      relatedServiceIds: ['commercial-corporate', 'legal-advisory-governance'],
      publishedAt: '2026-11-10T08:00:00Z',
      createdAt: '2026-11-10T08:00:00Z',
      updatedAt: '2026-11-10T08:00:00Z',
      createdBy: 'admin-rma-01',
      updatedBy: 'admin-rma-01',
      isPublished: true,
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
      revisions: {
        'rev-art-cl-ar': {
          id: 'rev-art-cl-ar',
          entityId: 'new-saudi-companies-law',
          schemaVersion: 1,
          locale: 'ar',
          title: 'الأبعاد الإستراتيجية لنظام الشركات السعودي الجديد',
          slug: 'new-saudi-companies-law',
          summary:
            'قراءة تحليلية عامة في أبرز التحولات التشريعية التي استحدثها نظام الشركات السعودي الصادر بالمرسوم الملكي رقم (م/132)، ولا سيما في تنظيم الشركات العائلية واستحداث شركة المساهمة المبسطة وتعزيز مبادئ الحوكمة المؤسسية.',
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
                text: 'من أبرز المستجدات التي جاء بها النظام إتاحة تأسيس "شركة المساهمة المبسطة" لتلبية احتياجات رواد الأعمال والمشاريع الناشئة وصناديق الاستثمار. فقد استبعد النظام في هذا الكيان اشتراط الحد الأدنى لرأس المال، وسمح بأن تتولى إدارتها شخصية واحدة أو أكثر وفق نظامها الأساس دون إلزام بتشكيل مجلس إدارة تقليدي، مع تمكين الشركاء من استحداث فئات متعددة من الأسهم تتفاوت في حقوق التصويت وتوزيع الأرباح والأولوية عند التصفية.',
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
                text: 'أولى النظام عناية خاصة لاستدامة الشركات العائلية التي تشكل ركيزة أساسية في الاقتصاد الوطني، حيث أجاز تضمين عقد التأسيس أو نظام الشركة الأساس أحكاماً مقتبسة من "الميثاق العائلي"، بما يكفل إضفاء الصفة الإلزامية على قواعد ملكية الحصص أو الأسهم، وضوابط تداولها بين أفراد الأسرة.',
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
                text: 'رسّخ النظام منظومة صريحة من واجبات المديرين وأعضاء مجالس الإدارة، في مقدمتها واجب العناية والالتزام بأحكام النظام وعقد التأسيس، وواجب الولاء وتجنب حالات تعارض المصالح، والالتزام بالإفصاح المسبق عن أي مصلحة مباشرة أو غير مباشرة.',
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
                text: 'تنبيه معرفي عام: تتناول هذه المادة المبادئ العامة لنظام الشركات السعودي ولوائحه التنفيذية لأغراض التوعية القانونية العامة فحسب، ولا تشكل رأياً قانونياً مخصصاً لأي واقعة أو كيان بعينه.',
              },
            },
          ],
          seo: {
            title: 'الأبعاد الإستراتيجية لنظام الشركات السعودي الجديد',
            description:
              'تحليل عام لأبرز أحكام نظام الشركات السعودي الجديد في حوكمة الشركات العائلية، شركة المساهمة المبسطة، وواجبات الإدارة.',
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
          summary:
            'A general analytical overview of key statutory developments under the Saudi Companies Law (Royal Decree No. M/132), highlighting simplified joint-stock entities, family governance charters, and fiduciary accountability.',
          readingTimeMinutes: 4,
          blocks: [
            {
              id: 'b1',
              type: 'paragraph',
              data: {
                text: 'The Saudi Companies Law enacted by Royal Decree No. (M/132) dated 1/12/1443H marks a foundational modernisation of the Kingdom’s commercial legislative framework. Consolidating commercial, non-profit, and professional companies into a single unified statute, the law streamlines incorporation rules and equips enterprises with flexible governance tools.',
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
                text: 'A central innovation of the statute is the Simplified Joint-Stock Company (SJSC), designed to serve venture capital investments, startups, and agile holding vehicles with flexible share classes and management structures.',
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
                text: 'Recognising the vital role of family enterprises across the Saudi economy, the law expressly allows companies to incorporate binding provisions derived from a Family Charter directly into their articles of association or bylaws.',
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
                text: 'General Educational Notice: This article outlines general principles of the Saudi Companies Law and its implementing regulations for informational purposes only and does not constitute tailored legal advice.',
              },
            },
          ],
          seo: {
            title: 'Strategic Dimensions of the New Saudi Companies Law',
            description:
              'General overview of corporate reforms under the Saudi Companies Law: simplified joint-stock companies, family charters, and fiduciary duties.',
          },
          approvalEvidenceRefs: [],
          createdBy: 'admin-rma-01',
          createdAt: '2026-11-10T08:00:00Z',
        },
      },
    },
  ];
}

export function buildSeedInquiries(): ContactRequest[] {
  return [
    {
      id: 'INQ-2026-001',
      audience: 'business',
      name: 'عبدالله السعدون',
      companyName: 'شركة السعدون القابضة',
      phoneE164: '+966501234567',
      email: FIRM_DETAILS.email,
      serviceId: 'commercial-corporate',
      message:
        'نود مراجعة لوائح الحوكمة وإعادة هيكلة الشركات التابعة لمجموعتنا وفق نظام الشركات الجديد.',
      locale: 'ar',
      status: 'new',
      noticeVersion: '1.0',
      acknowledgedAt: '2026-11-12T14:30:00Z',
      retentionClass: 'INQUIRY_ACTIVE',
      notes: [],
      createdAt: '2026-11-12T14:30:00Z',
      updatedAt: '2026-11-12T14:30:00Z',
    },
  ];
}

export function buildSeedConsultations(): ConsultationRequest[] {
  return [
    {
      id: 'CR-2026-001',
      reference: 'CR-2026-001',
      fullName: 'سلطان بن عبدالعزيز التميمي',
      phone: FIRM_DETAILS.phone,
      serviceId: 'commercial-corporate',
      serviceLabelSnapshot: {
        ar: 'القضايا التجارية والشركات',
        en: 'Commercial & Corporate Law',
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
      sourcePage: '/ar/services/commercial-corporate',
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
    },
    {
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
      assignedLawyerId: 'riyadh-alzahrani',
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
          details: { assignedLawyer: 'riyadh-alzahrani', scheduledAt: '2026-11-18T11:00:00Z' },
          timestamp: '2026-11-13T11:00:00Z',
        },
      ],
      createdAt: '2026-11-13T09:00:00Z',
      updatedAt: '2026-11-13T11:00:00Z',
      updatedBy: 'admin@rma-law.sa',
    },
  ];
}

export function buildSeedPaymentRequests(): PaymentRequest[] {
  const sampleToken1 = deriveSamplePaymentToken('PR-2026-0001');
  const sampleToken2 = deriveSamplePaymentToken('PR-2026-0002');
  const paidAtSample = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'PR-2026-0001',
      token: sampleToken1,
      clientName: 'شركة الأفق للاستثمار العقاري',
      clientPhone: '+966501234567',
      serviceCategory: 'دراسة نزاع عقاري وإعداد مذكرة دفاع',
      amountSar: 3500,
      amountMinor: 350000,
      currency: 'SAR',
      description: 'أتعاب دراسة ملف النزاع العقاري وتجهيز المذكرة الإجرائية',
      status: 'unpaid',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'عميل محال من الإدارة - نزاع مشروع شمال جدة',
    },
    {
      id: 'PR-2026-0002',
      token: sampleToken2,
      clientName: 'مؤسسة التوريدات الخليجية',
      clientPhone: '+966559876543',
      serviceCategory: 'مراجعة وتدقيق اتفاقية امتياز تجاري',
      amountSar: 2000,
      amountMinor: 200000,
      currency: 'SAR',
      description: 'أتعاب التدقيق النظامي لاتفاقية الامتياز واللوائح التنفيذية',
      status: 'paid',
      moyasarPaymentId: 'pay_sample_test_998124',
      paymentMethod: 'mada',
      payerName: 'مؤسسة التوريدات الخليجية',
      paidAt: paidAtSample,
      receipt: {
        reference: 'PR-2026-0002',
        moyasarPaymentId: 'pay_sample_test_998124',
        amountSar: 2000,
        amountMinor: 200000,
        currency: 'SAR',
        paidAt: paidAtSample,
        payerName: 'مؤسسة التوريدات الخليجية',
        paymentMethod: 'mada',
      },
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      notes: 'تم السداد بنجاح عبر بوابة ميسّر (مدى)',
    },
  ];
}
