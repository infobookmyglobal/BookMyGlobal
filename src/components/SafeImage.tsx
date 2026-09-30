"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
};

export function SafeImage({
  src,
  fallbackSrc = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);

  // Sync state if source prop changes dynamically
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
