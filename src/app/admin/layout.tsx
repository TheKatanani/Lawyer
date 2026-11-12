import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/server/auth/session';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  BookOpen,
  Image,
  Inbox,
  Search,
  Shield,
  Settings,
  History,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { ROLE_CAPABILITIES } from '@/server/permissions/rbac';
import { AdminSignoutButton } from '@/components/admin/SignoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  // If visiting admin and not logged in (and not already on login page), layout redirects
  // In Next.js App Router, the login route has its own page and can override or we check pathname.
  // We can let child login page render or check user here.
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col md:flex-row">
      {/* Sidebar for Authenticated Users */}
      {user && (
        <aside className="w-full md:w-64 bg-signature text-on-dark flex-shrink-0 flex flex-col justify-between p-4 border-r border-gold/20">
          <div className="space-y-6">
            {/* Header Brand */}
            <div className="px-3 py-2 border-b border-on-dark/10 pb-4">
              <span className="font-heading-ar font-bold text-lg text-on-dark block">
                بوابة إدارة المحتوى
              </span>
              <span className="text-xs text-gold font-medium">
                شركة رياض الزهراني للمحاماة
              </span>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-on-dark/10 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-gold" />
                <span>لوحة التحكم (Overview)</span>
              </Link>

              {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'editor') && (
                <>
                  <Link
                    href="/admin/services"
                    className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-on-dark/10 transition-colors"
                  >
                    <Briefcase className="w-4 h-4 text-gold" />
                    <span>الخدمات (Services)</span>
                  </Link>

                  <Link
                    href="/admin/team"
                    className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-on-dark/10 transition-colors"
                  >
                    <Users className="w-4 h-4 text-gold" />
                    <span>فريق العمل (Team)</span>
                  </Link>

                  <Link
                    href="/admin/insights"
                    className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-on-dark/10 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-gold" />
                    <span>المدونة (Insights)</span>
                  </Link>
                </>
              )}

              {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'inquiry_manager') && (
                <Link
                  href="/admin/inquiries"
                  className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-on-dark/10 transition-colors"
                >
                  <Inbox className="w-4 h-4 text-gold" />
                  <span>طلبات التواصل (Inquiries)</span>
                </Link>
              )}

              {(user.role === 'super_admin' || user.role === 'admin') && (
                <Link
                  href="/admin/audit"
                  className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-on-dark/10 transition-colors"
                >
                  <History className="w-4 h-4 text-gold" />
                  <span>سجل العمليات (Audit Log)</span>
                </Link>
              )}

              {user.role === 'super_admin' && (
                <Link
                  href="/admin/administrators"
                  className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-on-dark/10 transition-colors"
                >
                  <Shield className="w-4 h-4 text-gold" />
                  <span>المسؤولون (Admins)</span>
                </Link>
              )}
            </nav>
          </div>

          {/* User Info & Logout */}
          <div className="pt-4 border-t border-on-dark/10 space-y-3">
            <div className="px-3">
              <span className="text-sm font-bold text-on-dark block">
                {user.displayName}
              </span>
              <span className="text-xs text-gold capitalize block">
                {user.role.replace('_', ' ')}
              </span>
            </div>
            <AdminSignoutButton />
          </div>
        </aside>
      )}

      {/* Main Content View */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
