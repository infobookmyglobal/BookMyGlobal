import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, Info } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container, CtaBand, Eyebrow, GhostLink, IndiaTag, PageHero, PrimaryLink } from "@/components/site/ui";
import { ServiceIcon } from "@/components/ServiceIcon";
import { HomeFaq } from "@/components/home/HomeFaq";
import { BreadcrumbJsonLd, FaqJsonLd, ServiceJsonLd } from "@/components/JsonLd";
import { DETAIL_SERVICES, getService, SLUG_ALIASES } from "@/config/services";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bookmyglobal.com";

export function generateStaticParams() {
  const slugs = DETAIL_SERVICES.map((s) => s.slug);
  const aliases = Object.keys(SLUG_ALIASES);
  return Array.from(new Set([...slugs, ...aliases])).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return { title: "Service not found" };
  if (!s.detail) return { title: `${s.title} | BookMyGlobal` };
  const title = `${s.title} | BookMyGlobal`;
  return {
    title,
    description: s.summary,
    alternates: { canonical: `${APP_URL}/services/${s.slug}` },
    openGraph: { type: "website", title, description: s.summary, url: `${APP_URL}/services/${s.slug}`, siteName: "BookMyGlobal" },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();

  // If service has its own dedicated top-level route (e.g. /yoga-retreats or /community)
  if (!s.detail) {
    redirect(s.href);
  }

  const d = s.detail;


  const startHref =
    s.enquiryType === "VISA" || s.enquiryType === "ATTESTATION"
      ? `/apply?service=${s.enquiryType}`
      : `/contact?type=${s.enquiryType}`;
  const startLabel = s.enquiryType === "VISA" || s.enquiryType === "ATTESTATION" ? "Start a request" : "Ask about this";
  const related = d.related.map((r) => getService(r)).filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <>
      <ServiceJsonLd name={s.title} description={s.summary} path={`/services/${s.slug}`} />
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: s.title, path: `/services/${s.slug}` }]} />
      <FaqJsonLd faqs={d.faqs.map((f) => ({ question: f.q, answer: f.a }))} />
      <Header />
      <main>
        <PageHero
          eyebrow={`${s.pillar} · ${s.kicker}`}
          title={s.title}
          intro={d.intro}
          breadcrumb={[{ label: "Services", href: "/services" }, { label: s.title }]}
        >
          <div className="flex flex-wrap items-center gap-space-sm">
            <PrimaryLink href={startHref}>{startLabel}</PrimaryLink>
            <GhostLink href={`/contact?type=${s.enquiryType}`}>Ask a question</GhostLink>
            {s.indiaOnly && <IndiaTag />}
          </div>
        </PageHero>

        <section className="bg-surface pb-space-2xl">
          <Container className="grid gap-space-xl lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-space-xl">
              <div className="space-y-space-md">
                <Eyebrow>What is included</Eyebrow>
                <ul className="grid gap-space-sm sm:grid-cols-2">
                  {d.included.map((i) => (
                    <li key={i} className="flex gap-3 rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-on-tertiary-container" />
                      <span className="font-body-md text-body-md text-primary">{i}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-space-md">
                <Eyebrow>How it works</Eyebrow>
                <ol className="space-y-space-sm">
                  {d.steps.map((st, i) => (
                    <li key={st.title} className="flex gap-space-md rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container font-title-md text-title-md text-on-secondary-container">{i + 1}</span>
                      <div>
                        <h3 className="font-title-md text-title-md text-primary">{st.title}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">{st.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <aside className="space-y-space-md lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl bg-primary-container p-space-lg text-on-primary">
                <span className="mb-space-sm flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-secondary-container">
                  <ServiceIcon kind={s.icon} className="h-6 w-6" />
                </span>
                <h2 className="font-headline-sm text-headline-sm">What we will ask for</h2>
                <ul className="mt-space-sm space-y-2">
                  {d.needs.map((n) => (
                    <li key={n} className="flex gap-2 font-body-sm text-body-sm text-on-primary-container">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary-container" />
                      {n}
                    </li>
                  ))}
                </ul>
                <div className="mt-space-lg"><PrimaryLink href={startHref}>{startLabel}</PrimaryLink></div>
              </div>
              <div className="flex gap-3 rounded-2xl bg-secondary-container/25 p-space-md">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <p className="font-body-sm text-body-sm leading-relaxed text-on-surface">{d.goodToKnow}</p>
              </div>
            </aside>
          </Container>
        </section>

        <section className="bg-surface-container-low py-space-2xl">
          <Container narrow>
            <h2 className="mb-space-lg font-headline-md text-headline-md text-primary">Common questions</h2>
            <HomeFaq items={d.faqs} />
          </Container>
        </section>

        {related.length > 0 && (
          <section className="bg-surface py-space-2xl">
            <Container>
              <h2 className="mb-space-lg font-headline-md text-headline-md text-primary">Often planned together</h2>
              <div className="grid gap-space-md sm:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.slug} href={r.href} className="group rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <span className="mb-space-sm flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-secondary">
                      <ServiceIcon kind={r.icon} className="h-5 w-5" />
                    </span>
                    <h3 className="font-title-md text-title-md text-primary">{r.title}</h3>
                    <p className="mt-1 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">{r.summary}</p>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        )}

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
