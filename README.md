# BookMyGlobal

A travel platform for travellers from India: visa application assistance, MEA and embassy attestation, flights, hotels, tours, cruises, international bus travel, yoga retreats in Rishikesh and a traveller community.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Prisma 6 + PostgreSQL, Clerk, AWS S3 + CloudFront, Resend, Razorpay / Stripe / PayPal, ShipGlobal.

See **SETUP.md** to get running.

```bash
pnpm install
cp .env.example .env
pnpm prisma generate
pnpm prisma db push      # or: pnpm prisma migrate dev --name init
pnpm seed                # optional starter blog posts and FAQs
pnpm dev
```

## How it works

- **Public site** (`/`, `/services`, `/services/[slug]`, `/how-it-works`, `/about`, `/yoga-retreats`, `/community`, `/blog`, `/faqs`, `/contact`, `/partner-program`, legal pages). Bookings and general questions arrive as **Enquiries** (no login).
- **Requests** (visa assistance and attestation) need an account. The customer submits a request at `/apply` and uploads documents from the dashboard. An admin reviews it, sends a **quote**, the customer **pays** from the dashboard (Razorpay for INR, Stripe or PayPal otherwise), and the admin books a **courier** where documents go back to the customer.
- **Admin** (`/admin`): Dashboard, Applications, Payments, Shipments, Enquiries, Blogs, Pages, FAQs, Site Edit, Users, Partners, Coupons, SEO, Sitemap, Media, Settings.
- **Partners** apply at `/partner-program`; once approved they get a coupon code, a dashboard and commission tracking.

Payment amounts are always computed on the server from the admin's quote and a server-validated coupon. The browser is never trusted for the amount.
