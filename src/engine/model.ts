// Floor Engine pricing model — the single source of truth for every price in the app.
// Constants are illustrative model assumptions (§10.1).

export interface ModelConfig {
  median: number;   // typical price of similar items (₹)
  k: number;        // price sensitivity
  D0: number;       // orders/week at the reference price
  cap: number;      // seller's max orders/week (capacity)
  rto: number;      // failed delivery rate (festive: 0.28)
  ret: number;      // customer return rate
  retFixed: number; // return rate with size chart + real photos
  unsell: number;   // share of returned/RTO pieces that can't be resold
  pack: number;     // packaging per order (₹)
  fwd: number;      // forward shipping (₹)
  rev: number;      // return shipping (₹)
  ads: number;      // ads per order (₹)
  phi: number;      // payment + TCS + TDS share
  margin: number;   // target margin above breakeven (₹)
}

export const CONFIG: Readonly<ModelConfig> = {
  median: 250, k: 3, D0: 60, cap: 60, rto: 0.2, ret: 0.1, retFixed: 0.07, unsell: 0.15,
  pack: 8, fwd: 65, rev: 155, ads: 15, phi: 0.03, margin: 40,
};
export const FESTIVE = { rto: 0.28, demand: 1.4 };

export type Tier = 'standard' | 'better' | 'premium';
export type Goal = 'profit' | 'first' | 'clear';
export const TIERS: Record<Tier, { prem: number; label: string; hi: string }> = {
  standard: { prem: 0.0, label: 'Standard', hi: 'सामान्य' },
  better: { prem: 0.12, label: 'Better than most', hi: 'ज़्यादातर से बेहतर' },
  premium: { prem: 0.25, label: 'Premium / handwork', hi: 'प्रीमियम / हाथ का काम' },
};
export const PRICE_POINTS = [199, 249, 299, 349, 399, 449, 499, 549, 599];
export const FILTER_BUCKETS = [199, 299, 399, 499, 699];

export interface Inputs { cost: number; tier: Tier; sizeChart: boolean; median?: number; fwd?: number; cap?: number; D0?: number }
export interface Ctx { rto?: number; demand?: number }

export function econ(P: number, inp: Inputs, cfg: ModelConfig = CONFIG, ctx: Ctx = {}) {
  const r = ctx.rto ?? cfg.rto;  // festive context overrides RTO
  const q = inp.sizeChart ? cfg.retFixed : cfg.ret;
  const clean = 1 - r - q;
  const fwd = inp.fwd ?? cfg.fwd;
  const cogs = inp.cost * (1 - (r + q) * (1 - cfg.unsell));
  const fwdC = fwd * clean;
  const revC = cfg.rev * q;
  const fixed = cogs + cfg.pack + fwdC + revC + cfg.ads;
  const realised = clean * P * (1 - cfg.phi);
  const c = realised - fixed;
  const breakeven = fixed / (clean * (1 - cfg.phi));
  const floor = (fixed + cfg.margin) / (clean * (1 - cfg.phi));
  return { c, realised, cogs, fwdC, revC, fixed, pack: cfg.pack, ads: cfg.ads, fees: clean * P * cfg.phi, breakeven, floor, clean, r, q };
}

export function orders(P: number, inp: Inputs, cfg: ModelConfig = CONFIG, ctx: Ctx = {}) {
  const pref = (inp.median ?? cfg.median) * (1 + TIERS[inp.tier].prem);
  return Math.min(inp.cap ?? cfg.cap, (inp.D0 ?? cfg.D0) * (ctx.demand ?? 1) * Math.exp(-cfg.k * (P - pref) / pref));
}

export function metrics(P: number, inp: Inputs, cfg: ModelConfig = CONFIG, ctx: Ctx = {}) {
  const c = econ(P, inp, cfg, ctx).c; const o = orders(P, inp, cfg, ctx);
  return { p: P, c, o, week: c * o, month: c * o * 4.3 };
}

// price points scale with the product's market: identical to PRICE_POINTS at a ₹250 median
export function pricePoints(median: number = CONFIG.median) {
  if (median === 250) return PRICE_POINTS;
  const step = Math.max(10, Math.round((median * 0.2) / 10) * 10);
  const start = Math.round(median * 0.8) - 1;
  return Array.from({ length: 9 }, (_, i) => start + i * step);
}

export function recommend(goal: Goal, inp: Inputs, cfg: ModelConfig = CONFIG, ctx: Ctx = {}) {
  const pts = pricePoints(inp.median ?? cfg.median).map(p => metrics(p, inp, cfg, ctx));
  if (goal === 'first') return (pts.find(m => m.c >= 15) ?? pts[pts.length - 1]).p;
  if (goal === 'clear') return (pts.find(m => m.c >= -20) ?? pts[pts.length - 1]).p;
  return pts.reduce((a, b) => (b.month > a.month ? b : a)).p;
}

export function bucketNote(P: number, lang: 'en' | 'hi' = 'en') {
  const above = FILTER_BUCKETS.find(b => P > b && P - b <= 25);
  if (above) return lang === 'hi' ? `₹${P} “₹${above} से कम” फ़िल्टर से चूक जाता है। ₹${above} पर आप उन खरीदारों को दिखेंगे।` : `₹${P} just misses the "Under ₹${above}" filter. ₹${above} would show you to those shoppers.`;
  const b = FILTER_BUCKETS.find(x => P <= x) ?? FILTER_BUCKETS[FILTER_BUCKETS.length - 1];
  return lang === 'hi' ? `“₹${b} से कम” और उससे ऊपर के हर फ़िल्टर में दिखेगा।` : `Visible in "Under ₹${b}" and every higher filter.`;
}
