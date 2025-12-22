"use client";

import { useState } from "react";
import { createIncident } from "@/lib/actions/incidents";
import { useRouter } from "next/navigation";
import { X, Plus, AlertTriangle, Globe, Terminal, Loader2, TagIcon } from "lucide-react";

export default function CreateIncidentModal({ tenantId, userId }: { tenantId: string, userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const router = useRouter();

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    formData.append("tags", JSON.stringify(tags));
    try {
      await createIncident(formData, tenantId, userId);
      setIsOpen(false);
      setTags([])
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
      className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-black transition-all shadow-sm active:scale-95"
    >
      <Plus className="w-4 h-4" />
      New Incident
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Darker Overlay for better focus on modal */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] transition-opacity" 
        onClick={() => !isPending && setIsOpen(false)} 
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-300 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header - More Contrast */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">Create Incident</h2>
            <p className="text-sm text-slate-600 mt-0.5 font-medium">Initialize a new incident record for your team.</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors"
            disabled={isPending}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
               Title
            </label>
            <input 
              name="title" 
              required 
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-950 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-500 shadow-sm" 
              placeholder="e.g. Major degradation in Checkout API" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Severity */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Severity
              </label>
              <select name="severity" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-950 appearance-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all shadow-sm">
                <option value="SEV1">SEV1 — Critical</option>
                <option value="SEV2">SEV2 — Major</option>
                <option value="SEV3">SEV3 — Minor</option>
                <option value="SEV3">SEV4 — Low</option>
              </select>
            </div>
            {/* Environment */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                Environment
              </label>
              <select name="environment" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-950 appearance-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all shadow-sm">
                <option value="prod">Production</option>
                <option value="staging">Staging</option>
                <option value="dev">Development</option>
              </select>
            </div>
          </div>

          {/* Service Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
              Service Name
            </label>
            <input 
              name="service" 
              required 
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-950 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all shadow-sm" 
              placeholder="e.g. core-api, auth-v2" 
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <TagIcon className="w-3.5 h-3.5" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-white border border-slate-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600 transition-all shadow-sm">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-md border border-blue-200">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "Add tags (press enter)..." : ""}
                className="flex-1 outline-none text-sm font-medium text-slate-950 min-w-[120px] py-1 px-1 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Footer Actions - Stronger Button Contrast */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-950 transition-colors"
              disabled={isPending}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-3 rounded-xl text-sm font-extrabold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
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