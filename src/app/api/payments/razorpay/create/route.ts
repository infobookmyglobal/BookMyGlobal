import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrder } from "@/lib/razorpay";
import { getPayable } from "@/lib/payments";

const schema = z.object({
  applicationId: z.string().min(1),
  couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const payable = await getPayable(parsed.data.applicationId, parsed.data.couponCode);
  if (!payable.ok) return NextResponse.json({ error: payable.error }, { status: payable.status });
  const { application, quote } = payable;

  try {
    // createOrder() takes the amount in major units and converts to minor units itself.
    // The notes bind the order to this application + coupon so /verify can trust it.
    const order = await createOrder(quote.finalAmount, quote.currency, `BMG-${application.id.slice(-10)}`, {
      applicationId: application.id,
      couponCode: quote.couponCode ?? "",
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      quote,
    });
  } catch (err: any) {
    console.error("[Razorpay] order creation failed:", err);
    return NextResponse.json(
      { error: err?.error?.description || err?.message || "Could not start the payment" },
      { status: 502 }
    );
  }
}
