"use client";

import { Status } from "@prisma/client";
import { updateIncidentStatus } from "@/lib/actions/incidents";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StatusButtons({ incidentId, currentStatus, tenantId, userId }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (newStatus: Status) => {
    setLoading(true);
    try {
      await updateIncidentStatus(incidentId, newStatus, tenantId, userId);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Requirement: open -> mitigated -> resolved allowed */}
      {currentStatus === "OPEN" && (
        <button 
          onClick={() => handleUpdate("MITIGATED")}
          disabled={loading}
          className="bg-yellow-500 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Mitigate
        </button>
      )}

      {(currentStatus === "OPEN" || currentStatus === "MITIGATED") && (
        <button 
          onClick={() => handleUpdate("RESOLVED")}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Resolve
        </button>
      )}

      {/* Requirement: resolved -> open NOT allowed */}
      {currentStatus === "RESOLVED" && (
        <span className="text-green-600 font-bold border border-green-600 px-4 py-2 rounded">
          ✓ Resolved
        </span>
      )}
    </div>
  );
}