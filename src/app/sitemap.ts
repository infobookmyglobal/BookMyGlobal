import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { CORE_ROUTES, SERVICE_ROUTES, RESERVED_PAGE_SLUGS } from '@/config/site-routes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bookmyglobal.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Check if raw XML override is enabled
  try {
    const overrideSettings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['sitemap_use_raw_override', 'sitemap_raw_xml_override'],
        },
      },
    });

    const overrideMap: Record<string, string> = {};
    overrideSettings.forEach((s) => {
      overrideMap[s.key] = s.value;
    });

    if (overrideMap['sitemap_use_raw_override'] === 'true' && overrideMap['sitemap_raw_xml_override']) {
      const rawXml = overrideMap['sitemap_raw_xml_override'];
      const parsedEntries: MetadataRoute.Sitemap = [];
      const urlRegex = /<url>([\s\S]*?)<\/url>/gi;
      let match;
      while ((match = urlRegex.exec(rawXml)) !== null) {
        const block = match[1];
        const locMatch = block.match(/<loc>(.*?)<\/loc>/i);
        const lastmodMatch = block.match(/<lastmod>(.*?)<\/lastmod>/i);
        const changefreqMatch = block.match(/<changefreq>(.*?)<\/changefreq>/i);
        const priorityMatch = block.match(/<priority>(.*?)<\/priority>/i);

        if (locMatch && locMatch[1]) {
          let parsedDate = now;
          if (lastmodMatch && lastmodMatch[1]) {
            const candidate = new Date(lastmodMatch[1].trim());
            if (!isNaN(candidate.getTime())) {
              parsedDate = candidate;
            }
          }
          parsedEntries.push({
            url: locMatch[1].trim(),
            lastModified: parsedDate,
            changeFrequency: (changefreqMatch?.[1]?.trim() as any) || 'monthly',
            priority: priorityMatch && priorityMatch[1] ? parseFloat(priorityMatch[1].trim()) : 0.7,
          });
        }
      }
      if (parsedEntries.length > 0) {
        return parsedEntries;
      }
    }
  } catch (err) {
    console.warn('Error reading raw sitemap override, falling back to dynamic generation:', err);
  }

  // Load Admin Sitemap Settings from Database
  let customEntries: Array<{
    url: string;
    lastModified?: string | Date;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
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
            'sitemap_custom_entries',
            'sitemap_excluded_urls',
            'sitemap_include_countries',
            'sitemap_include_blogs',
            'sitemap_include_pages',
            'sitemap_include_destinations',
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    if (settingsMap['sitemap_custom_entries']) {
      try {
        customEntries = JSON.parse(settingsMap['sitemap_custom_entries']);
      } catch {
        customEntries = [];
      }
    }

    if (settingsMap['sitemap_excluded_urls']) {
      try {
        excludedUrls = JSON.parse(settingsMap['sitemap_excluded_urls']);
      } catch {
        excludedUrls = [];
      }
    }

    if (settingsMap['sitemap_include_countries'] === 'false') includeCountries = false;
    if (settingsMap['sitemap_include_blogs'] === 'false') includeBlogs = false;
    if (settingsMap['sitemap_include_pages'] === 'false') includePages = false;
    if (settingsMap['sitemap_include_destinations'] === 'false') includeDestinations = false;
  } catch {
    /* DB fallback during build */
  }

  const excludedSet = new Set<string>();
  excludedUrls.forEach((u) => {
    const clean = u.trim().toLowerCase().replace(/\/$/, '');
    if (!clean) return;
    excludedSet.add(clean);
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      const pathWithSlash = clean.startsWith('/') ? clean : `/${clean}`;
      excludedSet.add(pathWithSlash);
      const fullUrl = `${APP_URL}${pathWithSlash}`.toLowerCase().replace(/\/$/, '');
      excludedSet.add(fullUrl);
    } else {
      try {
        const parsed = new URL(clean);
        excludedSet.add(parsed.pathname.toLowerCase().replace(/\/$/, '') || '/');
      } catch {}
    }
  });

  // Core static pages
  const staticPages: MetadataRoute.Sitemap = CORE_ROUTES.map((r) => ({
    url: `${APP_URL}${r.path === '/' ? '/' : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Service pages (toggle: 'Include service pages')
  const countryPages: MetadataRoute.Sitemap = includeCountries
    ? SERVICE_ROUTES.map((r) => ({
        url: `${APP_URL}${r.path}`,
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
      }))
    : [];

  // Blog posts (published only)
  let blogPages: MetadataRoute.Sitemap = [];
  if (includeBlogs) {
    try {
      const blogs = await prisma.blog.findMany({
        where: { status: 'PUBLISHED', publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
      });
      blogPages = blogs.map((b) => ({
        url: `${APP_URL}/blog/${b.slug}`,
        lastModified: b.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    } catch {
      /* DB fallback */
    }
  }

  // CMS Pages (active/published only)
  let cmsPages: MetadataRoute.Sitemap = [];
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
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        }));
    } catch {
      /* DB fallback */
    }
  }

  const destinationPages: MetadataRoute.Sitemap = [];
  void includeDestinations;

  // Parse Admin Custom Entries
  const activeCustomPages: MetadataRoute.Sitemap = customEntries
    .filter((entry) => entry.enabled !== false && entry.url)
    .map((entry) => {
      let fullUrl = entry.url.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `${APP_URL}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
      }
      return {
        url: fullUrl,
        lastModified: entry.lastModified ? new Date(entry.lastModified) : now,
        changeFrequency: entry.changeFrequency || 'monthly',
        priority: typeof entry.priority === 'number' ? entry.priority : 0.7,
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
  const finalSitemap: MetadataRoute.Sitemap = [];

  for (const entry of allEntries) {
    const normalized = entry.url.trim().toLowerCase().replace(/\/$/, '');
    let pathname = '';
    try {
      pathname = new URL(entry.url).pathname.toLowerCase().replace(/\/$/, '') || '/';
    } catch {
      pathname = normalized;
    }

    if (excludedSet.has(normalized) || excludedSet.has(pathname)) continue;
    if (seenUrls.has(normalized)) continue;
    seenUrls.add(normalized);
    finalSitemap.push(entry);
  }

  return finalSitemap;
}
