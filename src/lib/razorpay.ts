import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'mock_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
    });
  }
  return razorpayInstance;
}

export async function createOrder(
  amount: number,
  currency: string,
  receipt: string,
  notes?: Record<string, string>
) {
  // amount must be in paise for INR, cents for USD
  const order = await getRazorpay().orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
    ...(notes ? { notes } : {}),
  });
  return order;
}

export function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + '|' + paymentId;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mock_secret')
    .update(body)
    .digest('hex');
  return expected === signature;
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_secret')
    .update(rawBody)
    .digest('hex');
  return expected === signature;
}

const dummyRazorpay = {} as Razorpay;
export default dummyRazorpay;
