import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { format } from "date-fns";
import { Award, DollarSign, Clock, CheckCircle, Gift, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PartnerDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      partner: {
        include: {
          coupons: true,
          commissions: true,
        },
      },
    },
  });

  if (!user || user.role !== "PARTNER" || !user.partner) {
    redirect("/dashboard");
  }

  const partner = user.partner;

  // Dynamically calculate pending payouts from commissions relation
  const pendingPayout = partner.commissions
    .filter((c) => c.status === "PENDING")
    .reduce((sum, c) => sum + c.amount, 0);

  const paidPayout = partner.commissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-bg-custom font-bold text-xs text-navy">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-10 w-full flex-1 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-sora font-black text-navy text-3xl font-black">Partner Portal</h1>
            <p className="text-muted text-xs">Monitor referral code clicks, conversions, and monthly payouts.</p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 border border-border-custom bg-white hover:bg-bg-custom rounded-xl transition-all font-black text-navy text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-border-custom rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-blue/10 rounded-2xl flex items-center justify-center text-blue shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-muted font-black">Total Conversions</h3>
              <p className="font-sora font-black text-2xl text-navy leading-none mt-1">{partner.totalReferrals} Orders</p>
            </div>
          </div>

          <div className="bg-white border border-border-custom rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-700 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-muted font-black">Total Earned</h3>
              <p className="font-sora font-black text-2xl text-green-700 leading-none mt-1">${partner.totalCommissionEarned.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white border border-border-custom rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-muted font-black">Pending payout</h3>
              <p className="font-sora font-black text-2xl text-amber-700 leading-none mt-1">${pendingPayout.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Coupon cards - left */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white border border-border-custom rounded-3xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-border-custom flex items-center gap-2 bg-navy text-white">
                <Gift className="w-4.5 h-4.5 text-gold shrink-0" />
                <h2 className="font-sora font-black text-xs uppercase tracking-wider">Your Promo Codes</h2>
              </div>
              <div className="p-5 space-y-4">
                {partner.coupons.length > 0 ? (
                  partner.coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="bg-bg-custom/50 border border-border-custom rounded-2xl p-4 space-y-2 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-blue text-sm tracking-wider">
                          {coupon.code}
                        </span>
                        <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                          {coupon.discountType === "PERCENT" ? `${coupon.discountValue}% Off` : `$${coupon.discountValue} Off`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted font-bold pt-1.5 border-t border-border-custom/50">
                        <span>Uses: {coupon.usedCount}</span>
                        <span>Comm. Rate: {coupon.commissionRate || partner.commissionRate}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-4">No active coupon codes issued.</p>
                )}
              </div>
            </div>
          </div>

          {/* Commission history table - right */}
          <div className="md:col-span-2 bg-white border border-border-custom rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between">
              <h2 className="font-sora font-black text-navy text-sm uppercase tracking-wider">Commission ledger</h2>
              <span className="text-[10px] text-muted">Showing all conversions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-bg-custom/60 text-muted text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Transaction Date</th>
                    <th className="px-6 py-3">Conversion Payout</th>
                    <th className="px-6 py-3">Payout Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom">
                  {partner.commissions.map((comm) => (
                    <tr key={comm.id} className="hover:bg-bg-custom/30 transition-colors">
                      <td className="px-6 py-4 text-muted font-bold">
                        {format(new Date(comm.createdAt), "MMM dd, yyyy · hh:mm a")}
                      </td>
                      <td className="px-6 py-4 font-black text-green-700">
                        +${comm.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          comm.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {comm.status === "PAID" ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Paid
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> Pending
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {partner.commissions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-12 text-muted font-bold">
                        No commission transactions recorded yet. Share your promo code to start!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
