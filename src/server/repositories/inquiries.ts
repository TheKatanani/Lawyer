import { store } from '../db/store';
import { ContactRequest, InquiryStatus, AudienceTag, SupportedLocale, Role } from '../types';
import { assertCapability } from '../permissions/rbac';
import { enqueueOutboxJob } from '../jobs/outbox';

export interface CreateInquiryInput {
  audience: AudienceTag;
  name: string;
  phoneE164: string;
  email?: string;
  companyName?: string;
  serviceId?: string;
  message: string;
  locale: SupportedLocale;
  noticeVersion: string;
  idempotencyKey?: string;
  honeypot?: string;
  clientIpHash?: string;
}

export async function createInquiry(input: CreateInquiryInput) {
  // 1. Honeypot anti-bot verification
  if (input.honeypot && input.honeypot.trim().length > 0) {
    // Silently drop spam without notifying bot
    return {
      success: true,
      referenceNumber: `RMA-INQ-${Math.floor(100000 + Math.random() * 900000)}`,
      receivedAt: new Date().toISOString(),
    };
  }

  // 2. Sliding window distributed rate limiting
  const ipHash = input.clientIpHash || 'default-network';
  const now = Date.now();
  const rateLimit = store.rateLimits.get(ipHash);
  if (rateLimit) {
    if (rateLimit.expiresAt > now) {
      if (rateLimit.count >= 5) {
        throw new Error('Rate limit exceeded. Please wait 10 minutes before submitting another request.');
      }
      rateLimit.count += 1;
    } else {
      store.rateLimits.set(ipHash, { count: 1, expiresAt: now + 600000 }); // 10 minutes
    }
  } else {
    store.rateLimits.set(ipHash, { count: 1, expiresAt: now + 600000 });
  }

  // 3. Idempotency Check
  if (input.idempotencyKey) {
    const cached = store.idempotencyKeys.get(input.idempotencyKey);
    if (cached && cached.expiresAt > now) {
      return cached.result;
    }
  }

  // 4. Generate reference number
  const referenceNumber = `RMA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const inquiry: ContactRequest = {
    id: referenceNumber,
    audience: input.audience,
    name: input.name.trim(),
    phoneE164: input.phoneE164.trim(),
    email: input.email?.trim() || undefined,
    companyName: input.companyName?.trim() || undefined,
    serviceId: input.serviceId || undefined,
    message: input.message.trim(),
    locale: input.locale,
    status: 'new',
    noticeVersion: input.noticeVersion,
    acknowledgedAt: new Date().toISOString(),
    retentionClass: 'INQUIRY_ACTIVE',
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 5. Store inquiry
  store.inquiries.set(inquiry.id, inquiry);

  // 6. Enqueue Outbox notification job
  await enqueueOutboxJob('inquiry_notification', {
    inquiryId: inquiry.id,
    name: inquiry.name,
    audience: inquiry.audience,
    locale: inquiry.locale,
    serviceId: inquiry.serviceId,
  });

  const response = {
    success: true,
    referenceNumber: inquiry.id,
    receivedAt: inquiry.createdAt,
  };

  // Cache idempotency response for 24 hours
  if (input.idempotencyKey) {
    store.idempotencyKeys.set(input.idempotencyKey, {
      result: response,
      expiresAt: now + 86400000,
    });
  }

  return response;
}

export async function listInquiries(
  actorRole: Role,
  statusFilter?: InquiryStatus
): Promise<ContactRequest[]> {
  assertCapability(actorRole, 'inquiries.read');

  const all = Array.from(store.inquiries.values());
  const filtered = statusFilter ? all.filter((i) => i.status === statusFilter) : all;
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getInquiryById(actorRole: Role, id: string): Promise<ContactRequest | null> {
  assertCapability(actorRole, 'inquiries.read');
  return store.inquiries.get(id) || null;
}

export async function updateInquiryStatus(
  actorUid: string,
  id: string,
  newStatus: InquiryStatus,
  noteText?: string
) {
  const actor = store.admins.get(actorUid);
  if (!actor) throw new Error('Unauthorized');
  assertCapability(actor.role, 'inquiries.update');

  const inquiry = store.inquiries.get(id);
  if (!inquiry) throw new Error('Inquiry not found');

  const oldStatus = inquiry.status;
  inquiry.status = newStatus;
  inquiry.updatedAt = new Date().toISOString();

  if (noteText && noteText.trim().length > 0) {
    inquiry.notes.push({
      id: `NOTE-${Date.now()}`,
      authorUid: actor.uid,
      authorName: actor.displayName,
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    });
  }

  store.auditLogs.unshift({
    id: `AUDIT-${Date.now()}`,
    actorUid: actor.uid,
    actorEmail: actor.email,
    action: 'INQUIRY_STATUS_CHANGED',
    targetType: 'contactRequest',
    targetId: id,
    details: { oldStatus, newStatus },
    createdAt: new Date().toISOString(),
  });

  return inquiry;
}

export async function exportInquiriesToCsv(actorRole: Role): Promise<string> {
  assertCapability(actorRole, 'inquiries.export');

  const list = Array.from(store.inquiries.values());
  const headers = ['Reference', 'Date', 'Audience', 'Name', 'Phone', 'Company', 'Service', 'Status'];

  // Sanitize formula injection
  const sanitize = (val: string | undefined) => {
    if (!val) return '""';
    let s = val.replace(/"/g, '""');
    if (/^[=+@-]$/.test(s.charAt(0))) {
      s = `'${s}`;
    }
    return `"${s}"`;
  };

  const rows = list.map((i) =>
    [
      sanitize(i.id),
      sanitize(i.createdAt),
      sanitize(i.audience),
      sanitize(i.name),
      sanitize(i.phoneE164),
      sanitize(i.companyName),
      sanitize(i.serviceId),
      sanitize(i.status),
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
