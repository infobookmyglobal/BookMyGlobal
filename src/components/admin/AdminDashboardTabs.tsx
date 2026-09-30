"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight, Check, X, ShieldAlert, FileText, User } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currency";

interface Application {
  id: string;
  fullName: string;
  email: string;
  productType: string;
  status: string;
  finalAmount: number;
  currency?: string;
}

interface PartnerRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date | string;
}

interface AdminDashboardTabsProps {
  recentApps: Application[];
  initialPendingPartnerRequests: PartnerRequest[];
}

function serviceLabel(t: string) {
  const map: Record<string, string> = { VISA: "Visa assistance", ATTESTATION: "Attestation", OTHER: "Other" };
  return map[t] || t;
}

export function AdminDashboardTabs({
  recentApps,
  initialPendingPartnerRequests,
}: AdminDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<"applications" | "partnerRequests">("applications");
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>(initialPendingPartnerRequests);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePartnerAction = async (requestId: string, status: "APPROVED" | "REJECTED") => {
    setActioningId(requestId);
    setError(null);
    try {
      const endpoint = status === "APPROVED"
        ? `/api/admin/partner-requests/${requestId}/approve`
        : `/api/admin/partner-requests/${requestId}/decline`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPartnerRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        throw new Error(data.error || `Failed to ${status.toLowerCase()} partner request`);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="bg-white border border-border-custom rounded-2xl shadow-sm overflow-hidden md:col-span-2">
      {/* Tabs Header */}
      <div className="px-5 border-b border-border-custom flex flex-col sm:flex-row sm:items-center justify-between bg-white gap-2 py-2 sm:py-0">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap scrollbar-none pr-4">
          <button
            onClick={() => setActiveTab("applications")}
            className={`py-3 sm:py-4 font-sora font-black text-sm relative transition-all duration-200 shrink-0 ${
              activeTab === "applications" ? "text-blue" : "text-muted hover:text-navy"
            }`}
          >
            Recent Applications
            {activeTab === "applications" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue rounded-full animate-fade-in" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("partnerRequests")}
            className={`py-3 sm:py-4 font-sora font-black text-sm relative transition-all duration-200 flex items-center gap-2 shrink-0 ${
              activeTab === "partnerRequests" ? "text-blue" : "text-muted hover:text-navy"
            }`}
          >
            Pending Partner Requests
            {partnerRequests.length > 0 && (
              <span className="bg-purple-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {partnerRequests.length}
              </span>
            )}
            {activeTab === "partnerRequests" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue rounded-full animate-fade-in" />
            )}
          </button>
        </div>

        {activeTab === "applications" ? (
          <Link
            href="/admin/applications"
            className="text-blue text-xs font-bold hover:underline flex items-center gap-1 shrink-0 self-end sm:self-auto pb-1 sm:pb-0"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            href="/admin/partners"
            className="text-blue text-xs font-bold hover:underline flex items-center gap-1 shrink-0 self-end sm:self-auto pb-1 sm:pb-0"
          >
            Manage Partners <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-b border-red-100 px-5 py-2.5 text-xs font-bold text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === "applications" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-bg-custom text-muted uppercase font-bold text-[9px] border-b border-border-custom">
              <tr>
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {recentApps.map((app) => (
                <tr key={app.id} className="hover:bg-bg-custom/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-bold text-navy">{app.fullName}</div>
                    <div className="text-[10px] text-muted">{app.email}</div>
                  </td>
                  <td className="px-5 py-3 font-bold text-navy/80">
                    {serviceLabel(app.productType)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        app.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : app.status === "UNDER_REVIEW"
                          ? "bg-blue/10 text-blue"
                          : app.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : app.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-navy">
                    {getCurrencySymbol(app.currency || "INR")}{app.finalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {recentApps.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-muted">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-bg-custom text-muted uppercase font-bold text-[9px] border-b border-border-custom">
              <tr>
                <th className="px-5 py-3">Partner Details</th>
                <th className="px-5 py-3">Phone &amp; Address</th>
                <th className="px-5 py-3">Applied At</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {partnerRequests.map((req) => (
                <tr key={req.id} className="hover:bg-bg-custom/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-navy flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      {req.name}
                    </div>
                    <div className="text-[10px] text-muted pl-5">{req.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-navy/80">{req.phone}</div>
                    <div className="text-[10px] text-muted max-w-[220px] truncate" title={req.address}>
                      {req.address}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-navy/80">
                    {format(new Date(req.createdAt), "MMM d, yyyy h:mm a")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handlePartnerAction(req.id, "APPROVED")}
                        disabled={actioningId !== null}
                        className="bg-green-100 hover:bg-green-600 hover:text-white text-green-700 rounded-lg px-2.5 py-1.5 text-[10px] font-black flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handlePartnerAction(req.id, "REJECTED")}
                        disabled={actioningId !== null}
                        className="bg-red-100 hover:bg-red-600 hover:text-white text-red-700 rounded-lg px-2.5 py-1.5 text-[10px] font-black flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {partnerRequests.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-muted space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      🤝
                    </div>
                    <p className="font-bold">All caught up!</p>
                    <p className="text-[10px]">No pending partner registration requests.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
