import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { appendAuditLog } from '@/server/db/dal';
import { runtimeRateLimits } from './runtime-cache';

export function getClientIp(req: NextRequest | Request): string {
  if ('headers' in req) {
    const xForwardedFor = req.headers.get('x-forwarded-for');
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    const xRealIp = req.headers.get('x-real-ip');
    if (xRealIp) return xRealIp.trim();
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    if (cfConnectingIp) return cfConnectingIp.trim();
  }
  return '127.0.0.1';
}

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const entry = runtimeRateLimits.get(key);

  if (!entry || now > entry.expiresAt) {
    runtimeRateLimits.set(key, {
      count: 1,
      expiresAt: now + windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: windowSeconds,
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)),
    };
  }

  entry.count += 1;
  runtimeRateLimits.set(key, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetInSeconds: Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)),
  };
}

export async function logInvalidTokenProbe(
  ip: string,
  rawToken: string,
  userAgent?: string | null
): Promise<void> {
  const safeToken = typeof rawToken === 'string' ? rawToken : '';
  const prefix = safeToken.slice(0, 6);
  const hash = crypto.createHash('sha256').update(safeToken).digest('hex').slice(0, 8);
  const maskedSignature = `${prefix}...#${hash}`;

  const timestamp = new Date().toISOString();
  console.warn(
    `[SECURITY_AUDIT: INVALID_PAYMENT_TOKEN] Timestamp: ${timestamp} | IP: ${ip} | MaskedToken: ${maskedSignature} | UA: ${userAgent || 'unknown'}`
  );

  try {
    await appendAuditLog({
      actorUid: 'anonymous',
      actorEmail: `ip:${ip}`,
      action: 'payment.invalid_token_probe',
      targetType: 'payment_request',
      targetId: maskedSignature,
      details: {
        clientIp: ip,
        userAgent: userAgent || 'unknown',
        prefix,
        sha256Snippet: hash,
      },
      createdAt: timestamp,
    });
  } catch (err) {
    console.warn('[SECURITY_AUDIT] Failed to persist audit entry to Firestore:', err);
  }
}
