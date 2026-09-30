import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { sendEmail } from '@/lib/ses';

// Clerk signs webhooks with Svix. Without verification anyone could POST here and
// use our Resend account as an open mail relay, so we fail closed.
export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const rawBody = await req.text();
  let payload: any;
  try {
    payload = new Webhook(secret).verify(rawBody, {
      'svix-id': req.headers.get('svix-id') ?? '',
      'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
      'svix-signature': req.headers.get('svix-signature') ?? '',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    // email.created fires when Clerk wants us to deliver an OTP / verification email
    if (payload?.type === 'email.created') {
      const data = payload?.data;
      const toEmail = data?.to_email_address;
      const subject = data?.subject || 'Your Verification Code';
      const body = data?.body || '';

      if (toEmail && body) {
        await sendEmail(toEmail, subject, body);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Clerk Webhook Error]:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
