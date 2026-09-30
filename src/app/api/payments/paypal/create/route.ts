import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrder } from "@/lib/paypal";
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
    // custom_id carries "<applicationId>|<couponCode>" so /capture can re-verify it.
    const order = await createOrder(quote.finalAmount, quote.currency, `${application.id}|${quote.couponCode ?? ""}`);
    return NextResponse.json({ orderId: order.id, quote });
  } catch (err: any) {
    console.error("PayPal create error:", err);
    return NextResponse.json({ error: err?.message || "Could not start the payment" }, { status: 502 });
  }
}
