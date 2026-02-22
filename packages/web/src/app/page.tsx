export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-6xl font-bold tracking-tight">
          LevelUp<span className="text-emerald-400">.log</span>
        </h1>
        <p className="mb-8 text-xl text-gray-400">
          Turn your daily tasks into game-like achievements.
          <br />
          Your age is your level &mdash; the question is what you accomplished at it.
        </p>
        <div className="mb-12 rounded-xl border border-gray-800 bg-gray-900 p-6 text-left font-mono text-sm">
          <p className="text-gray-500">{'# Install in one command'}</p>
          <p className="text-emerald-400">npx @levelup-log/mcp-server init</p>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid gap-8 text-left md:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="mb-3 text-2xl">{'\uD83C\uDFAE'}</div>
            <h3 className="mb-2 font-semibold">Gamify Everything</h3>
            <p className="text-sm text-gray-400">
              Turn daily tasks into achievements. Code, life, health, learning — everything counts.
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="mb-3 text-2xl">{'\uD83D\uDD25'}</div>
            <h3 className="mb-2 font-semibold">Track Your Streak</h3>
            <p className="text-sm text-gray-400">
              Build momentum with daily streaks. Your AI coach keeps you motivated.
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="mb-3 text-2xl">{'\uD83C\uDFC6'}</div>
            <h3 className="mb-2 font-semibold">Compete & Share</h3>
            <p className="text-sm text-gray-400">
              Climb the leaderboard. Unlock titles. Share your profile with the world.
            </p>
          </div>
        </div>

        <p className="mt-12 text-sm text-gray-600">
          Works with Claude Desktop, Claude Code, ChatGPT Desktop, Cursor, and more.
        </p>
      </div>
    </main>
  );
}
