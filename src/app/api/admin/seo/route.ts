import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/** Map SEO pageKey → actual URL path to revalidate */
function getPagePath(pageKey: string): string {
  if (pageKey === "home") return "/";
  if (pageKey === "faqs") return "/faqs";
  return `/${pageKey}`;
}

export async function GET(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seo = await prisma.seoMeta.findMany({
    orderBy: { pageKey: "asc" },
  });

  return NextResponse.json(seo);
}

export async function POST(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { pageKey, title, description, ogTitle, ogDescription, ogImage, twitterCard, structuredData, canonicalUrl } = await req.json();
    if (!pageKey || !title || !description) {
      return NextResponse.json({ error: "Page key, title, and description are required" }, { status: 400 });
    }

    const seo = await prisma.seoMeta.upsert({
      where: { pageKey },
      update: {
        title,
        description,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImage: ogImage || null,
        twitterCard: twitterCard || "summary_large_image",
        structuredData: structuredData || null,
        canonicalUrl: canonicalUrl || null,
      },
      create: {
        pageKey,
        title,
        description,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImage: ogImage || null,
        twitterCard: twitterCard || "summary_large_image",
        structuredData: structuredData || null,
        canonicalUrl: canonicalUrl || null,
      },
    });

    // Revalidate the live page so changes appear immediately
    revalidatePath(getPagePath(pageKey));

    return NextResponse.json(seo);
  } catch (error: any) {
    console.error("SEO upsert failed:", error);
    return NextResponse.json({ error: error.message || "Failed to update SEO meta" }, { status: 500 });
  }
}

