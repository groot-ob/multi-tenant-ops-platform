"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface BannerProps {
  enabled: boolean;
  trace: string;
  flagKey: string;
}

export function Banner({ enabled, trace, flagKey }: BannerProps) {
 const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="relative shadow-2xl">
        {enabled ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex justify-between items-start">
            <div>
              <p className="font-bold text-sm flex items-center gap-2">
                <span className="animate-pulse">✨</span> New Feature Active
              </p>
              <p className="text-[10px] mt-1 opacity-70 font-mono bg-emerald-100/50 px-1.5 py-0.5 rounded italic">
                Trace: {trace}
                
              </p>
            </div>
            <button onClick={() => setIsVisible(true)} className="hover:bg-emerald-200/50 p-1 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl flex justify-between items-start">
            <div>
              <p className="text-sm font-medium">Standard Dashboard View</p>
              <p className="text-[10px] mt-1 opacity-60 font-mono italic">
                Trace: {trace}
              </p>
            </div>
            <button onClick={() => setIsVisible(false)} className="hover:bg-slate-200/50 p-1 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}