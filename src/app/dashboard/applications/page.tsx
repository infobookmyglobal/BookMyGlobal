import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getPresignedDownloadUrl } from "@/lib/s3";
import { ApplicationsTableClient } from "@/components/dashboard/ApplicationsTableClient";

export default async function ApplicationsPage() {
  const { userId } = await auth();
  const user = await prisma.user.findUnique({
    where: { clerkId: userId! },
    include: { applications: { orderBy: { createdAt: "desc" }, include: { payment: true } } },
  });

  const apps = user?.applications ?? [];

  // Convert raw private S3 keys into secure, temporary presigned download URLs for the user view
  const appsWithUrls = await Promise.all(
    apps.map(async (app) => {
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

      return {
        ...app,
        passportUrl: passportPresigned,
        licenseUrl: licensePresigned,
        profilePhotoUrl: profilePhotoPresigned,
      };
    })
  );

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-sora font-black text-navy text-2xl">My requests</h1>
        <Link href="/apply" className="btn-primary px-5 py-2.5 text-sm">+ New request</Link>
      </div>

      {appsWithUrls.length === 0 ? (
        <div className="bg-white border border-border-custom rounded-2xl p-10 text-center">
          <p className="text-muted">No requests yet.</p>
          <Link href="/apply" className="btn-primary inline-block mt-4 px-6 py-3">Start a request</Link>
        </div>
      ) : (
        <ApplicationsTableClient applications={appsWithUrls} />
      )}
    </div>
  );
}

