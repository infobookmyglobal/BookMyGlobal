"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Edit, Trash2, Eye, FileText, CheckCircle, Clock, Upload, ExternalLink, Search, X } from "lucide-react";
import Link from "next/link";
import { BulkUploadModal } from "@/components/admin/BulkUploadModal";

interface BlogsClientProps {
  blogs: any[];
}

export function BlogsClient({ blogs }: BlogsClientProps) {
  const router = useRouter();
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const uniqueCategories = Array.from(new Set(blogs.map((b) => b.category).filter(Boolean))) as string[];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      !searchTerm ||
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || blog.status === statusFilter;

    const matchesCategory =
      categoryFilter === "ALL" || blog.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const response = await fetch("/api/admin/blogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (!response.ok) throw new Error("Status update failed");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const response = await fetch("/api/admin/blogs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-black text-navy text-2xl">Blogs</h1>
          <p className="text-muted text-xs">Publish journal articles and travel guides.</p>
        </div>
        <div className="flex gap-3 self-start sm:self-auto">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue text-white rounded-xl font-black text-xs hover:bg-navy transition-colors"
            id="bulk-import-blogs-btn"
          >
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
          <Link
            href="/admin/blogs/new"
            className="btn-primary py-2.5 px-6 font-black text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Post
          </Link>
        </div>
      </div>

      <div className="bg-white border border-border-custom rounded-3xl overflow-hidden shadow-sm">
        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-border-custom bg-bg-custom/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/60" />
            <input
              type="text"
              placeholder="Search articles by title, category, or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-border-custom bg-white rounded-xl pl-10 pr-8 py-2 outline-none focus:border-blue font-bold text-navy placeholder:text-muted/60 text-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-bg-custom rounded text-muted hover:text-navy"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-muted uppercase font-black tracking-wider">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-border-custom bg-white rounded-xl px-3 py-2 outline-none focus:border-blue font-black text-navy cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] text-muted uppercase font-black tracking-wider">Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-border-custom bg-white rounded-xl px-3 py-2 outline-none focus:border-blue font-black text-navy cursor-pointer max-w-[180px]"
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-navy text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">SEO</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Published</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom text-xs">
              {filteredBlogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-bg-custom/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-black text-navy text-sm">{blog.title}</div>
                    {blog.seoTitle && (
                      <div className="text-[10px] text-muted mt-0.5 font-bold truncate max-w-[200px]">🔍 {blog.seoTitle}</div>
                    )}
                    <div className="text-[10px] text-muted/60 font-mono mt-0.5 truncate max-w-[200px]">{blog.slug}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-navy/80">{blog.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded w-fit ${
                        blog.ogImage ? "bg-blue/10 text-blue" : "bg-gray-100 text-gray-400"
                      }`}>
                        {blog.ogImage ? "✓ OG" : "No OG"}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded w-fit ${
                        blog.robots?.includes("noindex") ? "bg-red-100 text-red-500" : "bg-green-100 text-green-600"
                      }`}>
                        {blog.robots || "index, follow"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(blog.id, blog.status)}
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 transition-all hover:opacity-80 ${
                        blog.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                      title={blog.status === "PUBLISHED" ? "Click to set as Draft" : "Click to Publish"}
                    >
                      {blog.status === "PUBLISHED" ? (
                        <><CheckCircle className="w-3.5 h-3.5" /> Published</>
                      ) : (
                        <><Clock className="w-3.5 h-3.5" /> Draft</>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-muted font-bold">
                    {blog.publishedAt ? format(new Date(blog.publishedAt), "MMM dd, yyyy") : "Not published"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 hover:bg-blue/10 text-blue rounded-lg transition-colors"
                        title="View live post"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/admin/blogs/${blog.id}/edit`}
                        className="p-1.5 hover:bg-bg-custom text-navy rounded-lg transition-colors"
                        title="Edit Article"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBlogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted font-bold">
                    {blogs.length === 0 
                      ? "No articles published yet. Let's create one!" 
                      : "No articles match the search/filter criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BulkUploadModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        entityType="blogs"
        onImportSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
