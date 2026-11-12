import { store } from '../db/store';
import { OutboxJob } from '../types';

export async function enqueueOutboxJob(
  type: 'inquiry_notification' | 'cache_invalidation',
  payload: Record<string, any>
): Promise<OutboxJob> {
  const jobId = `JOB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const job: OutboxJob = {
    id: jobId,
    type,
    payload,
    status: 'pending',
    attempts: 0,
    maxAttempts: 5,
    nextAttemptAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.outboxJobs.set(jobId, job);
  return job;
}

export async function processOutboxJobs(): Promise<{ processed: number; failed: number }> {
  let processed = 0;
  let failed = 0;

  for (const job of Array.from(store.outboxJobs.values())) {
    if (job.status !== 'pending' && job.status !== 'failed') continue;

    job.status = 'processing';
    job.attempts += 1;
    job.updatedAt = new Date().toISOString();

    try {
      if (job.type === 'inquiry_notification') {
        // Dispatches minimal notification containing dashboard URL, omitting full client PII from email
        // In dev/test: safely logs to operational sink
        console.log(`[OUTBOX NOTIFICATION] New inquiry received: ${job.payload.inquiryId}. Review in CMS: /admin/inquiries`);
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
        // Exponential backoff
        const delayMs = Math.pow(2, job.attempts) * 60000;
        job.nextAttemptAt = new Date(Date.now() + delayMs).toISOString();
      }
      failed += 1;
    }
  }

  return { processed, failed };
}
