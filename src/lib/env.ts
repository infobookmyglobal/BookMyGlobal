// ─── lib/env.ts ───────────────────────────────────────────────────────────────
// Validates required environment variables at startup.
// Import this in server-side code (e.g., layout.tsx server component or API routes).

const REQUIRED_SERVER_VARS = [
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
];

const OPTIONAL_WARNINGS = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET_NAME',
  'AWS_CLOUDFRONT_DOMAIN',
  'RESEND_API_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'EXCHANGE_RATE_API_KEY',
  'SHIPGLOBAL_API_KEY',
];

export function validateEnv() {
  const missing: string[] = [];

  for (const key of REQUIRED_SERVER_VARS) {
    const val = process.env[key];
    if (!val || val.includes('REPLACE_WITH')) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `\n\n❌ Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nPlease add them to your .env file.\n`
    );
  }

  // Warn about optional but important vars
  for (const key of OPTIONAL_WARNINGS) {
    const val = process.env[key];
    if (!val || val.includes('REPLACE_WITH')) {
      console.warn(`⚠️  Optional env var not set: ${key} — related features will be disabled.`);
    }
  }
}

// Helper to get a required env var (throws if missing)
export function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}

// Helper to get optional env var with fallback
export function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}
