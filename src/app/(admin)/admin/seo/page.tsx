import { prisma } from "@/lib/prisma";
import { SeoClient } from "@/components/admin/SeoClient";

export default async function AdminSeoPage() {
  const seoRecords = await prisma.seoMeta.findMany({
    orderBy: { pageKey: "asc" },
  });

  return <SeoClient seoRecords={seoRecords} />;
}
