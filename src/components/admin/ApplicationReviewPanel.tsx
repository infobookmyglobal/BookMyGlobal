"use client";

import { useEffect, useState } from "react";
import { X, Check, AlertCircle, Mail, FileText, Truck, Loader2, Trash, ExternalLink, Upload } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currency";

interface ApplicationReviewPanelProps {
  application: any;
  onClose: () => void;
  onRefresh: () => void;
}

const SERVICE_LABEL: Record<string, string> = {
  VISA: "Visa assistance",
  ATTESTATION: "Document attestation",
  OTHER: "Other",
};

const STEPS = ["PENDING", "UNDER_REVIEW", "APPROVED", "COMPLETED"] as const;

const inputCls =
  "w-full border border-border-custom rounded-xl px-3 py-2 outline-none focus:border-blue font-black text-navy bg-white";
const labelCls = "text-muted block font-bold mb-1";

function formatToIST(dateInput: Date | string) {
  return new Date(dateInput).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " (IST)";
}

function isImage(url: string | null) {
  return !!url && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url);
}

type DocField = "passportUrl" | "licenseUrl" | "profilePhotoUrl";

const DOCS: { field: DocField; label: string; folder: string }[] = [
  { field: "passportUrl", label: "Passport / ID", folder: "passports" },
  { field: "licenseUrl", label: "Supporting document", folder: "licenses" },
  { field: "profilePhotoUrl", label: "Photograph", folder: "profiles" },
];

export function ApplicationReviewPanel({ application: initialApp, onClose, onRefresh }: ApplicationReviewPanelProps) {
  const [app, setApp] = useState(initialApp);
  const [notes, setNotes] = useState<string>(initialApp.adminNotes || "");
  const [busy, setBusy] = useState<string | null>(null);

  // Edit details
  const [isEditing, setIsEditing] = useState(false);
  const [edit, setEdit] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    destinationCountry: "",
    address: "",
    shippingAddress: "",
  });
  const [docKeys, setDocKeys] = useState<Partial<Record<DocField, string>>>({});

  // Fee quote
  const [quoteAmount, setQuoteAmount] = useState<string>(initialApp.baseAmount ? String(initialApp.baseAmount) : "");
  const [quoteCurrency, setQuoteCurrency] = useState<string>(initialApp.currency || "INR");

  // Reject / re-upload / edit request
  const [mode, setMode] = useState<null | "reject" | "reupload" | "edit" | "ship">(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reupload, setReupload] = useState({ passport: false, license: false, profile: false, notes: "" });
  const [editRequestNotes, setEditRequestNotes] = useState("");
  const [ship, setShip] = useState({ address: "", name: "", phone: "" });

  useEffect(() => {
    setApp(initialApp);
    setNotes(initialApp.adminNotes || "");
    setQuoteAmount(initialApp.baseAmount ? String(initialApp.baseAmount) : "");
    setQuoteCurrency(initialApp.currency || "INR");
    const m = (initialApp.adminNotes || "").match(/SHIPPING ADDRESS:\s*([^\n|]+)/i);
    const shipAddr = (m && m[1] ? m[1].trim() : "") || initialApp.address || "";
    setEdit({
      fullName: initialApp.fullName || "",
      email: initialApp.email || "",
      phone: initialApp.phone || "",
      country: initialApp.country || "",
      destinationCountry: initialApp.destinationCountry || "",
      address: initialApp.address || "",
      shippingAddress: shipAddr,
    });
    setShip({ address: shipAddr, name: initialApp.fullName || "", phone: initialApp.phone || "" });
  }, [initialApp]);

  async function call(label: string, fn: () => Promise<Response>, ok: string, after?: () => void) {
    setBusy(label);
    try {
      const res = await fn();
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }
      alert(ok);
      after?.();
    } catch (e: any) {
      alert(e.message || "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  const post = (path: string, body?: unknown) =>
    fetch(`/api/admin/applications/${app.id}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

  const uploadDoc = async (field: DocField, folder: string, file: File) => {
    setBusy(`upload-${field}`);
    try {
      const ext = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const key = `uploads/${folder}/${app.id}/${Date.now()}.${ext}`;
      const presign = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, mimeType: file.type, applicationId: app.id }),
      });
      if (!presign.ok) throw new Error("Could not get an upload URL");
      const { uploadUrl } = await presign.json();
      const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!put.ok) throw new Error("Upload failed");
      setDocKeys((p) => ({ ...p, [field]: key }));
      alert("Uploaded. Click “Save changes” to attach it.");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(null);
    }
  };

  const saveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    call(
      "save",
      () =>
        fetch(`/api/admin/applications/${app.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...edit, ...docKeys }),
        }),
      "Details updated.",
      () => {
        setIsEditing(false);
        setDocKeys({});
        onRefresh();
      }
    );
  };

  const saveQuote = () => {
    const amount = Number(quoteAmount);
    if (!Number.isFinite(amount) || amount < 0) return alert("Enter a valid amount");
    call(
      "quote",
      () =>
        fetch(`/api/admin/applications/${app.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ baseAmount: amount, currency: quoteCurrency }),
        }),
      amount > 0 ? "Fee saved. The customer can now pay from their dashboard." : "Fee cleared.",
      onRefresh
    );
  };

  const paid = app.payment?.status === "COMPLETED";
  const docUrl = (f: DocField): string | null => (app[f] as string) || null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-bg-custom h-full flex flex-col shadow-2xl relative animate-slide-in">
        {/* Header */}
        <div className="bg-navy text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-sora font-black text-lg">Review request</h2>
            <span className="text-[10px] text-white/60 font-bold font-mono">
              #{app.id.slice(-8).toUpperCase()} · {SERVICE_LABEL[app.productType] || app.productType} · {formatToIST(app.createdAt)}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {app.isDuplicate && (
            <div className="bg-amber-50 border border-amber-200 text-amber-950 px-5 py-3 rounded-2xl text-xs font-bold space-y-1">
              <div className="flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4" />
                <span>Duplicate payment ID</span>
              </div>
              <p className="font-normal text-slate-600">
                Another record shares payment ID <strong>{app.payment?.providerPaymentId}</strong>. Check before proceeding.
              </p>
            </div>
          )}

          {/* Pipeline */}
          <div className="bg-white border border-border-custom rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-navy uppercase tracking-wider">Status</h3>
              {app.status === "REJECTED" && (
                <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Rejected</span>
              )}
            </div>
            <div className="flex items-center justify-between text-center max-w-2xl mx-auto">
              {STEPS.map((step, idx) => {
                const order = STEPS.indexOf(app.status as (typeof STEPS)[number]);
                const isCurrent = app.status === step;
                const isPast = order > idx;
                return (
                  <div key={step} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center mx-auto">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isCurrent ? "bg-blue text-white ring-4 ring-blue/20" : isPast ? "bg-green-500 text-white" : "bg-bg-custom text-muted border border-border-custom"
                        }`}
                      >
                        {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className="text-[9px] font-black text-navy mt-1.5 uppercase tracking-wide hidden sm:block">
                        {step.replace(/_/g, " ")}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${isPast ? "bg-green-400" : "bg-border-custom"}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="md:col-span-2 space-y-6">
              {/* Details */}
              <div className="bg-white border border-border-custom rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border-custom pb-2">
                  <h3 className="font-sora font-black text-navy text-sm">Customer &amp; request</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue hover:text-navy text-xs font-black bg-blue/5 hover:bg-blue/10 px-3 py-1 rounded-lg transition-all"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={saveDetails} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(
                        [
                          ["fullName", "Full name", "text"],
                          ["email", "Email", "email"],
                          ["phone", "Phone", "text"],
                          ["country", "Country of residence", "text"],
                          ["destinationCountry", "Destination", "text"],
                        ] as const
                      ).map(([k, label, type]) => (
                        <div key={k}>
                          <label className={labelCls}>{label}</label>
                          <input
                            type={type}
                            value={(edit as any)[k]}
                            onChange={(e) => setEdit((p) => ({ ...p, [k]: e.target.value }))}
                            className={inputCls}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Address</label>
                        <textarea rows={2} value={edit.address} onChange={(e) => setEdit((p) => ({ ...p, address: e.target.value }))} className={`${inputCls} resize-none`} />
                      </div>
                      <div>
                        <label className={labelCls}>Return / shipping address</label>
                        <textarea rows={2} value={edit.shippingAddress} onChange={(e) => setEdit((p) => ({ ...p, shippingAddress: e.target.value }))} className={`${inputCls} resize-none`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {DOCS.map((d) => (
                        <label key={d.field} className="border border-dashed border-border-custom rounded-xl p-3 text-center cursor-pointer hover:border-blue transition-all">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && uploadDoc(d.field, d.folder, e.target.files[0])}
                          />
                          {busy === `upload-${d.field}` ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto text-blue" />
                          ) : (
                            <Upload className="w-4 h-4 mx-auto text-muted" />
                          )}
                          <span className="block text-[10px] font-black text-navy mt-1">
                            {docKeys[d.field] ? "✓ " : "Replace "}
                            {d.label}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl border border-border-custom font-black text-navy">
                        Cancel
                      </button>
                      <button type="submit" disabled={busy === "save"} className="btn-primary px-5 py-2 font-black flex items-center gap-1.5">
                        {busy === "save" && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                    {[
                      ["Name", app.fullName],
                      ["Email", app.email],
                      ["Phone", app.phone],
                      ["Country of residence", app.country],
                      ["Destination", app.destinationCountry || "—"],
                      ["Service", SERVICE_LABEL[app.productType] || app.productType],
                      ["Address", app.address || "—"],
                    ].map(([k, v]) => (
                      <div key={k as string}>
                        <dt className="text-muted font-bold">{k}</dt>
                        <dd className="font-black text-navy break-words">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              {/* Documents */}
              <div className="bg-white border border-border-custom rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-sora font-black text-navy text-sm border-b border-border-custom pb-2">Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DOCS.map((d) => {
                    const url = docUrl(d.field);
                    return (
                      <div key={d.field} className="border border-border-custom rounded-2xl p-3 text-center space-y-2">
                        <p className="text-[10px] font-black text-muted uppercase tracking-wider">{d.label}</p>
                        {url ? (
                          <>
                            {isImage(url) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={url} alt={d.label} className="h-24 w-full object-cover rounded-xl" />
                            ) : (
                              <div className="h-24 rounded-xl bg-bg-custom flex items-center justify-center text-muted">
                                <FileText className="w-8 h-8" />
                              </div>
                            )}
                            <a href={url} target="_blank" rel="noreferrer" className="text-blue text-[11px] font-black inline-flex items-center gap-1 hover:underline">
                              Open <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        ) : (
                          <p className="text-[11px] text-muted py-8">Not uploaded</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white border border-border-custom rounded-3xl p-6 shadow-sm space-y-3">
                <h3 className="font-sora font-black text-navy text-sm border-b border-border-custom pb-2">Internal notes</h3>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`${inputCls} text-xs font-bold resize-y`}
                  placeholder="Only visible to admins"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() =>
                      call("notes", () => post("notes", { notes }), "Notes saved.", onRefresh)
                    }
                    disabled={busy === "notes"}
                    className="btn-primary px-4 py-2 text-xs font-black flex items-center gap-1.5"
                  >
                    {busy === "notes" && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save notes
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {/* Fee */}
              <div className="bg-white border border-border-custom rounded-3xl p-5 shadow-sm space-y-3 text-xs">
                <h3 className="font-sora font-black text-navy text-sm">Fee</h3>
                {paid ? (
                  <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-green-800 font-bold">
                    Paid {getCurrencySymbol(app.payment.currency)}
                    {Number(app.payment.amount).toLocaleString("en-IN")} via {app.payment.provider}
                    <div className="text-[10px] font-mono font-normal mt-1 break-all">{app.payment.providerPaymentId}</div>
                  </div>
                ) : (
                  <>
                    <p className="text-muted font-normal">
                      Quote the fee after reviewing. The customer then sees a Pay button in their dashboard.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={quoteAmount}
                        onChange={(e) => setQuoteAmount(e.target.value)}
                        placeholder="Amount"
                        className={inputCls}
                      />
                      <select value={quoteCurrency} onChange={(e) => setQuoteCurrency(e.target.value)} className={`${inputCls} w-24`}>
                        {["INR", "USD", "EUR", "GBP", "AED"].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={saveQuote} disabled={busy === "quote"} className="btn-primary w-full py-2 font-black flex items-center justify-center gap-1.5">
                      {busy === "quote" && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save fee
                    </button>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="bg-white border border-border-custom rounded-3xl p-5 shadow-sm space-y-2.5 text-xs">
                <h3 className="font-sora font-black text-navy text-sm mb-1">Actions</h3>

                <button
                  onClick={() =>
                    confirm("Approve this request and email the customer?") &&
                    call("approve", () => post("approve"), "Approved and customer notified.", () => {
                      onRefresh();
                      onClose();
                    })
                  }
                  disabled={!!busy || app.status === "APPROVED" || app.status === "COMPLETED"}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded-xl py-2.5 font-black flex items-center justify-center gap-1.5"
                >
                  {busy === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
                </button>

                <button onClick={() => setMode(mode === "reupload" ? null : "reupload")} className="w-full border border-border-custom hover:bg-bg-custom rounded-xl py-2.5 font-black text-navy">
                  Request re-upload
                </button>
                {mode === "reupload" && (
                  <div className="border border-border-custom rounded-xl p-3 space-y-2 bg-bg-custom">
                    {(
                      [
                        ["passport", "Passport / ID"],
                        ["license", "Supporting document"],
                        ["profile", "Photograph"],
                      ] as const
                    ).map(([k, label]) => (
                      <label key={k} className="flex items-center gap-2 font-bold text-navy">
                        <input type="checkbox" checked={(reupload as any)[k]} onChange={(e) => setReupload((p) => ({ ...p, [k]: e.target.checked }))} className="accent-blue" />
                        {label}
                      </label>
                    ))}
                    <textarea rows={2} value={reupload.notes} onChange={(e) => setReupload((p) => ({ ...p, notes: e.target.value }))} placeholder="Note to the customer (optional)" className={`${inputCls} text-xs font-bold`} />
                    <button
                      onClick={() =>
                        call("reupload", () => post("request-reupload", reupload), "Request sent.", () => {
                          setMode(null);
                          onRefresh();
                          onClose();
                        })
                      }
                      disabled={busy === "reupload"}
                      className="btn-primary w-full py-2 font-black"
                    >
                      Send request
                    </button>
                  </div>
                )}

                <button onClick={() => setMode(mode === "edit" ? null : "edit")} className="w-full border border-border-custom hover:bg-bg-custom rounded-xl py-2.5 font-black text-navy">
                  Ask customer to edit details
                </button>
                {mode === "edit" && (
                  <div className="border border-border-custom rounded-xl p-3 space-y-2 bg-bg-custom">
                    <textarea rows={3} value={editRequestNotes} onChange={(e) => setEditRequestNotes(e.target.value)} placeholder="What needs correcting?" className={`${inputCls} text-xs font-bold`} />
                    <button
                      onClick={() =>
                        call("editreq", () => post("request-edit", { notes: editRequestNotes }), "Request sent.", () => {
                          setMode(null);
                          setEditRequestNotes("");
                          onRefresh();
                          onClose();
                        })
                      }
                      disabled={busy === "editreq"}
                      className="btn-primary w-full py-2 font-black"
                    >
                      Send request
                    </button>
                  </div>
                )}

                <button onClick={() => setMode(mode === "reject" ? null : "reject")} className="w-full border border-red-200 text-red-700 hover:bg-red-50 rounded-xl py-2.5 font-black">
                  Reject
                </button>
                {mode === "reject" && (
                  <div className="border border-red-200 rounded-xl p-3 space-y-2 bg-red-50">
                    <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason (sent to the customer)" className={`${inputCls} text-xs font-bold`} />
                    <button
                      onClick={() =>
                        call("reject", () => post("reject", { reason: rejectReason }), "Rejected and customer notified.", () => {
                          setMode(null);
                          onRefresh();
                          onClose();
                        })
                      }
                      disabled={busy === "reject" || !rejectReason.trim()}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl py-2 font-black"
                    >
                      Confirm rejection
                    </button>
                  </div>
                )}
              </div>

              {/* Courier */}
              <div className="bg-white border border-border-custom rounded-3xl p-5 shadow-sm space-y-2.5 text-xs">
                <h3 className="font-sora font-black text-navy text-sm flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue" /> Return courier
                </h3>
                {app.shipment ? (
                  <div className="rounded-xl bg-bg-custom p-3 space-y-1 font-bold text-navy">
                    <div>AWB: {app.shipment.awbNumber || "—"}</div>
                    <div className="capitalize text-muted font-normal">{app.shipment.status}</div>
                    {app.shipment.trackingUrl && (
                      <a href={app.shipment.trackingUrl} target="_blank" rel="noreferrer" className="text-blue inline-flex items-center gap-1 hover:underline">
                        Track <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <>
                    <button onClick={() => setMode(mode === "ship" ? null : "ship")} className="w-full border border-border-custom hover:bg-bg-custom rounded-xl py-2.5 font-black text-navy">
                      Create shipment
                    </button>
                    {mode === "ship" && (
                      <div className="border border-border-custom rounded-xl p-3 space-y-2 bg-bg-custom">
                        <input value={ship.name} onChange={(e) => setShip((p) => ({ ...p, name: e.target.value }))} placeholder="Recipient name" className={inputCls} />
                        <input value={ship.phone} onChange={(e) => setShip((p) => ({ ...p, phone: e.target.value }))} placeholder="Recipient phone" className={inputCls} />
                        <textarea rows={2} value={ship.address} onChange={(e) => setShip((p) => ({ ...p, address: e.target.value }))} placeholder="Delivery address" className={`${inputCls} text-xs font-bold`} />
                        <button
                          onClick={() =>
                            call(
                              "ship",
                              () =>
                                fetch("/api/shipments/create", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ applicationId: app.id, address: ship.address, recipientName: ship.name, recipientPhone: ship.phone }),
                                }),
                              "Shipment created and customer notified.",
                              () => {
                                setMode(null);
                                onRefresh();
                                onClose();
                              }
                            )
                          }
                          disabled={busy === "ship"}
                          className="btn-primary w-full py-2 font-black"
                        >
                          Book courier
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Emails */}
              <div className="bg-white border border-border-custom rounded-3xl p-5 shadow-sm space-y-2 text-xs">
                <h3 className="font-sora font-black text-navy text-sm flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue" /> Resend email
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["confirmation", "Received"],
                    ["approved", "Approved"],
                    ["rejected", "Rejected"],
                    ["shipping", "Shipped"],
                  ].map(([type, label]) => (
                    <button
                      key={type}
                      disabled={!!busy}
                      onClick={() => call(`mail-${type}`, () => post("resend-email", { emailType: type }), `${label} email sent.`)}
                      className="border border-border-custom hover:bg-bg-custom rounded-xl py-2 font-black text-navy disabled:opacity-50"
                    >
                      {busy === `mail-${type}` ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  confirm("This permanently deletes the request with its payment and shipment records. It cannot be undone. Continue?") &&
                  call(
                    "delete",
                    () => fetch(`/api/admin/applications/${app.id}`, { method: "DELETE" }),
                    "Deleted.",
                    () => {
                      onRefresh();
                      onClose();
                    }
                  )
                }
                disabled={busy === "delete"}
                className="w-full text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-xl py-2.5 text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Trash className="w-3.5 h-3.5" /> Delete request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
