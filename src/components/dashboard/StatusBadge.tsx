import React from "react";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    UNDER_REVIEW: { color: "bg-blue/10 text-blue", label: "Under Review" },
    APPROVED: { color: "bg-green-100 text-green-700", label: "Approved" },
    REJECTED: { color: "bg-red-100 text-red-700", label: "Rejected" },
    COMPLETED: { color: "bg-purple-100 text-purple-700", label: "Completed" },
  };
  const { color, label } = map[status] ?? { color: "bg-gray-100 text-gray-700", label: status };
  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
}
