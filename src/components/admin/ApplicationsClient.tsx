"use client";

import { useState } from "react";
import { AdminDataTable, Column } from "./AdminDataTable";
import { ApplicationReviewPanel } from "./ApplicationReviewPanel";
import { format } from "date-fns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Eye, Check, AlertCircle, FileText, Mail, Trash } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currency";

interface ApplicationsClientProps {
  applications: any[];
  totalCount: number;
  pageSize: number;
  pageIndex: number;
}

export function ApplicationsClient({
  applications,
  totalCount,
  pageSize,
  pageIndex,
}: ApplicationsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  // Quick State Helpers
  const statusFilter = searchParams.get("status") || "";
  const productFilter = searchParams.get("productType") || "";
  const searchFilter = searchParams.get("search") || "";

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to page 1 on filter
    Object.entries(updates).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleApproveRow = async (id: string) => {
    if (!confirm("Approve this request and email the customer?")) return;
    try {
      const res = await fetch(`/api/admin/applications/${id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Approval failed");
      alert("Application approved!");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRow = async (id: string) => {
    if (!confirm("⚠️ WARNING: This will permanently delete this application, its payment records, shipment records, and all associated data. This action CANNOT be undone. Are you sure you want to proceed?")) return;
    try {
      const res = await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Deletion failed");
      }
      alert("Application successfully deleted!");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleManualAction = async (id: string, actionPath: string, successMessage: string) => {
    try {
      const res = await fetch(`/api/admin/applications/${id}/${actionPath}`, { method: "POST" });
      if (!res.ok) throw new Error("Action failed");
      alert(successMessage);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: Column<any>[] = [
    {
      header: "Ref",
      accessorKey: "id",
      cell: (row) => (
        <span className="font-mono text-xs font-black text-navy/60">#{row.id.slice(-8).toUpperCase()}</span>
      ),
      sortable: true,
    },
    {
      header: "Applicant",
      accessorKey: "fullName",
      cell: (row) => (
        <div>
          <div className="font-black text-navy flex items-center gap-1.5 flex-wrap">
            {row.fullName}
            {row.isDuplicate && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                ⚠️ DUPLICATE PAYMENT
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted">{row.email}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Lives in",
      accessorKey: "country",
    },
    {
      header: "Product",
      accessorKey: "productType",
      cell: (row) => (
        <span className="font-bold">
          {({ VISA: "Visa assistance", ATTESTATION: "Attestation" } as Record<string, string>)[row.productType] || row.productType}
          {row.destinationCountry ? <span className="text-muted font-normal"> → {row.destinationCountry}</span> : null}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const colors: Record<string, string> = {
          PENDING: "bg-yellow-100 text-yellow-800",
          UNDER_REVIEW: "bg-blue/10 text-blue",
          APPROVED: "bg-green-100 text-green-700",
          REJECTED: "bg-red-100 text-red-700",
          COMPLETED: "bg-gray-100 text-gray-700",
        };
        return (
          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${colors[row.status] || "bg-bg-custom"}`}>
            {row.status.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      header: "Amount",
      accessorKey: "finalAmount",
      cell: (row) => {
        const symbol = getCurrencySymbol(row.currency || "INR");
        const quoted = row.baseAmount > 0;
        return quoted ? (
          <span className="font-black text-navy">
            {symbol}{Number(row.finalAmount || row.baseAmount).toLocaleString("en-IN")}
            {row.payment?.status === "COMPLETED" ? <span className="ml-1 text-[9px] text-green-700">PAID</span> : null}
          </span>
        ) : (
          <span className="text-muted text-[11px]">Not quoted</span>
        );
      },
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: (row) => <span>{format(new Date(row.createdAt), "MMM dd, yyyy")}</span>,
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedApp(row)}
            className="p-1.5 hover:bg-bg-custom text-navy rounded-lg transition-colors"
            title="Review/View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {(row.status === "UNDER_REVIEW" || row.status === "PENDING") && (
            <button
              onClick={() => handleApproveRow(row.id)}
              className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
              title="Approve"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDeleteRow(row.id)}
            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Delete Application"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Keep selectedApp updated when applications array changes
  const activeApp = selectedApp
    ? applications.find((a) => a.id === selectedApp.id) || selectedApp
    : null;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-black text-navy text-2xl">Applications</h1>
          <p className="text-muted text-xs">Review requests, quote fees, approve and track each customer through to completion.</p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-border-custom rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-72 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search applicant name, email..."
            value={searchFilter}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-border-custom rounded-xl text-xs outline-none focus:border-blue bg-bg-custom/50 focus:bg-white transition-all font-bold"
          />
        </div>

        <div className="flex flex-wrap w-full md:w-auto gap-2 justify-end">
          <select
            value={statusFilter}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="border border-border-custom bg-white rounded-xl px-3 py-2 text-xs font-bold text-navy outline-none focus:border-blue"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={productFilter}
            onChange={(e) => updateFilters({ productType: e.target.value })}
            className="border border-border-custom bg-white rounded-xl px-3 py-2 text-xs font-bold text-navy outline-none focus:border-blue"
          >
            <option value="">All Services</option>
            <option value="VISA">Visa assistance</option>
            <option value="ATTESTATION">Attestation</option>
          </select>
        </div>
      </div>

      {/* DataTable */}
      <AdminDataTable
        data={applications}
        columns={columns}
        totalCount={totalCount}
        pageSize={pageSize}
        pageIndex={pageIndex}
        onPageChange={(idx) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", String(idx + 1));
          router.push(`${pathname}?${params.toString()}`);
        }}
        onSort={(key, dir) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sortBy", key);
          params.set("sortDir", dir);
          router.push(`${pathname}?${params.toString()}`);
        }}
        rowIdKey="id"
      />

      {/* Detail Slide-over panel */}
      {selectedApp && (
        <ApplicationReviewPanel
          application={activeApp}
          onClose={() => setSelectedApp(null)}
          onRefresh={() => router.refresh()}
        />
      )}
    </div>
  );
}
