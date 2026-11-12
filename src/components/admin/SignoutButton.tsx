'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function AdminSignoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-danger hover:bg-on-dark/5 rounded-sm transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <span>تسجيل الخروج (Sign Out)</span>
    </button>
  );
}
