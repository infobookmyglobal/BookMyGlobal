"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Edit, Trash2, Eye, FileText, CheckCircle, Clock, ExternalLink, Upload, Search } from "lucide-react";
import Link from "next/link";
import { BulkUploadModal } from "@/components/admin/BulkUploadModal";

interface PagesClientProps {
  pages: any[];
}

export function PagesClient({ pages }: PagesClientProps) {
  const router = useRouter();
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Page model uses isActive boolean, not a status string
  const handleToggleStatus = async (id: string, isActive: boolean) => {
    const nextStatus = isActive ? "DRAFT" : "PUBLISHED";
    try {
      const response = await fetch("/api/admin/pages", {
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const response = await fetch("/api/admin/pages", {
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

  const publishedCount = pages.filter((p) => p.isActive).length;
  const draftCount = pages.filter((p) => !p.isActive).length;

  // Extract unique categories from pages data
  const categories = Array.from(new Set(pages.map((p) => p.category || "General").filter(Boolean)));

  // Filter logic
  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.seoTitle && p.seoTitle.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PUBLISHED" && p.isActive) ||
      (statusFilter === "DRAFT" && !p.isActive);

    const matchesCategory =
      categoryFilter === "ALL" || (p.category || "General") === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-black text-navy text-2xl">Pages CMS</h1>
          <p className="text-muted text-xs mt-0.5">
            Manage standalone informational pages. Published pages are accessible at their slug URL.
          </p>
        </div>
        <div className="flex gap-3 self-start sm:self-auto">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue text-white rounded-xl font-black text-xs hover:bg-navy transition-colors"
            id="bulk-import-pages-btn"
          >
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
          <Link
            href="/admin/pages/new"
            className="btn-primary py-2.5 px-6 font-black text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Page
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-border-custom rounded-2xl px-4 py-3 flex items-center gap-3">
          <FileText className="w-4 h-4 text-muted" />
          <div>
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Total</p>
            <p className="font-black text-navy text-lg">{pages.length}</p>
          </div>
        </div>
        <div className="bg-white border border-border-custom rounded-2xl px-4 py-3 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <div>
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Published</p>
            <p className="font-black text-green-600 text-lg">{publishedCount}</p>
          </div>
        </div>
        <div className="bg-white border border-border-custom rounded-2xl px-4 py-3 flex items-center gap-3">
          <Clock className="w-4 h-4 text-amber-500" />
          <div>
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Drafts</p>
            <p className="font-black text-amber-600 text-lg">{draftCount}</p>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-border-custom rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-72 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search pages by title, slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-custom rounded-xl text-xs outline-none focus:border-blue bg-bg-custom/50 focus:bg-white transition-all font-bold"
          />
        </div>

        <div className="flex flex-wrap w-full md:w-auto gap-2 justify-end items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-border-custom bg-white rounded-xl px-3 py-2 text-xs font-bold text-navy outline-none focus:border-blue cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-border-custom bg-white rounded-xl px-3 py-2 text-xs font-bold text-navy outline-none focus:border-blue cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(searchTerm || statusFilter !== "ALL" || categoryFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
                setCategoryFilter("ALL");
              }}
              className="flex items-center gap-1.5 px-3 py-2 border border-border-custom bg-white hover:bg-bg-custom text-navy rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Info indicator */}
      <div className="flex items-center justify-between text-xs px-2">
        <span className="text-muted font-bold">
          Showing <span className="text-navy font-black">{filteredPages.length}</span> of{" "}
          <span className="text-navy font-black">{pages.length}</span> page{pages.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-border-custom rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-navy text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Page Title</th>
                <th className="px-6 py-4">Slug / URL</th>
                <th className="px-6 py-4">SEO</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom text-xs">
              {filteredPages.map((p) => (
                <tr key={p.id} className="hover:bg-bg-custom/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-black text-navy text-sm">{p.title}</div>
                    {p.seoTitle && (
                      <div className="text-[10px] text-muted mt-0.5 font-bold truncate max-w-[200px]">
                        🔍 {p.seoTitle}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-blue">/{p.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded w-fit ${
                          p.ogImage ? "bg-blue/10 text-blue" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {p.ogImage ? "✓ OG" : "No OG"}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded w-fit ${
                          p.robots?.includes("noindex")
                             ? "bg-red-100 text-red-500"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {p.robots || "index, follow"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {/* Toggle uses isActive boolean */}
                    <button
                      onClick={() => handleToggleStatus(p.id, p.isActive)}
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 transition-all hover:opacity-80 ${
                        p.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                      title={p.isActive ? "Click to set as Draft" : "Click to Publish"}
                    >
                      {p.isActive ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Published
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" /> Draft
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-muted font-bold">
                    {format(new Date(p.updatedAt), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <a
                        href={`/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-blue/10 text-blue rounded-lg transition-colors"
                        title={p.isActive ? "View live page" : "Preview draft page"}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/admin/pages/${p.id}/edit`}
                        className="p-1.5 hover:bg-bg-custom text-navy rounded-lg transition-colors"
                        title="Edit Page"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPages.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted font-bold">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 animate-pulse" />
                    No pages match your filter criteria.
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
        entityType="pages"
        onImportSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}

