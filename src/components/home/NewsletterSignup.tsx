"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "COMMUNITY",
          name: email.split("@")[0] || "Subscriber",
          email,
          message: "Please add me to the traveller circle updates.",
          meta: { source: "newsletter" },
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
        <CheckCircle2 className="h-4 w-4" />
        <span>You're subscribed to global travel updates!</span>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="flex w-full items-center gap-2 max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        aria-label="Email address"
        className="w-full h-12 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="press shrink-0 h-12 rounded-full bg-blue-600 px-6 text-sm font-bold text-white shadow-cta hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center gap-1.5"
      >
        <span>{state === "sending" ? "..." : "Subscribe"}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
      {state === "error" && <span className="text-red-500 text-xs font-semibold">Please try again</span>}
    </form>
  );
}
