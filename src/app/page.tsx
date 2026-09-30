import type { Metadata } from "next";
import Link from "next/link";
import { 
  ArrowRight, 
  MapPin, 
  Leaf, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Globe2, 
  Award, 
  HeartHandshake, 
  Zap,
  ArrowUpRight,
  PlaneTakeoff,
  Users
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container, Eyebrow, Em, PrimaryLink, GhostLink, Stamp, SectionHeader } from "@/components/site/ui";
import { Photo } from "@/components/site/Photo";
import { ServiceCard } from "@/components/home/ServiceCard";
import { PlanBar } from "@/components/home/PlanBar";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { EnquiryForm } from "@/components/home/EnquiryForm";
import { HomeFaq } from "@/components/home/HomeFaq";
import { getPageCms } from "@/lib/cms";
import { renderEmphasis } from "@/lib/cms-text";
import { prisma } from "@/lib/prisma";
import { getSeoMetadata } from "@/lib/seo";
import { getService } from "@/config/services";
import { IMAGES } from "@/config/images";
import { FaqJsonLd } from "@/components/JsonLd";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("home");
}

const DESTINATIONS = [
  "Switzerland (Schengen)", 
  "United Kingdom", 
  "United Arab Emirates", 
  "Japan", 
  "Rishikesh Sanctuary", 
  "Singapore", 
  "Thailand", 
  "United States", 
  "Maldives", 
  "Vietnam"
];

const ACCREDITATIONS = [
  { name: "MEA Apostille Verified", label: "Ministry of External Affairs India" },
  { name: "Consulate Registered", label: "Direct Embassy Liaisons" },
  { name: "IATA Partner Network", label: "Global Flight Systems" },
  { name: "Yoga Alliance Rishikesh", label: "Certified Ashram Operations" },
  { name: "Viator Partner Hub", label: "Curated World Experiences" },
  { name: "256-Bit Encrypted Portal", label: "Document Vault Security" },
];

const POPULAR_DESTINATION_CARDS = [
  {
    country: "Switzerland & Schengen",
    flag: "🇨🇭",
    time: "10-15 Days",
    tag: "High Demand",
    desc: "Single visa for 29 European countries with complete itinerary and cover letter curation.",
    href: "/services/visa-assistance?country=Switzerland",
  },
  {
    country: "United Arab Emirates",
    flag: "🇦🇪",
    time: "48-72 Hours",
    tag: "Express E-Visa",
    desc: "Fast 30 or 60 days tourist, family & business e-visas with instant approval tracking.",
    href: "/services/visa-assistance?country=UAE",
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    time: "15-20 Days",
    tag: "Standard & Priority",
    desc: "Standard visitor, business and student visa guidance with biometric appointment setup.",
    href: "/services/visa-assistance?country=UK",
  },
  {
    country: "Japan",
    flag: "🇯🇵",
    time: "7-10 Days",
    tag: "Single & Multiple",
    desc: "Tourism and conference applications with strict document compliance and itinerary review.",
    href: "/services/visa-assistance?country=Japan",
  },
];

const REVIEWS = [
  {
    name: "Dr. Rohan Mukherjee",
    location: "Bengaluru → Zurich",
    service: "Schengen Visa & MEA Apostille",
    rating: 5,
    quote: "Got both my medical degree apostille and Switzerland visa done in one go. Transparent quotes and no endless chasing. Outstanding service.",
  },
  {
    name: "Ananya Sharma",
    location: "Mumbai → Rishikesh",
    service: "7-Day Yoga Awakening",
    rating: 5,
    quote: "The retreat along the Ganges was transformative. Because BookMyGlobal manages it directly, every detail from pickup to master classes was flawless.",
  },
  {
    name: "Vikramaditya Rao",
    location: "Delhi → Dubai",
    service: "UAE Embassy Attestation & Flights",
    rating: 5,
    quote: "Commercial documents attested and delivered back via insured courier within 6 days. Highly professional team.",
  },
];

function readTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 225))} min read`;
}

const HOME_FAQS = [
  { 
    q: "Who runs the yoga retreats?", 
    a: "BookMyGlobal runs the Rishikesh retreats directly. They are not resold from another provider. That means one unified team coordinates your journey from intake to your final morning practice along the Ganges." 
  },
  { 
    q: "Is attestation only for Indian citizens?", 
    a: "Our MEA apostille and embassy legalisation services are specifically designed for documents issued in India (educational degrees, marriage/birth certificates, commercial resolutions). Tell us your destination and we will confirm the exact authentication protocol." 
  },
  { 
    q: "How do your visa assistance services work?", 
    a: "We review your eligibility, generate a tailored document checklist, verify all application forms for errors, guide you through consulate appointment scheduling, and provide continuous status updates until your decision is returned." 
  },
  { 
    q: "Can I manage multiple services under one account?", 
    a: "Yes! Your BookMyGlobal account keeps all your visas, attested documents, flight tickets, hotel vouchers, and retreat schedules organized securely in one encrypted dashboard." 
  },
];

export default async function HomePage() {
  const cms = await getPageCms("home");
  const t = cms.t;

  const posts = await prisma.blog
    .findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 3 })
    .catch(() => []);

  const STAT_DEFAULTS = [
    { num: "9", label: "Integrated Travel & Paperwork Verticals" },
    { num: "99.4%", label: "First-Time Visa Submission Accuracy" },
    { num: "5,000+", label: "Indian Travellers & Global Seekers" },
    { num: "100%", label: "Directly Operated Rishikesh Retreats" },
  ];
  const stats = STAT_DEFAULTS.map((d, i) => ({ 
    num: t(`stat_${i + 1}_num`, d.num), 
    label: t(`stat_${i + 1}_label`, d.label) 
  })).filter((s) => s.num);

  const S = (slug: string) => getService(slug)!;

  return (
    <>
      <Header />
      <FaqJsonLd faqs={HOME_FAQS.map(f => ({ question: f.q, answer: f.a }))} />
      <main className="bg-surface overflow-hidden">
        
        {/* ── 1. Hero Section ──────────────────────────────────── */}
        {cms.show("hero") && (
          <section className="relative w-full overflow-hidden bg-surface pb-16 pt-32 lg:pt-36">
            {/* Background Ambient Glows & Vector Flight Lines */}
            <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] opacity-40">
              <div className="absolute top-12 left-1/4 h-80 w-80 rounded-full bg-secondary-container/20 blur-[100px]" />
              <div className="absolute top-24 right-1/4 h-96 w-96 rounded-full bg-tertiary-fixed-dim/20 blur-[120px]" />
              <svg className="h-full w-full text-outline-variant/60" fill="none" viewBox="0 0 1440 860" preserveAspectRatio="xMidYMid slice">
                <path d="M-80 320C220 280 480 440 760 380C1040 320 1280 420 1520 280" stroke="currentColor" strokeDasharray="6 8" strokeWidth="1.2" />
                <path d="M120 780C380 640 740 700 980 540C1220 380 1380 460 1540 360" stroke="currentColor" strokeDasharray="4 6" strokeWidth="1" />
                <circle cx="760" cy="380" r="4" fill="#ffb54d" />
                <circle cx="980" cy="540" r="3.5" fill="#19938a" />
                <circle cx="280" cy="300" r="3" fill="#141b2f" />
              </svg>
            </div>

            <Container className="relative z-10">
              <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                
                {/* Left Hero Column */}
                <div className="space-y-6 lg:col-span-7">
                  {/* Trust Pill */}
                  <div className="inline-flex items-center gap-2.5 rounded-full border border-secondary/30 bg-surface-container-high/80 px-4 py-1.5 shadow-sm backdrop-blur-md">
                    <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse" />
                    <span className="font-eyebrow text-eyebrow uppercase tracking-widest text-primary font-bold">
                      {t("hero_eyebrow", "The Complete Travel & Paperwork Concierge")}
                    </span>
                    <span className="rounded-full bg-secondary-container/40 px-2 py-0.5 font-ticket-code text-[9px] uppercase text-on-secondary-container">
                      India
                    </span>
                  </div>

                  {/* Main Title */}
                  <h1 className="font-display-hero text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-primary leading-[1.12]">
                    {renderEmphasis(t("hero_title", "The world, navigated with *effortless* distinction."))}
                  </h1>

                  {/* Subtitle */}
                  <p className="max-w-2xl font-body-lg text-base sm:text-lg leading-relaxed text-on-surface-variant">
                    {t(
                      "hero_subtitle",
                      "One unified account for your visa paperwork, MEA document attestation, flights, hotels, cruises, and authentic yoga retreats we operate ourselves in Rishikesh. With dedicated specialists at every single milestone."
                    )}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <PrimaryLink href="#finder" className="shadow-lg shadow-secondary-container/20">
                      {t("hero_btn_primary", "Explore All 9 Services")}
                    </PrimaryLink>
                    <GhostLink href="/yoga-retreats" className="border border-surface-container-high bg-surface-container-lowest shadow-sm hover:border-secondary">
                      <Leaf className="h-4 w-4 text-secondary" />
                      <span>{t("hero_btn_secondary", "Rishikesh Retreats")}</span>
                    </GhostLink>
                  </div>

                  {/* Quick Highlight Metrics */}
                  {cms.show("stats") && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-surface-container-high pt-6">
                      {stats.map((s) => (
                        <div key={s.label} className="space-y-1">
                          <p className="font-headline-sm text-2xl font-bold text-primary">{s.num}</p>
                          <p className="font-label-sm text-xs text-on-surface-variant leading-snug">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Hero Visual (Arched Card with Floating Badges) */}
                <div className="relative flex justify-center lg:col-span-5 lg:justify-end">
                  <div className="relative w-full max-w-md">
                    
                    {/* Main Arched Photo Container */}
                    <div className="relative overflow-hidden rounded-t-[140px] rounded-b-3xl border-2 border-surface-container-high bg-surface-container-lowest p-3 shadow-2xl">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-t-[130px] rounded-b-2xl bg-surface-container">
                        <Photo 
                          src={IMAGES.hero} 
                          alt="Traveller looking over misty hills in Munnar Kerala" 
                          className="h-full w-full scale-[1.02] object-cover object-center transition-transform duration-700 hover:scale-105" 
                        />
                        <div className="absolute inset-x-0 bottom-0 flex h-36 flex-col justify-end bg-gradient-to-t from-primary-container/90 via-primary-container/40 to-transparent p-5">
                          <span className="flex items-center gap-1.5 font-eyebrow text-eyebrow uppercase tracking-widest text-secondary-container">
                            <MapPin className="h-3.5 w-3.5 text-secondary-container" /> Munnar &amp; Rishikesh
                          </span>
                          <span className="font-headline-sm text-sm text-on-primary font-medium mt-0.5">
                            Handcrafted Indian &amp; Global Expeditions
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Floating Trust Badge: Top Right */}
                    <div className="absolute -right-3 -top-3 flex items-center gap-2.5 rounded-2xl border border-white/20 bg-primary-container/95 px-4 py-2.5 text-on-primary shadow-xl backdrop-blur-md">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-ticket-code text-[11px] uppercase tracking-wider text-secondary-container font-bold">
                          Govt. MEA Verified
                        </p>
                        <p className="text-[10px] text-on-primary-container">Legal Apostille Concierge</p>
                      </div>
                    </div>

                    {/* Floating Trust Badge: Bottom Left */}
                    <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-2xl border border-surface-container-high bg-surface-container-lowest px-4 py-3 shadow-xl">
                      <div className="flex -space-x-2">
                        <span className="inline-block h-7 w-7 rounded-full bg-secondary-container/40 border-2 border-white text-center text-[10px] font-bold leading-6">🇮🇳</span>
                        <span className="inline-block h-7 w-7 rounded-full bg-secondary-fixed border-2 border-white text-center text-[10px] font-bold leading-6">🇨🇭</span>
                        <span className="inline-block h-7 w-7 rounded-full bg-tertiary-fixed border-2 border-white text-center text-[10px] font-bold leading-6">🇦🇪</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <p className="font-ticket-code text-[10px] uppercase tracking-wider text-primary font-bold mt-0.5">
                          5,000+ Travellers Assisted
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </Container>
          </section>
        )}

        {/* ── 2. Interactive Discovery & Quick Finder Hub ──────── */}
        <section id="finder" className="relative z-20 scroll-mt-24 px-margin-mobile md:px-margin-tablet lg:px-margin">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl border border-surface-container-high bg-surface-container-lowest p-6 shadow-2xl lg:p-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-surface-container-high pb-4">
                <div>
                  <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-primary">
                    Find Requirements &amp; Request Immediate Guidance
                  </h2>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    Select your service category below to calculate turnaround times and initiate your application.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 font-ticket-code text-[10px] uppercase text-primary">
                  <Zap className="h-3 w-3 text-secondary" /> Instant Dispatch
                </span>
              </div>
              <PlanBar />
            </div>
          </div>
        </section>

        {/* ── 3. Accreditations & Global Network Marquee ───────── */}
        <div className="mt-16 w-full border-y border-surface-container-high bg-surface-container-low py-4" aria-hidden>
          <div className="marquee-track animate-marquee items-center gap-10 whitespace-nowrap">
            {[0, 1].map((k) => (
              <div key={k} className="flex items-center gap-10 pr-10">
                {ACCREDITATIONS.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-container text-secondary text-xs">
                      ✦
                    </span>
                    <div>
                      <span className="font-ticket-code text-xs font-bold uppercase tracking-wider text-primary">
                        {item.name}
                      </span>
                      <span className="ml-2 font-label-sm text-[11px] text-on-surface-variant">
                        ({item.label})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Popular Destination & Visa Gateways ──────────── */}
        <section className="py-20 bg-surface">
          <Container>
            <SectionHeader
              eyebrow="Global Destinations"
              title={<>Top Routes from <Em>India</Em> This Season.</>}
              intro="Fast-track document checklists, consulate requirements, and biometric assistance tailored for Indian passport holders."
              action={
                <Link href="/services/visa-assistance" className="inline-flex items-center gap-2 font-label-md text-secondary hover:underline font-semibold">
                  All 50+ Countries <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {POPULAR_DESTINATION_CARDS.map((item) => (
                <Link
                  key={item.country}
                  href={item.href}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-surface-container-high bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary hover:shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{item.flag}</span>
                      <span className="rounded-full bg-secondary-container/30 px-2.5 py-1 font-ticket-code text-[9px] font-bold uppercase tracking-wider text-on-secondary-container">
                        {item.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-headline-sm text-lg font-bold text-primary group-hover:text-secondary transition-colors">
                        {item.country}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-outline mt-1 font-ticket-code uppercase">
                        <Clock className="h-3 w-3 text-secondary" />
                        <span>Est: {item.time}</span>
                      </div>
                    </div>

                    <p className="font-body-sm text-xs leading-relaxed text-on-surface-variant">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-surface-container-high pt-4 font-label-sm text-xs font-bold text-secondary">
                    <span>View Requirements</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>

        {/* ── 5. The 9-Service Bento Ecosystem ─────────────────── */}
        <section id="services" className="scroll-mt-24 bg-surface-container-low py-20">
          <Container>
            <SectionHeader
              eyebrow="Our Complete Ecosystem"
              title={<>Nine Services. One Account. <Em>Zero</Em> Friction.</>}
              intro="Whether it is an urgent MEA degree apostille, Schengen visa paperwork, international flights, or serene Himalayan retreats, everything stays organized in one place."
              action={
                <Link href="/services" className="inline-flex items-center gap-2 font-label-md text-secondary hover:underline font-semibold">
                  Browse All Services Hub <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
              <ServiceCard service={S("visa-assistance")} variant="large" className="lg:col-span-7" />
              <ServiceCard service={S("attestation")} className="lg:col-span-5" />
              <ServiceCard service={S("yoga-retreats")} variant="dark" className="lg:col-span-4" />
              <ServiceCard service={S("tours")} className="lg:col-span-4" />
              <ServiceCard service={S("community")} variant="teal" className="lg:col-span-4" />
              <ServiceCard service={S("flights")} variant="small" className="lg:col-span-3" />
              <ServiceCard service={S("hotels")} variant="small" className="lg:col-span-3" />
              <ServiceCard service={S("cruises")} variant="small" className="lg:col-span-3" />
              <ServiceCard service={S("international-bus")} variant="small" className="lg:col-span-3" />
            </div>
          </Container>
        </section>

        {/* ── 6. The BookMyGlobal Distinction Matrix ───────────── */}
        <section className="py-20 bg-surface">
          <Container>
            <div className="rounded-3xl border border-surface-container-high bg-surface-container-lowest p-8 lg:p-12 shadow-xl">
              <div className="mx-auto max-w-3xl text-center space-y-3 mb-12">
                <Eyebrow>The Distinction</Eyebrow>
                <h2 className="font-display-hero text-3xl sm:text-4xl font-semibold text-primary">
                  Why Indian Travellers Choose <Em>BookMyGlobal</Em>
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  We bridge the gap between bureaucratic paperwork and experiential travel with total pricing clarity.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="space-y-4 rounded-2xl bg-surface-container-low p-6 border border-surface-container-high">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
                    <ShieldCheck className="h-6 w-6" />
                  </span>
                  <h3 className="font-headline-sm text-lg font-bold text-primary">
                    100% Upfront Pricing
                  </h3>
                  <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
                    We review your paperwork before quoting. No sudden hidden embassy fees, no unexpected markups. You approve the transparent quote before paying.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl bg-surface-container-low p-6 border border-surface-container-high">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-secondary-container">
                    <Sparkles className="h-6 w-6" />
                  </span>
                  <h3 className="font-headline-sm text-lg font-bold text-primary">
                    Direct Ashram Operations
                  </h3>
                  <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
                    Our Rishikesh Yoga Tourism retreats are operated directly by our own on-ground team — not resold through third-party intermediaries.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl bg-surface-container-low p-6 border border-surface-container-high">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed-variant">
                    <HeartHandshake className="h-6 w-6" />
                  </span>
                  <h3 className="font-headline-sm text-lg font-bold text-primary">
                    Dedicated Single Case Officer
                  </h3>
                  <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
                    Speak with a real specialist who manages your files from the initial checklist to biometric appointments and final courier tracking.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ── 7. Interactive 4-Step Journey Roadmap ────────────── */}
        {cms.show("steps") && (
          <section id="how-it-works" className="scroll-mt-24 bg-surface-container-low py-20">
            <Container>
              <SectionHeader
                align="center"
                eyebrow={t("steps_eyebrow", "Seamless Workflow")}
                title={t("steps_title", "Four Steps from Request to Landing")}
                intro={t("steps_subtitle", "Clear milestones, continuous updates, and encrypted document handling at every stage.")}
              />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { step: "01", title: t("step1_title", "Pick what you need"), text: t("step1_desc", "Choose your visa, attestation route, or travel service and submit your details.") },
                  { step: "02", title: t("step2_title", "Upload documents"), text: t("step2_desc", "Upload required files securely. Our case officers audit every page for consistency.") },
                  { step: "03", title: t("step3_title", "Review & clear quote"), text: t("step3_desc", "Approve the transparent quote and pay securely via Razorpay (UPI, cards, netbanking).") },
                  { step: "04", title: "Track & receive", text: "Receive real-time progress alerts, appointment confirmations, and insured courier returns." },
                ].map((s, i) => (
                  <div key={s.title} className="group relative flex flex-col justify-between gap-6 rounded-3xl border border-surface-container-high bg-surface-container-lowest p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="font-ticket-code text-xs font-bold uppercase tracking-wider text-secondary">
                        Stage {s.step}
                      </span>
                      <span className={`flex h-9 w-9 items-center justify-center rounded-2xl font-ticket-code text-xs font-bold ${
                        i === 3 
                          ? "bg-secondary-container text-on-secondary-container" 
                          : "bg-surface-container text-primary"
                      }`}>
                        {s.step}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-headline-sm text-lg font-bold text-primary group-hover:text-secondary transition-colors">
                        {s.title}
                      </h3>
                      <p className="font-body-sm text-xs leading-relaxed text-on-surface-variant">
                        {s.text}
                      </p>
                    </div>
                    <div className="h-1 w-full rounded-full bg-surface-container overflow-hidden">
                      <div className={`h-full bg-secondary transition-all duration-500 ${i === 0 ? "w-1/4" : i === 1 ? "w-2/4" : i === 2 ? "w-3/4" : "w-full"}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link href="/how-it-works" className="inline-flex items-center gap-2 font-label-md text-sm font-semibold text-secondary hover:underline">
                  Explore The Detailed Step-by-Step Guide <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Container>
          </section>
        )}

        {/* ── 8. Rishikesh Yoga Retreats Spotlight ─────────────── */}
        <section id="rishikesh" className="scroll-mt-24 bg-surface py-20">
          <Container>
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              
              {/* Arched Photo Grid */}
              <div className="grid grid-cols-2 gap-4 lg:col-span-6">
                <div className="aspect-[9/14] overflow-hidden rounded-t-[100px] rounded-b-2xl bg-surface-container shadow-xl">
                  <Photo src={IMAGES.retreatA} alt="Morning meditation by the Ganges" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
                <div className="mt-10 aspect-[9/14] overflow-hidden rounded-t-[100px] rounded-b-2xl bg-surface-container shadow-xl">
                  <Photo src={IMAGES.retreatB} alt="Open-air yoga pavilion in Himalayas" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
              </div>

              {/* Text & Daily Routine */}
              <div className="space-y-6 lg:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3.5 py-1 text-secondary">
                  <Leaf className="h-4 w-4" />
                  <span className="font-eyebrow text-eyebrow uppercase tracking-widest font-bold">
                    Our Own Operations · Rishikesh
                  </span>
                </div>

                <h2 className="font-display-hero text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-primary leading-tight">
                  Yoga Tourism, run by us, <Em>not resold.</Em>
                </h2>

                <p className="font-body-lg text-base leading-relaxed text-on-surface-variant">
                  Our flagship retreats in Rishikesh are created, staffed, and operated directly by BookMyGlobal. Experience traditional Hatha and Ashtanga practices, certified pranayama, pure Ayurvedic dining, and private Ganga aarti moments.
                </p>

                {/* Day-in-the-Life Schedule Card */}
                <div className="space-y-3 rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-surface-container-high pb-2.5">
                    <span className="font-ticket-code text-xs uppercase text-primary font-bold">A Typical Day</span>
                    <span className="font-ticket-code text-xs uppercase text-secondary font-bold">Rishikesh Ashram</span>
                  </div>
                  {[
                    ["06:30 AM", "Morning Ganga Sunrise Meditation & Herbal Infusion"],
                    ["08:00 AM", "Guided Asana & Dynamic Breathwork Practice"],
                    ["01:00 PM", "Traditional Sattvic Ayurvedic Lunch & Rest"],
                    ["05:30 PM", "Philosophy Discourse & Sacred Aarti by the River"],
                  ].map(([a, b]) => (
                    <div key={a} className="flex items-start justify-between text-xs text-on-surface-variant">
                      <span className="font-ticket-code text-primary font-semibold">{a}</span>
                      <span className="text-right font-medium">{b}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <PrimaryLink href="/contact?type=RETREAT">
                    Inquire About Next Intake
                  </PrimaryLink>
                  <GhostLink href="/yoga-retreats" className="border border-surface-container-high bg-surface-container-lowest hover:border-secondary">
                    View Retreat Itineraries
                  </GhostLink>
                </div>
              </div>

            </div>
          </Container>
        </section>

        {/* ── 9. Verified Customer Stories & Trust Wall ─────────── */}
        <section className="bg-surface-container-low py-20">
          <Container>
            <SectionHeader
              align="center"
              eyebrow="Real Experiences"
              title={<>Endorsed by Travellers Across <Em>India &amp; Abroad</Em>.</>}
              intro="Read authentic feedback from professionals, students, and holidaymakers who rely on BookMyGlobal."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {REVIEWS.map((rev) => (
                <div key={rev.name} className="flex flex-col justify-between rounded-3xl border border-surface-container-high bg-surface-container-lowest p-7 shadow-sm transition-all hover:shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="rounded-full bg-secondary-container/20 px-2 py-0.5 font-ticket-code text-[9px] uppercase tracking-wider text-secondary">
                        Verified Traveller
                      </span>
                    </div>
                    <p className="font-body-md text-sm leading-relaxed text-on-surface italic">
                      &ldquo;{rev.quote}&rdquo;
                    </p>
                  </div>

                  <div className="mt-6 border-t border-surface-container-high pt-4">
                    <p className="font-title-md text-sm font-bold text-primary">{rev.name}</p>
                    <div className="flex items-center justify-between text-xs text-on-surface-variant mt-0.5">
                      <span>{rev.location}</span>
                      <span className="font-ticket-code uppercase text-[10px] text-secondary font-semibold">{rev.service}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── 10. Journal & Traveler Circle ────────────────────── */}
        <section id="journal" className="scroll-mt-24 py-20 bg-surface">
          <Container>
            <SectionHeader
              eyebrow="The Travel Journal"
              title="Essential Guides for the Global Traveller."
              action={
                <Link href="/blog" className="inline-flex items-center gap-2 font-label-md text-secondary hover:underline font-semibold">
                  All Articles &amp; Insights <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />

            {posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {posts.map((p) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-surface-container-high bg-surface-container-lowest shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary hover:shadow-xl">
                    <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                      <Photo src={p.featuredImageUrl} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      {p.category && (
                        <span className="absolute left-3 top-3 rounded-full bg-surface-container-lowest/90 px-3 py-1 font-ticket-code text-[10px] uppercase tracking-wider text-primary backdrop-blur-md">
                          {p.category}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-4 p-6">
                      <div className="space-y-2">
                        <span className="block font-ticket-code text-[11px] uppercase tracking-wider text-outline">
                          {readTime(p.content)}
                        </span>
                        <h3 className="font-headline-sm text-lg font-bold text-primary transition-colors group-hover:text-secondary">
                          {p.title}
                        </h3>
                        {p.excerpt && (
                          <p className="line-clamp-2 font-body-sm text-xs text-on-surface-variant">
                            {p.excerpt}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 font-label-sm text-xs font-bold text-secondary">
                        Read full guide <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-surface-container-high bg-surface-container-low p-10 text-center">
                <Sparkles className="mx-auto h-7 w-7 text-secondary" />
                <p className="mt-3 font-title-md text-base font-bold text-primary">New Destination Guides in Preparation.</p>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1">Subscribe below to receive expert tips, visa policy changes, and retreat schedules.</p>
              </div>
            )}

            {/* Newsletter Circle */}
            <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl border border-surface-container-high bg-surface-container-low p-8 md:flex-row">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-title-md text-base font-bold text-primary">Join the BookMyGlobal Traveller Circle</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Curated visa alerts, retreat announcements, and travel notes directly to your inbox.</p>
                </div>
              </div>
              <NewsletterSignup />
            </div>
          </Container>
        </section>

        {/* ── 11. Instant Request Desk & FAQ ──────────────────── */}
        <section id="contact" className="scroll-mt-24 bg-surface-container-low py-20">
          <Container>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              
              {/* FAQ Left Column */}
              <div className="space-y-6 lg:col-span-5">
                <Eyebrow>Common Inquiries</Eyebrow>
                <h2 className="font-display-hero text-3xl font-semibold text-primary">
                  Frequently Asked Questions
                </h2>
                <p className="font-body-md text-sm text-on-surface-variant">
                  Have a specific question regarding consular submissions or retreat bookings? Our specialists are available 7 days a week.
                </p>
                <HomeFaq items={HOME_FAQS} />
              </div>

              {/* Instant Request Form Right Column */}
              <div className="lg:col-span-7">
                <div className="relative overflow-hidden rounded-3xl border border-surface-container-high bg-surface-container-lowest p-8 shadow-xl">
                  <Stamp lines={["Direct", "Desk"]} className="absolute -right-4 -top-4 h-24 w-24 rotate-12" />
                  <div className="mb-6 space-y-1">
                    <span className="font-eyebrow text-eyebrow uppercase tracking-widest text-secondary font-bold">
                      Direct Concierge
                    </span>
                    <h3 className="font-headline-md text-2xl font-bold tracking-tight text-primary">
                      Tell Us What You Need
                    </h3>
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      Share your details and a dedicated consultant will review and reply within 2 hours.
                    </p>
                  </div>
                  <EnquiryForm />
                </div>
              </div>

            </div>
          </Container>
        </section>

      </main>
      <Footer />
    </>
  );
}
