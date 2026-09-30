import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { CmsPageView } from "@/components/site/CmsPageView";
import { renderContentToHtml } from "@/lib/tiptap-html";
import { RESERVED_PAGE_SLUGS } from "@/config/site-routes";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bookmyglobal.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;
export const dynamic = "force-dynamic";

/** Drafts are visible only to signed-in admins. There is no development bypass. */
async function viewerIsAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } });
    return dbUser?.role === "ADMIN";
  } catch {
    return false;
  }
}

async function loadPage(slug: string) {
  if (RESERVED_PAGE_SLUGS.has(slug)) return null;
  return prisma.page.findUnique({ where: { slug } }).catch(() => null);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) return { title: "Page not found" };
  if (!page.isActive && !(await viewerIsAdmin())) return { title: "Page not found" };

  const title = page.seoTitle || page.title;
  const description = page.seoDescription || `${page.title} | BookMyGlobal`;
  const canonical = page.canonicalUrl || `${APP_URL}/${page.slug}`;
  const ogImg = page.ogImage || `${APP_URL}/og-home.jpg`;
  const robots = page.robots || "index, follow";
  const noindex = robots.includes("noindex") || !page.isActive;
  const nofollow = robots.includes("nofollow") || !page.isActive;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: !noindex, follow: !nofollow, googleBot: { index: !noindex, follow: !nofollow } },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: "BookMyGlobal",
      images: [{ url: ogImg, width: 1200, height: 630, alt: page.title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImg] },
  };
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) notFound();
  if (!page.isActive && !(await viewerIsAdmin())) notFound();

  const updated = new Date(page.updatedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <CmsPageView
      title={page.title}
      updatedLabel={`Last updated ${updated}`}
      html={renderContentToHtml(page.content)}
      isDraft={!page.isActive}
      structuredData={page.structuredData}
      jsonLdId={`cms-page-jsonld-${page.id}`}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: page.title,
        description: page.seoDescription || page.title,
        url: page.canonicalUrl || `${APP_URL}/${page.slug}`,
        publisher: { "@type": "Organization", name: "BookMyGlobal", url: APP_URL },
        dateModified: page.updatedAt.toISOString(),
        inLanguage: "en-IN",
      }}
    />
  );
}
