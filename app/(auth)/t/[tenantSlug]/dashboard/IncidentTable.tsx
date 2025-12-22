"use client";
import Link from "next/link";
import { User, Layers, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNotificationStore } from "@/lib/hooks/use-notifications";

interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  service: string;
  createdAt: Date | string; 
  updatedAt: Date | string; 
  assignee?: { name: string | null } | null;
}

interface IncidentTableProps {
  incidents: Incident[];
  tenantSlug: string;
  onSelectionChange: (selectedIds: string[]) => void;
}

export default function IncidentTable({ incidents, tenantSlug, onSelectionChange}: IncidentTableProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleAll = () => {
    
    const newSelected = selected.length === incidents.length ? [] : incidents.map((i) => i.id);
    setSelected(newSelected);
    onSelectionChange(newSelected);
  };

  const toggleOne = (id: string) => {
    const newSelected = selected.includes(id) 
      ? selected.filter(s => s !== id) 
      : [...selected, id];
    setSelected(newSelected);
    onSelectionChange(newSelected);
  };

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <Layers className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-slate-900 font-semibold">No incidents found</h3>
        <p className="text-slate-500 text-sm max-w-xs text-center mt-1">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0 min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50">
              {/* FIXED WIDTH: Checkbox Column */}
              <th className="w-14 px-6 py-4 border-b border-slate-100">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  onChange={toggleAll}
                  checked={selected.length === incidents.length && incidents.length > 0}
                />
              </th>
              {/* FLEXIBLE WIDTH: Main Details */}
              <th className="min-w-[250px] px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                Incident Details
              </th>
              <th className="w-32 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                Severity
              </th>
              <th className="w-40 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                Status
              </th>
              <th className="w-44 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                Service
              </th>
              {/* FIXED WIDTH: Action Column */}
              <th className="w-20 px-6 py-4 text-right border-b border-slate-100"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incidents.map((inc) => {
              const isSelected = selected.includes(inc.id);
              return (
                <tr 
                  key={inc.id} 
                  className={`group transition-all cursor-default ${isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'}`}
                >
                  <td className="px-6 py-5 border-b border-slate-50">
                     <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      checked={isSelected}
                      onChange={() => toggleOne(inc.id)}
                    />
                  </td>
                  <td className="px-4 py-5 border-b border-slate-50">
                    <div className="flex flex-col gap-1">
                      <Link 
                        href={`/t/${tenantSlug}/incidents/${inc.id}`}
                        className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {inc.title}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {inc.assignee?.name || "Unassigned"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Just now
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 border-b border-slate-50">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border ${getSeverityStyles(inc.severity)}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-6 py-5 border-b border-slate-50">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${getStatusBadgeStyles(inc.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(inc.status)}`} />
                      {inc.status}
                    </div>
                  </td>
                  <td className="px-6 py-5 border-b border-slate-50">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium overflow-hidden">
                      <div className="flex-shrink-0 w-2 h-2 rounded-sm bg-slate-200" />
                      <span className="truncate">{inc.service}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right border-b border-slate-50">
                    <Link 
                      href={`/t/${tenantSlug}/incidents/${inc.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-100 transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getSeverityStyles(severity: string) {
    switch (severity) {
      case 'SEV1': return 'bg-red-100 text-red-700 border-red-200 ring-4 ring-red-50';
      case 'SEV2': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'SEV3': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }
  
  function getStatusBadgeStyles(status: string) {
    switch (status) {
      case 'OPEN': return 'bg-white text-red-700 border-red-100 shadow-sm';
      case 'MITIGATED': return 'bg-white text-yellow-700 border-yellow-100 shadow-sm';
      case 'RESOLVED': return 'bg-white text-green-700 border-green-100 shadow-sm';
      default: return 'bg-white text-slate-600 border-slate-100 shadow-sm';
    }
  }
  
  function getStatusDot(status: string) {
    switch (status) {
      case 'OPEN': return 'bg-red-500 animate-pulse';
      case 'MITIGATED': return 'bg-yellow-500';
      case 'RESOLVED': return 'bg-green-500';
      default: return 'bg-slate-300';
    }
  }