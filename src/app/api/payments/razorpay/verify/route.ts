import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRazorpay, verifySignature } from "@/lib/razorpay";
import { getPayable, recordPayment, toMinorUnits } from "@/lib/payments";

const schema = z.object({
  applicationId: z.string().min(1),
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
  couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { applicationId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = parsed.data;

  if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // Re-price on the server and make sure the paid order matches what we quoted.
  const order = await getRazorpay().orders.fetch(razorpay_order_id);
  const notes = (order.notes || {}) as Record<string, string>;
  if (notes.applicationId !== applicationId) {
    return NextResponse.json({ error: "Order does not belong to this request" }, { status: 400 });
  }
  const payable = await getPayable(applicationId, notes.couponCode || undefined);
  if (!payable.ok) {
    // Already paid (e.g. a retry) is not an error for the customer.
    if (payable.status === 409) return NextResponse.json({ success: true, applicationId, alreadyProcessed: true });
    return NextResponse.json({ error: payable.error }, { status: payable.status });
  }
  const { quote } = payable;
  if (Number(order.amount) !== toMinorUnits(quote.finalAmount, quote.currency) || order.currency !== quote.currency) {
    return NextResponse.json({ error: "Paid amount does not match the quoted fee" }, { status: 400 });
  }

  const result = await recordPayment({
    applicationId,
    provider: "RAZORPAY",
    providerPaymentId: razorpay_payment_id,
    providerOrderId: razorpay_order_id,
    amount: quote.finalAmount,
    currency: quote.currency,
    couponCode: quote.couponCode,
    discountAmount: quote.discountAmount,
  });
  return NextResponse.json({ success: true, applicationId, alreadyProcessed: result.alreadyProcessed });
}
