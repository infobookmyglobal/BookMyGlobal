// JSON-LD structured data helpers for SEO

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://bookmyglobal.com").replace(/\/$/, "");

/** JSON.stringify that is safe inside an inline <script> (no "</script>" break-outs). */
function serialize(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function Ld({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(data) }} />;
}

export function OrganizationJsonLd() {
  const phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE;
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "BookMyGlobal",
        url: APP_URL,
        logo: `${APP_URL}/logo.png`,
        ...(phone
          ? { contactPoint: { "@type": "ContactPoint", telephone: phone, contactType: "customer service", areaServed: "IN" } }
          : {}),
      }}
    />
  );
}

export function ServiceJsonLd({ name, description, path }: { name: string; description: string; path: string }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description,
        url: `${APP_URL}${path}`,
        provider: { "@type": "Organization", name: "BookMyGlobal", url: APP_URL },
        areaServed: "IN",
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: `${APP_URL}${it.path}`,
        })),
      }}
    />
  );
}

export function FaqJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }}
    />
  );
}

export function WebPageJsonLd({
  name,
  description,
  urlPath,
  dateModified,
}: {
  name: string;
  description: string;
  urlPath: string;
  dateModified?: string;
}) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name,
        description,
        url: `${APP_URL}${urlPath}`,
        publisher: { "@type": "Organization", name: "BookMyGlobal", url: APP_URL },
        ...(dateModified ? { dateModified } : {}),
        inLanguage: "en-IN",
      }}
    />
  );
}

/** Admin-supplied JSON-LD. Must parse as JSON, otherwise nothing is injected. */
export function CustomStructuredData({ data }: { data: string }) {
  if (!data) return null;

  const cleaned = data
    .replace(/<[^>]+>/gi, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();

  try {
    return <Ld data={JSON.parse(cleaned)} />;
  } catch {
    return null;
  }
}
