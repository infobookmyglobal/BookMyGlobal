import { AlertTriangle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaBand } from "@/components/site/ui";
import { CustomStructuredData } from "@/components/JsonLd";
import { PageHero, Container } from "@/components/site/ui";

interface Props {
  title: string;
  intro?: string;
  html: string;
  updatedLabel?: string;
  isDraft?: boolean;
  structuredData?: string | null;
  jsonLdId?: string;
  jsonLd?: unknown;
  cta?: boolean;
}

/** Shared shell for text pages: legal pages and pages created in Admin → Pages. */
export function CmsPageView({ title, intro, html, updatedLabel, isDraft, structuredData, jsonLdId, jsonLd, cta = true }: Props) {
  return (
    <>
      {structuredData ? (
        <CustomStructuredData data={structuredData} />
      ) : jsonLd ? (
        <script
          id={jsonLdId || "page-jsonld"}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
      <Header />
      <main>
        {isDraft && (
          <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-secondary-container px-4 py-2 font-label-sm text-label-sm text-on-secondary-container">
            <AlertTriangle className="h-4 w-4" />
            Draft preview: visitors see a 404 for this page, only admins can view it.
          </div>
        )}
        <PageHero eyebrow={updatedLabel} title={title} intro={intro} />
        <section className="bg-surface pb-space-2xl">
          <Container narrow>
            <div className="prose-bmg mx-auto max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />
          </Container>
        </section>
        {cta && <CtaBand />}
      </main>
      <Footer />
    </>
  );
}
