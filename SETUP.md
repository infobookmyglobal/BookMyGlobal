# BookMyGlobal — Setup guide

Next.js 16, React 19, TypeScript, Tailwind v4, Prisma 6 + PostgreSQL, Clerk, AWS S3 + CloudFront, Resend, Stripe / Razorpay / PayPal, ShipGlobal. Use a dedicated AWS account, Clerk application and database for this project.

## 1. Install

```bash
pnpm install
cp .env.example .env      # then fill it in (steps below)
pnpm prisma generate
pnpm prisma migrate dev --name init   # creates the tables (or `pnpm prisma db push` for a quick start)
pnpm seed                             # optional: starter blog posts and FAQs
pnpm dev
```

## 2. PostgreSQL
Any Postgres 14+ (Neon, Supabase, RDS, local). Put the connection string in `DATABASE_URL`.

## 3. Clerk (new application)
1. https://dashboard.clerk.com → **Create application** → "BookMyGlobal". Enable Email + Google (or what you want).
2. Copy the publishable and secret keys into `.env`.
3. **Webhooks → Add endpoint**: `https://YOUR_DOMAIN/api/webhooks/clerk`, subscribe to `email.created`. Copy the *Signing secret* into `CLERK_WEBHOOK_SECRET`. (In Clerk → Customization → Emails, switch "Delivered by Clerk" off for the emails you want sent through Resend.)
4. Set `ADMIN_EMAIL` to your email. The first time you sign in with it you are auto-promoted to **ADMIN**. Backup route: `pnpm tsx scripts/make-admin.ts you@example.com`.

## 4. AWS (new account)
1. **S3**: create bucket `bookmyglobal-uploads` (region `ap-south-1`), *Block all public access* ON.
2. **CORS** on the bucket (needed for browser uploads via presigned URLs):
   ```json
   [{ "AllowedHeaders": ["*"], "AllowedMethods": ["PUT", "GET", "HEAD"],
      "AllowedOrigins": ["http://localhost:3000", "https://bookmyglobal.com", "https://www.bookmyglobal.com"],
      "ExposeHeaders": ["ETag"], "MaxAgeSeconds": 3000 }]
   ```
3. **CloudFront**: create a distribution with the bucket as origin using **Origin Access Control**; let CloudFront add the bucket-policy statement. Put the `xxxx.cloudfront.net` domain in `AWS_CLOUDFRONT_DOMAIN` and `NEXT_PUBLIC_CLOUDFRONT_DOMAIN`.
4. **IAM**: create a user with a policy limited to this bucket:
   ```json
   { "Version": "2012-10-17", "Statement": [{
     "Effect": "Allow",
     "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
     "Resource": "arn:aws:s3:::bookmyglobal-uploads/*" }] }
   ```
   Create an access key → `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`. Use keys that belong only to this project.

## 5. Email (Resend)
Email goes through **Resend** (not SES, despite the `lib/ses.ts` filename). Verify your sending domain at resend.com, create an API key, set `RESEND_API_KEY` and `EMAIL_FROM`.

## 6. Payments and shipping
Fill only the providers you will use.

| Provider | Use | Env vars | Webhook (all fail closed without their secret) |
|---|---|---|---|
| Razorpay | INR (UPI, cards, netbanking) | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | `/api/webhooks/razorpay` |
| Stripe | Cards, other currencies | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | `/api/webhooks/stripe` |
| PayPal | Other currencies | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`, `PAYPAL_WEBHOOK_ID` | `/api/webhooks/paypal` |
| ShipGlobal | Courier for returned documents | `SHIPGLOBAL_*` | `/api/webhooks/shipglobal` (`SHIPGLOBAL_WEBHOOK_SECRET`) |

**Payment flow.** The admin sets a fee on the request (Applications → review panel → Quote). The customer opens *Pay now* in their dashboard. The server works out the amount from that quote plus any valid coupon, creates the order or intent with that amount, and only marks the request paid after verifying the provider's response (Razorpay signature and amount, Stripe PaymentIntent, PayPal capture). Customers cannot change the amount.

## 7. Business details for the legal pages
The Terms, Privacy Policy, Refund Policy and Disclaimer ship as **drafts** in `src/config/legal.ts`. Have a lawyer review them before launch. Set `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_COMPANY_ADDRESS` and `NEXT_PUBLIC_GRIEVANCE_OFFICER` so they show your real details. To replace any of them with your own text, create an active page with the same slug (`terms`, `privacy`, `refunds`, `disclaimer`) in **Admin → Pages**.

## 8. Assets you must supply
- `public/logo.png` (used in structured data) and `public/og-home.jpg` (1200 × 630 share image)
- Your own photography. The homepage and retreat pages currently use placeholder image URLs from the design tool; change them in `src/config/images.ts`. Every image has a gradient fallback.

## 9. Admin panel
Visit `/admin`. Sections: Dashboard, Applications, Payments, Shipments, Enquiries, Blogs, Pages, FAQs, Site Edit, Users, Partners, Coupons, SEO, Sitemap, Media, Settings. Sensitive sections stay locked until you enter `ADMIN_UNLOCK_PASSWORD` (verified server-side, 12 h cookie).

## Security notes
- The unlock password is verified on the server and stored in env, not in client code.
- No passwords are stored or shown to admins.
- No development auth bypass anywhere; no hard-coded admin email.
- Webhooks (Clerk, Stripe, Razorpay, PayPal, ShipGlobal) reject unsigned requests.
- Payment amounts are computed server-side. Customers can edit only a whitelist of fields, and only while their request is pending or under review.
- Uploads require sign-in, and each file key is bound to the request it belongs to.
