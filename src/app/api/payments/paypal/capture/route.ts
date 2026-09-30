import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { captureOrder } from "@/lib/paypal";
import { getPayable, recordPayment } from "@/lib/payments";

const schema = z.object({
  applicationId: z.string().min(1),
  orderId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { applicationId, orderId } = parsed.data;

  let capture: any;
  try {
    capture = await captureOrder(orderId);
  } catch (err: any) {
    console.error("PayPal capture error:", err);
    return NextResponse.json({ error: "PayPal could not capture this payment" }, { status: 502 });
  }
  if (capture.status !== "COMPLETED") {
    return NextResponse.json({ error: "Payment has not completed" }, { status: 400 });
  }

  const unit = capture.purchase_units?.[0];
  const cap = unit?.payments?.captures?.[0];
  const [orderApplicationId, orderCoupon] = String(cap?.custom_id || unit?.custom_id || "").split("|");
  if (orderApplicationId !== applicationId) {
    return NextResponse.json({ error: "Payment does not belong to this request" }, { status: 400 });
  }

  const payable = await getPayable(applicationId, orderCoupon || undefined);
  if (!payable.ok) {
    if (payable.status === 409) return NextResponse.json({ success: true, applicationId, alreadyProcessed: true });
    return NextResponse.json({ error: payable.error }, { status: payable.status });
  }
  const { quote } = payable;
  const paid = Number(cap?.amount?.value);
  if (!(Math.abs(paid - quote.finalAmount) < 0.01) || cap?.amount?.currency_code !== quote.currency) {
    return NextResponse.json({ error: "Paid amount does not match the quoted fee" }, { status: 400 });
  }

  const result = await recordPayment({
    applicationId,
    provider: "PAYPAL",
    providerPaymentId: cap.id,
    providerOrderId: orderId,
    amount: quote.finalAmount,
    currency: quote.currency,
    couponCode: quote.couponCode,
    discountAmount: quote.discountAmount,
  });
  return NextResponse.json({ success: true, applicationId, alreadyProcessed: result.alreadyProcessed });
}
