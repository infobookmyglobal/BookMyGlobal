export default function BlogLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-surface pt-36">
      <div className="mx-auto max-w-7xl space-y-4 px-margin-mobile md:px-margin-tablet lg:px-margin">
        <div className="h-4 w-24 rounded bg-surface-container-high" />
        <div className="h-12 w-2/3 max-w-xl rounded-xl bg-surface-container-high" />
        <div className="grid gap-space-md pt-space-xl sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-surface-container-lowest">
              <div className="aspect-video bg-surface-container" />
              <div className="space-y-3 p-space-md">
                <div className="h-3 w-20 rounded bg-surface-container" />
                <div className="h-5 w-full rounded bg-surface-container-high" />
                <div className="h-4 w-3/4 rounded bg-surface-container" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
