import Link from "next/link";

/** Jharokha-arch + flight-path mark, from the BookMyGlobal logo. */
export function LogoMark({ className = "h-9 w-9", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const trace = tone === "dark" ? "#FAF7F2" : "#141B2F";
  return (
    <svg viewBox="0 0 56 44" className={className} fill="none" aria-hidden="true">
      <path d="M12 40V24C12 15.163 19.163 8 28 8C36.837 8 44 15.163 44 24V40" stroke="#E9A23B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 40V26C18 20.477 22.477 16 28 16C33.523 16 38 20.477 38 26V40" stroke="#0E8F86" strokeWidth="1.5" strokeDasharray="2 3" />
      <circle cx="28" cy="26" r="4.5" fill="#E9A23B" />
      <path d="M6 32C14 30 24 20 38 14C46 10 52 18 42 28" stroke={trace} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
      <circle cx="42" cy="28" r="2" fill={trace} />
    </svg>
  );
}

export function Logo({
  tone = "dark",
  className = "",
  withTagline = false,
}: {
  /** "dark" = shown on a dark background (ivory text); "light" = on a light background (ink text) */
  tone?: "dark" | "light";
  className?: string;
  withTagline?: boolean;
}) {
  const text = tone === "dark" ? "text-[#FAF7F2]" : "text-primary-container";
  return (
    <Link href="/" aria-label="BookMyGlobal home" className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark tone={tone} className="h-8 w-9" />
      <span className="flex flex-col leading-none">
        <span className={`font-headline-sm text-[1.4rem] font-semibold tracking-tight ${text}`}>
          Book<span className="text-[#E9A23B]">My</span>Global
        </span>
        {withTagline && (
          <span className="mt-1 font-eyebrow text-[8.5px] font-bold uppercase tracking-[0.22em] text-on-primary-container">
            Curated expeditions
          </span>
        )}
      </span>
    </Link>
  );
}
