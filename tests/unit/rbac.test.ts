import { describe, it, expect } from 'vitest';
import { hasCapability, assertCapability, ROLE_CAPABILITIES } from '../../src/server/permissions/rbac';
import { protectLastSuperAdmin } from '../../src/server/auth/session';
import { store } from '../../src/server/db/store';

describe('RBAC & Authority Matrix Verification (A11, A12)', () => {
  it('Super Admin possesses all defined system capabilities', () => {
    const requiredCaps = [
      'content.edit',
      'content.publish',
      'inquiries.read',
      'inquiries.update',
      'inquiries.export',
      'admins.manage',
      'settings.identity',
      'audit.read',
    ] as const;

    for (const cap of requiredCaps) {
      expect(hasCapability('super_admin', cap)).toBe(true);
      expect(() => assertCapability('super_admin', cap)).not.toThrow();
    }
  });

  it('Admin cannot manage administrators or modify official identity settings', () => {
    expect(hasCapability('admin', 'admins.manage')).toBe(false);
    expect(hasCapability('admin', 'settings.identity')).toBe(false);
    expect(hasCapability('admin', 'inquiries.export')).toBe(false);

    expect(() => assertCapability('admin', 'admins.manage')).toThrow(/Forbidden/);
    expect(() => assertCapability('admin', 'settings.identity')).toThrow(/Forbidden/);
  });

  it('Editor cannot approve, publish, or read client consultation inquiries', () => {
    expect(hasCapability('editor', 'content.edit')).toBe(true);
    expect(hasCapability('editor', 'content.publish')).toBe(false);
    expect(hasCapability('editor', 'inquiries.read')).toBe(false);
    expect(hasCapability('editor', 'admins.manage')).toBe(false);

    expect(() => assertCapability('editor', 'content.publish')).toThrow(/Forbidden/);
    expect(() => assertCapability('editor', 'inquiries.read')).toThrow(/Forbidden/);
  });

  it('Inquiry Manager has intake triage privileges but zero content publishing rights', () => {
    expect(hasCapability('inquiry_manager', 'inquiries.read')).toBe(true);
    expect(hasCapability('inquiry_manager', 'inquiries.update')).toBe(true);
    expect(hasCapability('inquiry_manager', 'content.edit')).toBe(false);
    expect(hasCapability('inquiry_manager', 'content.publish')).toBe(false);

    expect(() => assertCapability('inquiry_manager', 'content.edit')).toThrow(/Forbidden/);
    expect(() => assertCapability('inquiry_manager', 'content.publish')).toThrow(/Forbidden/);
  });

  it('Protects against deleting or demoting the last remaining active Super Admin', () => {
    // Only admin-rma-01 is initial active Super Admin
    expect(() => protectLastSuperAdmin('admin-rma-01')).toThrow(
      /Cannot delete, demote, or deactivate the last remaining active Super Admin/
    );
  });
});
