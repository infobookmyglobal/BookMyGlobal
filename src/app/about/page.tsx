import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ShieldCheck, HeartHandshake } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container, CtaBand, Eyebrow, PageHero } from "@/components/site/ui";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { getSeoMetadata } from "@/lib/seo";
import { renderEmphasis } from "@/lib/cms-text";
import { COMPANY_NAME } from "@/lib/contact";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("about");
}

const VALUES = [
  { icon: Compass, title: "Clear next steps", text: "Travel admin is confusing mostly because nobody tells you what comes next. We do." },
  { icon: ShieldCheck, title: "Honest about limits", text: "We are a private company, not an embassy or a government office. We tell you what we can do and what only the authorities can decide." },
  { icon: HeartHandshake, title: "Real people", text: "Every request is read by someone on the team, and you can talk to us when something is unclear." },
];

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
      <Header />
      <main>
        <PageHero
          eyebrow="About us"
          title={renderEmphasis("Travel paperwork, made *humane*.")}
          intro="BookMyGlobal exists so that the documents and bookings behind an international trip are the easy part."
        />
        <section className="bg-surface pb-space-2xl">
          <Container narrow>
            <div className="space-y-space-md font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              <p>
                Planning a trip abroad from India means juggling visa forms, attested documents, flights, hotels and a
                dozen browser tabs. Each step has its own rules, and small mistakes cost time and money.
              </p>
              <p>
                We bring those pieces into one account. You can have your visa paperwork reviewed, get your documents
                apostilled or attested, book flights and stays, find tours, and join a yoga retreat in Rishikesh that we
                run ourselves, all without starting from scratch each time.
              </p>
              <p>
                We are built for travellers from India first. That is why the visa and attestation services are designed
                around Indian documents and Indian processes such as MEA apostille, and why payments work with UPI, cards
                and netbanking.
              </p>
            </div>
          </Container>
        </section>

        <section className="bg-surface-container-low py-space-2xl">
          <Container>
            <Eyebrow>What we care about</Eyebrow>
            <div className="mt-space-md grid gap-space-md md:grid-cols-3">
              {VALUES.map((v) => (
                <div key={v.title} className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
                  <span className="mb-space-sm flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-secondary"><v.icon className="h-6 w-6" /></span>
                  <h2 className="font-headline-sm text-headline-sm text-primary">{v.title}</h2>
                  <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{v.text}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-surface py-space-2xl">
          <Container narrow>
            <div className="rounded-2xl bg-secondary-container/25 p-space-lg">
              <h2 className="font-headline-sm text-headline-sm text-primary">What we are not</h2>
              <p className="mt-2 font-body-md text-body-md leading-relaxed text-on-surface">
                {COMPANY_NAME || "BookMyGlobal"} is a private travel services company. We are not a government agency,
                embassy or consulate, and we cannot guarantee a visa or any decision made by the authorities. See our{" "}
                <Link href="/disclaimer" className="text-secondary underline">disclaimer</Link> and{" "}
                <Link href="/terms" className="text-secondary underline">terms</Link> for details.
              </p>
            </div>
          </Container>
        </section>
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
