'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, Phone, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  locale: string;
  messages: {
    brandName: string;
    brandShort: string;
    navHome: string;
    navAbout: string;
    navServices: string;
    navTeam: string;
    navInsights: string;
    navContact: string;
    requestConsultation?: string;
    contactUs: string;
    languageSwitchLabel: string;
    targetLocale: string;
  };
}

export function Header({ locale, messages }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isRTL = locale === 'ar';
  const navItems = [
    { label: messages.navHome, href: `/${locale}` },
    { label: messages.navAbout, href: `/${locale}/about` },
    { label: messages.navServices, href: `/${locale}/services` },
    { label: messages.navTeam, href: `/${locale}/team` },
    { label: messages.navInsights, href: `/${locale}/insights` },
    { label: messages.navContact, href: `/${locale}/contact` },
  ];

  // Language switch path
  const switchLocalePath = pathname.replace(`/${locale}`, `/${messages.targetLocale}`);

  return (
    <header className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-border/70 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Identity */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <div className="w-10 h-10 rounded-sm bg-signature text-on-dark flex items-center justify-center font-heading-ar font-bold text-lg border border-gold/40 shadow-sm transition-transform duration-200 group-hover:scale-105">
              {locale === 'ar' ? 'ر' : 'R'}
            </div>
            <div className="flex flex-col">
              <span className="font-heading-ar font-bold text-base sm:text-lg text-ink tracking-tight leading-tight">
                {messages.brandShort}
              </span>
              <span className="text-[11px] sm:text-xs text-muted font-medium">
                {locale === 'ar' ? 'محامون ومستشارون قانونيون' : 'Attorneys & Legal Counsel'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors duration-150 relative py-1 ${
                    isActive ? 'text-ink font-semibold' : 'text-muted hover:text-ink'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gold rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Group */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <Link
              href={switchLocalePath}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-sm border border-border text-ink hover:bg-surface transition-colors"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-gold-ink" />
              <span>{messages.languageSwitchLabel}</span>
            </Link>

            {/* Primary Consultation CTA */}
            <Link
              href={`/${locale}/consultation`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-ink text-on-dark text-sm font-semibold hover:bg-signature transition-all duration-150 shadow-sm group"
            >
              <span>{messages.requestConsultation || (isRTL ? 'طلب استشارة' : 'Request Consultation')}</span>
              <ArrowUpRight className={`w-4 h-4 transition-transform duration-200 ${isRTL ? 'group-hover:-translate-x-0.5 group-hover:-translate-y-0.5' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'}`} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href={switchLocalePath}
              className="p-2 text-ink hover:text-gold-ink focus:outline-none"
              aria-label="Switch Language"
            >
              <Globe className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-sm text-ink hover:bg-surface focus:outline-none focus:ring-2 focus:ring-gold"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 pt-3 pb-6 shadow-lg animate-in fade-in duration-200">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-base font-medium rounded-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-canvas text-ink font-semibold'
                    : 'text-muted hover:text-ink hover:bg-canvas/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border">
              <Link
                href={`/${locale}/consultation`}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-ink text-on-dark text-sm font-semibold"
              >
                <span>{messages.requestConsultation || (isRTL ? 'طلب استشارة' : 'Request Consultation')}</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
