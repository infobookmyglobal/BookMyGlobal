import { prisma } from "@/lib/prisma";
import { MediaClient } from "@/components/admin/MediaClient";

export default async function AdminMediaPage() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <MediaClient media={media} />;
}
