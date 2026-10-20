import { lazy, Suspense, useEffect, useState } from 'react';
import { Bell, Home as HomeIcon, IndianRupee, MessageCircle, Tag } from 'lucide-react';
import { direction, initRouter, navigate, TABS, type Route } from './router';
import { L, profile, toast, useStore } from './store';
import { Confetti } from './ui/art';
import { Banner, Toast } from './ui/core';
import { Calc, Language, Splash, Story } from './screens/Onboarding';
import { About, Otp, Phone } from './screens/Signup';
import { Costs, Product } from './screens/Product';
import { FloorEngine } from './screens/FloorEngine';
import { GoLive, Launch } from './screens/Launch';
import { Alerts, Hisaab, Home, Listing } from './screens/Tabs';

// the sheets load in their own chunks (prefetched once the app is up); first paint is the static splash in index.html
const load = { chat: () => import('./screens/Chat'), profile: () => import('./screens/Profile') };
const Chat = lazy(() => load.chat().then(m => ({ default: m.Chat })));
const ProfileSheet = lazy(() => load.profile().then(m => ({ default: m.ProfileSheet })));

export function App() {
  const s = useStore();
  const [ready, setReady] = useState(false);
  const [chat, setChat] = useState(false);
  const [party, setParty] = useState(0);
  const profileOpen = profile.use();
  useEffect(() => {
    initRouter(); setReady(true);
    const t = setTimeout(() => Object.values(load).forEach(f => f().catch(() => {})), 1500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { document.documentElement.lang = s.lang; }, [s.lang]);
  if (!ready) return null;

  const r = s.route as Route;
  const isTab = TABS.includes(r);
  const firstProfit = () => { setParty(Date.now()); toast.show(L(s, 'First profitable week! 🎉', 'पहला मुनाफ़े वाला हफ़्ता! 🎉'), undefined, 3000); };
  const pending = s.products.reduce((n, p) => n + p.alerts.filter(a => a.status === 'new').length, 0);
  const screen = (() => {
    switch (r) {
      case 'splash': return <Splash />;
      case 'language': return <Language />;
      case 'story': return <Story />;
      case 'calc': return <Calc />;
      case 'phone': return <Phone />;
      case 'otp': return <Otp />;
      case 'about': return <About />;
      case 'product': return <Product />;
      case 'costs': return <Costs />;
      case 'floor': return <FloorEngine />;
      case 'launch': return <Launch />;
      case 'golive': return <GoLive />;
      case 'home': return <Home onFirstProfit={firstProfit} />;
      case 'hisaab': return <Hisaab />;
      case 'alerts': return <Alerts />;
      case 'listing': return <Listing />;
    }
  })();
  const tabs: [Route, typeof HomeIcon, string, string][] = [['home', HomeIcon, 'Home', 'होम'], ['hisaab', IndianRupee, 'Hisaab', 'हिसाब'], ['alerts', Bell, 'Alerts', 'अलर्ट'], ['listing', Tag, 'Listing', 'लिस्टिंग']];

  return (
    <div className={'app' + (isTab ? ' has-tabs' : '')}>
      <div key={r} className={'route ' + (r === 'splash' ? '' : direction === 'back' ? 'in-back' : 'in-fwd')}>{screen}</div>
      {r !== 'splash' && r !== 'language' && r !== 'golive' && r !== 'story' &&
        <button className="fab" onClick={() => setChat(true)} aria-label={L(s, 'Ask Mool Mitra', 'मूल मित्र से पूछें')}><MessageCircle size={22} aria-hidden="true" /><span>{L(s, 'Ask Mool Mitra', 'मूल मित्र से पूछें')}</span></button>}
      {isTab && <nav className="tabbar" aria-label={L(s, 'Main', 'मुख्य')}>
        {tabs.map(([t, Icon, en, hi]) => (
          <button key={t} className={r === t ? 'on' : ''} aria-current={r === t ? 'page' : undefined} onClick={() => { if (r !== t) navigate(t); }}>
            <span className="ti"><Icon size={24} aria-hidden="true" />{t === 'alerts' && pending > 0 && <em aria-label={L(s, `${pending} new`, `${pending} नए`)}>{pending}</em>}</span>{L(s, en, hi)}
          </button>))}
      </nav>}
      <Banner onOpen={() => navigate('alerts')} />
      <Toast />
      {party > 0 && <Confetti key={party} />}
      <Suspense fallback={null}>
        {chat && <Chat open onClose={() => setChat(false)} />}
        {profileOpen && <ProfileSheet open onClose={() => profile.set(false)} />}
      </Suspense>
    </div>
  );
}
