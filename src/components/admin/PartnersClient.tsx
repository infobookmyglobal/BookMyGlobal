"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Edit, Save, Handshake, Users, DollarSign, Award, X, Check, Loader2 } from "lucide-react";

interface PartnersClientProps {
  partners: any[];
}

export function PartnersClient({ partners }: PartnersClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editingPartner, setEditingPartner] = useState<any | null>(null);

  // Modal Inputs
  const [referralCode, setReferralCode] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const filtered = partners.filter((p) =>
    (p.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
    p.referralCode.toLowerCase().includes(search.toLowerCase())
  );

  const totalReferrals = partners.reduce((acc, curr) => acc + (curr.totalReferrals || 0), 0);
  const totalEarned = partners.reduce((acc, curr) => acc + (curr.totalCommissionEarned || 0), 0);

  const handleEditClick = (partner: any) => {
    setEditingPartner(partner);
    setReferralCode(partner.referralCode);
    setCommissionRate(partner.commissionRate.toString());
    setIsActive(partner.isActive);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCode.trim() || isNaN(parseFloat(commissionRate))) {
      alert("Invalid code or commission rate!");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPartner.id,
          referralCode,
          commissionRate: parseFloat(commissionRate),
          isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Save failed");
      }

      alert("Partner updated successfully!");
      setEditingPartner(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl text-xs font-bold text-navy">
      <div>
        <h1 className="font-sora font-black text-navy text-2xl font-black">Partners & Affiliates</h1>
        <p className="text-muted text-[10px]">Track referrers, custom discount triggers, and update base payout rates.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-border-custom p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-blue/10 rounded-xl flex items-center justify-center text-blue shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wider font-black">Total Affiliates</div>
            <div className="text-xl font-sora font-black text-navy">{partners.length} Partners</div>
          </div>
        </div>

        <div className="bg-white border border-border-custom p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-700 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wider font-black">Total Referrals</div>
            <div className="text-xl font-sora font-black text-navy">{totalReferrals} Orders</div>
          </div>
        </div>

        <div className="bg-white border border-border-custom p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-700 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wider font-black">Total Paid Commissions</div>
            <div className="text-xl font-sora font-black text-navy">${totalEarned.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-border-custom rounded-3xl p-4 shadow-sm flex items-center justify-between">
        <div className="w-full relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-custom rounded-xl outline-none focus:border-blue bg-bg-custom/50 focus:bg-white transition-all font-bold"
          />
        </div>
      </div>

      {/* Partners List Grid / Table */}
      <div className="bg-white border border-border-custom rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-navy text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Affiliate Partner</th>
                <th className="px-6 py-4">Referral Code</th>
                <th className="px-6 py-4">Commission %</th>
                <th className="px-6 py-4">Total Conversions</th>
                <th className="px-6 py-4">Total Paid Out</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom text-xs">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-bg-custom/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-black text-navy">{p.user?.name || "Unnamed Affiliate"}</div>
                    <div className="text-[10px] text-muted">{p.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-black text-blue">
                    {p.referralCode}
                  </td>
                  <td className="px-6 py-4 font-bold text-navy">
                    {p.commissionRate}%
                  </td>
                  <td className="px-6 py-4 text-navy font-bold">
                    {p.totalReferrals} conversions
                  </td>
                  <td className="px-6 py-4 text-green-700 font-black">
                    ${(p.totalCommissionEarned || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {p.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditClick(p)}
                      className="p-2 border border-border-custom rounded-xl hover:bg-bg-custom text-navy transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted font-bold">
                    No matching active partners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Partner Modal Overlay */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border-custom pb-3">
              <h3 className="font-sora font-black text-navy text-sm flex items-center gap-2">
                <Handshake className="w-4 h-4 text-blue" /> Edit Affiliate Parameters
              </h3>
              <button onClick={() => setEditingPartner(null)} className="text-muted hover:text-navy">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4 text-xs font-bold text-navy">
              <div>
                <label className="block text-muted mb-1">Referrer Name</label>
                <input
                  type="text"
                  disabled
                  value={editingPartner.user?.name || "Unnamed Affiliate"}
                  className="w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 outline-none opacity-60 font-bold"
                />
              </div>

              <div>
                <label className="block text-muted mb-1">Unique Referral Code</label>
                <input
                  type="text"
                  required
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. REF-DIA100"
                  className="w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 outline-none focus:border-blue font-mono font-black text-blue"
                />
              </div>

              <div>
                <label className="block text-muted mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  placeholder="e.g. 15.0"
                  className="w-full border border-border-custom bg-bg-custom rounded-xl px-3 py-2.5 outline-none focus:border-blue font-bold text-navy"
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-border-custom text-blue focus:ring-blue h-4 w-4"
                />
                <label htmlFor="isActive" className="text-navy cursor-pointer select-none">
                  Partner Active & Authorized
                </label>
              </div>

              <div className="flex gap-2 justify-end border-t border-border-custom pt-3">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="bg-bg-custom text-navy border border-border-custom font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-border-custom"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue hover:bg-navy text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue/10 flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
