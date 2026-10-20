// Hash routing (#/calc) so static hosting needs no rewrites. Every screen change is a history
// entry, so the phone's back button walks back through the flow instead of leaving the app.
import { isComplete } from './engine/catalog';
import { active, getState, update, type AppState } from './store';

export type Route =
  | 'splash' | 'language' | 'story' | 'calc' | 'phone' | 'otp' | 'about' | 'product' | 'costs' | 'floor' | 'launch' | 'golive'
  | 'home' | 'hisaab' | 'alerts' | 'listing';

export const TABS: Route[] = ['home', 'hisaab', 'alerts', 'listing'];
const ALL: Route[] = ['splash', 'language', 'story', 'calc', 'phone', 'otp', 'about', 'product', 'costs', 'floor', 'launch', 'golive', ...TABS];
const ROOT = '__root';

// the screen the app-bar back arrow (and an empty history) returns to
export function parentOf(r: Route, s: AppState): Route | null {
  const p = active(s);
  switch (r) {
    case 'story': return 'language';
    case 'calc': return 'story';
    case 'phone': return 'calc';
    case 'otp': return 'phone';
    case 'about': return 'otp';
    case 'product': return s.onboarded ? 'listing' : 'about';
    case 'costs': return 'product';
    case 'floor': return p.live ? 'listing' : 'costs';
    case 'launch': return 'floor';
    default: return null;
  }
}

// a screen can only open once the data it needs exists
function guard(r: Route, s: AppState): Route {
  const p = active(s);
  if (TABS.includes(r)) return s.onboarded ? r : 'splash';
  if (s.onboarded && ['language', 'story', 'calc', 'phone', 'otp', 'about'].includes(r)) return 'home';
  if (r === 'costs' && !isComplete(p.attrs)) return 'product';
  if (r === 'floor' && (!isComplete(p.attrs) || p.cost <= 0)) return guard('costs', s);
  if (r === 'launch' && (p.price <= 0 || p.live)) return guard('floor', s);
  if (r === 'golive' && !p.live) return guard('launch', s);
  return r;
}

const read = (): Route | null => { const h = location.hash.replace(/^#\/?/, ''); return (ALL as string[]).includes(h) ? (h as Route) : null; };

export let direction: 'fwd' | 'back' = 'fwd';

function set(r: Route) { update(d => { d.route = r; }); window.scrollTo(0, 0); }

export function navigate(r: Route, opts: { replace?: boolean } = {}) {
  const to = guard(r, getState());
  direction = 'fwd';
  if (opts.replace) history.replaceState(null, '', '#/' + to); else history.pushState(null, '', '#/' + to);
  set(to);
}

export function back() {
  const s = getState();
  const parent = parentOf(s.route as Route, s);
  if (parent) { direction = 'back'; history.pushState(null, '', '#/' + parent); set(guard(parent, s)); }
}

export function initRouter() {
  const s = getState();
  const wanted = read() ?? 'splash';
  const start = wanted === 'splash' ? 'splash' : guard(wanted, s);
  // a sentinel entry under the app: if back reaches it mid-flow we step to the parent screen instead of exiting
  history.replaceState(null, '', '#/' + ROOT);
  history.pushState(null, '', '#/' + start);
  set(start);
  addEventListener('popstate', () => {
    const now = getState();
    if (location.hash === '#/' + ROOT) {
      const parent = parentOf(now.route as Route, now);
      if (parent) { direction = 'back'; history.pushState(null, '', '#/' + parent); set(guard(parent, now)); }
      else history.back();   // at a root screen: let the phone leave the app
      return;
    }
    const r = read();
    if (r) { direction = 'back'; const g = guard(r, now); if (g !== r) history.replaceState(null, '', '#/' + g); set(g); }
  });
}
