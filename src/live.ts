// Live mode hook (Supabase). Not wired up yet: the app runs fully offline on localStorage.
//
// To enable later (§8, §14):
//   1. npm i @supabase/supabase-js
//   2. set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Vercel → Settings → Environment Variables)
//   3. create tables sellers, products, weeks, alerts, nudges (fields as in src/store.ts) with RLS:
//      sellers read/write only their own rows; the manager role reads its district and inserts nudges
//   4. implement the functions below and call them from store.update() / District.tsx
import type { State } from './store';

export const LIVE_ENABLED = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export interface LiveSeller { id: string; name: string; area: string; price: number; floor: number; profit: number }

/** Sign the seller in (phone OTP or magic link). Offline: resolves to a local demo id. */
export async function signIn(_mobileOrEmail: string): Promise<{ sellerId: string }> {
  return { sellerId: 'local-demo' };
}

/** Upsert the seller, product and latest week after each state change. Offline: no-op. */
export async function pushState(_s: State): Promise<void> {}

/** District console: subscribe to sellers/products/weeks changes. Returns an unsubscribe function. */
export function subscribeDistrict(_onChange: (sellers: LiveSeller[]) => void): () => void {
  return () => {};
}

/** Seller app: subscribe to nudges for this seller; each arrives as a 'cost_change' alert. */
export function subscribeNudges(_sellerId: string, _onNudge: (message: string, messageHi: string) => void): () => void {
  return () => {};
}

/** District console: send a nudge to a seller. Offline: handled locally in District.tsx. */
export async function sendNudge(_sellerId: string, _message: string, _messageHi: string): Promise<void> {}
