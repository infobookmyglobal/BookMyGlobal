import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CmsPageView } from "@/components/site/CmsPageView";
import { getSeoMetadata } from "@/lib/seo";
import { getLegalDefault, LEGAL_UPDATED } from "@/config/legal";
import { renderContentToHtml } from "@/lib/tiptap-html";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("privacy");
}

export default async function Page() {
  const fallback = getLegalDefault("privacy");
  // An active page with the same slug created in Admin → Pages overrides the built-in text.
  let override: { title: string; content: string; updatedAt: Date } | null = null;
  try {
    const p = await prisma.page.findUnique({ where: { slug: "privacy" } });
    if (p && p.isActive) override = { title: p.title, content: p.content, updatedAt: p.updatedAt };
  } catch {
    override = null;
  }

  return (
    <CmsPageView
      title={override?.title || fallback.title}
      intro={override ? undefined : fallback.intro}
      updatedLabel={
        override
          ? `Last updated ${override.updatedAt.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`
          : `Last updated ${LEGAL_UPDATED}`
      }
      html={override ? renderContentToHtml(override.content) : fallback.html}
      cta={false}
    />
  );
}
