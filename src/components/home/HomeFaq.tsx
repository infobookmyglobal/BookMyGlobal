"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function HomeFaq({ items, defaultOpen = 0 }: { items: { q: string; a: string }[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="space-y-3">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all shadow-sm">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-slate-50/70"
            >
              <span className="text-sm sm:text-base font-bold text-slate-900">{f.q}</span>
              <span className={`grid place-items-center size-7 shrink-0 rounded-full transition-colors ${isOpen ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                {f.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
