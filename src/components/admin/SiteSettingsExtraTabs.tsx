'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  BilingualNumberedStep,
  BilingualTitleDescItem,
  LegalDocumentSection,
  SiteSettings,
  StatCardItem,
} from '@/server/types';

interface Props {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
}

function BilingualTextPair({
  labelAr,
  labelEn,
  valueAr,
  valueEn,
  onChangeAr,
  onChangeEn,
  multiline = false,
  rows = 3,
}: {
  labelAr: string;
  labelEn: string;
  valueAr: string;
  valueEn: string;
  onChangeAr: (v: string) => void;
  onChangeEn: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="font-bold text-ink block">{labelAr}</label>
        {multiline ? (
          <textarea
            rows={rows}
            value={valueAr}
            onChange={(e) => onChangeAr(e.target.value)}
            className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
          />
        ) : (
          <input
            type="text"
            value={valueAr}
            onChange={(e) => onChangeAr(e.target.value)}
            className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
          />
        )}
      </div>
      <div className="space-y-1">
        <label className="font-bold text-ink block">{labelEn}</label>
        {multiline ? (
          <textarea
            rows={rows}
            dir="ltr"
            value={valueEn}
            onChange={(e) => onChangeEn(e.target.value)}
            className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold leading-relaxed"
          />
        ) : (
          <input
            type="text"
            dir="ltr"
            value={valueEn}
            onChange={(e) => onChangeEn(e.target.value)}
            className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs text-ink focus:outline-none focus:border-gold"
          />
        )}
      </div>
    </div>
  );
}

export function BilingualListEditor<T extends { titleAr: string; titleEn: string }>({
  heading,
  items,
  onChange,
  hasNum = false,
  textKeyAr,
  textKeyEn,
  addLabel = 'إضافة عنصر',
}: {
  heading: string;
  items: T[];
  onChange: (next: T[]) => void;
  hasNum?: boolean;
  textKeyAr: keyof T;
  textKeyEn: keyof T;
  addLabel?: string;
}) {
  const handleAdd = () => {
    const base: Record<string, any> = {
      titleAr: '',
      titleEn: '',
      [textKeyAr]: '',
      [textKeyEn]: '',
    };
    if (hasNum) {
      base.num = String(items.length + 1).padStart(2, '0');
    }
    onChange([...items, base as T]);
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-ink text-sm">{heading}</h3>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-canvas border border-border rounded text-xs font-semibold hover:border-gold"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{addLabel}</span>
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="p-4 bg-canvas border border-border rounded space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] font-bold text-gold-ink">
                #{hasNum ? (item as any).num || idx + 1 : idx + 1}
              </span>
              {hasNum && (
                <input
                  type="text"
                  dir="ltr"
                  value={String((item as any).num || '')}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, num: e.target.value };
                    onChange(next);
                  }}
                  className="w-20 px-2 py-1 bg-surface border border-border rounded text-xs font-mono"
                  placeholder="01"
                />
              )}
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="text-danger hover:underline inline-flex items-center gap-1 text-[11px] ms-auto"
              >
                <Trash2 className="w-3.5 h-3.5" /> حذف
              </button>
            </div>
            <BilingualTextPair
              labelAr="العنوان (عربي)"
              labelEn="Title (English)"
              valueAr={item.titleAr}
              valueEn={item.titleEn}
              onChangeAr={(v) => {
                const next = [...items];
                next[idx] = { ...item, titleAr: v };
                onChange(next);
              }}
              onChangeEn={(v) => {
                const next = [...items];
                next[idx] = { ...item, titleEn: v };
                onChange(next);
              }}
            />
            <BilingualTextPair
              labelAr="النص / الوصف (عربي)"
              labelEn="Body / Description (English)"
              valueAr={String(item[textKeyAr] || '')}
              valueEn={String(item[textKeyEn] || '')}
              multiline
              rows={2}
              onChangeAr={(v) => {
                const next = [...items];
                next[idx] = { ...item, [textKeyAr]: v };
                onChange(next);
              }}
              onChangeEn={(v) => {
                const next = [...items];
                next[idx] = { ...item, [textKeyEn]: v };
                onChange(next);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroLeadershipExtrasFields({ settings, setSettings }: Props) {
  const upd = (patch: Partial<SiteSettings>) =>
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));

  return (
    <div className="space-y-5 pt-4 border-t border-border">
      <h3 className="font-bold text-ink text-sm">أزرار الواجهة وشارات الموثوقية (Hero CTAs & Trust)</h3>
      <BilingualTextPair
        labelAr="زر استكشف الخدمات (Primary CTA AR)"
        labelEn="Primary CTA Button (English)"
        valueAr={settings.heroCtaPrimaryAr || ''}
        valueEn={settings.heroCtaPrimaryEn || ''}
        onChangeAr={(v) => upd({ heroCtaPrimaryAr: v })}
        onChangeEn={(v) => upd({ heroCtaPrimaryEn: v })}
      />
      <BilingualTextPair
        labelAr="زر طلب استشارة (Secondary CTA AR)"
        labelEn="Secondary CTA Button (English)"
        valueAr={settings.heroCtaSecondaryAr || ''}
        valueEn={settings.heroCtaSecondaryEn || ''}
        onChangeAr={(v) => upd({ heroCtaSecondaryAr: v })}
        onChangeEn={(v) => upd({ heroCtaSecondaryEn: v })}
      />
      <BilingualTextPair
        labelAr="وصف صورة الهيرو البديل (Alt AR)"
        labelEn="Hero Image Alt Text (English)"
        valueAr={settings.heroImageAltAr || ''}
        valueEn={settings.heroImageAltEn || ''}
        onChangeAr={(v) => upd({ heroImageAltAr: v })}
        onChangeEn={(v) => upd({ heroImageAltEn: v })}
      />
      <BilingualTextPair
        labelAr="عبارة الثقة 1 (عربي)"
        labelEn="Trust Signal 1 (English)"
        valueAr={settings.heroTrust1Ar || ''}
        valueEn={settings.heroTrust1En || ''}
        onChangeAr={(v) => upd({ heroTrust1Ar: v })}
        onChangeEn={(v) => upd({ heroTrust1En: v })}
      />
      <BilingualTextPair
        labelAr="عبارة الثقة 2 (عربي)"
        labelEn="Trust Signal 2 (English)"
        valueAr={settings.heroTrust2Ar || ''}
        valueEn={settings.heroTrust2En || ''}
        onChangeAr={(v) => upd({ heroTrust2Ar: v })}
        onChangeEn={(v) => upd({ heroTrust2En: v })}
      />
      <BilingualTextPair
        labelAr="عنوان البطاقة العائمة (Hero Badge AR)"
        labelEn="Floating Credential Title (English)"
        valueAr={settings.heroBadgeTitleAr || ''}
        valueEn={settings.heroBadgeTitleEn || ''}
        onChangeAr={(v) => upd({ heroBadgeTitleAr: v })}
        onChangeEn={(v) => upd({ heroBadgeTitleEn: v })}
      />
      <BilingualTextPair
        labelAr="نص البطاقة العائمة الفرعي (Badge Subtitle AR)"
        labelEn="Floating Credential Subtitle (English)"
        valueAr={settings.heroBadgeSubAr || ''}
        valueEn={settings.heroBadgeSubEn || ''}
        onChangeAr={(v) => upd({ heroBadgeSubAr: v })}
        onChangeEn={(v) => upd({ heroBadgeSubEn: v })}
      />

      <h3 className="font-bold text-ink text-sm pt-4 border-t border-border">
        تفاصيل كلمة القيادة والرسالة الختامية (Leadership & Closing Word)
      </h3>
      <BilingualTextPair
        labelAr="شارة كلمة القيادة (Leadership Eyebrow AR)"
        labelEn="Leadership Eyebrow (English)"
        valueAr={settings.leadershipEyebrowAr || ''}
        valueEn={settings.leadershipEyebrowEn || ''}
        onChangeAr={(v) => upd({ leadershipEyebrowAr: v })}
        onChangeEn={(v) => upd({ leadershipEyebrowEn: v })}
      />
      <BilingualTextPair
        labelAr="فقرة القيادة 1 (عربي)"
        labelEn="Leadership Paragraph 1 (English)"
        valueAr={settings.leadershipBody1Ar || ''}
        valueEn={settings.leadershipBody1En || ''}
        multiline
        onChangeAr={(v) => upd({ leadershipBody1Ar: v })}
        onChangeEn={(v) => upd({ leadershipBody1En: v })}
      />
      <BilingualTextPair
        labelAr="فقرة القيادة 2 (عربي)"
        labelEn="Leadership Paragraph 2 (English)"
        valueAr={settings.leadershipBody2Ar || ''}
        valueEn={settings.leadershipBody2En || ''}
        multiline
        onChangeAr={(v) => upd({ leadershipBody2Ar: v })}
        onChangeEn={(v) => upd({ leadershipBody2En: v })}
      />
      <BilingualTextPair
        labelAr="فقرة القيادة 3 (عربي)"
        labelEn="Leadership Paragraph 3 (English)"
        valueAr={settings.leadershipBody3Ar || ''}
        valueEn={settings.leadershipBody3En || ''}
        multiline
        onChangeAr={(v) => upd({ leadershipBody3Ar: v })}
        onChangeEn={(v) => upd({ leadershipBody3En: v })}
      />
      <BilingualTextPair
        labelAr="اسم القائد / الكاتب (Leadership Author AR)"
        labelEn="Leadership Author (English)"
        valueAr={settings.leadershipAuthorAr || ''}
        valueEn={settings.leadershipAuthorEn || ''}
        onChangeAr={(v) => upd({ leadershipAuthorAr: v })}
        onChangeEn={(v) => upd({ leadershipAuthorEn: v })}
      />
      <BilingualTextPair
        labelAr="المنصب / اللقب المهني (Leadership Role AR)"
        labelEn="Leadership Role (English)"
        valueAr={settings.leadershipRoleAr || ''}
        valueEn={settings.leadershipRoleEn || ''}
        onChangeAr={(v) => upd({ leadershipRoleAr: v })}
        onChangeEn={(v) => upd({ leadershipRoleEn: v })}
      />
      <BilingualTextPair
        labelAr="شارة الخبرة (Experience Badge AR)"
        labelEn="Experience Badge (English)"
        valueAr={settings.leadershipExperienceBadgeAr || ''}
        valueEn={settings.leadershipExperienceBadgeEn || ''}
        onChangeAr={(v) => upd({ leadershipExperienceBadgeAr: v })}
        onChangeEn={(v) => upd({ leadershipExperienceBadgeEn: v })}
      />
      <BilingualTextPair
        labelAr="شارة الرسالة الختامية (Closing Eyebrow AR)"
        labelEn="Closing Word Eyebrow (English)"
        valueAr={settings.closingWordEyebrowAr || ''}
        valueEn={settings.closingWordEyebrowEn || ''}
        onChangeAr={(v) => upd({ closingWordEyebrowAr: v })}
        onChangeEn={(v) => upd({ closingWordEyebrowEn: v })}
      />
      <BilingualTextPair
        labelAr="كاتب الرسالة الختامية (Closing Author AR)"
        labelEn="Closing Author (English)"
        valueAr={settings.closingWordAuthorAr || ''}
        valueEn={settings.closingWordAuthorEn || ''}
        onChangeAr={(v) => upd({ closingWordAuthorAr: v })}
        onChangeEn={(v) => upd({ closingWordAuthorEn: v })}
      />
      <BilingualTextPair
        labelAr="صفة الكاتب الختامية (Closing Role AR)"
        labelEn="Closing Role (English)"
        valueAr={settings.closingWordRoleAr || ''}
        valueEn={settings.closingWordRoleEn || ''}
        onChangeAr={(v) => upd({ closingWordRoleAr: v })}
        onChangeEn={(v) => upd({ closingWordRoleEn: v })}
      />
    </div>
  );
}

export function BrandContactExtrasFields({ settings, setSettings }: Props) {
  const upd = (patch: Partial<SiteSettings>) =>
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h3 className="font-bold text-ink text-sm">الموقع الجغرافي والنصوص النظامية في التذييل (City, Domain & Footer Legal)</h3>
      <BilingualTextPair
        labelAr="المدينة (عربي)"
        labelEn="City (English)"
        valueAr={settings.cityAr || ''}
        valueEn={settings.cityEn || ''}
        onChangeAr={(v) => upd({ cityAr: v })}
        onChangeEn={(v) => upd({ cityEn: v })}
      />
      <BilingualTextPair
        labelAr="الدولة (عربي)"
        labelEn="Country (English)"
        valueAr={settings.countryAr || ''}
        valueEn={settings.countryEn || ''}
        onChangeAr={(v) => upd({ countryAr: v })}
        onChangeEn={(v) => upd({ countryEn: v })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="font-bold text-ink block">النطاق المختصر للعرض (Website Display)</label>
          <input
            type="text"
            dir="ltr"
            value={settings.website || ''}
            onChange={(e) => upd({ website: e.target.value })}
            className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="font-bold text-ink block">الرابط الرسمي (Website URL)</label>
          <input
            type="url"
            dir="ltr"
            value={settings.websiteUrl || ''}
            onChange={(e) => upd({ websiteUrl: e.target.value })}
            className="w-full px-3 py-2 bg-canvas border border-border rounded text-xs font-mono"
          />
        </div>
      </div>
      <BilingualTextPair
        labelAr="ملحوظة الترخيص بالفوتر (Footer License Note AR)"
        labelEn="Footer License Note (English)"
        valueAr={settings.footerLicenseNoteAr || ''}
        valueEn={settings.footerLicenseNoteEn || ''}
        onChangeAr={(v) => upd({ footerLicenseNoteAr: v })}
        onChangeEn={(v) => upd({ footerLicenseNoteEn: v })}
      />
      <BilingualTextPair
        labelAr="إشعار الخصوصية والـ PDPL بالفوتر (عربي)"
        labelEn="Footer PDPL Notice (English)"
        valueAr={settings.footerPdplNoticeAr || ''}
        valueEn={settings.footerPdplNoticeEn || ''}
        multiline
        rows={2}
        onChangeAr={(v) => upd({ footerPdplNoticeAr: v })}
        onChangeEn={(v) => upd({ footerPdplNoticeEn: v })}
      />
    </div>
  );
}

export function AboutPageExtrasFields({ settings, setSettings }: Props) {
  const upd = (patch: Partial<SiteSettings>) =>
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));

  return (
    <div className="space-y-5 pt-4 border-t border-border">
      <BilingualTextPair
        labelAr="مسار / شارة صفحة عن الشركة (About Eyebrow AR)"
        labelEn="About Eyebrow (English)"
        valueAr={settings.aboutEyebrowAr || ''}
        valueEn={settings.aboutEyebrowEn || ''}
        onChangeAr={(v) => upd({ aboutEyebrowAr: v })}
        onChangeEn={(v) => upd({ aboutEyebrowEn: v })}
      />
      <BilingualTextPair
        labelAr="عنوان بطاقة الترخيص والاعتماد (Accreditation Title AR)"
        labelEn="Accreditation Title (English)"
        valueAr={settings.aboutAccreditationTitleAr || ''}
        valueEn={settings.aboutAccreditationTitleEn || ''}
        onChangeAr={(v) => upd({ aboutAccreditationTitleAr: v })}
        onChangeEn={(v) => upd({ aboutAccreditationTitleEn: v })}
      />
      <BilingualTextPair
        labelAr="وصف بطاقة الترخيص والاعتماد (Accreditation Desc AR)"
        labelEn="Accreditation Description (English)"
        valueAr={settings.aboutAccreditationDescAr || ''}
        valueEn={settings.aboutAccreditationDescEn || ''}
        multiline
        onChangeAr={(v) => upd({ aboutAccreditationDescAr: v })}
        onChangeEn={(v) => upd({ aboutAccreditationDescEn: v })}
      />
      <BilingualTextPair
        labelAr="عنوان ركائز العمل الاستشاري (About Pillars Heading AR)"
        labelEn="About Pillars Heading (English)"
        valueAr={settings.aboutPillarsHeadingAr || ''}
        valueEn={settings.aboutPillarsHeadingEn || ''}
        onChangeAr={(v) => upd({ aboutPillarsHeadingAr: v })}
        onChangeEn={(v) => upd({ aboutPillarsHeadingEn: v })}
      />
      <BilingualListEditor<BilingualNumberedStep>
        heading="الركائز الثلاث بصفحة عن الشركة (About Strategic Pillars)"
        items={settings.aboutPillars || []}
        hasNum
        textKeyAr="descAr"
        textKeyEn="descEn"
        onChange={(next) => upd({ aboutPillars: next })}
      />
    </div>
  );
}

export function StatsAndMethodologyTab({ settings, setSettings }: Props) {
  const upd = (patch: Partial<SiteSettings>) =>
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  const stats = settings.statsItems || [];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="font-heading-ar font-bold text-lg text-ink">
            الإحصائيات ومؤشرات الخبرة (Stats Banner)
          </h2>
          <button
            type="button"
            onClick={() =>
              upd({
                statsItems: [
                  ...stats,
                  {
                    target: 0,
                    prefix: '',
                    suffixAr: '',
                    suffixEn: '',
                    titleAr: '',
                    titleEn: '',
                    descAr: '',
                    descEn: '',
                  } as StatCardItem,
                ],
              })
            }
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-canvas border border-border rounded text-xs font-semibold hover:border-gold"
          >
            <Plus className="w-3.5 h-3.5" /> إضافة مؤشر
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {stats.map((st, idx) => (
            <div key={idx} className="p-4 bg-canvas border border-border rounded space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-gold-ink">Stat #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => upd({ statsItems: stats.filter((_, i) => i !== idx) })}
                  className="text-danger text-[11px] inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> حذف
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">الرقم (Target)</label>
                  <input
                    type="number"
                    value={st.target}
                    onChange={(e) => {
                      const next = [...stats];
                      next[idx] = { ...st, target: Number(e.target.value) || 0 };
                      upd({ statsItems: next });
                    }}
                    className="w-full px-2 py-1.5 bg-surface border border-border rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">البادئة (Prefix)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={st.prefix || ''}
                    onChange={(e) => {
                      const next = [...stats];
                      next[idx] = { ...st, prefix: e.target.value };
                      upd({ statsItems: next });
                    }}
                    className="w-full px-2 py-1.5 bg-surface border border-border rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">اللاحقة (Suffix AR)</label>
                  <input
                    type="text"
                    value={st.suffixAr}
                    onChange={(e) => {
                      const next = [...stats];
                      next[idx] = { ...st, suffixAr: e.target.value };
                      upd({ statsItems: next });
                    }}
                    className="w-full px-2 py-1.5 bg-surface border border-border rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Suffix (EN)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={st.suffixEn}
                    onChange={(e) => {
                      const next = [...stats];
                      next[idx] = { ...st, suffixEn: e.target.value };
                      upd({ statsItems: next });
                    }}
                    className="w-full px-2 py-1.5 bg-surface border border-border rounded text-xs"
                  />
                </div>
              </div>
              <BilingualTextPair
                labelAr="العنوان (عربي)"
                labelEn="Title (English)"
                valueAr={st.titleAr}
                valueEn={st.titleEn}
                onChangeAr={(v) => {
                  const next = [...stats];
                  next[idx] = { ...st, titleAr: v };
                  upd({ statsItems: next });
                }}
                onChangeEn={(v) => {
                  const next = [...stats];
                  next[idx] = { ...st, titleEn: v };
                  upd({ statsItems: next });
                }}
              />
              <BilingualTextPair
                labelAr="الوصف (عربي)"
                labelEn="Description (English)"
                valueAr={st.descAr}
                valueEn={st.descEn}
                onChangeAr={(v) => {
                  const next = [...stats];
                  next[idx] = { ...st, descAr: v };
                  upd({ statsItems: next });
                }}
                onChangeEn={(v) => {
                  const next = [...stats];
                  next[idx] = { ...st, descEn: v };
                  upd({ statsItems: next });
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="font-heading-ar font-bold text-lg text-ink">منهجية العمل الخماسية (5-Step Methodology)</h2>
        <BilingualTextPair
          labelAr="الشارة (Eyebrow AR)"
          labelEn="Eyebrow (EN)"
          valueAr={settings.methodologyEyebrowAr || ''}
          valueEn={settings.methodologyEyebrowEn || ''}
          onChangeAr={(v) => upd({ methodologyEyebrowAr: v })}
          onChangeEn={(v) => upd({ methodologyEyebrowEn: v })}
        />
        <BilingualTextPair
          labelAr="العنوان الرئيسي (Heading AR)"
          labelEn="Heading (EN)"
          valueAr={settings.methodologyHeadingAr || ''}
          valueEn={settings.methodologyHeadingEn || ''}
          onChangeAr={(v) => upd({ methodologyHeadingAr: v })}
          onChangeEn={(v) => upd({ methodologyHeadingEn: v })}
        />
        <BilingualTextPair
          labelAr="الوصف (Description AR)"
          labelEn="Description (EN)"
          valueAr={settings.methodologyDescAr || ''}
          valueEn={settings.methodologyDescEn || ''}
          multiline
          rows={2}
          onChangeAr={(v) => upd({ methodologyDescAr: v })}
          onChangeEn={(v) => upd({ methodologyDescEn: v })}
        />
        <BilingualListEditor<BilingualNumberedStep>
          heading="مراحل المنهجية (Methodology Steps)"
          items={settings.methodologySteps || []}
          hasNum
          textKeyAr="descAr"
          textKeyEn="descEn"
          onChange={(next) => upd({ methodologySteps: next })}
        />
      </div>

      {/* Specialised Services */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="font-heading-ar font-bold text-lg text-ink">الخدمات المتخصصة (Specialised Services - 7)</h2>
        <BilingualTextPair
          labelAr="الشارة (Eyebrow AR)"
          labelEn="Eyebrow (EN)"
          valueAr={settings.specialisedEyebrowAr || ''}
          valueEn={settings.specialisedEyebrowEn || ''}
          onChangeAr={(v) => upd({ specialisedEyebrowAr: v })}
          onChangeEn={(v) => upd({ specialisedEyebrowEn: v })}
        />
        <BilingualTextPair
          labelAr="العنوان (Heading AR)"
          labelEn="Heading (EN)"
          valueAr={settings.specialisedHeadingAr || ''}
          valueEn={settings.specialisedHeadingEn || ''}
          onChangeAr={(v) => upd({ specialisedHeadingAr: v })}
          onChangeEn={(v) => upd({ specialisedHeadingEn: v })}
        />
        <BilingualTextPair
          labelAr="الوصف (Description AR)"
          labelEn="Description (EN)"
          valueAr={settings.specialisedDescAr || ''}
          valueEn={settings.specialisedDescEn || ''}
          multiline
          rows={2}
          onChangeAr={(v) => upd({ specialisedDescAr: v })}
          onChangeEn={(v) => upd({ specialisedDescEn: v })}
        />
        <BilingualListEditor<BilingualTitleDescItem>
          heading="بطاقات الخدمات المتخصصة (Specialised Items)"
          items={settings.specialisedItems || []}
          textKeyAr="descAr"
          textKeyEn="descEn"
          onChange={(next) => upd({ specialisedItems: next })}
        />
      </div>

      {/* Institutional Excellence */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="font-heading-ar font-bold text-lg text-ink">التميز المؤسسي (Institutional Excellence - 5)</h2>
        <BilingualTextPair
          labelAr="الشارة (Eyebrow AR)"
          labelEn="Eyebrow (EN)"
          valueAr={settings.excellenceEyebrowAr || ''}
          valueEn={settings.excellenceEyebrowEn || ''}
          onChangeAr={(v) => upd({ excellenceEyebrowAr: v })}
          onChangeEn={(v) => upd({ excellenceEyebrowEn: v })}
        />
        <BilingualTextPair
          labelAr="العنوان (Heading AR)"
          labelEn="Heading (EN)"
          valueAr={settings.excellenceHeadingAr || ''}
          valueEn={settings.excellenceHeadingEn || ''}
          onChangeAr={(v) => upd({ excellenceHeadingAr: v })}
          onChangeEn={(v) => upd({ excellenceHeadingEn: v })}
        />
        <BilingualTextPair
          labelAr="الوصف (Description AR)"
          labelEn="Description (EN)"
          valueAr={settings.excellenceDescAr || ''}
          valueEn={settings.excellenceDescEn || ''}
          multiline
          rows={2}
          onChangeAr={(v) => upd({ excellenceDescAr: v })}
          onChangeEn={(v) => upd({ excellenceDescEn: v })}
        />
        <BilingualListEditor<BilingualTitleDescItem>
          heading="ركائز التميز المؤسسي (Excellence Pillars)"
          items={settings.excellencePillars || []}
          textKeyAr="descAr"
          textKeyEn="descEn"
          onChange={(next) => upd({ excellencePillars: next })}
        />
      </div>

      {/* Values & Client Journey */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="font-heading-ar font-bold text-lg text-ink">القيم ورحلة العميل (Values & Journey)</h2>
        <BilingualTextPair
          labelAr="شارة القيم (Values Eyebrow AR)"
          labelEn="Values Eyebrow (EN)"
          valueAr={settings.valuesEyebrowAr || ''}
          valueEn={settings.valuesEyebrowEn || ''}
          onChangeAr={(v) => upd({ valuesEyebrowAr: v })}
          onChangeEn={(v) => upd({ valuesEyebrowEn: v })}
        />
        <BilingualTextPair
          labelAr="عنوان القيم (Values Heading AR)"
          labelEn="Values Heading (EN)"
          valueAr={settings.valuesHeadingAr || ''}
          valueEn={settings.valuesHeadingEn || ''}
          onChangeAr={(v) => upd({ valuesHeadingAr: v })}
          onChangeEn={(v) => upd({ valuesHeadingEn: v })}
        />
        <BilingualListEditor<BilingualTitleDescItem>
          heading="عناصر القيم (Values Items)"
          items={settings.valuesItems || []}
          textKeyAr="descAr"
          textKeyEn="descEn"
          onChange={(next) => upd({ valuesItems: next })}
        />

        <BilingualTextPair
          labelAr="شارة رحلة العميل (Journey Eyebrow AR)"
          labelEn="Journey Eyebrow (EN)"
          valueAr={settings.journeyEyebrowAr || ''}
          valueEn={settings.journeyEyebrowEn || ''}
          onChangeAr={(v) => upd({ journeyEyebrowAr: v })}
          onChangeEn={(v) => upd({ journeyEyebrowEn: v })}
        />
        <BilingualTextPair
          labelAr="عنوان رحلة العميل (Journey Heading AR)"
          labelEn="Journey Heading (EN)"
          valueAr={settings.journeyHeadingAr || ''}
          valueEn={settings.journeyHeadingEn || ''}
          onChangeAr={(v) => upd({ journeyHeadingAr: v })}
          onChangeEn={(v) => upd({ journeyHeadingEn: v })}
        />
        <BilingualListEditor<BilingualTitleDescItem>
          heading="خطوات رحلة العميل (Journey Steps)"
          items={settings.journeySteps || []}
          textKeyAr="descAr"
          textKeyEn="descEn"
          onChange={(next) => upd({ journeySteps: next })}
        />
      </div>
    </div>
  );
}

export function SectionsAndLegalTab({ settings, setSettings }: Props) {
  const upd = (patch: Partial<SiteSettings>) =>
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="font-heading-ar font-bold text-lg text-ink border-b border-border pb-2">
          ترويسات الصفحات والأقسام (Services / Team / Insights / Contact Headers)
        </h2>
        <BilingualTextPair
          labelAr="شارة قسم الخدمات (Services Eyebrow AR)"
          labelEn="Services Eyebrow (EN)"
          valueAr={settings.servicesSectionEyebrowAr || ''}
          valueEn={settings.servicesSectionEyebrowEn || ''}
          onChangeAr={(v) => upd({ servicesSectionEyebrowAr: v })}
          onChangeEn={(v) => upd({ servicesSectionEyebrowEn: v })}
        />
        <BilingualTextPair
          labelAr="عنوان قسم الخدمات (Services Heading AR)"
          labelEn="Services Heading (EN)"
          valueAr={settings.servicesSectionHeadingAr || ''}
          valueEn={settings.servicesSectionHeadingEn || ''}
          onChangeAr={(v) => upd({ servicesSectionHeadingAr: v })}
          onChangeEn={(v) => upd({ servicesSectionHeadingEn: v })}
        />
        <BilingualTextPair
          labelAr="وصف قسم الخدمات (Services Desc AR)"
          labelEn="Services Description (EN)"
          valueAr={settings.servicesSectionDescAr || ''}
          valueEn={settings.servicesSectionDescEn || ''}
          multiline
          rows={2}
          onChangeAr={(v) => upd({ servicesSectionDescAr: v })}
          onChangeEn={(v) => upd({ servicesSectionDescEn: v })}
        />

        <BilingualTextPair
          labelAr="شارة صفحة الفريق (Team Eyebrow AR)"
          labelEn="Team Eyebrow (EN)"
          valueAr={settings.teamSectionEyebrowAr || ''}
          valueEn={settings.teamSectionEyebrowEn || ''}
          onChangeAr={(v) => upd({ teamSectionEyebrowAr: v })}
          onChangeEn={(v) => upd({ teamSectionEyebrowEn: v })}
        />
        <BilingualTextPair
          labelAr="عنوان صفحة الفريق (Team Heading AR)"
          labelEn="Team Heading (EN)"
          valueAr={settings.teamSectionHeadingAr || ''}
          valueEn={settings.teamSectionHeadingEn || ''}
          onChangeAr={(v) => upd({ teamSectionHeadingAr: v })}
          onChangeEn={(v) => upd({ teamSectionHeadingEn: v })}
        />
        <BilingualTextPair
          labelAr="وصف صفحة الفريق (Team Desc AR)"
          labelEn="Team Description (EN)"
          valueAr={settings.teamSectionDescAr || ''}
          valueEn={settings.teamSectionDescEn || ''}
          multiline
          rows={2}
          onChangeAr={(v) => upd({ teamSectionDescAr: v })}
          onChangeEn={(v) => upd({ teamSectionDescEn: v })}
        />

        <BilingualTextPair
          labelAr="شارة صفحة المقالات (Insights Eyebrow AR)"
          labelEn="Insights Eyebrow (EN)"
          valueAr={settings.insightsSectionEyebrowAr || ''}
          valueEn={settings.insightsSectionEyebrowEn || ''}
          onChangeAr={(v) => upd({ insightsSectionEyebrowAr: v })}
          onChangeEn={(v) => upd({ insightsSectionEyebrowEn: v })}
        />
        <BilingualTextPair
          labelAr="عنوان صفحة المقالات (Insights Heading AR)"
          labelEn="Insights Heading (EN)"
          valueAr={settings.insightsSectionHeadingAr || ''}
          valueEn={settings.insightsSectionHeadingEn || ''}
          onChangeAr={(v) => upd({ insightsSectionHeadingAr: v })}
          onChangeEn={(v) => upd({ insightsSectionHeadingEn: v })}
        />
        <BilingualTextPair
          labelAr="وصف صفحة المقالات (Insights Desc AR)"
          labelEn="Insights Description (EN)"
          valueAr={settings.insightsSectionDescAr || ''}
          valueEn={settings.insightsSectionDescEn || ''}
          multiline
          rows={2}
          onChangeAr={(v) => upd({ insightsSectionDescAr: v })}
          onChangeEn={(v) => upd({ insightsSectionDescEn: v })}
        />

        <BilingualTextPair
          labelAr="شارة صفحة التواصل (Contact Eyebrow AR)"
          labelEn="Contact Eyebrow (EN)"
          valueAr={settings.contactSectionEyebrowAr || ''}
          valueEn={settings.contactSectionEyebrowEn || ''}
          onChangeAr={(v) => upd({ contactSectionEyebrowAr: v })}
          onChangeEn={(v) => upd({ contactSectionEyebrowEn: v })}
        />
        <BilingualTextPair
          labelAr="عنوان صفحة التواصل (Contact Heading AR)"
          labelEn="Contact Heading (EN)"
          valueAr={settings.contactSectionHeadingAr || ''}
          valueEn={settings.contactSectionHeadingEn || ''}
          onChangeAr={(v) => upd({ contactSectionHeadingAr: v })}
          onChangeEn={(v) => upd({ contactSectionHeadingEn: v })}
        />
        <BilingualTextPair
          labelAr="وصف صفحة التواصل (Contact Desc AR)"
          labelEn="Contact Description (EN)"
          valueAr={settings.contactSectionDescAr || ''}
          valueEn={settings.contactSectionDescEn || ''}
          multiline
          rows={2}
          onChangeAr={(v) => upd({ contactSectionDescAr: v })}
          onChangeEn={(v) => upd({ contactSectionDescEn: v })}
        />
        <BilingualTextPair
          labelAr="تنويه عدم قيام وكالة قانونية (Contact Disclaimer AR)"
          labelEn="Contact Form Disclaimer (EN)"
          valueAr={settings.contactDisclaimerAr || ''}
          valueEn={settings.contactDisclaimerEn || ''}
          multiline
          rows={2}
          onChangeAr={(v) => upd({ contactDisclaimerAr: v })}
          onChangeEn={(v) => upd({ contactDisclaimerEn: v })}
        />
      </div>

      {/* Terms */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="font-heading-ar font-bold text-lg text-ink">صفحة الشروط والأحكام (/terms)</h2>
        <BilingualTextPair
          labelAr="الشارة (Terms Eyebrow AR)"
          labelEn="Terms Eyebrow (EN)"
          valueAr={settings.termsEyebrowAr || ''}
          valueEn={settings.termsEyebrowEn || ''}
          onChangeAr={(v) => upd({ termsEyebrowAr: v })}
          onChangeEn={(v) => upd({ termsEyebrowEn: v })}
        />
        <BilingualTextPair
          labelAr="العنوان الرئيسي (Terms Title AR)"
          labelEn="Terms Title (EN)"
          valueAr={settings.termsTitleAr || ''}
          valueEn={settings.termsTitleEn || ''}
          onChangeAr={(v) => upd({ termsTitleAr: v })}
          onChangeEn={(v) => upd({ termsTitleEn: v })}
        />
        <BilingualTextPair
          labelAr="تاريخ آخر تحديث (Terms Updated AR)"
          labelEn="Terms Updated (EN)"
          valueAr={settings.termsUpdatedAr || ''}
          valueEn={settings.termsUpdatedEn || ''}
          onChangeAr={(v) => upd({ termsUpdatedAr: v })}
          onChangeEn={(v) => upd({ termsUpdatedEn: v })}
        />
        <BilingualListEditor<LegalDocumentSection>
          heading="بنود الشروط والأحكام (Terms Sections)"
          items={settings.termsSections || []}
          textKeyAr="bodyAr"
          textKeyEn="bodyEn"
          onChange={(next) => upd({ termsSections: next })}
        />
      </div>

      {/* Privacy */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="font-heading-ar font-bold text-lg text-ink">صفحة سياسة الخصوصية (/privacy)</h2>
        <BilingualTextPair
          labelAr="الشارة (Privacy Eyebrow AR)"
          labelEn="Privacy Eyebrow (EN)"
          valueAr={settings.privacyEyebrowAr || ''}
          valueEn={settings.privacyEyebrowEn || ''}
          onChangeAr={(v) => upd({ privacyEyebrowAr: v })}
          onChangeEn={(v) => upd({ privacyEyebrowEn: v })}
        />
        <BilingualTextPair
          labelAr="العنوان الرئيسي (Privacy Title AR)"
          labelEn="Privacy Title (EN)"
          valueAr={settings.privacyTitleAr || ''}
          valueEn={settings.privacyTitleEn || ''}
          onChangeAr={(v) => upd({ privacyTitleAr: v })}
          onChangeEn={(v) => upd({ privacyTitleEn: v })}
        />
        <BilingualTextPair
          labelAr="المقدمة النظامية (Privacy Intro AR)"
          labelEn="Privacy Intro (EN)"
          valueAr={settings.privacyIntroAr || ''}
          valueEn={settings.privacyIntroEn || ''}
          multiline
          rows={2}
          onChangeAr={(v) => upd({ privacyIntroAr: v })}
          onChangeEn={(v) => upd({ privacyIntroEn: v })}
        />
        <BilingualListEditor<LegalDocumentSection>
          heading="بنود إشعار الخصوصية (Privacy Sections)"
          items={settings.privacySections || []}
          textKeyAr="bodyAr"
          textKeyEn="bodyEn"
          onChange={(next) => upd({ privacySections: next })}
        />
      </div>
    </div>
  );
}
