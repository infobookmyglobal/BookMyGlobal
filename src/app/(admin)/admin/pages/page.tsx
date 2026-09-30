import { prisma } from "@/lib/prisma";
import { PagesClient } from "@/components/admin/PagesClient";

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return <PagesClient pages={pages} />;
}
