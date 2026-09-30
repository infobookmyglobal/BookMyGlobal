import { prisma } from "@/lib/prisma";
import { PartnersClient } from "@/components/admin/PartnersClient";

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { totalReferrals: "desc" },
  });

  return <PartnersClient partners={partners} />;
}
