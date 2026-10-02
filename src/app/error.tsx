'use client';

export default function GlobalError({
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
    ? 'A server component rendering issue occurred. This usually happens when database credentials (DATABASE_URL) or Clerk authentication keys are missing or unreachable in Vercel.'
    : error?.message || 'An unexpected error occurred. Please try again.';

  return (
    <div className="min-h-screen bg-bg-custom flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm">
          ⚠️
        </div>
        <h1 className="font-sora font-black text-navy text-2xl mb-3">Something went wrong</h1>
        <p className="text-muted text-sm leading-relaxed mb-6">
          {errorMessage}
        </p>

        {error?.digest && (
          <div className="mb-6 p-3 bg-gray-50 rounded-xl text-left border border-gray-100">
            <span className="text-[11px] font-bold text-gray-500 block uppercase tracking-wider mb-1">
              Diagnostic Reference
            </span>
            <code className="text-xs text-navy font-mono break-all">{error.digest}</code>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue text-white font-bold rounded-xl hover:bg-blue/90 transition-all shadow-md hover:shadow-lg text-sm"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-border-custom text-navy font-bold rounded-xl hover:bg-bg-custom transition-all text-sm"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

