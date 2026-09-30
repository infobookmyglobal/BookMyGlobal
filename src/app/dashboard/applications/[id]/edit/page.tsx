import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EditApplicationClient } from "./EditApplicationClient";

export default async function EditApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    return (
      <div className="max-w-2xl text-center py-20">
        <h2 className="text-2xl font-black text-navy mb-4">Request not found</h2>
        <p className="text-muted">The request you are trying to edit does not exist.</p>
      </div>
    );
  }

  if (application.userId !== user.id) {
    return (
      <div className="max-w-2xl text-center py-20">
        <h2 className="text-2xl font-black text-red-600 mb-4">Access Denied</h2>
        <p className="text-muted">You do not have permission to edit this request.</p>
      </div>
    );
  }

  if (application.status !== "PENDING" && application.status !== "UNDER_REVIEW") {
    return (
      <div className="max-w-2xl text-center py-20">
        <h2 className="text-2xl font-black text-orange-600 mb-4">Editing Disabled</h2>
        <p className="text-muted">This request has already been approved and can no longer be edited. Message us if something needs changing.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-sora font-black text-navy text-2xl">Edit request</h1>
        <p className="text-muted text-sm mt-1">
          Update the details of request #{application.id.slice(-8).toUpperCase()}
        </p>
      </div>
      
      <div className="bg-white border border-border-custom rounded-3xl p-6 md:p-8 shadow-sm">
        <EditApplicationClient application={application} />
      </div>
    </div>
  );
}

