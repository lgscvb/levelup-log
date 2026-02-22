export default function LeaderboardLoading() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      {/* Title skeleton */}
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-gray-800" />

      {/* Tab buttons skeleton */}
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 animate-pulse rounded-lg bg-gray-800"
          />
        ))}
      </div>

      {/* Leaderboard rows skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4"
          >
            {/* Rank */}
            <div className="h-6 w-8 animate-pulse rounded bg-gray-800" />
            {/* Avatar */}
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-800" />
            {/* Name + username */}
            <div className="flex-1 space-y-1">
              <div className="h-5 w-32 animate-pulse rounded bg-gray-800" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-800" />
            </div>
            {/* XP */}
            <div className="text-right">
              <div className="h-5 w-16 animate-pulse rounded bg-gray-800" />
              <div className="mt-1 h-3 w-8 animate-pulse rounded bg-gray-800 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
