"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Search, CreditCard, X, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

interface Payment {
  id: string;
  providerPaymentId: string | null;
  providerOrderId: string | null;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  application: {
    fullName: string;
    email: string;
  };
}

interface PaymentsClientProps {
  payments: Payment[];
}

export function PaymentsClient({ payments }: PaymentsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get active filters from URL search params
  const activeSearch = searchParams.get("search") || "";
  const activeProvider = searchParams.get("provider") || "";
  const activeStatus = searchParams.get("status") || "";

  // Local state for immediate typing feedback
  const [searchInput, setSearchInput] = useState(activeSearch);

  // Sync local search input with URL search param changes
  useEffect(() => {
    setSearchInput(activeSearch);
  }, [activeSearch]);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const hasActiveFilters = !!(activeSearch || activeProvider || activeStatus);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-black text-navy text-2xl flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue" />
            Payments
          </h1>
          <p className="text-muted text-xs">Track client transactions, refunds, and payouts.</p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-4 py-2 border border-border-custom bg-white hover:bg-bg-custom text-navy rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-border-custom rounded-3xl p-5 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md relative flex items-center gap-2">
          <div className="w-full relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by Payment ID, Order ID, Applicant Name or Email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border-custom rounded-xl text-xs outline-none focus:border-blue bg-bg-custom/50 focus:bg-white transition-all font-bold"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-navy hover:bg-blue text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm animate-fade-in"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 justify-end w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-navy/60 font-black text-[10px] uppercase mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters:
          </div>

          <select
            value={activeProvider}
            onChange={(e) => updateFilters({ provider: e.target.value })}
            className="border border-border-custom bg-white rounded-xl px-3 py-2.5 text-xs font-bold text-navy outline-none focus:border-blue cursor-pointer"
          >
            <option value="">All Providers</option>
            <option value="STRIPE">Stripe</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="PAYPAL">PayPal</option>
          </select>

          <select
            value={activeStatus}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="border border-border-custom bg-white rounded-xl px-3 py-2.5 text-xs font-bold text-navy outline-none focus:border-blue cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Info indicator */}
      <div className="flex items-center justify-between text-xs px-2">
        <span className="text-muted font-bold">
          Showing <span className="text-navy font-black">{payments.length}</span> transaction{payments.length === 1 ? "" : "s"}
        </span>
        {hasActiveFilters && (
          <span className="text-blue font-bold flex items-center gap-1">
            Active filters applied
          </span>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-border-custom rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-navy text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-sora font-black text-[10px] tracking-widest">Payment ID</th>
                <th className="px-6 py-4 font-sora font-black text-[10px] tracking-widest">Applicant</th>
                <th className="px-6 py-4 font-sora font-black text-[10px] tracking-widest">Provider</th>
                <th className="px-6 py-4 font-sora font-black text-[10px] tracking-widest">Amount</th>
                <th className="px-6 py-4 font-sora font-black text-[10px] tracking-widest">Status</th>
                <th className="px-6 py-4 font-sora font-black text-[10px] tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom text-xs">
              {payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-bg-custom/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-muted select-all">
                    {pay.providerPaymentId || pay.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-navy">{pay.application.fullName}</div>
                    <div className="text-[10px] text-muted">{pay.application.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-navy/80 uppercase">{pay.provider}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-navy">
                    {pay.currency} {pay.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      pay.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      pay.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {format(new Date(pay.createdAt), "MMM dd, yyyy")}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted font-bold animate-fade-in">
                    No payment logs recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
