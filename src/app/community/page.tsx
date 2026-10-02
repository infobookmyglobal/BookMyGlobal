import type { Metadata } from "next";
import { CalendarHeart, MapPinned, MessagesSquare, Users, MessageCircle, Rss } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container, CtaBand, Eyebrow, PageHero, PrimaryLink } from "@/components/site/ui";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { getSeoMetadata } from "@/lib/seo";
import { renderEmphasis } from "@/lib/cms-text";
import { prisma } from "@/lib/prisma";
import { renderContentToHtml } from "@/lib/tiptap-html";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("community");
}

const IDEAS = [
  { icon: MapPinned, title: "Find people going your way", text: "Meet travellers heading to the same city, or living in yours, before you go." },
  { icon: MessagesSquare, title: "Swap real tips", text: "Ask about a visa office, a neighbourhood or a route from people who have just done it." },
  { icon: CalendarHeart, title: "Meet up", text: "Retreat reunions, trip planning evenings and informal meet-ups." },
];

const CHANNELS = [
  { icon: MessageCircle, label: "WhatsApp Group", desc: "Instant support and community chat" },
  { icon: Rss, label: "Travel Journal", desc: "Curated guides and destination write-ups" },
  { icon: Users, label: "Rishikesh Retreats", desc: "Meet fellow retreat participants" },
];

export default async function CommunityPage() {
  // Load CMS page content for "community" if admin has customized it
  const cmsPage = await prisma.page.findUnique({ where: { slug: "community" } }).catch(() => null);
  const hasCustomContent = cmsPage?.isActive && cmsPage?.content;

  return (
    <>
      <WebPageJsonLd
        name="Traveller Community | BookMyGlobal"
        description="Meet fellow travellers, swap tips and hear about new trips, retreats and meet-ups."
        urlPath="/community"
      />
      <BreadcrumbJsonLd items={[{ name: "Community", path: "/community" }]} />
      <Header />
      <main>
        <PageHero
          eyebrow="Together"
          title={renderEmphasis("Travel is better with *company*.")}
          intro="We are building a space for BookMyGlobal travellers to meet, share tips and plan together. It is early days, and you can help shape it."
        >
          <PrimaryLink href="/contact?type=COMMUNITY">Tell us you are interested</PrimaryLink>
        </PageHero>

        {hasCustomContent ? (
          <section className="bg-surface pb-space-2xl pt-space-xl">
            <Container narrow>
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: renderContentToHtml(cmsPage!.content) }}
              />
            </Container>
          </section>
        ) : (
          <>
            {/* What it will be */}
            <section className="bg-surface pb-space-2xl pt-space-xl">
              <Container>
                <Eyebrow>What it will be</Eyebrow>
                <div className="mt-space-md grid gap-4 sm:gap-space-md sm:grid-cols-3">
                  {IDEAS.map((i) => (
                    <div key={i.title} className="rounded-2xl bg-surface-container-lowest p-5 sm:p-space-lg shadow-sm">
                      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-secondary">
                        <i.icon className="h-5 w-5" />
                      </span>
                      <h2 className="font-headline-sm text-headline-sm text-primary mt-3">{i.title}</h2>
                      <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{i.text}</p>
                    </div>
                  ))}
                </div>
              </Container>
            </section>

            {/* How to stay connected */}
            <section className="bg-surface-container-low py-space-2xl">
              <Container>
                <Eyebrow>Stay connected</Eyebrow>
                <h2 className="mt-2 text-fluid-h2 font-extrabold text-slate-900 max-w-xl">
                  Already live on these channels
                </h2>
                <div className="mt-space-md grid gap-4 sm:grid-cols-3">
                  {CHANNELS.map((c) => (
                    <div key={c.label} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <c.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{c.label}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{c.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-space-lg max-w-2xl font-body-md text-body-md text-on-surface-variant">
                  The full community platform is not open yet. Send us a note through the contact form and we will let you know as soon as it is.
                </p>
              </Container>
            </section>
          </>
        )}

        <CtaBand
          title="Be among the first."
          text="Tell us you are interested in the BookMyGlobal community and we will keep you posted."
          href="/contact?type=COMMUNITY"
          cta="Register interest"
        />
      </main>
      <Footer />
    </>
  );
}
