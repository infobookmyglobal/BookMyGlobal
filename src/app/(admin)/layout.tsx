import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminUnlocked } from "@/lib/admin-lock";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireRole("ADMIN");
  const isUnlocked = await isAdminUnlocked(admin.id);

  // Fetch pending review applications count for notification badge
  const pendingCount = await prisma.application.count({
    where: { status: "UNDER_REVIEW" },
  });

  return (
    <div className="legacy">
      <AdminLayoutShell pendingCount={pendingCount} isUnlocked={isUnlocked}>
        {children}
      </AdminLayoutShell>
    </div>
  );
}
