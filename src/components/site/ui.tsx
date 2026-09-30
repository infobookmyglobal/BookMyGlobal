import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function Container({ children, className = "", narrow = false }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return (
    <div className={`mx-auto w-full ${narrow ? "max-w-4xl" : "max-w-7xl"} px-margin-mobile md:px-margin-tablet lg:px-margin ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, tone = "gold", className = "" }: { children: ReactNode; tone?: "gold" | "light" | "teal"; className?: string }) {
  const c = tone === "light" ? "text-secondary-container" : tone === "teal" ? "text-on-tertiary-container" : "text-secondary";
  return <span className={`font-eyebrow text-eyebrow uppercase ${c} ${className}`}>{children}</span>;
}

/** Small italic emphasis used inside headings, in the design's serif. */
export function Em({ children, className = "text-secondary" }: { children: ReactNode; className?: string }) {
  return <span className={`font-display-hero font-normal italic ${className}`}>{children}</span>;
}

export function IndiaTag() {
  return (
    <span className="rounded-full bg-secondary-container/30 px-2.5 py-0.5 font-ticket-code text-[9px] font-bold uppercase tracking-wider text-on-secondary-container">
      India only
    </span>
  );
}

/** Rotated passport-stamp badge. */
export function Stamp({ lines, className = "", tone = "gold" }: { lines: string[]; className?: string; tone?: "gold" | "teal" }) {
  const color = tone === "teal" ? "border-on-tertiary-container text-on-tertiary-container" : "border-secondary text-secondary";
  return (
    <div className={`pointer-events-none flex select-none items-center justify-center rounded-full bg-surface-container-lowest p-1.5 shadow-lg ${className}`}>
      <div className={`flex h-full w-full flex-col items-center justify-center rounded-full border-2 border-dashed bg-surface-container-low p-2 text-center ${color}`}>
        {lines.map((l, i) => (
          <span key={i} className={`font-ticket-code uppercase tracking-widest ${i === 0 ? "text-[9px] font-bold text-primary" : "text-[9px] font-bold"}`}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export function SectionHeader({
  eyebrow, title, intro, align = "left", action,
}: { eyebrow?: string; title: ReactNode; intro?: ReactNode; align?: "left" | "center"; action?: ReactNode }) {
  return (
    <div className={`mb-space-xl flex flex-col gap-space-md ${align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={`max-w-2xl space-y-space-xs ${align === "center" ? "mx-auto" : ""}`}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-primary md:font-headline-lg md:text-headline-lg">{title}</h2>
        {intro && <p className="font-body-lg text-body-lg text-on-surface-variant">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

/** Top of every inner page: sits under the floating header. */
export function PageHero({
  eyebrow, title, intro, children, breadcrumb,
}: { eyebrow?: string; title: ReactNode; intro?: ReactNode; children?: ReactNode; breadcrumb?: { label: string; href?: string }[] }) {
  return (
    <section className="relative overflow-hidden bg-surface pb-space-xl pt-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
        <svg className="h-full w-full text-outline-variant" fill="none" viewBox="0 0 1440 520" preserveAspectRatio="none">
          <path d="M-80 200C220 160 480 300 760 250C1040 200 1280 290 1520 170" stroke="currentColor" strokeDasharray="6 8" strokeWidth="1.2" />
          <circle cx="760" cy="250" r="4" fill="currentColor" />
          <circle cx="280" cy="190" r="2.5" fill="currentColor" />
        </svg>
      </div>
      <Container className="relative">
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className="mb-space-md flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <Link href="/" className="hover:text-primary">Home</Link>
            {breadcrumb.map((b) => (
              <span key={b.label} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                {b.href ? <Link href={b.href} className="hover:text-primary">{b.label}</Link> : <span className="text-primary">{b.label}</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-space-sm max-w-3xl font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-primary md:font-headline-lg md:text-headline-lg lg:text-[3.5rem] lg:leading-[3.75rem]">{title}</h1>
        {intro && <p className="mt-space-md max-w-2xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">{intro}</p>}
        {children && <div className="mt-space-lg">{children}</div>}
      </Container>
    </section>
  );
}

export function PrimaryLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full bg-secondary-container px-7 py-3.5 font-label-md text-label-md text-on-secondary-container shadow-sm transition-all hover:bg-secondary-fixed ${className}`}
    >
      <span>{children}</span>
      <ArrowRight className="h-[18px] w-[18px]" />
    </Link>
  );
}

export function GhostLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full bg-surface-container px-6 py-3.5 font-label-md text-label-md text-primary transition-all hover:bg-surface-container-high ${className}`}
    >
      {children}
    </Link>
  );
}

export function CtaBand({
  title = "Tell us where you are headed.",
  text = "Share your plans and we will help with the documents and bookings, one step at a time.",
  href = "/contact",
  cta = "Get in touch",
}: { title?: string; text?: string; href?: string; cta?: string }) {
  return (
    <section className="bg-surface px-margin-mobile pb-space-2xl md:px-margin-tablet lg:px-margin">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary-container px-6 py-14 text-center sm:py-16">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-secondary-container/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-on-tertiary-container/10 blur-3xl" />
        <h2 className="relative mx-auto max-w-2xl font-headline-lg-mobile text-headline-lg-mobile text-on-primary md:font-headline-lg md:text-headline-lg">{title}</h2>
        <p className="relative mx-auto mt-space-md max-w-xl font-body-lg text-body-lg text-on-primary-container">{text}</p>
        <div className="relative mt-space-xl"><PrimaryLink href={href}>{cta}</PrimaryLink></div>
      </div>
    </section>
  );
}
