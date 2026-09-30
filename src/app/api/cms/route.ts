import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: "site_edit:",
        },
      },
    });

    const cmsData: Record<string, string> = {};
    settings.forEach((s) => {
      cmsData[s.key] = s.value;
    });

    return NextResponse.json(cmsData);
  } catch (e) {
    // Return empty fallback dictionary when database is connecting or unavailable
    return NextResponse.json({});
  }
}
