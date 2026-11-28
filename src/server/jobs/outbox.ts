import 'server-only';
import { listOutboxJobs, saveOutboxJob } from '../db/dal';
import { OutboxJob } from '../types';

export async function enqueueOutboxJob(
  type: 'inquiry_notification' | 'cache_invalidation',
  payload: Record<string, any>
): Promise<OutboxJob> {
  const jobId = `JOB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const nowIso = new Date().toISOString();
  const job: OutboxJob = {
    id: jobId,
    type,
    payload,
    status: 'pending',
    attempts: 0,
    maxAttempts: 5,
    nextAttemptAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await saveOutboxJob(job);
  return job;
}

export async function processOutboxJobs(): Promise<{ processed: number; failed: number }> {
  let processed = 0;
  let failed = 0;

  const jobs = await listOutboxJobs();
  for (const job of jobs) {
    if (job.status !== 'pending' && job.status !== 'failed') continue;

    job.status = 'processing';
    job.attempts += 1;
    job.updatedAt = new Date().toISOString();

    try {
      if (job.type === 'inquiry_notification') {
        console.log(
          `[OUTBOX NOTIFICATION] New inquiry received: ${job.payload.inquiryId}. Review in CMS: /admin/inquiries`
        );
      } else if (job.type === 'cache_invalidation') {
        console.log(`[OUTBOX CACHE] Invalidation triggered for tags:`, job.payload.tags);
      }

      job.status = 'completed';
      processed += 1;
    } catch (err: any) {
      job.lastError = err.message || 'Worker processing failure';
      if (job.attempts >= job.maxAttempts) {
        job.status = 'dead_letter';
      } else {
        job.status = 'failed';
        const delayMs = Math.pow(2, job.attempts) * 60000;
        job.nextAttemptAt = new Date(Date.now() + delayMs).toISOString();
      }
      failed += 1;
    }

    await saveOutboxJob(job);
  }

  return { processed, failed };
}
