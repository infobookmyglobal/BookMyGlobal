import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.setting.findMany({
    orderBy: { key: "asc" },
  });

  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkRoleApi("ADMIN");
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Body must be an array of settings key-value entries" }, { status: 400 });
    }

    const validItems = body.filter(
      (item) => item && typeof item.key === "string" && item.key.trim() !== ""
    );

    // Upsert items using high-performance parallel chunk processing
    if (validItems.length > 0) {
      const chunkSize = 20;
      for (let i = 0; i < validItems.length; i += chunkSize) {
        const chunk = validItems.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map((item) => {
            const valStr = item.value === undefined || item.value === null ? "" : String(item.value);
            return prisma.setting.upsert({
              where: { key: item.key },
              update: { value: valStr },
              create: { key: item.key, value: valStr },
            });
          })
        );
      }
    }

    // Revalidate public page caches
    try {
      revalidatePath("/");
      revalidatePath("/contact");
    } catch (revErr) {
      console.warn("Revalidation warning:", revErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Settings update failed:", error);
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
