"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, HelpCircle, Save, X, Loader2, Search } from "lucide-react";

interface FaqsClientProps {
  faqs: any[];
}

const CATEGORY_MAP: Record<string, { label: string; bg: string; text: string }> = {
  basics: { label: "Basics", bg: "bg-[#E8EEFF]", text: "text-[#0033CC]" },
  countries: { label: "Country Guides", bg: "bg-[#FFF3E0]", text: "text-[#E65100]" },
  apply: { label: "How to Apply", bg: "bg-[#E8FFF0]", text: "text-[#00AA44]" },
  pricing: { label: "Plans & Pricing", bg: "bg-[#F3E5F5]", text: "text-[#6A1B9A]" },
  policy: { label: "Refund & Policy", bg: "bg-[#FFEBEE]", text: "text-[#CC0000]" },
};

export function FaqsClient({ faqs: initialFaqs }: FaqsClientProps) {
  const router = useRouter();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("basics");
  const [customCategory, setCustomCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when props change
  useEffect(() => {
    setFaqs(initialFaqs);
  }, [initialFaqs]);

  // Compute existing custom categories in current FAQs
  const existingCustomCategories = useMemo(() => {
    const custom = new Set<string>();
    const defaults = ["basics", "countries", "apply", "pricing", "policy"];
    faqs.forEach((faq) => {
      if (faq.category && !defaults.includes(faq.category)) {
        custom.add(faq.category);
      }
    });
    return Array.from(custom);
  }, [faqs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isEdit = !!editingFaq;
      const url = "/api/admin/faqs";
      const method = isEdit ? "PUT" : "POST";
      
      const finalCategory = category === "new" ? customCategory.trim() : category;
      if (!finalCategory) {
        throw new Error("Category is required");
      }

      const payload = isEdit 
        ? { id: editingFaq.id, question, answer, category: finalCategory, order: editingFaq.order }
        : { question, answer, category: finalCategory };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save FAQ");

      alert(`FAQ ${isEdit ? "updated" : "created"} successfully!`);
      setIsOpen(false);
      setEditingFaq(null);
      setQuestion("");
      setAnswer("");
      setCategory("basics");
      setCustomCategory("");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (faq: any) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    
    const defaults = ["basics", "countries", "apply", "pricing", "policy"];
    if (faq.category && !defaults.includes(faq.category)) {
      setCategory(faq.category);
    } else {
      setCategory(faq.category || "basics");
    }
    setCustomCategory("");
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const response = await fetch("/api/admin/faqs", {
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

  const handleMove = async (index: number, direction: "up" | "down") => {
    const updated = [...faqs];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;

    // Swap order
    const temp = updated[index].order;
    updated[index].order = updated[targetIndex].order;
    updated[targetIndex].order = temp;

    // Swap elements in list
    const tempEl = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = tempEl;

    setFaqs(updated);

    // Call backend to update sorting order
    try {
      const response = await fetch("/api/admin/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          updated.map((item, idx) => ({ id: item.id, order: idx }))
        ),
      });
      if (!response.ok) throw new Error("Failed to save ordering");
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const getCategoryDetails = (catId: string | null) => {
    const defaultDetails = { label: "General", bg: "bg-gray-100", text: "text-gray-600" };
    if (!catId) return defaultDetails;
    return CATEGORY_MAP[catId] || { label: catId, bg: "bg-gray-100", text: "text-gray-600" };
  };

  // Filter FAQs by search query
  const filteredFaqs = faqs.filter((faq) => {
    const searchLower = searchQuery.toLowerCase();
    const catDetails = getCategoryDetails(faq.category);
    return (
      faq.question.toLowerCase().includes(searchLower) ||
      faq.answer.toLowerCase().includes(searchLower) ||
      catDetails.label.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 max-w-4xl text-xs font-bold text-navy">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-black text-navy text-2xl font-black">FAQs CMS</h1>
          <p className="text-muted text-[10px]">Author FAQs and change display hierarchies.</p>
        </div>
        <button
          onClick={() => {
            setEditingFaq(null);
            setQuestion("");
            setAnswer("");
            setCategory("basics");
            setCustomCategory("");
            setIsOpen(true);
          }}
          className="btn-primary py-2.5 px-6 font-black flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter FAQs by question, content, or category..."
          className="block w-full pl-9 pr-3 py-2.5 bg-white border border-border-custom rounded-xl outline-none focus:border-blue text-navy placeholder-gray-400"
        />
      </div>

      <div className="bg-white border border-border-custom rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 bg-bg-custom border-b border-border-custom text-muted text-[10px]">
          Use Up & Down arrows to visually reorder FAQs. HTML markup is supported for rich text formatting.
        </div>
        <div className="divide-y divide-border-custom">
          {filteredFaqs.map((faq, index) => {
            const catDetails = getCategoryDetails(faq.category);
            return (
              <div key={faq.id} className="p-5 hover:bg-bg-custom/30 transition-all flex items-start gap-4">
                {/* Order Controls */}
                <div className="flex flex-col gap-1 shrink-0 pt-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, "up")}
                    className="p-1 hover:bg-white border border-border-custom rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-all text-navy cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === filteredFaqs.length - 1}
                    onClick={() => handleMove(index, "down")}
                    className="p-1 hover:bg-white border border-border-custom rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-all text-navy cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* FAQ Body */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-sora font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${catDetails.bg} ${catDetails.text}`}>
                      {catDetails.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <HelpCircle className="w-4 h-4 text-blue shrink-0" />
                      <h4 className="font-sora font-black text-navy text-sm">{faq.question}</h4>
                    </div>
                  </div>
                  <div 
                    className="text-muted font-bold text-xs leading-relaxed max-w-3xl pl-6 faq-admin-answer-markup space-y-2"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEditClick(faq)}
                    className="p-2 hover:bg-white border border-border-custom rounded-xl text-navy transition-all cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-2 hover:bg-red-50 border border-red-100 rounded-xl text-red-600 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 text-muted font-bold">
              {faqs.length === 0 ? "No FAQs recorded. Add questions to get started!" : "No FAQs matching search criteria."}
            </div>
          )}
        </div>
      </div>

      {/* CSS styling injection for previewing rich text answers */}
      <style jsx global>{`
        .faq-admin-answer-markup strong {
          color: #001A66;
          font-weight: 800;
        }
        .faq-admin-answer-markup ul {
          list-style-type: disc;
          padding-left: 1rem;
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }
        .faq-admin-answer-markup li {
          margin-bottom: 0.15rem;
        }
        .faq-admin-answer-markup .tip {
          background: #E8EEFF;
          border-left: 2px solid #0033CC;
          padding: 6px 10px;
          border-radius: 0 6px 6px 0;
          margin-top: 6px;
          font-size: 11px;
          color: #001A66;
        }
        .faq-admin-answer-markup .warn {
          background: #fff8e1;
          border-left: 2px solid #F9A825;
          padding: 6px 10px;
          border-radius: 0 6px 6px 0;
          margin-top: 6px;
          font-size: 11px;
          color: #7B5800;
        }
      `}</style>

      {/* Editor Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border-custom pb-3">
              <h3 className="font-sora font-black text-navy text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue" /> {editingFaq ? "Modify FAQ Entry" : "Create FAQ Entry"}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-navy cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-navy">
              <div>
                <label className="block text-muted mb-1">Display Category</label>
                <select
                  required
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value !== "new") {
                      setCustomCategory("");
                    }
                  }}
                  className="w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 outline-none focus:border-blue font-bold text-navy"
                >
                  <option value="basics">Basics</option>
                  <option value="countries">Country Guides</option>
                  <option value="apply">How to Apply</option>
                  <option value="pricing">Plans & Pricing</option>
                  <option value="policy">Refund & Policy</option>
                  {existingCustomCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="new">+ Create New Category...</option>
                </select>

                {category === "new" && (
                  <div className="mt-3 animate-fade-in">
                    <label className="block text-muted mb-1">New Category Name</label>
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Verification, Renewal"
                      className="w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 outline-none focus:border-blue font-bold text-navy"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-muted mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Do you guarantee my visa?"
                  className="w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 outline-none focus:border-blue"
                />
              </div>

              <div>
                <label className="block text-muted mb-1">Answer</label>
                <textarea
                  required
                  rows={6}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter the FAQ answer. HTML tags like <strong>, <ul>, <li>, <div class='tip'>...</div>, and <div class='warn'>...</div> are fully supported."
                  className="w-full border border-border-custom bg-bg-custom rounded-xl p-3 outline-none focus:border-blue resize-none font-bold text-navy"
                />
                <span className="text-[9px] text-muted font-normal block mt-1">
                  HTML tags are allowed. Use &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;div class=&quot;tip&quot;&gt;💡 ...&lt;/div&gt;, or &lt;div class=&quot;warn&quot;&gt;⚠️ ...&lt;/div&gt; to style alerts.
                </span>
              </div>

              <div className="flex gap-2 justify-end border-t border-border-custom pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-bg-custom text-navy border border-border-custom font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-border-custom cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue hover:bg-navy text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue/10 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
