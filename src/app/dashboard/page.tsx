import { WHATSAPP_URL } from "@/lib/contact";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  FileText,
  Clock,
  CheckCircle,
  Upload,
  ArrowRight,
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PackageCheck,
  Pencil,
  UserCircle2,
  PartyPopper,
  Info,
} from "lucide-react";

// ── Notification builder (server-side, derived from application data) ─────────
type Notification = {
  id: string;
  type: "success" | "warning" | "error" | "info" | "action";
  icon: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  time: string;
};

const SERVICE_LABEL: Record<string, string> = {
  VISA: "Visa assistance",
  ATTESTATION: "Document attestation",
};

function buildNotifications(user: any, apps: any[]): Notification[] {
  const notes: Notification[] = [];

  if (!user?.name || !user?.phone || !user?.country) {
    notes.push({
      id: "profile-incomplete",
      type: "action",
      icon: "👤",
      title: "Complete your profile",
      body: "Add your name, phone and country so we can reach you quickly about your requests.",
      cta: { label: "Fill in details →", href: "/dashboard/profile" },
      time: "Pending",
    });
  }

  for (const app of apps) {
    const shortId = `#${app.id.slice(-8).toUpperCase()}`;
    const product = SERVICE_LABEL[app.productType] || app.productType;
    const timeStr = new Date(app.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const paid = app.payment?.status === "COMPLETED";

    if (app.status === "PENDING" && !app.passportUrl) {
      notes.push({
        id: `docs-${app.id}`,
        type: "action",
        icon: "📎",
        title: `Upload your documents — ${product}`,
        body: `We've received request ${shortId}. Please upload your documents so we can start.`,
        cta: { label: "Upload documents →", href: "/dashboard/upload" },
        time: timeStr,
      });
    }

    if (app.status === "PENDING" && app.passportUrl) {
      notes.push({
        id: `docs-received-${app.id}`,
        type: "info",
        icon: "📋",
        title: `Documents received — ${product}`,
        body: `We have your documents for ${shortId}. Submit them for review from the upload page when you're ready.`,
        cta: { label: "Review & submit →", href: "/dashboard/upload" },
        time: timeStr,
      });
    }

    if (app.status === "UNDER_REVIEW") {
      notes.push({
        id: `review-${app.id}`,
        type: "info",
        icon: "🔍",
        title: `Under review — ${product}`,
        body: `Our team is reviewing ${shortId}. We'll email you if we need anything else.`,
        time: timeStr,
      });
    }

    if (app.baseAmount > 0 && !paid && app.status !== "REJECTED") {
      notes.push({
        id: `pay-${app.id}`,
        type: "action",
        icon: "💳",
        title: `Fee ready — ${product}`,
        body: `Your fee for ${shortId} is ${app.currency} ${Number(app.baseAmount).toLocaleString("en-IN")}. Pay securely to get started.`,
        cta: { label: "Pay now →", href: `/dashboard/applications/${app.id}/pay` },
        time: timeStr,
      });
    }

    if (app.status === "APPROVED") {
      notes.push({
        id: `approved-${app.id}`,
        type: "success",
        icon: "✅",
        title: `Confirmed — ${product}`,
        body: `Request ${shortId} has been approved and is being worked on.`,
        time: timeStr,
      });
    }

    if (app.status === "REJECTED") {
      notes.push({
        id: `rejected-${app.id}`,
        type: "error",
        icon: "❌",
        title: `Not able to proceed — ${product}`,
        body: app.rejectionReason
          ? `Request ${shortId} could not be taken forward: "${app.rejectionReason}".`
          : `Request ${shortId} could not be taken forward. Contact us for details.`,
        cta: { label: "Chat on WhatsApp →", href: WHATSAPP_URL },
        time: timeStr,
      });
    }

    if (app.status === "COMPLETED") {
      notes.push({
        id: `done-${app.id}`,
        type: "success",
        icon: "📦",
        title: `Completed — ${shortId}`,
        body: app.shipment
          ? "Your documents are on their way. Track the shipment from your dashboard."
          : "This request is complete.",
        cta: app.shipment ? { label: "Track shipment →", href: "/dashboard/tracking" } : undefined,
        time: timeStr,
      });
    }
  }

  if (apps.length === 0) {
    notes.push({
      id: "no-apps",
      type: "info",
      icon: "🧭",
      title: "Start your first request",
      body: "Tell us whether you need visa help or document attestation and we'll take it from there.",
      cta: { label: "Start a request →", href: "/apply" },
      time: "Now",
    });
  }

  return notes;
}

// ── Badge colours ─────────────────────────────────────────────────────────────
const TYPE_STYLES: Record<
  string,
  { bar: string; bg: string; badge: string; badgeText: string }
> = {
  success: {
    bar: "bg-green-500",
    bg: "bg-green-50 border-green-100",
    badge: "bg-green-100",
    badgeText: "text-green-700",
  },
  warning: {
    bar: "bg-amber-400",
    bg: "bg-amber-50 border-amber-100",
    badge: "bg-amber-100",
    badgeText: "text-amber-700",
  },
  error: {
    bar: "bg-red-500",
    bg: "bg-red-50 border-red-100",
    badge: "bg-red-100",
    badgeText: "text-red-700",
  },
  info: {
    bar: "bg-blue",
    bg: "bg-blue/5 border-blue/10",
    badge: "bg-blue/10",
    badgeText: "text-blue",
  },
  action: {
    bar: "bg-navy",
    bg: "bg-navy/5 border-navy/10",
    badge: "bg-navy/10",
    badgeText: "text-navy",
  },
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default async function DashboardOverview() {
  const { userId } = await auth();
  const clerkUser = await currentUser();
  const user = await prisma.user.findUnique({
    where: { clerkId: userId! },
    include: { applications: { orderBy: { updatedAt: "desc" }, include: { payment: true, shipment: true } } },
  });

  const apps = user?.applications ?? [];
  const stats = {
    total: apps.length,
    pending: apps.filter((a) => a.status === "PENDING").length,
    approved: apps.filter((a) => a.status === "APPROVED").length,
    needsDocs: apps.filter((a) => a.status === "PENDING" && !a.passportUrl).length,
  };

  const firstName = clerkUser?.firstName || user?.name?.split(" ")[0] || "there";
  const notifications = buildNotifications(user, apps);
  const actionCount = notifications.filter((n) => n.type === "action").length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-navy to-blue rounded-2xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-sora font-black text-2xl mb-1">Welcome back, {firstName}! 👋</h1>
          <p className="text-white/70 text-sm">Track your requests, upload documents and pay securely from here.</p>
        </div>
        {actionCount > 0 && (
          <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-4 py-2">
            <Bell className="w-4 h-4 text-gold" />
            <span className="text-white font-black text-sm">
              {actionCount} action{actionCount > 1 ? "s" : ""} required
            </span>
          </div>
        )}
      </div>

      {/* Notification Panel */}
      {notifications.length > 0 && (
        <div className="bg-white border border-border-custom rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border-custom flex items-center gap-2">
            <Bell className="w-4 h-4 text-navy" />
            <h2 className="font-sora font-black text-navy">Notifications</h2>
            {actionCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {actionCount} action{actionCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="divide-y divide-border-custom">
            {notifications.map((n) => {
              const styles = TYPE_STYLES[n.type] ?? TYPE_STYLES.info;
              return (
                <div
                  key={n.id}
                  className={`flex gap-4 px-5 py-4 border-l-4 ${styles.bar.replace("bg-", "border-l-[--tw-border]")} relative`}
                  style={{ borderLeftColor: "" }}
                >
                  {/* Coloured left accent */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${styles.bar}`} />

                  <div className="pl-3 flex gap-4 w-full">
                    {/* Icon bubble */}
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ${styles.badge}`}>
                      {n.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className={`font-sora font-black text-sm ${styles.badgeText}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-muted font-bold shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-muted font-bold mt-1 leading-relaxed">{n.body}</p>
                      {n.cta && (
                        <Link
                          href={n.cta.href}
                          className={`inline-block mt-2.5 text-[11px] font-black px-3 py-1.5 rounded-lg transition-all ${styles.badge} ${styles.badgeText} hover:opacity-80`}
                        >
                          {n.cta.label}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total requests", value: stats.total, icon: FileText, color: "bg-blue/10 text-blue" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "bg-yellow-100 text-yellow-700" },
          { label: "Approved", value: stats.approved, icon: CheckCircle, color: "bg-green-100 text-green-700" },
          { label: "Need Documents", value: stats.needsDocs, icon: Upload, color: "bg-red-100 text-red-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-border-custom rounded-2xl p-5 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-sora font-black text-2xl text-navy">{value}</div>
              <div className="text-xs text-muted font-bold">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      {apps.length > 0 ? (
        <div className="bg-white border border-border-custom rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border-custom flex items-center justify-between">
            <h2 className="font-sora font-black text-navy">Recent requests</h2>
            <Link href="/dashboard/applications" className="text-blue text-xs font-bold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border-custom">
            {apps.slice(0, 3).map((app) => (
              <div key={app.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-navy text-sm">
                    {SERVICE_LABEL[app.productType] || app.productType}{app.destinationCountry ? ` → ${app.destinationCountry}` : ""}
                  </p>
                  <p className="text-xs text-muted">{new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-border-custom rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">🧭</div>
          <h3 className="font-sora font-black text-navy text-lg mb-2">No requests yet</h3>
          <p className="text-muted text-sm mb-5">Start a visa or attestation request and we'll guide you through it.</p>
          <Link href="/apply" className="btn-primary px-8 py-3">Start a request →</Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { href: "/apply", icon: "🧭", title: "New request", desc: "Visa help or attestation" },
          { href: "/dashboard/upload", icon: "📎", title: "Upload documents", desc: "Submit your documents" },
          { href: "/dashboard/tracking", icon: "📦", title: "Track shipment", desc: "Follow your returned documents" },
        ].map(({ href, icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white border border-border-custom rounded-2xl p-5 hover:border-blue hover:shadow-md transition-all flex items-center gap-4"
          >
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="font-sora font-black text-navy">{title}</p>
              <p className="text-xs text-muted">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
