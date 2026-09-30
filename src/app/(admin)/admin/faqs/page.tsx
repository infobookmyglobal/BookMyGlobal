import { prisma } from "@/lib/prisma";
import { FaqsClient } from "@/components/admin/FaqsClient";

export default async function AdminFaqsPage() {
  const faqs = await prisma.fAQ.findMany({
    orderBy: { order: "asc" },
  });

  return <FaqsClient faqs={faqs} />;
}
