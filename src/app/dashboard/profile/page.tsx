import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default async function ProfilePage() {
  const { userId } = await auth();
  const clerkUser = await currentUser();
  const user = await prisma.user.findUnique({ where: { clerkId: userId! } });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-sora font-black text-navy text-2xl">Profile Settings</h1>

      <div className="bg-white border border-border-custom rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-custom">
          {clerkUser?.imageUrl && (
            <img src={clerkUser.imageUrl} alt="Profile" className="w-14 h-14 rounded-full" />
          )}
          <div>
            <p className="font-sora font-black text-navy text-lg">{clerkUser?.fullName}</p>
            <p className="text-sm text-muted">{clerkUser?.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>

        <ProfileForm
          userId={userId!}
          initialData={{
            name: user?.name || clerkUser?.fullName || "",
            phone: user?.phone || "",
            country: user?.country || "",
          }}
        />
      </div>
    </div>
  );
}
