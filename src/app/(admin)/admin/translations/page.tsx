import { prisma } from "@/lib/prisma";
import { TranslationsClient } from "@/components/admin/TranslationsClient";

export default async function AdminTranslationsPage() {
  const translations = await prisma.translation.findMany({
    where: { language: "en" },
    orderBy: { key: "asc" },
  });

  return <TranslationsClient initialTranslations={translations} />;
}
