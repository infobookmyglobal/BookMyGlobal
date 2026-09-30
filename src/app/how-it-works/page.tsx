import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container, CtaBand, PageHero, PrimaryLink } from "@/components/site/ui";
import { HomeFaq } from "@/components/home/HomeFaq";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { getSeoMetadata } from "@/lib/seo";
import { renderEmphasis } from "@/lib/cms-text";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("how-it-works");
}

const STEPS = [
  { title: "Tell us what you need", text: "Choose a service and share the basics: where you are going, when, and who is travelling. For visas and attestation you start a request from your account; for bookings you send an enquiry." },
  { title: "Share your documents", text: "Upload passport copies, photographs and supporting papers securely from your dashboard. We tell you exactly what is needed, so you are not guessing." },
  { title: "We review, then quote", text: "Someone on the team reads your request and documents first. If anything is missing we ask. Only then do we send you a clear service fee. You are never charged before you have seen the price." },
  { title: "Pay securely", text: "Approve the quote and pay online by card, UPI or netbanking through Razorpay, or by card or PayPal if you are paying in another currency. Your receipt is emailed and kept in your account." },
  { title: "We handle it, you track it", text: "We submit and follow up. Status updates appear in your dashboard, and where documents need to come back to you, we courier them and share the tracking details." },
];

const FAQS = [
  { q: "Do I need an account?", a: "To start a visa or attestation request, yes, so your documents and payments stay private and tied to you. For a general question or a booking enquiry, no account is needed: use the contact form." },
  { q: "When do I pay?", a: "After we have reviewed your request and sent you a quote. You approve it and pay from your dashboard." },
  { q: "Are government or embassy fees included?", a: "No. Official fees are set by the authorities and are separate from our service fee. We tell you about them up front." },
  { q: "Can you guarantee the outcome?", a: "No. Visas and attestations are decided by the relevant authorities. We help you submit a complete, correct application, but we are not a government body and cannot promise a result." },
];

export default function HowItWorksPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "How it works", path: "/how-it-works" }]} />
      <FaqJsonLd faqs={FAQS.map((f) => ({ question: f.q, answer: f.a }))} />
      <Header />
      <main>
        <PageHero
          eyebrow="How it works"
          title={renderEmphasis("Five steps, no *surprises*.")}
          intro="Every request follows the same path, so you always know what happens next and what it will cost before you commit."
        >
          <PrimaryLink href="/apply">Start a request</PrimaryLink>
        </PageHero>

        <section className="bg-surface pb-space-2xl">
          <Container narrow>
            <ol className="space-y-space-md">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-space-md rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-container font-title-md text-title-md text-on-secondary-container">
                    {i + 1}
                  </span>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-primary">{s.title}</h2>
                    <p className="mt-2 font-body-md text-body-md leading-relaxed text-on-surface-variant">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section className="bg-surface-container-low py-space-2xl">
          <Container narrow>
            <h2 className="mb-space-lg font-headline-md text-headline-md text-primary">Good to know</h2>
            <HomeFaq items={FAQS} />
          </Container>
        </section>
        <CtaBand title="Ready when you are." text="Start a visa or attestation request, or send us a question about any of our services." href="/apply" cta="Start a request" />
      </main>
      <Footer />
    </>
  );
}
