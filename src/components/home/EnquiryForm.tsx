"use client";

import { useState } from "react";
import { CheckCircle2, Send, Lock } from "lucide-react";

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
  "w-full rounded-xl bg-surface-container px-4 py-3 font-body-md text-body-md text-primary placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-secondary transition-all";
const label = "font-eyebrow text-eyebrow uppercase tracking-wider text-on-surface-variant";

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
      <div className="py-12 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-space-md font-headline-sm text-headline-sm text-primary">Thanks, we have your request</h3>
        <p className="mt-2 font-body-md text-on-surface-variant">Our team will reply to your email shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-space-md">
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <div className="space-y-1.5">
          <label className={label} htmlFor="enq-name">Full name</label>
          <input id="enq-name" name="name" required minLength={2} placeholder="Your name" className={field} />
        </div>
        <div className="space-y-1.5">
          <label className={label} htmlFor="enq-email">Email address</label>
          <input id="enq-email" name="email" type="email" required placeholder="name@example.com" className={field} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <div className="space-y-1.5">
          <label className={label} htmlFor="enq-phone">Mobile / WhatsApp (optional)</label>
          <input id="enq-phone" name="phone" type="tel" placeholder="+91 98XXX XXXXX" className={field} />
        </div>
        <div className="space-y-1.5">
          <label className={label} htmlFor="enq-type">What do you need?</label>
          <select id="enq-type" name="type" defaultValue={defaultType} className={`${field} cursor-pointer`}>
            {ENQUIRY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <div className="space-y-1.5">
          <label className={label} htmlFor="enq-dest">Destination (optional)</label>
          <input id="enq-dest" name="destination" defaultValue={defaultDestination} placeholder="e.g. Switzerland, Japan, UAE" className={field} />
        </div>
        <div className="space-y-1.5">
          <label className={label} htmlFor="enq-date">Travel date (optional)</label>
          <input id="enq-date" name="travelDate" defaultValue={defaultDate} placeholder="e.g. mid-March" className={field} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className={label} htmlFor="enq-msg">Tell us more</label>
        <textarea id="enq-msg" name="message" required minLength={5} rows={4} placeholder="Where you are headed, who is travelling, and what you need help with" className={field} />
      </div>
      {/* honeypot: hidden from people, bots fill it */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state === "error" && <p className="font-label-md text-error">{error}</p>}
      <div className="flex flex-col items-center justify-between gap-space-md pt-space-sm sm:flex-row">
        <p className="flex items-center gap-2 font-ticket-code text-[10px] uppercase tracking-wider text-on-surface-variant">
          <Lock className="h-4 w-4 text-secondary" /> Used only to answer your request
        </p>
        <button
          type="submit"
          disabled={state === "sending"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary-container px-8 py-3.5 font-label-md font-bold text-on-secondary-container shadow-sm transition-all hover:bg-secondary-fixed disabled:opacity-60 sm:w-auto"
        >
          <span>{state === "sending" ? "Sending…" : "Send request"}</span>
          <Send className="h-[18px] w-[18px]" />
        </button>
      </div>
    </form>
  );
}
