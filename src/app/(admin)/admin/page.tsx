import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, DollarSign, Clock, Truck } from "lucide-react";
import { AdminDashboardTabs } from "@/components/admin/AdminDashboardTabs";

export default async function AdminDashboardOverview() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalApps,
    pendingReview,
    revenueTodayPayments,
    shippedToday,
    recentApps,
    pendingPartnerRequestsRaw,
  ] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { status: { in: ["UNDER_REVIEW", "PENDING"] } } }),
    prisma.payment.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: todayStart },
      },
      select: {
        amount: true,
        currency: true,
      },
    }),
    prisma.shipment.count({
      where: {
        dispatchedAt: { gte: todayStart },
      },
    }),
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { payment: true },
    }),
    prisma.partnerRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const { fetchRates } = await import("@/lib/currency");
  const rates = await fetchRates();

  const revenueToday = revenueTodayPayments.reduce((sum, pay) => {
    const rate = rates[pay.currency.toUpperCase()] || 1;
    return sum + (pay.amount / rate);
  }, 0);


  const pendingPartnerRequests = pendingPartnerRequestsRaw.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    address: r.address,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-navy to-blue rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-blue/10">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/5 blur-xl" />
        <div className="relative z-10 space-y-2">
          <span className="glass-pill inline-flex px-3 py-1 rounded-full uppercase tracking-wider text-[9px] text-white">
            Overview Panel
          </span>
          <h1 className="font-sora font-black text-2xl md:text-3xl">BookMyGlobal Control Center</h1>
          <p className="text-white/70 text-sm max-w-xl">
            Real-time insights, document approvals, shipping logistics, and SaaS integrations.
          </p>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Applications",
            value: totalApps,
            icon: FileText,
            color: "bg-blue/10 text-blue",
            href: "/admin/applications",
          },
          {
            label: "Revenue Today",
            value: `$${revenueToday.toFixed(2)}`,
            icon: DollarSign,
            color: "bg-green-100 text-green-700",
            href: "/admin/payments",
          },
          {
            label: "Pending Review",
            value: pendingReview,
            icon: Clock,
            color: "bg-yellow-100 text-yellow-700",
            href: "/admin/applications?status=UNDER_REVIEW",
          },
          {
            label: "Shipped Today",
            value: shippedToday,
            icon: Truck,
            color: "bg-purple-100 text-purple-700",
            href: "/admin/shipments",
          },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white border border-border-custom rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:border-blue hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted">{item.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="font-sora font-black text-2xl text-navy">{item.value}</div>
          </Link>
        ))}
      </div>

      {/* Action Hub & Recent Table */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Table / Tabs - Left 2 Columns */}
        <AdminDashboardTabs
          recentApps={recentApps.map((app) => ({
            id: app.id,
            fullName: app.fullName,
            email: app.email,
            productType: app.productType,
            status: app.status,
            finalAmount: app.finalAmount,
            currency: app.currency,
          }))}
          initialPendingPartnerRequests={pendingPartnerRequests}
        />

        {/* Action Panel - Right 1 Column */}
        <div className="space-y-4">
          <div className="bg-white border border-border-custom rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-sora font-black text-navy text-sm">Quick Actions</h3>
            <div className="grid gap-2">
              <Link
                href="/admin/applications?status=UNDER_REVIEW"
                className="w-full btn-secondary py-3 flex items-center justify-center gap-2 text-xs font-black"
              >
                <Clock className="w-4 h-4" /> Review Pending Applications
              </Link>
              <Link
                href="/admin/shipments"
                className="w-full border-2 border-border-custom hover:border-navy hover:bg-bg-custom rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-bold text-navy transition-all"
              >
                <Truck className="w-4 h-4" /> Track Shipments
              </Link>
            </div>
          </div>

          <div className="bg-white border border-border-custom rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-sora font-black text-navy text-sm">Compliance Note</h3>
            <p className="text-muted text-xs leading-relaxed">
              Review documents before approving: check that names match the passport and that every file is legible. Send a quote only once the request is complete, and never promise a visa or attestation outcome.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
