"use client";

import { useState } from "react";
import { createIncident } from "@/lib/actions/incidents";
import { useRouter } from "next/navigation";
import { X, Plus, AlertTriangle, Globe, Terminal, Loader2 } from "lucide-react";

export default function CreateIncidentModal({ tenantId, userId }: { tenantId: string, userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await createIncident(formData, tenantId, userId);
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
    >
      <Plus className="w-4 h-4" />
      New Incident
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={() => !isPending && setIsOpen(false)} 
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create Incident</h2>
            <p className="text-xs text-slate-500 mt-0.5">Initialize a new incident record for your team.</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            disabled={isPending}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Terminal className="w-3 h-3" />
               Title
            </label>
            <input 
              name="title" 
              required 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" 
              placeholder="e.g. Major degradation in Checkout API" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Severity
              </label>
              <select name="severity" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                <option value="SEV1">SEV1 — Critical</option>
                <option value="SEV2">SEV2 — Major</option>
                <option value="SEV3">SEV3 — Minor</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Globe className="w-3 h-3" />
                Environment
              </label>
              <select name="environment" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                <option value="prod">Production</option>
                <option value="staging">Staging</option>
                <option value="dev">Development</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              Service Name
            </label>
            <input 
              name="service" 
              required 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
              placeholder="e.g. core-api, auth-v2" 
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              disabled={isPending}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Incident'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}