"use client";

import { useState } from "react";
import IncidentTable from "./IncidentTable";
import BulkActionToolbar from "./BulkActionTollBar";

export default function IncidentListClient({ 
  incidents, 
  tenantSlug, 
  tenantId, 
  userId 
}: any) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <>
      <IncidentTable 
        incidents={incidents} 
        tenantSlug={tenantSlug} 
        onSelectionChange={setSelectedIds} 
      />
      
      <BulkActionToolbar 
        selectedIds={selectedIds} 
        tenantId={tenantId} 
        userId={userId} 
      />
    </>
  );
}