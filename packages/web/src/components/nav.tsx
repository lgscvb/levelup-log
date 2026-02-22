import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-bold">
          LevelUp<span className="text-emerald-400">.log</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/leaderboard"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            Leaderboard
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
