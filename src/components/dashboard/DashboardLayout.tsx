"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClerkUserButton } from "@/components/ClerkUserButton";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Truck,
  User,
  PlusCircle,
  X,
  Menu,
  Award,
} from "lucide-react";
import { useState } from "react";
import { useUser } from "@/lib/clerk";

const navLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/applications", label: "My Requests", icon: FileText },
  { href: "/dashboard/upload", label: "Upload Documents", icon: Upload },
  { href: "/dashboard/tracking", label: "Track Shipment", icon: Truck },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

interface SidebarProps {
  pathname: string;
  setSidebarOpen: (open: boolean) => void;
}

function Sidebar({ pathname, setSidebarOpen }: SidebarProps) {
  const { user } = useUser();
  const isPartner =
    user?.publicMetadata?.role === "partner" ||
    user?.publicMetadata?.role === "PARTNER";

  const links = [...navLinks];
  if (isPartner) {
    links.push({ href: "/partner", label: "Partner Program", icon: Award });
  }

  return (
    <aside className="flex flex-col h-full bg-navy text-white">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-navy font-sora font-black text-xs">
            BMG
          </div>
          <span className="font-sora font-black text-sm leading-tight">
            BookMy<br />Global
          </span>
        </Link>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
              <ClerkUserButton />
        <div className="min-w-0">
          <p className="text-xs font-bold text-white/60">Signed in</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                active ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Apply CTA */}
      <div className="px-4 pb-5">
        <Link
          href="/apply"
          className="flex items-center justify-center gap-2 w-full bg-gold hover:bg-gold/90 text-navy font-black text-sm py-3 rounded-xl transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> New request
        </Link>
      </div>
    </aside>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  const isPartner =
    user?.publicMetadata?.role === "partner" ||
    user?.publicMetadata?.role === "PARTNER";

  const links = [...navLinks];
  if (isPartner) {
    links.push({ href: "/partner", label: "Partner Program", icon: Award });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-custom">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-60 md:flex-shrink-0 flex-col">
        <Sidebar pathname={pathname} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-60 flex-shrink-0 flex flex-col shadow-2xl">
            <Sidebar pathname={pathname} setSidebarOpen={setSidebarOpen} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-border-custom px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-muted hover:text-navy">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-sora font-black text-navy text-sm hidden md:block">
            {links.find((l) => l.href === pathname)?.label ?? "Dashboard"}
          </span>
          <div className="flex items-center gap-3">
            <Link href="/apply" className="text-xs font-bold text-blue hover:underline flex items-center gap-1">
              <PlusCircle className="w-4 h-4" /> New request
            </Link>
            <div className="md:hidden">
                    <ClerkUserButton />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
