import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    const results = [];
    for (const item of items) {
      if (!item.title || !item.content) {
        continue;
      }

      let slug = item.slug;
      if (!slug) {
        slug = slugify(item.title, { lower: true, strict: true });
      }
      slug = slug.toLowerCase().trim();

      // Clean leading slash/blog prefix if present
      while (true) {
        if (slug.startsWith("/blog/")) {
          slug = slug.substring(6);
        } else if (slug.startsWith("blog/")) {
          slug = slug.substring(5);
        } else if (slug.startsWith("/")) {
          slug = slug.substring(1);
        } else {
          break;
        }
      }

      const upserted = await prisma.blog.upsert({
        where: { slug },
        update: {
          title: item.title,
          content: item.content,
          excerpt: item.excerpt !== undefined ? item.excerpt : undefined,
          featuredImageUrl: item.featuredImageUrl !== undefined ? item.featuredImageUrl : undefined,
          category: item.category || "General",
          tags: item.tags || "",
          seoTitle: item.seoTitle || item.title.slice(0, 60),
          seoDescription: item.seoDescription || (item.excerpt ? item.excerpt.slice(0, 160) : ""),
          status: item.status || "DRAFT",
          publishedAt: item.status === "PUBLISHED" ? new Date() : null,
          structuredData: item.structuredData !== undefined ? (item.structuredData || null) : undefined,
        },
        create: {
          title: item.title,
          slug,
          content: item.content,
          excerpt: item.excerpt || null,
          featuredImageUrl: item.featuredImageUrl || null,
          category: item.category || "General",
          tags: item.tags || "",
          seoTitle: item.seoTitle || item.title.slice(0, 60),
          seoDescription: item.seoDescription || (item.excerpt ? item.excerpt.slice(0, 160) : ""),
          status: item.status || "DRAFT",
          authorId: userId,
          publishedAt: item.status === "PUBLISHED" ? new Date() : null,
          structuredData: item.structuredData || null,
        }
      });
      results.push(upserted);
    }

    return NextResponse.json({ success: true, count: results.length, data: results });
  } catch (error: any) {
    console.error("Blog bulk creation failed:", error);
    return NextResponse.json({ error: error.message || "Failed to create blog posts" }, { status: 500 });
  }
}
