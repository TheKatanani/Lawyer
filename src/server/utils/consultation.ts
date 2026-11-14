import { SupportedLocale } from '../types';

export function normalizePhoneE164(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }
  if (!cleaned.startsWith('+')) {
    // Default to Saudi Arabia +966 if leading zero or bare national number
    if (cleaned.startsWith('0')) {
      cleaned = '+966' + cleaned.slice(1);
    } else {
      cleaned = '+' + cleaned;
    }
  }
  return cleaned;
}

export function buildWhatsAppMessage({
  reference,
  fullName,
  phone,
  serviceName,
  preferredLawyer,
  preferredDate,
  locale,
}: {
  reference: string;
  fullName: string;
  phone: string;
  serviceName: string;
  preferredLawyer?: string | null;
  preferredDate?: string | null;
  locale: SupportedLocale;
}): string {
  if (locale === 'ar') {
    const lines = [
      'السلام عليكم، أرسلت طلب استشارة عبر موقعكم.',
      `رقم الطلب: ${reference}`,
      `الاسم: ${fullName}`,
      `رقم التواصل: ${phone}`,
      `الخدمة: ${serviceName}`,
    ];
    if (preferredLawyer && preferredLawyer.trim()) {
      lines.push(`المحامي المفضّل: ${preferredLawyer}`);
    }
    if (preferredDate && preferredDate.trim()) {
      lines.push(`اليوم المفضّل: ${preferredDate}`);
    }
    lines.push('أرجو التواصل لتأكيد موعد مناسب.');
    return lines.join('\n');
  }

  // English
  const lines = [
    'Hello, I submitted a consultation request through your website.',
    `Reference: ${reference}`,
    `Name: ${fullName}`,
    `Phone: ${phone}`,
    `Service: ${serviceName}`,
  ];
  if (preferredLawyer && preferredLawyer.trim()) {
    lines.push(`Preferred lawyer: ${preferredLawyer}`);
  }
  if (preferredDate && preferredDate.trim()) {
    lines.push(`Preferred day: ${preferredDate}`);
  }
  lines.push('Please help me confirm a suitable appointment time.');
  return lines.join('\n');
}
