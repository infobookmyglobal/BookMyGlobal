import { SERVICES } from "@/config/services";

export type SitemapFreq = "weekly" | "monthly" | "yearly";

export interface SiteRoute {
  path: string;
  changeFrequency: SitemapFreq;
  priority: number;
}

/** Core marketing pages that always exist in code (not DB driven). */
export const CORE_ROUTES: SiteRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faqs", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/apply", changeFrequency: "monthly", priority: 0.8 },
  { path: "/partner-program", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/refunds", changeFrequency: "yearly", priority: 0.3 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.3 },
];

/** One entry per service landing page (detail pages, plus retreats / community). */
export const SERVICE_ROUTES: SiteRoute[] = SERVICES.map((s) => ({
  path: s.href,
  changeFrequency: "monthly" as const,
  priority: 0.8,
}));

/** Slugs that are served by code, so CMS `Page` rows with the same slug are not duplicated. */
export const RESERVED_PAGE_SLUGS = new Set([
  "terms", "privacy", "refunds", "disclaimer", "about", "contact", "faq", "faqs",
  "services", "how-it-works", "apply", "blog", "partner-program", "yoga-retreats", "community",
]);
