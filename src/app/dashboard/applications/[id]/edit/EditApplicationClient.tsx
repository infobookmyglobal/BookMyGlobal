"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const inputCls =
  "w-full border border-border-custom rounded-xl px-4 py-2.5 outline-none focus:border-blue font-bold text-navy bg-white text-sm";

export function EditApplicationClient({ application }: { application: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fields, setFields] = useState({
    fullName: application.fullName || "",
    phone: application.phone || "",
    country: application.country || "",
    destinationCountry: application.destinationCountry || "",
    address: application.address || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, status: "UNDER_REVIEW" }),
      });
      if (!res.ok) throw new Error("We couldn't save your changes. Please check the details and try again.");
      router.push("/dashboard/applications");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl px-4 py-3">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="text-muted block text-xs font-bold mb-1.5">Full name (as on your passport)</label>
          <input name="fullName" required minLength={2} value={fields.fullName} onChange={handleChange} className={inputCls} />
        </div>
        <div>
          <label className="text-muted block text-xs font-bold mb-1.5">Phone</label>
          <input name="phone" required minLength={7} value={fields.phone} onChange={handleChange} className={inputCls} />
        </div>
        <div>
          <label className="text-muted block text-xs font-bold mb-1.5">Country of residence</label>
          <input name="country" required minLength={2} value={fields.country} onChange={handleChange} className={inputCls} />
        </div>
        <div>
          <label className="text-muted block text-xs font-bold mb-1.5">Destination country</label>
          <input name="destinationCountry" value={fields.destinationCountry} onChange={handleChange} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="text-muted block text-xs font-bold mb-1.5">Address (used for returning documents)</label>
        <textarea name="address" rows={3} value={fields.address} onChange={handleChange} className={`${inputCls} resize-none`} />
      </div>

      <p className="text-xs text-muted font-bold">
        Saving sends this request back to our team for review. To change your email address, message us.
      </p>

      <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-60">
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Save changes
      </button>
    </form>
  );
}
