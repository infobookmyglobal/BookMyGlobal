import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300; // 5-minute cache

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      where: { isActive: true },
      select: { id: true, title: true, slug: true, category: true },
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });

    // Group by category
    const grouped: Record<string, { id: string; title: string; slug: string }[]> = {};
    for (const page of pages) {
      const cat = page.category || "General";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({ id: page.id, title: page.title, slug: page.slug });
    }

    return NextResponse.json({ grouped, total: pages.length });
  } catch (err: any) {
    return NextResponse.json({ grouped: {}, total: 0 });
  }
}
