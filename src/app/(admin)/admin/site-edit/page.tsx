import { prisma } from "@/lib/prisma";
import { SiteEditClient } from "@/components/admin/SiteEditClient";

export const dynamic = "force-dynamic";

export default async function AdminSiteEditPage() {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        startsWith: "site_edit:",
      },
    },
  });

  const initialSettings: Record<string, string> = {};
  settings.forEach((s) => {
    initialSettings[s.key] = s.value;
  });

  return <SiteEditClient initialSettings={initialSettings} />;
}
