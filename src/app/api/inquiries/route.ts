import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createInquiry } from '@/server/repositories/inquiries';
import { AudienceTag, SupportedLocale } from '@/server/types';

const InquirySchema = z.object({
  audience: z.enum(['individual', 'business']),
  name: z.string().min(2).max(120),
  phoneE164: z.string().min(7).max(25),
  email: z.string().email().optional(),
  companyName: z.string().max(160).optional(),
  serviceId: z.string().optional(),
  message: z.string().min(15).max(2500),
  locale: z.enum(['ar', 'en']),
  noticeVersion: z.string().default('1.0'),
  honeypot: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = InquirySchema.parse(json);

    // Derive network identifier hash for rate limiting
    const forwarded = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const clientIp = forwarded.split(',')[0].trim();
    // Simple fast hash
    let hash = 0;
    for (let i = 0; i < clientIp.length; i++) {
      hash = (hash << 5) - hash + clientIp.charCodeAt(i);
      hash |= 0;
    }
    const clientIpHash = `ip-${Math.abs(hash)}`;

    const result = await createInquiry({
      audience: parsed.audience as AudienceTag,
      name: parsed.name,
      phoneE164: parsed.phoneE164,
      email: parsed.email,
      companyName: parsed.companyName,
      serviceId: parsed.serviceId,
      message: parsed.message,
      locale: parsed.locale as SupportedLocale,
      noticeVersion: parsed.noticeVersion,
      honeypot: parsed.honeypot,
      idempotencyKey: parsed.idempotencyKey,
      clientIpHash,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    const status = err.message?.includes('Rate limit') ? 429 : 500;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status });
  }
}
