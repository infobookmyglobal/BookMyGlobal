import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

      // Clean leading slash
      while (true) {
        if (slug.startsWith("/")) {
          slug = slug.substring(1);
        } else {
          break;
        }
      }

      const isActive = item.status === "PUBLISHED" || item.isActive === true || item.isActive === "true";

      const upserted = await prisma.page.upsert({
        where: { slug },
        update: {
          title: item.title,
          content: item.content,
          category: item.category || "General",
          featuredImageUrl: item.featuredImageUrl !== undefined ? (item.featuredImageUrl || null) : undefined,
          seoTitle: item.seoTitle !== undefined ? (item.seoTitle || item.title.slice(0, 60)) : undefined,
          seoDescription: item.seoDescription !== undefined ? (item.seoDescription || "") : undefined,
          ogImage: item.ogImage !== undefined ? (item.ogImage || null) : undefined,
          canonicalUrl: item.canonicalUrl !== undefined ? (item.canonicalUrl || null) : undefined,
          robots: item.robots !== undefined ? (item.robots || "index, follow") : undefined,
          structuredData: item.structuredData !== undefined ? (item.structuredData || null) : undefined,
          isActive,
        },
        create: {
          title: item.title,
          slug,
          content: item.content,
          category: item.category || "General",
          featuredImageUrl: item.featuredImageUrl || null,
          seoTitle: item.seoTitle || item.title.slice(0, 60),
          seoDescription: item.seoDescription || "",
          ogImage: item.ogImage || null,
          canonicalUrl: item.canonicalUrl || null,
          robots: item.robots || "index, follow",
          structuredData: item.structuredData || null,
          isActive,
        }
      });
      
      revalidatePath(`/${upserted.slug}`);
      results.push(upserted);
    }

    revalidatePath("/");

    return NextResponse.json({ success: true, count: results.length, data: results });
  } catch (error: any) {
    console.error("Page bulk creation failed:", error);
    return NextResponse.json({ error: error.message || "Failed to create pages" }, { status: 500 });
  }
}
