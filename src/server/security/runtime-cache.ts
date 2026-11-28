/**
 * Process-local runtime cache exclusively for short-lived anti-spam rate limits
 * and request idempotency keys (non-persistent telemetry/throttling).
 */

interface RateLimitEntry {
  count: number;
  expiresAt: number;
}

interface IdempotencyEntry {
  result: any;
  expiresAt: number;
}

const g = globalThis as unknown as {
  __rmaRateLimits?: Map<string, RateLimitEntry>;
  __rmaIdempotencyKeys?: Map<string, IdempotencyEntry>;
};

export const runtimeRateLimits: Map<string, RateLimitEntry> =
  g.__rmaRateLimits || (g.__rmaRateLimits = new Map());

export const runtimeIdempotencyKeys: Map<string, IdempotencyEntry> =
  g.__rmaIdempotencyKeys || (g.__rmaIdempotencyKeys = new Map());

export function clearRuntimeCaches(): void {
  runtimeRateLimits.clear();
  runtimeIdempotencyKeys.clear();
}
