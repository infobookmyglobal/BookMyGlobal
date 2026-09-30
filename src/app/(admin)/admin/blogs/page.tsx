import { prisma } from "@/lib/prisma";
import { BlogsClient } from "@/components/admin/BlogsClient";

export default async function AdminBlogsPage() {
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <BlogsClient blogs={blogs} />;
}
