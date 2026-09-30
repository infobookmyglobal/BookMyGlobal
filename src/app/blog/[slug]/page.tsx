import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AlertTriangle, Clock } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container, CtaBand, Eyebrow } from "@/components/site/ui";
import { CustomStructuredData } from "@/components/JsonLd";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { prisma } from "@/lib/prisma";
import { getBlogAuthor } from "@/lib/utils";
import { readingTime, renderContentToHtml } from "@/lib/tiptap-html";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bookmyglobal.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

/** Drafts are visible only to signed-in admins. There is no development bypass. */
async function viewerIsAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;
    const u = await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } });
    return u?.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blog.findUnique({ where: { slug } }).catch(() => null);
  if (!post || post.status !== "PUBLISHED") return { title: "Article not found" };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || `${post.title} | BookMyGlobal journal`;
  const ogImg = post.ogImage || post.featuredImageUrl || `${APP_URL}/og-home.jpg`;
  const canonical = post.canonicalUrl || `${APP_URL}/blog/${post.slug}`;
  const robots = post.robots || "index, follow";
  const noindex = robots.includes("noindex");
  const nofollow = robots.includes("nofollow");

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: !noindex, follow: !nofollow, googleBot: { index: !noindex, follow: !nofollow } },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: "BookMyGlobal",
      images: [{ url: ogImg, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      section: post.category || "Travel",
      tags: post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImg] },
  };
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.blog.findMany({ where: { status: "PUBLISHED" }, select: { slug: true }, take: 50 });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  // Published posts are public; a draft is looked up only for admins.
  let post = await prisma.blog.findFirst({ where: { slug, status: "PUBLISHED" } });
  if (!post && (await viewerIsAdmin())) post = await prisma.blog.findUnique({ where: { slug } });
  if (!post) notFound();

  const html = renderContentToHtml(post.content);
  const tags = post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const author = getBlogAuthor(post.slug);
  const date = post.publishedAt || post.createdAt;

  const same = post.category
    ? await prisma.blog.findMany({
        where: { status: "PUBLISHED", NOT: { id: post.id }, category: post.category },
        take: 3,
        orderBy: { publishedAt: "desc" },
      })
    : [];
  const extra =
    same.length < 3
      ? await prisma.blog.findMany({
          where: { status: "PUBLISHED", id: { notIn: [post.id, ...same.map((p) => p.id)] } },
          take: 3 - same.length,
          orderBy: { publishedAt: "desc" },
        })
      : [];
  const related = [...same, ...extra];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt || "",
    image: post.ogImage || post.featuredImageUrl || `${APP_URL}/og-home.jpg`,
    datePublished: date.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: author, url: APP_URL },
    publisher: { "@type": "Organization", name: "BookMyGlobal", url: APP_URL, logo: { "@type": "ImageObject", url: `${APP_URL}/logo.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": post.canonicalUrl || `${APP_URL}/blog/${post.slug}` },
    keywords: post.tags || post.category || "",
    articleSection: post.category || "Travel",
    inLanguage: "en-IN",
  };

  return (
    <>
      {post.structuredData ? (
        <CustomStructuredData data={post.structuredData} />
      ) : (
        <script
          id={`article-jsonld-${post.id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <Header />
      <main className="bg-surface">
        {post.status !== "PUBLISHED" && (
          <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-secondary-container px-4 py-2 font-label-sm text-label-sm text-on-secondary-container">
            <AlertTriangle className="h-4 w-4" />
            Draft preview: visitors see a 404 for this post, only admins can view it.
          </div>
        )}

        <header className="pb-space-lg pt-32">
          <Container narrow>
            <nav aria-label="Breadcrumb" className="mb-space-md flex flex-wrap gap-2 font-label-sm text-label-sm text-on-surface-variant">
              <Link href="/" className="hover:text-primary">Home</Link><span aria-hidden>/</span>
              <Link href="/blog" className="hover:text-primary">Journal</Link>
            </nav>
            {post.category && <Eyebrow>{post.category}</Eyebrow>}
            <h1 className="mt-space-sm font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-primary md:font-headline-lg md:text-headline-lg lg:text-[3rem] lg:leading-[3.5rem]">{post.title}</h1>
            {post.excerpt && <p className="mt-space-md font-body-lg text-body-lg leading-relaxed text-on-surface-variant">{post.excerpt}</p>}
            <div className="mt-space-md flex flex-wrap items-center gap-x-3 gap-y-1 font-label-sm text-label-sm text-on-surface-variant">
              <span>{author}</span><span aria-hidden>·</span>
              <time dateTime={date.toISOString()}>{fmt(date)}</time><span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{readingTime(post.content)}</span>
            </div>
          </Container>
        </header>

        {post.featuredImageUrl && (
          <Container>
            <div className="relative mx-auto aspect-[21/9] w-full max-w-5xl overflow-hidden rounded-3xl bg-surface-container">
              <Image src={post.featuredImageUrl} alt={post.title} fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
            </div>
          </Container>
        )}

        <article className="pb-space-2xl pt-space-xl">
          <Container narrow>
            <div className="prose-bmg mx-auto max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />
            {tags.length > 0 && (
              <div className="mx-auto mt-space-xl flex max-w-3xl flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="rounded-full bg-surface-container px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">#{t}</span>
                ))}
              </div>
            )}
            <div className="mx-auto max-w-3xl"><AuthorBox /></div>
          </Container>
        </article>

        {related.length > 0 && (
          <section className="bg-surface-container-low py-space-2xl">
            <Container>
              <h2 className="mb-space-lg font-headline-md text-headline-md text-primary">Keep reading</h2>
              <div className="grid gap-space-md sm:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.id} href={`/blog/${r.slug}`} className="group overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    {r.featuredImageUrl && (
                      <div className="relative aspect-video">
                        <Image src={r.featuredImageUrl} alt={r.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                      </div>
                    )}
                    <div className="space-y-1 p-space-md">
                      {r.category && <span className="font-eyebrow text-eyebrow uppercase text-secondary">{r.category}</span>}
                      <h3 className="font-title-md text-title-md text-primary">{r.title}</h3>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{readingTime(r.content)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        )}
        <CtaBand title="Planning something?" text="Tell us about your trip and we will help with the documents and bookings." />
      </main>
      <Footer />
    </>
  );
}
