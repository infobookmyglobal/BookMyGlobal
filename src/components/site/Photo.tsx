"use client";

import { useState } from "react";

/** <img> with a soft gradient fallback so a missing/blocked photo never leaves a hole. */
export function Photo({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(!src);
  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-gradient-to-br from-secondary-fixed via-surface-container to-primary-fixed ${className}`}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src!} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} />;
}
