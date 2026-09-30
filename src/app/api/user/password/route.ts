import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { password } = parsed.data;

  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, { password });
  } catch (clerkErr: any) {
    console.error("Clerk password update failed:", clerkErr);
    const errorMessage = clerkErr.errors?.[0]?.longMessage || clerkErr.errors?.[0]?.message || clerkErr.message || 'Failed to update password in identity service';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
