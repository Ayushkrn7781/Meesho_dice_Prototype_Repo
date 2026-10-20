// Weekly simulation for the seller (deterministic) and the simulated district.
import { econ, metrics, recommend, CONFIG, FESTIVE, type Inputs } from './model';
import { designFor, type Attrs } from './catalog';
import type { State, WeekRow, Alert } from './store';

// market median for each kind of product (₹)
const MEDIAN: Record<string, number> = { 'kurti-chikan': 429, 'kurti-printed': 250, 'kurti-anarkali': 549, 'dupatta-chikan': 229 };
export const medianFor = (a: Attrs) => MEDIAN[designFor(a)] ?? 250;
export const inputsOf = (s: Pick<State, 'product'>): Inputs => ({ cost: s.product.cost, tier: s.product.tier, sizeChart: s.product.sizeChart, median: medianFor(s.product.attrs) });

function rand(seed: number) { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }
export const isFestive = (w: number) => w >= 5 && w <= 7;

// advance the seller's shop by one week (§9.6)
export function nextWeek(s: State) {
  const w = s.week + 1;
  const inp = inputsOf(s);
  const festive = isFestive(w);
  const ctx = festive ? FESTIVE : {};
  const launchOn = s.launch && s.launchLeft > 0;
  const shown = launchOn ? s.price - 50 : s.price;
  const rivalCut = w >= 3 && w <= 4 ? 0.8 : 1;
  const base = metrics(shown, inp, CONFIG, ctx).o * rivalCut * (launchOn ? 1.25 : 1);
  const orders = Math.min(CONFIG.cap, Math.max(1, Math.round(base * (0.85 + 0.3 * rand(w * 7 + s.product.cost)))));
  const e = econ(s.price, inp, CONFIG, ctx);
  const launchOrders = launchOn ? Math.min(orders, s.launchLeft) : 0;
  const retRate = (s.product.sizeChart ? 0.05 : 0.08) + 0.03 * rand(w * 13);
  const returned = Math.min(orders, Math.round(orders * (e.r + retRate)));
  // whole-rupee rows so the Hisaab adds up exactly
  const received = Math.round(e.realised * orders);
  const making = Math.round(e.cogs * orders);
  const costs = Math.round((e.fwdC + e.revC + e.pack + e.ads) * orders);
  const launchShare = 20 * launchOrders;
  const profit = received - making - costs - launchShare;
  s.weeks.push({ week: w, price: s.price, shown, orders, kept: orders - returned, returned, received, making, costs, launchShare, profit, launch: launchOn, festive });
  s.week = w;
  s.launchLeft = Math.max(0, s.launchLeft - launchOrders);
  // Mool Mitra alerts (ask-me-first: they wait for the seller)
  const add = (a: Omit<Alert, 'id' | 'status'>) => s.alerts.unshift({ ...a, id: `${a.kind}-${w}`, status: 'new' });
  const best = recommend('profit', inp);
  if (w === 3) add({ week: w, kind: 'rival', price: Math.round(econ(s.price, inp).breakeven - 21) });
  if (w === 4) add({ week: w, kind: 'festive', price: recommend('profit', inp, CONFIG, FESTIVE) + 30 });
  if (w === 6 && !s.product.sizeChart) add({ week: w, kind: 'returns' });
  if (w === 9 && s.price !== best) add({ week: w, kind: 'post_festive', price: best });
  if (s.mode === 'auto') autoAccept(s);
}

// auto mode: accept every new alert, but never move the price below breakeven
export function autoAccept(s: State) {
  s.alerts.filter(a => a.status === 'new').forEach(a => applyAlert(s, a, !(a.price && a.kind !== 'rival' && a.price < econ(a.price, inputsOf(s)).breakeven)));
}

export function applyAlert(s: State, a: Alert, accept: boolean) {
  const t = s.alerts.find(x => x.id === a.id); if (!t) return;
  t.status = accept ? 'accepted' : 'ignored';
  if (!accept) return;
  if ((a.kind === 'festive' || a.kind === 'post_festive') && a.price) s.price = a.price;
  if (a.kind === 'returns') s.product.sizeChart = true;
  // 'rival': accepting means holding the price; 'cost_change': acknowledging the manager's note
}

// a district-manager nudge arrives in the seller app as an alert
export function receiveNudge(s: State, message: string, messageHi: string) {
  s.alerts.unshift({ id: `cost_change-${Date.now()}`, week: s.week, kind: 'cost_change', status: 'new', message, messageHi });
}

// ---------- District (simulated sellers) ----------
const FIRST = ['Ramesh', 'Sunita', 'Imran', 'Meena', 'Arif', 'Pooja', 'Salma', 'Vikas', 'Nazia', 'Deepak', 'Farhan', 'Kavita', 'Rubina', 'Mohit', 'Anjali', 'Shabana', 'Rohit', 'Seema', 'Tariq', 'Neha'];
const LAST = ['Gupta', 'Qureshi', 'Khan', 'Rastogi', 'Verma', 'Ansari', 'Srivastava', 'Siddiqui', 'Mishra', 'Yadav'];
const AREAS = ['Aminabad', 'Chowk', 'Aliganj', 'Hazratganj', 'Nakhas', 'Gomti Nagar', 'Indira Nagar'];
const CATS = ['Chikan kurtis', 'Dupattas', 'Kurta sets', 'Printed kurtis', 'Home decor'];
export type Health = 'healthy' | 'below' | 'slow' | 'returns' | 'quit';
export interface DSeller { id: string; name: string; area: string; cat: string; week: number; price: number; floor: number; profit: number; orders: number; returns: number; health: Health; onMM: boolean; you?: boolean }

export function district(day: number): DSeller[] {
  const out: DSeller[] = [];
  for (let i = 0; i < 64; i++) {
    const r = (k: number) => rand(i * 31 + k);
    const onMM = r(1) < 0.55;
    const floor = Math.round(260 + r(2) * 260);
    const below = !onMM && r(3) < 0.45;
    const price = below ? Math.round(floor * (0.7 + r(4) * 0.25)) : Math.round(floor * (1.02 + r(5) * 0.3));
    const week = 1 + Math.floor(r(6) * 13) + Math.floor(day / 7);
    const returns = Math.round((onMM ? 6 : 10) + r(7) * 18);
    const quit = (!onMM && below && r(8) < 0.4 && week > 6) || (!onMM && r(11) < 0.08 && week > 8) || (onMM && r(12) < 0.12 && week > 8);
    const slow = !below && r(9) < 0.25;
    const health: Health = quit ? 'quit' : below ? 'below' : returns > 22 ? 'returns' : slow ? 'slow' : 'healthy';
    const orders = quit ? 0 : Math.round((below ? 30 : 9) + r(10) * 18);
    const profit = Math.round((price - floor + 40) * 0.68 * orders * 4);
    out.push({ id: 's' + i, name: `${FIRST[(i + 1) % FIRST.length]} ${LAST[(i * 3 + Math.floor(i / FIRST.length)) % LAST.length]}`, area: AREAS[i % AREAS.length], cat: CATS[(i * 3) % CATS.length], week, price, floor, profit, orders, returns, health, onMM });
  }
  return out;
}
