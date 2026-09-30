"use client";

import React from "react";
import Link from "next/link";
import { X, FileText, ExternalLink } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export interface DashboardApplication {
  id: string;
  productType: string;
  status: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  address: string | null;
  destinationCountry: string | null;
  passportUrl: string | null;
  licenseUrl: string | null;
  profilePhotoUrl: string | null;
  rejectionReason: string | null;
  createdAt: Date | string;
  currency: string;
  baseAmount: number;
  finalAmount: number;
  couponCode: string | null;
  payment?: { status: string; provider: string } | null;
}

const SERVICE_LABEL: Record<string, string> = {
  VISA: "Visa assistance",
  ATTESTATION: "Document attestation",
};

const isImage = (u: string | null) => !!u && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(u);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  application: DashboardApplication | null;
}

export function ViewApplicationModal({ isOpen, onClose, application: app }: Props) {
  if (!isOpen || !app) return null;
  const paid = app.payment?.status === "COMPLETED";
  const canPay = app.baseAmount > 0 && !paid && app.status !== "REJECTED";

  const docs = [
    { label: "Passport / ID", url: app.passportUrl },
    { label: "Supporting document", url: app.licenseUrl },
    { label: "Photograph", url: app.profilePhotoUrl },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-border-custom">
          <div>
            <h2 className="font-sora font-black text-navy text-lg">{SERVICE_LABEL[app.productType] || app.productType}</h2>
            <p className="text-xs font-mono text-muted mt-0.5">#{app.id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={app.status} />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg-custom text-muted">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 text-sm">
          {app.status === "REJECTED" && app.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800">
              <p className="font-black text-xs uppercase tracking-wider mb-1">Reason</p>
              <p>{app.rejectionReason}</p>
            </div>
          )}

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {[
              ["Name", app.fullName],
              ["Email", app.email],
              ["Phone", app.phone],
              ["Country of residence", app.country],
              ["Destination", app.destinationCountry || "—"],
              ["Submitted", new Date(app.createdAt).toLocaleDateString("en-IN")],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-bold text-muted">{k}</dt>
                <dd className="font-bold text-navy break-words">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="rounded-2xl border border-border-custom p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-muted">Fee</p>
              {app.baseAmount > 0 ? (
                <p className="font-sora font-black text-navy text-xl">
                  {app.currency} {Number(paid ? app.finalAmount : app.baseAmount).toLocaleString("en-IN")}
                  {paid && <span className="ml-2 text-xs font-black text-green-700">PAID</span>}
                </p>
              ) : (
                <p className="text-sm text-muted">We'll quote this after reviewing your request.</p>
              )}
            </div>
            {canPay && (
              <Link href={`/dashboard/applications/${app.id}/pay`} className="btn-primary px-5 py-2.5 text-sm">
                Pay now
              </Link>
            )}
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-muted mb-2">Your documents</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {docs.map((d) => (
                <div key={d.label} className="border border-border-custom rounded-2xl p-3 text-center space-y-2">
                  <p className="text-[10px] font-black text-muted uppercase tracking-wider">{d.label}</p>
                  {d.url ? (
                    <>
                      {isImage(d.url) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.url} alt={d.label} className="h-20 w-full object-cover rounded-xl" />
                      ) : (
                        <div className="h-20 rounded-xl bg-bg-custom flex items-center justify-center text-muted">
                          <FileText className="w-7 h-7" />
                        </div>
                      )}
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-blue text-[11px] font-black inline-flex items-center gap-1 hover:underline">
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  ) : (
                    <p className="text-[11px] text-muted py-6">Not uploaded</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
