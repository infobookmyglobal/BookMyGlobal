import type { Metadata } from "next";
import Link from "next/link";
import { BadgePercent, LayoutDashboard, Ticket, ArrowRight, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container, Eyebrow, PageHero, CtaBand } from "@/components/site/ui";
import { PartnerApplyForm } from "@/components/partner/PartnerApplyForm";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { getSeoMetadata } from "@/lib/seo";
import { renderEmphasis } from "@/lib/cms-text";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("partner-program");
}

const BENEFITS = [
  { icon: BadgePercent, title: "Earn commission", text: "Earn a percentage of the service fee on completed requests that come through your code." },
  { icon: Ticket, title: "Your own coupon code", text: "Give your audience a discount code. When they use it, the referral is credited to you." },
  { icon: LayoutDashboard, title: "A partner dashboard", text: "See your referrals, commission and payout status in one place." },
];

const DEFAULT_ELIGIBILITY = [
  "Travel agents and consultants",
  "Expat community organisers",
  "Creators and influencers in travel",
  "Educational consultants",
  "Yoga and wellness teachers",
];

export default async function PartnerProgramPage() {
  // Read commission rate from admin settings if available
  const commissionSetting = await prisma.setting.findUnique({ where: { key: "partner_commission_rate" } }).catch(() => null);
  const commissionRate = commissionSetting?.value || "10";

  return (
    <>
      <WebPageJsonLd
        name="Partner Programme | BookMyGlobal"
        description="Refer travellers to BookMyGlobal and earn commission on completed visa, attestation and travel bookings."
        urlPath="/partner-program"
      />
      <BreadcrumbJsonLd items={[{ name: "Partner programme", path: "/partner-program" }]} />
      <Header />
      <main>
        <PageHero
          eyebrow="Partner programme"
          title={renderEmphasis("Refer travellers, earn *together*.")}
          intro={`For travel agents, consultants, creators and communities whose audience needs visas, attestation or trip bookings. Earn up to ${commissionRate}% commission.`}
        />

        {/* Benefits grid */}
        <section className="bg-surface pb-space-2xl pt-space-xl">
          <Container className="grid gap-space-xl lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-space-md">
              <Eyebrow>Why partner with us</Eyebrow>
              <div className="space-y-4">
                {BENEFITS.map((b) => (
                  <div key={b.title} className="flex gap-4 rounded-2xl bg-surface-container-lowest p-4 sm:p-space-md shadow-sm">
                    <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-surface-container text-secondary">
                      <b.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <div>
                      <h2 className="font-title-md text-title-md text-primary">{b.title}</h2>
                      <p className="font-body-md text-body-md text-on-surface-variant">{b.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Who can apply */}
              <div className="rounded-2xl border border-slate-100 bg-blue-50/50 p-4 sm:p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Who can apply</h3>
                <ul className="space-y-2">
                  {DEFAULT_ELIGIBILITY.map((e) => (
                    <li key={e} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Every application is reviewed by our team. Commission rates are agreed on approval. Already a partner?{" "}
                <Link href="/sign-in" className="text-secondary underline">Sign in</Link>.
              </p>
            </div>

            {/* Apply form */}
            <div className="rounded-3xl bg-surface-container-lowest p-5 sm:p-space-lg shadow-xl md:p-space-xl">
              <h2 className="mb-space-md font-headline-sm text-headline-sm text-primary">Apply to join</h2>
              <PartnerApplyForm />
            </div>
          </Container>
        </section>

        <CtaBand
          title="Already a partner?"
          text="Sign in to your account to view your dashboard, commissions and coupon codes."
          href="/sign-in"
          cta="Sign in to partner portal"
        />
      </main>
      <Footer />
    </>
  );
}
