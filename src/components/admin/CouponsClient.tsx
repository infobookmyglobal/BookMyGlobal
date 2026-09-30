"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Tag, Plus, ToggleLeft, ToggleRight, Trash2, Percent, DollarSign, X } from "lucide-react";

interface CouponsClientProps {
  coupons: any[];
  partners: any[];
}

export function CouponsClient({ coupons, partners }: CouponsClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENT");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountType,
          discountValue,
          maxUses: maxUses ? parseInt(maxUses) : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          partnerId: partnerId || null,
          commissionRate: commissionRate ? parseFloat(commissionRate) : 0,
        }),
      });

      if (!response.ok) throw new Error("Failed to create coupon");
      
      alert("Coupon created successfully!");
      setIsOpen(false);
      setCode("");
      setDiscountValue("");
      setMaxUses("");
      setExpiresAt("");
      setPartnerId("");
      setCommissionRate("");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (!response.ok) throw new Error("Toggle failed");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) return;
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-black text-navy text-2xl">Coupons</h1>
          <p className="text-muted text-xs">Configure discount codes, commissions rates, and referral partners.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary py-2.5 px-6 font-black text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Coupons grid/list */}
      <div className="bg-white border border-border-custom rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-navy text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Referral Partner</th>
                <th className="px-6 py-4">Uses</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Expires</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom text-xs">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-bg-custom/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-black text-blue text-sm">
                    {coupon.code}
                  </td>
                  <td className="px-6 py-4 font-bold text-navy">
                    {coupon.discountType === "PERCENT" ? (
                      <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5 text-gold" /> {coupon.discountValue}% Off</span>
                    ) : (
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-green-600" /> ${coupon.discountValue} Off</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {coupon.partner ? (
                      <div>
                        <div className="font-bold text-navy">{coupon.partner.user.name || "Unnamed"}</div>
                        <div className="text-[10px] text-purple-700 font-bold">{coupon.commissionRate}% Commission</div>
                      </div>
                    ) : (
                      <span className="text-muted font-bold">Standard Public</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-navy">
                    {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : "uses"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(coupon.id, coupon.isActive)}
                      className={`flex items-center gap-1 font-bold ${coupon.isActive ? "text-green-600" : "text-muted"}`}
                    >
                      {coupon.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {coupon.expiresAt ? format(new Date(coupon.expiresAt), "MMM dd, yyyy") : "Never"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border-custom pb-3">
              <h3 className="font-sora font-black text-navy text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue" /> Create Coupon Code
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-navy">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted font-bold mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="WINTER20"
                    className="w-full border border-border-custom rounded-xl px-3 py-2.5 font-mono font-black text-sm uppercase outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-muted font-bold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full border border-border-custom bg-white rounded-xl px-3 py-2.5 font-bold text-navy outline-none focus:border-blue"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted font-bold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="20"
                    className="w-full border border-border-custom rounded-xl px-3 py-2.5 font-bold outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-muted font-bold mb-1">Max Total Uses (Optional)</label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="100"
                    className="w-full border border-border-custom rounded-xl px-3 py-2.5 font-bold outline-none focus:border-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted font-bold mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full border border-border-custom rounded-xl px-3 py-2.5 font-bold outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-muted font-bold mb-1">Referral Partner (Optional)</label>
                  <select
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    className="w-full border border-border-custom bg-white rounded-xl px-3 py-2.5 font-bold text-navy outline-none focus:border-blue"
                  >
                    <option value="">None (Public Coupon)</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.user.name || "Unnamed"} ({p.referralCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {partnerId && (
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <label className="block text-purple-900 font-bold mb-1">Partner Commission Rate (%)</label>
                  <input
                    type="number"
                    required
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder="10"
                    className="w-full border border-purple-200 bg-white rounded-xl px-3 py-2.5 font-bold outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end border-t border-border-custom pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-bg-custom text-navy border border-border-custom font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-border-custom"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue hover:bg-navy text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue/10 flex items-center gap-1.5"
                >
                  {isSubmitting && <Plus className="w-4 h-4 animate-spin" />}
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
