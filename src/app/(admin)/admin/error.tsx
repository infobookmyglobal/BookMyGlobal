'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🔴</div>
        <h2 className="font-sora font-black text-navy text-xl mb-2">Admin Error</h2>
        <p className="text-muted text-sm mb-6">{error?.message || 'Failed to load admin page.'}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-blue text-white font-bold text-sm rounded-xl hover:bg-blue/90 transition-colors"
          >
            Try Again
          </button>
          <a href="/admin" className="px-5 py-2.5 border border-border-custom text-navy font-bold text-sm rounded-xl hover:bg-bg-custom transition-colors">
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
