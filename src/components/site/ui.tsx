import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function Container({ children, className = "", narrow = false }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return (
    <div className={`mx-auto w-full ${narrow ? "max-w-4xl" : "max-w-7xl"} px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`text-xs font-bold uppercase tracking-[0.14em] text-blue-600 ${className}`}>
      {children}
    </span>
  );
}

/** Italic or colored emphasis inside headings */
export function Em({ children, className = "text-blue-600" }: { children: ReactNode; className?: string }) {
  return <span className={`font-extrabold ${className}`}>{children}</span>;
}

export function IndiaTag() {
  return (
    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
      India only
    </span>
  );
}

/** Passport-stamp or security trust badge */
export function Stamp({ lines, className = "" }: { lines: string[]; className?: string }) {
  return (
    <div className={`pointer-events-none flex select-none items-center justify-center rounded-2xl bg-white p-1.5 shadow-md border border-slate-100 ${className}`}>
      <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-2 text-center text-blue-700">
        {lines.map((l, i) => (
          <span key={i} className={`text-[10px] uppercase tracking-wider font-bold ${i === 0 ? "text-blue-900" : ""}`}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export function SectionHeader({
  eyebrow, title, intro, align = "left", action,
}: { eyebrow?: string; title: ReactNode; intro?: ReactNode; align?: "left" | "center"; action?: ReactNode }) {
  return (
    <div className={`mb-8 md:mb-10 flex flex-col gap-3 ${align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={`max-w-2xl space-y-1.5 ${align === "center" ? "mx-auto" : ""}`}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">{title}</h2>
        {intro && <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHero({
  eyebrow, title, intro, children, breadcrumb,
}: { eyebrow?: string; title: ReactNode; intro?: ReactNode; children?: ReactNode; breadcrumb?: { label: string; href?: string }[] }) {
  return (
    <section className="relative overflow-hidden bg-white border-b border-slate-100 pb-12 pt-16 lg:pb-16 lg:pt-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/60 to-transparent opacity-70" />
      <Container className="relative">
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            {breadcrumb.map((b) => (
              <span key={b.label} className="flex items-center gap-2">
                <span aria-hidden className="text-slate-300">/</span>
                {b.href ? <Link href={b.href} className="hover:text-blue-600">{b.label}</Link> : <span className="text-slate-900 font-bold">{b.label}</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-2 max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">{intro}</p>}
        {children && <div className="mt-6">{children}</div>}
      </Container>
    </section>
  );
}

export function PrimaryLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`press inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-cta hover:bg-blue-700 transition-all ${className}`}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function GhostLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`press inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all ${className}`}
    >
      {children}
    </Link>
  );
}

export function CtaBand({
  title = "Tell us where you are headed.",
  text = "Share your plans and we will help with the documents and bookings, one step at a time.",
  href = "/contact",
  actionLabel,
  cta,
}: {
  title?: ReactNode;
  text?: ReactNode;
  href?: string;
  actionLabel?: string;
  cta?: string;
}) {
  const label = cta || actionLabel || "Start a conversation";
  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 sm:p-12 text-center text-white shadow-xl shadow-blue-500/10">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">{title}</h2>
            <p className="text-sm sm:text-base text-blue-100">{text}</p>
            <div className="pt-4 flex justify-center">
              <Link
                href={href}
                className="press inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-blue-700 shadow-md hover:bg-slate-50 transition-colors"
              >
                <span>{label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
