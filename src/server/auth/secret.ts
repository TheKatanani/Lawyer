import crypto from 'crypto';

/**
 * Resolves a consistent signing/encryption secret across serverless Lambdas.
 * Uses SESSION_SECRET / ADMIN_SESSION_SECRET / JWT_SECRET when set, with a
 * deterministic server-env seed fallback for staging environments.
 */
export function getServerSigningSecret(): string {
  const configured =
    process.env.SESSION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim();

  if (configured && configured.length >= 16) {
    return configured;
  }

  const seedMaterial = [
    process.env.ADMIN_INITIAL_PASSWORD || 'RMA@Legal2026!',
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'lawyer-ad052',
    process.env.CLOUDINARY_API_SECRET || 'rma-legal-jwt-hmac-v1',
  ].join('|');

  return crypto.createHash('sha256').update(seedMaterial).digest('hex');
}
