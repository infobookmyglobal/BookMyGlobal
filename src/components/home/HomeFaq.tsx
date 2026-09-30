"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export function HomeFaq({ items, defaultOpen = 0 }: { items: { q: string; a: string }[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="space-y-space-sm">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-space-md py-space-md text-left"
            >
              <span className="font-title-md text-title-md text-primary">{f.q}</span>
              <Plus className={`h-5 w-5 shrink-0 text-secondary transition-transform ${isOpen ? "rotate-45" : ""}`} />
            </button>
            {isOpen && <p className="px-space-md pb-space-md font-body-md text-body-md leading-relaxed text-on-surface-variant">{f.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
