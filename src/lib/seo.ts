import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bookmyglobal.com";

// Canonical URL path map for pages whose pageKey doesn't match their URL 1:1
const PAGE_KEY_TO_PATH: Record<string, string> = {
  home: "",
  "how-it-works": "how-it-works",
  "partner-program": "partner-program",
  "yoga-retreats": "yoga-retreats",
};

function canonicalPath(pageKey: string): string {
  if (pageKey in PAGE_KEY_TO_PATH) return PAGE_KEY_TO_PATH[pageKey];
  return pageKey;
}

export const DEFAULT_METADATA: Record<string, { title: string; description: string }> = {
  home: {
    title: "BookMyGlobal | Visas, Attestation, Flights, Hotels, Tours & Retreats",
    description:
      "One account for visa assistance, MEA and embassy attestation, flights, hotels, tours, cruises, international bus travel and yoga retreats in Rishikesh.",
  },
  services: {
    title: "Our Services | BookMyGlobal",
    description:
      "Everything for an international trip in one place: visa assistance, attestation, flights, hotels, tours, cruises, international buses, yoga retreats and a traveller community.",
  },
  "how-it-works": {
    title: "How It Works | BookMyGlobal",
    description: "Tell us what you need, upload your documents, get a clear quote, and track everything from one dashboard.",
  },
  about: {
    title: "About Us | BookMyGlobal",
    description: "BookMyGlobal helps Indian travellers handle the paperwork and bookings behind every international trip.",
  },
  "yoga-retreats": {
    title: "Yoga Retreats in Rishikesh | BookMyGlobal",
    description: "Small-group yoga and wellness retreats in Rishikesh, planned end to end by BookMyGlobal.",
  },
  community: {
    title: "Traveller Community | BookMyGlobal",
    description: "Meet fellow travellers, swap tips and hear about new trips, retreats and meet-ups.",
  },
  blog: {
    title: "Journal | BookMyGlobal",
    description: "Practical guides on visas, attestation, travel planning and Rishikesh, written for Indian travellers.",
  },
  faqs: {
    title: "FAQs | BookMyGlobal",
    description: "Answers to common questions about our services, documents, payments and how requests are handled.",
  },
  contact: {
    title: "Contact Us | BookMyGlobal",
    description: "Questions about a service, a request or a booking? Send us a message and our team will get back to you.",
  },
  apply: {
    title: "Start a Request | BookMyGlobal",
    description: "Tell us what you need: visa assistance or document attestation. We review first and quote a fee before any payment.",
  },
  "partner-program": {
    title: "Partner Programme | BookMyGlobal",
    description: "Refer travellers to BookMyGlobal and earn a commission on completed requests.",
  },
  terms: {
    title: "Terms & Conditions | BookMyGlobal",
    description: "The terms that apply when you use BookMyGlobal.",
  },
  privacy: {
    title: "Privacy Policy | BookMyGlobal",
    description: "How BookMyGlobal collects, uses and protects your personal data.",
  },
  refunds: {
    title: "Refund Policy | BookMyGlobal",
    description: "When and how refunds work for BookMyGlobal services.",
  },
  disclaimer: {
    title: "Disclaimer | BookMyGlobal",
    description: "Important information about what BookMyGlobal does and does not do.",
  },
};

export async function getSeoMetadata(pageKey: string): Promise<Metadata> {
  const defaults = DEFAULT_METADATA[pageKey] || DEFAULT_METADATA.home;
  const path = canonicalPath(pageKey);
  const canonicalUrl = `${APP_URL}${path ? `/${path}` : ""}`;

  try {
    const seo = await prisma.seoMeta.findUnique({ where: { pageKey } });

    if (seo) {
      const title = seo.title || defaults.title;
      const description = seo.description || defaults.description;
      const ogTitle = seo.ogTitle || title;
      const ogDescription = seo.ogDescription || description;
      const ogImg = seo.ogImage || `${APP_URL}/og-home.jpg`;
      const canonical = seo.canonicalUrl || canonicalUrl;

      return {
        title: { absolute: title },
        description,
        alternates: {
          canonical,
          languages: { "en-IN": canonical },
        },
        robots: {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        },
        openGraph: {
          type: "website",
          title: ogTitle,
          description: ogDescription,
          url: canonical,
          siteName: "BookMyGlobal",
          locale: "en_IN",
          images: [{ url: ogImg, width: 1200, height: 630, alt: ogTitle }],
        },
        twitter: {
          card: (seo.twitterCard || "summary_large_image") as "summary_large_image" | "summary",
          title: ogTitle,
          description: ogDescription,
          images: [ogImg],
          site: "@BookMyGlobal",
        },
      };
    }
  } catch (err) {
    console.error(`Failed to fetch SEO metadata for ${pageKey}:`, err);
  }

  // Fallback metadata (code defaults — used when DB is unreachable or no record exists)
  return {
    title: { absolute: defaults.title },
    description: defaults.description,
    alternates: {
      canonical: canonicalUrl,
      languages: { "en-IN": canonicalUrl },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      type: "website",
      title: defaults.title,
      description: defaults.description,
      url: canonicalUrl,
      siteName: "BookMyGlobal",
      locale: "en_IN",
      images: [{ url: `${APP_URL}/og-home.jpg`, width: 1200, height: 630, alt: defaults.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: defaults.title,
      description: defaults.description,
      images: [`${APP_URL}/og-home.jpg`],
      site: "@BookMyGlobal",
    },
  };
}
