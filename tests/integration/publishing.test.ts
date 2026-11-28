import { describe, it, expect, beforeAll } from 'vitest';
import {
  publishServicePaired,
  unpublishService,
  getPublishedProjection,
} from '../../src/server/repositories/content';
import { seedFirestore } from '../../src/server/db/seed';

describe('Editorial Integrity & Paired Bilingual Publishing (A08, A09, A10)', () => {
  beforeAll(async () => {
    await seedFirestore();
  });
  it('Successfully publishes service paired across Arabic and English', async () => {
    const res = await publishServicePaired('commercial-corporate', 'admin-rma-01');
    expect(res.success).toBe(true);

    const arProjection = await getPublishedProjection('service', 'commercial-corporate', 'ar');
    const enProjection = await getPublishedProjection('service', 'commercial-corporate', 'en');

    expect(arProjection).toBeDefined();
    expect(arProjection?.title).toBe('القضايا التجارية والشركات');
    expect(enProjection).toBeDefined();
    expect(enProjection?.title).toBe('Commercial & Corporate Law');
  });

  it('Blocks unapproved or single-language publications', async () => {
    // Attempt publication by editor (unauthorized)
    await expect(publishServicePaired('commercial-corporate', 'admin-rma-03')).rejects.toThrow(
      /Forbidden/
    );
  });

  it('Instant unpublishing removes public projection without stale exposure', async () => {
    await unpublishService('commercial-corporate', 'admin-rma-01');

    const arProj = await getPublishedProjection('service', 'commercial-corporate', 'ar');
    const enProj = await getPublishedProjection('service', 'commercial-corporate', 'en');

    expect(arProj).toBeNull();
    expect(enProj).toBeNull();

    // Re-publish to keep baseline intact
    await publishServicePaired('commercial-corporate', 'admin-rma-01');
  });
});
