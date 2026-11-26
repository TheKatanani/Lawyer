import React from 'react';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import { redirect } from 'next/navigation';
import { MediaManager } from '@/components/admin/MediaManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'مكتبة الوسائط وCloudinary | لوحة التحكم',
};

export default async function AdminMediaPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }

  assertCapability(user.role, 'media.upload');

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold font-heading-ar text-ink">
          إدارة الوسائط والصور (Cloudinary Media Library)
        </h1>
        <p className="text-xs text-muted mt-1">
          إدارة الصور المعتمدة للموقع الإلكتروني، صور المحامين، والشهادات، مع ضمان سرعة التحميل والوصول الرقمي.
        </p>
      </div>

      <MediaManager />
    </div>
  );
}
