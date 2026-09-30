import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { getPayable, toMinorUnits } from "@/lib/payments";

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
    const intent = await stripe.paymentIntents.create({
      amount: toMinorUnits(quote.finalAmount, quote.currency),
      currency: quote.currency.toLowerCase(),
      receipt_email: application.email,
      automatic_payment_methods: { enabled: true },
      metadata: {
        applicationId: application.id,
        couponCode: quote.couponCode ?? "",
        service: application.productType,
      },
    });
    return NextResponse.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id, quote });
  } catch (err: any) {
    console.error("Stripe create-intent error:", err);
    return NextResponse.json({ error: err?.message || "Could not start the payment" }, { status: 500 });
  }
}
