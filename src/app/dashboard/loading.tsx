export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-bg-custom animate-pulse">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-60 bg-navy flex-col p-4 gap-3">
        <div className="h-10 w-32 bg-white/20 rounded-xl mb-4" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 bg-white/10 rounded-xl" />
        ))}
      </div>
      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-white border-b border-border-custom" />
        <div className="p-6 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-border-custom" />
            ))}
          </div>
          {/* Table */}
          <div className="h-64 bg-white rounded-2xl border border-border-custom" />
        </div>
      </div>
    </div>
  );
}
