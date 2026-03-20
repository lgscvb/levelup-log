'use client';

import Link from 'next/link';
import { useLocale } from '@/components/locale-provider';
import { t } from '@/lib/i18n';

export default function NotFound() {
  const { locale } = useLocale();
  const tr = t(locale).notFound;

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-8 text-center">
      <div className="text-8xl font-bold text-gray-800">404</div>
      <h1 className="mt-4 text-2xl font-bold">{tr.title}</h1>
      <p className="mt-2 text-gray-400">
        {tr.description}
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white transition hover:bg-emerald-500"
      >
        {tr.backHome}
      </Link>
    </main>
  );
}
