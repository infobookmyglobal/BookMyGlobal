"use client";

import { useState } from "react";

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
    return <p className="font-label-md text-on-tertiary-fixed-variant">Thanks, you are on the list.</p>;
  }
  return (
    <form onSubmit={submit} className="flex w-full items-center gap-3 md:w-auto">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        aria-label="Email address"
        className="w-full rounded-full bg-surface-container-lowest px-4 py-2.5 font-body-sm text-body-sm text-primary placeholder:text-outline focus:outline-none md:w-64"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="shrink-0 rounded-full bg-primary px-5 py-2.5 font-label-md text-on-primary transition-colors hover:bg-surface-tint disabled:opacity-60"
      >
        {state === "sending" ? "…" : "Subscribe"}
      </button>
      {state === "error" && <span className="text-error font-label-sm">Try again</span>}
    </form>
  );
}
