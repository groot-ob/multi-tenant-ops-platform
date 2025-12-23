"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

export function UnauthorizedModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setIsOpen(true);
    }
  }, [searchParams]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        {/* Visual Header */}
        <div className="bg-red-50 p-8 flex flex-col items-center text-center border-b border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-red-700 text-sm font-medium mt-1">Administrator Privileges Required</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <Lock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-relaxed">
              You attempted to access a protected settings area. Only members with the 
              <span className="font-bold text-slate-900"> ADMIN </span> 
              role can manage feature flags and organization configurations.
            </p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              router.replace(window.location.pathname); 
            }}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
        
        <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Think this is a mistake? Contact your organization owner.
          </p>
        </div>
      </div>
    </div>
  );
}