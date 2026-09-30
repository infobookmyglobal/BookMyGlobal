import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaBand, Container, PageHero } from "@/components/site/ui";
import { HomeFaq } from "@/components/home/HomeFaq";
import { FaqJsonLd } from "@/components/JsonLd";
import { prisma } from "@/lib/prisma";
import { getSeoMetadata } from "@/lib/seo";
import { renderEmphasis } from "@/lib/cms-text";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("faqs");
}

const DEFAULT_FAQS = [
  {
    q: "Who runs the yoga retreats?",
    a: "BookMyGlobal runs the Rishikesh retreats directly. They are not resold from another provider. That means one unified team coordinates your journey from intake to your final morning practice along the Ganges.",
  },
  {
    q: "Is attestation only for Indian citizens?",
    a: "Our MEA apostille and embassy legalisation services are specifically designed for documents issued in India (educational degrees, marriage/birth certificates, commercial resolutions). Tell us your destination and we will confirm the exact authentication protocol.",
  },
  {
    q: "How do your visa assistance services work?",
    a: "We review your eligibility, generate a tailored document checklist, verify all application forms for errors, guide you through consulate appointment scheduling, and provide continuous status updates until your decision is returned.",
  },
  {
    q: "Can I manage multiple services under one account?",
    a: "Yes! Your BookMyGlobal account keeps all your visas, attested documents, flight tickets, hotel vouchers, and retreat schedules organized securely in one encrypted dashboard.",
  },
  {
    q: "When do I pay for my visa or attestation request?",
    a: "After our case officers have reviewed your initial request and provided a crystal-clear, transparent quote. You approve the quote from your dashboard before any payment is collected.",
  },
  {
    q: "Are government and consular fees included?",
    a: "Official fees are determined by sovereign authorities and diplomatic missions and are separate from our service fees. We outline all official charges up front with zero surprise markups.",
  },
];

export default async function FaqsPage() {
  const rows = await prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }).catch(() => []);
  const dbItems = rows.map((f) => ({ q: f.question, a: f.answer }));
  const items = dbItems.length > 0 ? dbItems : DEFAULT_FAQS;

  return (
    <>
      <Header />
      <main className="bg-surface">
        <PageHero 
          eyebrow="FAQs &amp; Guidance" 
          title={renderEmphasis("Questions, *answered*.")} 
          intro="If you cannot find what you are looking for, send our direct concierge a message and an advisor will reply within 2 hours." 
        />
        <section className="bg-surface pb-space-2xl">
          <Container narrow>
            <FaqJsonLd faqs={items.map((f) => ({ question: f.q, answer: f.a }))} />
            <HomeFaq items={items} />
          </Container>
        </section>
        <CtaBand title="Still have a question?" text="Send us a message. A real person reads every one." />
      </main>
      <Footer />
    </>
  );
}
