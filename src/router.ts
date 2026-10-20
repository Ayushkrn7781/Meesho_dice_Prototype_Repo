// Hash routing (#/calc) so static hosting needs no rewrites. Every screen change is a history
// entry, so the back arrow and the phone's back button walk back through what the seller saw.
import { isComplete } from './engine/catalog';
import { kycDone } from './engine/kyc';
import { active, exitPrompt, getState, update, type AppState } from './store';

export type Route =
  | 'splash' | 'language' | 'story' | 'calc' | 'phone' | 'otp' | 'about' | 'product' | 'costs' | 'floor' | 'kyc' | 'launch' | 'golive'
  | 'home' | 'hisaab' | 'alerts' | 'listing' | 'profile';

export const TABS: Route[] = ['home', 'hisaab', 'alerts', 'listing'];
const ALL: Route[] = ['splash', 'language', 'story', 'calc', 'phone', 'otp', 'about', 'product', 'costs', 'floor', 'kyc', 'launch', 'golive', ...TABS, 'profile'];
const ROOT = '__root';
const FLOW: Route[] = ['language', 'story', 'calc', 'phone', 'otp', 'about'];

// where back goes when there is no earlier screen in this session (e.g. after a reload)
export function parentOf(r: Route, s: AppState): Route | null {
  const p = active(s);
  switch (r) {
    case 'story': return 'language';
    case 'calc': return 'story';
    case 'phone': return s.onboarded ? null : 'calc';
    case 'otp': return 'phone';
    case 'about': return 'otp';
    case 'product': return s.onboarded ? 'listing' : 'about';
    case 'costs': return 'product';
    case 'floor': return p.live ? 'listing' : 'costs';
    case 'kyc': return s.onboarded ? 'profile' : 'floor';
    case 'launch': return 'floor';
    case 'golive': return 'home';
    case 'hisaab': case 'alerts': case 'listing': case 'profile': return 'home';
    default: return null;   // splash, language, home: nothing behind them
  }
}

// a screen can only open once the data it needs exists
function guard(r: Route, s: AppState): Route {
  const p = active(s);
  if (s.onboarded && !s.loggedIn) return r === 'otp' ? 'otp' : 'phone';            // logged out: sign in first
  if (TABS.includes(r) || r === 'profile') return s.onboarded ? r : 'splash';
  if (s.onboarded && FLOW.includes(r)) return 'home';
  if (r === 'costs' && (!isComplete(p.attrs) || !p.photos.length)) return 'product';
  if (r === 'floor' && (!isComplete(p.attrs) || !p.photos.length || p.cost <= 0)) return guard('costs', s);
  if (r === 'kyc' && !s.onboarded && p.price <= 0) return guard('floor', s);
  if (r === 'launch' && (p.price <= 0 || p.live)) return guard('floor', s);
  if (r === 'launch' && !kycDone(s.kyc)) return 'kyc';                               // no selling before KYC
  if (r === 'golive' && !p.live) return guard('launch', s);
  return r;
}

const read = (): Route | null => { const h = location.hash.replace(/^#\/?/, ''); return (ALL as string[]).includes(h) ? (h as Route) : null; };

export let direction: 'fwd' | 'back' = 'fwd';
let depth = 0;   // screens pushed in this session above the first one

function set(r: Route) { update(d => { d.route = r; }); window.scrollTo(0, 0); }

export function navigate(r: Route, opts: { replace?: boolean } = {}) {
  const to = guard(r, getState());
  direction = 'fwd';
  if (opts.replace) history.replaceState(null, '', '#/' + to);
  else { history.pushState(null, '', '#/' + to); depth++; }
  set(to);
}

/** the on-screen back arrow: previous screen if there is one, else the logical parent, else "Leave?" */
export function back() {
  const s = getState();
  if (depth > 0) { history.back(); return; }
  const parent = parentOf(s.route as Route, s);
  if (parent) { direction = 'back'; history.replaceState(null, '', '#/' + parent); set(guard(parent, s)); }
  else exitPrompt.set(true);
}

/** really leave: step below the sentinel entry so the browser / installed app closes or goes back */
export function leaveApp() { exitPrompt.set(false); history.go(-(depth + 2)); }

export function initRouter() {
  const s = getState();
  const wanted = read() ?? 'splash';
  const start = wanted === 'splash' ? 'splash' : guard(wanted, s);
  // a sentinel entry under the app: if the phone's back reaches it we ask before leaving
  history.replaceState(null, '', '#/' + ROOT);
  history.pushState(null, '', '#/' + start);
  depth = 0;
  set(start);
  addEventListener('popstate', () => {
    const now = getState();
    direction = 'back';
    if (location.hash === '#/' + ROOT) {
      history.pushState(null, '', '#/' + now.route);   // stay on the current screen
      const parent = parentOf(now.route as Route, now);
      if (parent) { history.replaceState(null, '', '#/' + parent); set(guard(parent, now)); }
      else exitPrompt.set(true);
      return;
    }
    depth = Math.max(0, depth - 1);
    const r = read();
    if (r) { const g = guard(r, now); if (g !== r) history.replaceState(null, '', '#/' + g); set(g); }
  });
}
