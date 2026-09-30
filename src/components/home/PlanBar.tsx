"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FileCheck, 
  Stamp, 
  Sparkles, 
  Plane, 
  Compass, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ChevronRight,
  Layers
} from "lucide-react";

type ServiceTab = "VISA" | "ATTESTATION" | "RETREAT" | "TRAVEL" | "TOURS";

const TABS: { id: ServiceTab; label: string; icon: typeof FileCheck; badge?: string }[] = [
  { id: "VISA", label: "Visa Assistance", icon: FileCheck, badge: "99.4% Success" },
  { id: "ATTESTATION", label: "MEA Attestation", icon: Stamp, badge: "Govt MEA" },
  { id: "RETREAT", label: "Yoga Retreats", icon: Sparkles, badge: "Rishikesh Direct" },
  { id: "TRAVEL", label: "Flights & Hotels", icon: Plane },
  { id: "TOURS", label: "Tours & Cruises", icon: Compass },
];

const POPULAR_COUNTRIES = [
  "Switzerland (Schengen)",
  "United Kingdom",
  "United Arab Emirates",
  "Japan",
  "United States",
  "Singapore",
  "Thailand",
  "Canada",
  "Australia",
  "Vietnam",
];

const ATTESTATION_DOCS = [
  "Educational Degree / Diploma",
  "Marriage Certificate",
  "Birth Certificate",
  "Police Clearance Certificate (PCC)",
  "Commercial / Board Resolution",
  "Affidavit / Power of Attorney",
];

const RETREAT_PROGRAMS = [
  "7-Day Mindful Awakening (Rishikesh)",
  "14-Day Himalayan Deep Immersion",
  "21-Day Yoga Teacher Foundation",
  "Weekend Rejuvenation Retreat",
];

export function PlanBar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ServiceTab>("VISA");
  const [destination, setDestination] = useState("Switzerland (Schengen)");
  const [visaType, setVisaType] = useState("Tourist / Visitor");
  const [docType, setDocType] = useState("Educational Degree / Diploma");
  const [retreatProgram, setRetreatProgram] = useState("7-Day Mindful Awakening (Rishikesh)");
  const [travelMonth, setTravelMonth] = useState("Next 30 Days");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("type", activeTab);

    if (activeTab === "VISA") {
      params.set("destination", destination);
      params.set("visaType", visaType);
      params.set("date", travelMonth);
    } else if (activeTab === "ATTESTATION") {
      params.set("docType", docType);
      params.set("destination", destination);
      params.set("date", travelMonth);
    } else if (activeTab === "RETREAT") {
      params.set("program", retreatProgram);
      params.set("date", travelMonth);
    } else {
      params.set("destination", destination);
      params.set("date", travelMonth);
    }

    router.push(`/contact?${params.toString()}`);
  }

  return (
    <div className="w-full">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-surface-container-high pb-4 md:gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-2 rounded-xl px-4 py-2.5 font-title-md text-sm font-semibold transition-all ${
                isActive
                  ? "bg-primary-container text-secondary-container shadow-md"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-primary"
              }`}
            >
              <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-secondary-container" : "text-secondary group-hover:text-primary"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`hidden rounded-full px-2 py-0.5 font-ticket-code text-[8px] uppercase tracking-wider md:inline-block ${
                  isActive ? "bg-secondary-container/20 text-secondary-container" : "bg-surface-container text-outline"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Filter Controls */}
      <form onSubmit={handleSearch} className="mt-4 grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 lg:grid-cols-12">
        {activeTab === "VISA" && (
          <>
            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-3 transition-colors focus-within:border-secondary lg:col-span-4">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-on-surface-variant">
                Destination Country
              </label>
              <div className="mt-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-secondary" />
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  aria-label="Select destination country"
                  className="w-full cursor-pointer bg-transparent font-title-md text-sm font-semibold text-primary focus:outline-none"
                >
                  {POPULAR_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-3 transition-colors focus-within:border-secondary lg:col-span-3">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-on-surface-variant">
                Visa Category
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Layers className="h-4 w-4 shrink-0 text-secondary" />
                <select
                  value={visaType}
                  onChange={(e) => setVisaType(e.target.value)}
                  aria-label="Select visa category"
                  className="w-full cursor-pointer bg-transparent font-title-md text-sm font-semibold text-primary focus:outline-none"
                >
                  <option value="Tourist / Visitor">Tourist / Visitor Visa</option>
                  <option value="Business / Conference">Business / Conference</option>
                  <option value="Student / Academic">Student / Higher Studies</option>
                  <option value="Work / Employment">Work / Employment Route</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-3 transition-colors focus-within:border-secondary lg:col-span-3">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-on-surface-variant">
                Target Travel Window
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-secondary" />
                <select
                  value={travelMonth}
                  onChange={(e) => setTravelMonth(e.target.value)}
                  aria-label="Select target travel window"
                  className="w-full cursor-pointer bg-transparent font-title-md text-sm font-semibold text-primary focus:outline-none"
                >
                  <option value="Urgent (Next 14 Days)">Urgent (Next 14 Days)</option>
                  <option value="Next 30 Days">Next 30 Days</option>
                  <option value="Next 1-3 Months">Next 1-3 Months</option>
                  <option value="Later / Exploring">Later / Planning Ahead</option>
                </select>
              </div>
            </div>
          </>
        )}

        {activeTab === "ATTESTATION" && (
          <>
            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-3 transition-colors focus-within:border-secondary lg:col-span-4">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-on-surface-variant">
                Document Type
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Stamp className="h-4 w-4 shrink-0 text-secondary" />
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  aria-label="Select document type"
                  className="w-full cursor-pointer bg-transparent font-title-md text-sm font-semibold text-primary focus:outline-none"
                >
                  {ATTESTATION_DOCS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-3 transition-colors focus-within:border-secondary lg:col-span-3">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-on-surface-variant">
                Destination Authority
              </label>
              <div className="mt-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-secondary" />
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  aria-label="Select destination authority"
                  className="w-full cursor-pointer bg-transparent font-title-md text-sm font-semibold text-primary focus:outline-none"
                >
                  <option value="UAE / Gulf (Embassy Legalization)">UAE / Gulf (Embassy)</option>
                  <option value="Hague Apostille (Schengen, UK, US)">Hague Apostille (MEA)</option>
                  <option value="Qatar / Kuwait / Bahrain">Qatar / Kuwait / Bahrain</option>
                  <option value="Other International Embassy">Other International Embassy</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-3 transition-colors focus-within:border-secondary lg:col-span-3">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-on-surface-variant">
                Processing Speed
              </label>
              <div className="mt-1 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-secondary" />
                <select
                  value={travelMonth}
                  onChange={(e) => setTravelMonth(e.target.value)}
                  aria-label="Select processing speed"
                  className="w-full cursor-pointer bg-transparent font-title-md text-sm font-semibold text-primary focus:outline-none"
                >
                  <option value="Express MEA (3-5 Days)">Express MEA (3-5 Days)</option>
                  <option value="Standard Apostille (7-10 Days)">Standard (7-10 Days)</option>
                  <option value="Full Embassy Legalization">Full Embassy Route</option>
                </select>
              </div>
            </div>
          </>
        )}

        {activeTab === "RETREAT" && (
          <>
            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-3 transition-colors focus-within:border-secondary lg:col-span-5">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-on-surface-variant">
                Rishikesh Programme
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-secondary" />
                <select
                  value={retreatProgram}
                  onChange={(e) => setRetreatProgram(e.target.value)}
                  aria-label="Select Rishikesh retreat programme"
                  className="w-full cursor-pointer bg-transparent font-title-md text-sm font-semibold text-primary focus:outline-none"
                >
                  {RETREAT_PROGRAMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-3 transition-colors focus-within:border-secondary lg:col-span-5">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-on-surface-variant">
                Preferred Intake Season
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-secondary" />
                <select
                  value={travelMonth}
                  onChange={(e) => setTravelMonth(e.target.value)}
                  aria-label="Select preferred intake season"
                  className="w-full cursor-pointer bg-transparent font-title-md text-sm font-semibold text-primary focus:outline-none"
                >
                  <option value="Spring (March - May)">Spring Sanctuary (March - May)</option>
                  <option value="Monsoon Serenity (July - August)">Monsoon Serenity (July - August)</option>
                  <option value="Autumn Himalayan (Sept - Nov)">Autumn Himalayan (Sept - Nov)</option>
                  <option value="Winter Calm (Dec - Feb)">Winter Calm (Dec - Feb)</option>
                </select>
              </div>
            </div>
          </>
        )}

        {(activeTab === "TRAVEL" || activeTab === "TOURS") && (
          <>
            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-3 transition-colors focus-within:border-secondary lg:col-span-5">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-on-surface-variant">
                Destination or Circuit
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Compass className="h-4 w-4 shrink-0 text-secondary" />
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Switzerland, Dubai, Bali, Singapore"
                  aria-label="Enter destination or circuit"
                  className="w-full bg-transparent font-title-md text-sm font-semibold text-primary placeholder:text-outline focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-3 transition-colors focus-within:border-secondary lg:col-span-5">
              <label className="block font-eyebrow text-[10px] uppercase tracking-wider text-on-surface-variant">
                Travel Window
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-secondary" />
                <input
                  value={travelMonth}
                  onChange={(e) => setTravelMonth(e.target.value)}
                  placeholder="e.g. mid-April, 4 nights"
                  aria-label="Enter travel window and duration"
                  className="w-full bg-transparent font-title-md text-sm font-semibold text-primary placeholder:text-outline focus:outline-none"
                />
              </div>
            </div>
          </>
        )}

        {/* Action Button */}
        <div className="flex items-center lg:col-span-2">
          <button
            type="submit"
            className="group relative flex h-full min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary-container px-6 font-title-md text-sm font-bold text-secondary-container shadow-md transition-all hover:bg-black hover:shadow-lg hover:shadow-primary-container/30"
          >
            <span className="relative z-10">Check Now</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </form>

      {/* Quick helper tag / trust banner */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-surface-container-high/60 pt-3 text-[11px] text-on-surface-variant">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
            <strong className="font-semibold text-primary">No Hidden Surcharges:</strong> Transparent official quotes
          </span>
          <span className="hidden md:inline text-outline">•</span>
          <span className="hidden md:inline">Govt. MEA &amp; Embassy Certified Guidance</span>
        </div>
        <div className="flex items-center gap-1.5 font-ticket-code uppercase text-secondary">
          <span>Average reply: &lt; 2 hours</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}
