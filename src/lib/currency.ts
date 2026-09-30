// ─── lib/currency.ts ──────────────────────────────────────────────────────────

export type ExchangeRates = Record<string, number>;

const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  INR: 83.5,
  GBP: 0.79,
  EUR: 0.92,
  AUD: 1.53,
  CAD: 1.36,
  SGD: 1.35,
  AED: 3.67,
  SAR: 3.75,
  THB: 35.2,
  MYR: 4.7,
  JPY: 149.5,
  ZAR: 18.6,
  NZD: 1.63,
  KWD: 0.31,
  QAR: 3.64,
  BHD: 0.38,
  OMR: 0.38,
  NGN: 1580,
  KES: 129,
  GHS: 15.4,
  CNY: 7.24,
};

const SYMBOL_MAP: Record<string, string> = {
  USD: '$',
  INR: '₹',
  GBP: '£',
  EUR: '€',
  AUD: 'A$',
  CAD: 'CA$',
  SGD: 'S$',
  AED: 'AED ',
  SAR: '﷼',
  THB: '฿',
  MYR: 'RM',
  JPY: '¥',
  ZAR: 'R',
  NZD: 'NZ$',
  KWD: 'KD ',
  QAR: 'QR ',
  BHD: 'BD ',
  OMR: 'OMR ',
  NGN: '₦',
  KES: 'KSh',
  GHS: '₵',
  CNY: '¥',
};

let ratesCache: { rates: ExchangeRates; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function fetchRates(): Promise<ExchangeRates> {
  if (ratesCache && Date.now() - ratesCache.fetchedAt < CACHE_TTL_MS) {
    return ratesCache.rates;
  }
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (!apiKey || apiKey.includes('REPLACE')) return FALLBACK_RATES;
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return FALLBACK_RATES;
    const data = await res.json();
    if (data.result !== 'success') return FALLBACK_RATES;
    ratesCache = { rates: data.conversion_rates as ExchangeRates, fetchedAt: Date.now() };
    return ratesCache.rates;
  } catch {
    return FALLBACK_RATES;
  }
}

export function convertPrice(
  usdAmount: number,
  targetCurrency: string,
  rates: ExchangeRates
): number {
  const rate = rates[targetCurrency] ?? 1;
  const converted = usdAmount * rate;
  // Round to nearest whole number for most currencies; JPY needs no decimals
  return Math.round(converted);
}

export function getCurrencySymbol(currency: string): string {
  return SYMBOL_MAP[currency] ?? currency + ' ';
}

export function formatPrice(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
  // For currencies where symbol is a suffix-style code (AED, KD, etc.)
  if (['AED', 'KWD', 'QAR', 'BHD', 'OMR'].includes(currency)) {
    return `${symbol}${formatted}`;
  }
  return `${symbol}${formatted}`;
}

export { FALLBACK_RATES };
