// App state: one object, saved on this phone only (simulated data, nothing leaves the device).
import { useSyncExternalStore } from 'react';
import type { Attrs } from './engine/catalog';
import type { Goal, Tier } from './engine/model';

export type Lang = 'en' | 'hi';

// money rows are whole rupees and always satisfy: received − making − costs − launchShare = profit
export interface WeekRow { week: number; price: number; shownPrice: number; orders: number; kept: number; returned: number; received: number; making: number; costs: number; launchShare: number; profit: number; launch: boolean; festive: boolean }
export interface Alert { id: string; week: number; kind: 'rival' | 'festive' | 'returns' | 'post_festive'; price?: number; status: 'new' | 'accepted' | 'ignored' }

export interface Product {
  id: string;
  attrs: Attrs;
  cost: number; tier: Tier; sizeChart: boolean; stock: number;
  price: number; goal: Goal;
  launch: boolean; launchLeft: number;
  live: boolean; liveWeek: number;   // global week when it went live
  weeks: WeekRow[]; alerts: Alert[];
}

export interface AppState {
  lang: Lang;
  onboarded: boolean;
  route: string;
  seller: { name: string; shop: string; city: string; mobile: string };
  calc: { attrs: Attrs; cost: number };
  products: Product[];
  activeProductId: string;
  week: number;
  mode: 'ask' | 'auto';
  celebratedProfit: boolean;
}

const KEY = 'mool-mitra-v1';

export const newProduct = (id = 'p' + Date.now().toString(36)): Product => ({
  id, attrs: {}, cost: 0, tier: 'standard', sizeChart: false, stock: 300, price: 0, goal: 'profit',
  launch: true, launchLeft: 20, live: false, liveWeek: 0, weeks: [], alerts: [],
});

export const initial = (): AppState => ({
  lang: 'hi', onboarded: false, route: 'splash',
  seller: { name: 'Ramesh Gupta', shop: 'Gupta Chikan Kendra', city: 'Lucknow', mobile: '' },
  calc: { attrs: {}, cost: 0 },
  products: [newProduct('p1')], activeProductId: 'p1',
  week: 0, mode: 'ask', celebratedProfit: false,
});

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = { ...initial(), ...JSON.parse(raw) } as AppState;
      if (Array.isArray(s.products) && s.products.length) return s;
    }
  } catch { /* storage unavailable or old format */ }
  return initial();
}

let state: AppState = load();
const subs = new Set<() => void>();
export function getState() { return state; }
export function update(fn: (draft: AppState) => void) {
  const next: AppState = structuredClone(state);
  fn(next);
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked: session only */ }
  subs.forEach(f => f());
}
export function startOver() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  update(d => { Object.assign(d, initial(), { lang: d.lang }); });
}
export function useStore() {
  return useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb); }, () => state);
}

export const active = (s: AppState) => s.products.find(p => p.id === s.activeProductId) ?? s.products[0];
export const liveProducts = (s: AppState) => s.products.filter(p => p.live);
export const L = (s: { lang: Lang }, en: string, hi: string) => (s.lang === 'hi' ? hi : en);
export const inr = (n: number) => (Math.round(n) < 0 ? '−₹' : '₹') + Math.abs(Math.round(n)).toLocaleString('en-IN');
export const buzz = () => { try { navigator.vibrate?.(10); } catch { /* unsupported */ } };

// transient UI messages (not persisted): toast at the bottom, WhatsApp-style banner at the top
type Msg = { id: number; text: string; sub?: string } | null;
function channel() {
  let msg: Msg = null; let timer: ReturnType<typeof setTimeout> | undefined; const ss = new Set<() => void>();
  return {
    show(text: string, sub?: string, ms = 2600) {
      msg = { id: Date.now(), text, sub }; ss.forEach(f => f());
      clearTimeout(timer); timer = setTimeout(() => { msg = null; ss.forEach(f => f()); }, ms);
    },
    clear() { clearTimeout(timer); msg = null; ss.forEach(f => f()); },
    use() { return useSyncExternalStore(cb => { ss.add(cb); return () => ss.delete(cb); }, () => msg); },
  };
}
export const toast = channel();
export const banner = channel();

// profile sheet visibility, opened from the avatar on any tab
let profileOpen = false; const profileSubs = new Set<() => void>();
export const profile = {
  set(v: boolean) { profileOpen = v; profileSubs.forEach(f => f()); },
  use() { return useSyncExternalStore(cb => { profileSubs.add(cb); return () => profileSubs.delete(cb); }, () => profileOpen); },
};
