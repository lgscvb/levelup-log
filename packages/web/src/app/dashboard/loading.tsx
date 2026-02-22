export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-800" />
        <div className="h-4 w-20 animate-pulse rounded bg-gray-800" />
      </div>

      {/* Stats card skeleton */}
      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-gray-800" />
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-800" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto h-8 w-16 animate-pulse rounded bg-gray-800" />
              <div className="mx-auto mt-1 h-3 w-12 animate-pulse rounded bg-gray-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Achievement list skeleton */}
      <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-800" />
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
