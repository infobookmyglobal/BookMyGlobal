import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await checkRoleApi("ADMIN");
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "sitemap_custom_entries",
            "sitemap_excluded_urls",
            "sitemap_include_countries",
            "sitemap_include_blogs",
            "sitemap_include_pages",
            "sitemap_include_destinations",
            "sitemap_use_raw_override",
            "sitemap_raw_xml_override",
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      customEntries: JSON.parse(settingsMap["sitemap_custom_entries"] || "[]"),
      excludedUrls: JSON.parse(settingsMap["sitemap_excluded_urls"] || "[]"),
      includeCountries: settingsMap["sitemap_include_countries"] ?? "true",
      includeBlogs: settingsMap["sitemap_include_blogs"] ?? "true",
      includePages: settingsMap["sitemap_include_pages"] ?? "true",
      includeDestinations: settingsMap["sitemap_include_destinations"] ?? "true",
      useRawOverride: settingsMap["sitemap_use_raw_override"] === "true",
      rawXmlOverride: settingsMap["sitemap_raw_xml_override"] || "",
    });
  } catch (error: any) {
    console.error("Failed to load sitemap settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load sitemap settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkRoleApi("ADMIN");
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      customEntries,
      excludedUrls,
      includeCountries,
      includeBlogs,
      includePages,
      includeDestinations,
      useRawOverride,
      rawXmlOverride,
    } = body;

    const payload = [
      { key: "sitemap_custom_entries", value: JSON.stringify(customEntries || []) },
      { key: "sitemap_excluded_urls", value: JSON.stringify(excludedUrls || []) },
      { key: "sitemap_include_countries", value: String(includeCountries ?? "true") },
      { key: "sitemap_include_blogs", value: String(includeBlogs ?? "true") },
      { key: "sitemap_include_pages", value: String(includePages ?? "true") },
      { key: "sitemap_include_destinations", value: String(includeDestinations ?? "true") },
      { key: "sitemap_use_raw_override", value: String(useRawOverride ?? "false") },
      { key: "sitemap_raw_xml_override", value: String(rawXmlOverride ?? "") },
    ];

    await Promise.all(
      payload.map((item) =>
        prisma.setting.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: { key: item.key, value: item.value },
        })
      )
    );

    // Revalidate live sitemap.xml
    try {
      revalidatePath("/sitemap.xml");
      revalidatePath("/sitemap");
    } catch (revErr) {
      console.warn("Sitemap revalidation warning:", revErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to save sitemap settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save sitemap settings" },
      { status: 500 }
    );
  }
}
