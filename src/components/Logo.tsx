import Link from "next/link";
import { Globe } from "lucide-react";

export function LogoMark({ className = "h-8 w-8", tone = "light" }: { className?: string; tone?: "dark" | "light" }) {
  const isDark = tone === "dark";
  return (
    <div className={`relative flex items-center justify-center rounded-xl transition-transform hover:scale-105 ${className} ${
      isDark ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-blue-600 text-white shadow-sm"
    }`}>
      <Globe className="h-5 w-5 animate-pulse" />
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-sky-400 ring-2 ring-white" />
    </div>
  );
}

export function Logo({
  tone = "light",
  className = "",
  withTagline = false,
}: {
  tone?: "dark" | "light";
  className?: string;
  withTagline?: boolean;
}) {
  const isDark = tone === "dark";
  const textColor = isDark ? "text-white" : "text-slate-900";
  const subColor = isDark ? "text-blue-200" : "text-slate-500";

  return (
    <Link href="/" aria-label="BookMyGlobal home" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 text-white shadow-[0_4px_12px_rgba(0,102,255,0.28)] transition-transform duration-200 group-hover:scale-105">
        <Globe className="h-5 w-5" />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`text-[1.25rem] font-black tracking-tight ${textColor} transition-colors`}>
          Book<span className="text-blue-600">My</span>Global
        </span>
        {withTagline ? (
          <span className={`mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] ${subColor}`}>
            Global Travel Concierge
          </span>
        ) : null}
      </div>
    </Link>
  );
}
