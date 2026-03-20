'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';
import { useLocale } from '@/components/locale-provider';
import { t } from '@/lib/i18n';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { locale } = useLocale();
  const tr = t(locale).login;

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">
        <h1 className="mb-2 text-4xl font-bold">
          LevelUp<span className="text-emerald-400">.log</span>
        </h1>
        <p className="mb-8 text-gray-400">{tr.subtitle}</p>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full rounded-lg bg-white px-6 py-3 font-medium text-gray-900 transition hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? tr.redirecting : tr.continueGoogle}
        </button>
        <p className="mt-6 text-xs text-gray-600">
          {tr.terms}
        </p>
      </div>
    </main>
  );
}
