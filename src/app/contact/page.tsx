import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EnquiryForm, ENQUIRY_TYPES } from "@/components/home/EnquiryForm";
import { Container, Eyebrow, Stamp } from "@/components/site/ui";
import { getSeoMetadata } from "@/lib/seo";
import { SUPPORT_EMAIL, SUPPORT_PHONE, WHATSAPP_NUMBER, WHATSAPP_URL } from "@/lib/contact";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("contact");
}

export default async function ContactPage({
  searchParams,
}: { searchParams: Promise<{ type?: string; destination?: string; date?: string }> }) {
  const { type, destination, date } = await searchParams;
  const defaultType = ENQUIRY_TYPES.some((t) => t.value === type) ? (type as string) : "GENERAL";

  const row = "flex items-center gap-3 font-title-md text-primary";
  const tile = "flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-secondary";

  return (
    <>
      <Header />
      <main className="bg-surface-container-low pb-space-2xl pt-24 sm:pt-32 lg:pt-36">
        <Container>
          <div className="grid gap-space-xl lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-space-lg">
              <Eyebrow>Get in touch</Eyebrow>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-primary md:font-headline-lg md:text-headline-lg">
                Tell us about your trip.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Visas, attestation, flights, hotels, tours, cruises, buses, yoga retreats or just a question. Send us a
                message and we will reply by email.
              </p>
              <div className="space-y-space-md pt-space-sm">
                <a href={`mailto:${SUPPORT_EMAIL}`} className={row}>
                  <span className={tile}><Mail className="h-5 w-5" /></span>
                  {SUPPORT_EMAIL}
                </a>
                {SUPPORT_PHONE && (
                  <a href={`tel:${SUPPORT_PHONE}`} className={row}>
                    <span className={tile}><Phone className="h-5 w-5" /></span>
                    {SUPPORT_PHONE}
                  </a>
                )}
                {WHATSAPP_NUMBER && (
                  <a href={WHATSAPP_URL} className={row}>
                    <span className={tile}><MessageCircle className="h-5 w-5" /></span>
                    Chat on WhatsApp
                  </a>
                )}
              </div>
            </div>

            <div className="relative rounded-3xl bg-surface-container-lowest p-space-lg shadow-xl md:p-space-xl">
              <Stamp lines={["Request", "desk"]} className="absolute -right-4 -top-6 hidden h-24 w-24 rotate-12 sm:flex" />
              <EnquiryForm defaultType={defaultType} defaultDestination={destination ?? ""} defaultDate={date ?? ""} />
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
