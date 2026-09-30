import { prisma } from "./prisma";

export async function processReferralCommission(couponCode: string, paymentId: string, finalAmount: number) {
  try {
    // 1. Fetch Coupon with Partner details
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
      include: {
        partner: true,
      },
    });

    if (!coupon || !coupon.partnerId || !coupon.partner?.isActive) {
      return; // No affiliate coupon or partner is inactive
    }

    const partner = coupon.partner;
    
    // 2. Use the coupon's specific commissionRate, falling back to partner's base rate
    const rate = coupon.commissionRate > 0 ? coupon.commissionRate : partner.commissionRate;
    const commissionAmount = parseFloat(((finalAmount * rate) / 100).toFixed(2));

    // 3. Create the Commission record in a transaction
    await prisma.$transaction([
      // Create Commission record
      prisma.commission.create({
        data: {
          partnerId: partner.id,
          paymentId: paymentId,
          amount: commissionAmount,
          status: "PENDING",
        },
      }),
      // Increment referral count & earnings on Partner record
      prisma.partner.update({
        where: { id: partner.id },
        data: {
          totalReferrals: { increment: 1 },
          totalCommissionEarned: { increment: commissionAmount },
        },
      }),
    ]);

    console.log(`Successfully credited referral commission of ${commissionAmount} to Partner ${partner.id}`);
  } catch (error) {
    console.error("Failed to process referral commission:", error);
  }
}
