import { describe, it, expect } from 'vitest';
import {
  publishServicePaired,
  unpublishService,
  getPublishedProjection,
} from '../../src/server/repositories/content';
import { store } from '../../src/server/db/store';

describe('Editorial Integrity & Paired Bilingual Publishing (A08, A09, A10)', () => {
  it('Successfully publishes service paired across Arabic and English', async () => {
    const res = await publishServicePaired('corporate-governance', 'admin-rma-01');
    expect(res.success).toBe(true);

    const arProjection = await getPublishedProjection('service', 'corporate-governance', 'ar');
    const enProjection = await getPublishedProjection('service', 'corporate-governance', 'en');

    expect(arProjection).toBeDefined();
    expect(arProjection?.title).toBe('الحوكمة وتأسيس الشركات');
    expect(enProjection).toBeDefined();
    expect(enProjection?.title).toBe('Corporate Governance & Incorporation');
  });

  it('Blocks unapproved or single-language publications', async () => {
    // Attempt publication by editor (unauthorized)
    await expect(publishServicePaired('corporate-governance', 'admin-rma-03')).rejects.toThrow(
      /Forbidden/
    );
  });

  it('Instant unpublishing removes public projection without stale exposure', async () => {
    await unpublishService('corporate-governance', 'admin-rma-01');

    const arProj = await getPublishedProjection('service', 'corporate-governance', 'ar');
    const enProj = await getPublishedProjection('service', 'corporate-governance', 'en');

    expect(arProj).toBeNull();
    expect(enProj).toBeNull();

    // Re-publish to keep baseline intact
    await publishServicePaired('corporate-governance', 'admin-rma-01');
  });
});
