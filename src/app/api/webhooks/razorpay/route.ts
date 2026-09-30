import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'payment.captured') {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id) {
      const dbPayment = await prisma.payment.findFirst({
        where: { providerOrderId: payment.order_id },
        include: { application: true },
      });

      if (dbPayment) {
        await prisma.payment.update({
          where: { id: dbPayment.id },
          data: { status: 'COMPLETED' },
        });

        // Check for partner commission via coupon
        if (dbPayment.application.couponCode) {
          const coupon = await prisma.coupon.findUnique({
            where: { code: dbPayment.application.couponCode },
          });
          if (coupon?.partnerId) {
            const commissionAmount = (dbPayment.amount * coupon.commissionRate) / 100;
            await prisma.commission.create({
              data: {
                partnerId: coupon.partnerId,
                paymentId: dbPayment.id,
                amount: commissionAmount,
                status: 'PENDING',
              },
            });
            await prisma.partner.update({
              where: { id: coupon.partnerId },
              data: {
                totalReferrals: { increment: 1 },
                totalCommissionEarned: { increment: commissionAmount },
              },
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
