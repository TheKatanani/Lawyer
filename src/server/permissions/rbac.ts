import { Role, Capability } from '../types';

export const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  super_admin: [
    'content.edit',
    'content.review',
    'content.publish',
    'media.upload',
    'media.delete',
    'settings.presentation',
    'settings.identity',
    'inquiries.read',
    'inquiries.update',
    'inquiries.export',
    'inquiries.purge',
    'seo.edit',
    'redirects.approve',
    'admins.manage',
    'audit.read',
  ],
  admin: [
    'content.edit',
    'content.review',
    'content.publish',
    'media.upload',
    'media.delete',
    'settings.presentation',
    'inquiries.read',
    'inquiries.update',
    'seo.edit',
    'redirects.approve',
    'audit.read',
  ],
  editor: [
    'content.edit',
    'content.review',
    'media.upload',
  ],
  inquiry_manager: [
    'inquiries.read',
    'inquiries.update',
  ],
};

export function hasCapability(role: Role, capability: Capability): boolean {
  const caps = ROLE_CAPABILITIES[role] || [];
  return caps.includes(capability);
}

export function assertCapability(role: Role, capability: Capability): void {
  if (!hasCapability(role, capability)) {
    throw new Error(`Forbidden: Role '${role}' lacks capability '${capability}'`);
  }
}
