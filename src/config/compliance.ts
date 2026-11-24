/**
 * Firm Profile & Compliance Configuration
 * Source of Truth: "Riyadh AlZahrani Royal Bilingual Corporate Profile" (PDF)
 */

export const FIRM_DETAILS = {
  nameAr: 'شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية',
  nameEn: 'Riyadh Mohammed Alzahrani Law Firm & Legal Consultations',
  shortNameAr: 'رياض الزهراني للمحاماة',
  shortNameEn: 'Riyadh Alzahrani Law Firm',
  taglineAr: 'نقرأ النزاع قبل أن يصل إلى المحكمة، ونقرأ أدلته قبل أن تتحول إلى مرافعة',
  taglineEn: 'We read the dispute before it reaches court — and its evidence before it becomes a pleading.',
  
  // Contact
  phone: '+966 55 777 5504',
  phoneDisplay: '+966 55 777 5504',
  phoneRaw: '+966557775504',
  whatsapp: '+966 55 777 5504',
  whatsappUrl: 'https://wa.me/966557775504',
  email: 'info@riyadhalzahrani.com',
  website: 'www.riyadhalzahrani.com',
  websiteUrl: 'https://www.riyadhalzahrani.com',
  
  // Exact addresses from PDF (page 55)
  addressAr: 'برج هيدكوارترز، الدور 46، مكتب 4602، شارع الكورنيش، حي الشاطئ، جدة',
  addressEn: 'Headquarters Tower, Floor 46, Office 4602, Corniche Road, Al Shati District, Jeddah',
  cityAr: 'جدة',
  cityEn: 'Jeddah',
  countryAr: 'المملكة العربية السعودية',
  countryEn: 'Kingdom of Saudi Arabia',
};

/**
 * Flags for claims and details that are NOT present in the official PDF.
 * In accordance with client instruction, these are neutralized and kept behind flags.
 */
export const UNVERIFIED_CLAIMS_CONFIG = {
  // TODO [Pending Written Client Confirmation]: License number was cited as 4112. Awaiting official MOJ license certificate.
  enableMojLicenseNumber: false,
  mojLicenseNumber: '4112',

  // TODO [Pending Written Client Confirmation]: Metric counter (950+ / 1,200+ completed cases).
  enableCompletedCasesCounter: false,

  // TODO [Pending Written Client Confirmation]: "100% compliance" claim.
  enable100PercentComplianceClaim: false,

  // TODO [Pending Written Client Confirmation]: "24 hours response" SLA.
  enable24HoursResponseClaim: false,

  // TODO [Pending Written Client Confirmation]: Office working hours (Sun-Thu 9:00 AM - 5:00 PM).
  enableOfficialWorkingHours: false,
  workingHoursAr: 'الأحد - الخميس: 9:00 ص إلى 5:00 م',
  workingHoursEn: 'Sun - Thu: 9:00 AM to 5:00 PM AST',

  // TODO [Pending Written Client Confirmation]: Dr. Abdulrahman Al-Otaibi is absent from the approved PDF profile.
  enableUnconfirmedTeamMembers: false,
};

export const PENDING_CLIENT_CONFIRMATIONS_TODO = [
  {
    id: 'TODO-MOJ-LICENSE',
    itemAr: 'رقم ترخيص وزارة العدل (4112)',
    itemEn: 'MOJ License No. (4112)',
    status: 'HIDDEN',
    requirement: 'تأكيد كتابي مع صورة ترخيص مزاولة مهنة المحاماة الصادر من وزارة العدل.',
  },
  {
    id: 'TODO-METRIC-COUNTERS',
    itemAr: 'عدادات القضايا المنجزة (950+ قضية / 24 ساعة استجابة / 100% امتثال)',
    itemEn: 'Completed Cases & Turnaround Metrics (950+ / 24h / 100%)',
    status: 'HIDDEN',
    requirement: 'إثبات وإقرار كتابي بحجم المحفظة القضائية المنجزة والمدد الزمنية للرد.',
  },
  {
    id: 'TODO-TEAM-ALOTAIBI',
    itemAr: 'ملف المستشار د. عبد الرحمن العتيبي',
    itemEn: 'Dr. Abdulrahman Al-Otaibi Profile',
    status: 'HIDDEN',
    requirement: 'تأكيد كتابي وتزويد السيرة المهنية المعتمدة لإدراجه ضمن الملف المؤسسي.',
  },
  {
    id: 'TODO-OFFICE-HOURS',
    itemAr: 'ساعات العمل الرسمية وأيام الاستقبال (الأحد-الخميس 9-5)',
    itemEn: 'Office Working Hours (Sun-Thu 9-5)',
    status: 'HIDDEN',
    requirement: 'تأكيد أوقات الدوام الرسمي لفرع برج هيدكوارترز بجدة.',
  },
];
