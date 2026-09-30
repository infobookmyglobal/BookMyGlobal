"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@/lib/clerk";

export function ClerkUserButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a subtle circular placeholder matching the size of the UserButton
    return (
      <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  return <UserButton />;
}
