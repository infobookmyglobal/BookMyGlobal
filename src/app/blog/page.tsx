import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaBand, PageHero } from "@/components/site/ui";
import { BlogClientPage, type BlogListItem } from "@/components/BlogClientPage";
import { WebPageJsonLd } from "@/components/JsonLd";
import { prisma } from "@/lib/prisma";
import { getSeoMetadata } from "@/lib/seo";
import { readingTime } from "@/lib/tiptap-html";
import { renderEmphasis } from "@/lib/cms-text";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("blog");
}

export default async function BlogFeedPage() {
  const rows = await prisma.blog
    .findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" } })
    .catch(() => []);

  // Only send what the list needs to the browser (not the full article bodies).
  const posts: BlogListItem[] = rows.map((b) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    featuredImageUrl: b.featuredImageUrl,
    category: b.category,
    tags: b.tags,
    date: (b.publishedAt || b.createdAt).toISOString(),
    readTime: readingTime(b.content),
  }));

  return (
    <>
      <WebPageJsonLd name="BookMyGlobal Journal" description="Practical guides on visas, attestation, travel planning and Rishikesh." urlPath="/blog" />
      <Header />
      <main>
        <PageHero
          eyebrow="The journal"
          title={renderEmphasis("Guides for the *well-prepared* traveller.")}
          intro="Practical, India-specific advice on visas, attestation, planning a trip and Rishikesh."
        />
        <BlogClientPage posts={posts} />
        <CtaBand title="Have a question the guides do not answer?" text="Ask us. We read every message." />
      </main>
      <Footer />
    </>
  );
}
