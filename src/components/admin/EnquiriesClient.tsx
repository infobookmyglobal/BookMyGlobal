"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Inbox, Trash2, Mail, Phone } from "lucide-react";

interface Enquiry {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  meta: string | null;
  status: string;
  createdAt: string | Date;
}

const STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;
const BADGE: Record<string, string> = {
  NEW: "bg-blue/10 text-blue",
  CONTACTED: "bg-amber-100 text-amber-700",
  CLOSED: "bg-slate-100 text-slate-500",
};

export function EnquiriesClient({ enquiries }: { enquiries: Enquiry[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = filter === "ALL" ? enquiries : enquiries.filter((e) => e.status === filter);

  async function call(method: "PUT" | "DELETE", body: object, id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/enquiries", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Request failed");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-black text-navy text-2xl">Enquiries</h1>
          <p className="text-muted text-xs">Leads from the website forms — flights, hotels, visas, attestation, retreats and more.</p>
        </div>
        <div className="flex gap-2">
          {["ALL", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-colors ${
                filter === s ? "bg-navy text-white border-navy" : "bg-white text-navy border-border-custom hover:border-blue"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-border-custom rounded-3xl overflow-hidden shadow-sm">
        {visible.length === 0 ? (
          <div className="p-16 text-center text-muted text-sm">
            <Inbox className="w-8 h-8 mx-auto mb-3 text-border-custom" />
            No enquiries here yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-navy text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Received</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom text-xs">
                {visible.map((e) => (
                  <tr key={e.id} className="align-top hover:bg-bg-custom/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-muted">{format(new Date(e.createdAt), "dd MMM yyyy, HH:mm")}</td>
                    <td className="px-6 py-4"><span className="font-black text-navy">{e.type}</span></td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="font-bold text-navy">{e.name}</div>
                      <a href={`mailto:${e.email}`} className="flex items-center gap-1 text-blue hover:underline"><Mail className="w-3 h-3" />{e.email}</a>
                      {e.phone && <a href={`tel:${e.phone}`} className="flex items-center gap-1 text-muted"><Phone className="w-3 h-3" />{e.phone}</a>}
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="whitespace-pre-wrap text-navy/80 leading-relaxed">{e.message}</p>
                      {e.meta && <pre className="mt-2 text-[10px] text-muted bg-bg-custom rounded-lg p-2 overflow-x-auto">{e.meta}</pre>}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={e.status}
                        disabled={busyId === e.id}
                        onChange={(ev) => call("PUT", { id: e.id, status: ev.target.value }, e.id)}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-black border-0 cursor-pointer ${BADGE[e.status] ?? BADGE.NEW}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        disabled={busyId === e.id}
                        onClick={() => confirm("Delete this enquiry permanently?") && call("DELETE", { id: e.id }, e.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Delete enquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
