"use client";

import { CheckCircle, UserPlus, Loader2, ChevronUp, ShieldAlert } from "lucide-react";
import { bulkUpdateIncidents } from "@/lib/actions/incidents";
import { getTenantUsers } from "@/lib/actions/users";
import { useState, useEffect } from "react";
import { Status } from "@prisma/client";
import { useNotificationStore } from "@/lib/hooks/use-notifications";


export default function BulkActionToolbar({ selectedIds, tenantId, userId, onSuccess }: any) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [users, setUsers] = useState<{id: string, name: string | null}[]>([]);
  const [alertMessage, setAlertMessage] = useState<{ text: string, type: 'success' | 'warning' } | null>(null);
  const increment = useNotificationStore((state) => state.increment);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  useEffect(() => {
    if (selectedIds.length > 0) {
      getTenantUsers(tenantId).then(setUsers);
    }
  }, [selectedIds.length, tenantId]);

  if (selectedIds.length === 0) return null;
  

  const handleAction = async (status?: string, assigneeId?: string) => {
  setIsUpdating(true);
  try {
    const result = await bulkUpdateIncidents({ 
      ids: selectedIds, 
      status: status as Status, 
      assigneeId, 
      tenantId, 
      userId 
    });

      if (result.count > 0) {
      
        increment(result.count);
      }

    if (result.count === 0 && status) {
      alert(`Invalid Move: These incidents are already ${status} or cannot be moved to ${status}.`);
    } else if (result.count < selectedIds.length && status) {
      // PARTIAL SUCCESS: Some were updated, some skipped
      alert(`Updated ${result.count} incidents. ${selectedIds.length - result.count} were skipped due to status rules.`);
      if (onSuccess) onSuccess();
    } else {
      // FULL SUCCESS
      if (onSuccess) onSuccess();
    }
    
  } catch (error) {
    alert("A system error occurred.");
  } finally {
    setIsUpdating(false);
    setShowAssignMenu(false);
  }
};

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-700/50 backdrop-blur-md ">
        
        {isUpdating && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-800 overflow-hidden rounded-t-2xl">
            <div className="h-full bg-blue-500 animate-progress-fast origin-left shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          </div>
        )}

        <div className="flex items-center gap-3 border-r border-slate-700 pr-6">
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-blue-500/20">
            {selectedIds.length}
          </span>
          <span className="text-sm font-medium text-slate-300">Selected</span>
        </div>

        <div className="flex items-center gap-5">
          {/* Mitigate Action (New) */}
          <button 
            onClick={() => handleAction('MITIGATED')}
            disabled={isUpdating}
            className="group flex items-center gap-2 text-sm font-semibold hover:text-orange-400 transition-colors disabled:opacity-50"
          >
            <ShieldAlert className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
            Mitigate
          </button>

          {/* Resolve Action */}
          <button 
            onClick={() => handleAction('RESOLVED')}
            disabled={isUpdating}
            className="group flex items-center gap-2 text-sm font-semibold hover:text-green-400 transition-colors disabled:opacity-50"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
            )}
            Resolve
          </button>

          {/* Assign Action */}
          <div className="relative">
            <button 
              onClick={() => setShowAssignMenu(!showAssignMenu)}
              disabled={isUpdating}
              className={`flex items-center gap-2 text-sm font-semibold transition-colors hover:text-blue-400 ${showAssignMenu ? 'text-blue-400' : ''} disabled:opacity-50`}
            >
              <UserPlus className="w-4 h-4" />
              Assign
              <ChevronUp className={`w-3 h-3 transition-transform ${showAssignMenu ? 'rotate-180' : ''}`} />
            </button>

            {showAssignMenu && (
              <div className="absolute bottom-full mb-4 left-0 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden py-1 animate-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Engineer</span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {users.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleAction(undefined, user.id)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <span className="truncate">{user.name || "Unknown User"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}