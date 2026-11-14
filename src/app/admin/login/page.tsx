'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mfaCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات ورمز التحقق.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-md p-8 sm:p-10 bg-surface rounded-sm border border-border shadow-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-sm bg-signature text-gold mx-auto flex items-center justify-center font-heading-ar font-bold text-xl border border-gold/40 shadow-xs">
            ر
          </div>
          <h1 className="font-heading-ar font-bold text-2xl text-ink">
            تسجيل دخول لوحة التحكم
          </h1>
          <p className="text-xs text-muted">
            نظام إدارة المحتوى - شركة رياض محمد الزهراني للمحاماة
          </p>
        </div>

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/30 rounded-sm flex items-center gap-2 text-xs text-danger">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink">
              البريد الإلكتروني المهني
            </label>
            <div className="relative">
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@rma-law.sa"
                className="w-full px-4 py-2.5 bg-canvas border border-border rounded-sm text-sm text-ink placeholder-muted/50 focus:outline-none focus:border-gold"
              />
              <Mail className="w-4 h-4 text-muted absolute end-3 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 bg-canvas border border-border rounded-sm text-sm text-ink placeholder-muted/50 focus:outline-none focus:border-gold"
              />
              <Lock className="w-4 h-4 text-muted absolute end-3 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-ink">
                رمز التحقق الثنائي (TOTP MFA)
              </label>
              <span className="text-[11px] text-gold font-medium">مطلوب أمنياً</span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={6}
                dir="ltr"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="000000"
                className="w-full px-4 py-2.5 bg-canvas border border-border rounded-sm text-sm text-ink font-mono tracking-widest text-center focus:outline-none focus:border-gold"
              />
              <KeyRound className="w-4 h-4 text-muted absolute end-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-sm bg-ink text-on-dark text-sm font-semibold hover:bg-signature transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 bg-canvas/60 rounded border border-border/60 text-[11px] text-muted text-center space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium text-ink">
            <Shield className="w-3.5 h-3.5 text-gold-ink" />
            <span>بوابة محصنة ومراقبة أمنياً وفق ضوابط الهيئة الوطنية للأمن السيبراني</span>
          </p>
          <p>الدخول مخصص حصراً لمنسوبي ومسؤولي الشركة المصرح لهم.</p>
        </div>
      </div>
    </div>
  );
}
