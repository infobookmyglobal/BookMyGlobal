import { prisma } from "@/lib/prisma";
import { CouponsClient } from "@/components/admin/CouponsClient";

export default async function AdminCouponsPage() {
  const [coupons, partners] = await Promise.all([
    prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { partner: { include: { user: true } } },
    }),
    prisma.partner.findMany({
      where: { isActive: true },
      include: { user: true },
    }),
  ]);

  return <CouponsClient coupons={coupons} partners={partners} />;
}
