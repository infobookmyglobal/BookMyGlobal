import { prisma } from "@/lib/prisma";
import { CORE_ROUTES, SERVICE_ROUTES, RESERVED_PAGE_SLUGS } from "@/config/site-routes";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bookmyglobal.com";

export async function generateDynamicSitemapXml(): Promise<string> {
  const now = new Date();

  // Load Admin Sitemap Settings from Database
  let customEntries: Array<{
    url: string;
    lastModified?: string | Date;
    changeFrequency?: string;
    priority?: number;
    enabled?: boolean;
  }> = [];

  let excludedUrls: string[] = [];
  let includeCountries = true;
  let includeBlogs = true;
  let includePages = true;
  let includeDestinations = true;

  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "sitemap_custom_entries",
            "sitemap_excluded_urls",
            "sitemap_include_countries",
            "sitemap_include_blogs",
            "sitemap_include_pages",
            "sitemap_include_destinations",
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    if (settingsMap["sitemap_custom_entries"]) {
      try {
        customEntries = JSON.parse(settingsMap["sitemap_custom_entries"]);
      } catch {
        customEntries = [];
      }
    }

    if (settingsMap["sitemap_excluded_urls"]) {
      try {
        excludedUrls = JSON.parse(settingsMap["sitemap_excluded_urls"]);
      } catch {
        excludedUrls = [];
      }
    }

    if (settingsMap["sitemap_include_countries"] === "false") includeCountries = false;
    if (settingsMap["sitemap_include_blogs"] === "false") includeBlogs = false;
    if (settingsMap["sitemap_include_pages"] === "false") includePages = false;
    if (settingsMap["sitemap_include_destinations"] === "false") includeDestinations = false;
  } catch {
    /* DB fallback */
  }

  const excludedSet = new Set<string>();
  excludedUrls.forEach((u) => {
    const clean = u.trim().toLowerCase().replace(/\/$/, "");
    if (!clean) return;
    excludedSet.add(clean);
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      const pathWithSlash = clean.startsWith("/") ? clean : `/${clean}`;
      excludedSet.add(pathWithSlash);
      const fullUrl = `${APP_URL}${pathWithSlash}`.toLowerCase().replace(/\/$/, "");
      excludedSet.add(fullUrl);
    } else {
      try {
        const parsed = new URL(clean);
        excludedSet.add(parsed.pathname.toLowerCase().replace(/\/$/, "") || "/");
      } catch {}
    }
  });

  // Core static pages
  const staticPages = CORE_ROUTES.map((r) => ({
    url: `${APP_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Service pages (toggle: 'Include service pages')
  const countryPages: any[] = includeCountries
    ? SERVICE_ROUTES.map((r) => ({
        url: `${APP_URL}${r.path}`,
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
      }))
    : [];

  // Blog posts (published only)
  let blogPages: any[] = [];
  if (includeBlogs) {
    try {
      const blogs = await prisma.blog.findMany({
        where: { status: "PUBLISHED", publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
      });
      blogPages = blogs.map((b) => ({
        url: `${APP_URL}/blog/${b.slug}`,
        lastModified: b.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      }));
    } catch {
      /* DB fallback */
    }
  }

  // CMS Pages (active/published only)
  let cmsPages: any[] = [];
  if (includePages) {
    try {
      const pages = await prisma.page.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      });
      const staticSlugs = RESERVED_PAGE_SLUGS;
      cmsPages = pages
        .filter((p) => !staticSlugs.has(p.slug))
        .map((p) => ({
          url: `${APP_URL}/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: "monthly",
          priority: 0.5,
        }));
    } catch {
      /* DB fallback */
    }
  }

  const destinationPages: any[] = [];
  void includeDestinations;

  // Parse Admin Custom Entries
  const activeCustomPages = customEntries
    .filter((entry) => entry.enabled !== false && entry.url)
    .map((entry) => {
      let fullUrl = entry.url.trim();
      if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
        fullUrl = `${APP_URL}${fullUrl.startsWith("/") ? "" : "/"}${fullUrl}`;
      }
      return {
        url: fullUrl,
        lastModified: entry.lastModified ? new Date(entry.lastModified) : now,
        changeFrequency: entry.changeFrequency || "monthly",
        priority: typeof entry.priority === "number" ? entry.priority : 0.7,
      };
    });

  const allEntries = [
    ...staticPages,
    ...countryPages,
    ...blogPages,
    ...cmsPages,
    ...destinationPages,
    ...activeCustomPages,
  ];

  // Deduplicate and filter excluded URLs
  const seenUrls = new Set<string>();
  const finalSitemap: any[] = [];

  for (const entry of allEntries) {
    const normalized = entry.url.trim().toLowerCase().replace(/\/$/, "");
    let pathname = "";
    try {
      pathname = new URL(entry.url).pathname.toLowerCase().replace(/\/$/, "") || "/";
    } catch {
      pathname = normalized;
    }

    if (excludedSet.has(normalized) || excludedSet.has(pathname)) continue;
    if (seenUrls.has(normalized)) continue;
    seenUrls.add(normalized);
    finalSitemap.push(entry);
  }

  // Serialize to XML string
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const item of finalSitemap) {
    const dateStr = item.lastModified ? new Date(item.lastModified).toISOString() : now.toISOString();
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(item.url)}</loc>\n`;
    xml += `    <lastmod>${dateStr}</lastmod>\n`;
    if (item.changeFrequency) xml += `    <changefreq>${item.changeFrequency}</changefreq>\n`;
    if (typeof item.priority === "number") xml += `    <priority>${item.priority}</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += `</urlset>`;

  return xml;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
