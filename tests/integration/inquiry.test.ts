import { describe, it, expect, beforeEach } from 'vitest';
import { createInquiry, listInquiries, updateInquiryStatus, exportInquiriesToCsv } from '../../src/server/repositories/inquiries';
import { getInquiryDoc, listInquiriesDocs } from '../../src/server/db/dal';
import { seedFirestore } from '../../src/server/db/seed';
import { clearRuntimeCaches } from '../../src/server/security/runtime-cache';

describe('Intake, Anti-Spam & Operational Security (A14, A15, A16, A17)', () => {
  beforeEach(async () => {
    clearRuntimeCaches();
    await seedFirestore();
  });
  it('Successfully persists valid client consultation inquiry with durable reference', async () => {
    const res = await createInquiry({
      audience: 'business',
      name: 'سلطان القحطاني',
      phoneE164: '+966509876543',
      email: 'sultan@qahtani.com',
      companyName: 'مجموعة القحطاني للتجارة',
      serviceId: 'commercial-litigation',
      message: 'طلب استشارة في نزاع توريد تجاري وتنفيذ حكم تحكيمي.',
      locale: 'ar',
      noticeVersion: '1.0',
      clientIpHash: 'ip-test-valid-1',
    });

    expect(res.success).toBe(true);
    expect(res.referenceNumber).toMatch(/^RMA-\d{4}-\d+/);

    // Verify stored record
    const stored = await getInquiryDoc(res.referenceNumber);
    expect(stored).toBeDefined();
    expect(stored?.name).toBe('سلطان القحطاني');
    expect(stored?.phoneE164).toBe('+966509876543');
    expect(stored?.status).toBe('new');
  });

  it('Enforces idempotency: identical idempotencyKey returns cached confirmation without duplicate record', async () => {
    const key = `test-idemp-${Date.now()}`;
    const first = await createInquiry({
      audience: 'individual',
      name: 'خالد بن ناصر',
      phoneE164: '+966551122334',
      message: 'استشارة قانونية في قسمة تركة عقارية واستخراج صك حصر ورثة.',
      locale: 'ar',
      noticeVersion: '1.0',
      idempotencyKey: key,
      clientIpHash: 'ip-test-idemp-1',
    });

    const second = await createInquiry({
      audience: 'individual',
      name: 'خالد بن ناصر',
      phoneE164: '+966551122334',
      message: 'استشارة قانونية في قسمة تركة عقارية واستخراج صك حصر ورثة.',
      locale: 'ar',
      noticeVersion: '1.0',
      idempotencyKey: key,
      clientIpHash: 'ip-test-idemp-1',
    });

    expect(first.referenceNumber).toBe(second.referenceNumber);
  });

  it('Silently drops spam submissions that fill the honeypot field', async () => {
    const res = await createInquiry({
      audience: 'individual',
      name: 'Spam Bot',
      phoneE164: '+1234567890',
      message: 'Buy cheap watches online now!',
      locale: 'en',
      noticeVersion: '1.0',
      honeypot: 'http://spamsite.xyz',
      clientIpHash: 'ip-test-honeypot',
    });

    expect(res.success).toBe(true);
    // Verified that the honeypot submission was NOT persisted to live inquiries
    const found = (await listInquiriesDocs()).find((i) => i.name === 'Spam Bot');
    expect(found).toBeUndefined();
  });

  it('Enforces distributed rate limiting on abusive submissions', async () => {
    const abusiveIp = `ip-abuse-${Date.now()}`;

    // Submit 5 valid requests
    for (let i = 0; i < 5; i++) {
      await createInquiry({
        audience: 'individual',
        name: `Tester ${i}`,
        phoneE164: `+96650000000${i}`,
        message: 'Valid inquiry message for rate limiting testing.',
        locale: 'ar',
        noticeVersion: '1.0',
        clientIpHash: abusiveIp,
      });
    }

    // 6th attempt should be rejected with Rate limit exceeded
    await expect(
      createInquiry({
        audience: 'individual',
        name: 'Abusive 6th',
        phoneE164: '+966500000006',
        message: 'Should be rejected by rate limiter.',
        locale: 'ar',
        noticeVersion: '1.0',
        clientIpHash: abusiveIp,
      })
    ).rejects.toThrow(/Rate limit exceeded/);
  });

  it('Sanitizes spreadsheet formula injection in CSV export', async () => {
    // Insert an inquiry with malicious formula prefix
    await createInquiry({
      audience: 'business',
      name: '=cmd|/c calc!A0',
      phoneE164: '+966599999999',
      companyName: '@SUM(1+1)*cmd',
      message: 'Testing formula injection mitigation.',
      locale: 'en',
      noticeVersion: '1.0',
      clientIpHash: 'ip-formula-test',
    });

    const csv = await exportInquiriesToCsv('super_admin');
    expect(csv).toContain("\"'=cmd|/c calc!A0\"");
    expect(csv).toContain("\"'@SUM(1+1)*cmd\"");
  });
});
