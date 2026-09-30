import type { Metadata } from "next";
import { Leaf, Mountain, Sunrise, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container, CtaBand, Eyebrow, GhostLink, PageHero, PrimaryLink } from "@/components/site/ui";
import { Photo } from "@/components/site/Photo";
import { HomeFaq } from "@/components/home/HomeFaq";
import { BreadcrumbJsonLd, FaqJsonLd, ServiceJsonLd } from "@/components/JsonLd";
import { IMAGES } from "@/config/images";
import { getSeoMetadata } from "@/lib/seo";
import { renderEmphasis } from "@/lib/cms-text";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("yoga-retreats");
}

const PROGRAMMES = [
  {
    name: "Foundation",
    tag: "New to yoga, or coming back to it",
    text: "A gentler programme that builds a daily practice: asana, breathwork and meditation, with plenty of unhurried time to explore Rishikesh.",
    icon: Sunrise,
  },
  {
    name: "Immersion",
    tag: "For a deeper reset",
    text: "A fuller programme for people who want to go further into practice, philosophy and stillness, in a small group.",
    icon: Mountain,
  },
];

const FAQS = [
  { q: "Are these retreats run by BookMyGlobal?", a: "Yes. Unlike our flight and hotel bookings, which go through partners, the Rishikesh retreats are our own programmes." },
  { q: "What are the dates and prices?", a: "They change from batch to batch. Send us an enquiry and we will share the upcoming dates, what is included and the fee." },
  { q: "Do I need experience?", a: "No. The Foundation programme is designed for beginners. Tell us about your experience and any injuries or limitations when you enquire so we can guide you properly." },
  { q: "Can you help with travel to Rishikesh?", a: "Yes. If you are coming from abroad we can help with flights, hotels either side of the retreat and visa paperwork." },
];

export default function YogaRetreatsPage() {
  return (
    <>
      <ServiceJsonLd name="Yoga retreats in Rishikesh" description="Small-group yoga and wellness retreats in Rishikesh run by BookMyGlobal." path="/yoga-retreats" />
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Yoga retreats", path: "/yoga-retreats" }]} />
      <FaqJsonLd faqs={FAQS.map((f) => ({ question: f.q, answer: f.a }))} />
      <Header />
      <main>
        <PageHero
          eyebrow="Our own · Rishikesh"
          title={renderEmphasis("Slow down, in the *yoga capital* of the world.")}
          intro="Small-group retreats on the Ganges, planned end to end by us: the programme, the stay, the practice and the logistics."
        >
          <div className="flex flex-wrap gap-space-sm">
            <PrimaryLink href="/contact?type=RETREAT">Enquire about a retreat</PrimaryLink>
            <GhostLink href="/services/flights">Plan your travel too</GhostLink>
          </div>
        </PageHero>

        <section className="bg-surface pb-space-2xl">
          <Container>
            <div className="grid gap-space-md md:grid-cols-2">
              <div className="overflow-hidden rounded-3xl"><Photo src={IMAGES.retreatA} alt="Yoga practice at a retreat in Rishikesh" className="aspect-[4/3] w-full object-cover" /></div>
              <div className="overflow-hidden rounded-3xl"><Photo src={IMAGES.retreatB} alt="A quiet morning by the Ganges in Rishikesh" className="aspect-[4/3] w-full object-cover" /></div>
            </div>
          </Container>
        </section>

        <section className="bg-surface-container-low py-space-2xl">
          <Container>
            <Eyebrow>Two programmes</Eyebrow>
            <div className="mt-space-md grid gap-space-md md:grid-cols-2">
              {PROGRAMMES.map((p) => (
                <div key={p.name} className="rounded-3xl bg-surface-container-lowest p-space-lg shadow-sm">
                  <span className="mb-space-sm flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container/40 text-secondary"><p.icon className="h-6 w-6" /></span>
                  <h2 className="font-headline-md text-headline-md text-primary">{p.name}</h2>
                  <p className="font-label-md text-label-md text-secondary">{p.tag}</p>
                  <p className="mt-space-sm font-body-md text-body-md leading-relaxed text-on-surface-variant">{p.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-space-md flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
              Dates, inclusions and fees vary by batch. Enquire and we will send the current details.
            </p>
          </Container>
        </section>

        <section className="bg-surface py-space-2xl">
          <Container narrow>
            <h2 className="mb-space-lg flex items-center gap-2 font-headline-md text-headline-md text-primary"><Leaf className="h-6 w-6 text-secondary" /> Questions</h2>
            <HomeFaq items={FAQS} />
          </Container>
        </section>
        <CtaBand title="Come to Rishikesh." text="Tell us when you are thinking of travelling and we will share the next batches." href="/contact?type=RETREAT" cta="Enquire now" />
      </main>
      <Footer />
    </>
  );
}
