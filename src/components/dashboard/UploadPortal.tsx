"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentUploader } from "@/components/application/DocumentUploader";
import { CheckCircle, AlertTriangle } from "lucide-react";

type Application = {
  id: string;
  productType: string;
  status: string;
  passportUrl: string | null; // Passport / ID
  licenseUrl: string | null; // Supporting document
  profilePhotoUrl: string | null; // Photograph
  adminNotes: string | null;
};

const SERVICE_LABEL: Record<string, string> = {
  VISA: "Visa assistance",
  ATTESTATION: "Document attestation",
};

/** Pull the latest re-upload / edit request our team left in the notes. */
function latestTeamRequest(adminNotes: string | null): string | null {
  if (!adminNotes) return null;
  const matches = adminNotes.match(/(RE-UPLOAD REQUESTED[^|]*|EDIT REQUESTED[^|]*)/g);
  return matches ? matches[matches.length - 1].trim() : null;
}

const SLOTS = [
  { key: "passportKey", field: "passportUrl", folder: "passports", fieldName: "passport", label: "Passport / ID", required: true, help: "Photo page of your passport, or another government ID." },
  { key: "licenseKey", field: "licenseUrl", folder: "licenses", fieldName: "supporting", label: "Supporting document", required: false, help: "Degree, certificate, invitation letter or anything else relevant to your request." },
  { key: "profileKey", field: "profilePhotoUrl", folder: "profiles", fieldName: "photo", label: "Photograph", required: false, help: "Passport-style photo, if your request needs one." },
] as const;

export function UploadPortal({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const [doneId, setDoneId] = useState<string | null>(null);
  const [uploads, setUploads] = useState<Record<string, Record<string, string>>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (applications.length === 0) {
    return (
      <div className="bg-white border border-border-custom rounded-2xl p-10 text-center">
        <p className="text-muted text-sm font-bold">No requests are waiting for documents.</p>
      </div>
    );
  }

  const handleSubmit = async (app: Application) => {
    const u = uploads[app.id] || {};
    setSubmitting(app.id);
    setError(null);
    try {
      const body: Record<string, string> = { status: "UNDER_REVIEW" };
      for (const s of SLOTS) if (u[s.key]) body[s.field] = u[s.key];
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("We couldn't submit your documents. Please try again.");
      setDoneId(app.id);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl px-4 py-3">{error}</div>}

      {applications.map((app) => {
        const u = uploads[app.id] || {};
        const teamRequest = latestTeamRequest(app.adminNotes);
        const hasPassport = !!(app.passportUrl || u.passportKey);
        const hasNew = SLOTS.some((s) => !!u[s.key]);

        if (doneId === app.id) {
          return (
            <div key={app.id} className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
              <div>
                <p className="font-bold text-green-800">Documents submitted.</p>
                <p className="text-sm text-green-700">Our team will review them and email you if we need anything else.</p>
              </div>
            </div>
          );
        }

        return (
          <div key={app.id} className="bg-white border border-border-custom rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between">
              <div>
                <p className="font-sora font-black text-navy">{SERVICE_LABEL[app.productType] || app.productType}</p>
                <p className="text-xs text-muted font-bold">#{app.id.slice(-8).toUpperCase()}</p>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  app.status === "UNDER_REVIEW" ? "bg-blue/10 text-blue" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {app.status === "UNDER_REVIEW" ? "Under review" : "Waiting for documents"}
              </span>
            </div>

            <div className="p-6 space-y-5">
              {teamRequest && (
                <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-amber-800 uppercase tracking-wider mb-1">Message from our team</p>
                    <p className="text-sm text-amber-800 font-bold">{teamRequest}</p>
                  </div>
                </div>
              )}

              {SLOTS.map((slot) => {
                const onFile = !!(app as any)[slot.field];
                const justUploaded = !!u[slot.key];
                return (
                  <div key={slot.key} className="border border-border-custom rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          slot.required ? "bg-amber-400 text-white" : "bg-bg-custom text-muted"
                        }`}
                      >
                        {slot.required ? "Required" : "Optional"}
                      </span>
                      <span className="text-xs font-black text-navy">{slot.label}</span>
                      {(onFile || justUploaded) && (
                        <span className="ml-auto text-[11px] font-black text-green-700 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> {justUploaded ? "New file ready" : "On file"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted font-bold">{slot.help}</p>
                    <DocumentUploader
                      label={onFile ? `Replace ${slot.label.toLowerCase()}` : slot.label}
                      fieldName={slot.fieldName}
                      applicationId={app.id}
                      folder={slot.folder}
                      onUploadComplete={(_, key) => setUploads((p) => ({ ...p, [app.id]: { ...p[app.id], [slot.key]: key } }))}
                    />
                  </div>
                );
              })}

              <button
                onClick={() => handleSubmit(app)}
                disabled={!hasPassport || (app.status === "UNDER_REVIEW" && !hasNew) || submitting === app.id}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting === app.id ? "Submitting…" : app.status === "UNDER_REVIEW" ? "Send updated documents →" : "Submit for review →"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
