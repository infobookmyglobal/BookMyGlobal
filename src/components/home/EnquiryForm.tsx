"use client";

import { useState } from "react";
import { CheckCircle2, Send, Lock, ShieldCheck } from "lucide-react";

export const ENQUIRY_TYPES: { value: string; label: string }[] = [
  { value: "GENERAL", label: "General question" },
  { value: "VISA", label: "Visa application assistance" },
  { value: "ATTESTATION", label: "MEA & embassy attestation" },
  { value: "FLIGHT", label: "Flight booking" },
  { value: "HOTEL", label: "Hotel booking" },
  { value: "TOURS", label: "Tours & activities" },
  { value: "CRUISE", label: "Cruise travel" },
  { value: "BUS", label: "International bus booking" },
  { value: "RETREAT", label: "Yoga retreat in Rishikesh" },
  { value: "COMMUNITY", label: "Traveller community" },
];

const field =
  "w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-base sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all";
const label = "text-xs font-bold uppercase tracking-wider text-slate-500";

export function EnquiryForm({
  defaultType = "GENERAL",
  defaultDestination = "",
  defaultDate = "",
}: { defaultType?: string; defaultDestination?: string; defaultDate?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const destination = String(fd.get("destination") || "").trim();
    const travelDate = String(fd.get("travelDate") || "").trim();
    const payload = {
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      type: fd.get("type"),
      message: fd.get("message"),
      website: fd.get("website"),
      meta: { ...(destination && { destination }), ...(travelDate && { travelDate }) },
    };
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Something went wrong");
      }
      setState("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="py-10 sm:py-12 text-center rounded-3xl bg-blue-50/50 border border-blue-100 p-6 sm:p-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-lg sm:text-xl font-bold text-slate-900">Thank you! Your request is received.</h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">Our direct travel concierge team will reach out via WhatsApp &amp; Email within a few hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3.5 sm:space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-card-lg">
      <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className={label} htmlFor="enq-name">Full name</label>
          <input id="enq-name" name="name" required minLength={2} placeholder="Your name" className={field} />
        </div>
        <div className="space-y-1.5">
          <label className={label} htmlFor="enq-email">Email address</label>
          <input id="enq-email" name="email" type="email" required placeholder="name@example.com" className={field} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className={label} htmlFor="enq-phone">WhatsApp / Phone Number</label>
          <input id="enq-phone" name="phone" type="tel" placeholder="+91 98XXX XXXXX" className={field} />
        </div>
        <div className="space-y-1.5">
          <label className={label} htmlFor="enq-type">What do you need assistance with?</label>
          <select id="enq-type" name="type" defaultValue={defaultType} className={`${field} cursor-pointer`}>
            {ENQUIRY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className={label} htmlFor="enq-dest">Destination country (optional)</label>
          <input id="enq-dest" name="destination" defaultValue={defaultDestination} placeholder="e.g. Switzerland, Dubai, Rishikesh" className={field} />
        </div>
        <div className="space-y-1.5">
          <label className={label} htmlFor="enq-date">Intended travel date (optional)</label>
          <input id="enq-date" name="travelDate" defaultValue={defaultDate} placeholder="e.g. Next month, November 2026" className={field} />
        </div>
      </div>

      {/* Honeypot field */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="space-y-1.5">
        <label className={label} htmlFor="enq-msg">Specific requirements or notes</label>
        <textarea id="enq-msg" name="message" rows={3} placeholder="Tell us about your visa requirements, document types, or travel plans..." className={field} />
      </div>

      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>No spam guarantee · 256-bit secure encryption</span>
        </div>

        <button
          type="submit"
          disabled={state === "sending"}
          className="press w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-cta hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          <span>{state === "sending" ? "Sending..." : "Submit Request"}</span>
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
