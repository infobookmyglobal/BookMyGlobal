export default function Loading() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="relative flex items-center justify-center">
        {/* Ambient Ring Glow */}
        <div className="absolute h-20 w-20 rounded-full bg-secondary-container/20 blur-xl animate-pulse" />
        
        {/* Dual Spinning Orbit Rings */}
        <div className="h-14 w-14 rounded-full border-2 border-surface-container-high border-t-secondary animate-spin" />
        <div className="absolute h-8 w-8 rounded-full border-2 border-surface-container-high border-b-primary-container animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
      </div>

      <div className="mt-6 space-y-1.5">
        <p className="font-ticket-code text-xs uppercase tracking-widest text-secondary font-bold">
          BookMyGlobal
        </p>
        <p className="font-title-md text-sm font-semibold text-primary">
          Navigating your journey...
        </p>
      </div>
    </div>
  );
}
