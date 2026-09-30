import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/** Extract plain text from a Tiptap JSON string for SEO fallbacks */
function extractPlainText(content: string): string {
  if (!content) return "";
  if (!content.trim().startsWith("{")) return content;
  try {
    const doc = JSON.parse(content);
    const extract = (nodes: any[]): string => {
      if (!Array.isArray(nodes)) return "";
      return nodes
        .map((node) => {
          if (node.type === "text") return node.text || "";
          if (Array.isArray(node.content)) return extract(node.content);
          return "";
        })
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    };
    if (doc?.content) return extract(doc.content);
    return "";
  } catch {
    return content;
  }
}

export async function GET(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(blogs);
}

export async function POST(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      title,
      excerpt,
      content,
      featuredImageUrl,
      category,
      tags,
      seoTitle,
      seoDescription,
      ogImage,
      canonicalUrl,
      structuredData,
      robots,
      status,
      slug: reqSlug,
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const baseSlug = slugify(reqSlug || title, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    while (await prisma.blog.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // Build a clean seoDescription — never use raw JSON
    const plainText = extractPlainText(content);
    const resolvedSeoDesc = seoDescription?.trim()
      ? seoDescription.slice(0, 160)
      : excerpt?.trim()
      ? excerpt.slice(0, 160)
      : plainText.slice(0, 160);

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        featuredImageUrl: featuredImageUrl || null,
        category: category || "General",
        tags: tags || "",
        seoTitle: seoTitle?.trim() ? seoTitle.slice(0, 60) : title.slice(0, 60),
        seoDescription: resolvedSeoDesc,
        ogImage: ogImage || featuredImageUrl || null,
        canonicalUrl: canonicalUrl || null,
        structuredData: structuredData || null,
        robots: robots || "index, follow",
        status: status || "DRAFT",
        authorId: userId,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });

    revalidatePath(`/blog/${blog.slug}`);
    revalidatePath("/blog");

    return NextResponse.json(blog);
  } catch (error: any) {
    console.error("Blog creation failed:", error);
    return NextResponse.json({ error: error.message || "Failed to create blog post" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      id,
      title,
      excerpt,
      content,
      featuredImageUrl,
      category,
      tags,
      seoTitle,
      seoDescription,
      ogImage,
      canonicalUrl,
      structuredData,
      robots,
      status,
      slug: reqSlug,
    } = body;

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    let slug = existing.slug;
    if (reqSlug && reqSlug !== existing.slug) {
      const baseSlug = slugify(reqSlug, { lower: true, strict: true });
      slug = baseSlug;
      let count = 1;
      while (await prisma.blog.findUnique({ where: { slug, NOT: { id } } })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }
    } else if (!reqSlug && title && title !== existing.title) {
      const baseSlug = slugify(title, { lower: true, strict: true });
      slug = baseSlug;
      let count = 1;
      while (await prisma.blog.findUnique({ where: { slug, NOT: { id } } })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }
    }

    const resolvedContent = content || existing.content;
    const resolvedExcerpt = excerpt !== undefined ? excerpt : existing.excerpt;
    const plainText = extractPlainText(resolvedContent);

    const resolvedSeoDesc = seoDescription?.trim()
      ? seoDescription.slice(0, 160)
      : existing.seoDescription?.trim()
      ? existing.seoDescription
      : resolvedExcerpt?.trim()
      ? (resolvedExcerpt as string).slice(0, 160)
      : plainText.slice(0, 160);

    const newStatus = status || existing.status;
    const wasPublished = existing.status !== "PUBLISHED" && newStatus === "PUBLISHED";

    const updated = await prisma.blog.update({
      where: { id },
      data: {
        title: title || existing.title,
        slug,
        content: resolvedContent,
        excerpt: resolvedExcerpt,
        featuredImageUrl: featuredImageUrl !== undefined ? featuredImageUrl || null : existing.featuredImageUrl,
        category: category || existing.category,
        tags: tags !== undefined ? tags : existing.tags,
        seoTitle: seoTitle?.trim() ? seoTitle.slice(0, 60) : existing.seoTitle,
        seoDescription: resolvedSeoDesc,
        ogImage: ogImage !== undefined ? ogImage || null : existing.ogImage,
        canonicalUrl: canonicalUrl !== undefined ? canonicalUrl || null : existing.canonicalUrl,
        structuredData: structuredData !== undefined ? structuredData || null : existing.structuredData,
        robots: robots || existing.robots || "index, follow",
        status: newStatus,
        publishedAt: wasPublished ? new Date() : existing.publishedAt,
      },
    });

    revalidatePath(`/blog/${existing.slug}`);
    revalidatePath(`/blog/${updated.slug}`);
    revalidatePath("/blog");

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Blog update failed:", error);
    return NextResponse.json({ error: error.message || "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    await prisma.blog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
