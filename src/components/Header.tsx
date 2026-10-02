"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ChevronDown, 
  Menu, 
  X, 
  Search, 
  Briefcase, 
  BadgePercent, 
  Sparkles, 
  FileCheck, 
  Globe2, 
  Compass, 
  Plane, 
  ShieldCheck,
  User,
  ArrowRight,
  Phone,
  MessageCircle
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ServiceIcon } from "@/components/ServiceIcon";
import { SERVICES } from "@/config/services";
import { DesktopAuth, MobileAuth } from "@/components/header/AuthenticatedActions";

export const NAV_LINKS = [
  { href: "/services/visa-assistance", label: "Visas" },
  { href: "/services/attestation", label: "Attestation" },
  { href: "/yoga-retreats", label: "Yoga Retreats", badge: "Rishikesh" },
  { href: "/services/flights", label: "Flights & Stays" },
  { href: "/services/tours", label: "Tours & Combos", hasPercent: true },
  { href: "/community", label: "Community" },
  { href: "/blog", label: "Journal" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currency, setCurrency] = useState("₹ INR");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuOpen(true);
  };
  const closeMenuSoon = () => {
    closeTimer.current = setTimeout(() => setMenuOpen(false), 120);
  };
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      setMobileOpen(false);
      router.push(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const docServices = SERVICES.filter((s) => s.kicker === "Documents");
  const tripServices = SERVICES.filter((s) => s.kicker !== "Documents" && s.slug !== "yoga-retreats");
  const retreatService = SERVICES.find((s) => s.slug === "yoga-retreats");

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 h-14 sm:h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              <Logo tone="light" />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1">
              <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenuSoon}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className={`press flex items-center gap-1.5 px-3.5 py-2 text-[13.5px] font-semibold rounded-full transition-colors ${
                    menuOpen || isActive("/services")
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-blue-50/70 hover:text-blue-600"
                  }`}
                >
                  <span>Services</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 text-slate-400 ${menuOpen ? "rotate-180 text-blue-600" : ""}`} />
                </button>
              </div>

              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`press flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 text-[13.5px] font-semibold rounded-full transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-slate-600 hover:bg-blue-50/70 hover:text-blue-600"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-blue-700">
                        {link.badge}
                      </span>
                    )}
                    {link.hasPercent && (
                      <BadgePercent className="h-4 w-4 text-blue-600 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & Auth Buttons (Desktop) */}
            <div className="hidden xl:flex items-center gap-3 ms-auto">
              
              {/* Quick Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search experiences, visas and destinations"
                className="press p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>

              <div className="w-px h-5 bg-slate-200" />

              {/* Currency Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCurrencyOpen((v) => !v)}
                  className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <span>{currency}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
                {currencyOpen && (
                  <div className="absolute right-0 top-full mt-2 w-32 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50">
                    {["₹ INR", "$ USD", "€ EUR", "£ GBP", "AED"].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCurrency(c);
                          setCurrencyOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold ${
                          currency === c ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-px h-5 bg-slate-200" />

              {/* For Travel Agents */}
              <Link
                href="/partner-program"
                className="press inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                title="For travel agents & partners"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span className="hidden 2xl:inline">For Agents</span>
              </Link>

              {/* Auth Login / Sign Up */}
              <DesktopAuth />
            </div>

            {/* Mobile Header Right Actions (ReadyTrip Style) */}
            <div className="flex xl:hidden items-center gap-1.5 sm:gap-2">
              
              {/* Currency Selector Pill (Mobile) */}
              <button
                type="button"
                onClick={() => setCurrency(currency === "₹ INR" ? "$ USD" : "₹ INR")}
                className="press inline-flex items-center gap-1 h-9 px-2.5 rounded-full border border-slate-200 bg-white text-[11px] font-extrabold text-slate-700 shadow-sm"
              >
                <span>{currency}</span>
              </button>

              {/* Search Button (Mobile) */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="press grid place-items-center size-9 rounded-full bg-slate-100 text-slate-700 active:scale-95"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* User Account / Sign In Icon (Mobile) */}
              <Link
                href="/sign-in"
                className="press grid place-items-center size-9 rounded-full bg-slate-100 text-slate-700 active:scale-95"
                aria-label="User Account"
              >
                <User className="h-4 w-4" />
              </Link>

              {/* Hamburger Menu Trigger */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="press grid place-items-center size-9 rounded-full bg-slate-100 text-slate-700 active:scale-95"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

          </div>
        </div>

        {/* ── Desktop Mega Menu Overlay ────────────────────────────────────── */}
        {menuOpen && (
          <div
            className="hidden xl:block absolute left-0 right-0 top-full border-b border-slate-100 bg-white shadow-2xl transition-all"
            onMouseEnter={openMenu}
            onMouseLeave={closeMenuSoon}
          >
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="grid grid-cols-12 gap-8">
                
                {/* Legal & Documents Column */}
                <div className="col-span-4 space-y-4 border-r border-slate-100 pr-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      01 · Visas &amp; MEA Attestation
                    </span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                      Govt Verified
                    </span>
                  </div>
                  <div className="space-y-1">
                    {docServices.map((s) => (
                      <Link
                        key={s.slug}
                        href={s.href}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-start gap-3 rounded-2xl p-2.5 transition-all hover:bg-blue-50/60"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                          <ServiceIcon kind={s.icon} className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[13.5px] font-bold text-slate-900 group-hover:text-blue-600">
                            {s.title}
                          </p>
                          <p className="line-clamp-1 text-xs text-slate-500">
                            {s.summary}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Stays & Tours Column */}
                <div className="col-span-4 space-y-4 border-r border-slate-100 pr-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      02 · Stays, Flights &amp; Tours
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Global Network
                    </span>
                  </div>
                  <div className="space-y-1">
                    {tripServices.map((s) => (
                      <Link
                        key={s.slug}
                        href={s.href}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-start gap-3 rounded-2xl p-2.5 transition-all hover:bg-blue-50/60"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                          <ServiceIcon kind={s.icon} className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[13.5px] font-bold text-slate-900 group-hover:text-blue-600">
                            {s.title}
                          </p>
                          <p className="line-clamp-1 text-xs text-slate-500">
                            {s.summary}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Direct Flagship Operator: Yoga Retreats */}
                <div className="col-span-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      03 · Direct Flagship
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      Direct Operator
                    </span>
                  </div>
                  {retreatService && (
                    <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50/60 p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Rishikesh Ganga Sanctuary</span>
                      </div>
                      <h4 className="mt-2 text-base font-bold text-slate-900">
                        Authentic Himalayan Yoga Retreats
                      </h4>
                      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                        100% directly operated by BookMyGlobal. Daily yoga, pranayama, ayurvedic dining, and sacred Ganga ceremonies.
                      </p>
                      <Link
                        href="/yoga-retreats"
                        onClick={() => setMenuOpen(false)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                      >
                        <span>Explore Rishikesh Retreats</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Search Modal / Sheet (Mobile & Desktop) ─────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 pt-4 sm:pt-0">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-900">Search Activities &amp; Visas</span>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="grid place-items-center size-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="mt-4">
              <div className="relative flex items-center rounded-2xl bg-slate-50 border border-slate-200 px-3.5 h-13 sm:h-14">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search countries, visas, tours..."
                  className="w-full bg-transparent ps-2.5 pe-2 text-base sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="mt-5 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Popular searches</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { label: "Schengen Visa", href: "/services/visa-assistance?country=Switzerland" },
                  { label: "Dubai E-Visa", href: "/services/visa-assistance?country=UAE" },
                  { label: "MEA Apostille", href: "/services/attestation" },
                  { label: "Rishikesh Yoga Retreat", href: "/yoga-retreats" },
                  { label: "Thailand Tours", href: "/services/tours" },
                  { label: "Bali Packages", href: "/services/tours" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSearchOpen(false)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ReadyTrip-Style Mobile Navigation Drawer ────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white xl:hidden animate-in slide-in-from-right duration-200">
          
          {/* Mobile Drawer Top Bar */}
          <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
            <Logo tone="light" />
            <button
              onClick={() => setMobileOpen(false)}
              className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-700 active:scale-95"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-12">
            
            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search visas, experiences, cities..."
                className="w-full h-12 rounded-2xl bg-slate-100 border-none px-4 ps-11 text-base font-medium text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-600"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            </form>

            {/* Main Nav Links */}
            <nav className="space-y-1">
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Explore Services
              </p>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold transition-colors ${
                    isActive(l.href) ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span>{l.label}</span>
                  {l.badge && (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-blue-700">
                      {l.badge}
                    </span>
                  )}
                  {l.hasPercent && (
                    <BadgePercent className="h-4 w-4 text-blue-600" />
                  )}
                </Link>
              ))}
              
              <Link
                href="/partner-program"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <span>For Travel Agents &amp; Partners</span>
                <Briefcase className="h-4 w-4 text-slate-400" />
              </Link>
            </nav>

            {/* 24/7 WhatsApp Quick Help Banner (Mobile Drawer) */}
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-4">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center size-10 rounded-xl bg-blue-600 text-white shrink-0">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Need immediate help?</h4>
                  <p className="text-[11px] text-slate-600">Chat with a concierge specialist 24/7.</p>
                </div>
              </div>
              <a
                href="https://wa.me/917678356255"
                target="_blank"
                rel="noopener noreferrer"
                className="press mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Auth section */}
            <div className="border-t border-slate-100 pt-3">
              <MobileAuth onCloseMobile={() => setMobileOpen(false)} />
            </div>

          </div>
        </div>
      )}
    </>
  );
}
