"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  Plus,
  Trash2,
  Edit2,
  Save,
  Loader2,
  Check,
  ExternalLink,
  Code,
  Sliders,
  AlertTriangle,
  RefreshCw,
  Copy,
  CheckCircle,
  XCircle,
  FileCode,
  Wand2,
  Undo2,
  Info,
  X,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/utils";

export interface CustomSitemapEntry {
  id: string;
  url: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
  enabled: boolean;
}

function formatSitemapXml(xml: string): string {
  try {
    const reg = /(>)(<)(\/*)/g;
    const formatted = xml.replace(reg, "$1\r\n$2$3");
    let pad = 0;
    const lines = formatted.split("\r\n");
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.match(/^<\/\w/)) {
        if (pad > 0) pad -= 1;
      }

      const padding = "  ".repeat(pad);
      result.push(padding + line);

      if (line.match(/^<\w[^>]*[^\/]>$/) && !line.startsWith("<?") && !line.includes("</")) {
        pad += 1;
      }
    }
    return result.join("\n");
  } catch {
    return xml;
  }
}

function validateXml(xml: string): { valid: boolean; error?: string } {
  if (!xml.trim()) return { valid: false, error: "XML output is empty" };
  if (!xml.includes("<urlset")) return { valid: false, error: "Missing root <urlset> tag" };

  const openUrls = (xml.match(/<url>/g) || []).length;
  const closeUrls = (xml.match(/<\/url>/g) || []).length;

  if (openUrls !== closeUrls) {
    return { valid: false, error: `Unmatched <url> tags: ${openUrls} opened, ${closeUrls} closed` };
  }

  return { valid: true };
}

export function SitemapClient() {
  const [activeTab, setActiveTab] = useState<"urls" | "sections" | "preview">("urls");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Sitemap state
  const [customEntries, setCustomEntries] = useState<CustomSitemapEntry[]>([]);
  const [excludedUrls, setExcludedUrls] = useState<string[]>([]);
  const [newExcludeInput, setNewExcludeInput] = useState("");

  const [includeCountries, setIncludeCountries] = useState(true);
  const [includeBlogs, setIncludeBlogs] = useState(true);
  const [includePages, setIncludePages] = useState(true);
  const [includeDestinations, setIncludeDestinations] = useState(true);

  // Raw XML & Override State
  const [useRawOverride, setUseRawOverride] = useState(false);
  const [rawXmlOverride, setRawXmlOverride] = useState("");

  // Live XML preview state & editor
  const [xmlContent, setXmlContent] = useState("");
  const [xmlLoading, setXmlLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editor Ref for Scroll Sync
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Form input for new entry
  const [newUrl, setNewUrl] = useState("");
  const [newPriority, setNewPriority] = useState<number>(0.8);
  const [newFreq, setNewFreq] = useState<CustomSitemapEntry["changeFrequency"]>("monthly");

  // Inline entry editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editPriority, setEditPriority] = useState<number>(0.8);
  const [editFreq, setEditFreq] = useState<CustomSitemapEntry["changeFrequency"]>("monthly");

  const fetchLiveXml = async () => {
    try {
      setXmlLoading(true);
      const res = await fetch("/sitemap.xml", { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        setXmlContent((prev) => prev || text);
        setRawXmlOverride((prev) => prev || text);
      }
    } catch (err) {
      console.error("Failed to fetch live XML:", err);
    } finally {
      setXmlLoading(false);
    }
  };

  // Load existing sitemap configuration
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/sitemap");
      if (!res.ok) {
        const msg = await getApiErrorMessage(res);
        throw new Error(msg);
      }
      const data = await res.json();
      setCustomEntries(data.customEntries || []);
      setExcludedUrls(data.excludedUrls || []);
      setIncludeCountries(data.includeCountries !== "false");
      setIncludeBlogs(data.includeBlogs !== "false");
      setIncludePages(data.includePages !== "false");
      setIncludeDestinations(data.includeDestinations !== "false");
      setUseRawOverride(Boolean(data.useRawOverride));

      const raw = data.rawXmlOverride || "";
      setRawXmlOverride(raw);
      if (raw) setXmlContent(raw);

      await fetchLiveXml();
    } catch (err: any) {
      console.error("Failed to load sitemap settings:", err);
      setError(err.message || "Failed to load sitemap settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "preview" && !xmlContent) {
      fetchLiveXml();
    }
  }, [activeTab]);

  const handleAddCustomEntry = () => {
    if (!newUrl.trim()) return;
    const entry: CustomSitemapEntry = {
      id: "url_" + Date.now(),
      url: newUrl.trim(),
      changeFrequency: newFreq,
      priority: Number(newPriority) || 0.7,
      enabled: true,
    };
    setCustomEntries((prev) => [entry, ...prev]);
    setNewUrl("");
    setNewPriority(0.8);
    setNewFreq("monthly");
  };

  const handleStartEdit = (entry: CustomSitemapEntry) => {
    setEditingId(entry.id);
    setEditUrl(entry.url);
    setEditPriority(entry.priority);
    setEditFreq(entry.changeFrequency);
  };

  const handleSaveEdit = (id: string) => {
    if (!editUrl.trim()) return;
    setCustomEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              url: editUrl.trim(),
              priority: Number(editPriority) || 0.7,
              changeFrequency: editFreq,
            }
          : e
      )
    );
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleRemoveEntry = (id: string) => {
    setCustomEntries((prev) => prev.filter((e) => e.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleToggleEntry = (id: string) => {
    setCustomEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
    );
  };

  const handleAddExclude = () => {
    if (!newExcludeInput.trim()) return;
    const clean = newExcludeInput.trim();
    if (!excludedUrls.includes(clean)) {
      setExcludedUrls((prev) => [...prev, clean]);
    }
    setNewExcludeInput("");
  };

  const handleRemoveExclude = (urlToRemove: string) => {
    setExcludedUrls((prev) => prev.filter((u) => u !== urlToRemove));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess(false);

      const payloadRawXml = useRawOverride
        ? (xmlContent || rawXmlOverride)
        : (rawXmlOverride || xmlContent);

      const res = await fetch("/api/admin/sitemap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customEntries,
          excludedUrls,
          includeCountries,
          includeBlogs,
          includePages,
          includeDestinations,
          useRawOverride,
          rawXmlOverride: payloadRawXml,
        }),
      });

      if (!res.ok) {
        const msg = await getApiErrorMessage(res);
        throw new Error(msg);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
      await fetchLiveXml();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save sitemap settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyXml = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormatXml = () => {
    const formatted = formatSitemapXml(xmlContent);
    setXmlContent(formatted);
    if (useRawOverride) {
      setRawXmlOverride(formatted);
    }
  };

  const handleResetToGeneratedXml = async () => {
    setUseRawOverride(false);
    await fetchLiveXml();
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setXmlContent(val);
    if (useRawOverride) {
      setRawXmlOverride(val);
    }
  };

  const handleScrollSync = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const linesCount = Math.max(1, (xmlContent.match(/\n/g) || []).length + 1);
  const xmlStatus = validateXml(xmlContent);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue" />
        <p className="text-xs font-bold text-slate-500">Loading sitemap configurations...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-sora font-black text-navy text-2xl flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue" />
            Dynamic Sitemap Manager
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Manage, customize, and edit your live sitemap.xml entries, raw XML code, disallow paths, and sync with search engines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-navy hover:bg-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-200"
          >
            <ExternalLink className="w-4 h-4 text-blue" />
            Open Live sitemap.xml
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue text-white text-xs font-bold rounded-xl hover:bg-blue-600 disabled:bg-slate-300 transition-all shadow-md shadow-blue/10"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <Check className="w-4 h-4 text-green-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Syncing..." : success ? "Synced Successfully!" : "Save & Sync Sitemap"}
          </button>
        </div>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
          <span>Sitemap configurations saved! Live sitemap.xml has been revalidated and updated.</span>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 gap-1 bg-slate-50 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("urls")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "urls"
              ? "bg-white text-blue shadow-sm"
              : "text-slate-500 hover:text-navy hover:bg-white/50"
          }`}
        >
          <Plus className="w-4 h-4" />
          Custom URLs & Exclusions
        </button>

        <button
          onClick={() => setActiveTab("sections")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "sections"
              ? "bg-white text-blue shadow-sm"
              : "text-slate-500 hover:text-navy hover:bg-white/50"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Auto Indexing Toggles
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "preview"
              ? "bg-white text-blue shadow-sm"
              : "text-slate-500 hover:text-navy hover:bg-white/50"
          }`}
        >
          <FileCode className="w-4 h-4" />
          Live XML Code Editor & Preview
        </button>
      </div>

      {/* TAB 1: Custom URLs & Exclusions */}
      {activeTab === "urls" && (
        <div className="space-y-8">
          {/* Add New Custom Entry Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-sora font-black text-navy text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue" /> Add Custom Sitemap URL
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-500">URL Path or Full Link</label>
                <input
                  type="text"
                  placeholder="/custom-landing-page or https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-bold text-navy outline-none focus:border-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Priority (0.1 to 1.0)</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(Number(e.target.value))}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-xs font-bold text-navy outline-none focus:border-blue"
                >
                  <option value={1.0}>1.0 (Highest)</option>
                  <option value={0.9}>0.9 (Very High)</option>
                  <option value={0.8}>0.8 (High)</option>
                  <option value={0.7}>0.7 (Standard)</option>
                  <option value={0.5}>0.5 (Medium)</option>
                  <option value={0.3}>0.3 (Low)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Change Frequency</label>
                <select
                  value={newFreq}
                  onChange={(e) => setNewFreq(e.target.value as any)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-xs font-bold text-navy outline-none focus:border-blue"
                >
                  <option value="always">Always</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAddCustomEntry}
                disabled={!newUrl.trim()}
                className="px-5 py-2 bg-blue text-white text-xs font-bold rounded-xl hover:bg-blue-600 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add URL Entry
              </button>
            </div>
          </div>

          {/* List of Custom Entries */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-sora font-black text-navy text-sm">
                Custom Added URLs ({customEntries.length})
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">
                These URLs will be injected into live sitemap.xml
              </span>
            </div>

            {customEntries.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-bold">
                No custom sitemap entries added yet. Use the form above to add extra URLs.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-bold">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">URL Path</th>
                      <th className="py-2 px-3">Priority</th>
                      <th className="py-2 px-3">Frequency</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customEntries.map((entry) => {
                      const isEditing = editingId === entry.id;
                      return (
                        <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() => handleToggleEntry(entry.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                                entry.enabled
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {entry.enabled ? "Active" : "Disabled"}
                            </button>
                          </td>

                          {isEditing ? (
                            <>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={editUrl}
                                  onChange={(e) => setEditUrl(e.target.value)}
                                  className="w-full border border-blue bg-white rounded-lg px-2 py-1 text-xs font-bold text-navy outline-none"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={editPriority}
                                  onChange={(e) => setEditPriority(Number(e.target.value))}
                                  className="border border-blue bg-white rounded-lg px-2 py-1 text-xs font-bold text-navy outline-none"
                                >
                                  <option value={1.0}>1.0</option>
                                  <option value={0.9}>0.9</option>
                                  <option value={0.8}>0.8</option>
                                  <option value={0.7}>0.7</option>
                                  <option value={0.5}>0.5</option>
                                  <option value={0.3}>0.3</option>
                                </select>
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={editFreq}
                                  onChange={(e) => setEditFreq(e.target.value as any)}
                                  className="border border-blue bg-white rounded-lg px-2 py-1 text-xs font-bold text-navy outline-none capitalize"
                                >
                                  <option value="always">always</option>
                                  <option value="hourly">hourly</option>
                                  <option value="daily">daily</option>
                                  <option value="weekly">weekly</option>
                                  <option value="monthly">monthly</option>
                                  <option value="yearly">yearly</option>
                                  <option value="never">never</option>
                                </select>
                              </td>
                              <td className="py-2 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(entry.id)}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Save Changes"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 px-3 text-navy font-mono text-[11px] truncate max-w-xs">
                                {entry.url}
                              </td>
                              <td className="py-3 px-3 text-slate-600">{entry.priority}</td>
                              <td className="py-3 px-3 text-slate-600 capitalize">
                                {entry.changeFrequency}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(entry)}
                                    className="p-1.5 text-blue hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Entry"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEntry(entry.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove URL"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Excluded URLs / Disallow Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-sora font-black text-navy text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" /> Disallow / Excluded URLs
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">
                URLs listed here will be stripped out of sitemap.xml
              </span>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. /private-page or /admin"
                value={newExcludeInput}
                onChange={(e) => setNewExcludeInput(e.target.value)}
                className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-bold text-navy outline-none focus:border-red-400"
              />
              <button
                type="button"
                onClick={handleAddExclude}
                disabled={!newExcludeInput.trim()}
                className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Exclude URL
              </button>
            </div>

            {excludedUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {excludedUrls.map((url) => (
                  <span
                    key={url}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl"
                  >
                    <span className="font-mono">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExclude(url)}
                      className="hover:text-red-900 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Auto Indexing Toggles */}
      {activeTab === "sections" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-sora font-black text-navy text-sm border-b border-slate-100 pb-3">
            Dynamic Section Auto-Indexing Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <input
                type="checkbox"
                id="inc_countries"
                checked={includeCountries}
                onChange={(e) => setIncludeCountries(e.target.checked)}
                className="mt-1 w-4 h-4 accent-blue rounded"
              />
              <div>
                <label htmlFor="inc_countries" className="text-xs font-bold text-navy cursor-pointer">
                  Include Service Pages (`/services/*`, retreats, community)
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automatically index every service landing page in sitemap.xml.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <input
                type="checkbox"
                id="inc_blogs"
                checked={includeBlogs}
                onChange={(e) => setIncludeBlogs(e.target.checked)}
                className="mt-1 w-4 h-4 accent-blue rounded"
              />
              <div>
                <label htmlFor="inc_blogs" className="text-xs font-bold text-navy cursor-pointer">
                  Include Published Blog Posts (`/blog/*`)
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automatically index all published articles and travel news in sitemap.xml.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <input
                type="checkbox"
                id="inc_pages"
                checked={includePages}
                onChange={(e) => setIncludePages(e.target.checked)}
                className="mt-1 w-4 h-4 accent-blue rounded"
              />
              <div>
                <label htmlFor="inc_pages" className="text-xs font-bold text-navy cursor-pointer">
                  Include Custom CMS Pages (`/*`)
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automatically index custom landing pages created in Pages Manager.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <input
                type="checkbox"
                id="inc_dest"
                checked={includeDestinations}
                onChange={(e) => setIncludeDestinations(e.target.checked)}
                className="mt-1 w-4 h-4 accent-blue rounded"
              />
              <div>
                <label htmlFor="inc_dest" className="text-xs font-bold text-navy cursor-pointer">
                  Reserved (no destination pages in this build)
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Currently has no effect.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Live XML Code Editor & Preview */}
      {activeTab === "preview" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          {/* Top Header & Settings */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-blue" />
                <h3 className="font-sora font-black text-navy text-sm">
                  Live Interactive sitemap.xml Code Editor
                </h3>
                {useRawOverride ? (
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Custom Raw XML Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue border border-blue-200 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-blue" /> Dynamic Auto-Mode
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs">
                You can directly edit, paste, or format the sitemap XML code below.
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleFormatXml}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-navy text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                title="Format & indent XML code"
              >
                <Wand2 className="w-3.5 h-3.5 text-blue" /> Format XML
              </button>

              <button
                type="button"
                onClick={handleResetToGeneratedXml}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                title="Revert to auto-generated dynamic sitemap"
              >
                <Undo2 className="w-3.5 h-3.5 text-slate-500" /> Reset to Dynamic
              </button>

              <button
                type="button"
                onClick={fetchLiveXml}
                disabled={xmlLoading}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-navy text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${xmlLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>

              <button
                type="button"
                onClick={handleCopyXml}
                disabled={!xmlContent}
                className="px-3 py-1.5 bg-blue text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center gap-1.5 shadow-sm shadow-blue/10"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy XML"}
              </button>
            </div>
          </div>

          {/* Mode Switch Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-amber-50/80 border border-amber-200/70 rounded-2xl gap-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="raw_override_toggle"
                checked={useRawOverride}
                onChange={(e) => {
                  setUseRawOverride(e.target.checked);
                  if (e.target.checked && xmlContent) {
                    setRawXmlOverride(xmlContent);
                  }
                }}
                className="mt-1 w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
              <div>
                <label htmlFor="raw_override_toggle" className="text-xs font-bold text-amber-950 cursor-pointer flex items-center gap-1.5">
                  Publish Custom Raw XML Override to live `/sitemap.xml`
                </label>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  When enabled, any edits you make in this editor will be served directly to search engines on `/sitemap.xml`.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {xmlStatus.valid ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-[11px] rounded-xl flex items-center gap-1 border border-green-300">
                  <CheckCircle className="w-3.5 h-3.5" /> Valid XML
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-700 font-bold text-[11px] rounded-xl flex items-center gap-1 border border-red-300">
                  <AlertTriangle className="w-3.5 h-3.5" /> {xmlStatus.error}
                </span>
              )}
            </div>
          </div>

          {/* CODE EDITOR WINDOW */}
          {xmlLoading ? (
            <div className="py-20 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center space-y-2 bg-slate-900 rounded-2xl">
              <Loader2 className="w-6 h-6 animate-spin text-blue" />
              <span>Fetching live sitemap.xml output...</span>
            </div>
          ) : (
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex font-mono text-[12px] leading-relaxed">
              {/* Line Numbers Sidebar */}
              <div
                ref={lineNumbersRef}
                className="w-12 bg-slate-900/90 text-slate-600 text-right pr-3 py-4 select-none border-r border-slate-800 overflow-hidden font-bold text-[11px]"
              >
                {Array.from({ length: linesCount }, (_, i) => (
                  <div key={i + 1}>{i + 1}</div>
                ))}
              </div>

              {/* Editable Textarea */}
              <textarea
                ref={textareaRef}
                value={xmlContent}
                onChange={handleEditorChange}
                onScroll={handleScrollSync}
                spellCheck={false}
                placeholder="Paste or write your custom sitemap XML here..."
                className="flex-1 bg-transparent text-emerald-400 caret-white p-4 h-[520px] outline-none resize-none font-mono text-[12px] leading-relaxed tracking-wide overflow-y-auto overflow-x-auto whitespace-pre"
              />
            </div>
          )}

          {/* Editor Footer Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-1 px-1 font-bold gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue" />
              <span>Lines: {linesCount} | Characters: {xmlContent.length.toLocaleString()}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Click <strong className="text-navy">Save & Sync Sitemap</strong> at top right to save and publish your changes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
