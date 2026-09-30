"use client";

import { OPEN_ADMIN_PREFIXES as allowedPrefixes } from "@/lib/admin-lock-prefixes";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { Lock, Eye, EyeOff, AlertCircle, X, ShieldAlert } from "lucide-react";


export function AdminLayoutShell({
  children,
  pendingCount,
  isUnlocked,
}: {
  children: React.ReactNode;
  pendingCount: number;
  /** Resolved on the server from a signed httpOnly cookie (see lib/admin-lock.ts). */
  isUnlocked: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Incorrect password. Please try again.");
        return;
      }
      setShowUnlockModal(false);
      setPassword("");
      setError("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const isLocked = !isUnlocked && !allowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  return (
    <div className="flex h-screen overflow-hidden bg-bg-custom font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0 flex-col">
        <AdminSidebar 
          setSidebarOpen={setSidebarOpen} 
          isUnlocked={isUnlocked} 
          onUnlockClick={() => setShowUnlockModal(true)} 
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 flex-shrink-0 flex flex-col shadow-2xl h-full">
            <AdminSidebar 
              setSidebarOpen={setSidebarOpen} 
              isUnlocked={isUnlocked} 
              onUnlockClick={() => setShowUnlockModal(true)} 
            />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader pendingCount={pendingCount} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          {isLocked ? (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 transform hover:shadow-2xl">
                {/* Header */}
                <div className="bg-navy py-6 px-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-transparent to-transparent" />
                  <div className="relative z-10 mx-auto w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6 text-gold" />
                  </div>
                  <h2 className="relative z-10 font-sora font-black text-white text-lg tracking-wide">
                    Section Locked
                  </h2>
                  <p className="relative z-10 text-xs text-white/60 mt-1 font-medium">
                    This section is restricted. Enter password to view.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleUnlock} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-wider text-navy/50 uppercase block">
                      Admin Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="Enter password"
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-navy placeholder:text-gray-400 focus:outline-none focus:border-gold transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold animate-pulse">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-navy hover:bg-navy-light text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                  >
                    {submitting ? "Checking..." : "Unlock Section"}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Global Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative">
            <button
              onClick={() => {
                setShowUnlockModal(false);
                setPassword("");
                setError("");
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-navy transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="bg-navy py-6 px-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-transparent to-transparent" />
              <div className="relative z-10 mx-auto w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-3">
                <ShieldAlert className="w-6 h-6 text-gold" />
              </div>
              <h2 className="relative z-10 font-sora font-black text-white text-lg tracking-wide">
                Unlock Administrator Console
              </h2>
              <p className="relative z-10 text-xs text-white/60 mt-1 font-medium">
                Enter credentials to enable restricted modules.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleUnlock} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-wider text-navy/50 uppercase block">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter password"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-navy placeholder:text-gray-400 focus:outline-none focus:border-gold transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-navy hover:bg-navy-light text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
              >
                Unlock Console
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
