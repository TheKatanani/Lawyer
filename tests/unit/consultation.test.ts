import { describe, it, expect } from 'vitest';
import { normalizePhoneE164, buildWhatsAppMessage } from '@/server/utils/consultation';
import { hasCapability, ROLE_CAPABILITIES } from '@/server/permissions/rbac';

describe('Consultation Phone Normalization', () => {
  it('normalizes local Saudi numbers starting with 05 to +9665', () => {
    expect(normalizePhoneE164('0557775504')).toBe('+966557775504');
    expect(normalizePhoneE164('0501234567')).toBe('+966501234567');
  });

  it('normalizes numbers starting with 00 to +', () => {
    expect(normalizePhoneE164('00966557775504')).toBe('+966557775504');
    expect(normalizePhoneE164('00971501234567')).toBe('+971501234567');
  });

  it('preserves valid international numbers already starting with +', () => {
    expect(normalizePhoneE164('+966557775504')).toBe('+966557775504');
    expect(normalizePhoneE164('+14155552671')).toBe('+14155552671');
    expect(normalizePhoneE164('+442071838750')).toBe('+442071838750');
  });

  it('strips non-digit formatting characters such as dashes, spaces, and parentheses', () => {
    expect(normalizePhoneE164('+966 (55) 777-5504')).toBe('+966557775504');
  });

  it('strips redundant national leading zero immediately after international dial code', () => {
    expect(normalizePhoneE164('+9660551234567')).toBe('+966551234567');
    expect(normalizePhoneE164('+9710501234567')).toBe('+971501234567');
  });
});

describe('WhatsApp Localized Message Builder', () => {
  it('builds Arabic message template with all provided preferences', () => {
    const msg = buildWhatsAppMessage({
      reference: 'CR-2026-0099',
      fullName: 'عبدالله بن أحمد',
      phone: '+966501112233',
      serviceName: 'التقاضي التجاري',
      preferredLawyer: 'أ. رياض محمد الزهراني',
      preferredDate: '2026-11-25',
      locale: 'ar',
    });

    expect(msg).toContain('السلام عليكم، أرسلت طلب استشارة عبر موقعكم.');
    expect(msg).toContain('رقم الطلب: CR-2026-0099');
    expect(msg).toContain('الاسم: عبدالله بن أحمد');
    expect(msg).toContain('الخدمة: التقاضي التجاري');
    expect(msg).toContain('المحامي المفضّل: أ. رياض محمد الزهراني');
    expect(msg).toContain('اليوم المفضّل: 2026-11-25');
    expect(msg).toContain('أرجو التواصل لتأكيد موعد مناسب.');
  });

  it('omits lawyer and date lines when optional preferences are null in Arabic', () => {
    const msg = buildWhatsAppMessage({
      reference: 'CR-2026-0100',
      fullName: 'خالد السعد',
      phone: '+966509998877',
      serviceName: 'استفسار عام',
      preferredLawyer: null,
      preferredDate: null,
      locale: 'ar',
    });

    expect(msg).toContain('رقم الطلب: CR-2026-0100');
    expect(msg).not.toContain('المحامي المفضّل');
    expect(msg).not.toContain('اليوم المفضّل');
  });

  it('builds English message template correctly', () => {
    const msg = buildWhatsAppMessage({
      reference: 'CR-2026-0101',
      fullName: 'David Miller',
      phone: '+966558889900',
      serviceName: 'Foreign Investment',
      preferredLawyer: 'Senior Counsel',
      preferredDate: '2026-11-28',
      locale: 'en',
    });

    expect(msg).toContain('Hello, I submitted a consultation request through your website.');
    expect(msg).toContain('Reference: CR-2026-0101');
    expect(msg).toContain('Name: David Miller');
    expect(msg).toContain('Service: Foreign Investment');
    expect(msg).toContain('Preferred lawyer: Senior Counsel');
    expect(msg).toContain('Preferred day: 2026-11-28');
    expect(msg).toContain('Please help me confirm a suitable appointment time.');
  });
});

describe('Consultation RBAC Capabilities', () => {
  it('allows super_admin, admin, and inquiry_manager to read and update inquiries/consultations', () => {
    expect(hasCapability('super_admin', 'inquiries.read')).toBe(true);
    expect(hasCapability('super_admin', 'inquiries.update')).toBe(true);

    expect(hasCapability('admin', 'inquiries.read')).toBe(true);
    expect(hasCapability('admin', 'inquiries.update')).toBe(true);

    expect(hasCapability('inquiry_manager', 'inquiries.read')).toBe(true);
    expect(hasCapability('inquiry_manager', 'inquiries.update')).toBe(true);
  });

  it('strictly forbids content editors from reading or updating inquiries/consultations', () => {
    expect(hasCapability('editor', 'inquiries.read')).toBe(false);
    expect(hasCapability('editor', 'inquiries.update')).toBe(false);
  });
});
