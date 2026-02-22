export default function ProfileLoading() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Profile header skeleton — centered avatar */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 h-24 w-24 animate-pulse rounded-full bg-gray-800" />
        <div className="h-8 w-56 animate-pulse rounded bg-gray-800" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-800" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-800" />
      </div>

      {/* Stats row skeleton */}
      <div className="mb-8 grid grid-cols-4 gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center">
            <div className="mx-auto h-8 w-16 animate-pulse rounded bg-gray-800" />
            <div className="mx-auto mt-1 h-3 w-12 animate-pulse rounded bg-gray-800" />
          </div>
        ))}
      </div>

      {/* Category breakdown skeleton */}
      <div className="mb-8">
        <div className="mb-3 h-6 w-48 animate-pulse rounded bg-gray-800" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-6 animate-pulse rounded bg-gray-800" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-800" />
              <div className="h-2 flex-1 animate-pulse rounded-full bg-gray-800" />
              <div className="h-4 w-12 animate-pulse rounded bg-gray-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent achievements skeleton */}
      <div className="mb-3 h-6 w-48 animate-pulse rounded bg-gray-800" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 animate-pulse rounded bg-gray-800" />
              <div className="h-5 w-16 animate-pulse rounded bg-gray-800" />
            </div>
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-800" />
            <div className="mt-1 h-3 w-24 animate-pulse rounded bg-gray-800" />
          </div>
        ))}
      </div>
    </main>
  );
}
