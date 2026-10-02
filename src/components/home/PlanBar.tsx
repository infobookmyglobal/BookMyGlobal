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
  Search,
  ChevronDown
} from "lucide-react";

type ServiceTab = "VISA" | "ATTESTATION" | "RETREAT" | "TRAVEL" | "TOURS";

const TABS: { id: ServiceTab; label: string; icon: typeof FileCheck; badge?: string }[] = [
  { id: "VISA", label: "Visa Assistance", icon: FileCheck, badge: "99.4% Success" },
  { id: "ATTESTATION", label: "MEA Attestation", icon: Stamp, badge: "Govt Verified" },
  { id: "RETREAT", label: "Yoga Retreats", icon: Sparkles, badge: "Direct Operator" },
  { id: "TRAVEL", label: "Flights & Stays", icon: Plane },
  { id: "TOURS", label: "Tours & Combos", icon: Compass },
];

const POPULAR_COUNTRIES = [
  "Switzerland (Schengen)",
  "United Arab Emirates",
  "United Kingdom",
  "Japan",
  "United States",
  "Singapore",
  "Thailand",
  "Indonesia (Bali)",
  "Vietnam",
  "Canada",
];

const ATTESTATION_DOCS = [
  "Educational Degree / Diploma",
  "Marriage Certificate",
  "Birth Certificate",
  "Commercial / Board Resolution",
  "Police Clearance Certificate (PCC)",
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
      {/* ReadyTrip Style Pill Navigation Tabs (Touch-optimized) */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 snap-x snap-mandatory -mx-2 px-2 sm:mx-0 sm:px-0 sm:justify-center">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`press shrink-0 snap-start inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 touch-manipulation ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.badge && (
                <span className={`hidden md:inline-block rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                  isActive ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Search Floating Card (Touch-friendly inputs) */}
      <form
        onSubmit={handleSearch}
        className="mt-1 sm:mt-2 rounded-2xl md:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-card-lg text-left"
      >
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
          
          {/* Column 1: Destination / Country */}
          <div className="lg:col-span-4 relative rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 sm:p-3 hover:border-blue-400 transition-colors">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {activeTab === "RETREAT" ? "Ashram Location" : "Destination / Country"}
            </label>
            <div className="mt-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
              {activeTab === "RETREAT" ? (
                <span className="text-base sm:text-sm font-bold text-slate-800">Rishikesh Ganga Ashram (India)</span>
              ) : (
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-transparent text-base sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer py-0.5"
                >
                  {POPULAR_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Column 2: Specific Requirement / Program */}
          <div className="lg:col-span-4 relative rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 sm:p-3 hover:border-blue-400 transition-colors">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {activeTab === "VISA" 
                ? "Visa Category" 
                : activeTab === "ATTESTATION" 
                ? "Document Type" 
                : activeTab === "RETREAT"
                ? "Retreat Duration"
                : "Service Detail"}
            </label>
            <div className="mt-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
              {activeTab === "VISA" && (
                <select
                  value={visaType}
                  onChange={(e) => setVisaType(e.target.value)}
                  className="w-full bg-transparent text-base sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer py-0.5"
                >
                  <option value="Tourist / Visitor">Tourist / Visitor Visa</option>
                  <option value="Business / Conference">Business / Conference Visa</option>
                  <option value="Student Visa Guidance">Student Visa Guidance</option>
                  <option value="Family / Transit">Family / Transit Visa</option>
                </select>
              )}

              {activeTab === "ATTESTATION" && (
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-transparent text-base sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer py-0.5"
                >
                  {ATTESTATION_DOCS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              )}

              {activeTab === "RETREAT" && (
                <select
                  value={retreatProgram}
                  onChange={(e) => setRetreatProgram(e.target.value)}
                  className="w-full bg-transparent text-base sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer py-0.5"
                >
                  {RETREAT_PROGRAMS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              )}

              {(activeTab === "TRAVEL" || activeTab === "TOURS") && (
                <select
                  className="w-full bg-transparent text-base sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer py-0.5"
                >
                  <option>International Flight &amp; Hotel Combo</option>
                  <option>Customised City Tour &amp; Activity Pass</option>
                  <option>Airport Transfers &amp; Global eSIM</option>
                </select>
              )}
            </div>
          </div>

          {/* Column 3: Travel Timeline */}
          <div className="lg:col-span-2 relative rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 sm:p-3 hover:border-blue-400 transition-colors">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Timeline
            </label>
            <div className="mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
              <select
                value={travelMonth}
                onChange={(e) => setTravelMonth(e.target.value)}
                className="w-full bg-transparent text-base sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer py-0.5"
              >
                <option value="Next 7-15 Days">Immediate (7-15 Days)</option>
                <option value="Next 30 Days">Next 30 Days</option>
                <option value="1-3 Months">1 - 3 Months</option>
                <option value="3+ Months">3+ Months</option>
              </select>
            </div>
          </div>

          {/* Column 4: Submit Button */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="press flex h-12 sm:h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-cta hover:bg-blue-700 active:scale-[0.98] transition-all touch-manipulation"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
