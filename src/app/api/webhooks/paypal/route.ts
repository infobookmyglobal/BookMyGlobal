import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPayPalWebhook } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Reject anything PayPal did not sign (fails closed when PAYPAL_WEBHOOK_ID is missing).
  if (!(await verifyPayPalWebhook(req.headers, rawBody))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  const event = JSON.parse(rawBody);
  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
    if (orderId) {
      const dbPayment = await prisma.payment.findFirst({
        where: { providerOrderId: orderId },
        include: { application: true },
      });
      if (dbPayment) {
        await prisma.payment.update({
          where: { id: dbPayment.id },
          data: { status: 'COMPLETED' },
        });

        if (dbPayment.application.couponCode) {
          const coupon = await prisma.coupon.findUnique({
            where: { code: dbPayment.application.couponCode },
          });
          if (coupon?.partnerId) {
            const commissionAmount = (dbPayment.amount * coupon.commissionRate) / 100;
            // paymentId is unique, so retries of the same webhook stay idempotent
            await prisma.commission.upsert({
              where: { paymentId: dbPayment.id },
              update: {},
              create: {
                partnerId: coupon.partnerId,
                paymentId: dbPayment.id,
                amount: commissionAmount,
                status: 'PENDING',
              },
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
