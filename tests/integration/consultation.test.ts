import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as handleCreateConsultation } from '@/app/api/consultations/route';
import { GET as handleListConsultations } from '@/app/api/admin/consultations/route';
import { PATCH as handlePatchConsultation } from '@/app/api/admin/consultations/[id]/route';
import { store } from '@/server/db/store';
import { encodeSessionPayload, SESSION_COOKIE_NAME } from '@/server/auth/session';

describe('Consultation Request Integration Flow', () => {
  beforeEach(() => {
    store.consultations.clear();
    store.idempotencyKeys.clear();
    store.rateLimits.clear();
    if (!store.admins.has('admin-rma-01')) {
      store.admins.set('admin-rma-01', {
        uid: 'admin-rma-01',
        email: 'admin@rma-law.sa',
        displayName: 'Riyadh Alzahrani',
        role: 'super_admin',
        isActive: true,
        mfaEnrolled: true,
        createdAt: '2026-11-12T10:00:00Z',
        updatedAt: '2026-11-12T10:00:00Z',
      });
    }
  });

  it('rejects consultation creation with missing or blank name', async () => {
    const req = new NextRequest('http://localhost:3000/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: '  ',
        phone: '0557775504',
        serviceId: 'general',
      }),
    });

    const res = await handleCreateConsultation(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Valid full name');
  });

  it('creates consultation request with pending status and generates valid WhatsApp URL', async () => {
    const req = new NextRequest('http://localhost:3000/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'فهد المنصور',
        phone: '0557775504',
        serviceId: 'corporate-governance',
        preferredLawyerId: 'riyadh-alzahrani',
        preferredDate: '2026-12-01',
        locale: 'ar',
      }),
    });

    const res = await handleCreateConsultation(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.reference).toMatch(/^CR-2026-\d{4}$/);
    expect(body.whatsappUrl).toContain('wa.me');
    expect(body.whatsappUrl).toContain(encodeURIComponent('CR-2026-'));

    // Check store
    const saved = Array.from(store.consultations.values())[0];
    expect(saved).toBeDefined();
    expect(saved.status).toBe('pending'); // Initial status strictly pending
    expect(saved.phone).toBe('+966557775504'); // Normalized
    expect(saved.fullName).toBe('فهد المنصور');
  });

  it('enforces idempotency on duplicate submissions with the same key', async () => {
    const payload = {
      fullName: 'منيرة التميمي',
      phone: '+966501234567',
      serviceId: 'labor-employment',
      locale: 'ar',
      idempotencyKey: 'IDEMP-TEST-KEY-12345',
    };

    const req1 = new NextRequest('http://localhost:3000/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res1 = await handleCreateConsultation(req1);
    const body1 = await res1.json();

    const req2 = new NextRequest('http://localhost:3000/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res2 = await handleCreateConsultation(req2);
    const body2 = await res2.json();

    expect(body1.reference).toBe(body2.reference);
    expect(store.consultations.size).toBe(1); // No duplicate created
  });

  it('rejects confirmation status if assigned lawyer or scheduled date is missing', async () => {
    // Seed an item
    const id = 'test-consult-001';
    store.consultations.set(id, {
      id,
      reference: 'CR-2026-9999',
      fullName: 'Client Test',
      phone: '+966500000000',
      serviceId: 'general',
      serviceLabelSnapshot: { ar: 'استفسار عام', en: 'General' },
      status: 'pending',
      locale: 'ar',
      notes: [],
      history: [],
      appointmentTimezone: 'Asia/Riyadh',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const adminToken = encodeSessionPayload('admin-rma-01', 'admin@rma-law.sa', 'admin');
    const req = new NextRequest(`http://localhost:3000/api/admin/consultations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${SESSION_COOKIE_NAME}=${adminToken}`,
      },
      body: JSON.stringify({
        status: 'confirmed',
        // assignedLawyerId omitted
        // scheduledAt omitted
      }),
    });

    const res = await handlePatchConsultation(req, { params: { id } });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('assigned lawyer');
  });

  it('successfully transitions from pending to confirmed when lawyer and appointment time are provided', async () => {
    const id = 'test-consult-002';
    store.consultations.set(id, {
      id,
      reference: 'CR-2026-9998',
      fullName: 'Client Confirmed Test',
      phone: '+966500000001',
      serviceId: 'commercial-litigation',
      serviceLabelSnapshot: { ar: 'التقاضي التجاري', en: 'Commercial Litigation' },
      status: 'pending',
      locale: 'ar',
      notes: [],
      history: [],
      appointmentTimezone: 'Asia/Riyadh',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const adminToken = encodeSessionPayload('admin-rma-01', 'admin@rma-law.sa', 'admin');
    const scheduledDate = '2026-11-20T14:00:00Z';

    const req = new NextRequest(`http://localhost:3000/api/admin/consultations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${SESSION_COOKIE_NAME}=${adminToken}`,
      },
      body: JSON.stringify({
        status: 'confirmed',
        assignedLawyerId: 'riyadh-alzahrani',
        scheduledAt: scheduledDate,
        meetingType: 'office',
        meetingAddress: 'الرياض - طريق الملك فهد',
        noteText: 'تم التنسيق مع العميل عبر واتساب وتثبيت الموعد.',
      }),
    });

    const res = await handlePatchConsultation(req, { params: { id } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.consultation.status).toBe('confirmed');
    expect(body.consultation.assignedLawyerId).toBe('riyadh-alzahrani');
    expect(body.consultation.notes.length).toBe(1);
    expect(body.consultation.notes[0].text).toContain('تم التنسيق');
    expect(body.consultation.history.some((h: any) => h.toStatus === 'confirmed')).toBe(true);
  });
});
