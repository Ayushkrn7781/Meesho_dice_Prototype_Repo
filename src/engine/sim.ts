// Weekly shop simulation and Mool Mitra alerts (§10.6). Deterministic: a demo replays identically.
import { econ, metrics, recommend, CONFIG, FESTIVE, type Inputs } from './model';
import { designFor, type Attrs } from './catalog';
import type { Alert, AppState, Product } from '../store';

// market median for each kind of product (₹)
const MEDIAN: Record<string, number> = { 'kurti-chikan': 429, 'kurti-printed': 250, 'kurti-anarkali': 549, 'dupatta-chikan': 229 };
export const medianFor = (a: Attrs) => MEDIAN[designFor(a)] ?? 250;
export const inputsOf = (p: Pick<Product, 'cost' | 'tier' | 'sizeChart' | 'attrs'>): Inputs => ({ cost: p.cost, tier: p.tier, sizeChart: p.sizeChart, median: medianFor(p.attrs) });

function rand(seed: number) { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }
export const isFestive = (w: number) => w >= 5 && w <= 7;

// one week of sales for one live product; returns alerts it raised
function weekFor(p: Product, w: number, seed: number): Alert[] {
  const inp = inputsOf(p);
  const festive = isFestive(w);
  const ctx = festive ? FESTIVE : {};
  const age = w - p.liveWeek;               // weeks since this product went live
  const launchOn = p.launch && p.launchLeft > 0;
  const shownPrice = launchOn ? p.price - 50 : p.price;
  const rivalCut = age >= 3 && age <= 4 ? 0.8 : 1;
  const base = metrics(shownPrice, inp, CONFIG, ctx).o * rivalCut * (launchOn ? 1.25 : 1);
  const orders = Math.min(CONFIG.cap, Math.max(1, Math.round(base * (0.85 + 0.3 * rand(w * 7 + p.cost + seed)))));
  const e = econ(p.price, inp, CONFIG, ctx);
  const launchOrders = launchOn ? Math.min(orders, p.launchLeft) : 0;
  const retRate = (p.sizeChart ? 0.05 : 0.08) + 0.03 * rand(w * 13 + seed);
  const returned = Math.min(orders, Math.round(orders * (e.r + retRate)));
  // whole-rupee rows so the Hisaab adds up exactly
  const received = Math.round(e.realised * orders);
  const making = Math.round(e.cogs * orders);
  const costs = Math.round((e.fwdC + e.revC + e.pack + e.ads) * orders);
  const launchShare = 20 * launchOrders;
  const profit = received - making - costs - launchShare;
  p.weeks.push({ week: w, price: p.price, shownPrice, orders, kept: orders - returned, returned, received, making, costs, launchShare, profit, launch: launchOn, festive });
  p.launchLeft = Math.max(0, p.launchLeft - launchOrders);

  const out: Alert[] = [];
  const add = (a: Omit<Alert, 'id' | 'status'>) => { const al: Alert = { ...a, id: `${p.id}-${a.kind}-${w}`, status: 'new' }; p.alerts.unshift(al); out.push(al); };
  const best = recommend('profit', inp);
  if (age === 3) add({ week: w, kind: 'rival', price: Math.round(econ(p.price, inp).breakeven - 21) });
  if (w === 4) add({ week: w, kind: 'festive', price: recommend('profit', inp, CONFIG, FESTIVE) + 30 });
  if (age === 6 && !p.sizeChart) add({ week: w, kind: 'returns' });
  if (w === 9 && p.price !== best) add({ week: w, kind: 'post_festive', price: best });
  return out;
}

// advance the whole shop by one week; returns the new alerts
export function nextWeek(s: AppState): Alert[] {
  const w = s.week + 1;
  s.week = w;
  const fresh = s.products.filter(p => p.live).flatMap((p, i) => weekFor(p, w, i * 101));
  if (s.mode === 'auto') autoAccept(s);
  return fresh;
}

// auto mode: accept every new alert, but never move a price below breakeven
export function autoAccept(s: AppState) {
  for (const p of s.products) for (const a of p.alerts) {
    if (a.status !== 'new') continue;
    const belowMin = a.price !== undefined && a.kind !== 'rival' && a.price < econ(a.price, inputsOf(p)).breakeven;
    applyAlert(p, a.id, !belowMin);
  }
}

export function applyAlert(p: Product, id: string, accept: boolean) {
  const a = p.alerts.find(x => x.id === id); if (!a) return;
  a.status = accept ? 'accepted' : 'ignored';
  if (!accept) return;
  if ((a.kind === 'festive' || a.kind === 'post_festive') && a.price) p.price = a.price;
  if (a.kind === 'returns') p.sizeChart = true;
  // 'rival': accepting means holding the price (no change)
}
