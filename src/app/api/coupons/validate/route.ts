import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon) return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
  if (!coupon.isActive) return NextResponse.json({ valid: false, error: 'Coupon is inactive' });
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return NextResponse.json({ valid: false, error: 'Coupon has expired' });
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' });
  }

  return NextResponse.json({
    valid: true,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    commissionRate: coupon.commissionRate,
  });
}
