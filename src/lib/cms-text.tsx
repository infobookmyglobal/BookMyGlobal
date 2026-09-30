import type { ReactNode } from "react";
import { Em } from "@/components/site/ui";

/** Turns "The world, navigated with *effortless* distinction." into JSX with an italic accent. */
export function renderEmphasis(text: string, emClass?: string): ReactNode[] {
  return text.split(/(\*[^*]+\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <Em key={i} className={emClass}>{part.slice(1, -1)}</Em>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
