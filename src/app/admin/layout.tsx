import React from 'react';
import Link from 'next/link';
import { getSessionUser } from '@/server/auth/session';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BookOpen,
  Inbox,
  Shield,
  History,
  Image as LucideImage,
  CalendarCheck,
  Settings,
} from 'lucide-react';
import { AdminSignoutButton } from '@/components/admin/SignoutButton';
import '@/app/globals.css';

export const metadata = {
  title: 'لوحة التحكم | شركة رياض محمد الزهراني للمحاماة',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-canvas text-ink flex flex-col md:flex-row antialiased">
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

                    <Link
                      href="/admin/media"
                      className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-on-dark/10 transition-colors"
                    >
                      <LucideImage className="w-4 h-4 text-gold" />
                      <span>مكتبة الوسائط (Cloudinary Media)</span>
                    </Link>
                  </>
                )}

                {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'inquiry_manager') && (
                  <>
                    <Link
                      href="/admin/consultations"
                      className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-on-dark/10 transition-colors"
                    >
                      <CalendarCheck className="w-4 h-4 text-gold" />
                      <span>طلبات الاستشارة (Consultations)</span>
                    </Link>

                    <Link
                      href="/admin/inquiries"
                      className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-on-dark/10 transition-colors"
                    >
                      <Inbox className="w-4 h-4 text-gold" />
                      <span>طلبات التواصل (Inquiries)</span>
                    </Link>
                  </>
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
                  <>
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-on-dark/10 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gold" />
                      <span>إعدادات الهوية والـ SEO</span>
                    </Link>

                    <Link
                      href="/admin/administrators"
                      className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium hover:bg-on-dark/10 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-gold" />
                      <span>المسؤولون (Admins)</span>
                    </Link>
                  </>
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
      </body>
    </html>
  );
}
