"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ServiceIcon } from "@/components/ServiceIcon";
import { SERVICES } from "@/config/services";
import { DesktopAuth, MobileAuth } from "@/components/header/AuthenticatedActions";

export const NAV_LINKS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/yoga-retreats", label: "Yoga Tourism" },
  { href: "/community", label: "Community" },
  { href: "/blog", label: "Journal" },
  { href: "/faqs", label: "FAQs" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuOpen(true);
  };
  const closeMenuSoon = () => {
    closeTimer.current = setTimeout(() => setMenuOpen(false), 120);
  };
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const linkCls = (active: boolean) =>
    `relative font-label-md text-label-md transition-all px-3 py-1.5 rounded-full ${
      active
        ? "text-secondary-container bg-white/10 shadow-inner font-semibold"
        : "text-on-primary-container hover:text-on-primary hover:bg-white/5"
    }`;

  const docServices = SERVICES.filter((s) => s.kicker === "Documents");
  const tripServices = SERVICES.filter((s) => s.kicker !== "Documents" && s.slug !== "yoga-retreats");
  const retreatService = SERVICES.find((s) => s.slug === "yoga-retreats");

  return (
    <>
      <div className="sticky top-4 z-50 h-0 px-margin-mobile md:px-margin-tablet lg:px-margin">
        <div className="pointer-events-none mx-auto flex max-w-7xl justify-center">
          <header
            className="pointer-events-auto relative flex h-16 w-full items-center justify-between rounded-full border border-white/15 bg-primary-container/90 px-4 md:px-space-lg shadow-[0_12px_40px_-8px_rgba(20,27,47,0.5)] backdrop-blur-xl transition-all"
            onMouseLeave={closeMenuSoon}
          >
            <div className="flex items-center gap-6">
              <Logo tone="dark" />
              <div className="hidden h-4 w-[1px] bg-white/15 xl:block" />
              <span className="hidden font-ticket-code text-[11px] uppercase tracking-widest text-secondary-container/80 xl:inline-block">
                Direct Global Concierge
              </span>
            </div>

            <nav className="hidden items-center gap-1.5 lg:flex">
              <div className="relative" onMouseEnter={openMenu}>
                <button
                  className={`${linkCls(isActive("/services") || menuOpen)} flex items-center gap-1.5`}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <span>Services</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${menuOpen ? "rotate-180 text-secondary-container" : ""}`} />
                </button>
              </div>
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={linkCls(isActive(l.href))}>
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <DesktopAuth />
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-secondary-container px-4 py-2 font-label-md text-label-md text-on-secondary-container shadow-md transition-all hover:bg-secondary-fixed hover:shadow-lg hover:shadow-secondary-container/20"
              >
                <span className="font-semibold">Get in touch</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-on-primary transition-colors hover:bg-white/20 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* Categorized Mega menu */}
            {menuOpen && (
              <div
                className="absolute left-0 right-0 top-full hidden pt-3 lg:block"
                onMouseEnter={openMenu}
                onMouseLeave={closeMenuSoon}
              >
                <div className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-2xl ring-1 ring-black/5">
                  <div className="grid grid-cols-12 gap-6">
                    {/* Documents Column */}
                    <div className="col-span-4 space-y-3 border-r border-surface-container-high pr-4">
                      <div className="flex items-center justify-between">
                        <span className="font-eyebrow text-eyebrow uppercase tracking-wider text-secondary">
                          01 · Legal &amp; Visas
                        </span>
                        <span className="rounded-full bg-secondary-container/30 px-2 py-0.5 font-ticket-code text-[9px] uppercase tracking-wider text-on-secondary-container">
                          India Verified
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {docServices.map((s) => (
                          <Link
                            key={s.slug}
                            href={s.href}
                            onClick={() => setMenuOpen(false)}
                            className="group flex items-start gap-3 rounded-xl p-2.5 transition-all hover:bg-surface-container-low"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-secondary transition-colors group-hover:bg-secondary-container group-hover:text-on-secondary-container">
                              <ServiceIcon kind={s.icon} className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="font-title-md text-[0.92rem] font-semibold text-primary group-hover:text-secondary">
                                {s.title}
                              </p>
                              <p className="line-clamp-1 font-body-sm text-[0.8rem] text-on-surface-variant">
                                {s.summary}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Travel & Bookings Column */}
                    <div className="col-span-5 space-y-3 border-r border-surface-container-high pr-4">
                      <div className="flex items-center justify-between">
                        <span className="font-eyebrow text-eyebrow uppercase tracking-wider text-secondary">
                          02 · Trips &amp; Stays
                        </span>
                        <span className="font-ticket-code text-[10px] uppercase text-outline">
                          Global Network
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {tripServices.map((s) => (
                          <Link
                            key={s.slug}
                            href={s.href}
                            onClick={() => setMenuOpen(false)}
                            className="group flex items-center gap-2.5 rounded-xl p-2 transition-all hover:bg-surface-container-low"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-secondary transition-colors group-hover:bg-secondary-container group-hover:text-on-secondary-container">
                              <ServiceIcon kind={s.icon} className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-title-md text-[0.88rem] font-medium text-primary group-hover:text-secondary">
                                {s.title}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Spotlight Retreats Column */}
                    <div className="col-span-3 flex flex-col justify-between rounded-2xl bg-primary-container p-4 text-on-primary">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 font-ticket-code text-[9px] uppercase tracking-wider text-secondary-container">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary-container" />
                          Our Own Flagship
                        </div>
                        <h4 className="font-headline-sm text-[1.1rem] leading-snug text-on-primary">
                          Rishikesh Yoga Retreats
                        </h4>
                        <p className="font-body-sm text-[0.8rem] leading-relaxed text-on-primary-container">
                          Directly operated along the holy Ganges with authentic master yogis.
                        </p>
                      </div>
                      {retreatService && (
                        <Link
                          href={retreatService.href}
                          onClick={() => setMenuOpen(false)}
                          className="mt-3 inline-flex items-center justify-between rounded-xl bg-secondary-container px-3 py-2 font-label-sm font-semibold text-on-secondary-container transition-colors hover:bg-secondary-fixed"
                        >
                          <span>Explore Retreats</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-surface-container-high pt-3 font-label-sm">
                    <span className="text-on-surface-variant">
                      Need custom corporate or group arrangements?
                    </span>
                    <Link
                      href="/services"
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex items-center gap-1.5 font-semibold text-secondary hover:underline"
                    >
                      View All 9 Services Hub <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </header>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-between overflow-y-auto bg-primary-container/98 p-6 backdrop-blur-2xl lg:hidden">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <Logo tone="dark" />
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-on-primary"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 space-y-6">
              <div>
                <p className="mb-2 font-eyebrow text-eyebrow uppercase tracking-wider text-secondary-container">
                  Services
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {SERVICES.map((s) => (
                    <Link
                      key={s.slug}
                      href={s.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 font-title-md text-on-primary transition-colors hover:bg-white/10"
                    >
                      <ServiceIcon kind={s.icon} className="h-4 w-4 text-secondary-container" />
                      <span className="text-sm">{s.title}</span>
                      {s.indiaOnly && (
                        <span className="ml-auto rounded-full bg-secondary-container/30 px-2 py-0.5 font-ticket-code text-[8px] uppercase tracking-wider text-secondary-container">
                          India
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 font-eyebrow text-eyebrow uppercase tracking-wider text-secondary-container">
                  Explore
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {NAV_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl bg-white/5 p-3 font-title-md text-sm text-on-primary transition-colors hover:bg-white/10"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          <div className="mt-8 space-y-3 border-t border-white/10 pt-4">
            <MobileAuth onCloseMobile={() => setMobileOpen(false)} />
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="block w-full rounded-full bg-secondary-container py-3.5 text-center font-label-md font-bold text-on-secondary-container shadow-md"
            >
              Get in touch
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
