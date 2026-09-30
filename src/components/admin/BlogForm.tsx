"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./RichTextEditor";
import {
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  Image as ImageIcon,
  Globe,
  Search,
  Link2,
  Bot,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/utils";

interface BlogFormProps {
  initialData?: any;
  existingCategories?: string[];
}

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://bookmyglobal.com";

/** Strip any HTML tags and decode HTML entities from a schema string before saving. */
function sanitizeSchema(value: string): string {
  return value
    .replace(/<[^>]+>/gi, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

function cleanSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric, except spaces and hyphens
    .replace(/[\s_]+/g, "-")  // replace spaces/underscores with hyphens
    .replace(/-+/g, "-");     // remove duplicate hyphens
}

function SeoScoreIndicator({ title, description, slug }: { title: string; description: string; slug: string }) {
  const titleLen = title.length;
  const descLen = description.length;
  const titleOk = titleLen >= 30 && titleLen <= 60;
  const descOk = descLen >= 80 && descLen <= 160;
  const score = (titleOk ? 50 : 0) + (descOk ? 50 : 0);

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">SEO Score</span>
        <span
          className={`text-xs font-black ${
            score === 100 ? "text-green-600" : score >= 50 ? "text-amber-500" : "text-red-500"
          }`}
        >
          {score}/100
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[10px] font-bold">
          {titleOk ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          )}
          <span className={titleOk ? "text-green-600" : "text-amber-600"}>
            Title: {titleLen}/60 chars {titleLen < 30 ? "(too short)" : titleLen > 60 ? "(too long)" : "✓"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold">
          {descOk ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          )}
          <span className={descOk ? "text-green-600" : "text-amber-600"}>
            Desc: {descLen}/160 chars {descLen < 80 ? "(too short)" : descLen > 160 ? "(too long)" : "✓"}
          </span>
        </div>
      </div>

      {/* SERP Preview */}
      {(title || description) && (
        <div className="bg-white border border-border-custom rounded-xl p-3 space-y-1">
          <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-2">
            Google Preview
          </p>
          <p className="text-blue text-sm font-bold leading-tight line-clamp-1">
            {title || "Blog Post Title"}
          </p>
          <p className="text-green-700 text-[10px] font-bold">
            {APP_URL}/blog/{slug || "..."}
          </p>
          <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">
            {description || "Your meta description will appear here..."}
          </p>
        </div>
      )}
    </div>
  );
}

export function BlogForm({ initialData, existingCategories }: BlogFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const DEFAULT_CATEGORIES = ["Visas", "Attestation", "Travel Tips", "Rishikesh"];
  const allCategories = Array.from(new Set([
    ...(existingCategories || []),
    ...DEFAULT_CATEGORIES,
    ...(initialData?.category ? [initialData.category] : [])
  ]));

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isManualSlug, setIsManualSlug] = useState(!!initialData);
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initialData?.featuredImageUrl || "");
  const [category, setCategory] = useState(initialData?.category || allCategories[0] || "Travel Tips");
  const [customCategory, setCustomCategory] = useState("");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [ogImage, setOgImage] = useState(initialData?.ogImage || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || "");
  const [robots, setRobots] = useState(initialData?.robots || "index, follow");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initialData?.status || "DRAFT");
  const [structuredData, setStructuredData] = useState(initialData?.structuredData || "");

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const key = `uploads/blog-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const presignResponse = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, mimeType: file.type }),
      });

      if (!presignResponse.ok) throw new Error("Failed to get presigned URL");
      const { uploadUrl, cloudFrontUrl } = await presignResponse.json();

      const uploadResult = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResult.ok) throw new Error("Upload to S3 failed");
      setFeaturedImageUrl(cloudFrontUrl);
      // Auto-populate OG image if not set
      if (!ogImage) setOgImage(cloudFrontUrl);
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg("Title and content are required!");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSavedOk(false);

    try {
      const payload = {
        id: initialData?.id,
        title,
        excerpt,
        content,
        featuredImageUrl,
        category: category === "__custom__" ? customCategory : category,
        tags,
        seoTitle: seoTitle || title.slice(0, 60),
        seoDescription: seoDescription || excerpt.slice(0, 160),
        ogImage: ogImage || featuredImageUrl || "",
        canonicalUrl,
        structuredData: sanitizeSchema(structuredData),
        robots,
        status,
        slug,
      };

      const response = await fetch("/api/admin/blogs", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMsg = await getApiErrorMessage(response);
        throw new Error(errorMsg);
      }

      setSavedOk(true);
      setTimeout(() => {
        router.push("/admin/blogs");
        router.refresh();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl text-xs font-bold text-navy">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-custom pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blogs"
            className="p-2 border border-border-custom bg-white hover:bg-bg-custom rounded-xl transition-all"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-navy" />
          </Link>
          <div>
            <h1 className="font-sora font-black text-navy text-xl">
              {isEdit ? "Edit Post" : "Create New Post"}
            </h1>
            <p className="text-muted text-[10px]">Author article logs, featured highlights and SEO indexing settings.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedOk && (
            <span className="flex items-center gap-1.5 text-green-600 text-xs font-black">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}
          {errorMsg && (
            <span className="flex items-center gap-1.5 text-red-500 text-xs font-bold max-w-xs truncate">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary py-2.5 px-6 font-black flex items-center gap-1.5 shadow-md shadow-blue/10"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? "Save Updates" : "Publish Post"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-muted">Post Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!isEdit && !isManualSlug) {
                  setSlug(cleanSlug(e.target.value));
                }
              }}
              placeholder="Apostille vs attestation: which one do you need?"
              className="w-full border border-border-custom bg-white rounded-xl px-4 py-3 outline-none focus:border-blue text-sm font-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted">URL Slug (Permalink)</label>
            <div className="flex items-center gap-2">
              <span className="text-muted text-xs select-none">{APP_URL}/blog/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(cleanSlug(e.target.value));
                  setIsManualSlug(true);
                }}
                placeholder="apostille-vs-attestation"
                className="w-full border border-border-custom bg-white rounded-xl px-4 py-2.5 outline-none focus:border-blue font-mono text-xs font-bold"
              />
            </div>
            <p className="text-[10px] text-muted">
              The slug is the blog post URL identifier. Example: {APP_URL}/blog/{slug || "your-slug"}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-muted flex items-center justify-between">
              Excerpt (Summary — used as meta description fallback)
              <span className={`text-[10px] ${excerpt.length > 160 ? "text-red-500" : excerpt.length > 80 ? "text-green-600" : "text-muted"}`}>
                {excerpt.length}/160
              </span>
            </label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief summary of your post (max 160 chars)..."
              maxLength={160}
              className="w-full border border-border-custom bg-white rounded-xl p-3 outline-none focus:border-blue resize-none font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted">Content Body</label>
            <RichTextEditor content={content} onChange={(val) => setContent(val)} />
          </div>
        </div>

        {/* Right: Settings */}
        <div className="space-y-5">
          {/* Publish Options */}
          <div className="bg-white border border-border-custom rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-sora font-black text-navy text-xs uppercase tracking-wider border-b border-border-custom pb-2 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> Publish Options
            </h3>

            <div className="space-y-2">
              <label className="text-muted">Publish Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                className="w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 outline-none focus:border-blue font-bold"
              >
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="PUBLISHED">Published (Live)</option>
              </select>
              <p className="text-[10px] text-muted">
                {status === "PUBLISHED"
                  ? "✅ Post is live and indexed by search engines."
                  : "🔒 Post is saved as draft and hidden from public."}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-muted">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategory(val);
                  if (val !== "__custom__") setCustomCategory("");
                }}
                className="w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 outline-none focus:border-blue font-bold animate-fade-in"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    📁 {cat}
                  </option>
                ))}
                <option value="__custom__">➕ Add Custom Category…</option>
              </select>
              {category === "__custom__" && (
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Road Trips, Car Rentals…"
                  className="w-full border border-border-custom bg-white rounded-xl px-3 py-2.5 outline-none focus:border-blue font-bold"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-muted">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="visa, attestation, india"
                className="w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 outline-none focus:border-blue font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-muted flex items-center gap-1.5">
                <Bot className="w-3 h-3" /> Robots Directive
              </label>
              <select
                value={robots}
                onChange={(e) => setRobots(e.target.value)}
                className="w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 outline-none focus:border-blue font-bold"
              >
                <option value="index, follow">Index + Follow (Default)</option>
                <option value="noindex, follow">No Index + Follow</option>
                <option value="index, nofollow">Index + No Follow</option>
                <option value="noindex, nofollow">No Index + No Follow</option>
              </select>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white border border-border-custom rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-sora font-black text-navy text-xs uppercase tracking-wider border-b border-border-custom pb-2 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" /> Featured Image
            </h3>
            {featuredImageUrl ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-border-custom bg-bg-custom">
                <img src={featuredImageUrl} alt="Featured" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFeaturedImageUrl("")}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white font-black px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider transition-all"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-border-custom hover:border-blue bg-bg-custom/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-blue animate-spin mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-muted mb-2" />
                )}
                <span className="font-bold text-navy">Click to upload featured image</span>
                <span className="text-[10px] text-muted mt-1">PNG, JPG or WEBP (Max 10MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* SEO */}
          <div className="bg-white border border-border-custom rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-sora font-black text-navy text-xs uppercase tracking-wider border-b border-border-custom pb-2 flex items-center gap-2">
              <Search className="w-3.5 h-3.5" /> Search Indexing (SEO)
            </h3>

            <div className="space-y-2">
              <label className="text-muted flex items-center justify-between">
                SEO Title
                <span className={`text-[10px] ${seoTitle.length > 60 ? "text-red-500" : seoTitle.length > 40 ? "text-green-600" : "text-muted"}`}>
                  {seoTitle.length}/60
                </span>
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                maxLength={60}
                placeholder="Apostille vs attestation | BookMyGlobal"
                className="w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 outline-none focus:border-blue font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-muted flex items-center justify-between">
                Meta Description
                <span className={`text-[10px] ${seoDescription.length > 160 ? "text-red-500" : seoDescription.length > 80 ? "text-green-600" : "text-muted"}`}>
                  {seoDescription.length}/160
                </span>
              </label>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                maxLength={160}
                placeholder="A plain-English guide to which authentication your documents need."
                className="w-full border border-border-custom bg-bg-custom rounded-xl p-3 outline-none focus:border-blue font-bold resize-none"
              />
            </div>

            <SeoScoreIndicator title={seoTitle || title} description={seoDescription || excerpt} slug={slug} />
          </div>

          {/* Social / OG */}
          <div className="bg-white border border-border-custom rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-sora font-black text-navy text-xs uppercase tracking-wider border-b border-border-custom pb-2 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" /> Social Sharing (OG)
            </h3>

            <div className="space-y-2">
              <label className="text-muted">OG / Twitter Card Image URL</label>
              <input
                type="url"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="https://cdn.example.com/og-blog.jpg"
                className="w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 outline-none focus:border-blue font-bold"
              />
              <p className="text-[10px] text-muted">
                Defaults to featured image if left empty. Recommended: 1200×630px.
              </p>
            </div>

            {ogImage && (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border-custom bg-bg-custom">
                <img src={ogImage} alt="OG Preview" className="w-full h-full object-cover" onError={(e: any) => { e.target.style.display = 'none'; }} />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-muted">Canonical URL (optional)</label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder={`${APP_URL}/blog/${slug || "post-slug"}`}
                className="w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 outline-none focus:border-blue font-bold"
              />
              <p className="text-[10px] text-muted">Leave empty to auto-generate from post slug.</p>
            </div>

            <div className="space-y-2 border-t border-border-custom pt-4">
              <label className="text-muted flex items-center justify-between">
                Structured Data / JSON-LD Schema (Optional)
                {structuredData.trim() && (() => {
                  const cleaned = structuredData
                    .replace(/<[^>]+>/gi, "")
                    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                    .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
                    .trim();
                  let valid = false;
                  try { JSON.parse(cleaned); valid = true; } catch {}
                  return (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {valid ? "✓ Valid JSON-LD" : "✗ Invalid JSON"}
                    </span>
                  );
                })()}
              </label>
              <textarea
                rows={5}
                value={structuredData}
                onChange={(e) => setStructuredData(e.target.value)}
                placeholder='e.g. { "@context": "https://schema.org", "@type": "BlogPosting", ... }'
                className="w-full border border-border-custom bg-bg-custom rounded-xl p-3 outline-none focus:border-blue font-bold font-mono text-[11px] resize-y"
              />
              <p className="text-[10px] text-slate-400 font-medium">
                Paste raw JSON-LD object <strong>or</strong> the full &lt;script&gt; block — wrapper tags are stripped automatically before saving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
