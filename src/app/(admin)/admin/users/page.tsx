import { prisma } from "@/lib/prisma";
import { UsersClient } from "@/components/admin/UsersClient";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return <UsersClient users={users} />;
}
