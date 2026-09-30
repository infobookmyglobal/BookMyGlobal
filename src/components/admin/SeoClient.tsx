"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Save, Settings, Loader2, Check } from "lucide-react";

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

const SEO_PAGE_KEYS = [
  "home", "services", "how-it-works", "about", "yoga-retreats", "community", "blog",
  "faqs", "contact", "apply", "partner-program", "terms", "privacy", "refunds", "disclaimer",
];

interface SeoClientProps {
  seoRecords: any[];
}

export function SeoClient({ seoRecords }: SeoClientProps) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState(seoRecords[0]?.pageKey || "home");
  
  const currentRecord = seoRecords.find((r) => r.pageKey === selectedKey) || {
    pageKey: selectedKey,
    title: "",
    description: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    structuredData: "",
    canonicalUrl: "",
  };

  const [title, setTitle] = useState(currentRecord.title);
  const [description, setDescription] = useState(currentRecord.description);
  const [ogTitle, setOgTitle] = useState(currentRecord.ogTitle || "");
  const [ogDescription, setOgDescription] = useState(currentRecord.ogDescription || "");
  const [ogImage, setOgImage] = useState(currentRecord.ogImage || "");
  const [twitterCard, setTwitterCard] = useState(currentRecord.twitterCard || "summary_large_image");
  const [structuredData, setStructuredData] = useState(currentRecord.structuredData || "");
  const [canonicalUrl, setCanonicalUrl] = useState(currentRecord.canonicalUrl || "");

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // When selected key changes, load record state
  const handleKeyChange = (key: string) => {
    setSelectedKey(key);
    const found = seoRecords.find((r) => r.pageKey === key) || {
      pageKey: key,
      title: "",
      description: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: "summary_large_image",
      structuredData: "",
      canonicalUrl: "",
    };
    setTitle(found.title);
    setDescription(found.description);
    setOgTitle(found.ogTitle || "");
    setOgDescription(found.ogDescription || "");
    setOgImage(found.ogImage || "");
    setTwitterCard(found.twitterCard || "summary_large_image");
    setStructuredData(found.structuredData || "");
    setCanonicalUrl(found.canonicalUrl || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageKey: selectedKey,
          title,
          description,
          ogTitle,
          ogDescription,
          ogImage,
          twitterCard,
          structuredData: sanitizeSchema(structuredData),
          canonicalUrl,
        }),
      });

      if (!response.ok) throw new Error("Save failed");

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-xs font-bold text-navy">
      <div>
        <h1 className="font-sora font-black text-navy text-2xl font-black">Search Engine SEO</h1>
        <p className="text-muted text-[10px]">Optimize public web indexing tags, Twitter cards and graph headers.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Page selector sidebar */}
        <div className="bg-white border border-border-custom rounded-3xl p-4 shadow-sm h-fit space-y-1">
          <h3 className="text-[10px] text-muted uppercase font-black tracking-widest pl-2 mb-2">Public Pages</h3>
          {SEO_PAGE_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyChange(key)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all capitalize ${
                selectedKey === key
                  ? "bg-navy text-white"
                  : "text-navy hover:bg-bg-custom/60"
              }`}
            >
              {key} Page
            </button>
          ))}
        </div>

        {/* SEO Parameters Form */}
        <form onSubmit={handleSave} className="md:col-span-3 bg-white border border-border-custom rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="font-sora font-black text-navy text-sm capitalize border-b border-border-custom pb-2 flex items-center gap-1.5">
            <Settings className="w-4.5 h-4.5 text-blue" /> Meta tags for: {selectedKey}
          </h3>

          <div className="space-y-2">
            <label className="text-muted">Meta Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Visas, attestation and trips | BookMyGlobal"
              className="w-full border border-border-custom bg-bg-custom rounded-xl px-4 py-2.5 outline-none focus:border-blue font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted">Meta Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Apply online in minutes. Get your digital translation immediately..."
              className="w-full border border-border-custom bg-bg-custom rounded-xl p-3 outline-none focus:border-blue font-bold resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted">Canonical URL (Optional)</label>
            <input
              type="text"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="e.g. https://bookmyglobal.com/about"
              className="w-full border border-border-custom bg-bg-custom rounded-xl px-4 py-2.5 outline-none focus:border-blue font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border-custom pt-4">
            <div className="space-y-2">
              <label className="text-muted">OpenGraph Title (Optional)</label>
              <input
                type="text"
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                placeholder="e.g. Start a visa or attestation request"
                className="w-full border border-border-custom bg-bg-custom rounded-xl px-4 py-2.5 outline-none focus:border-blue font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-muted">OpenGraph Image (Optional URL)</label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="e.g. https://domain.com/og.jpg"
                className="w-full border border-border-custom bg-bg-custom rounded-xl px-4 py-2.5 outline-none focus:border-blue font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-muted">OpenGraph Description (Optional)</label>
            <textarea
              rows={2}
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              placeholder="Custom graph indexing card summary..."
              className="w-full border border-border-custom bg-bg-custom rounded-xl p-3 outline-none focus:border-blue font-bold resize-none"
            />
          </div>

          <div className="space-y-2 border-t border-border-custom pt-4">
            <label className="text-muted flex items-center justify-between">
              Structured Data / JSON-LD Schema (Optional)
              {/* Live JSON validity badge */}
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
              placeholder='e.g. { "@context": "https://schema.org", "@type": "FAQPage", ... }'
              className="w-full border border-border-custom bg-bg-custom rounded-xl p-3 outline-none focus:border-blue font-bold font-mono text-[11px] resize-y"
            />
            <p className="text-[10px] text-slate-400 font-medium">
              Paste raw JSON-LD object <strong>or</strong> the full &lt;script&gt; block — the wrapper tags are stripped automatically before saving.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className={`btn-primary py-2.5 px-6 font-black flex items-center gap-1.5 ${
                isSaved ? "bg-green-500 hover:bg-green-600 border-green-500" : ""
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSaved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaved ? "Saved Metadata" : "Update Meta Tags"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
