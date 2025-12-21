"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Loader2, Plus, ShieldCheck, ShieldAlert, Check } from "lucide-react";

type UploadStatus = "idle" | "uploading" | "scanning" | "success" | "error";

export default function FileUploader({ incidentId, tenantId }: { incidentId: string; tenantId: string }) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

 const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setErrorMessage("");
  
  // 1. Immediately show scanning/uploading status
  // Since our server-side scan is part of the POST request, 
  // we combine these or set them right at the start.
  setStatus("scanning"); 

  const formData = new FormData();
  formData.append("file", file);
  formData.append("tenantId", tenantId);
  formData.append("incidentId", incidentId);

  try {
    // The code "pauses" here for 2+ seconds while the server runs the scan
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const result = await res.json();

    if (res.status === 403) {
      setStatus("error");
      setErrorMessage(result.details);
      return;
    }

    if (!res.ok) throw new Error("Upload failed");

    setStatus("success");
    router.refresh();
    setTimeout(() => setStatus("idle"), 3000);

  } catch (err) {
    setStatus("error");
    setErrorMessage("An unexpected error occurred.");
  }
};

  return (
    <div className="mt-4 space-y-2">
      <label className={`
        flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 border-dashed rounded-xl transition-all group
        ${status === 'idle' ? 'border-slate-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer' : ''}
        ${status === 'uploading' || status === 'scanning' ? 'border-blue-200 bg-blue-50 cursor-wait' : ''}
        ${status === 'success' ? 'border-emerald-200 bg-emerald-50 cursor-default' : ''}
        ${status === 'error' ? 'border-red-200 bg-red-50 cursor-default' : ''}
      `}>
        {/* Dynamic Icons based on Status */}
        {status === "idle" && <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />}
        {(status === "uploading" || status === "scanning") && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        {status === "success" && <Check className="w-4 h-4 text-emerald-600" />}
        {status === "error" && <ShieldAlert className="w-4 h-4 text-red-600" />}

        <span className={`text-sm font-semibold ${
          status === 'success' ? 'text-emerald-700' : 
          status === 'error' ? 'text-red-700' : 'text-slate-600 group-hover:text-blue-700'
        }`}>
          {status === "idle" && "Attach File"}
          {status === "uploading" && "Uploading..."}
          {status === "scanning" && "Running Security Scan..."}
          {status === "success" && "File Verified & Saved"}
          {status === "error" && "Scan Failed"}
        </span>

        <input 
          type="file" 
          className="hidden" 
          onChange={handleUpload} 
          disabled={status !== "idle"} 
        />
      </label>

      {status === "error" && (
        <p className="text-[11px] text-red-600 font-medium px-2 flex items-center gap-1">
           <ShieldAlert className="w-3 h-3" /> {errorMessage}
        </p>
      )}
    </div>
  );
}