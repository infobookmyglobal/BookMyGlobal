'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isServerComponentError =
    error?.message?.includes('Server Components render') ||
    error?.message?.includes('digest');

  const errorMessage = isServerComponentError
    ? 'Unable to load the admin console due to a database query or authentication failure. Please check DATABASE_URL and Clerk configuration in Vercel.'
    : error?.message || 'Failed to load admin page.';

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
          🔴
        </div>
        <h2 className="font-sora font-black text-navy text-xl mb-2">Admin Error</h2>
        <p className="text-muted text-sm leading-relaxed mb-6">{errorMessage}</p>
        
        {error?.digest && (
          <div className="mb-6 p-3 bg-gray-50 rounded-xl text-left border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">
              Error Digest
            </span>
            <code className="text-xs text-navy font-mono break-all">{error.digest}</code>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-blue text-white font-bold text-sm rounded-xl hover:bg-blue/90 transition-all shadow-md"
          >
            Try Again
          </button>
          <a href="/admin" className="px-5 py-2.5 border border-border-custom text-navy font-bold text-sm rounded-xl hover:bg-bg-custom transition-colors">
            Reload Admin
          </a>
        </div>
      </div>
    </div>
  );
}

