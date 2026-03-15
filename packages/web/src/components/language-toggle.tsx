'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n';

const STORAGE_KEY = 'levelup-locale';

export function useLocale(): [Locale, (l: Locale) => void] {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === 'en' || saved === 'zh-TW') setLocaleState(saved);
  }, []);

  function setLocale(l: Locale) {
    localStorage.setItem(STORAGE_KEY, l);
    setLocaleState(l);
  }

  return [locale, setLocale];
}

export function LanguageToggle() {
  const [locale, setLocale] = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'zh-TW' : 'en')}
      className="rounded-md border border-gray-700 px-2 py-1 text-xs text-gray-400 transition hover:border-gray-500 hover:text-white"
      aria-label="Toggle language"
    >
      {locale === 'en' ? '繁中' : 'EN'}
    </button>
  );
}
