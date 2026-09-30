/**
 * Server-side payment helpers shared by the Razorpay, Stripe and PayPal routes.
 *
 * Payments in BookMyGlobal are ALWAYS made against an existing Application whose fee
 * (`baseAmount`) was quoted by an admin. The amount charged is computed here, on the
 * server, from the database. Nothing about the price is ever taken from the client.
 */
import { auth } from "@clerk/nextjs/server";
import type { Application, Coupon, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type Quote = {
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  couponCode: string | null;
};

type Ok = { ok: true; user: User; application: Application; quote: Quote };
type Fail = { ok: false; status: number; error: string };

const ZERO_DECIMAL = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

/** Smallest currency unit multiplier (paise / cents / whole yen). */
export function toMinorUnits(amount: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? Math.round(amount) : Math.round(amount * 100);
}

export function validateCoupon(coupon: Coupon | null): string | null {
  if (!coupon) return "Invalid coupon code";
  if (!coupon.isActive) return "Coupon is inactive";
  if (coupon.expiresAt && new Date() > coupon.expiresAt) return "Coupon has expired";
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return "Coupon usage limit reached";
  return null;
}

export function priceWithCoupon(baseAmount: number, coupon: Coupon | null): { discount: number; final: number } {
  if (!coupon) return { discount: 0, final: baseAmount };
  const raw = coupon.discountType === "PERCENT" ? (baseAmount * coupon.discountValue) / 100 : coupon.discountValue;
  const discount = Math.min(baseAmount, Math.max(0, Math.round(raw * 100) / 100));
  return { discount, final: Math.round((baseAmount - discount) * 100) / 100 };
}

/**
 * Loads the signed-in customer's application and computes what they owe.
 * Fails if the caller is not the owner, the fee has not been quoted yet, the
 * request was rejected, or it has already been paid.
 */
export async function getPayable(applicationId: string, couponCode?: string | null): Promise<Ok | Fail> {
  const { userId } = await auth();
  if (!userId) return { ok: false, status: 401, error: "Please sign in to pay." };

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return { ok: false, status: 404, error: "User not found." };

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { payment: true },
  });
  if (!application || application.userId !== user.id) {
    return { ok: false, status: 404, error: "Request not found." };
  }
  if (application.status === "REJECTED") {
    return { ok: false, status: 400, error: "This request was declined, so no payment is due." };
  }
  if (application.payment?.status === "COMPLETED") {
    return { ok: false, status: 409, error: "This request has already been paid." };
  }
  if (!(application.baseAmount > 0)) {
    return { ok: false, status: 400, error: "A fee has not been quoted for this request yet." };
  }

  let coupon: Coupon | null = null;
  const code = couponCode?.trim().toUpperCase();
  if (code) {
    coupon = await prisma.coupon.findUnique({ where: { code } });
    const err = validateCoupon(coupon);
    if (err) return { ok: false, status: 400, error: err };
  }

  const { discount, final } = priceWithCoupon(application.baseAmount, coupon);
  if (final <= 0) {
    return { ok: false, status: 400, error: "The discounted amount is zero. Please contact us to complete this request." };
  }

  return {
    ok: true,
    user,
    application,
    quote: {
      baseAmount: application.baseAmount,
      discountAmount: discount,
      finalAmount: final,
      currency: application.currency.toUpperCase(),
      couponCode: coupon ? coupon.code : null,
    },
  };
}

/**
 * Records a successful payment exactly once (idempotent on providerPaymentId and on the
 * one-payment-per-application rule), updates the application, redeems the coupon and
 * credits partner commission. Emails are best-effort.
 */
export async function recordPayment(args: {
  applicationId: string;
  provider: "RAZORPAY" | "STRIPE" | "PAYPAL";
  providerPaymentId: string;
  providerOrderId?: string | null;
  amount: number;
  currency: string;
  couponCode?: string | null;
  discountAmount?: number;
}): Promise<{ alreadyProcessed: boolean }> {
  const { applicationId, provider, providerPaymentId, providerOrderId, amount, currency } = args;

  const dup = await prisma.payment.findFirst({
    where: { OR: [{ providerPaymentId }, { applicationId }] },
    select: { id: true },
  });
  if (dup) return { alreadyProcessed: true };

  let payment;
  try {
    payment = await prisma.payment.create({
      data: {
        applicationId,
        provider,
        amount,
        currency,
        status: "COMPLETED",
        providerPaymentId,
        providerOrderId: providerOrderId ?? null,
      },
    });
  } catch (err: any) {
    // Unique violation from a concurrent duplicate submit
    if (err?.code === "P2002") return { alreadyProcessed: true };
    throw err;
  }

  const application = await prisma.application.update({
    where: { id: applicationId },
    data: {
      finalAmount: amount,
      discountAmount: args.discountAmount ?? 0,
      couponCode: args.couponCode ?? null,
    },
  });

  if (args.couponCode) {
    await prisma.coupon
      .update({ where: { code: args.couponCode }, data: { usedCount: { increment: 1 } } })
      .catch((e) => console.error("Coupon increment failed:", e));
    try {
      const { processReferralCommission } = await import("@/lib/referrals");
      await processReferralCommission(args.couponCode, payment.id, amount);
    } catch (e) {
      console.error("Referral processing failed:", e);
    }
  }

  try {
    const { sendEmail, paymentReceiptEmail, sendAdminPaymentNotificationEmail } = await import("@/lib/ses");
    await sendEmail(application.email, "Payment received — BookMyGlobal", paymentReceiptEmail(application, provider));
    await sendAdminPaymentNotificationEmail(application, provider);
  } catch (e) {
    console.error("Payment emails failed:", e);
  }

  return { alreadyProcessed: false };
}
