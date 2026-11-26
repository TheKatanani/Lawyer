'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Settings,
  Globe,
  Phone,
  Share2,
  Image as LucideImage,
  Save,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building,
  Sparkles,
  Upload,
  FileText,
  Loader2,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { SiteSettings } from '@/server/types';

const DEFAULT_SETTINGS: SiteSettings = {
  brandNameAr: 'شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية',
  brandNameEn: 'Riyadh Mohammed Alzahrani Law Firm & Legal Consultations',
  brandShortAr: 'رياض الزهراني للمحاماة',
  brandShortEn: 'Alzahrani Law Firm',
  taglineAr: 'رؤية قانونية واثقة، وحلول تقوم على المعرفة',
  taglineEn: 'A clear legal perspective. An approach grounded in knowledge.',
  phone: '+966 55 777 5504',
  whatsapp: '+966 55 777 5504',
  email: 'info@riyadhalzahrani.com',
  addressAr: 'برج هيدكوارترز، الدور 46، مكتب 4602، شارع الكورنيش، حي الشاطئ، جدة',
  addressEn: 'Headquarters Tower, Floor 46, Office 4602, Corniche Road, Al Shati District, Jeddah',
  seoTitleAr: 'شركة رياض محمد الزهراني للمحاماة والاستشارات القانونية | جدة',
  seoTitleEn: 'Riyadh Mohammed Alzahrani Law Firm & Legal Consultations | Jeddah',
  seoDescAr: 'شركة محاماة واستشارات قانونية مرخصة بالمملكة تقدم حلولاً قضائية وتجارية وحوكمة رصينة للشركات والأفراد.',
  seoDescEn: 'Licensed Saudi legal firm delivering enterprise governance, commercial dispute resolution, and regulatory advisory.',
  ogImageUrl: '',
  faviconUrl: '/favicon.ico',
  heroHeadlineAr: 'رؤية قانونية واثقة. وحلول تقوم على المعرفة.',
  heroHeadlineEn: 'A clear legal perspective. An approach grounded in knowledge.',
  heroDescAr: 'خدمات قانونية متكاملة للأفراد والمنشآت في المملكة العربية السعودية، تبدأ بفهم عميق لاحتياجاتك وتوضيح دقيق للخطوات والحلول المناسبة.',
  heroDescEn: 'Comprehensive legal services for individuals and corporate entities across Saudi Arabia, beginning with an in-depth understanding of your objectives.',
  aboutTextAr: 'تأسست شركة رياض محمد الزهراني للمحاماة لتكون شريكاً قانونياً موثوقاً للشركات ورجال الأعمال والأفراد، مع التركيز على دقة المشورة، والامتثال لأحدث الأنظمة واللوائح في المملكة العربية السعودية.',
  aboutTextEn: 'Founded to serve as an authoritative legal partner for enterprises and individuals across the Kingdom of Saudi Arabia, upholding rigor, precision, and PDPL compliance.',
  aboutMissionAr: 'تقديم خدمات واستشارات قانونية رصينة تحمي مصالح الموكلين وتعزز استدامة الأعمال وفق الأنظمة القضائية والتجارية السعودية.',
  aboutMissionEn: 'Delivering authoritative legal advisory that safeguards client interests and fosters corporate sustainability under Saudi legal frameworks.',
  aboutVisionAr: 'أن نكون الشريك القانوني الرائد في صياغة الحلول النوعية وتطوير حوكمة الشركات ودعم نمو الاستثمارات في المملكة العربية السعودية.',
  aboutVisionEn: 'To be the premier Saudi legal partner architecting transformative counsel, corporate governance, and cross-border investment growth.',
  paymentEnabled: false,
  paymentRequirement: 'optional',
  consultationFee: 500,
  consultationCurrency: 'SAR',
  applePayEnabled: false,
  moyasarPublishableKey: '',
  moyasarSecretKey: '',
  paymentNoticeAr: 'رسوم حجز الاستشارة تُحسم من أتعاب القضية أو العقد في حال التوكيل الرسمي.',
  paymentNoticeEn: 'The initial consultation fee is deductible from overall legal representation fees upon retainer engagement.',
};

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'brand' | 'contact' | 'seo' | 'homepage' | 'aboutPage' | 'payment'>('brand');
  const [uploadingTarget, setUploadingTarget] = useState<'favicon' | 'og' | null>(null);

  const faviconInputRef = useRef<HTMLInputElement>(null);
  const ogInputRef = useRef<HTMLInputElement>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load settings');
      if (data.settings && data.settings.brandNameAr) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data.settings,
        });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (err: any) {
      setError(err.message);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'favicon' | 'og') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(target);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Get secure signature from server
      const signRes = await fetch('/api/admin/media/sign', { method: 'POST' });
      if (!signRes.ok) {
        const err = await signRes.json();
        throw new Error(err.error || 'فشل توليد توقيع تشفير Cloudinary');
      }
      const signData = await signRes.json();

      // 2. Direct upload to Cloudinary CDN
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', signData.timestamp.toString());
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
        { method: 'POST', body: formData }
      );

      if (!cloudinaryRes.ok) {
        const cErr = await cloudinaryRes.json();
        throw new Error(cErr.error?.message || 'فشل رفع الملف إلى خوادم Cloudinary');
      }

      const cData = await cloudinaryRes.json();
      const secureUrl = cData.secure_url;

      // 3. Register asset into Media Library
      await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicId: cData.public_id,
          secureUrl,
          format: cData.format,
          width: cData.width,
          height: cData.height,
          bytes: cData.bytes,
          altText: {
            ar: target === 'favicon' ? 'أيقونة الموقع الرسمية' : 'صورة المشاركة الاجتماعية الرسمية',
            en: target === 'favicon' ? 'Official Site Favicon' : 'Official OpenGraph Social Cover',
          },
        }),
      });

      // 4. Update state directly
      if (target === 'favicon') {
        setSettings((prev) => ({ ...prev, faviconUrl: secureUrl }));
        setSuccessMsg('تم رفع أيقونة الموقع (Favicon) إلى Cloudinary بنجاح! احفظ التعديلات لاعتمادها.');
      } else {
        setSettings((prev) => ({ ...prev, ogImageUrl: secureUrl }));
        setSuccessMsg('تم رفع صورة المشاركة الاجتماعية (OG Image) بنجاح! احفظ التعديلات لاعتمادها.');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploadingTarget(null);
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');
      setSettings(data.settings);
      setSuccessMsg('تم حفظ وتحديث إعدادات الموقع وهوية المنصة بنجاح.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-muted">جاري تحميل إعدادات المنصة...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-heading-ar font-bold text-2xl sm:text-3xl text-ink">
            إعدادات الهوية ومحتوى الموقع العام (Site Branding & Content CMS)
          </h1>
          <p className="text-sm text-muted mt-1">
            إدارة كافة النصوص العامة، الهوية المؤسسية، بيانات التواصل، الـ SEO، الأيقونات، وصور المشاركة الاجتماعية مع إمكانية الرفع المباشر إلى Cloudinary.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSettings}
            className="p-2.5 bg-canvas border border-border rounded text-ink hover:text-gold transition-colors"
            title="إعادة تحميل"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold-ink text-surface rounded text-sm font-semibold hover:bg-gold-ink/90 transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded text-sm text-danger flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs underline font-mono">إغلاق</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-success/15 border border-success/30 rounded text-sm text-success flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline font-mono">إغلاق</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 text-xs font-semibold overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('brand')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'brand'
              ? 'border-gold text-gold-ink bg-surface'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>الهوية والاسم التجاري</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'contact'
              ? 'border-gold text-gold-ink bg-surface'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>بيانات التواصل والمقر</span>
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'seo'
              ? 'border-gold text-gold-ink bg-surface'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>الـ SEO والـ Favicon والوسائط</span>
        </button>

        <button
          onClick={() => setActiveTab('homepage')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'homepage'
              ? 'border-gold text-gold-ink bg-surface'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>نصوص الصفحة الرئيسية (Hero & About Preview)</span>
        </button>

        <button
          onClick={() => setActiveTab('aboutPage')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'aboutPage'
              ? 'border-gold text-gold-ink bg-surface'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>صفحة عن الشركة والرؤية (About Page & Vision)</span>
        </button>

        <button
          onClick={() => setActiveTab('payment')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'payment'
              ? 'border-gold text-gold-ink bg-surface'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="font-bold">بوابة الدفع الإلكتروني (Moyasar)</span>
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="bg-surface rounded-sm border border-border p-6 sm:p-8 space-y-6 shadow-xs text-xs">
        {/* TAB 1: BRAND */}
        {activeTab === 'brand' && (
          <div className="space-y-5">
            <h2 className="font-heading-ar font-bold text-lg text-ink border-b border-border pb-3">
              الاسم التجاري وهوية الكيان القانوني
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">اسم الشركة الرسمي (بالعربية) *</label>
                <input
                  type="text"
                  required
                  value={settings.brandNameAr}
                  onChange={(e) => setSettings({ ...settings, brandNameAr: e.target.value })}
                  className="w-full px-3 py-2.5 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">Official Firm Name (English) *</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={settings.brandNameEn}
                  onChange={(e) => setSettings({ ...settings, brandNameEn: e.target.value })}
                  className="w-full px-3 py-2.5 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">الاسم المختصر للعلامة (بالعربية)</label>
                <input
                  type="text"
                  value={settings.brandShortAr}
                  onChange={(e) => setSettings({ ...settings, brandShortAr: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">Short Brand Name (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={settings.brandShortEn}
                  onChange={(e) => setSettings({ ...settings, brandShortEn: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">الشعار اللفظي (Tagline - بالعربية)</label>
                <input
                  type="text"
                  value={settings.taglineAr}
                  onChange={(e) => setSettings({ ...settings, taglineAr: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">Tagline (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={settings.taglineEn}
                  onChange={(e) => setSettings({ ...settings, taglineEn: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACT */}
        {activeTab === 'contact' && (
          <div className="space-y-5">
            <h2 className="font-heading-ar font-bold text-lg text-ink border-b border-border pb-3">
              أرقام التواصل الرسمية ومقر الشركة
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">الهاتف الرسمي الموحد</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+966112345678"
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">رقم الواتساب المعتمد للاستشارات *</label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  placeholder="+966557775504"
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold font-mono"
                />
                <span className="text-[11px] text-muted block">
                  هذا هو الرقم الذي يُحول إليه زوار صفحة طلب الاستشارة مباشرة عبر الرابط المشفر.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">البريد الإلكتروني المهني العام</label>
                <input
                  type="email"
                  dir="ltr"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="info@rma-law.sa"
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">عنوان المقر الرئيسي (بالعربية)</label>
                <input
                  type="text"
                  value={settings.addressAr}
                  onChange={(e) => setSettings({ ...settings, addressAr: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">Headquarters Address (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={settings.addressEn}
                  onChange={(e) => setSettings({ ...settings, addressEn: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SEO, FAVICON & MEDIA */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-heading-ar font-bold text-lg text-ink">
                محركات البحث (SEO)، الأيقونة (Favicon)، وصور المشاركة الاجتماعية (OG Image)
              </h2>
              <Link
                href="/admin/media"
                target="_blank"
                className="text-xs text-gold-ink hover:underline flex items-center gap-1 font-semibold"
              >
                <span>مكتبة وسائط Cloudinary</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Favicon & OG previews with Direct Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-canvas rounded border border-border">
              {/* Favicon field with Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-ink flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-gold-ink" />
                    <span>أيقونة الموقع (Favicon)</span>
                  </label>
                  <span className="text-[11px] text-muted font-mono">.ico, .png, .svg</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded border border-border bg-surface flex items-center justify-center p-1.5 flex-shrink-0 shadow-xs">
                    {settings.faviconUrl ? (
                      <Image
                        src={settings.faviconUrl}
                        alt="Favicon"
                        width={32}
                        height={32}
                        unoptimized
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-muted">لا يوجد</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      dir="ltr"
                      value={settings.faviconUrl}
                      onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                      placeholder="https://res.cloudinary.com/..."
                      className="w-full px-3 py-1.5 bg-surface border border-border rounded text-xs text-ink focus:outline-none focus:border-gold font-mono"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={faviconInputRef}
                        accept="image/*,.ico,.png,.svg"
                        className="hidden"
                        onChange={(e) => handleDirectUpload(e, 'favicon')}
                      />
                      <button
                        type="button"
                        disabled={uploadingTarget === 'favicon'}
                        onClick={() => faviconInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-ink text-surface rounded text-xs font-semibold hover:bg-gold-ink/90 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
                      >
                        {uploadingTarget === 'favicon' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جارٍ الرفع...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>رفع أيقونة جديدة</span>
                          </>
                        )}
                      </button>
                      <span className="text-[10px] text-muted">ترفع مباشرة إلى Cloudinary</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* OG Image field with Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-ink flex items-center gap-1.5">
                    <LucideImage className="w-4 h-4 text-gold-ink" />
                    <span>صورة المشاركة الاجتماعية (OG Image 1200x630)</span>
                  </label>
                  <span className="text-[11px] text-muted font-mono">1200 × 630 px</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded border border-border bg-surface flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
                    {settings.ogImageUrl ? (
                      <Image
                        src={settings.ogImageUrl}
                        alt="OG Image"
                        width={64}
                        height={48}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-muted">لا يوجد</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      dir="ltr"
                      value={settings.ogImageUrl}
                      onChange={(e) => setSettings({ ...settings, ogImageUrl: e.target.value })}
                      placeholder="https://res.cloudinary.com/..."
                      className="w-full px-3 py-1.5 bg-surface border border-border rounded text-xs text-ink focus:outline-none focus:border-gold font-mono"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={ogInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleDirectUpload(e, 'og')}
                      />
                      <button
                        type="button"
                        disabled={uploadingTarget === 'og'}
                        onClick={() => ogInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-ink text-surface rounded text-xs font-semibold hover:bg-gold-ink/90 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
                      >
                        {uploadingTarget === 'og' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جارٍ الرفع...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>رفع صورة غلاف جديدة</span>
                          </>
                        )}
                      </button>
                      <span className="text-[10px] text-muted">ترفع مباشرة إلى Cloudinary</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">عنوان الميتا الافتراضي (Meta Title AR)</label>
                <input
                  type="text"
                  value={settings.seoTitleAr}
                  onChange={(e) => setSettings({ ...settings, seoTitleAr: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">Default Meta Title (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={settings.seoTitleEn}
                  onChange={(e) => setSettings({ ...settings, seoTitleEn: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* SEO Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">وصف الميتا لمحركات البحث (Meta Description AR)</label>
                <textarea
                  rows={3}
                  value={settings.seoDescAr}
                  onChange={(e) => setSettings({ ...settings, seoDescAr: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">Default Meta Description (English)</label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={settings.seoDescEn}
                  onChange={(e) => setSettings({ ...settings, seoDescEn: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOMEPAGE HERO & ABOUT PREVIEW */}
        {activeTab === 'homepage' && (
          <div className="space-y-5">
            <h2 className="font-heading-ar font-bold text-lg text-ink border-b border-border pb-3">
              نصوص واجهة الصفحة الرئيسية (Hero Headline & Editorial Copy)
            </h2>

            {/* Hero Headlines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">العنوان الرئيسي للواجهة (Hero Headline AR)</label>
                <input
                  type="text"
                  value={settings.heroHeadlineAr}
                  onChange={(e) => setSettings({ ...settings, heroHeadlineAr: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">Hero Headline (English)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={settings.heroHeadlineEn}
                  onChange={(e) => setSettings({ ...settings, heroHeadlineEn: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Hero Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">الوصف الفرعي للواجهة (Hero Description AR)</label>
                <textarea
                  rows={3}
                  value={settings.heroDescAr}
                  onChange={(e) => setSettings({ ...settings, heroDescAr: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">Hero Description (English)</label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={settings.heroDescEn}
                  onChange={(e) => setSettings({ ...settings, heroDescEn: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>
            </div>

            {/* About Firm Excerpt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">موجز نبذة الشركة بالصفحة الرئيسية (Home About Copy AR)</label>
                <textarea
                  rows={4}
                  value={settings.aboutTextAr}
                  onChange={(e) => setSettings({ ...settings, aboutTextAr: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">Home About Excerpt (English)</label>
                <textarea
                  rows={4}
                  dir="ltr"
                  value={settings.aboutTextEn}
                  onChange={(e) => setSettings({ ...settings, aboutTextEn: e.target.value })}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ABOUT PAGE & VISION */}
        {activeTab === 'aboutPage' && (
          <div className="space-y-5">
            <h2 className="font-heading-ar font-bold text-lg text-ink border-b border-border pb-3">
              محتوى صفحة من نحن والرؤية والرسالة المؤسسية (/about)
            </h2>

            {/* Mission Statement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">رسالة الشركة (Firm Mission AR)</label>
                <textarea
                  rows={4}
                  value={settings.aboutMissionAr || ''}
                  onChange={(e) => setSettings({ ...settings, aboutMissionAr: e.target.value })}
                  placeholder="تقديم استشارات وحلول قانونية رصينة تحمي مصالح الموكلين..."
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">Firm Mission (English)</label>
                <textarea
                  rows={4}
                  dir="ltr"
                  value={settings.aboutMissionEn || ''}
                  onChange={(e) => setSettings({ ...settings, aboutMissionEn: e.target.value })}
                  placeholder="Delivering authoritative legal advisory that safeguards client interests..."
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>
            </div>

            {/* Vision Statement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">رؤية الشركة ومنهجيتها (Firm Vision AR)</label>
                <textarea
                  rows={4}
                  value={settings.aboutVisionAr || ''}
                  onChange={(e) => setSettings({ ...settings, aboutVisionAr: e.target.value })}
                  placeholder="أن نكون الشريك القانوني الرائد في صياغة الحلول وتطوير حوكمة الشركات..."
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">Firm Vision & Principles (English)</label>
                <textarea
                  rows={4}
                  dir="ltr"
                  value={settings.aboutVisionEn || ''}
                  onChange={(e) => setSettings({ ...settings, aboutVisionEn: e.target.value })}
                  placeholder="To be the premier Saudi legal partner architecting transformative counsel..."
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PAYMENT GATEWAY (MOYASAR) */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-heading-ar font-bold text-lg text-ink flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gold-ink" />
                  <span>بوابة الدفع الإلكتروني ميسّر (Moyasar Payment Gateway)</span>
                </h2>
                <p className="text-muted text-[11px] mt-1">
                  التحكم الكامل في رسوم الاستشارات القانونية، طرق السداد، تفعيل مدى و Apple Pay، ومفاتيح الربط.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>معتمد بالسعودية (Mada & SAMA)</span>
              </span>
            </div>

            {/* General Gateway Activation */}
            <div className="p-4 bg-canvas border border-border rounded-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-ink text-xs block">
                    تفعيل استقبال المدفوعات الإلكترونية للاستشارات
                  </label>
                  <p className="text-muted text-[11px] mt-0.5">
                    عند التعطيل، يتحول نموذج الاستشارة تلقائياً إلى الحجز المباشر دون المرور بخطوة الدفع.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(settings.paymentEnabled)}
                  onChange={(e) => setSettings({ ...settings, paymentEnabled: e.target.checked })}
                  className="w-5 h-5 text-gold accent-gold-ink rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Requirement Mode & Fee Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">شرط وسياسة السداد (Payment Requirement)</label>
                <select
                  value={settings.paymentRequirement || 'optional'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentRequirement: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
                >
                  <option value="optional">
                    اختياري (إتاحة الدفع الإلكتروني الفوري أو السداد لاحقاً في المكتب)
                  </option>
                  <option value="mandatory">
                    إلزامي (لا يتم تأكيد الموعد إلا بعد السداد بالبطاقة / مدى / Apple Pay)
                  </option>
                  <option value="disabled">
                    معطّل مؤقتاً (حجز استشارة بدون مطالبة مالية مسبقة)
                  </option>
                </select>
                <p className="text-[10px] text-muted">
                  في الوضع الاختياري يُمنح العميل خيار الدفع الإلكتروني المباشر أو السداد في مقر الشركة.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">قيمة رسوم الاستشارة القانونية (بالريال السعودي)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={settings.consultationFee ?? 500}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        consultationFee: Math.max(1, Number(e.target.value) || 0),
                      })
                    }
                    placeholder="500"
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold pl-14 font-mono font-bold"
                  />
                  <span className="absolute left-3 top-2.5 text-muted text-[11px] font-bold pointer-events-none">
                    ر.س / SAR
                  </span>
                </div>
                <p className="text-[10px] text-muted">
                  المبلغ الفعلي الذي سيتم خصمه عبر بوابة ميسر عند حجز العميل.
                </p>
              </div>
            </div>

            {/* Apple Pay Activation */}
            <div className="p-4 bg-canvas border border-border rounded-sm flex items-center justify-between">
              <div>
                <label className="font-bold text-ink text-xs block">
                  تفعيل خيار Apple Pay
                </label>
                <p className="text-muted text-[11px] mt-0.5">
                  يتيح السداد السريع بنقرة واحدة عبر أجهزة iPhone و Mac و Safari عند إعداد شهادة النطاق في ميسر.
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.applePayEnabled)}
                onChange={(e) => setSettings({ ...settings, applePayEnabled: e.target.checked })}
                className="w-5 h-5 text-gold accent-gold-ink rounded cursor-pointer"
              />
            </div>

            {/* Moyasar API Keys (Configurable from Control Panel) */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-ink text-xs border-b border-border pb-1">
                مفاتيح الربط البرمجي مع ميسّر (Moyasar API Keys)
              </h3>
              <p className="text-muted text-[11px]">
                يمكنك إدخال مفاتيح بيئة الاختبار (pk_test_ / sk_test_) أو التبديل لمفاتيح الحساب الحي (pk_live_ / sk_live_).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">مفتاح النشر العام (Publishable Key)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settings.moyasarPublishableKey || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, moyasarPublishableKey: e.target.value })
                    }
                    placeholder="pk_test_... أو pk_live_..."
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold font-mono"
                  />
                  <p className="text-[10px] text-muted">
                    يُستخدم في واجهة الدفع (Client-safe).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-ink">المفتاح السري للخادم (Secret Key)</label>
                  <input
                    type="password"
                    dir="ltr"
                    value={settings.moyasarSecretKey || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, moyasarSecretKey: e.target.value })
                    }
                    placeholder="sk_test_... أو sk_live_..."
                    className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold font-mono"
                  />
                  <p className="text-[10px] text-muted">
                    يُستخدم للتحقق الخادمي الآمن ولا يظهر للعميل إطلاقاً.
                  </p>
                </div>
              </div>
            </div>

            {/* Client Payment Notices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">ملاحظة وسياسة السداد في نموذج الحجز (عربي)</label>
                <textarea
                  rows={3}
                  value={settings.paymentNoticeAr || ''}
                  onChange={(e) => setSettings({ ...settings, paymentNoticeAr: e.target.value })}
                  placeholder="رسوم حجز الاستشارة تُحسم من أتعاب القضية أو العقد في حال التوكيل الرسمي..."
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-ink">Payment Policy Notice (English)</label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={settings.paymentNoticeEn || ''}
                  onChange={(e) => setSettings({ ...settings, paymentNoticeEn: e.target.value })}
                  placeholder="Consultation booking fee is deductible from overall legal representation fees upon retainer engagement..."
                  className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Footer */}
        <div className="pt-6 border-t border-border flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gold-ink text-surface rounded text-xs font-semibold hover:bg-gold-ink/90 transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جارٍ حفظ التعديلات...' : 'حفظ كافة إعدادات ومحتوى الموقع'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
