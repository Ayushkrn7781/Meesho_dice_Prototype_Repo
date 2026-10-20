import { useEffect, useRef, useState } from 'react';
import { L, reset, update, useStore, type Step, type Tab } from '../store';
import { Logo } from '../ui';
import { Assistant } from './Assistant';
import { Alerts, Hisaab, Home, Listing } from './Live';
import { Calc, Costs, Launch, Signup } from './Onboarding';
import { Price } from './Price';

const FLOW: Step[] = ['calc', 'signup', 'costs', 'price', 'launch', 'live'];
const STAGES = [['Discover', 'खोज'], ['Register', 'रजिस्टर'], ['Product', 'प्रोडक्ट'], ['Price', 'दाम'], ['Launch', 'लॉन्च'], ['Grow', 'बढ़ें']];

export function SellerApp() {
  const s = useStore();
  const [chat, setChat] = useState(false);
  const scr = useRef<HTMLDivElement>(null);
  const idx = FLOW.indexOf(s.step);
  const live = s.step === 'live';
  useEffect(() => { scr.current?.scrollTo({ top: 0 }); }, [s.step, s.tab]);
  const back = () => update(d => { if (idx > 0) d.step = FLOW[idx - 1]; });
  const pending = s.alerts.filter(a => a.status === 'new').length;
  const tabs: [Tab, string, string, string][] = [['home', '⌂', 'Home', 'होम'], ['hisaab', '₹', 'Hisaab', 'हिसाब'], ['alerts', '🔔', 'Alerts', 'अलर्ट'], ['listing', '🏷', 'Listing', 'लिस्टिंग']];
  return (
    <div className="phone">
      <div className="status"><span>Mool Mitra</span><span>4G · 82%</span></div>
      <header className="app-h">
        {idx > 0 && !live ? <button className="icon" onClick={back} aria-label="Back">←</button> : <Logo size={32} />}
        <div className="wm"><b>{L(s, 'Mool Mitra', 'मूल मित्र')}</b><small>{L(s, 'for Meesho sellers', 'मीशो विक्रेताओं के लिए')}</small></div>
        {s.step === 'calc' && <button className="pill-btn" onClick={() => update(d => { d.step = 'signup'; })}>{L(s, 'Sign up', 'साइन अप')}</button>}
        <button className="icon lang" onClick={() => update(d => { d.lang = d.lang === 'en' ? 'hi' : 'en'; })} aria-label="Language">{s.lang === 'en' ? 'हिं' : 'EN'}</button>
        <button className="icon" title={L(s, 'Restart demo', 'डेमो फिर से')} onClick={() => reset()} aria-label="Restart">↺</button>
      </header>
      <div className="stages">{STAGES.map(([en, hi], i) => <span key={en} className={i < idx ? 'done' : i === idx ? 'on' : ''}><i />{s.lang === 'hi' ? hi : en}</span>)}</div>
      <div className="screen" ref={scr}>
        {s.step === 'calc' && <Calc />}
        {s.step === 'signup' && <Signup />}
        {s.step === 'costs' && <Costs />}
        {s.step === 'product' && <Costs />}
        {s.step === 'price' && <Price />}
        {s.step === 'launch' && <Launch />}
        {live && (s.tab === 'home' ? <Home /> : s.tab === 'hisaab' ? <Hisaab /> : s.tab === 'alerts' ? <Alerts /> : <Listing />)}
        <div className="spacer" />
      </div>
      {!chat && <button className="fab" onClick={() => setChat(true)}>💬 {L(s, 'Ask Mool Mitra', 'मूल मित्र से पूछें')}</button>}
      {chat && <Assistant onClose={() => setChat(false)} />}
      {live && <nav className="tabbar">{tabs.map(([t, ic, en, hi]) => <button key={t} className={s.tab === t ? 'on' : ''} onClick={() => update(d => { d.tab = t; })}><span>{ic}</span>{L(s, en, hi)}{t === 'alerts' && pending > 0 && <em>{pending}</em>}</button>)}</nav>}
    </div>
  );
}
