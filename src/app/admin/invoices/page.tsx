import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth/session';
import { listPaymentRequests } from '@/server/db/dal';
import { InvoicesManager } from '@/components/admin/InvoicesManager';

export const dynamic = 'force-dynamic';

export default async function AdminInvoicesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/admin/login');
  }

  const items = await listPaymentRequests();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <InvoicesManager initialItems={items} />
    </div>
  );
}
