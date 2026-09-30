import type { Metadata } from "next";
import Link from "next/link";
import { BadgePercent, LayoutDashboard, Ticket } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container, Eyebrow, PageHero } from "@/components/site/ui";
import { PartnerApplyForm } from "@/components/partner/PartnerApplyForm";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { getSeoMetadata } from "@/lib/seo";
import { renderEmphasis } from "@/lib/cms-text";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("partner-program");
}

const BENEFITS = [
  { icon: BadgePercent, title: "Earn commission", text: "Earn a percentage of the service fee on completed requests that come through your code." },
  { icon: Ticket, title: "Your own coupon code", text: "Give your audience a discount code. When they use it, the referral is credited to you." },
  { icon: LayoutDashboard, title: "A partner dashboard", text: "See your referrals, commission and payout status in one place." },
];

export default function PartnerProgramPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Partner programme", path: "/partner-program" }]} />
      <Header />
      <main>
        <PageHero
          eyebrow="Partner programme"
          title={renderEmphasis("Refer travellers, earn *together*.")}
          intro="For travel agents, consultants, creators and communities whose audience needs visas, attestation or trip bookings."
        />
        <section className="bg-surface pb-space-2xl">
          <Container className="grid gap-space-xl lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-space-md">
              <Eyebrow>Why partner with us</Eyebrow>
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex gap-space-md rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container text-secondary"><b.icon className="h-6 w-6" /></span>
                  <div>
                    <h2 className="font-title-md text-title-md text-primary">{b.title}</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">{b.text}</p>
                  </div>
                </div>
              ))}
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Every application is reviewed by our team. Commission rates are agreed on approval. Already a partner?{" "}
                <Link href="/sign-in" className="text-secondary underline">Sign in</Link>.
              </p>
            </div>
            <div className="rounded-3xl bg-surface-container-lowest p-space-lg shadow-xl md:p-space-xl">
              <h2 className="mb-space-md font-headline-sm text-headline-sm text-primary">Apply to join</h2>
              <PartnerApplyForm />
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
