"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Loader2, Plus, FileCheck } from "lucide-react";

export default function FileUploader({ incidentId, tenantId }: { incidentId: string; tenantId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: 5MB Limit
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Max 5MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tenantId", tenantId);
    formData.append("incidentId", incidentId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        router.refresh(); // Refresh the Server Component to show the new file
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all group">
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        ) : (
          <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
        )}
        <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-700">
          {isUploading ? "Uploading..." : "Attach File"}
        </span>
        <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
      </label>
    </div>
  );
}