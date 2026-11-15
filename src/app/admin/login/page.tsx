'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/firebase-client';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let idToken: string | undefined = undefined;

      // 1. Attempt Client-side Firebase Authentication if user is registered in Firebase Console
      try {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        idToken = await userCred.user.getIdToken();
      } catch (fbErr: any) {
        // Firebase client sign-in failed (or user only in server DB) - fallback to server verification
      }

      // 2. Authenticate session with the secure backend
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول. يرجى التحقق من صحة البريد الإلكتروني وكلمة المرور.');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من صحة البريد الإلكتروني وكلمة المرور.');
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
                placeholder="admin@rma-law.sa"
                className="w-full pl-4 pr-10 py-2.5 bg-canvas border border-border rounded-sm text-sm text-ink placeholder-muted/50 focus:outline-none focus:border-gold"
              />
              <Mail className="w-4 h-4 text-muted absolute right-3 top-3 pointer-events-none" />
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
                className="w-full pl-4 pr-10 py-2.5 bg-canvas border border-border rounded-sm text-sm text-ink placeholder-muted/50 focus:outline-none focus:border-gold"
              />
              <Lock className="w-4 h-4 text-muted absolute right-3 top-3 pointer-events-none" />
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
            <span>بوابة محصنة ومخصصة حصراً لمنسوبي ومسؤولي الشركة</span>
          </p>
        </div>
      </div>
    </div>
  );
}
