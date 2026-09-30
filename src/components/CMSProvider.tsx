"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface CMSContextType {
  cmsData: Record<string, string>;
  getCmsText: (key: string, defaultValue: string) => string;
  loading: boolean;
  refetch: () => Promise<void>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({
  children,
  initialData = {},
}: {
  children: React.ReactNode;
  initialData?: Record<string, string>;
}) {
  const [cmsData, setCmsData] = useState<Record<string, string>>(initialData);
  const [loading, setLoading] = useState(Object.keys(initialData).length === 0);

  const fetchCmsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCmsData(data);
      }
    } catch (e) {
      console.error("Failed to fetch CMS settings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setCmsData((prev) => ({ ...prev, ...initialData }));
    }
    fetchCmsData();
  }, [initialData]);

  const getCmsText = (key: string, defaultValue: string): string => {
    return cmsData[key] || defaultValue;
  };

  return (
    <CMSContext.Provider
      value={{
        cmsData,
        getCmsText,
        loading,
        refetch: fetchCmsData,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error("useCMS must be used within a CMSProvider");
  }
  return context;
}
