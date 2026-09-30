import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/components/admin/BlogForm";

export default async function NewBlogPostPage() {
  const blogs = await prisma.blog.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  const categories = blogs
    .map((b) => b.category)
    .filter((c): c is string => typeof c === "string" && c.trim() !== "");

  return <BlogForm existingCategories={categories} />;
}
