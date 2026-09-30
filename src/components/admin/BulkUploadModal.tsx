"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, FileText, X, Check, AlertCircle, Trash2, HelpCircle, Search } from "lucide-react";
import * as XLSX from "xlsx";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "blogs" | "pages" | "destinations";
  onImportSuccess: () => void;
}

export function BulkUploadModal({ isOpen, onClose, entityType, onImportSuccess }: BulkUploadModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [hasHeaderRow, setHasHeaderRow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSearch, setPreviewSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        const pdfjs = (window as any).pdfjsLib;
        pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(pdfjs);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setParsing(true);
    setParsedData([]);

    try {
      const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();

      if (fileExt === "xlsx" || fileExt === "xls" || fileExt === "csv") {
        // Parse Excel or CSV using SheetJS
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            if (rawJson.length > 0) {
              const detectedHeaders = rawJson[0].map(h => String(h || ""));
              setHeaders(detectedHeaders);

              const rows = rawJson.slice(1).map((row) => {
                const item: any = {};
                detectedHeaders.forEach((header, index) => {
                  item[header] = row[index] !== undefined ? String(row[index]) : "";
                });
                return item;
              });
              setParsedData(rows.filter(r => Object.values(r).some(v => v !== "")));
            } else {
              setError("The uploaded file is empty.");
            }
          } catch (err: any) {
            setError(`Failed to parse Excel file: ${err.message}`);
          } finally {
            setParsing(false);
          }
        };
        reader.readAsArrayBuffer(selectedFile);
      } else if (fileExt === "pdf") {
        // Parse PDF using PDFJS CDN
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const pdfjs = await loadPdfJs();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(" ");
              fullText += pageText + "\n";
            }

            processRawText(fullText);
          } catch (err: any) {
            setError(`Failed to extract text from PDF: ${err.message}`);
          } finally {
            setParsing(false);
          }
        };
        reader.readAsArrayBuffer(selectedFile);
      } else {
        setError("Unsupported file format. Please upload .xlsx, .xls, .csv, or .pdf");
        setParsing(false);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while processing the file.");
      setParsing(false);
    }
  };

  const processRawText = (text: string) => {
    setError(null);
    if (!text.trim()) {
      setError("No text provided to parse.");
      return;
    }

    try {
      // 1. Try parsing as JSON first
      if (text.trim().startsWith("[") || text.trim().startsWith("{")) {
        const parsed = JSON.parse(text.trim());
        const items = Array.isArray(parsed) ? parsed : [parsed];
        if (items.length > 0) {
          const keys = Object.keys(items[0]);
          setHeaders(keys);
          setParsedData(items);
          return;
        }
      }

      // 2. Parse as CSV/TSV
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      if (lines.length === 0) {
        setError("No readable lines found.");
        return;
      }

      // Detect delimiter
      const firstLine = lines[0];
      let delimiter = ",";
      const commaCount = (firstLine.match(/,/g) || []).length;
      const tabCount = (firstLine.match(/\t/g) || []).length;
      const semiCount = (firstLine.match(/;/g) || []).length;
      
      if (tabCount > commaCount && tabCount > semiCount) delimiter = "\t";
      else if (semiCount > commaCount && semiCount > tabCount) delimiter = ";";

      const splitLine = (l: string) => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < l.length; i++) {
          const c = l[i];
          if (c === '"') {
            inQuotes = !inQuotes;
          } else if (c === delimiter && !inQuotes) {
            result.push(current);
            current = "";
          } else {
            current += c;
          }
        }
        result.push(current);
        return result;
      };

      if (hasHeaderRow) {
        const detectedHeaders = splitLine(lines[0]).map(h => h.trim());
        setHeaders(detectedHeaders);

        const rows = lines.slice(1).map((line) => {
          const vals = splitLine(line);
          const item: any = {};
          detectedHeaders.forEach((h, idx) => {
            item[h] = vals[idx] !== undefined ? vals[idx].trim() : "";
          });
          return item;
        });
        setParsedData(rows);
      } else {
        // Fallback default headers if no header row
        const defaultHeaders = entityType === "blogs"
          ? ["title", "content", "category", "excerpt", "tags", "status", "structuredData"]
          : ["title", "content", "category", "status", "seoTitle", "seoDescription", "structuredData"];
        
        setHeaders(defaultHeaders);
        const rows = lines.map((line) => {
          const vals = splitLine(line);
          const item: any = {};
          defaultHeaders.forEach((h, idx) => {
            item[h] = vals[idx] !== undefined ? vals[idx].trim() : "";
          });
          return item;
        });
        setParsedData(rows);
      }
    } catch (err: any) {
      setError(`Failed to parse text: ${err.message}`);
    }
  };

  const handlePasteSubmit = () => {
    processRawText(pastedText);
  };

  const handleDeleteRow = (index: number) => {
    setParsedData(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setLoading(true);
    setError(null);

    // Map parsed keys to standard API payload format
    const payload = parsedData.map((row) => {
      const item: any = {};
      Object.keys(row).forEach((key) => {
        const normalizedKey = key.trim().toLowerCase();
        // Blog mappings
        if (entityType === "blogs") {
          if (normalizedKey === "title") item.title = row[key];
          else if (normalizedKey === "content" || normalizedKey === "body" || normalizedKey === "article") item.content = row[key];
          else if (normalizedKey === "excerpt" || normalizedKey === "description" || normalizedKey === "summary") item.excerpt = row[key];
          else if (normalizedKey === "category") item.category = row[key];
          else if (normalizedKey === "tags") item.tags = row[key];
          else if (normalizedKey === "status") item.status = row[key]?.toUpperCase() === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
          else if (normalizedKey === "slug") item.slug = row[key];
          else if (normalizedKey === "seo_title" || normalizedKey === "seotitle" || normalizedKey.startsWith("meta title") || normalizedKey === "meta_title" || normalizedKey === "metatitle") item.seoTitle = row[key];
          else if (normalizedKey === "seo_description" || normalizedKey === "seodescription" || normalizedKey.startsWith("meta description") || normalizedKey === "meta_description" || normalizedKey === "metadescription") item.seoDescription = row[key];
          else if (normalizedKey === "featured_image" || normalizedKey === "featuredimageurl" || normalizedKey === "image") item.featuredImageUrl = row[key];
          else if (
            normalizedKey === "structured_data" ||
            normalizedKey === "structureddata" ||
            normalizedKey === "json_ld" ||
            normalizedKey === "jsonld" ||
            normalizedKey === "schema" ||
            (normalizedKey.includes("structured") && (normalizedKey.includes("schema") || normalizedKey.includes("json")))
          ) item.structuredData = row[key];
        }
        // Page mappings
        else if (entityType === "pages") {
          if (normalizedKey === "title") item.title = row[key];
          else if (normalizedKey === "content" || normalizedKey === "body" || normalizedKey === "article") item.content = row[key];
          else if (normalizedKey === "category") item.category = row[key];
          else if (normalizedKey === "status") item.status = row[key]?.toUpperCase() === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
          else if (normalizedKey === "isactive" || normalizedKey === "active") item.isActive = row[key]?.toLowerCase() === "true" || row[key] === "1";
          else if (normalizedKey === "slug") item.slug = row[key];
          else if (normalizedKey === "seo_title" || normalizedKey === "seotitle" || normalizedKey.startsWith("meta title") || normalizedKey === "meta_title" || normalizedKey === "metatitle") item.seoTitle = row[key];
          else if (normalizedKey === "seo_description" || normalizedKey === "seodescription" || normalizedKey.startsWith("meta description") || normalizedKey === "meta_description" || normalizedKey === "metadescription") item.seoDescription = row[key];
          else if (normalizedKey === "og_image" || normalizedKey === "ogimage") item.ogImage = row[key];
          else if (normalizedKey === "canonical_url" || normalizedKey === "canonicalurl") item.canonicalUrl = row[key];
          else if (normalizedKey === "robots") item.robots = row[key];
          else if (normalizedKey === "featured_image" || normalizedKey === "featuredimageurl" || normalizedKey === "image") item.featuredImageUrl = row[key];
          else if (
            normalizedKey === "structured_data" ||
            normalizedKey === "structureddata" ||
            normalizedKey === "json_ld" ||
            normalizedKey === "jsonld" ||
            normalizedKey === "schema" ||
            (normalizedKey.includes("structured") && (normalizedKey.includes("schema") || normalizedKey.includes("json")))
          ) item.structuredData = row[key];
        }
      });

      // Default fields mapping if not specified in excel/csv headers
      if (entityType === "blogs") {
        if (!item.title && row.title) item.title = row.title;
        if (!item.title && row.Title) item.title = row.Title;
        if (!item.content && row.content) item.content = row.content;
        if (!item.content && row.Content) item.content = row.Content;
        if (!item.category && row.Category) item.category = row.Category;
        if (!item.tags && row.tags) item.tags = row.tags;
        if (!item.structuredData) {
          const structuredDataKey = Object.keys(row).find(k => {
            const lk = k.toLowerCase();
            return (
              lk === 'structureddata' ||
              lk === 'structured_data' ||
              lk === 'jsonld' ||
              lk === 'json_ld' ||
              lk === 'schema' ||
              (lk.includes('structured') && (lk.includes('schema') || lk.includes('json')))
            );
          });
          if (structuredDataKey && row[structuredDataKey]) item.structuredData = row[structuredDataKey];
        }
      } else if (entityType === "pages") {
        if (!item.title && row.title) item.title = row.title;
        if (!item.title && row.Title) item.title = row.Title;
        if (!item.content && row.content) item.content = row.content;
        if (!item.content && row.Content) item.content = row.Content;
        if (!item.category && row.Category) item.category = row.Category;
        if (!item.structuredData) {
          const structuredDataKey = Object.keys(row).find(k => {
            const lk = k.toLowerCase();
            return (
              lk === 'structureddata' ||
              lk === 'structured_data' ||
              lk === 'jsonld' ||
              lk === 'json_ld' ||
              lk === 'schema' ||
              (lk.includes('structured') && (lk.includes('schema') || lk.includes('json')))
            );
          });
          if (structuredDataKey && row[structuredDataKey]) item.structuredData = row[structuredDataKey];
        }
      }

      return item;
    });

    // Validate payload values before sending
    const invalidRows = payload.filter((item: any) => {
      return !item.title || !item.content;
    });

    if (invalidRows.length > 0) {
      setError(`Some rows are missing required fields. Blogs and Pages require 'Title' and 'Content'.`);
      setLoading(false);
      return;
    }

    try {
      const url = entityType === "blogs"
        ? "/api/admin/blogs/bulk"
        : "/api/admin/pages/bulk";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to import items");
      }

      onImportSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred during import.");
    } finally {
      setLoading(false);
    }
  };

  const getTemplateExample = () => {
    if (entityType === "blogs") {
      return `Title,Content,Category,Excerpt,Tags,Status\nApostille vs attestation,Detailed explanation of the difference...,Documents,A plain-English guide.,apostille;attestation,PUBLISHED\nA week in Rishikesh,What to expect on a retreat...,Retreats,A first-timer guide.,rishikesh;yoga,DRAFT`;
    }
    return `Title,Content,Category,Status,seoTitle,seoDescription\nAbout Us,We help travellers with documents and bookings...,General,PUBLISHED,About Us,Learn more about our services.\nTerms of Service,These terms govern your use...,Legal,PUBLISHED,Terms of Service,Read our terms of service.`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-border-custom overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 bg-navy text-white flex justify-between items-center">
          <div>
            <h2 className="font-sora text-lg font-black tracking-tight">Bulk Import: {entityType === "blogs" ? "Blogs" : "Pages"}</h2>
            <p className="text-xs text-white/70 mt-0.5">Upload files or paste raw data to add multiple items at once</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-border-custom bg-bg-custom/40 px-6">
          <button
            onClick={() => { setActiveTab("file"); setError(null); }}
            className={`py-3 px-4 text-xs font-black border-b-2 transition-all ${
              activeTab === "file" 
                ? "border-navy text-navy" 
                : "border-transparent text-muted hover:text-navy"
            }`}
          >
            📂 Upload File (.xlsx, .csv, .pdf)
          </button>
          <button
            onClick={() => { setActiveTab("paste"); setError(null); }}
            className={`py-3 px-4 text-xs font-black border-b-2 transition-all ${
              activeTab === "paste" 
                ? "border-navy text-navy" 
                : "border-transparent text-muted hover:text-navy"
            }`}
          >
            ✍️ Paste / Type Data
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === "file" && parsedData.length === 0 && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[200px] ${
                dragActive 
                  ? "border-blue bg-blue/5 scale-[0.99]" 
                  : "border-border-custom hover:border-blue hover:bg-bg-custom/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="h-14 w-14 rounded-2xl bg-blue/10 text-blue flex items-center justify-center mb-4 transition-transform hover:scale-105">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-black text-navy mb-1">
                Drag and drop your file here, or <span className="text-blue underline">browse</span>
              </p>
              <p className="text-xs text-muted max-w-sm">
                Supports Excel (.xlsx, .xls), Comma-Separated Values (.csv), or structured text PDF (.pdf) documents
              </p>
            </div>
          )}

          {activeTab === "paste" && parsedData.length === 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-navy uppercase tracking-wide">Paste JSON or Separated Values (CSV/Tab):</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-navy font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasHeaderRow}
                      onChange={(e) => setHasHeaderRow(e.target.checked)}
                      className="rounded border-border-custom text-navy focus:ring-blue"
                    />
                    Contains header row
                  </label>
                  <button
                    onClick={() => setPastedText(getTemplateExample())}
                    className="text-[10px] text-blue font-bold hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Load template example
                  </button>
                </div>
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={getTemplateExample()}
                rows={8}
                className="w-full px-4 py-3 rounded-2xl border border-border-custom text-xs focus:outline-none focus:border-blue font-mono resize-none bg-bg-custom/20"
              />
              <button
                onClick={handlePasteSubmit}
                disabled={!pastedText.trim()}
                className="btn-primary py-2.5 px-6 font-black text-xs self-start disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process Data
              </button>
            </div>
          )}

          {/* Loading or Parsing Indicator */}
          {(parsing || loading) && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-muted font-bold">
                {parsing ? "Parsing your document structure..." : "Importing records to database..."}
              </p>
            </div>
          )}

          {/* Preview Table */}
          {parsedData.length > 0 && !parsing && !loading && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-navy font-black">
                  🔍 Previewing {parsedData.length} records found in file
                </span>
                <button
                  onClick={() => {
                    setParsedData([]);
                    setFile(null);
                    setPastedText("");
                    setPreviewSearch("");
                  }}
                  className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Clear and Start Over
                </button>
              </div>

              {/* Preview Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  placeholder={`Search across ${parsedData.length} rows...`}
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-border-custom text-xs font-bold focus:outline-none focus:border-blue"
                  id="bulk-preview-search"
                />
                {previewSearch && (
                  <button
                    onClick={() => setPreviewSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtered count */}
              {previewSearch && (() => {
                const matchCount = parsedData.filter(row =>
                  Object.values(row).some(v => String(v).toLowerCase().includes(previewSearch.toLowerCase()))
                ).length;
                return (
                  <p className="text-[11px] text-muted font-bold">
                    Showing {matchCount} of {parsedData.length} rows matching <span className="text-blue">&ldquo;{previewSearch}&rdquo;</span>
                  </p>
                );
              })()}

              <div className="border border-border-custom rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-bg-custom text-navy border-b border-border-custom sticky top-0">
                      <tr>
                        {headers.slice(0, 5).map((h) => (
                          <th key={h} className="px-4 py-3 font-black uppercase text-[10px] tracking-wide truncate max-w-[120px]">
                            {h}
                          </th>
                        ))}
                        {headers.length > 5 && (
                          <th className="px-4 py-3 font-black uppercase text-[10px] tracking-wide text-muted">
                            +{headers.length - 5} more fields
                          </th>
                        )}
                        <th className="px-4 py-3 font-black uppercase text-[10px] tracking-wide text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-custom">
                      {parsedData
                        .filter(row =>
                          !previewSearch ||
                          Object.values(row).some(v => String(v).toLowerCase().includes(previewSearch.toLowerCase()))
                        )
                        .map((row, index) => (
                        <tr key={index} className="hover:bg-bg-custom/30 transition-colors">
                          {headers.slice(0, 5).map((h) => (
                            <td key={h} className="px-4 py-2.5 text-navy/80 truncate max-w-[120px]" title={row[h]}>
                              {row[h] || <span className="text-red-400 italic">empty</span>}
                            </td>
                          ))}
                          {headers.length > 5 && (
                            <td className="px-4 py-2.5 text-muted italic">
                              Hidden
                            </td>
                          )}
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => handleDeleteRow(index)}
                              className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                              title="Remove record"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-bg-custom/60 border-t border-border-custom flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border-custom text-xs font-black text-navy bg-white hover:bg-bg-custom transition-all"
            disabled={loading}
          >
            Cancel
          </button>
          {parsedData.length > 0 && !parsing && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-navy text-white text-xs font-black hover:bg-blue transition-all disabled:opacity-50 flex items-center gap-1.5"
              id="confirm-bulk-import-btn"
            >
              {loading ? (
                <>Importing...</>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Import {parsedData.length} Items
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
