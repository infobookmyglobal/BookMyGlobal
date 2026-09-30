import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { revalidatePath } from "next/cache";

/** Extract plain text from a Tiptap JSON string for use in SEO fallbacks */
function extractPlainText(content: string): string {
  if (!content) return "";
  if (!content.trim().startsWith("{")) return content; // already plain text / HTML
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

  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      title,
      content,
      category,
      seoTitle,
      seoDescription,
      ogImage,
      canonicalUrl,
      structuredData,
      robots,
      status,
      featuredImageUrl,
      slug: reqSlug,
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const baseSlug = slugify(reqSlug || title, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    while (await prisma.page.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // Extract plain text for seoDescription fallback (avoids raw JSON bleed)
    const plainText = extractPlainText(content);
    const resolvedSeoDesc = seoDescription?.trim()
      ? seoDescription.slice(0, 160)
      : plainText.slice(0, 160);

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        category: category || "General",
        seoTitle: seoTitle?.trim() ? seoTitle.slice(0, 60) : title.slice(0, 60),
        seoDescription: resolvedSeoDesc,
        ogImage: ogImage || null,
        featuredImageUrl: featuredImageUrl || null,
        canonicalUrl: canonicalUrl || null,
        structuredData: structuredData || null,
        robots: robots || "index, follow",
        isActive: status === "PUBLISHED",
      },
    });

    // Revalidate the live page immediately
    revalidatePath(`/${page.slug}`);
    revalidatePath("/");

    return NextResponse.json(page);
  } catch (error: any) {
    console.error("Page creation failed:", error);
    return NextResponse.json({ error: error.message || "Failed to create page" }, { status: 500 });
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
      content,
      category,
      seoTitle,
      seoDescription,
      ogImage,
      canonicalUrl,
      structuredData,
      robots,
      status,
      featuredImageUrl,
      slug: reqSlug,
    } = body;

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    let slug = existing.slug;
    if (reqSlug && reqSlug !== existing.slug) {
      const baseSlug = slugify(reqSlug, { lower: true, strict: true });
      slug = baseSlug;
      let count = 1;
      while (await prisma.page.findUnique({ where: { slug, NOT: { id } } })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }
    } else if (!reqSlug && title && title !== existing.title) {
      const baseSlug = slugify(title, { lower: true, strict: true });
      slug = baseSlug;
      let count = 1;
      while (await prisma.page.findUnique({ where: { slug, NOT: { id } } })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }
    }

    // Extract plain text for fallback only if seoDescription is missing
    const resolvedContent = content || existing.content;
    const plainText = extractPlainText(resolvedContent);
    const resolvedSeoDesc =
      seoDescription?.trim()
        ? seoDescription.slice(0, 160)
        : existing.seoDescription?.trim()
        ? existing.seoDescription
        : plainText.slice(0, 160);

    const updated = await prisma.page.update({
      where: { id },
      data: {
        title: title || existing.title,
        slug,
        content: resolvedContent,
        category: category || existing.category || "General",
        seoTitle: seoTitle?.trim() ? seoTitle.slice(0, 60) : existing.seoTitle,
        seoDescription: resolvedSeoDesc,
        ogImage: ogImage !== undefined ? ogImage || null : existing.ogImage,
        featuredImageUrl: featuredImageUrl !== undefined ? featuredImageUrl || null : existing.featuredImageUrl,
        canonicalUrl: canonicalUrl !== undefined ? canonicalUrl || null : existing.canonicalUrl,
        structuredData: structuredData !== undefined ? structuredData || null : existing.structuredData,
        robots: robots || existing.robots || "index, follow",
        isActive: status !== undefined ? status === "PUBLISHED" : existing.isActive,
      },
    });

    // Revalidate both old slug (if title changed) and new slug
    revalidatePath(`/${existing.slug}`);
    revalidatePath(`/${updated.slug}`);
    revalidatePath("/");

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Page update failed:", error);
    return NextResponse.json({ error: error.message || "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    await prisma.page.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
