// App state: one object, saved in this browser only (simulated data, nothing leaves the device).
import { useSyncExternalStore } from 'react';
import type { Attrs } from './catalog';
import { applyConfig, type Goal, type ModelConfig, type Tier } from './model';

export type Lang = 'en' | 'hi';
export type Step = 'calc' | 'signup' | 'costs' | 'product' | 'price' | 'launch' | 'live';
export type Tab = 'home' | 'hisaab' | 'alerts' | 'listing';

// money rows are whole rupees and always satisfy: received − making − costs − launchShare = profit
export interface WeekRow { week: number; price: number; shown: number; orders: number; kept: number; returned: number; received: number; making: number; costs: number; launchShare: number; profit: number; launch: boolean; festive: boolean }
export interface Alert { id: string; week: number; kind: 'rival' | 'festive' | 'returns' | 'post_festive' | 'cost_change'; status: 'new' | 'accepted' | 'ignored'; price?: number; message?: string; messageHi?: string }

export interface State {
  lang: Lang;
  step: Step;
  tab: Tab;
  calc: { attrs: Attrs; cost: number };
  profile: { name: string; shop: string; city: string; mobile: string; pack: number; buyers: 'local' | 'state' | 'india' };
  product: { attrs: Attrs; cost: number; tier: Tier; sizeChart: boolean; stock: number };
  goal: Goal;
  price: number;
  launch: boolean;
  mode: 'ask' | 'auto';
  week: number;
  weeks: WeekRow[];
  alerts: Alert[];
  launchLeft: number;
  nudged: string[];
  wentLive: boolean;
  cfg: Partial<ModelConfig>;
}

const KEY = 'mool-mitra-v1';
export const initial = (): State => ({
  lang: 'en', step: 'calc', tab: 'home',
  calc: { attrs: {}, cost: 0 },
  profile: { name: 'Ramesh Gupta', shop: 'Gupta Chikan Kendra', city: 'Lucknow', mobile: '98XXX XX123', pack: 8, buyers: 'india' },
  product: { attrs: {}, cost: 0, tier: 'better', sizeChart: false, stock: 300 },
  goal: 'profit', price: 0, launch: true, mode: 'ask', week: 0, weeks: [], alerts: [], launchLeft: 20, nudged: [],
  wentLive: false, cfg: {},
});

function load(): State {
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...initial(), ...JSON.parse(raw) }; } catch { /* storage unavailable */ }
  return initial();
}
let state: State = load();
applyConfig(state.cfg);
const subs = new Set<() => void>();
export function getState() { return state; }
export function update(fn: (draft: State) => void) {
  const next: State = structuredClone(state);
  fn(next);
  state = next;
  applyConfig(state.cfg);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  subs.forEach(f => f());
}
export function reset() { update(d => { Object.assign(d, initial(), { lang: d.lang, cfg: d.cfg }); }); }
export function useStore() {
  return useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb); }, () => state);
}
export const L = (s: { lang: Lang }, en: string, hi: string) => (s.lang === 'hi' ? hi : en);
export const inr = (n: number) => (n < 0 ? '−₹' : '₹') + Math.abs(Math.round(n)).toLocaleString('en-IN');

// transient toast (not persisted)
let toastMsg: { title: string; body: string } | null = null;
let toastTimer: ReturnType<typeof setTimeout> | undefined;
const toastSubs = new Set<() => void>();
export function showToast(title: string, body: string) {
  toastMsg = { title, body }; toastSubs.forEach(f => f());
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMsg = null; toastSubs.forEach(f => f()); }, 6000);
}
export function useToast() {
  return useSyncExternalStore(cb => { toastSubs.add(cb); return () => toastSubs.delete(cb); }, () => toastMsg);
}
