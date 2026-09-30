"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadScript } from "@paypal/paypal-js";
import { CheckCircle, Loader2, ShieldCheck, Tag } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currency";

type Provider = "razorpay" | "stripe" | "paypal";

interface Props {
  applicationId: string;
  serviceLabel: string;
  currency: string;
  baseAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  razorpayEnabled: boolean;
  stripePublishableKey: string | null;
  paypalClientId: string | null;
}

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: any) => void) => void };
  }
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

function money(currency: string, n: number) {
  return `${getCurrencySymbol(currency)}${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function PayPanel(props: Props) {
  const { applicationId, currency, baseAmount } = props;

  const providers: Provider[] = [];
  if (props.razorpayEnabled && currency === "INR") providers.push("razorpay");
  if (props.stripePublishableKey) providers.push("stripe");
  if (props.paypalClientId && currency !== "INR") providers.push("paypal");

  const [provider, setProvider] = useState<Provider | null>(providers[0] ?? null);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const total = Math.max(0, baseAmount - (applied?.discount ?? 0));
  const couponCode = applied?.code;

  async function applyCoupon() {
    setCouponMsg(null);
    if (!coupon.trim()) return;
    const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(coupon.trim())}`);
    const data = await res.json();
    if (!data.valid) {
      setApplied(null);
      setCouponMsg(data.error || "Invalid coupon");
      return;
    }
    const raw = data.discountType === "PERCENT" ? (baseAmount * data.discountValue) / 100 : data.discountValue;
    const discount = Math.min(baseAmount, Math.round(raw * 100) / 100);
    setApplied({ code: coupon.trim().toUpperCase(), discount });
    setCouponMsg(`Coupon applied: −${money(currency, discount)}`);
  }

  // ── Razorpay ──────────────────────────────────────────────────────────────
  async function payWithRazorpay() {
    setBusy(true);
    setError(null);
    try {
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Could not load Razorpay. Check your connection and try again."));
          document.body.appendChild(s);
        });
      }
      const order = await postJson("/api/payments/razorpay/create", { applicationId, couponCode });
      const rzp = new window.Razorpay!({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "BookMyGlobal",
        description: props.serviceLabel,
        prefill: { name: props.customerName, email: props.customerEmail, contact: props.customerPhone },
        theme: { color: "#141b2f" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (resp: Record<string, string>) => {
          try {
            await postJson("/api/payments/razorpay/verify", { applicationId, couponCode, ...resp });
            setDone(true);
          } catch (e: any) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        },
      });
      rzp.on("payment.failed", (r: any) => {
        setError(r?.error?.description || "The payment failed. You have not been charged.");
        setBusy(false);
      });
      rzp.open();
    } catch (e: any) {
      setError(e.message);
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center space-y-3">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
        <h2 className="font-sora font-black text-navy text-xl">Payment received. Thank you!</h2>
        <p className="text-sm text-green-800">A receipt is on its way to your inbox. We'll keep you posted here and by email.</p>
        <Link href="/dashboard/applications" className="btn-primary inline-block px-6 py-2.5 text-sm">
          Back to my requests
        </Link>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-900 font-bold">
        Online payment isn't switched on for this currency yet. Please message us and we'll share a secure payment link.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="bg-white border border-border-custom rounded-2xl p-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted font-bold">{props.serviceLabel}</span>
          <span className="font-bold text-navy">{money(currency, baseAmount)}</span>
        </div>
        {applied && (
          <div className="flex justify-between text-sm text-green-700 font-bold">
            <span>Coupon {applied.code}</span>
            <span>−{money(currency, applied.discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-border-custom pt-3">
          <span className="font-sora font-black text-navy">Total</span>
          <span className="font-sora font-black text-navy text-xl">{money(currency, total)}</span>
        </div>

        <div className="pt-2">
          <label className="text-xs font-bold text-muted flex items-center gap-1 mb-1.5">
            <Tag className="w-3.5 h-3.5" /> Have a coupon?
          </label>
          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 border border-border-custom rounded-xl px-3 py-2 text-sm font-bold uppercase outline-none focus:border-blue"
            />
            <button onClick={applyCoupon} type="button" className="px-4 rounded-xl border border-border-custom font-black text-navy text-sm hover:bg-bg-custom">
              Apply
            </button>
          </div>
          {couponMsg && <p className={`text-xs font-bold mt-1.5 ${applied ? "text-green-700" : "text-red-600"}`}>{couponMsg}</p>}
        </div>
      </div>

      {/* Method */}
      <div className="bg-white border border-border-custom rounded-2xl p-6 space-y-4">
        {providers.length > 1 && (
          <div className="flex gap-2">
            {providers.map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`px-4 py-2 rounded-xl text-sm font-black border transition-all ${
                  provider === p ? "bg-navy text-white border-navy" : "border-border-custom text-navy hover:bg-bg-custom"
                }`}
              >
                {p === "razorpay" ? "UPI / Cards" : p === "stripe" ? "Card" : "PayPal"}
              </button>
            ))}
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl px-4 py-3">{error}</div>}

        {provider === "razorpay" && (
          <button onClick={payWithRazorpay} disabled={busy} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Pay {money(currency, total)}
          </button>
        )}

        {provider === "stripe" && props.stripePublishableKey && (
          <StripeSection
            key={`${couponCode ?? "none"}`}
            publishableKey={props.stripePublishableKey}
            applicationId={applicationId}
            couponCode={couponCode}
            total={money(currency, total)}
            onDone={() => setDone(true)}
            onError={setError}
          />
        )}

        {provider === "paypal" && props.paypalClientId && (
          <PayPalSection
            key={`${couponCode ?? "none"}`}
            clientId={props.paypalClientId}
            currency={currency}
            applicationId={applicationId}
            couponCode={couponCode}
            onDone={() => setDone(true)}
            onError={setError}
          />
        )}

        <p className="text-[11px] text-muted font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Payments are processed by the provider. We never see your card details.
        </p>
      </div>
    </div>
  );
}

// ── Stripe ───────────────────────────────────────────────────────────────────
function StripeSection(props: {
  publishableKey: string;
  applicationId: string;
  couponCode?: string;
  total: string;
  onDone: () => void;
  onError: (m: string | null) => void;
}) {
  const [stripePromise] = useState<Promise<Stripe | null>>(() => loadStripe(props.publishableKey));
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { applicationId, couponCode, onError } = props;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    onError(null);
    postJson("/api/payments/stripe/create-intent", { applicationId, couponCode })
      .then((d) => !cancelled && setClientSecret(d.clientSecret))
      .catch((e) => !cancelled && onError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [applicationId, couponCode, onError]);

  if (loading) return <div className="py-6 text-center text-muted"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>;
  if (!clientSecret) return null;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeForm applicationId={applicationId} total={props.total} onDone={props.onDone} onError={onError} />
    </Elements>
  );
}

function StripeForm(props: { applicationId: string; total: string; onDone: () => void; onError: (m: string | null) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    props.onError(null);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: `${window.location.origin}/dashboard/applications` },
    });
    if (error) {
      props.onError(error.message || "The payment failed.");
      setBusy(false);
      return;
    }
    try {
      await postJson("/api/payments/stripe/confirm", { applicationId: props.applicationId, paymentIntentId: paymentIntent!.id });
      props.onDone();
    } catch (err: any) {
      props.onError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement />
      <button disabled={!stripe || busy} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} Pay {props.total}
      </button>
    </form>
  );
}

// ── PayPal ───────────────────────────────────────────────────────────────────
function PayPalSection(props: {
  clientId: string;
  currency: string;
  applicationId: string;
  couponCode?: string;
  onDone: () => void;
  onError: (m: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { clientId, currency, applicationId, couponCode, onDone, onError } = props;

  const render = useCallback(async () => {
    try {
      const paypal = await loadScript({ clientId, currency });
      if (!paypal?.Buttons || !ref.current) return;
      ref.current.innerHTML = "";
      await paypal
        .Buttons({
          createOrder: async () => (await postJson("/api/payments/paypal/create", { applicationId, couponCode })).orderId,
          onApprove: async (data) => {
            try {
              await postJson("/api/payments/paypal/capture", { applicationId, orderId: data.orderID });
              onDone();
            } catch (e: any) {
              onError(e.message);
            }
          },
          onError: () => onError("PayPal reported a problem. You have not been charged."),
        })
        .render(ref.current);
    } catch (e: any) {
      onError(e?.message || "Could not load PayPal.");
    }
  }, [clientId, currency, applicationId, couponCode, onDone, onError]);

  useEffect(() => {
    render();
  }, [render]);

  return <div ref={ref} />;
}
