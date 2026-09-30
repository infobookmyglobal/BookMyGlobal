"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Edit3, Loader2, Save } from "lucide-react";
import { useCMS } from "@/components/CMSProvider";
import { getApiErrorMessage } from "@/lib/utils";

interface Props {
  initialSettings: Record<string, string>;
}

type Field = { key: string; label: string; fallback: string; multiline?: boolean; hint?: string };

const P = "site_edit:home:";

/** Defaults here must match the fallbacks used by src/app/page.tsx. */
const SECTIONS: { title: string; toggle?: string; fields: Field[] }[] = [
  {
    title: "Hero",
    toggle: "hero",
    fields: [
      { key: "hero_eyebrow", label: "Small label above the title", fallback: "Documents, bookings and retreats for travellers from India" },
      { key: "hero_title", label: "Title", fallback: "The world, navigated with *effortless* distinction.", hint: "Wrap a word in *asterisks* to show it in gold italics." },
      { key: "hero_subtitle", label: "Subtitle", multiline: true, fallback: "One account for your visa paperwork, document attestation, flights, hotels, tours, cruises and bus journeys, plus yoga retreats we run ourselves in Rishikesh. With real people to help at every step." },
      { key: "hero_btn_primary", label: "Primary button", fallback: "Explore all 9 services" },
      { key: "hero_btn_secondary", label: "Secondary button", fallback: "See the Rishikesh retreats" },
    ],
  },
  {
    title: "Hero statistics",
    toggle: "stats",
    fields: [
      { key: "stat_1_num", label: "Stat 1: value", fallback: "9" },
      { key: "stat_1_label", label: "Stat 1: label", fallback: "services in one account" },
      { key: "stat_2_num", label: "Stat 2: value", fallback: "2" },
      { key: "stat_2_label", label: "Stat 2: label", fallback: "of our own retreat programmes" },
      { key: "stat_3_num", label: "Stat 3: value", fallback: "India" },
      { key: "stat_3_label", label: "Stat 3: label", fallback: "built for Indian travellers" },
    ],
  },
  {
    title: "How it works",
    toggle: "steps",
    fields: [
      { key: "steps_eyebrow", label: "Small label", fallback: "How it works" },
      { key: "steps_title", label: "Heading", fallback: "Four steps, start to landing" },
      { key: "steps_subtitle", label: "Subtitle", multiline: true, fallback: "Whether it is a visa, a full trip with flights and hotels, or a yoga retreat, the process stays the same." },
      { key: "step1_title", label: "Step 1: title", fallback: "Pick what you need" },
      { key: "step1_desc", label: "Step 1: text", multiline: true, fallback: "Choose a service and tell us what you are after." },
      { key: "step2_title", label: "Step 2: title", fallback: "Fill in the details" },
      { key: "step2_desc", label: "Step 2: text", multiline: true, fallback: "Share your trip and traveller details once. Upload documents securely where needed." },
      { key: "step3_title", label: "Step 3: title", fallback: "Pay and confirm" },
      { key: "step3_desc", label: "Step 3: text", multiline: true, fallback: "Secure checkout, with a confirmation you can keep." },
    ],
  },
];

export function SiteEditClient({ initialSettings }: Props) {
  const router = useRouter();
  const { refetch } = useCMS();

  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const sec of SECTIONS) {
      if (sec.toggle) v[`${P}show_${sec.toggle}`] = initialSettings[`${P}show_${sec.toggle}`] ?? "true";
      for (const f of sec.fields) v[P + f.key] = initialSettings[P + f.key] ?? "";
    }
    return v;
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, val: string) => {
    setValues((p) => ({ ...p, [key]: val }));
    setSuccess(false);
    setError("");
  };

  async function save() {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      // Only send values that changed; an emptied field is saved as "" and falls back to the default.
      const payload = Object.entries(values)
        .filter(([k, v]) => (initialSettings[k] ?? (k.includes(":show_") ? "true" : "")) !== v)
        .map(([key, value]) => ({ key, value }));
      if (payload.length) {
        const res = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await getApiErrorMessage(res));
        await refetch();
        router.refresh();
      }
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 text-xs font-semibold text-navy outline-none focus:border-blue";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-sora font-black text-navy text-2xl flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-blue" /> Site Edit
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Edit the homepage copy. Leave a field empty to use the built-in text. Legal pages are edited in Pages; service pages live in code.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue text-white text-xs font-semibold rounded-xl hover:bg-blue-600 disabled:bg-slate-300 transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <Check className="w-4 h-4 text-green-300" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : success ? "Saved" : "Save changes"}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">{error}</div>}

      {SECTIONS.map((sec) => (
        <section key={sec.title} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sora font-black text-navy text-sm">{sec.title}</h2>
            {sec.toggle && (
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <input
                  type="checkbox"
                  checked={values[`${P}show_${sec.toggle}`] !== "false"}
                  onChange={(e) => set(`${P}show_${sec.toggle}`, e.target.checked ? "true" : "false")}
                />
                Show this section
              </label>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {sec.fields.map((f) => (
              <label key={f.key} className={`block space-y-1 ${f.multiline ? "md:col-span-2" : ""}`}>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">{f.label}</span>
                {f.multiline ? (
                  <textarea rows={3} className={input} value={values[P + f.key]} placeholder={f.fallback} onChange={(e) => set(P + f.key, e.target.value)} />
                ) : (
                  <input className={input} value={values[P + f.key]} placeholder={f.fallback} onChange={(e) => set(P + f.key, e.target.value)} />
                )}
                {f.hint && <span className="block text-[10px] text-slate-400">{f.hint}</span>}
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
