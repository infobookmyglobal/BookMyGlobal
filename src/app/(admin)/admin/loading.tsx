export default function AdminLoading() {
  return (
    <div className="flex h-screen bg-bg-custom animate-pulse">
      {/* Admin sidebar skeleton */}
      <div className="hidden md:flex w-64 bg-navy flex-col p-4 gap-2">
        <div className="h-12 w-36 bg-white/20 rounded-xl mb-6" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-8 bg-white/10 rounded-xl" />
        ))}
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-white border-b border-border-custom" />
        <div className="p-6 space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-border-custom" />
            ))}
          </div>
          {/* Table skeleton */}
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            <div className="h-12 bg-navy/10" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 border-b border-border-custom flex items-center px-6 gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
