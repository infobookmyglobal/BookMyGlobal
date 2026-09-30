import { prisma } from "@/lib/prisma";
import { RedirectsClient } from "@/components/admin/RedirectsClient";
import { getAllCountryTravelGuideMap } from "@/lib/countryGuideRedirect";

export default async function AdminRedirectsPage() {
  const [settings, countries, pages] = await Promise.all([
    prisma.setting.findMany({
      orderBy: { key: "asc" },
    }),
    prisma.country.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        flag: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.page.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        title: true,
        category: true,
      },
      orderBy: { title: "asc" },
    }),
  ]);

  const autoGuideMap = await getAllCountryTravelGuideMap();

  return (
    <RedirectsClient
      settings={settings}
      countries={countries}
      travelGuides={pages}
      autoGuideMap={autoGuideMap}
    />
  );
}
