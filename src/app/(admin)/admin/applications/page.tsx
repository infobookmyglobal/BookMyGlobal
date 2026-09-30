import { prisma } from "@/lib/prisma";
import { ApplicationsClient } from "@/components/admin/ApplicationsClient";
import { getPresignedDownloadUrl } from "@/lib/s3";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    productType?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
  }>;
}

export default async function AdminApplicationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = 15;
  const skip = (page - 1) * pageSize;

  const status = params.status || undefined;
  const productType = params.productType || undefined;
  const search = params.search || "";
  const SORTABLE = new Set(["createdAt", "fullName", "status", "finalAmount", "country", "id"]);
  const sortBy = SORTABLE.has(params.sortBy || "") ? (params.sortBy as string) : "createdAt";
  const sortDir = (params.sortDir || "desc") as "asc" | "desc";

  // Build the where clause dynamically
  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (productType) {
    where.productType = productType;
  }
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [applicationsRaw, totalCount] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip,
      take: pageSize,
      include: { payment: true },
    }),
    prisma.application.count({ where }),
  ]);

  // Find duplicates among the fetched applications
  const paymentIds = applicationsRaw
    .map(app => app.payment?.providerPaymentId)
    .filter(Boolean) as string[];

  const duplicateCounts = await prisma.payment.groupBy({
    by: ['providerPaymentId'],
    where: {
      providerPaymentId: { in: paymentIds },
    },
    _count: {
      id: true,
    },
  });

  const duplicateMap = new Map(
    duplicateCounts.map(item => [item.providerPaymentId, item._count.id])
  );

  // Convert raw private S3 keys into secure, temporary presigned download URLs for the admin view
  const applications = await Promise.all(
    applicationsRaw.map(async (app) => {
      let passportPresigned = app.passportUrl;
      let licensePresigned = app.licenseUrl;
      let profilePhotoPresigned = app.profilePhotoUrl;

      if (app.passportUrl && !app.passportUrl.startsWith("http")) {
        try {
          passportPresigned = await getPresignedDownloadUrl(app.passportUrl, 3600); // 1 hour
        } catch (e) {
          console.error("Failed to generate passport presigned URL:", e);
        }
      }
      if (app.licenseUrl && !app.licenseUrl.startsWith("http")) {
        try {
          licensePresigned = await getPresignedDownloadUrl(app.licenseUrl, 3600);
        } catch (e) {
          console.error("Failed to generate license presigned URL:", e);
        }
      }
      if (app.profilePhotoUrl && !app.profilePhotoUrl.startsWith("http")) {
        try {
          profilePhotoPresigned = await getPresignedDownloadUrl(app.profilePhotoUrl, 3600);
        } catch (e) {
          console.error("Failed to generate profile photo presigned URL:", e);
        }
      }
      const isDuplicate = app.payment?.providerPaymentId
        ? (duplicateMap.get(app.payment.providerPaymentId) || 0) > 1
        : false;

      return {
        ...app,
        passportUrl: passportPresigned,
        licenseUrl: licensePresigned,
        profilePhotoUrl: profilePhotoPresigned,
        isDuplicate,
      };
    })
  );

  return (
    <ApplicationsClient
      applications={applications}
      totalCount={totalCount}
      pageSize={pageSize}
      pageIndex={page - 1}
    />
  );
}
