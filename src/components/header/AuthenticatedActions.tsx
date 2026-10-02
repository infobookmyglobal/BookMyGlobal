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
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className="press whitespace-nowrap px-3.5 py-2 text-[13.5px] font-semibold text-slate-700 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Log in
        </Link>
        <Link
          href="/sign-up"
          className="press inline-flex items-center whitespace-nowrap h-9 px-4 rounded-full bg-blue-600 text-white text-[13.5px] font-bold shadow-[0_4px_12px_rgba(0,102,255,0.28)] hover:bg-blue-700 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const d = dashboardFor(role);
  return (
    <div className="flex items-center gap-3">
      <Link
        href={d.href}
        className="press inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
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

  if (!userId) {
    return (
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Link
          href="/sign-in"
          onClick={onCloseMobile}
          className="flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          onClick={onCloseMobile}
          className="flex h-11 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
        >
          Sign up
        </Link>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200">
      <div className="flex items-center gap-3">
        <UserButton />
        <span className="text-sm font-semibold text-slate-800">My Account</span>
      </div>
      <Link
        href={d.href}
        onClick={onCloseMobile}
        className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
      >
        {d.label}
      </Link>
    </div>
  );
}
