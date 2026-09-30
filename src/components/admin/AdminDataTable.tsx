"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Download, CheckSquare, Square, MoreVertical } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  onPageChange: (index: number) => void;
  onSort: (key: string, direction: "asc" | "desc") => void;
  bulkActions?: {
    label: string;
    action: (selectedIds: string[]) => void;
  }[];
  rowIdKey: keyof T;
}

export function AdminDataTable<T>({
  data,
  columns,
  totalCount,
  pageSize,
  pageIndex,
  onPageChange,
  onSort,
  bulkActions,
  rowIdKey,
}: AdminDataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((row) => String(row[rowIdKey])));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSortClick = (key: string) => {
    const nextDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(nextDir);
    onSort(key, nextDir);
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Banner */}
      {selectedIds.length > 0 && bulkActions && (
        <div className="bg-navy text-white px-4 md:px-6 py-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-navy/10 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-gold text-navy px-2.5 py-0.5 rounded-full">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs font-bold text-white/80">Batch actions available</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {bulkActions.map((ba) => (
              <button
                key={ba.label}
                onClick={() => {
                  ba.action(selectedIds);
                  setSelectedIds([]);
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                {ba.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border border-border-custom rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-navy text-white text-xs uppercase tracking-wider">
              <tr>
                {bulkActions && (
                  <th className="px-6 py-4 w-10">
                    <button type="button" onClick={toggleSelectAll} className="text-white hover:text-gold transition-colors">
                      {selectedIds.length === data.length && data.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                {columns.map((col, idx) => (
                  <th key={idx} className="px-6 py-4 font-sora font-black text-[10px] tracking-widest">
                    {col.sortable && col.accessorKey ? (
                      <button
                        onClick={() => handleSortClick(col.accessorKey as string)}
                        className="flex items-center gap-1.5 hover:text-gold transition-colors"
                      >
                        {col.header}
                        {sortKey === col.accessorKey ? (
                          sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronUp className="w-3.5 h-3.5 opacity-35" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom text-xs">
              {data.map((row) => {
                const id = String(row[rowIdKey]);
                const isSelected = selectedIds.includes(id);
                return (
                  <tr
                    key={id}
                    className={`hover:bg-bg-custom/40 transition-colors ${
                      isSelected ? "bg-blue/5" : ""
                    }`}
                  >
                    {bulkActions && (
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => toggleSelectRow(id)}
                          className={`${isSelected ? "text-blue" : "text-muted"} hover:text-blue transition-colors`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map((col, idx) => (
                      <td key={idx} className="px-6 py-4 font-bold text-navy/80">
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                          ? String(row[col.accessorKey as keyof T] || "")
                          : null}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (bulkActions ? 1 : 0)} className="text-center py-12 text-muted font-bold">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-bg-custom border-t border-border-custom px-6 py-4 flex items-center justify-between">
            <span className="text-xs font-bold text-muted">
              Showing page {pageIndex + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pageIndex === 0}
                onClick={() => onPageChange(pageIndex - 1)}
                className="p-2 border border-border-custom bg-white hover:bg-bg-custom disabled:opacity-50 disabled:pointer-events-none rounded-xl text-navy transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pageIndex >= totalPages - 1}
                onClick={() => onPageChange(pageIndex + 1)}
                className="p-2 border border-border-custom bg-white hover:bg-bg-custom disabled:opacity-50 disabled:pointer-events-none rounded-xl text-navy transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
