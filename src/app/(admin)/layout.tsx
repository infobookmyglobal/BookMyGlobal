import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminUnlocked } from "@/lib/admin-lock";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireRole("ADMIN");
  const isUnlocked = await isAdminUnlocked(admin.id);

  // Fetch pending review applications count for notification badge safely
  let pendingCount = 0;
  try {
    pendingCount = await prisma.application.count({
      where: { status: "UNDER_REVIEW" },
    });
  } catch (err) {
    console.error("[AdminLayout] Database error fetching pendingCount:", err);
  }

  return (
    <div className="legacy">
      <AdminLayoutShell pendingCount={pendingCount} isUnlocked={isUnlocked}>
        {children}
      </AdminLayoutShell>
    </div>
  );
}

