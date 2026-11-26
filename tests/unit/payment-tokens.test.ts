import { describe, it, expect } from 'vitest';
import {
  deriveSamplePaymentToken,
  sealPaymentToken,
  unsealPaymentToken,
} from '@/server/payments/tokens';
import { store } from '@/server/db/store';

describe('Cross-Lambda Payment Tokens', () => {
  it('derives deterministic tokens for built-in sample payment requests', () => {
    const t1a = deriveSamplePaymentToken('PR-2026-0001');
    const t1b = deriveSamplePaymentToken('PR-2026-0001');
    const t2 = deriveSamplePaymentToken('PR-2026-0002');

    expect(t1a).toBe(t1b);
    expect(t1a).not.toBe(t2);
    expect(t1a.length).toBeGreaterThanOrEqual(24);
  });

  it('seals and unseals payment request tokens cleanly across calls', () => {
    const token = sealPaymentToken({
      id: 'PR-2099-0042',
      clientName: 'شركة اختبار القانونية',
      serviceCategory: 'commercial-litigation',
      amountMinor: 250000,
      description: 'أتعاب دراسة ملف',
      createdAt: '2026-11-26T10:00:00.000Z',
      expiresAt: '2026-12-03T10:00:00.000Z',
    });

    expect(token.startsWith('v1.')).toBe(true);

    const decoded = unsealPaymentToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe('PR-2099-0042');
    expect(decoded?.clientName).toBe('شركة اختبار القانونية');
    expect(decoded?.serviceCategory).toBe('commercial-litigation');
    expect(decoded?.amountMinor).toBe(250000);
    expect(decoded?.amountSar).toBe(2500);
    expect(decoded?.status).toBe('unpaid');
    expect(decoded?.expiresAt).toBe('2026-12-03T10:00:00.000Z');
  });

  it('rejects tampered or invalid payment tokens', () => {
    const token = sealPaymentToken({
      id: 'PR-2099-0043',
      clientName: 'Test Client',
      serviceCategory: 'general',
      amountMinor: 50000,
      description: 'Initial consultation fee',
      createdAt: '2026-11-26T10:00:00.000Z',
    });

    const midIdx = Math.floor(token.length / 2);
    const midReplacement = token[midIdx] === 'A' ? 'B' : 'A';
    const tamperedMid = token.slice(0, midIdx) + midReplacement + token.slice(midIdx + 1);
    const lastChar = token.slice(-1) === 'A' ? 'B' : 'A';
    const tamperedEnd = token.slice(0, -1) + lastChar;

    expect(unsealPaymentToken(tamperedMid)).toBeNull();
    expect(unsealPaymentToken(tamperedEnd)).toBeNull();
    expect(unsealPaymentToken('demo-token-1')).toBeNull();
    expect(unsealPaymentToken('')).toBeNull();
  });

  it('hydrates an uncached sealed token in store.getPaymentRequestByToken', () => {
    const token = sealPaymentToken({
      id: 'PR-2099-0099',
      clientName: 'عميل عابر للخوادم',
      serviceCategory: 'corporate',
      amountMinor: 150000,
      description: 'صياغة عقد تأسيس',
      createdAt: '2026-11-26T12:00:00.000Z',
    });

    const resolved = store.getPaymentRequestByToken(token);
    expect(resolved).toBeDefined();
    expect(resolved?.id).toBe('PR-2099-0099');
    expect(resolved?.amountSar).toBe(1500);
    expect(resolved?.status).toBe('unpaid');
  });
});
