'use client';

import { useLocale } from '@/components/language-toggle';
import { t } from '@/lib/i18n';

export default function HomePage() {
  const [locale] = useLocale();
  const tr = t(locale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-6xl font-bold tracking-tight">
          LevelUp<span className="text-emerald-400">.log</span>
        </h1>
        <p className="mb-8 text-xl text-gray-400">
          {tr.home.tagline}
          <br />
          {tr.home.tagline2}
        </p>
        <div className="mb-12 rounded-xl border border-gray-800 bg-gray-900 p-6 text-left font-mono text-sm">
          <p className="text-gray-500">{tr.home.installComment}</p>
          <p className="text-emerald-400">npx @levelup-log/mcp-server init</p>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid gap-8 text-left md:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="mb-3 text-2xl">🎮</div>
            <h3 className="mb-2 font-semibold">{tr.home.features.gamify.title}</h3>
            <p className="text-sm text-gray-400">{tr.home.features.gamify.desc}</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="mb-3 text-2xl">🔥</div>
            <h3 className="mb-2 font-semibold">{tr.home.features.streak.title}</h3>
            <p className="text-sm text-gray-400">{tr.home.features.streak.desc}</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="mb-3 text-2xl">🏆</div>
            <h3 className="mb-2 font-semibold">{tr.home.features.compete.title}</h3>
            <p className="text-sm text-gray-400">{tr.home.features.compete.desc}</p>
          </div>
        </div>

        <p className="mt-12 text-sm text-gray-600">{tr.home.footer}</p>
      </div>
    </main>
  );
}
