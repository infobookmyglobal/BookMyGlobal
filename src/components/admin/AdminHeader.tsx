"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/lib/clerk";
import { ClerkUserButton } from "@/components/ClerkUserButton";
import { Bell, ChevronRight, Home, Menu } from "lucide-react";
import Link from "next/link";

interface AdminHeaderProps {
  pendingCount: number;
  onMenuClick?: () => void;
}

export function AdminHeader({ pendingCount, onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user } = useUser();

  // Simple breadcrumbs builder
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    return { href, label };
  });

  return (
    <header className="h-16 border-b border-border-custom bg-white px-4 md:px-6 flex items-center justify-between shrink-0">
      {/* Breadcrumbs / Title */}
      <div className="flex items-center gap-2">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-1.5 -ml-1 text-muted hover:text-navy hover:bg-bg-custom rounded-xl transition-all mr-1 cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>
        )}
        <div className="hidden sm:flex items-center gap-2">
          <Link href="/admin" className="text-muted hover:text-navy transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbs.map((bc, i) => (
            <div key={bc.href} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
              <Link
                href={bc.href}
                className={`text-xs font-bold transition-colors ${
                  i === breadcrumbs.length - 1
                    ? "text-navy pointer-events-none"
                    : "text-muted hover:text-navy"
                }`}
              >
                {bc.label}
              </Link>
            </div>
          ))}
        </div>
        <span className="sm:hidden font-sora font-black text-navy text-sm">
          {breadcrumbs[breadcrumbs.length - 1]?.label || "Admin"}
        </span>
      </div>

      {/* Action / Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <Link
          href="/admin/applications?status=UNDER_REVIEW"
          className="relative p-2 rounded-xl border border-border-custom hover:bg-bg-custom text-muted hover:text-navy transition-all"
        >
          <Bell className="w-4.5 h-4.5" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white">
              {pendingCount}
            </span>
          )}
        </Link>

        {/* User profile */}
        <div className="flex items-center gap-3 border-l border-border-custom pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-navy leading-none">
              {user?.fullName || "Admin User"}
            </p>
            <p className="text-[10px] font-bold text-muted mt-0.5">Administrator</p>
          </div>
          <ClerkUserButton />
        </div>
      </div>
    </header>
  );
}
