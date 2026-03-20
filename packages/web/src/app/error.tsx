'use client';

import { useLocale } from '@/components/locale-provider';
import { t } from '@/lib/i18n';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useLocale();
  const tr = t(locale).error;

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl">{'\u26A0\uFE0F'}</div>
      <h1 className="mt-4 text-2xl font-bold">{tr.title}</h1>
      <p className="mt-2 text-sm text-gray-400">
        {error.digest ? `${tr.errorId}${error.digest}` : tr.message}
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white transition hover:bg-emerald-500"
      >
        {tr.tryAgain}
      </button>
    </main>
  );
}
