import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { getPayable, recordPayment, toMinorUnits } from "@/lib/payments";

const schema = z.object({
  applicationId: z.string().min(1),
  paymentIntentId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { applicationId, paymentIntentId } = parsed.data;

  // Ask Stripe, don't trust the browser.
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== "succeeded") {
    return NextResponse.json({ error: "Payment has not completed" }, { status: 400 });
  }
  if (intent.metadata?.applicationId !== applicationId) {
    return NextResponse.json({ error: "Payment does not belong to this request" }, { status: 400 });
  }

  const payable = await getPayable(applicationId, intent.metadata?.couponCode || undefined);
  if (!payable.ok) {
    if (payable.status === 409) return NextResponse.json({ success: true, applicationId, alreadyProcessed: true });
    return NextResponse.json({ error: payable.error }, { status: payable.status });
  }
  const { quote } = payable;
  if (
    intent.amount_received !== toMinorUnits(quote.finalAmount, quote.currency) ||
    intent.currency.toUpperCase() !== quote.currency
  ) {
    return NextResponse.json({ error: "Paid amount does not match the quoted fee" }, { status: 400 });
  }

  const result = await recordPayment({
    applicationId,
    provider: "STRIPE",
    providerPaymentId: intent.id,
    providerOrderId: intent.id,
    amount: quote.finalAmount,
    currency: quote.currency,
    couponCode: quote.couponCode,
    discountAmount: quote.discountAmount,
  });
  return NextResponse.json({ success: true, applicationId, alreadyProcessed: result.alreadyProcessed });
}
