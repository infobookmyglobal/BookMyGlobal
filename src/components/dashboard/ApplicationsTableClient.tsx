"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { ViewApplicationModal, type DashboardApplication } from "./ViewApplicationModal";

const SERVICE_LABEL: Record<string, string> = {
  VISA: "Visa assistance",
  ATTESTATION: "Document attestation",
};

interface ApplicationsTableClientProps {
  applications: DashboardApplication[];
}

export function ApplicationsTableClient({ applications }: ApplicationsTableClientProps) {
  const [selectedApp, setSelectedApp] = useState<DashboardApplication | null>(null);

  return (
    <>
      <div className="bg-white border border-border-custom rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy text-white text-xs uppercase tracking-wider">
                <th className="p-4 text-left">Ref</th>
                <th className="p-4 text-left">Service</th>
                <th className="p-4 text-left">Fee</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {applications.map((app) => {
                const paid = app.payment?.status === "COMPLETED";
                const canPay = app.baseAmount > 0 && !paid && app.status !== "REJECTED";
                return (
                  <tr key={app.id} className="hover:bg-bg-custom transition-colors">
                    <td className="p-4 font-mono font-bold text-xs text-muted">#{app.id.slice(-8).toUpperCase()}</td>
                    <td className="p-4 font-bold text-navy">
                      {SERVICE_LABEL[app.productType] || app.productType}
                      {app.destinationCountry ? <span className="block text-xs font-normal text-muted">→ {app.destinationCountry}</span> : null}
                    </td>
                    <td className="p-4 font-bold">
                      {app.baseAmount > 0 ? (
                        <>
                          {app.currency} {Number(paid ? app.finalAmount : app.baseAmount).toLocaleString("en-IN")}
                          {paid && <span className="ml-1.5 text-[10px] font-black text-green-700">PAID</span>}
                        </>
                      ) : (
                        <span className="text-xs font-normal text-muted">To be quoted</span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="p-4 text-muted">{new Date(app.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="text-[11px] font-bold text-navy hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>

                        {canPay && (
                          <Link href={`/dashboard/applications/${app.id}/pay`} className="text-[11px] font-black text-green-700 hover:underline">
                            Pay now
                          </Link>
                        )}

                        {app.status === "PENDING" && !app.passportUrl && (
                          <Link href="/dashboard/upload" className="text-[11px] font-bold text-blue hover:underline">
                            Upload docs
                          </Link>
                        )}

                        {(app.status === "PENDING" || app.status === "UNDER_REVIEW") && (
                          <Link href={`/dashboard/applications/${app.id}/edit`} className="text-[11px] font-bold text-orange-600 hover:underline">
                            Edit details
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ViewApplicationModal isOpen={selectedApp !== null} onClose={() => setSelectedApp(null)} application={selectedApp} />
    </>
  );
}
