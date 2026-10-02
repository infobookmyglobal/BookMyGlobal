import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ShieldCheck, HeartHandshake, Users, Globe2, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container, CtaBand, Eyebrow, PageHero } from "@/components/site/ui";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { getSeoMetadata } from "@/lib/seo";
import { renderEmphasis } from "@/lib/cms-text";
import { COMPANY_NAME } from "@/lib/contact";
import { prisma } from "@/lib/prisma";
import { renderContentToHtml } from "@/lib/tiptap-html";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("about");
}

const DEFAULT_VALUES = [
  { icon: Compass, title: "Clear next steps", text: "Travel admin is confusing mostly because nobody tells you what comes next. We do." },
  { icon: ShieldCheck, title: "Honest about limits", text: "We are a private company, not an embassy or a government office. We tell you what we can do and what only the authorities can decide." },
  { icon: HeartHandshake, title: "Real people", text: "Every request is read by someone on the team, and you can talk to us when something is unclear." },
];

const STATS = [
  { value: "10,000+", label: "Applications processed" },
  { value: "60+", label: "Countries supported" },
  { value: "98%", label: "Customer satisfaction" },
  { value: "24/7", label: "Concierge support" },
];

export default async function AboutPage() {
  // Load CMS page content for "about" if admin has customized it
  const cmsPage = await prisma.page.findUnique({ where: { slug: "about" } }).catch(() => null);
  const hasCustomContent = cmsPage?.isActive && cmsPage?.content;

  return (
    <>
      <WebPageJsonLd
        name="About BookMyGlobal"
        description="BookMyGlobal helps Indian travellers handle the paperwork and bookings behind every international trip."
        urlPath="/about"
      />
      <BreadcrumbJsonLd items={[{ name: "About", path: "/about" }]} />
      <Header />
      <main>
        <PageHero
          eyebrow="About us"
          title={renderEmphasis("Travel paperwork, made *humane*.")}
          intro="BookMyGlobal exists so that the documents and bookings behind an international trip are the easy part."
        />

        {/* Stats Bar */}
        <section className="border-b border-slate-100 bg-white py-8 sm:py-10">
          <Container>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">{s.value}</div>
                  <div className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Main content — admin-overridable */}
        <section className="bg-surface pb-space-2xl pt-space-xl">
          <Container narrow>
            {hasCustomContent ? (
              // Admin-managed content via Pages CMS
              <div
                className="prose prose-slate max-w-none prose-headings:font-extrabold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: renderContentToHtml(cmsPage!.content) }}
              />
            ) : (
              // Default content
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
            )}
          </Container>
        </section>

        {/* Values */}
        <section className="bg-surface-container-low py-space-2xl">
          <Container>
            <Eyebrow>What we care about</Eyebrow>
            <div className="mt-space-md grid gap-4 sm:gap-space-md sm:grid-cols-3">
              {DEFAULT_VALUES.map((v) => (
                <div key={v.title} className="rounded-2xl bg-surface-container-lowest p-5 sm:p-space-lg shadow-sm">
                  <span className="mb-space-sm flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-surface-container text-secondary">
                    <v.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-primary mt-3">{v.title}</h2>
                  <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{v.text}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Disclaimer */}
        <section className="bg-surface py-space-2xl">
          <Container narrow>
            <div className="rounded-2xl bg-secondary-container/25 p-5 sm:p-space-lg">
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

        <CtaBand
          title="Ready to plan your trip?"
          text="Tell us where you are headed and we handle the documents and bookings."
          href="/contact"
          cta="Start a conversation"
        />
      </main>
      <Footer />
    </>
  );
}
