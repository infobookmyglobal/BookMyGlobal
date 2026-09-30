"use client";

import { OPEN_ADMIN_PREFIXES as allowedPrefixes } from "@/lib/admin-lock-prefixes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Truck,
  BookOpen,
  Layout,
  HelpCircle,
  Globe,
  Users,
  Handshake,
  Tag,
  Search,
  Image,
  Settings,
  MapPin,
  LayoutTemplate,
  Lock,
  Unlock,
  Inbox,
} from "lucide-react";

const sidebarSections = [
  {
    title: "OVERVIEW",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "APPLICATIONS",
    links: [
      { href: "/admin/applications", label: "All Applications", icon: FileText },
      { href: "/admin/applications?status=UNDER_REVIEW", label: "Pending Review", icon: Search },
    ],
  },
  {
    title: "ORDERS",
    links: [
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
      { href: "/admin/shipments", label: "Shipments", icon: Truck },
      { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
    ],
  },
  {
    title: "CONTENT",
    links: [
      { href: "/admin/blogs", label: "Blogs", icon: BookOpen },
      { href: "/admin/pages", label: "Pages", icon: Layout },
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/admin/site-edit", label: "Site Edit", icon: LayoutTemplate },
    ],
  },
  {
    title: "USERS",
    links: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/partners", label: "Partners", icon: Handshake },
    ],
  },
  {
    title: "SETTINGS",
    links: [
      { href: "/admin/coupons", label: "Coupons", icon: Tag },
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/sitemap", label: "Sitemap", icon: Globe },
      { href: "/admin/media", label: "Media Library", icon: Image },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];


interface AdminSidebarProps {
  setSidebarOpen?: (open: boolean) => void;
  isUnlocked: boolean;
  onUnlockClick?: () => void;
}

export function AdminSidebar({ 
  setSidebarOpen, 
  isUnlocked, 
  onUnlockClick 
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-navy text-white flex flex-col border-r border-white/10 shrink-0">
      {/* Brand logo */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-navy font-sora font-black text-sm shadow-md">
          BMG
        </div>
        <div>
          <span className="font-sora font-black text-sm leading-tight block text-white">
            BookMyGlobal Admin
          </span>
          <span className="text-[10px] font-bold text-white/50 block">
            Travel Platform CMS
          </span>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {sidebarSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-black tracking-wider text-white/40 uppercase">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const active = pathname === link.href;
                const isLocked = !isUnlocked && !allowedPrefixes.some(
                  (prefix) => link.href === prefix || link.href.startsWith(prefix + "/")
                );

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen?.(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${active
                        ? "bg-white/15 text-white shadow-sm shadow-white/5"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="w-4 h-4 shrink-0 text-white/60" />
                      <span>{link.label}</span>
                    </div>
                    {isLocked && (
                      <Lock className="w-3.5 h-3.5 shrink-0 text-white/30" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Lock Indicator */}
      <div className="p-4 border-t border-white/10 shrink-0">
        {isUnlocked ? (
          <button
            onClick={async () => {
              await fetch("/api/admin/unlock", { method: "DELETE" });
              window.location.reload();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 font-bold text-xs transition-all"
          >
            <Unlock className="w-4 h-4 shrink-0" />
            Console Unlocked
          </button>
        ) : (
          <button
            onClick={onUnlockClick}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 font-bold text-xs transition-all animate-pulse"
          >
            <Lock className="w-4 h-4 shrink-0" />
            Unlock Console
          </button>
        )}
      </div>
    </aside>
  );
}
