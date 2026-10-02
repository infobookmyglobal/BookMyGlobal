import Link from "next/link";
import { Mail, Phone, ShieldCheck, Lock, Award, Heart, MessageCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/contact";
import { SERVICES } from "@/config/services";

const PLATFORM = [
  { href: "/about", label: "About Us" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/blog", label: "Travel Journal" },
  { href: "/community", label: "Traveller Community" },
  { href: "/partner-program", label: "Partner Programme" },
  { href: "/faqs", label: "FAQs & Knowledge" },
  { href: "/contact", label: "Contact Concierge" },
];

const LEGAL = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refunds", label: "Refund & Cancellation" },
  { href: "/disclaimer", label: "Government Disclaimer" },
];

const POPULAR_DESTINATIONS_TAGS = [
  { name: "Switzerland (Schengen)", href: "/services/visa-assistance?country=Switzerland" },
  { name: "United Arab Emirates", href: "/services/visa-assistance?country=UAE" },
  { name: "United Kingdom", href: "/services/visa-assistance?country=UK" },
  { name: "Japan", href: "/services/visa-assistance?country=Japan" },
  { name: "Rishikesh Sanctuary", href: "/yoga-retreats" },
  { name: "Singapore", href: "/services/visa-assistance?country=Singapore" },
  { name: "Thailand", href: "/services/tours-activities" },
  { name: "Indonesia (Bali)", href: "/services/tours-activities" },
  { name: "Vietnam", href: "/services/visa-assistance?country=Vietnam" },
  { name: "United States", href: "/services/visa-assistance?country=US" },
  { name: "Australia", href: "/services/visa-assistance?country=Australia" },
];

const heading = "text-xs font-bold uppercase tracking-wider text-slate-900";
const link = "text-xs font-medium text-slate-600 transition-colors hover:text-blue-600";

export function Footer() {
  const docs = SERVICES.filter((s) => s.kicker === "Documents");
  const trips = SERVICES.filter((s) => s.kicker !== "Documents");

  return (
    <footer className="relative w-full overflow-hidden bg-white border-t border-slate-200/90 text-slate-900">
      
      {/* ── ReadyTrip Explore More / Directory Tag Cloud ───────────────── */}
      <div className="border-b border-slate-100 py-6 sm:py-8 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-2.5 sm:mb-3">
            Explore top destinations &amp; services
          </h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {POPULAR_DESTINATIONS_TAGS.map((tag) => (
              <Link
                key={tag.name}
                href={tag.href}
                className="press rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8 sm:pb-10">
        
        {/* Main Footer Columns (2-Col on Mobile, 5-Col on Desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 pb-8 sm:pb-10 border-b border-slate-100">
          
          {/* Brand Info (Full width on mobile) */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-3 sm:space-y-4">
            <Logo tone="light" withTagline={true} />
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Direct global concierge for Indian &amp; international travellers: MEA document apostille, visas, luxury stays, flights, tours, and direct Rishikesh Ganga retreats.
            </p>
            <div className="space-y-1.5 pt-1">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" /> <span className="truncate">{SUPPORT_EMAIL}</span>
              </a>
              {SUPPORT_PHONE && (
                <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                  <Phone className="h-3.5 w-3.5 text-blue-600 shrink-0" /> {SUPPORT_PHONE}
                </a>
              )}
            </div>
          </div>

          {/* Visas & MEA Legal */}
          <div className="space-y-2.5 sm:space-y-3">
            <h4 className={heading}>Visas &amp; MEA</h4>
            <ul className="space-y-2">
              {docs.map((s) => (
                <li key={s.slug}>
                  <Link href={s.href} className={link}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stays & Retreats */}
          <div className="space-y-2.5 sm:space-y-3">
            <h4 className={heading}>Stays &amp; Tours</h4>
            <ul className="space-y-2">
              {trips.map((s) => (
                <li key={s.slug}>
                  <Link href={s.href} className={link}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-2.5 sm:space-y-3">
            <h4 className={heading}>Platform</h4>
            <ul className="space-y-2">
              {PLATFORM.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="space-y-2.5 sm:space-y-3">
            <h4 className={heading}>Trust &amp; Legal</h4>
            <ul className="space-y-2">
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Government Disclaimer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 pt-6 sm:pt-8 text-xs text-slate-500">
          <p className="text-center md:text-left">© {new Date().getFullYear()} BookMyGlobal Technologies. All rights reserved.</p>
          <p className="max-w-xl text-center md:text-right text-[11px] text-slate-400 leading-relaxed">
            Disclaimer: BookMyGlobal is an independent private concierge and travel management platform. We are not an embassy or government authority. Consular decisions are subject to sovereign government discretion.
          </p>
        </div>

      </div>
    </footer>
  );
}
