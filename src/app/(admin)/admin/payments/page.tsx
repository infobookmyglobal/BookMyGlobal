import { prisma } from "@/lib/prisma";
import { PaymentsClient } from "@/components/admin/PaymentsClient";

interface PageProps {
  searchParams: Promise<{
    provider?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const provider = params.provider || undefined;
  const status = params.status || undefined;
  const search = params.search || "";

  const where: any = {};
  if (provider) where.provider = provider;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { providerPaymentId: { contains: search, mode: "insensitive" } },
      { providerOrderId: { contains: search, mode: "insensitive" } },
      {
        application: {
          fullName: { contains: search, mode: "insensitive" },
        },
      },
      {
        application: {
          email: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { application: true },
  });

  return <PaymentsClient payments={payments} />;
}

