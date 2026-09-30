import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { UploadPortal } from "@/components/dashboard/UploadPortal";

export default async function UploadPage() {
  const { userId } = await auth();
  const user = await prisma.user.findUnique({
    where: { clerkId: userId! },
    include: {
      applications: {
        where: { status: { in: ["PENDING", "UNDER_REVIEW"] } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          productType: true,
          status: true,
          passportUrl: true,
          licenseUrl: true,
          profilePhotoUrl: true,
          adminNotes: true,
        },
      },
    },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-sora font-black text-navy text-2xl">Upload documents</h1>
      <UploadPortal applications={user?.applications ?? []} />
    </div>
  );
}
