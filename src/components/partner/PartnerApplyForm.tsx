"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

const field =
  "w-full rounded-xl bg-surface-container px-4 py-3 font-body-md text-body-md text-primary placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-secondary transition-all";
const label = "font-eyebrow text-eyebrow uppercase tracking-wider text-on-surface-variant";

export function PartnerApplyForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/partner/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          address: fd.get("address"),
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
      <div className="space-y-space-sm py-space-lg text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-on-tertiary-container" />
        <h3 className="font-headline-sm text-headline-sm text-primary">Application received</h3>
        <p className="mx-auto max-w-sm font-body-md text-body-md text-on-surface-variant">
          Our team will review your details. If approved, we will email you login details for your partner dashboard.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-space-md">
      <div className="grid gap-space-md sm:grid-cols-2">
        <label className="block space-y-1.5"><span className={label}>Name / business</span>
          <input name="name" required maxLength={120} className={field} placeholder="Your name or agency" />
        </label>
        <label className="block space-y-1.5"><span className={label}>Phone</span>
          <input name="phone" required maxLength={30} inputMode="tel" className={field} placeholder="+91 98765 43210" />
        </label>
      </div>
      <label className="block space-y-1.5"><span className={label}>Email</span>
        <input name="email" type="email" required maxLength={160} className={field} placeholder="you@example.com" />
      </label>
      <label className="block space-y-1.5"><span className={label}>City and address</span>
        <textarea name="address" required rows={3} maxLength={400} className={`${field} resize-y`} placeholder="Where are you based?" />
      </label>
      {state === "error" && <p role="alert" className="font-body-sm text-body-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-7 py-3.5 font-label-md text-label-md text-on-secondary-container shadow-sm transition-all hover:bg-secondary-fixed disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Apply to become a partner"} <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
