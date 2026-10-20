// Stub for a future Supabase sync. Nothing depends on it: the app runs fully on the phone (localStorage).
//
// To enable later: npm i @supabase/supabase-js, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY,
// create tables for sellers, products, weeks and alerts (fields as in src/store.ts) with row-level
// security so each seller reads and writes only their own rows, then implement pushState below and
// call it from store.update().
import type { AppState } from './store';

export const LIVE_ENABLED = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

/** Save the seller's state to the backend. Offline: no-op. */
export async function pushState(_s: AppState): Promise<void> {}
