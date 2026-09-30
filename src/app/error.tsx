'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg-custom flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="font-sora font-black text-navy text-2xl mb-3">Something went wrong</h1>
        <p className="text-muted text-sm mb-8">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue text-white font-bold rounded-xl hover:bg-blue/90 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-border-custom text-navy font-bold rounded-xl hover:bg-bg-custom transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
