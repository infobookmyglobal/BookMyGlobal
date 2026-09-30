import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaBand, Container, PageHero, IndiaTag } from "@/components/site/ui";
import { ServiceIcon } from "@/components/ServiceIcon";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { SERVICES } from "@/config/services";
import { getSeoMetadata } from "@/lib/seo";
import { renderEmphasis } from "@/lib/cms-text";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("services");
}

export default function ServicesPage() {
  const documents = SERVICES.filter((s) => s.kicker === "Documents");
  const rest = SERVICES.filter((s) => s.kicker !== "Documents");

  const Row = ({ s }: { s: (typeof SERVICES)[number] }) => (
    <Link
      href={s.href}
      className="group flex flex-col gap-space-md rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-container text-secondary">
        <ServiceIcon kind={s.icon} className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-ticket-code text-ticket-code uppercase tracking-widest text-secondary">{s.pillar} · {s.kicker}</span>
          {s.indiaOnly && <IndiaTag />}
        </div>
        <h2 className="font-headline-sm text-headline-sm text-primary">{s.title}</h2>
        <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">{s.summary}</p>
      </div>
      <span className="font-label-md text-label-md text-secondary transition-transform group-hover:translate-x-1">Learn more →</span>
    </Link>
  );

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]} />
      <Header />
      <main>
        <PageHero
          eyebrow="Everything for the trip"
          title={renderEmphasis("Nine services, one *account*.")}
          intro="From the paperwork that gets you across a border to the stay, the tours and a week of yoga at the end of it. Pick one, or plan several together."
        />
        <section className="bg-surface pb-space-2xl">
          <Container className="space-y-space-xl">
            <div className="space-y-space-md">
              <h2 className="font-eyebrow text-eyebrow uppercase text-on-surface-variant">Documents</h2>
              {documents.map((s) => <Row key={s.slug} s={s} />)}
            </div>
            <div className="space-y-space-md">
              <h2 className="font-eyebrow text-eyebrow uppercase text-on-surface-variant">Trips, stays and people</h2>
              {rest.map((s) => <Row key={s.slug} s={s} />)}
            </div>
          </Container>
        </section>
        <CtaBand title="Not sure where to start?" text="Tell us about the trip you have in mind and we will point you to the right service." />
      </main>
      <Footer />
    </>
  );
}
