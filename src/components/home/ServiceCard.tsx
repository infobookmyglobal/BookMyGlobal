"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Zap, ShieldCheck, Heart, Sparkles, Award } from "lucide-react";
import type { Service } from "@/config/services";
import { ServiceIcon } from "@/components/ServiceIcon";
import { IndiaTag } from "@/components/site/ui";

type Variant = "large" | "medium" | "small" | "dark" | "teal";

export function ServiceCard({ 
  service, 
  variant = "medium", 
  className = "",
  badge = "Trending",
  price = "from ₹1,499",
  location = "Global Concierge"
}: { 
  service: Service; 
  variant?: Variant; 
  className?: string;
  badge?: string;
  price?: string;
  location?: string;
}) {
  const [liked, setLiked] = useState(false);
  const perks = service.detail?.included?.slice(0, 2) || [];

  return (
    <div className={`group relative h-full flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card hover:shadow-card-lg transition-all duration-300 ${className}`}>
      
      {/* 16/10 Aspect Image Area */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-blue-50/50">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-sky-500/10 mix-blend-multiply z-10 pointer-events-none" />
        
        {/* Placeholder / Service visual */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/5 via-blue-600/10 to-slate-900/15 group-hover:scale-105 transition-transform duration-500">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md text-blue-600">
            <ServiceIcon kind={service.icon} className="h-7 w-7" />
          </div>
        </div>

        {/* Top-Left Badge */}
        <span className="absolute start-3 top-3 z-20 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
          {badge}
        </span>

        {/* Top-Right Wishlist / Heart Button */}
        <button
          type="button"
          aria-label="Save to wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="press absolute end-2 top-2 z-20 grid size-9 place-items-center rounded-full bg-white/85 backdrop-blur-md shadow-sm hover:bg-white text-slate-700 transition-colors"
        >
          <Heart className={`h-4 w-4 transition-colors ${liked ? "fill-red-500 text-red-500 heart-pop" : "text-slate-600"}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        
        {/* Category & India Tag */}
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            {service.pillar} · {service.kicker}
          </p>
          {service.indiaOnly && <IndiaTag />}
        </div>

        {/* Title */}
        <Link href={service.href} className="group-hover:text-blue-600 transition-colors">
          <h3 className="line-clamp-2 text-[15px] font-bold text-slate-900 leading-snug">
            {service.title}
          </h3>
        </Link>

        {/* Location tag */}
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{location}</span>
        </p>

        {/* Feature Tags Row */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-600">
            <Zap className="h-3.5 w-3.5 text-blue-600" />
            <span>Instant Quote</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>MEA Verified</span>
          </span>
        </div>

        {/* Price & Action Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3.5 mt-4">
          <div>
            <p className="text-xs text-slate-400 font-medium">starting from</p>
            <p className="text-sm font-extrabold text-slate-900">{price}</p>
          </div>
          
          <Link
            href={service.href}
            className="press inline-flex items-center gap-1 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
          >
            <span>Explore</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
