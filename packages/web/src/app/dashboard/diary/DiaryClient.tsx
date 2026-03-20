'use client';

import Link from 'next/link';
import { useLocale } from '@/components/locale-provider';
import { t } from '@/lib/i18n';

type DiaryEntry = {
  id: string;
  entry_date: string;
  content: string;
  mood?: string;
  created_at: string;
};

type Props = {
  entries: DiaryEntry[];
};

export function DiaryClient({ entries }: Props) {
  const { locale } = useLocale();
  const tr = t(locale).diary;

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{tr.title}</h1>
        <Link
          href="/dashboard"
          className="text-sm text-gray-400 hover:text-white"
        >
          {tr.backToDashboard}
        </Link>
      </div>

      {/* Diary Entries */}
      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-lg border border-gray-800 bg-gray-900/50 p-5"
            >
              <time className="mb-2 block text-sm font-medium text-emerald-400">
                {new Date(entry.entry_date + 'T00:00:00').toLocaleDateString(locale, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
              <p className="whitespace-pre-wrap text-gray-300">
                {entry.content}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-800 p-8 text-center text-gray-500">
          <p>{tr.noEntries}</p>
          <p className="mt-2 text-sm text-gray-600">{tr.noEntriesHint}</p>
        </div>
      )}
    </main>
  );
}
