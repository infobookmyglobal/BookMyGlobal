import Link from "next/link";
import { Mail, Phone, ShieldCheck, Lock, Award, Heart } from "lucide-react";
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

const heading = "font-eyebrow text-[11px] uppercase tracking-widest text-secondary-container font-bold";
const link = "font-body-sm text-xs text-on-primary-container transition-colors hover:text-on-primary hover:underline";

export function Footer() {
  const docs = SERVICES.filter((s) => s.kicker === "Documents");
  const trips = SERVICES.filter((s) => s.kicker !== "Documents");

  return (
    <footer className="relative w-full overflow-hidden bg-primary-container pb-12 pt-20 text-on-primary">
      {/* Background Watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display-hero text-[13vw] leading-none tracking-tight text-white/[0.02]"
      >
        BookMyGlobal
      </div>

      <div className="relative mx-auto max-w-7xl px-margin-mobile md:px-margin-tablet lg:px-margin">
        
        {/* Top Trust Banner */}
        <div className="mb-14 grid grid-cols-1 gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:grid-cols-3">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-title-md text-sm font-bold text-on-primary">MEA &amp; Consulate Liaisons</p>
              <p className="text-xs text-on-primary-container">Certified document attestation &amp; apostille workflows</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-secondary-container">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <p className="font-title-md text-sm font-bold text-on-primary">256-Bit Encrypted Vault</p>
              <p className="text-xs text-on-primary-container">Strict Indian data privacy compliance &amp; private storage</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed-variant">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <p className="font-title-md text-sm font-bold text-on-primary">Direct Retreat Operator</p>
              <p className="text-xs text-on-primary-container">Authentic Rishikesh Yoga Tourism Ashram programs</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-2 lg:grid-cols-5 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Logo tone="dark" />
            <p className="font-body-sm text-xs leading-relaxed text-on-primary-container">
              The complete concierge for Indian travellers: MEA attestation, international visa applications, flights, stays, tours, and direct Rishikesh yoga tourism.
            </p>
            <div className="space-y-2 pt-2">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 font-label-sm text-xs text-secondary-container hover:text-on-primary">
                <Mail className="h-3.5 w-3.5" /> {SUPPORT_EMAIL}
              </a>
              {SUPPORT_PHONE && (
                <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center gap-2 font-label-sm text-xs text-secondary-container hover:text-on-primary">
                  <Phone className="h-3.5 w-3.5" /> {SUPPORT_PHONE}
                </a>
              )}
            </div>
          </div>

          {/* Documents Col */}
          <div className="space-y-3">
            <h4 className={heading}>Documents &amp; Visas</h4>
            <ul className="space-y-2">
              {docs.map((s) => (
                <li key={s.slug}>
                  <Link href={s.href} className={link}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trips & Stays Col */}
          <div className="space-y-3">
            <h4 className={heading}>Trips, Stays &amp; Tours</h4>
            <ul className="space-y-2">
              {trips.map((s) => (
                <li key={s.slug}>
                  <Link href={s.href} className={link}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Col */}
          <div className="space-y-3">
            <h4 className={heading}>Platform</h4>
            <ul className="space-y-2">
              {PLATFORM.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Col */}
          <div className="space-y-3">
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

        {/* Bottom Bar with Disclaimers & Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-on-primary-container md:flex-row">
          <p>© {new Date().getFullYear()} BookMyGlobal. All rights reserved.</p>
          <p className="max-w-2xl text-center md:text-right text-[11px] text-on-primary-container/80 leading-relaxed">
            Disclaimer: BookMyGlobal is an independent private concierge and travel management platform. We are not an embassy, consulate, or official government authority. Consular and visa grant decisions are subject to sovereign government discretion.
          </p>
        </div>

      </div>
    </footer>
  );
}
