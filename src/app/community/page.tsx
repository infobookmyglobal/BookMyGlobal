import type { Metadata } from "next";
import { CalendarHeart, MapPinned, MessagesSquare } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container, CtaBand, Eyebrow, PageHero, PrimaryLink } from "@/components/site/ui";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { getSeoMetadata } from "@/lib/seo";
import { renderEmphasis } from "@/lib/cms-text";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("community");
}

const IDEAS = [
  { icon: MapPinned, title: "Find people going your way", text: "Meet travellers heading to the same city, or living in yours, before you go." },
  { icon: MessagesSquare, title: "Swap real tips", text: "Ask about a visa office, a neighbourhood or a route from people who have just done it." },
  { icon: CalendarHeart, title: "Meet up", text: "Retreat reunions, trip planning evenings and informal meet-ups." },
];

export default function CommunityPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Community", path: "/community" }]} />
      <Header />
      <main>
        <PageHero
          eyebrow="Together"
          title={renderEmphasis("Travel is better with *company*.")}
          intro="We are building a space for BookMyGlobal travellers to meet, share tips and plan together. It is early days, and you can help shape it."
        >
          <PrimaryLink href="/contact?type=COMMUNITY">Tell us you are interested</PrimaryLink>
        </PageHero>
        <section className="bg-surface pb-space-2xl">
          <Container>
            <Eyebrow>What it will be</Eyebrow>
            <div className="mt-space-md grid gap-space-md md:grid-cols-3">
              {IDEAS.map((i) => (
                <div key={i.title} className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
                  <span className="mb-space-sm flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-secondary"><i.icon className="h-6 w-6" /></span>
                  <h2 className="font-headline-sm text-headline-sm text-primary">{i.title}</h2>
                  <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{i.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-space-lg max-w-2xl font-body-md text-body-md text-on-surface-variant">
              The community is not open yet. Send us a note through the contact form and we will let you know as soon as it is.
            </p>
          </Container>
        </section>
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
