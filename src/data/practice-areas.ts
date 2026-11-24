/**
 * 16 Official Practice Areas
 * Single Source of Truth: "Riyadh AlZahrani Royal Bilingual Corporate Profile" (PDF)
 * Pages 16 through 47.
 */

export interface PracticeAreaStep {
  step: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface PracticeArea {
  id: string; // canonical slug
  sortOrder: number;
  titleAr: string;
  titleEn: string;
  audiences: ('individual' | 'business')[];
  iconName: string;
  leadAxiomAr: string;
  leadAxiomEn: string;
  problemsAddressedAr: string[];
  problemsAddressedEn: string[];
  scopeOfServicesAr: string[];
  scopeOfServicesEn: string[];
  methodologySteps: PracticeAreaStep[];
  valueToClientAr: string;
  valueToClientEn: string;
}

export const PRACTICE_AREAS: PracticeArea[] = [
  {
    "id": "criminal-litigation",
    "sortOrder": 1,
    "titleAr": "القضايا الجنائية والدفاع الجزائي",
    "titleEn": "Criminal Litigation & Defence",
    "audiences": [
      "individual"
    ],
    "iconName": "Shield",
    "leadAxiomAr": "في الدعوى الجزائية لا يقتصر الدفاع على نفي التهمة، بل يبدأ من التحقق من مشروعية كل دليل وسلامة كل إجراء؛ فضمانات المحاكمة العادلة هي الأساس الذي يُبنى عليه أي دفاع رصين.",
    "leadAxiomEn": "In criminal proceedings, a defence does not end at denying the charge; it begins by testing the legality of every piece of evidence and the integrity of every procedural step. The guarantees of a fair trial are the foundation of any sound defence.",
    "problemsAddressedAr": [
      "الجرائم المالية والاقتصادية",
      "الاحتيال وخيانة الأمانة",
      "الجرائم المعلوماتية",
      "قضايا المخدرات",
      "غسل الأموال",
      "التستر التجاري"
    ],
    "problemsAddressedEn": [
      "Financial & economic crime",
      "Fraud & breach of trust",
      "Cybercrime",
      "Narcotics cases",
      "Money laundering",
      "Commercial concealment (tasattur)"
    ],
    "scopeOfServicesAr": [
      "دراسة الاتهامات والأدلة الجنائية",
      "تحليل سلامة القبض والتفتيش والإجراءات",
      "دراسة حجية الاعترافات والإقرارات",
      "إعداد الدفوع والمذكرات",
      "التمثيل في مراحل الدعوى الجزائية وفق الصلاحيات النظامية",
      "المطالبة بالحق الخاص الناشئ عن الجريمة"
    ],
    "scopeOfServicesEn": [
      "Review of charges and criminal evidence",
      "Analysis of the lawfulness of arrest, search and procedure",
      "Assessment of the admissibility of confessions and admissions",
      "Preparation of defences and memoranda",
      "Representation at each stage of proceedings, within statutory authority",
      "Pursuit of private rights arising from the offence"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "قراءة الاتهام والأدلة",
        "titleEn": "Reading the Charge",
        "descriptionAr": "تحليل وصف التهمة وأركانها ومطابقتها مع الأدلة.",
        "descriptionEn": "Analysing the charge and its elements against the evidence."
      },
      {
        "step": 2,
        "titleAr": "فحص المشروعية",
        "titleEn": "Testing Legality",
        "descriptionAr": "مراجعة القبض والتفتيش والتحقيق وفق نظام الإجراءات الجزائية.",
        "descriptionEn": "Reviewing arrest, search and investigation under the Law of Criminal Procedure."
      },
      {
        "step": 3,
        "titleAr": "بناء الدفاع",
        "titleEn": "Building the Defence",
        "descriptionAr": "صياغة الدفوع الشكلية والموضوعية بلغة دقيقة ومسندة.",
        "descriptionEn": "Drafting procedural and substantive defences with precision."
      },
      {
        "step": 4,
        "titleAr": "المتابعة",
        "titleEn": "Follow-through",
        "descriptionAr": "الحضور والمتابعة في مراحل الدعوى بحسب الصلاحيات.",
        "descriptionEn": "Attendance and follow-up at each stage, within statutory authority."
      }
    ],
    "valueToClientAr": "دفاع منهجي يحمي حقوق الموكل في كل مرحلة، ويقرأ الأدلة قبل أن تتحول إلى مرافعة.",
    "valueToClientEn": "A methodical defence that protects the client’s rights at every stage — and reads the evidence before it becomes a pleading."
  },
  {
    "id": "civil-litigation",
    "sortOrder": 2,
    "titleAr": "القضايا المدنية والتعويضات",
    "titleEn": "Civil Litigation & Compensation",
    "audiences": [
      "individual",
      "business"
    ],
    "iconName": "Scale",
    "leadAxiomAr": "تقوم الدعوى المدنية على ثلاثة أركان: حق ثابت، وضرر محقق، وعلاقة سببية بينهما. نبني المطالبة أو الدفاع على تكييف دقيق للعلاقة وفق نظام المعاملات المدنية، وعلى إثبات منظم يسبق المرافعة.",
    "leadAxiomEn": "A civil claim rests on three pillars: an established right, actual harm, and a causal link between them. We build each claim or defence on a precise characterisation of the relationship under the Civil Transactions Law, and on organised proof that precedes advocacy.",
    "problemsAddressedAr": [
      "منازعات العقود والإخلال بالالتزامات",
      "مطالبات التعويض عن الضرر المادي والمعنوي",
      "قضايا الملكية والحيازة والمنازعات العقارية المدنية",
      "المنازعات المالية بين الأفراد",
      "دعاوى المسؤولية التقصيرية والمهنية",
      "إثبات الالتزامات ونفيها"
    ],
    "problemsAddressedEn": [
      "Contract disputes and breach of obligations",
      "Claims for material and moral compensation",
      "Property, possession and civil real estate disputes",
      "Financial disputes between individuals",
      "Tort and professional liability claims",
      "Establishing and rebutting obligations"
    ],
    "scopeOfServicesAr": [
      "دراسة الالتزامات العقدية وغير العقدية",
      "تكييف الوقائع وفق نظام المعاملات المدنية",
      "حصر الأضرار وتقدير التعويض المطالب به",
      "إعداد لوائح الدعوى والمذكرات الجوابية",
      "التمثيل أمام المحاكم المدنية بكافة درجاتها",
      "التفاوض للوصول إلى تسوية ودية متى كانت في مصلحة الموكل"
    ],
    "scopeOfServicesEn": [
      "Review of contractual and non-contractual obligations",
      "Characterising the facts under the Civil Transactions Law",
      "Assessing damage and quantifying compensation claimed",
      "Drafting statements of claim and defence submissions",
      "Representation before the civil courts across all tiers",
      "Negotiation toward an amicable settlement where it serves the client’s interest"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "تكييف العلاقة",
        "titleEn": "Characterising the Right",
        "descriptionAr": "تحديد الأساس النظامي للحق: عقدي، أم تقصيري، أم ناشئ عن نص نظامي.",
        "descriptionEn": "Determining the statutory basis of the right: contractual, tortious, or under statute."
      },
      {
        "step": 2,
        "titleAr": "بناء الإثبات",
        "titleEn": "Organising the Proof",
        "descriptionAr": "حصر الأدلة والمستندات وربط كل واقعة بما يثبتها في جدول إثبات واضح.",
        "descriptionEn": "Gathering documents and linking each fact to proof in a clear schedule."
      },
      {
        "step": 3,
        "titleAr": "تقدير الضرر",
        "titleEn": "Assessing the Damage",
        "descriptionAr": "حساب التعويض وفق القواعد المعتمدة وبما يتناسب مع الضرر الفعلي والمتحقق.",
        "descriptionEn": "Calculating compensation under established rules, reflecting actual loss."
      },
      {
        "step": 4,
        "titleAr": "المرافعة أو التسوية",
        "titleEn": "Advocacy or Settlement",
        "descriptionAr": "المضي في المسار القضائي بحزم، مع إبقاء باب التفاوض مفتوحًا إذا تحققت المصلحة.",
        "descriptionEn": "Pursuing the court claim firmly, keeping negotiation open where in the client’s interest."
      }
    ],
    "valueToClientAr": "مطالبة محسوبة، مبنية على إثبات منظم وتقدير واقعي للتعويض.",
    "valueToClientEn": "Calculated claims, built on organised evidence and a realistic assessment of compensation."
  },
  {
    "id": "family-law",
    "sortOrder": 3,
    "titleAr": "الأحوال الشخصية وقضايا الأسرة",
    "titleEn": "Family & Personal Status Law",
    "audiences": [
      "individual"
    ],
    "iconName": "Users",
    "leadAxiomAr": "تتطلب قضايا الأسرة خبرة نظامية وحسًّا إنسانيًّا في آن واحد. نتعامل معها وفق نظام الأحوال الشخصية بسرية تامة، ونقدّم مصلحة الأطفال واستقرار الأسرة، ونسعى إلى التسوية متى كانت ممكنة وعادلة.",
    "leadAxiomEn": "Family matters call for legal expertise and human judgement in equal measure. We handle them under the Personal Status Law in complete confidence, placing the interests of children and the family’s stability first, and seeking settlement wherever feasible and fair.",
    "problemsAddressedAr": [
      "دعاوى فسخ النكاح والخلع والطلاق",
      "حضانة الأطفال والزيارة والنفقة بأنواعها",
      "إثبات النسب والولاية والوصاية والعضل",
      "قسمة الأموال المشتركة بين الزوجين",
      "تنظيم الحقوق الأسرية باتفاقيات موثقة",
      "تنفيذ الأحكام الأسرية ومتابعتها"
    ],
    "problemsAddressedEn": [
      "Divorce, khula and dissolution claims",
      "Child custody, visitation and maintenance in all forms",
      "Parentage, guardianship, custodianship and adhl",
      "Division of joint spousal property",
      "Documented agreements on family rights",
      "Enforcement and follow-up of family rulings"
    ],
    "scopeOfServicesAr": [
      "تقديم الاستشارات القانونية في ضوء نظام الأحوال الشخصية",
      "صياغة اتفاقيات الصلح والتسوية الأسرية وتوثيقها",
      "إعداد لوائح الدعوى والمذكرات الجوابية",
      "التمثيل والترافع أمام محاكم الأحوال الشخصية",
      "متابعة إجراءات محاكم التنفيذ فيما يخص الأحكام الأسرية",
      "دراسة الجوانب المالية المترتبة على إنهاء العلاقة الزوجية"
    ],
    "scopeOfServicesEn": [
      "Legal advice under the Personal Status Law",
      "Drafting and notarising family reconciliation agreements",
      "Drafting claims and defence submissions",
      "Representation before family courts",
      "Follow-up with enforcement courts on family rulings",
      "Review of financial matters arising from dissolution"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "الاستماع والتوجيه",
        "titleEn": "Listening & Orientation",
        "descriptionAr": "فهم الموقف الأسري بكامل تفاصيله وتقديم قراءة هادئة للحقوق والواجبات.",
        "descriptionEn": "Understanding the family context in full, offering a calm reading of rights and obligations."
      },
      {
        "step": 2,
        "titleAr": "أولوية الصلح",
        "titleEn": "Prioritising Settlement",
        "descriptionAr": "استنفاد فرص التسوية الرضائية التي تحفظ العلاقات وتختصر النزاع.",
        "descriptionEn": "Exhausting opportunities for amicable settlement that preserve relations and narrow disputes."
      },
      {
        "step": 3,
        "titleAr": "المرافعة الرصينة",
        "titleEn": "Dignified Advocacy",
        "descriptionAr": "إذا تعذر الصلح، نرفع الدعوى بحرفية وبما يصون الكرامة ويحمي الحقوق.",
        "descriptionEn": "Where settlement is not reached, advancing the claim professionally, preserving dignity and protecting rights."
      },
      {
        "step": 4,
        "titleAr": "التنفيذ الهادئ",
        "titleEn": "Measured Enforcement",
        "descriptionAr": "متابعة تنفيذ الحكم بما يحقق مصلحة المحضون والطرف صاحب الحق.",
        "descriptionEn": "Following through on enforcement to serve the best interests of the child and the rights-holder."
      }
    ],
    "valueToClientAr": "تعامل يحفظ الخصوصية والكرامة، ويحقق الحقوق دون إفساد ما يمكن إصلاحه.",
    "valueToClientEn": "An approach that protects privacy and dignity — and secures rights without breaking what can be repaired."
  },
  {
    "id": "estate-disputes",
    "sortOrder": 4,
    "titleAr": "المواريث والتركات",
    "titleEn": "Inheritance & Estate Disputes",
    "audiences": [
      "individual",
      "business"
    ],
    "iconName": "FileText",
    "leadAxiomAr": "تتشابك في التركات الأحكام الشرعية مع الأصول المالية والعقارية والشركات. نعمل على حصر التركة وتحديد الحقوق بدقة، وإدارة الخلاف بين الورثة بما يحفظ الحقوق ويصون العلاقات قدر الإمكان.",
    "leadAxiomEn": "Estates bring Sharia rules together with financial, real estate and corporate assets. We inventory the estate and define each entitlement precisely, managing disagreements between heirs in a way that protects rights and, wherever possible, preserves relationships.",
    "problemsAddressedAr": [
      "امتناع بعض الورثة عن القسمة أو الإفصاح عن الأصول",
      "وجود وصايا أو أوقاف متداخلة مع التركة",
      "تركات تضم شركات أو عقارات مدرّة للدخل",
      "منازعات تصرفات المورث في مرض الموت",
      "مطالبات الديون على التركة أو لصالحها",
      "قسمة التركات المعقدة ذات البعد الدولي"
    ],
    "problemsAddressedEn": [
      "Heirs refusing division or disclosure of assets",
      "Wills or waqf interlinked with the estate",
      "Estates with trading companies or income-generating real estate",
      "Disputes over dispositions made during terminal illness",
      "Debts owed by or to the estate",
      "Complex cross-border estate division"
    ],
    "scopeOfServicesAr": [
      "استخراج صكوك حصر الورثة وتحديد الأنصبة الشرعية",
      "حصر أموال التركة وعقاراتها وحساباتها بالتنسيق مع الجهات المختصة",
      "إعداد اتفاقيات القسمة الرضائية وتوثيقها قضائيًّا",
      "إقامة دعاوى قسمة التركة الجبرية والترافع فيها",
      "إدارة أموال التركة خلال فترة النزاع لمنع هدرها",
      "تصفية الشركات العائلية الداخلة في التركة أو إعادة تنظيمها"
    ],
    "scopeOfServicesEn": [
      "Obtaining certificates of heirs and calculating Sharia entitlements",
      "Inventorying estate funds, properties and accounts with competent bodies",
      "Drafting and notarising consensual division agreements",
      "Filing and pleading compulsory judicial estate division claims",
      "Administering estate assets pending dispute resolution to prevent dissipation",
      "Liquidating or restructuring family businesses within the estate"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "الحصر والإفصاح",
        "titleEn": "Inventory & Disclosure",
        "descriptionAr": "جمع كافة البيانات عن أصول التركة والتزاماتها دون إغفال أي عنصر.",
        "descriptionEn": "Gathering full data on estate assets and liabilities without omission."
      },
      {
        "step": 2,
        "titleAr": "تحديد الأنصبة",
        "titleEn": "Calculating Shares",
        "descriptionAr": "تطبيق الأحكام الشرعية والنظامية على كل وارث وتوضيح موقفه بدقة.",
        "descriptionEn": "Applying Sharia and statutory rules to each heir, clarifying their position."
      },
      {
        "step": 3,
        "titleAr": "مسار القسمة الرضائية",
        "titleEn": "Consensual Division Route",
        "descriptionAr": "صياغة مقترح قسمة عادل ومكتوب يُعرض على جميع الورثة.",
        "descriptionEn": "Drafting an equitable written division proposal presented to all heirs."
      },
      {
        "step": 4,
        "titleAr": "المسار القضائي عند الحاجة",
        "titleEn": "Judicial Division When Needed",
        "descriptionAr": "المطالبة بالقسمة الجبرية وتعيين مصفٍّ قضائي متى تعذّر الاتفاق.",
        "descriptionEn": "Pursuing compulsory division and judicial liquidation where agreement fails."
      }
    ],
    "valueToClientAr": "تركة محصورة بوضوح، وحقوق محددة، وإجراءات تصل إلى نهايتها دون تأخير غير مبرر.",
    "valueToClientEn": "A clearly inventoried estate, defined entitlements, and procedures that reach completion without unjustified delay."
  },
  {
    "id": "administrative-litigation",
    "sortOrder": 5,
    "titleAr": "القضايا الإدارية",
    "titleEn": "Administrative Litigation",
    "audiences": [
      "individual",
      "business"
    ],
    "iconName": "Building2",
    "leadAxiomAr": "النزاع مع جهة إدارية له قواعده الخاصة في الاختصاص والمواعيد والتظلم. نفحص مشروعية القرار من حيث الاختصاص والشكل والسبب والغاية، ونسلك الطريق النظامي الصحيح أمام المحاكم الإدارية في مواعيدها المحددة.",
    "leadAxiomEn": "A dispute with a government body follows its own rules on jurisdiction, deadlines and grievance. We test the legality of the decision as to competence, form, grounds and purpose, and follow the correct statutory route before the administrative courts within the prescribed time limits.",
    "problemsAddressedAr": [
      "إلغاء القرارات الإدارية غير المشروعة أو المنحرفة",
      "التعويض عن القرارات أو الإجراءات الإدارية الضارة",
      "منازعات العقود الإدارية ومشاريع المشتريات الحكومية",
      "القرارات الصادرة عن اللجان والهيئات ذات الصبغة الإدارية",
      "منازعات الوظيفة العامة والترقيات والرواتب",
      "التظلم الإداري الإلزامي قبل رفع الدعوى"
    ],
    "problemsAddressedEn": [
      "Annulment of unlawful or ultra vires administrative decisions",
      "Compensation for damaging administrative decisions or actions",
      "Administrative contract disputes and government procurement",
      "Decisions of administrative committees and statutory bodies",
      "Civil service disputes, promotions and remuneration",
      "Mandatory statutory grievance procedures before filing claim"
    ],
    "scopeOfServicesAr": [
      "فحص القرار الإداري وأركانه وتحديد أوجه الطعن",
      "إعداد التظلمات الإدارية وتقديمها في المواعيد النظامية المقررة",
      "صياغة لوائح الدعوى الإلغائية ودعاوى التعويض",
      "التمثيل أمام دوائر ديوان المظالم والمحاكم الإدارية بكافة درجاتها",
      "متابعة منازعات تنفيذ العقود الإدارية ومستخلصات المقاولين",
      "الطعن بالاستئناف وأمام المحكمة الإدارية العليا"
    ],
    "scopeOfServicesEn": [
      "Examining the administrative decision, its elements and grounds for challenge",
      "Drafting administrative grievances and submitting them within statutory deadlines",
      "Drafting annulment claims and compensation applications",
      "Representation before the Board of Grievances and administrative courts across all tiers",
      "Handling government contract disputes and contractor payment certificates",
      "Appeals and challenges before the High Administrative Court"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "فحص المواعيد",
        "titleEn": "Deadline Review",
        "descriptionAr": "التأكد من سريان ميعاد التظلم والطعن؛ فالميعاد في الإداري يسقط الحق.",
        "descriptionEn": "Confirming time limits for grievance and challenge remain intact; deadlines are strict."
      },
      {
        "step": 2,
        "titleAr": "فحص المشروعية",
        "titleEn": "Testing Lawfulness",
        "descriptionAr": "مراجعة عيوب القرار: عدم الاختصاص، عيب الشكل، مخالفة النظام، عيب السبب، إساءة استعمال السلطة.",
        "descriptionEn": "Checking decision defects: jurisdiction, form, violation of law, lack of cause, abuse of authority."
      },
      {
        "step": 3,
        "titleAr": "التظلم النظامي",
        "titleEn": "Statutory Grievance",
        "descriptionAr": "صياغة تظلم إداري مسبّب يُودع لدى الجهة المختصة وفق الأصول.",
        "descriptionEn": "Drafting reasoned administrative grievances lodged with the competent authority."
      },
      {
        "step": 4,
        "titleAr": "رفع الدعوى ومتابعتها",
        "titleEn": "Filing & Follow-Through",
        "descriptionAr": "الترافع أمام المحكمة الإدارية حتى صدور الحكم البات وتنفيذه.",
        "descriptionEn": "Advocacy before the administrative court until final judgment and enforcement."
      }
    ],
    "valueToClientAr": "طعن مبني على أسباب قانونية واضحة، في وقته النظامي، وأمام الجهة المختصة.",
    "valueToClientEn": "Challenges grounded in clear legal reasons — filed on time, and before the right forum."
  },
  {
    "id": "commercial-corporate",
    "sortOrder": 6,
    "titleAr": "القضايا التجارية والشركات",
    "titleEn": "Commercial & Corporate Law",
    "audiences": [
      "business"
    ],
    "iconName": "Briefcase",
    "leadAxiomAr": "تمس منازعات الشركات رأس المال والإدارة والسمعة معًا. نرافق المنشآت من التأسيس وإعادة الهيكلة إلى إدارة منازعات الشركاء ومطالبات العقود التجارية، وفق نظام الشركات السعودي الجديد والأنظمة ذات الصلة.",
    "leadAxiomEn": "Corporate disputes impact capital, management and reputation all at once. We support businesses from incorporation and restructuring through partner disputes and commercial contract claims under the new Saudi Companies Law and related legislation.",
    "problemsAddressedAr": [
      "خلافات الشركاء ومسائل عزل المديرين ومسؤوليتهم",
      "دعاوى بطلان قرارات الجمعيات العامة ومجالس الإدارة",
      "منازعات عقود التوريد والتوزيع والوكالات التجارية",
      "تصفية الشركات وقسمة أموالها أو خروج الشركاء",
      "المنافسة غير المشروعة وإفشاء الأسرار التجارية",
      "تأسيس الشركات وصياغة عقودها ولوائحها الداخلية"
    ],
    "problemsAddressedEn": [
      "Shareholder disputes, removal of directors and director liability",
      "Challenges to validity of general assembly and board resolutions",
      "Supply, distribution and commercial agency disputes",
      "Company liquidation, asset division and partner exits",
      "Unfair competition and breach of trade secrets",
      "Company incorporation, articles of association and internal charters"
    ],
    "scopeOfServicesAr": [
      "صياغة وتعديل عقود التأسيس واتفاقيات الشركاء",
      "إعداد لوائح الحوكمة وسياسات تعارض المصالح",
      "التمثيل والترافع أمام المحاكم التجارية في كافة المنازعات",
      "إدارة التفاوض بين الشركاء للوصول إلى تسويات تمنع توقف المنشأة",
      "متابعة قضايا المطالبات المالية التجارية وتنفيذ العقود",
      "إجراءات الاندماج والاستحواذ وإعادة هيكلة الكيانات التجارية"
    ],
    "scopeOfServicesEn": [
      "Drafting and amending articles of association and shareholder agreements",
      "Drafting governance charters and conflict-of-interest policies",
      "Representation and advocacy before commercial courts across all disputes",
      "Conducting negotiations between partners to prevent business interruption",
      "Commercial payment claims and contract enforcement",
      "M&A procedures and corporate entity restructuring"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "تشخيص النزاع",
        "titleEn": "Dispute Diagnosis",
        "descriptionAr": "فحص عقد التأسيس وقرارات الشركاء والمراسلات لتحديد المركز القانوني بدقة.",
        "descriptionEn": "Reviewing articles, partner resolutions and correspondence to define the legal position."
      },
      {
        "step": 2,
        "titleAr": "حماية استمرار المنشأة",
        "titleEn": "Protecting Operations",
        "descriptionAr": "اتخاذ تدابير تحفظية لمنع هدر الأصول أو تعطيل نشاط الشركة خلال النزاع.",
        "descriptionEn": "Taking precautionary measures to protect assets and ongoing business during the dispute."
      },
      {
        "step": 3,
        "titleAr": "المسار التفاوضي أو القضائي",
        "titleEn": "Negotiation or Litigation",
        "descriptionAr": "طرح خيارات التسوية القابلة للتنفيذ أولاً، ثم اللجوء إلى القضاء التجاري بحزم.",
        "descriptionEn": "Presenting viable settlement options first, proceeding decisively to court where required."
      },
      {
        "step": 4,
        "titleAr": "تنفيذ الحل وإعادة الاستقرار",
        "titleEn": "Execution & Stabilisation",
        "descriptionAr": "تنفيذ الحكم أو الاتفاق وتحديث سجلات الشركة بما يعيد الاستقرار إليها.",
        "descriptionEn": "Executing the judgment or agreement, updating company records to restore stability."
      }
    ],
    "valueToClientAr": "حلول تحمي حقوق الشركاء وتبقي المنشأة قادرة على الاستمرار والعمل.",
    "valueToClientEn": "Solutions that protect shareholders’ rights and keep the business able to operate."
  },
  {
    "id": "banking-finance",
    "sortOrder": 7,
    "titleAr": "المنازعات المصرفية والتمويلية",
    "titleEn": "Banking & Finance Disputes",
    "audiences": [
      "business"
    ],
    "iconName": "CreditCard",
    "leadAxiomAr": "عقود التمويل والمصارف تمتاز بصياغات نموذجية وشروط دقيقة. نقرأ هذه العقود في ضوء قواعد البنك المركزي والقرارات القضائية المستقرة، ونمثل عملاءنا أمام لجان المنازعات المصرفية والتمويلية بحرفية تحفظ التوازن وتمنع الشروط المجحفة.",
    "leadAxiomEn": "Banking and finance agreements feature standard forms and complex conditions. We read these agreements under Saudi Central Bank rules and established judicial precedent, representing clients before banking dispute committees to protect balance and resist unfair terms.",
    "problemsAddressedAr": [
      "منازعات فوائد وأرباح التمويل والرسوم غير المتفق عليها",
      "تسييل الضمانات العقارية أو الأسهم دون وجه حق",
      "منازعات الكفالات المصرفية وخطابات الضمان",
      "دعاوى المطالبة بالأرصدة ومنازعات الحسابات والتحويلات",
      "إعادة جدولة المديونيات المتعثرة وإدارتها نظاميًّا",
      "منازعات عقود الإجارة التمويلية والمرابحة والتورق"
    ],
    "problemsAddressedEn": [
      "Disputes over financing charges, profit margins and unagreed fees",
      "Unlawful liquidation of real estate or share guarantees",
      "Bank guarantees and letters of credit disputes",
      "Account balance claims, wire transfers and deposit disputes",
      "Restructuring non-performing debt under statutory frameworks",
      "Ijara, murabaha and tawarruq financing disputes"
    ],
    "scopeOfServicesAr": [
      "فحص ومراجعة عقود التمويل وبيان مدى مطابقتها لتعليمات البنك المركزي",
      "إعداد ومتابعة الشكاوى المودعة لدى البنك المركزي السعودي (ساما)",
      "صياغة لوائح الدعوى والمذكرات الجوابية أمام اللجان المصرفية والتمويلية",
      "التمثيل والترافع أمام لجنة منازعات الأوراق المالية ولجان التمويل",
      "التفاوض مع الجهات التمويلية لإعادة الهيكلة أو التسوية الودية",
      "وقف إجراءات التنفيذ غير المشروعة الناتجة عن سندات تمويلية"
    ],
    "scopeOfServicesEn": [
      "Reviewing financing agreements for compliance with Saudi Central Bank directives",
      "Filing and pursuing complaints before the Saudi Central Bank (SAMA)",
      "Drafting statements of claim and defence submissions before banking committees",
      "Representation before securities and financing dispute committees",
      "Negotiating debt restructuring and settlements with financial institutions",
      "Staying unlawful enforcement actions arising from finance debt instruments"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "التدقيق المحاسبي والنظامي",
        "titleEn": "Audit & Compliance Review",
        "descriptionAr": "إعادة احتساب الأرباح والرسوم والتأكد من مطابقتها للعقد ولتعليمات ساما.",
        "descriptionEn": "Recalculating profits and fees against contract terms and SAMA instructions."
      },
      {
        "step": 2,
        "titleAr": "فحص السندات والضمانات",
        "titleEn": "Securities & Guarantees Review",
        "descriptionAr": "التأكد من مشروعية السند لأمر أو الرهن المقدم كضمان وحدود مسؤوليته.",
        "descriptionEn": "Assessing legality of promissory notes and mortgages provided as collateral."
      },
      {
        "step": 3,
        "titleAr": "التفاوض المباشر",
        "titleEn": "Direct Negotiation",
        "descriptionAr": "استخدام نقاط القوة المكتشفة للتفاوض على تسوية أو إعادة جدولة منصفة.",
        "descriptionEn": "Leveraging identified strengths to negotiate an equitable restructuring."
      },
      {
        "step": 4,
        "titleAr": "المرافعة أمام اللجان",
        "titleEn": "Litigation Before Committees",
        "descriptionAr": "الترافع أمام لجان تسوية المنازعات المصرفية والتمويلية بحجة مسندة.",
        "descriptionEn": "Advocacy before banking and finance committees with reasoned pleadings."
      }
    ],
    "valueToClientAr": "موقف تفاوضي أقوى أمام الجهة التمويلية، مبني على العقد والأنظمة والتعليمات.",
    "valueToClientEn": "A stronger negotiating position with the financier — grounded in the contract and the rules."
  },
  {
    "id": "enforcement-debt-recovery",
    "sortOrder": 8,
    "titleAr": "التنفيذ وتحصيل الحقوق",
    "titleEn": "Enforcement & Debt Recovery",
    "audiences": [
      "business",
      "individual"
    ],
    "iconName": "CheckCircle2",
    "leadAxiomAr": "الحكم القضائي لا تكتمل قيمته إلا حين يتحول إلى حق مستوفى. ندير إجراءات التنفيذ بفاعلية وسرعة، ونتعامل مع السندات التنفيذية والأحكام القضائية وأحكام التحكيم، ونواجه منازعات التنفيذ بدقة تمنع تعطيل الحق.",
    "leadAxiomEn": "A court ruling is fulfilled only when it becomes a recovered right. We handle enforcement proceedings swiftly and effectively, dealing with execution instruments, court judgments and arbitral awards, meeting enforcement disputes with precision to prevent delay.",
    "problemsAddressedAr": [
      "تنفيذ السندات لأمر والشيكات والعقود الموثقة",
      "تنفيذ الأحكام القضائية النهائية والقرارات شبه القضائية",
      "تنفيذ أحكام التحكيم الوطنية والدولية وأحكام المحاكم الأجنبية",
      "مواجهة منازعات التنفيذ الموضوعية والشكلية لمنع المماطلة",
      "تتبع أموال المنفّذ ضده وإيقاع الحجوزات التحفظية والتنفيذية",
      "إجراءات الإفصاح والمنع من السفر وأوامر الحبس التنفيذية"
    ],
    "problemsAddressedEn": [
      "Enforcement of promissory notes, cheques and notarised contracts",
      "Enforcement of final court judgments and tribunal decisions",
      "Enforcement of domestic and international arbitral awards and foreign judgments",
      "Challenging substantive and procedural enforcement disputes to stop delay",
      "Asset tracing and attachment orders against enforcement debtors",
      "Disclosure procedures, travel bans and enforcement detention orders"
    ],
    "scopeOfServicesAr": [
      "فحص السند التنفيذي والتأكد من استيفائه لكافة الشروط النظامية",
      "قيد طلبات التنفيذ ومتابعتها عبر منصة ناجز ودوائر التنفيذ",
      "تقديم ومتابعة طلبات المادة 46 وما يليها من نظام التنفيذ",
      "الترافع في منازعات التنفيذ الموضوعية والشكلية أمام قاضي التنفيذ",
      "إجراءات الإنابة القضائية والتنفيذ خارج نطاق الدائرة المحلية",
      "تحصيل الديون للشركات والأفراد بطرق ودية ونظامية منظمة"
    ],
    "scopeOfServicesEn": [
      "Verifying the enforcement instrument satisfies all statutory requirements",
      "Lodging and pursuing execution requests on Najiz and before execution courts",
      "Applying for Article 46 measures and asset recovery actions",
      "Pleading substantive and formal execution challenges before execution judges",
      "Handling cross-jurisdictional execution and judicial delegations",
      "Corporate and private debt recovery through structured amicable and legal routes"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "تدقيق السند",
        "titleEn": "Instrument Review",
        "descriptionAr": "التأكد من خلو السند من عيوب الشكل أو التقادم أو الدفوع التي قد توقفه.",
        "descriptionEn": "Confirming the instrument is free of formal defects, limitation issues or fatal challenges."
      },
      {
        "step": 2,
        "titleAr": "إطلاق الإجراءات",
        "titleEn": "Initiating Proceedings",
        "descriptionAr": "قيد الطلب ومتابعته لإصدار أمر التنفيذ وإخطار المنفّذ ضده دون إبطاء.",
        "descriptionEn": "Filing the petition and securing execution orders and formal notices without delay."
      },
      {
        "step": 3,
        "titleAr": "تفعيل التدابير الجبرية",
        "titleEn": "Activating Coercive Steps",
        "descriptionAr": "تطبيق أوامر الحجز والمنع من التعاملات المالية والتجارية للضغط النظامي.",
        "descriptionEn": "Applying asset freezing orders and financial restrictions for lawful pressure."
      },
      {
        "step": 4,
        "titleAr": "التحصيل والاستيفاء",
        "titleEn": "Recovery & Satisfaction",
        "descriptionAr": "متابعة تسييل الأموال المحجوزة أو السداد الفعلي حتى إيداع الحق في حساب الموكل.",
        "descriptionEn": "Following through on liquidation or direct payment until funds reach the client."
      }
    ],
    "valueToClientAr": "متابعة مستمرة حتى يتحول الحكم أو السند إلى حق مستوفى فعلاً.",
    "valueToClientEn": "Persistent follow-through until a judgment or instrument becomes a recovered right."
  },
  {
    "id": "real-estate-construction",
    "sortOrder": 9,
    "titleAr": "العقارات والمقاولات",
    "titleEn": "Real Estate & Construction",
    "audiences": [
      "business",
      "individual"
    ],
    "iconName": "Building",
    "leadAxiomAr": "المشاريع العقارية والمقاولات تحمل بطبيعتها مخاطر مالية وتشغيلية كبيرة. نساعد المطورين والمقاولين وملاك العقارات على إدارة هذه المخاطر عبر عقود محكمة، وتسوية منازعات التنفيذ والتأخير والتسليم بكفاءة تضمن استمرار المشروع.",
    "leadAxiomEn": "Real estate and construction projects carry substantial financial and operational risks. We help developers, contractors and owners manage these risks through solid contracts, resolving performance, delay and delivery disputes to keep projects viable.",
    "problemsAddressedAr": [
      "منازعات عقود المقاولات وعقود فيديك (FIDIC) والتعديلات وأوامر التغيير",
      "مطالبات التأخير وغرامات التأخير وتمديد المدة الزمنية للمشروع",
      "منازعات استحقاق الدفعات والمستخلصات وتسييل خطابات الضمان",
      "منازعات التطوير العقاري وعقود البيع على الخارطة (وافي)",
      "منازعات الملكية العقارية والتداخل والحيازة والإفراغ",
      "عقود الإيجار التجارية الكبرى ومنازعات الإخلاء والأجرة"
    ],
    "problemsAddressedEn": [
      "Construction disputes, FIDIC agreements, variations and change orders",
      "Delay claims, liquidated damages and extension of time (EOT)",
      "Interim payment disputes and wrongful call on bank performance bonds",
      "Real estate development disputes and off-plan sales regulations (Wafi)",
      "Real estate title, boundary overlapping, possession and deed registration",
      "Major commercial lease contracts, eviction and rental payment claims"
    ],
    "scopeOfServicesAr": [
      "صياغة ومراجعة عقود المقاولات العامة والإنشاءات والخدمات الهندسية",
      "صياغة اتفاقيات التطوير العقاري والصناديق العقارية الاستثمارية",
      "التمثيل والترافع أمام المحاكم العقارية والتجارية وهيئات التحكيم الهندسي",
      "إدارة المطالبات التعاقدية (Claims Management) خلال فترة تنفيذ المشروع",
      "معالجة النزاعات الناشئة عن عقود البيع على الخارطة وتراخيص وافي",
      "تسوية منازعات عقود الإيجار التجاري عبر منصة إيجار والمحاكم العامة"
    ],
    "scopeOfServicesEn": [
      "Drafting and reviewing EPC construction and engineering services agreements",
      "Drafting real estate development agreements and real estate investment funds",
      "Advocacy before commercial and real estate courts and construction arbitration tribunals",
      "Contractual claims management during project execution",
      "Resolving off-plan sales disputes under Wafi licensing frameworks",
      "Resolving commercial lease disputes via the Ejar platform and civil courts"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "التدقيق التعاقدي والفني",
        "titleEn": "Contract & Technical Audit",
        "descriptionAr": "فحص نصوص العقد وجداول الكميات وأوامر التغيير ومراسلات الموقع بدقة.",
        "descriptionEn": "Reviewing contract terms, bills of quantities, change orders and site letters."
      },
      {
        "step": 2,
        "titleAr": "إدارة المطالبة في وقتها",
        "titleEn": "Timely Claims Management",
        "descriptionAr": "توثيق المطالبة بالوقت والتكلفة فور وقوع السبب وقبل سقوطها تعاقديًّا.",
        "descriptionEn": "Documenting time and cost claims immediately upon occurrence before limitation lapses."
      },
      {
        "step": 3,
        "titleAr": "الحلول البديلة والمفاوضات",
        "titleEn": "Alternative Dispute Resolution",
        "descriptionAr": "السعي إلى التسوية الفنية والودية التي تحفظ تدفق المشروع وتمنع توقفه.",
        "descriptionEn": "Seeking amicable technical settlements to keep project progress and cashflow intact."
      },
      {
        "step": 4,
        "titleAr": "التقاضي أو التحكيم الهندسي",
        "titleEn": "Litigation or Arbitration",
        "descriptionAr": "اللجوء إلى التحكيم أو المحكمة المختصة بملف فني وقانوني متكامل.",
        "descriptionEn": "Advancing to technical arbitration or court with a complete legal and engineering brief."
      }
    ],
    "valueToClientAr": "حماية لقيمة الأصل واستمرار للمشروع، من العقد وحتى التسليم النهائي.",
    "valueToClientEn": "Protection for the asset’s value and the project’s continuity, from contract to handover."
  },
  {
    "id": "labour-employment",
    "sortOrder": 10,
    "titleAr": "القضايا العمالية",
    "titleEn": "Labour & Employment Law",
    "audiences": [
      "business",
      "individual"
    ],
    "iconName": "Briefcase",
    "leadAxiomAr": "العلاقة العمالية تقوم على التوازن بين حقوق العامل واستقرار المنشأة. نخدم الطرفين: نمثل العاملين في استيفاء حقوقهم، ونساعد المنشآت على بناء لوائح وعقود متوافقة مع نظام العمل تمنع النزاع قبل وقوعه.",
    "leadAxiomEn": "An employment relationship rests on a balance between the employee’s rights and the stability of the business. We act for both: representing employees in recovering their entitlements, and helping employers build policies and contracts compliant with the Labour Law that prevent disputes before they arise.",
    "problemsAddressedAr": [
      "إنهاء عقد محل اعتراض والفصل التعسفي",
      "أجور أو مستحقات متأخرة والبدلات",
      "مكافأة نهاية الخدمة واحتسابها الدقيق",
      "مخالفة اللائحة الداخلية وإجراءات التحقيق والتأديب",
      "مطالبات التعويض عن إصابات العمل والأضرار",
      "منازعات عدم المنافسة وإفشاء أسرار العمل للقيادات"
    ],
    "problemsAddressedEn": [
      "Contested termination and unfair dismissal",
      "Unpaid wages, overdue entitlements and allowances",
      "End-of-service benefits and precise calculation",
      "Internal policy breaches, disciplinary investigations and penalties",
      "Work injury compensation and damages claims",
      "Non-compete covenants and executive breach of confidentiality"
    ],
    "scopeOfServicesAr": [
      "التمثيل في منازعات عقود العمل بكافة أنواعها",
      "معالجة قضايا الفصل وإنهاء العلاقة العمالية والتعويضات المترتبة عليها",
      "حساب وتصفية الأجور والمستحقات ومكافآت نهاية الخدمة بدقة نظامية",
      "إعداد ومراجعة لوائح تنظيم العمل الداخلية وسياسات الموارد البشرية",
      "التمثيل أمام إدارات التسوية الودية والمحاكم العمالية بكافة درجاتها",
      "صياغة اتفاقيات عدم المنافسة وعقود الإدارة العليا والكوادر التنفيذية"
    ],
    "scopeOfServicesEn": [
      "Representation across all employment contract disputes",
      "Handling termination, unfair dismissal claims and associated damages",
      "Quantifying and recovering wages, benefits and end-of-service pay under the law",
      "Drafting and reviewing internal work regulations and HR policies",
      "Representation before Amicable Settlement offices and Labour Courts across all tiers",
      "Drafting executive employment agreements and non-compete clauses"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "قراءة العلاقة",
        "titleEn": "Reading the Relationship",
        "descriptionAr": "تحليل العقد والأجر وسجل الخدمة والمخاطبات لتوثيق أركان العلاقة.",
        "descriptionEn": "Analysing contract, pay and service records to establish facts."
      },
      {
        "step": 2,
        "titleAr": "حساب المستحقات",
        "titleEn": "Calculating Entitlements",
        "descriptionAr": "احتساب الحقوق والتعويضات بدقة رقمية وفق نصوص نظام العمل ولائحته.",
        "descriptionEn": "Quantifying rights and compensation with precision under the Labour Law."
      },
      {
        "step": 3,
        "titleAr": "التسوية الودية",
        "titleEn": "Amicable Settlement",
        "descriptionAr": "السعي إلى تسوية سريعة لدى مكاتب التسوية الودية تحفظ الوقت والجهد.",
        "descriptionEn": "Seeking swift settlement before the competent amicable settlement authority."
      },
      {
        "step": 4,
        "titleAr": "الدعوى العمالية",
        "titleEn": "Labour Claim",
        "descriptionAr": "التمثيل بحرفية أمام المحاكم العمالية وصولاً للحكم وتنفيذه الجبري.",
        "descriptionEn": "Professional advocacy before labour courts through to enforceable judgment."
      }
    ],
    "valueToClientAr": "حقوق محسوبة بدقة، وعلاقات عمل أكثر استقراراً ووضوحاً.",
    "valueToClientEn": "Entitlements calculated with precision, and employment relationships that are clearer and more stable."
  },
  {
    "id": "arbitration-mediation",
    "sortOrder": 11,
    "titleAr": "التحكيم والوساطة",
    "titleEn": "Arbitration & Mediation",
    "audiences": [
      "business"
    ],
    "iconName": "Scale",
    "leadAxiomAr": "التحكيم يوفر السرعة والتخصص والسرية، لكن نجاحه يبدأ من حسن صياغة شرط التحكيم. نصوغ الاتفاقات وندير النزاعات التحكيمية المؤسسية والحرة، ونتابع تنفيذ الأحكام وفق نظام التحكيم السعودي والاتفاقيات الدولية.",
    "leadAxiomEn": "Arbitration offers speed, specialism and confidentiality — but its success begins with the drafting of the arbitration clause. We draft agreements, conduct institutional and ad hoc proceedings, and handle enforcement under the Saudi Arbitration Law and international conventions.",
    "problemsAddressedAr": [
      "نزاعات تتطلب سرعة الفصل وتخصص المحكّمين",
      "صياغة ومراجعة مشاريط وشروط التحكيم في العقود الكبرى",
      "نزاعات عقود التجارة الدولية والشركات متعددة الجنسيات",
      "إجراءات رد المحكّمين أو الطعن في تشكيل هيئات التحكيم",
      "دعاوى بطلان أحكام التحكيم ومواجهتها",
      "تنفيذ أحكام التحكيم الأجنبية وفق اتفاقية نيويورك"
    ],
    "problemsAddressedEn": [
      "Disputes requiring expeditious adjudication and sector-specific arbitrators",
      "Drafting and reviewing institutional arbitration clauses in major contracts",
      "Cross-border commercial disputes and multinational joint ventures",
      "Challenges to arbitrators and tribunal jurisdiction objections",
      "Annulment claims against arbitral awards and opposing setting-aside motions",
      "Enforcement of foreign arbitral awards under the New York Convention"
    ],
    "scopeOfServicesAr": [
      "صياغة ومراجعة اتفاقات وشروط التحكيم في العقود المحلية والدولية",
      "التمثيل والترافع أمام هيئات التحكيم المؤسسي (المركز السعودي للتحكيم التجاري، غرفة التجارة الدولية ICC، وغيرها) والتحكيم الحر",
      "إدارة جلسات الوساطة والتفاوض المؤسسي لتسوية النزاعات التجارية",
      "رفع ومواجهة دعاوى بطلان أحكام التحكيم أمام محاكم الاستئناف المختصة",
      "متابعة إجراءات تذييل أحكام التحكيم بالصيغة التنفيذية وتنفيذها قضائيًّا",
      "تقديم المشورة في اختيار المحكّمين وتحديد القانون الواجب التطبيق"
    ],
    "scopeOfServicesEn": [
      "Drafting arbitration agreements and clauses in domestic and cross-border contracts",
      "Representation before institutional tribunals (SCCA, ICC, LCIA) and ad hoc tribunals",
      "Managing commercial mediation and structured dispute negotiations",
      "Filing and contesting annulment actions before competent Courts of Appeal",
      "Enforcement of arbitral awards and obtaining execution orders",
      "Advising on arbitrator nominations and choice of substantive and procedural law"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "فحص شرط التحكيم",
        "titleEn": "Clause Review",
        "descriptionAr": "التأكد من صحة الشرط وصلاحيته ونطاقه واختصاص الهيئة لمنع الدفوع الشكلية.",
        "descriptionEn": "Confirming the clause's validity, scope and jurisdiction to prevent procedural flaws."
      },
      {
        "step": 2,
        "titleAr": "إعداد ملف النزاع",
        "titleEn": "Case Preparation",
        "descriptionAr": "بناء صحيفة الدعوى والأدلة والشهادات وطلبات التعويض بشكل محكم ومسند.",
        "descriptionEn": "Building the memorial, documentary exhibits, expert reports and quantified claims."
      },
      {
        "step": 3,
        "titleAr": "المرافعة وإدارة الجلسات",
        "titleEn": "Tribunal Advocacy",
        "descriptionAr": "إدارة الإجراءات واستجواب الخبراء والشهود أمام هيئة التحكيم بكفاءة.",
        "descriptionEn": "Presenting pleadings, cross-examining experts and managing hearings effectively."
      },
      {
        "step": 4,
        "titleAr": "التنفيذ والحماية",
        "titleEn": "Enforcement & Defense",
        "descriptionAr": "حماية الحكم من دعاوى البطلان والسير فورًا في استيفاء الحق عبر محكمة التنفيذ.",
        "descriptionEn": "Shielding the award against annulment and enforcing immediately in court."
      }
    ],
    "valueToClientAr": "فصل تخصصي سريع في النزاع، مع الحفاظ على سرية المعاملات التجارية وسمعة الأطراف.",
    "valueToClientEn": "Specialist, efficient resolution of disputes — with the confidentiality of the commercial relationship preserved."
  },
  {
    "id": "bankruptcy-restructuring",
    "sortOrder": 12,
    "titleAr": "الإفلاس وإعادة التنظيم المالي",
    "titleEn": "Bankruptcy & Restructuring",
    "audiences": [
      "business"
    ],
    "iconName": "AlertCircle",
    "leadAxiomAr": "التعثر المالي ليس نهاية المنشأة إذا عولج مبكرًا وبالإجراء الصحيح. نقدم المشورة في إجراءات نظام الإفلاس للمدين الذي يسعى إلى الاستمرار، وللدائن الذي يسعى إلى حماية حقه.",
    "leadAxiomEn": "Financial distress need not end a business if it is addressed early and through the right procedure. We advise debtors seeking to continue trading, and creditors seeking to protect their rights under the Saudi Bankruptcy Law.",
    "problemsAddressedAr": [
      "اضطراب الأوضاع المالية وتراكم الديون على المنشأة",
      "مواجهة مطالبات الدائنين وإيقاف إجراءات التنفيذ والحجوزات",
      "اختيار الإجراء المناسب بين التسوية الوقائية وإعادة التنظيم والتصفية",
      "حماية حقوق الدائنين ومتابعة مطالباتهم لدى أمناء الإفلاس",
      "إعادة هيكلة الالتزامات التشغيلية والتمويلية للشركات المتعثرة",
      "مسؤولية المديرين وأعضاء مجلس الإدارة في حالات التعثر المالي"
    ],
    "problemsAddressedEn": [
      "Severe financial distress and accumulated corporate debt",
      "Facing creditor claims and staying judicial enforcement attachments",
      "Selecting between protective settlement, financial restructuring and liquidation",
      "Protecting creditor rights and filing claims with bankruptcy trustees",
      "Restructuring operational and debt obligations for distressed companies",
      "Director and board member liabilities in corporate insolvency situations"
    ],
    "scopeOfServicesAr": [
      "تقييم الوضع المالي والنظامي للمنشأة وتحديد الإجراء الأنسب بموجب نظام الإفلاس",
      "إعداد وتقديم طلبات افتتاح إجراءات الإفلاس أمام المحاكم التجارية",
      "صياغة خطط إعادة التنظيم المالي ومقترحات التسوية الوقائية ومناقشتها مع الدائنين",
      "تمثيل الدائنين في لجان الدائنين ومتابعة حصر ديونهم والتصويت على المقترحات",
      "إدارة إجراءات التصفية والتصفية الإدارية وفق أعلى المعايير النظامية",
      "تقديم الاستشارات القانونية لأمناء الإفلاس ولجان إعادة الهيكلة"
    ],
    "scopeOfServicesEn": [
      "Assessing financial and legal standing to identify the right bankruptcy procedure",
      "Filing opening petitions for bankruptcy procedures before commercial courts",
      "Drafting financial restructuring proposals and protective settlements for creditors",
      "Representing creditors on creditor committees, debt validation and voting",
      "Handling liquidation and administrative liquidation under the Bankruptcy Law",
      "Advising bankruptcy trustees and corporate restructuring steering committees"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "التشخيص المالي والنظامي",
        "titleEn": "Financial & Legal Diagnosis",
        "descriptionAr": "تحليل حجم الديون والتدفقات النقدية والأصول لتحديد خيار الاستمرار أو التصفية.",
        "descriptionEn": "Analysing debt, cash flow and assets to decide between restructuring and liquidation."
      },
      {
        "step": 2,
        "titleAr": "طلب افتتاح الإجراء",
        "titleEn": "Opening Petition",
        "descriptionAr": "قيد الطلب لدى المحكمة التجارية مستوفيًا كافة المتطلبات لتعليق المطالبات فورًا.",
        "descriptionEn": "Filing the petition before commercial courts to activate a statutory moratorium on claims."
      },
      {
        "step": 3,
        "titleAr": "إعداد المقترح والتفاوض",
        "titleEn": "Proposal & Creditor Dialogue",
        "descriptionAr": "صياغة خطة واقعية لإعادة جدولة الديون والتفاوض مع الدائنين لضمان الموافقة عليها.",
        "descriptionEn": "Drafting a viable rescheduling plan and negotiating creditor approval."
      },
      {
        "step": 4,
        "titleAr": "المصادقة والتنفيذ",
        "titleEn": "Confirmation & Implementation",
        "descriptionAr": "مصادقة المحكمة على الخطة والإشراف على تنفيذها لإعادة المنشأة إلى نشاطها الطبيعي.",
        "descriptionEn": "Securing court confirmation and supervising plan execution to restore solvent trading."
      }
    ],
    "valueToClientAr": "فرصة حقيقية لاستمرار المنشأة للمدين، وحماية منظمة للحقوق للدائن.",
    "valueToClientEn": "A genuine chance of continuity for the debtor, and orderly protection for the creditor."
  },
  {
    "id": "waqf-family-wealth",
    "sortOrder": 13,
    "titleAr": "الأوقاف والثروات العائلية",
    "titleEn": "Waqf & Family Wealth Advisory",
    "audiences": [
      "individual",
      "business"
    ],
    "iconName": "Shield",
    "leadAxiomAr": "الوقف والثروة العائلية مسؤولية تمتد عبر الأجيال. نساعد العائلات على تأسيس الأوقاف وحوكمتها وتنظيم انتقال الثروة، وصياغة المواثيق العائلية، بما يحفظ الأصول ويقلل أسباب الخلاف مستقبلاً.",
    "leadAxiomEn": "A waqf and a family’s wealth are responsibilities that span generations. We help families establish and govern endowments, organise the transfer of wealth and draft family charters, preserving assets and reducing future dispute.",
    "problemsAddressedAr": [
      "تشتت الثروة العائلية مع تعاقب الأجيال",
      "غموض صكوك الأوقاف القديمة وتداخل شروط الواقفين",
      "منازعات النظارة على الأوقاف وعزل النظار ومساءلتهم",
      "الخلاف بين الأبناء والشركاء في إدارة الشركات العائلية",
      "تعطل استثمار أصول الأوقاف والحاجة إلى استبدالها أو نقلها",
      "غياب الحوكمة وآليات فض النزاع داخل الأسرة"
    ],
    "problemsAddressedEn": [
      "Fragmentation of family wealth across generations",
      "Ambiguous legacy waqf deeds and conflicting founder stipulations",
      "Trustee (Nadhir) disputes, removal actions and accountability",
      "Inter-generational disputes among siblings in family businesses",
      "Stagnant waqf assets requiring exchange or reinvestment approvals",
      "Absence of internal family governance and dispute protocols"
    ],
    "scopeOfServicesAr": [
      "صياغة حجج وصكوك الأوقاف الحديثة وتحديد مصارفها بدقة شرعية ونظامية",
      "تأسيس وحوكمة الكيانات الوقفية والشركات غير الربحية وصناديق الوقف",
      "صياغة المواثيق العائلية ودساتير الشركات العائلية وتنظيم قواعد الملكية والإدارة",
      "تمثيل الواقفين والنظار أمام المحاكم العامة ومحاكم الأحوال الشخصية ولجان الأوقاف",
      "إجراءات تعديل شروط الواقفين والاستبدال لدى الهيئة العامة للأوقاف والقضاء",
      "هيكلة ونقل ملكيات الأصول العائلية إلى كيانات قابضة مستدامة"
    ],
    "scopeOfServicesEn": [
      "Drafting contemporary waqf deeds and defining philanthropic mandates under Sharia",
      "Incorporating and governing waqf entities, non-profit institutions and endowment funds",
      "Drafting family business constitutions, ownership rules and governance charters",
      "Representing founders and trustees before courts and General Authority for Awqaf",
      "Securing judicial and regulatory approvals for waqf deed variation and asset reallocation",
      "Structuring and transferring family business assets into holding company vehicles"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "فهم إرادة الواقف والأسرة",
        "titleEn": "Founder & Family Intent",
        "descriptionAr": "جلسات عمل مكرسة لفهم الأهداف العائلية والوقفية طويلة الأجل بدقة.",
        "descriptionEn": "Dedicated working sessions to define family vision and philanthropic goals."
      },
      {
        "step": 2,
        "titleAr": "التصميم الشرعي والنظامي",
        "titleEn": "Sharia & Corporate Structuring",
        "descriptionAr": "بناء الهيكل الأنسب (وقف، شركة غير ربحية، ميثاق عائلي) بما يتوافق مع الأنظمة.",
        "descriptionEn": "Structuring the optimal vehicle (waqf, non-profit, family charter) under current law."
      },
      {
        "step": 3,
        "titleAr": "الصياغة والتوثيق",
        "titleEn": "Drafting & Formalization",
        "descriptionAr": "صياغة دقيقة للأحكام والشروط وتوثيقها رسميًّا لدى الجهات القضائية المختصة.",
        "descriptionEn": "Precise legal drafting and notarisation before the competent judicial authorities."
      },
      {
        "step": 4,
        "titleAr": "الحوكمة والمتابعة المستمرة",
        "titleEn": "Governance & Continuity",
        "descriptionAr": "وضع لوائح مجلس النظارة والإدارة ومتابعة التطبيق لضمان ديمومة الأثر.",
        "descriptionEn": "Establishing board charters and oversight frameworks to guarantee lasting legacy."
      }
    ],
    "valueToClientAr": "ثروة منظمة، ووقف مستدام، وأسباب خلاف أقل بين الأجيال.",
    "valueToClientEn": "Organised wealth, an enduring endowment, and fewer reasons for dispute between generations."
  },
  {
    "id": "ip-franchising",
    "sortOrder": 14,
    "titleAr": "الملكية الفكرية والامتياز التجاري",
    "titleEn": "Intellectual Property & Franchising",
    "audiences": [
      "business"
    ],
    "iconName": "Award",
    "leadAxiomAr": "العلامة والاسم والمحتوى أصول تُبنى قيمتها بالسنوات وقد تُفقد في أيام. نحمي هذه الأصول بالتسجيل والتعاقد السليم، ونصوغ عقود الترخيص والامتياز التجاري وفق نظام الامتياز التجاري السعودي بما يضمن التوسع الآمن.",
    "leadAxiomEn": "A brand, a name and content are assets whose value takes years to build and can be lost in days. We protect them through registration and sound contracting, drafting licensing and franchise agreements under the Saudi Commercial Franchise Law for secure growth.",
    "problemsAddressedAr": [
      "تعدي الغير على العلامات التجارية والأسماء التجارية وبراءات الاختراع",
      "تقليد المنتجات والتعدي على حقوق المؤلف والمحتوى الرقمي",
      "نزاعات عقود الامتياز التجاري بين مانح الامتياز والممنوح له",
      "عدم الالتزام بوثيقة الإفصاح وقيد اتفاقيات الامتياز التجاري",
      "منازعات عقود الترخيص ونقل التكنولوجيا وحقوق البرمجيات",
      "تسجيل وحماية الأصول الفكرية لدى الهيئة السعودية للملكية الفكرية"
    ],
    "problemsAddressedEn": [
      "Infringement of trademarks, trade names, industrial designs and patents",
      "Product counterfeiting, copyright piracy and digital asset infringement",
      "Commercial franchise disputes between franchisor and franchisee",
      "Non-compliance with disclosure documents and franchise registration",
      "Technology transfer, software copyright and licensing disputes",
      "Registration and protection before the Saudi Authority for Intellectual Property (SAIP)"
    ],
    "scopeOfServicesAr": [
      "تسجيل وحماية العلامات التجارية وبراءات الاختراع والتصاميم الصناعية وحقوق المؤلف",
      "صياغة ومراجعة عقود الامتياز التجاري (Franchise) وإعداد وثائق الإفصاح وقيدها",
      "التمثيل والترافع في دعاوى التعدي والمنافسة غير المشروعة أمام اللجان والمحاكم",
      "إعداد ومتابعة الطعون والاعتراضات على تسجيل العلامات التجارية لدى SAIP",
      "صياغة اتفاقيات حماية الأسرار التجارية وعدم الإفصاح (NDA) وسياسات الملكية الفكرية",
      "إدارة محفظة الأصول الفكرية للشركات وتقديم دراسات الفحص النافي للجهالة الفكرية"
    ],
    "scopeOfServicesEn": [
      "Registration and clearance of trademarks, patents, designs and copyrights",
      "Drafting franchise agreements, preparing franchise disclosure documents and registration",
      "Litigation of trademark infringement, counterfeiting and unfair competition claims",
      "Filing objections and appeals regarding trademark registrations before SAIP committees",
      "Drafting trade secret policies, non-disclosure agreements and IP compliance programs",
      "IP portfolio management and intellectual property due diligence for acquisitions"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "الفحص والتحقق المسبق",
        "titleEn": "Prior Search & Audit",
        "descriptionAr": "البحث في قواعد البيانات للتأكد من قابلية الحماية وعدم التعارض مع حقوق سابقة.",
        "descriptionEn": "Searching registries to verify registrability and absence of conflicting prior rights."
      },
      {
        "step": 2,
        "titleAr": "التسجيل والتحصين",
        "titleEn": "Registration & Shielding",
        "descriptionAr": "إيداع طلبات الحماية واستكمال الإجراءات حتى إصدار شهادات التسجيل الرسمية.",
        "descriptionEn": "Filing applications and securing official registration certificates from authorities."
      },
      {
        "step": 3,
        "titleAr": "التعاقد المحكم",
        "titleEn": "Contractual Structuring",
        "descriptionAr": "صياغة عقود الامتياز والترخيص ببنود واضحة تحدد الحقوق والالتزامات والحدود.",
        "descriptionEn": "Drafting franchise and licensing contracts setting clear boundaries and remedies."
      },
      {
        "step": 4,
        "titleAr": "الدفاع والملاحقة القضائية",
        "titleEn": "Enforcement & Litigation",
        "descriptionAr": "ملاحقة المعتدين قضائيًّا والمطالبة بوقف التعدي والتعويض عن الأضرار المادية والمعنوية.",
        "descriptionEn": "Enforcing rights against infringers, securing injunctions and compensation."
      }
    ],
    "valueToClientAr": "ملكية فكرية مسجلة ومحمية، وتوسع تجاري على أسس تعاقدية سليمة.",
    "valueToClientEn": "Registered, protected IP — and commercial growth on a sound contractual footing."
  },
  {
    "id": "foreign-investment",
    "sortOrder": 15,
    "titleAr": "الاستثمار الأجنبي والمعاملات الدولية",
    "titleEn": "Foreign Investment & Cross-Border Matters",
    "audiences": [
      "business"
    ],
    "iconName": "Globe2",
    "leadAxiomAr": "الاستثمار العابر للحدود يجمع أكثر من نظام قانوني في معاملة واحدة. نساعد المستثمرين على هيكلة استثماراتهم في المملكة، ونعالج المنازعات ذات العنصر الأجنبي، وننسق مع المختصين في الولايات القضائية الأخرى عند الحاجة بما يضمن امتثالاً كاملاً وحماية للمصالح.",
    "leadAxiomEn": "Cross-border investment brings more than one legal system into a single transaction. We help investors structure their investments in the Kingdom, resolve disputes with a foreign element, and coordinate with specialists in other jurisdictions where needed.",
    "problemsAddressedAr": [
      "تأسيس الشركات الأجنبية والمختلطة وإصدار تراخيص الاستثمار (MISA)",
      "متطلبات المقرات الإقليمية (RHQ) والامتثال للتنظيمات السعودية",
      "تنازع القوانين والاختصاص القضائي في العقود العابرة للحدود",
      "تنفيذ الأحكام القضائية وأحكام التحكيم الأجنبية داخل المملكة",
      "اتفاقيات المشاريع المشتركة (Joint Ventures) وتحالفات الشركات الدولية",
      "الامتثال للأنظمة الضريبية والجمركية وحماية الاستثمارات الأجنبية"
    ],
    "problemsAddressedEn": [
      "Incorporating foreign and joint-venture companies and MISA investment licenses",
      "Regional Headquarters (RHQ) statutory requirements and regulatory compliance",
      "Conflict of laws and jurisdictional choices in cross-border transactions",
      "Enforcement of foreign court judgments and international arbitral awards in KSA",
      "International joint-venture agreements and consortium arrangements",
      "Regulatory compliance with tax, customs and foreign investor protection rules"
    ],
    "scopeOfServicesAr": [
      "إصدار وتعديل تراخيص الاستثمار الأجنبي من وزارة الاستثمار (MISA)",
      "تأسيس فروع الشركات الأجنبية والشركات التابعة وبرامج المقرات الإقليمية",
      "صياغة اتفاقيات الشراكة والتحالفات الاستثمارية الدولية وفق الأنظمة السعودية",
      "تقديم دراسات الفحص النافي للجهالة القانونية (Legal Due Diligence) للصفقات",
      "تمثيل المستثمرين الدوليين أمام المحاكم وهيئات التحكيم في المملكة",
      "التنسيق مع مكاتب المحاماة الدولية في المعاملات والنزاعات متعددة الدول"
    ],
    "scopeOfServicesEn": [
      "Procuring and amending foreign investment licenses with MISA",
      "Establishing branches, subsidiaries and Regional Headquarters (RHQ) programs",
      "Drafting international shareholder agreements and consortium contracts under Saudi law",
      "Conducting comprehensive legal due diligence for mergers and cross-border deals",
      "Representing foreign investors before Saudi commercial courts and arbitral tribunals",
      "Coordinating with international counsel on multi-jurisdictional matters"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "التخطيط القانوني للدخول",
        "titleEn": "Market Entry Structuring",
        "descriptionAr": "تحديد الشكل الكياني الأنسب وبرنامج التراخيص وفق أنشطة المستثمر ومتطلباته.",
        "descriptionEn": "Selecting the optimal corporate vehicle and licensing route for investor activities."
      },
      {
        "step": 2,
        "titleAr": "الترخيص والتأسيس",
        "titleEn": "Licensing & Incorporation",
        "descriptionAr": "إصدار ترخيص MISA واستكمال السجلات التجارية والموافقات النظامية بسلاسة.",
        "descriptionEn": "Securing MISA licenses, commercial registrations and regulatory approvals seamlessly."
      },
      {
        "step": 3,
        "titleAr": "التحصين التعاقدي الدولي",
        "titleEn": "Cross-Border Contracting",
        "descriptionAr": "صياغة العقود ببنود محكمة لاختيار القانون وفض النزاعات تراعي المعايير الدولية والأنظمة المحلية.",
        "descriptionEn": "Drafting robust dispute resolution and governing law clauses aligned with local law."
      },
      {
        "step": 4,
        "titleAr": "الدعم المستمر وحل النزاع",
        "titleEn": "Ongoing Advisory & Advocacy",
        "descriptionAr": "مرافقة المستثمر في الامتثال الدوري وتمثيله بحزم عند نشوء أي نزاع تجاري.",
        "descriptionEn": "Guiding ongoing compliance and providing vigorous dispute advocacy if conflicts arise."
      }
    ],
    "valueToClientAr": "استثمار منظم من اليوم الأول، وعقود تحسم مسبقًا أين وكيف يُحل النزاع إذا وقع.",
    "valueToClientEn": "Investment organised from day one, and contracts that settle in advance where and how disputes are resolved."
  },
  {
    "id": "legal-advisory-governance",
    "sortOrder": 16,
    "titleAr": "الاستشارات القانونية والحوكمة",
    "titleEn": "Legal Advisory, Governance & Compliance",
    "audiences": [
      "business"
    ],
    "iconName": "ShieldCheck",
    "leadAxiomAr": "الاستشارة القانونية ليست إجابة عن سؤال فحسب، بل قراءة للنتائج قبل وقوعها. نقدم للأفراد والشركات رأيًا مكتوبًا واضحًا، ونبني أطر الحوكمة والامتثال التي تقلل المخاطر وتدعم القرار الاستراتيجي.",
    "leadAxiomEn": "Legal advice is not simply the answer to a question; it is a reading of consequences before they occur. We give individuals and companies clear written opinions, and build governance and compliance frameworks that mitigate risk and support decision-making.",
    "problemsAddressedAr": [
      "اتخاذ قرارات تجارية أو إدارية عالية المخاطر دون رأي قانوني مسند",
      "غياب اللوائح والسياسات الداخلية المنظمة للمسؤوليات والصلاحيات",
      "مخاطر عدم الامتثال للأنظمة واللوائح والتعليمات الرقابية الحديثة",
      "تعارض المصالح وضعف آليات الرقابة والإفصاح داخل مجالس الإدارة",
      "صياغة ومراجعة العقود الدورية والاتفاقيات التشغيلية للمنشأة",
      "حاجة المنشأة إلى مستشار قانوني دائم وموثوق بتكلفة محددة"
    ],
    "problemsAddressedEn": [
      "High-risk corporate or management decisions made without grounded legal advice",
      "Absence of internal policies governing responsibilities and delegations of authority",
      "Risks of regulatory non-compliance with newly enacted laws and directives",
      "Conflicts of interest and inadequate board disclosure and audit mechanisms",
      "Drafting and auditing routine commercial contracts and operating agreements",
      "Enterprise need for trusted ongoing legal counsel on a predictable retainer basis"
    ],
    "scopeOfServicesAr": [
      "إعداد الدراسات والآراء القانونية المكتوبة والمسبّبة في كافة المسائل والأنظمة",
      "بناء وتطوير لوائح الحوكمة وسياسات مجلس الإدارة ولجان المراجعة والترشيحات",
      "إعداد مصفوفات الصلاحيات الإدارية والمالية وسياسات تفادي تعارض المصالح",
      "صياغة ومراجعة العقود والاتفاقيات اليومية والاستراتيجية بكافة أنواعها",
      "برامج التدقيق القانوني وفحص الامتثال الدوري للأنظمة والتعليمات الحكومية",
      "اتفاقيات الاستشارة القانونية المستمرة (Retainer) لتوفير دعم يومي مستمر للمنشآت"
    ],
    "scopeOfServicesEn": [
      "Delivering reasoned written legal opinions and statutory studies across all legal matters",
      "Designing governance frameworks, board charters, audit and nomination committee bylaws",
      "Drafting authority delegation matrices and conflict-of-interest policies",
      "Drafting and reviewing day-to-day and strategic commercial contracts",
      "Legal compliance audits and regular reviews against new statutory directives",
      "Retained legal counsel agreements providing ongoing daily support for management"
    ],
    "methodologySteps": [
      {
        "step": 1,
        "titleAr": "فهم الأهداف والوقائع",
        "titleEn": "Understanding Context & Goals",
        "descriptionAr": "استيعاب هدف العميل والظروف المحيطة بالاستشارة قبل البدء في التحليل.",
        "descriptionEn": "Comprehending client objectives and factual background before starting analysis."
      },
      {
        "step": 2,
        "titleAr": "التكييف والبحث النظامي",
        "titleEn": "Statutory Research",
        "descriptionAr": "مطابقة الوقائع على النصوص النظامية واللوائح التنفيذية والسوابق القضائية المستقرة.",
        "descriptionEn": "Benchmarking facts against statutes, implementing regulations and judicial precedents."
      },
      {
        "step": 3,
        "titleAr": "تحليل الخيارات والمخاطر",
        "titleEn": "Risk & Options Evaluation",
        "descriptionAr": "بيان المسارات المتاحة لكل قرار مع توضيح كلفة ومخاطر كل خيار بوضوح.",
        "descriptionEn": "Outlining viable courses of action with clarity on costs, exposures and consequences."
      },
      {
        "step": 4,
        "titleAr": "الرأي المكتوب والتوصية",
        "titleEn": "Written Opinion & Action Plan",
        "descriptionAr": "تسليم رأي قانوني مكتوب بلغة مباشرة وحاسمة يقود إلى إجراءات عملية قابلة للتنفيذ.",
        "descriptionEn": "Delivering a direct written opinion and practical implementation recommendations."
      }
    ],
    "valueToClientAr": "قرارات تُتخذ على أرضية نظامية صلبة، ومخاطر تُدار قبل أن تتحول إلى نزاعات.",
    "valueToClientEn": "Decisions taken on firm ground, and risks managed before they become disputes."
  }
];

export function getPracticeAreaBySlug(slug: string): PracticeArea | undefined {
  return PRACTICE_AREAS.find((a) => a.id === slug);
}
