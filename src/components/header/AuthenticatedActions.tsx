"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth, UserButton } from "@/lib/clerk";
import { LayoutDashboard, ChevronDown, UserRound, Briefcase } from "lucide-react";

/** Fetches the DB role (USER | PARTNER | ADMIN) for the signed-in user. */
function useRole(userId: string | null | undefined) {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetch("/api/user/me")
      .then((r) => (r.ok ? r.json() : { role: null }))
      .then((d) => !cancelled && setRole(d.role ?? null))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);
  return userId ? role : null;
}

function dashboardFor(role: string | null) {
  if (role === "ADMIN") return { href: "/admin", label: "Admin" };
  if (role === "PARTNER") return { href: "/partner", label: "Partner" };
  return { href: "/dashboard", label: "Dashboard" };
}

export function DesktopAuth() {
  const { userId } = useAuth();
  const role = useRole(userId);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!userId) {
    return (
      <div className="relative hidden sm:block" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 font-label-md text-label-md text-on-primary-container hover:text-on-primary transition-colors"
          aria-expanded={open}
        >
          Sign In
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-4 w-64 overflow-hidden rounded-2xl bg-surface-container-lowest text-left shadow-xl ring-1 ring-black/5">
            <Link href="/sign-in" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-primary"><UserRound className="h-4 w-4" /></span>
              <span>
                <span className="block font-title-md text-[0.95rem] text-primary">Traveller</span>
                <span className="block font-body-sm text-body-sm text-on-surface-variant">Your requests and bookings</span>
              </span>
            </Link>
            <Link href="/partner" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container/40 text-on-secondary-container"><Briefcase className="h-4 w-4" /></span>
              <span>
                <span className="block font-title-md text-[0.95rem] text-primary">Partner</span>
                <span className="block font-body-sm text-body-sm text-on-surface-variant">Referrals and earnings</span>
              </span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  const d = dashboardFor(role);
  return (
    <div className="hidden items-center gap-3 sm:flex">
      <Link href={d.href} className="flex items-center gap-1.5 font-label-md text-label-md text-on-primary-container hover:text-on-primary transition-colors">
        <LayoutDashboard className="h-4 w-4" />
        {d.label}
      </Link>
      <UserButton />
    </div>
  );
}

export function MobileAuth({ onCloseMobile }: { onCloseMobile: () => void }) {
  const { userId } = useAuth();
  const role = useRole(userId);
  const d = dashboardFor(role);
  const item = "flex items-center justify-between rounded-2xl bg-white/5 px-5 py-4 font-title-md text-on-primary";

  if (!userId) {
    return (
      <div className="grid gap-3">
        <Link href="/sign-in" onClick={onCloseMobile} className={item}>Sign in <UserRound className="h-5 w-5 opacity-60" /></Link>
        <Link href="/partner" onClick={onCloseMobile} className={item}>Partner sign in <Briefcase className="h-5 w-5 opacity-60" /></Link>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-5 py-4">
      <UserButton />
      <Link href={d.href} onClick={onCloseMobile} className="rounded-full bg-secondary-container px-4 py-2 font-label-md text-on-secondary-container">
        {d.label}
      </Link>
    </div>
  );
}
