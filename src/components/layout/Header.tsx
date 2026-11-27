'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, ArrowUpRight } from 'lucide-react';

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
  const [isScrolled, setIsScrolled] = useState(false);
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

  // Scroll listener for elevation effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Language switch path
  const switchLocalePath = pathname.replace(`/${locale}`, `/${messages.targetLocale}`);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-canvas/95 backdrop-blur-md border-b border-border shadow-sm py-0'
          : 'bg-canvas border-b border-border/70 py-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-16 sm:h-[4.5rem]' : 'h-20'
          }`}
        >
          {/* Logo & Identity */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 xl:gap-3 group shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <div className="relative w-10 h-10 xl:w-11 xl:h-11 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo-gold-emblem.png"
                alt={messages.brandShort || 'RMA Legal'}
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading-ar font-bold text-sm sm:text-base xl:text-lg text-ink tracking-tight leading-tight group-hover:text-gold-ink transition-colors duration-200 whitespace-nowrap">
                {messages.brandShort}
              </span>
              <span className="text-[10px] sm:text-[11px] xl:text-xs text-muted font-medium whitespace-nowrap">
                {locale === 'ar' ? 'محامون ومستشارون قانونيون' : 'Attorneys & Legal Counsel'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (shown at lg >= 1024px; tablets <= 1023px use drawer) */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-7" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs xl:text-sm font-medium transition-all duration-200 relative py-1 group/nav whitespace-nowrap ${
                    isActive ? 'text-ink font-semibold' : 'text-muted hover:text-ink'
                  }`}
                >
                  {item.label}
                  {/* Sliding Underline Indicator */}
                  <span
                    className={`absolute bottom-0 inset-x-0 h-0.5 bg-gold rounded-full transition-all duration-300 ${
                      isActive
                        ? 'opacity-100 scale-x-100'
                        : 'opacity-0 scale-x-0 group-hover/nav:opacity-70 group-hover/nav:scale-x-75'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Action Group */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-4 shrink-0">
            {/* Language Switcher */}
            <Link
              href={switchLocalePath}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 xl:px-3 py-1.5 rounded-sm border border-border text-ink hover:bg-surface hover:border-gold/50 transition-all duration-200 shadow-xs whitespace-nowrap"
              title={isRTL ? 'تبديل اللغة' : 'Switch Language'}
            >
              <Globe className="w-3.5 h-3.5 text-gold-ink flex-shrink-0" />
              <span>{messages.languageSwitchLabel}</span>
            </Link>

            {/* Primary Consultation CTA */}
            <Link
              href={`/${locale}/consultation`}
              className="relative inline-flex items-center gap-1.5 xl:gap-2 px-3.5 xl:px-5 py-2 xl:py-2.5 rounded-sm bg-ink text-on-dark text-xs xl:text-sm font-semibold hover:bg-signature transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group overflow-hidden whitespace-nowrap"
            >
              <span className="relative z-10 whitespace-nowrap">
                {messages.requestConsultation || (isRTL ? 'طلب استشارة' : 'Request Consultation')}
              </span>
              <ArrowUpRight className="w-4 h-4 relative z-10 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            </Link>
          </div>

          {/* Mobile & Tablet Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href={switchLocalePath}
              className="p-2 text-ink hover:text-gold-ink focus:outline-none transition-colors"
              aria-label={isRTL ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <Globe className="w-5 h-5 text-gold-ink" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-sm text-ink hover:bg-surface focus:outline-none focus:ring-2 focus:ring-gold transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label={isRTL ? 'فتح أو إغلاق قائمة التنقل' : 'Toggle navigation menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border space-y-2 animate-fade-in bg-surface/98 rounded-b-sm shadow-md px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-sm text-sm font-semibold transition-colors ${
                  pathname === item.href
                    ? 'bg-canvas text-gold-ink border-s-2 border-gold font-bold'
                    : 'text-ink hover:bg-canvas'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border px-2">
              <Link
                href={`/${locale}/consultation`}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-sm bg-signature text-on-dark text-sm font-bold shadow-sm"
              >
                <span>{messages.requestConsultation || (isRTL ? 'طلب استشارة' : 'Request Consultation')}</span>
                <ArrowUpRight className="w-4 h-4 text-gold" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
