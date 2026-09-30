import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";
import type { Service } from "@/config/services";
import { ServiceIcon } from "@/components/ServiceIcon";
import { IndiaTag } from "@/components/site/ui";

type Variant = "large" | "medium" | "small" | "dark" | "teal";

export function ServiceCard({ service, variant = "medium", className = "" }: { service: Service; variant?: Variant; className?: string }) {
  const dark = variant === "dark";
  const teal = variant === "teal";
  const isLarge = variant === "large";
  const small = variant === "small";

  const bg = dark 
    ? "bg-primary-container text-on-primary border-primary-fixed-dim/20 shadow-xl" 
    : teal 
      ? "bg-surface-container-low/90 border-tertiary-fixed-dim/40" 
      : "bg-surface-container-lowest border-surface-container-high";

  const kicker = dark ? "text-secondary-container" : "text-secondary";
  const title = dark ? "text-on-primary" : "text-primary";
  const body = dark ? "text-on-primary-container" : "text-on-surface-variant";

  // Service-specific dynamic perks
  const perks = service.detail?.included?.slice(0, 3) || [];

  return (
    <Link
      href={service.href}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-secondary hover:shadow-[0_20px_40px_-15px_rgba(20,27,47,0.12)] ${bg} ${
        small ? "p-5" : "p-7"
      } ${className}`}
    >
      {/* Ambient Top Glow on Hover */}
      <div 
        aria-hidden 
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-secondary-container/15 blur-2xl transition-opacity duration-300 group-hover:opacity-100" 
      />

      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`font-ticket-code text-[11px] font-bold uppercase tracking-widest ${kicker}`}>
              {dark ? `${service.pillar} · Direct Flagship` : `${service.pillar} · ${service.kicker}`}
            </span>
            {dark && (
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 font-ticket-code text-[8px] uppercase tracking-wider text-secondary-container">
                <Sparkles className="h-2.5 w-2.5" />
                Rishikesh
              </span>
            )}
          </div>
          {service.indiaOnly && <IndiaTag />}
        </div>

        <h3 className={`${isLarge ? "font-headline-md text-2xl lg:text-3xl" : small ? "font-title-md text-base" : "font-headline-sm text-xl"} font-bold tracking-tight ${title}`}>
          {service.title}
        </h3>

        <p className={`${small ? "font-body-sm text-xs" : "font-body-md text-sm"} leading-relaxed ${body}`}>
          {service.summary}
        </p>

        {/* Feature perks for large/medium cards */}
        {!small && perks.length > 0 && (
          <ul className="space-y-1.5 pt-2">
            {perks.map((p, i) => (
              <li key={i} className={`flex items-start gap-2 text-[12px] ${dark ? "text-on-primary-container" : "text-on-surface-variant"}`}>
                <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${dark ? "text-secondary-container" : "text-secondary"}`} />
                <span className="line-clamp-1">{p}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={`relative z-10 flex items-center justify-between ${small ? "mt-4" : "mt-6"} border-t ${dark ? "border-white/10" : "border-surface-container-high"} pt-4`}>
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105 ${
          dark 
            ? "bg-white/10 text-secondary-container group-hover:bg-secondary-container group-hover:text-on-secondary-container" 
            : "bg-surface-container text-secondary group-hover:bg-secondary-container group-hover:text-on-secondary-container"
        }`}>
          <ServiceIcon kind={service.icon} className="h-5 w-5" />
        </span>

        <span className={`inline-flex items-center gap-1 font-label-md text-sm font-semibold transition-all ${
          dark ? "text-secondary-container group-hover:text-secondary-fixed" : "text-secondary group-hover:text-primary"
        }`}>
          <span>Explore details</span>
          {small ? (
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          ) : (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          )}
        </span>
      </div>
    </Link>
  );
}
