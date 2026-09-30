"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Search, X } from "lucide-react";
import { getBlogAuthor } from "@/lib/utils";

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  category: string | null;
  tags: string;
  date: string;
  readTime: string;
}

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function BlogClientPage({ posts }: { posts: BlogListItem[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(posts.map((p) => p.category).filter((c): c is string => !!c)))], [posts]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (!needle) return true;
      return [p.title, p.excerpt, p.category, p.tags].some((v) => v && v.toLowerCase().includes(needle));
    });
  }, [posts, q, cat]);

  const filtering = cat !== "All" || q.trim() !== "";
  const [featured, ...rest] = filtered;

  return (
    <section className="bg-surface pb-space-2xl">
      <div className="mx-auto w-full max-w-7xl space-y-space-xl px-margin-mobile md:px-margin-tablet lg:px-margin">
        {posts.length > 0 && (
          <div className="flex flex-col gap-space-md rounded-2xl bg-surface-container-low p-space-md md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search the journal"
                aria-label="Search articles"
                className="w-full rounded-full bg-surface-container-lowest py-3 pl-12 pr-10 font-body-md text-body-md text-primary placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-secondary"
              />
              {q && (
                <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCat(c)}
                    className={`shrink-0 rounded-full px-4 py-2 font-label-md text-label-md transition-colors ${
                      cat === c ? "bg-primary-container text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl bg-surface-container-low p-space-xl text-center">
            <BookOpen className="mx-auto mb-space-sm h-12 w-12 text-outline" />
            <h2 className="font-headline-sm text-headline-sm text-primary">Articles are on their way</h2>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Check back soon for guides on visas, attestation and travel planning.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl bg-surface-container-low p-space-xl text-center">
            <h2 className="font-headline-sm text-headline-sm text-primary">No matching articles</h2>
            <button type="button" onClick={() => { setQ(""); setCat("All"); }} className="mt-space-md rounded-full bg-secondary-container px-6 py-3 font-label-md text-label-md text-on-secondary-container">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {!filtering && featured && <Featured post={featured} />}
            <div className="grid gap-space-md sm:grid-cols-2 lg:grid-cols-3">
              {(filtering ? filtered : rest).map((p) => <Card key={p.id} post={p} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Cover({ post, priority = false }: { post: BlogListItem; priority?: boolean }) {
  return post.featuredImageUrl ? (
    <Image src={post.featuredImageUrl} alt={post.title} fill priority={priority} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary-fixed via-surface-container to-primary-fixed">
      <BookOpen className="h-12 w-12 text-primary/30" />
    </div>
  );
}

function Meta({ post }: { post: BlogListItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-label-sm text-label-sm text-on-surface-variant">
      <span>{getBlogAuthor(post.slug)}</span>
      <span aria-hidden>·</span>
      <span>{fmt(post.date)}</span>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readTime}</span>
    </div>
  );
}

function Featured({ post }: { post: BlogListItem }) {
  return (
    <article className="group grid overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-lg md:grid-cols-2">
      <div className="relative min-h-[260px] md:min-h-[420px]">
        <Cover post={post} priority />
        {post.category && <span className="absolute left-4 top-4 rounded-full bg-secondary-container px-3 py-1 font-eyebrow text-eyebrow uppercase text-on-secondary-container">{post.category}</span>}
      </div>
      <div className="flex flex-col justify-center space-y-space-sm p-space-lg md:p-space-xl">
        <Meta post={post} />
        <h2 className="font-headline-md text-headline-md text-primary"><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
        {post.excerpt && <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">{post.excerpt}</p>}
        <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 pt-space-sm font-label-md text-label-md text-secondary">
          Read the article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

function Card({ post }: { post: BlogListItem }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-video">
        <Cover post={post} />
        {post.category && <span className="absolute left-3 top-3 rounded-full bg-surface-container-lowest/90 px-2.5 py-0.5 font-eyebrow text-[10px] uppercase text-primary">{post.category}</span>}
      </div>
      <div className="flex flex-1 flex-col space-y-space-sm p-space-md">
        <Meta post={post} />
        <h3 className="font-title-md text-title-md text-primary"><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
        {post.excerpt && <p className="line-clamp-3 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">{post.excerpt}</p>}
      </div>
    </article>
  );
}
