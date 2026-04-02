function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="w-24 h-5" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="hidden sm:flex flex-col gap-1.5">
              <Skeleton className="w-24 h-3.5" />
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10 space-y-2">
          <Skeleton className="w-56 h-7" />
          <Skeleton className="w-32 h-4" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-20 h-3" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
              <Skeleton className="w-16 h-8 mb-2" />
              <Skeleton className="w-24 h-3" />
            </div>
          ))}
        </div>

        {/* Modules */}
        <div>
          <Skeleton className="w-24 h-3 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <Skeleton className="w-11 h-11 rounded-xl mb-4" />
                <Skeleton className="w-24 h-4 mb-2" />
                <Skeleton className="w-36 h-3" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="w-24 h-5" />
          </div>
          <Skeleton className="w-36 h-8 rounded-lg" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Avatar area */}
        <div className="flex flex-col items-center mb-10 gap-3">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="w-36 h-5" />
          <Skeleton className="w-44 h-4" />
          <Skeleton className="w-24 h-6 rounded-full" />
        </div>

        {/* Form card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 space-y-1.5">
            <Skeleton className="w-40 h-5" />
            <Skeleton className="w-56 h-3" />
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Skeleton className="w-16 h-3" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="w-16 h-3" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
            <div className="flex justify-end pt-2">
              <Skeleton className="w-28 h-10 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Session card */}
        <div className="mt-6 bg-slate-800 border border-rose-500/20 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 space-y-1.5">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-44 h-3" />
          </div>
          <div className="p-6 flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="w-40 h-4" />
              <Skeleton className="w-52 h-3" />
            </div>
            <Skeleton className="w-24 h-9 rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
