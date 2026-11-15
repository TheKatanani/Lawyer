import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { store } from '@/server/db/store';
import { ConsultationStatus } from '@/server/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'inquiries.read');

    const consultation = store.consultations.get(params.id);
    if (!consultation) {
      return NextResponse.json({ error: 'Consultation request not found.' }, { status: 404 });
    }

    return NextResponse.json({ consultation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    assertCapability(user.role, 'inquiries.update');

    const consultation = store.consultations.get(params.id);
    if (!consultation) {
      return NextResponse.json({ error: 'Consultation request not found.' }, { status: 404 });
    }

    const body = await req.json();
    const {
      status,
      assignedLawyerId,
      scheduledAt,
      meetingType,
      meetingLink,
      meetingAddress,
      noteText,
    } = body;

    const previousStatus = consultation.status;
    const nowIso = new Date().toISOString();

    // 1. Status transition validation
    if (status && status !== previousStatus) {
      const validStatuses: ConsultationStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
      }

      // Specification requirement:
      // "Require assigned lawyer and a valid agreed appointment date/time before confirming."
      const effectiveLawyer = assignedLawyerId !== undefined ? assignedLawyerId : consultation.assignedLawyerId;
      const effectiveSchedule = scheduledAt !== undefined ? scheduledAt : consultation.scheduledAt;

      if (status === 'confirmed') {
        if (!effectiveLawyer || effectiveLawyer.trim() === '') {
          return NextResponse.json(
            { error: 'An assigned lawyer must be selected before confirming a consultation.' },
            { status: 400 }
          );
        }
        if (!effectiveSchedule || effectiveSchedule.trim() === '') {
          return NextResponse.json(
            { error: 'An agreed appointment date & time must be specified before confirming a consultation.' },
            { status: 400 }
          );
        }
      }

      consultation.status = status;
      consultation.history.push({
        id: `H-${Date.now()}`,
        actorEmail: user.email,
        action: `STATUS_CHANGE_TO_${status.toUpperCase()}`,
        fromStatus: previousStatus,
        toStatus: status,
        details: {
          assignedLawyer: effectiveLawyer,
          scheduledAt: effectiveSchedule,
        },
        timestamp: nowIso,
      });
    }

    // 2. Lawyer Assignment
    if (assignedLawyerId !== undefined) {
      consultation.assignedLawyerId = assignedLawyerId || null;
    }

    // 3. Scheduling & Meeting details
    if (scheduledAt !== undefined) {
      consultation.scheduledAt = scheduledAt || null;
    }
    if (meetingType !== undefined) {
      consultation.meetingType = meetingType || null;
    }
    if (meetingLink !== undefined) {
      consultation.meetingLink = meetingLink || null;
    }
    if (meetingAddress !== undefined) {
      consultation.meetingAddress = meetingAddress || null;
    }

    // 4. Internal Note Addition
    if (noteText && typeof noteText === 'string' && noteText.trim()) {
      consultation.notes.push({
        id: `NOTE-${Date.now()}`,
        authorUid: user.uid,
        authorName: user.displayName,
        text: noteText.trim(),
        createdAt: nowIso,
      });
    }

    consultation.updatedAt = nowIso;
    consultation.updatedBy = user.email;

    // Record audit log
    store.auditLogs.unshift({
      id: `AUDIT-${Date.now()}`,
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'CONSULTATION_UPDATED',
      targetType: 'consultationRequest',
      targetId: consultation.id,
      details: {
        reference: consultation.reference,
        status: consultation.status,
        assignedLawyerId: consultation.assignedLawyerId,
      },
      createdAt: nowIso,
    });

    store.persistToDisk?.();

    return NextResponse.json({
      success: true,
      consultation,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed.' }, { status: 403 });
  }
}
