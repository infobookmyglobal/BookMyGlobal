import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: parsed.data,
    create: {
      clerkId: userId,
      email: '',
      ...parsed.data,
    },
  });

  return NextResponse.json({ user });
}
