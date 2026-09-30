import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PayPanel } from "@/components/dashboard/PayPanel";

export const metadata = { title: "Pay — BookMyGlobal" };

const SERVICE_LABEL: Record<string, string> = {
  VISA: "Visa assistance",
  ATTESTATION: "Document attestation",
};

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="max-w-xl bg-white border border-border-custom rounded-2xl p-8 text-center space-y-3">
      <h1 className="font-sora font-black text-navy text-xl">{title}</h1>
      <p className="text-muted text-sm">{body}</p>
      <Link href="/dashboard/applications" className="btn-primary inline-block px-6 py-2.5 text-sm">
        Back to my requests
      </Link>
    </div>
  );
}

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  const app = user ? await prisma.application.findUnique({ where: { id }, include: { payment: true } }) : null;

  if (!user || !app || app.userId !== user.id) {
    return <Notice title="Request not found" body="We couldn't find that request on your account." />;
  }
  if (app.payment?.status === "COMPLETED") {
    return <Notice title="Already paid" body="This request has been paid. Thank you! We'll keep you updated." />;
  }
  if (app.status === "REJECTED") {
    return <Notice title="No payment due" body="This request couldn't be taken forward, so there's nothing to pay." />;
  }
  if (!(app.baseAmount > 0)) {
    return <Notice title="Fee not quoted yet" body="We'll email you as soon as we've reviewed your request and quoted a fee." />;
  }

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <h1 className="font-sora font-black text-navy text-2xl">Pay for your request</h1>
        <p className="text-muted text-sm mt-1">
          #{app.id.slice(-8).toUpperCase()} · {SERVICE_LABEL[app.productType] || app.productType}
        </p>
      </div>
      <PayPanel
        applicationId={app.id}
        serviceLabel={SERVICE_LABEL[app.productType] || app.productType}
        currency={app.currency.toUpperCase()}
        baseAmount={app.baseAmount}
        customerName={app.fullName}
        customerEmail={app.email}
        customerPhone={app.phone}
        razorpayEnabled={!!process.env.RAZORPAY_KEY_ID}
        stripePublishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null}
        paypalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || null}
      />
    </div>
  );
}
