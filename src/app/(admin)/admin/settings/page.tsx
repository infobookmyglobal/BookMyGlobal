import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/admin/SettingsClient";

export default async function AdminSettingsPage() {
  const settings = await prisma.setting.findMany({
    orderBy: { key: "asc" },
  });

  return <SettingsClient settings={settings} />;
}
