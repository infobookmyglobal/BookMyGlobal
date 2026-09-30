"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileCheck2, Stamp, Loader2 } from "lucide-react";

const field =
  "w-full rounded-xl bg-surface-container px-4 py-3 font-body-md text-body-md text-primary placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-secondary transition-all";
const label = "font-eyebrow text-eyebrow uppercase tracking-wider text-on-surface-variant";

const SERVICES = [
  { value: "VISA", title: "Visa assistance", body: "Help with the application, documents and appointment for a destination country.", Icon: FileCheck2 },
  { value: "ATTESTATION", title: "Document attestation", body: "MEA, apostille and embassy attestation for certificates and personal documents.", Icon: Stamp },
] as const;

interface Props {
  defaultService?: "VISA" | "ATTESTATION";
  defaults: { fullName: string; email: string; phone: string; country: string };
}

export function ServiceApplicationForm({ defaultService = "VISA", defaults }: Props) {
  const [service, setService] = useState<"VISA" | "ATTESTATION">(defaultService);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          fullName: fd.get("fullName"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          country: fd.get("country"),
          destinationCountry: fd.get("destinationCountry") || undefined,
          note: fd.get("note") || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setState("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="space-y-space-md py-space-lg text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-on-tertiary-container" />
        <h2 className="font-headline-md text-headline-md text-primary">Request received</h2>
        <p className="mx-auto max-w-md font-body-md text-body-md text-on-surface-variant">
          Thanks. We've emailed you a confirmation. Next, upload your documents so our team can start. We'll quote the
          fee before you pay anything.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 pt-space-sm sm:flex-row">
          <Link href="/dashboard/upload" className="rounded-full bg-primary-container px-6 py-3 font-title-md text-on-primary transition-all hover:opacity-90">
            Upload documents
          </Link>
          <Link href="/dashboard/applications" className="rounded-full bg-surface-container px-6 py-3 font-title-md text-primary transition-all hover:bg-surface-container-high">
            View my requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-space-lg">
      <fieldset className="space-y-space-sm">
        <legend className={label}>What do you need?</legend>
        <div className="grid gap-space-sm sm:grid-cols-2">
          {SERVICES.map(({ value, title, body, Icon }) => {
            const on = service === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setService(value)}
                aria-pressed={on}
                className={`flex gap-3 rounded-2xl border p-space-md text-left transition-all ${
                  on ? "border-secondary bg-secondary-container/20 shadow-md" : "border-outline-variant bg-surface-container-lowest hover:border-secondary"
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${on ? "bg-primary-container text-secondary-container" : "bg-surface-container text-secondary"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-title-md text-title-md text-primary">{title}</span>
                  <span className="mt-1 block font-body-md text-body-md text-on-surface-variant">{body}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-space-md sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="fullName" className={label}>Full name (as on your passport)</label>
          <input id="fullName" name="fullName" required minLength={2} defaultValue={defaults.fullName} className={field} autoComplete="name" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" required defaultValue={defaults.email} className={field} autoComplete="email" />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className={label}>Phone / WhatsApp</label>
          <input id="phone" name="phone" required minLength={7} defaultValue={defaults.phone} className={field} autoComplete="tel" />
        </div>
        <div className="space-y-2">
          <label htmlFor="country" className={label}>Country you live in</label>
          <input id="country" name="country" required minLength={2} defaultValue={defaults.country || "India"} className={field} autoComplete="country-name" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="destinationCountry" className={label}>
            {service === "VISA" ? "Which country are you travelling to?" : "Which country will the documents be used in?"}
          </label>
          <input id="destinationCountry" name="destinationCountry" className={field} placeholder="e.g. United Arab Emirates" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="note" className={label}>Anything we should know? (optional)</label>
          <textarea
            id="note"
            name="note"
            rows={4}
            maxLength={1500}
            className={`${field} resize-none`}
            placeholder={service === "VISA" ? "Purpose of travel, dates, number of travellers…" : "Which documents, and are you in a hurry?"}
          />
        </div>
      </div>

      {state === "error" && <p role="alert" className="font-body-md text-body-md text-error">{error}</p>}

      <div className="space-y-space-sm">
        <button
          type="submit"
          disabled={state === "sending"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-8 py-4 font-title-md text-on-primary transition-all hover:opacity-90 disabled:opacity-60"
        >
          {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />} Submit request
        </button>
        <p className="text-center font-label-sm text-label-sm text-on-surface-variant">
          No payment now. We review first and quote a fee. BookMyGlobal is a private assistance service, not a government
          body, and can't guarantee visa or attestation outcomes.
        </p>
      </div>
    </form>
  );
}
