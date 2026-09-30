import { prisma } from "@/lib/prisma";
import { EnquiriesClient } from "@/components/admin/EnquiriesClient";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return <EnquiriesClient enquiries={JSON.parse(JSON.stringify(enquiries))} />;
}
