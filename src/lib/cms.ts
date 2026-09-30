import { prisma } from "@/lib/prisma";

/** Loads all `site_edit:<page>:*` settings for a page so server components can render CMS-editable copy. */
export async function getPageCms(page: string) {
  const prefix = `site_edit:${page}:`;
  let map: Record<string, string> = {};
  try {
    const rows = await prisma.setting.findMany({ where: { key: { startsWith: prefix } } });
    map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch (e) {
    console.error(`CMS load failed for ${page}:`, e);
  }
  return {
    /** Editable text with a default. */
    t: (name: string, fallback: string) => (map[prefix + name] && map[prefix + name].trim() ? map[prefix + name] : fallback),
    /** Section visibility toggle (defaults to visible). */
    show: (name: string) => map[`${prefix}show_${name}`] !== "false",
  };
}
