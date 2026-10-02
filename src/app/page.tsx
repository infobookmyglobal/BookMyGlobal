import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  Award, 
  Zap,
  ArrowUpRight,
  Receipt,
  Lock,
  Headphones,
  CalendarCheck,
  Compass,
  FileCheck,
  MessageCircle
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/home/ServiceCard";
import { PlanBar } from "@/components/home/PlanBar";
import { EnquiryForm } from "@/components/home/EnquiryForm";
import { HomeFaq } from "@/components/home/HomeFaq";
import { getPageCms } from "@/lib/cms";
import { getSeoMetadata } from "@/lib/seo";
import { getService } from "@/config/services";
import { FaqJsonLd } from "@/components/JsonLd";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("home");
}

const POPULAR_DESTINATIONS = [
  {
    name: "Switzerland & Schengen",
    country: "Europe (29 Countries)",
    badge: "10-15 Days",
    tag: "High Demand",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=cover&w=800&q=80",
    href: "/services/visa-assistance?country=Switzerland",
  },
  {
    name: "Dubai & Abu Dhabi",
    country: "United Arab Emirates",
    badge: "48-72 Hours",
    tag: "Express E-Visa",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=cover&w=800&q=80",
    href: "/services/visa-assistance?country=UAE",
  },
  {
    name: "Rishikesh Sanctuary",
    country: "Uttarakhand, India",
    badge: "Direct Operator",
    tag: "Ganga Ashram",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=cover&w=800&q=80",
    href: "/yoga-retreats",
  },
  {
    name: "Bali & Ubud",
    country: "Indonesia",
    badge: "Fast Track",
    tag: "Island Tours",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=cover&w=800&q=80",
    href: "/services/tours",
  },
  {
    name: "Singapore",
    country: "Southeast Asia",
    badge: "3-5 Days",
    tag: "Attractions Pass",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=cover&w=800&q=80",
    href: "/services/visa-assistance?country=Singapore",
  },
];

const TRENDING_SERVICES = [
  {
    slug: "visa-assistance",
    badge: "Trending",
    location: "Global · 60+ Embassies",
    price: "from ₹2,499",
  },
  {
    slug: "attestation",
    badge: "Govt Verified",
    location: "MEA Delhi & State Secretariats",
    price: "from ₹1,299",
  },
  {
    slug: "yoga-retreats",
    badge: "Direct Operator",
    location: "Rishikesh, Himalayas",
    price: "from ₹14,999",
  },
  {
    slug: "tours",
    badge: "Popular Combo",
    location: "Worldwide · 10,000+ Experiences",
    price: "from ₹999",
  },
];

const RECOMMENDED_PACKAGES = [
  {
    slug: "flights",
    badge: "Best Rate",
    location: "International Routes",
    price: "Zero Booking Fee",
  },
  {
    slug: "hotels",
    badge: "Handpicked",
    location: "Worldwide 4 & 5 Star",
    price: "Direct Vouchers",
  },
  {
    slug: "cruises",
    badge: "Luxury",
    location: "Singapore, Dubai & Europe",
    price: "from ₹32,000",
  },
  {
    slug: "bus-booking",
    badge: "Cross-Border",
    location: "Europe, UK & Asia",
    price: "Instant E-Ticket",
  },
];

const REVIEWS = [
  {
    name: "Dr. Rohan Mukherjee",
    location: "Bengaluru → Zurich",
    service: "Schengen Visa & MEA Apostille",
    rating: 5,
    quote: "Got both my medical degree apostille and Switzerland visa done seamlessly. Transparent quotes, zero hidden charges, and outstanding proactive status updates.",
  },
  {
    name: "Ananya Sharma",
    location: "Mumbai → Rishikesh",
    service: "7-Day Yoga Awakening",
    rating: 5,
    quote: "The retreat along the Ganges was truly life-changing. Because BookMyGlobal operates it directly, every detail from station pickup to master sessions was flawless.",
  },
  {
    name: "Vikramaditya Rao",
    location: "Delhi → Dubai",
    service: "UAE Commercial Attestation & Flights",
    rating: 5,
    quote: "Commercial agreements legalised by UAE Embassy and delivered back via insured courier within 5 working days. Unmatched professionalism.",
  },
];

const HOME_FAQS = [
  { 
    q: "How does BookMyGlobal guarantee no hidden fees?", 
    a: "We provide upfront itemized pricing including government consular fees, MEA administrative charges, and service fees before you commit. What you see is exactly what you pay." 
  },
  { 
    q: "Who runs the Rishikesh yoga retreats?", 
    a: "BookMyGlobal operates our Rishikesh Ganga retreats directly — not as an affiliate or reseller. That means our dedicated resident team coordinates your accommodation, daily yogic practices, ayurvedic meals, and excursions." 
  },
  { 
    q: "Is MEA Apostille & Attestation valid globally?", 
    a: "Yes. Our apostilles are issued directly through Ministry of External Affairs (MEA), Government of India for Hague Convention member countries, and embassy attestation for non-Hague nations (UAE, Qatar, Kuwait, etc.)." 
  },
  { 
    q: "Can I manage all my bookings in one single account?", 
    a: "Yes! Your encrypted dashboard keeps your visa files, attested certificates, flight PNRs, hotel vouchers, and retreat schedules organized securely in one portal." 
  },
];

export default async function HomePage() {
  const S = (slug: string) => getService(slug)!;

  return (
    <>
      <Header />
      <FaqJsonLd faqs={HOME_FAQS.map(f => ({ question: f.q, answer: f.a }))} />
      
      <main className="min-h-screen bg-slate-50 text-slate-900 pb-16 sm:pb-20">
        
        {/* ── 1. ReadyTrip-Style Mobile & Desktop Hero ────────────────────── */}
        <section className="relative overflow-hidden bg-slate-950 pb-12 pt-8 sm:pb-20 sm:pt-14 lg:pt-20">
          
          {/* Hero Background Image with Subtle Gradient */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <Image
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=cover&w=2000&q=80"
              alt="Global travel destination"
              fill
              priority
              className="object-cover object-center opacity-30 scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/65 to-slate-950" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/70 via-transparent to-blue-950/70" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center z-10">
            
            {/* Top Tagline Pill */}
            <p className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-blue-300 mb-3 sm:mb-4 backdrop-blur-md">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-400 animate-pulse" />
              Direct Global Concierge
            </p>

            {/* Hero Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] drop-shadow-sm">
              Find something extraordinary<br />
              <span className="text-blue-400">to experience</span>, anywhere.
            </h1>

            {/* Subtitle */}
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-slate-200/90 max-w-2xl mx-auto leading-relaxed font-medium">
              Handpicked visas, MEA document attestation, flights, stays, tours &amp; authentic Rishikesh retreats — trusted specialists, instant updates &amp; zero hidden fees.
            </p>

            {/* ── ReadyTrip Search Bar Widget ───────────────────────────── */}
            <div className="mt-6 sm:mt-8 max-w-4xl mx-auto">
              <PlanBar />
            </div>

            {/* Trust Badges Row (Touch responsive) */}
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-white/10 border border-white/20 backdrop-blur-md text-white shadow-sm">
                <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-300 shrink-0" />
                <span>No hidden fees</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-white/10 border border-white/20 backdrop-blur-md text-white shadow-sm">
                <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-300 shrink-0" />
                <span>Govt. MEA Verified</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-white/10 border border-white/20 backdrop-blur-md text-white shadow-sm">
                <Headphones className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-300 shrink-0" />
                <span>24/7 Concierge</span>
              </div>
            </div>

          </div>
        </section>

        {/* ── 2. Category Tabs Filter Bar (Mobile Touch Carousel) ────────── */}
        <section className="sticky top-14 sm:top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-2.5 sm:py-3 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center">
              {[
                { label: "All Services", href: "#popular-destinations" },
                { label: "Visa Assistance", href: "/services/visa-assistance" },
                { label: "MEA Attestation", href: "/services/attestation" },
                { label: "Yoga Retreats", href: "/yoga-retreats" },
                { label: "Flights & Stays", href: "/services/flights" },
                { label: "Tours & Combos", href: "/services/tours" },
                { label: "Cruises", href: "/services/cruises" },
                { label: "Community", href: "/community" },
              ].map((tab, idx) => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`press shrink-0 inline-flex items-center px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold border transition-all ${
                    idx === 0
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/60"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Popular Destinations (Swipeable on Mobile) ──────────────── */}
        <section id="popular-destinations" className="py-8 sm:py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            {/* Header */}
            <div className="flex items-end justify-between pb-4 sm:pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 mb-0.5 sm:mb-1">
                  Top picks &amp; Global Hubs
                </p>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Popular destinations
                </h2>
              </div>
              <Link
                href="/services/visa-assistance"
                className="press inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                <span>See all</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>

            {/* 5-Column Grid on Desktop, Smooth Touch-Snap on Mobile */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-5 lg:overflow-visible">
              {POPULAR_DESTINATIONS.map((dest) => (
                <Link
                  key={dest.name}
                  href={dest.href}
                  className="press group relative block w-[155px] h-[215px] sm:w-[190px] sm:h-[260px] lg:w-full lg:h-[280px] shrink-0 snap-start rounded-2xl overflow-hidden shadow-card hover:shadow-card-lg transition-all"
                >
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 640px) 155px, (max-width: 1024px) 190px, 20vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                  <div className="absolute top-2.5 end-2.5 sm:top-3 sm:end-3 grid place-items-center size-7 sm:size-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-slate-800">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>

                  <div className="absolute top-2.5 start-2.5 sm:top-3 sm:start-3">
                    <span className="rounded-full bg-blue-600/95 backdrop-blur-sm px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-sm">
                      {dest.tag}
                    </span>
                  </div>

                  <div className="absolute inset-x-3 bottom-3 space-y-0.5 sm:space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-white leading-tight line-clamp-1">
                      {dest.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-medium text-slate-300 line-clamp-1">
                      {dest.badge}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* ── 4. Trending Now (ReadyTrip Product Carousel / Grid) ────────── */}
        <section className="py-8 sm:py-12 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="flex items-end justify-between pb-4 sm:pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 mb-0.5 sm:mb-1">
                  Booked the most this week
                </p>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Trending services &amp; experiences
                </h2>
              </div>
              <Link
                href="/services"
                className="press inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                <span>See all</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>

            {/* Swipeable on Mobile, Grid on Desktop */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible">
              {TRENDING_SERVICES.map((item) => {
                const service = S(item.slug);
                if (!service) return null;
                return (
                  <div key={item.slug} className="w-[270px] sm:w-[290px] shrink-0 snap-start lg:w-full">
                    <ServiceCard
                      service={service}
                      badge={item.badge}
                      location={item.location}
                      price={item.price}
                    />
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ── 5. Recommended For You Grid ────────────────────────────────── */}
        <section className="py-8 sm:py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="flex items-end justify-between pb-4 sm:pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 mb-0.5 sm:mb-1">
                  Hand-picked for you
                </p>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Recommended travel &amp; legal solutions
                </h2>
              </div>
            </div>

            {/* Swipeable on Mobile, Grid on Desktop */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible">
              {RECOMMENDED_PACKAGES.map((item) => {
                const service = S(item.slug);
                if (!service) return null;
                return (
                  <div key={item.slug} className="w-[270px] sm:w-[290px] shrink-0 snap-start lg:w-full">
                    <ServiceCard
                      service={service}
                      badge={item.badge}
                      location={item.location}
                      price={item.price}
                    />
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ── 6. Value Proposition Grid (4 Trust Cards) ──────────────────── */}
        <section className="py-8 sm:py-12 md:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 rounded-3xl bg-slate-50 border border-slate-200/90 p-5 sm:p-8 shadow-card">
              
              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Receipt className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">No booking fees</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Transparent pricing. The price you see is the price you pay.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Govt. MEA Verified</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Legitimate apostille, attestation &amp; embassy verified paperwork.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                  <CalendarCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Free cancellation</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Plans change. Cancel free on eligible travel &amp; tour bookings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Headphones className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">24/7 Global support</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Real human specialists on WhatsApp and phone around the clock.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 7. ReadyTrip "How BookMyGlobal Works" (3 Steps) ─────────────── */}
        <section className="py-10 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 mb-1">
                Book in 3 easy steps
              </p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                How BookMyGlobal works
              </h2>
            </div>

            <ol className="relative grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
              
              {/* Step 1 */}
              <li className="relative flex flex-col items-center text-center p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card">
                <div className="relative mb-4">
                  <span className="grid place-items-center size-16 sm:size-20 rounded-full bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                    <FileCheck className="h-7 w-7 sm:h-9 sm:w-9" />
                  </span>
                  <span className="absolute -top-1 -end-1 grid place-items-center size-5 sm:size-6 rounded-full bg-slate-900 text-white text-[11px] sm:text-xs font-bold">
                    1
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Choose your requirement
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs">
                  Pick your visa destination, document attestation protocol, or retreat program and check custom requirements.
                </p>
              </li>

              {/* Step 2 */}
              <li className="relative flex flex-col items-center text-center p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card">
                <div className="relative mb-4">
                  <span className="grid place-items-center size-16 sm:size-20 rounded-full bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                    <Lock className="h-7 w-7 sm:h-9 sm:w-9" />
                  </span>
                  <span className="absolute -top-1 -end-1 grid place-items-center size-5 sm:size-6 rounded-full bg-slate-900 text-white text-[11px] sm:text-xs font-bold">
                    2
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Submit details &amp; secure payment
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs">
                  Upload paperwork securely into our 256-bit vault and complete payment via Stripe, Razorpay, or PayPal.
                </p>
              </li>

              {/* Step 3 */}
              <li className="relative flex flex-col items-center text-center p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card">
                <div className="relative mb-4">
                  <span className="grid place-items-center size-16 sm:size-20 rounded-full bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
                    <Sparkles className="h-7 w-7 sm:h-9 sm:w-9" />
                  </span>
                  <span className="absolute -top-1 -end-1 grid place-items-center size-5 sm:size-6 rounded-full bg-slate-900 text-white text-[11px] sm:text-xs font-bold">
                    3
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Receive vouchers &amp; travel carefree
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs">
                  Get your attested documents via insured courier, e-visas and vouchers in your inbox, plus 24/7 concierge assistance.
                </p>
              </li>

            </ol>

          </div>
        </section>

        {/* ── 8. ReadyTrip 24/7 WhatsApp & Live Support Callout (Mobile-tuned) */}
        <section className="py-6 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-5 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
              
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="relative shrink-0">
                  <span className="grid place-items-center size-12 sm:size-14 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                    <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
                  </span>
                  <span className="absolute -bottom-1 -end-1 size-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div>
                  <p className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online now
                  </p>
                  <h3 className="text-base sm:text-xl font-bold text-slate-900 mt-0.5">
                    We're here for you, 24/7
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl mt-0.5">
                    Real travel specialists on WhatsApp and phone — before, during, and after your trip.
                  </p>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <a
                  href="https://wa.me/917678356255"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press flex h-12 w-full md:w-auto items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-bold text-white shadow-cta hover:bg-blue-700 transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* ── 9. ReadyTrip Royal Blue CTA Banner ─────────────────────────── */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-10 sm:px-10 sm:py-14 text-center text-white shadow-xl shadow-blue-500/10">
              
              <div aria-hidden className="absolute -top-24 end-0 size-80 rounded-full bg-white/10 blur-2xl" />
              <div aria-hidden className="absolute -bottom-24 start-0 size-72 rounded-full bg-sky-400/10 blur-2xl" />

              <div className="relative max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
                  Your next global adventure is one tap away
                </h2>
                <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
                  Visas, government apostilles, luxury stays &amp; retreats worldwide with dedicated specialists at every milestone.
                </p>
                
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3">
                  <Link
                    href="/services/visa-assistance"
                    className="press flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-blue-700 shadow-md hover:bg-slate-50 transition-colors"
                  >
                    <span>Explore Destinations</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/services"
                    className="press flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-white/15 px-7 text-sm font-bold text-white border border-white/30 hover:bg-white/20 transition-colors"
                  >
                    Browse All Services
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 10. Traveller Reviews (Swipeable on Mobile) ────────────────── */}
        <section className="py-10 sm:py-16 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 mb-1">
                Verified Reviews
              </p>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Trusted by 5,000+ travellers
              </h2>
            </div>

            <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
              {REVIEWS.map((rev) => (
                <div
                  key={rev.name}
                  className="w-[280px] sm:w-[320px] shrink-0 snap-start md:w-full rounded-3xl border border-slate-200/90 bg-slate-50/50 p-5 sm:p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-2.5 sm:mb-3">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                      "{rev.quote}"
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{rev.name}</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500">{rev.location}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-blue-700">
                      {rev.service}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── 11. Structured FAQs ────────────────────────────────────────── */}
        <section className="py-10 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 mb-1">
                Got questions?
              </p>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <HomeFaq items={HOME_FAQS} />
          </div>
        </section>

        {/* ── 12. Direct Concierge Enquiry Form ─────────────────────────── */}
        <section className="py-10 sm:py-16 bg-white border-t border-slate-200/80">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 mb-1">
                Custom Concierge
              </p>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tell us where you are headed
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
                Share your itinerary or paperwork requirements, and a dedicated specialist will contact you.
              </p>
            </div>
            <EnquiryForm />
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
