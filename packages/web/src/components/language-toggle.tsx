'use client';

import { useState, useRef, useEffect } from 'react';
import { LOCALES, LOCALE_LABELS, type Locale } from '@/lib/i18n';
import { useLocale } from './locale-provider';

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-md border border-gray-700 px-2 py-1 text-xs text-gray-400 transition hover:border-gray-500 hover:text-white"
        aria-label="Select language"
      >
        🌐 {LOCALE_LABELS[locale]}
        <span className="text-gray-600">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-gray-700 bg-gray-900 py-1 shadow-lg">
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l as Locale); setOpen(false); }}
              className={`w-full px-3 py-1.5 text-left text-xs transition hover:bg-gray-800 ${
                l === locale ? 'text-emerald-400' : 'text-gray-300'
              }`}
            >
              {LOCALE_LABELS[l as Locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
