import { lazy, Suspense, useEffect, useState } from 'react';

// routes load on demand so the landing page paints fast on phones
const About = lazy(() => import('./About').then(m => ({ default: m.About })));
const District = lazy(() => import('./District').then(m => ({ default: m.District })));
const SellerApp = lazy(() => import('./seller/SellerApp').then(m => ({ default: m.SellerApp })));
import { reset, useStore, useToast } from './store';
import { Logo } from './ui';

type Route = 'home' | 'seller' | 'district' | 'about';
const read = (): Route => { const h = location.hash.replace('#', ''); return h === 'seller' || h === 'district' || h === 'about' ? h : 'home'; };

export function App() {
  const [route, setRoute] = useState<Route>(read);
  useEffect(() => { const f = () => setRoute(read()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return (<>
    <nav className="top">
      <a href="#home" className="brand" aria-label="Mool Mitra home"><Logo size={30} /><span>Mool Mitra</span></a>
      <div className="links">
        <a href="#home" className={route === 'home' ? 'on' : ''}>Overview</a>
        <a href="#seller" className={route === 'seller' ? 'on' : ''}>Seller app</a>
        <a href="#district" className={route === 'district' ? 'on' : ''}>District console</a>
        <a href="#about" className={route === 'about' ? 'on' : ''}>Method</a>
      </div>
    </nav>
    {route === 'home' && <Landing />}
    <Suspense fallback={<main className="wrap" style={{ minHeight: '100vh' }} aria-busy="true" />}>
      {route === 'seller' && <SellerPage />}
      {route === 'district' && <main className="wrap"><District /></main>}
      {route === 'about' && <About />}
    </Suspense>
    <Toast />
    <footer className="foot">Mool Mitra · Team Razor Blade, IIT Kanpur · Meesho DICE Challenge S3 · concept product, all data simulated</footer>
  </>);
}

function Landing() {
  return (
    <main className="land">
      <section className="land-hero">
        <div>
          <p className="kicker light">For new-to-online sellers on Meesho</p>
          <h1>The right first price,<br />from your own cost.</h1>
          <p className="lead">Half of new sellers lose money on a listing because they copy the cheapest rival or use their shop price. Mool Mitra prices in returns, failed deliveries, shipping and fees, then stays with the seller as the product grows.</p>
          <div className="land-cta"><a className="cta inline" href="#seller">Try the seller app →</a><a className="btn light" href="#district">Open district console</a></div>
        </div>
        <div className="land-nums">
          <div><b>−₹83</b><span>per order when a ₹180 kurti copies a ₹199 rival</span></div>
          <div><b>₹321</b><span>its real breakeven after RTO, returns and shipping</span></div>
          <div><b>+₹53</b><span>kept per order at the Floor Engine price of ₹399</span></div>
        </div>
      </section>
      <section className="steps">
        {[['1', 'Kitna Bachega?', 'Before signup, see what you really keep per order.'], ['2', 'Floor Engine', 'Breakeven, target floor and a price menu by goal.'], ['3', 'Co-funded launch', 'First 20 orders: Meesho ₹30 + seller ₹20 off.'], ['4', 'Weekly Hisaab', 'Profit in rupees every week, returns explained.'], ['5', 'Mool Mitra alerts', 'Ask-me-first price advice in Hindi on WhatsApp.'], ['6', 'District console', 'Managers spot at-risk sellers and nudge them.']].map(([n, t, d]) => (
          <div key={n} className="step"><span>{n}</span><h2>{t}</h2><p>{d}</p></div>))}
      </section>
      <section className="why">
        <div className="card"><p className="kicker">Why this matters · public data</p><h2>The new-seller wave</h2>
          <ul>
            <li>~9.6 lakh active sellers on Meesho in FY26 (+87% YoY); 40–50% are new to e-commerce.</li>
            <li>Time to first sale fell from 32 to 16 days (FY23 → FY25).</li>
            <li>COD returns ~24% vs prepaid ~10%; COD failed delivery ~26%, fashion up to 40%.</li>
            <li>Meesho contribution margin ~2.3% (Q3 FY26), so every retained seller matters.</li>
          </ul><p className="hint">Sources on the <a href="#about">Method</a> page.</p></div>
        <div className="card"><p className="kicker">What sellers told us · simulated survey, n=150</p><h2>They don't know their cost</h2>
          <ul>
            <li>48% don't know their full cost per order.</li>
            <li>32% set their first price by copying the cheapest rival.</li>
            <li>They expect 8% returns + RTO but face about 29%.</li>
            <li>50% lost money on at least one listing.</li>
            <li>48% want price help on WhatsApp.</li>
          </ul></div>
      </section>
      <section className="howto">
        <h2>3-minute demo</h2>
        <ol>
          <li><b>Landing (15 s):</b> read the −₹83 / ₹321 / +₹53 tiles.</li>
          <li><b>Kitna Bachega? (30 s):</b> open the <a href="#seller">seller app</a>, pick Kurti → Straight → Cotton → Hand chikankari → … The minimum price appears before sign-up.</li>
          <li><b>Sign up (15 s):</b> details are pre-filled. Send OTP, switch to हिंदी.</li>
          <li><b>Floor Engine (45 s):</b> pick “Earn the most”, tap a cheap row (it turns red and the CTA locks), open True cost and Buyer's view.</li>
          <li><b>Launch (15 s):</b> Meesho ₹30 + seller ₹20; go live.</li>
          <li><b>Grow (45 s):</b> press Next week ×3 and accept “Hold my price”; press +4 and accept Diwali; open Hisaab.</li>
          <li><b>District console (15 s):</b> the <a href="#district">console</a> shows your seller at the top; send a nudge to the riskiest seller.</li>
        </ol>
        <button className="btn ghost" onClick={() => { reset(); location.hash = 'seller'; }}>Start a fresh demo</button>
      </section>
    </main>
  );
}

function SellerPage() {
  const s = useStore();
  const tips: Record<string, string> = {
    calc: 'Answer the dropdowns one by one. The answer card shows the minimum price and what the seller keeps after every deduction.',
    signup: 'Sample details are pre-filled. Tap “Send OTP”, then continue. Use the हिं button to switch the whole app to Hindi.',
    costs: 'The making cost is estimated from the answers; sellers can edit it. Ticking the size chart lowers the minimum price.',
    price: 'Pick a goal or tap any price row. Prices below breakeven turn red and the app blocks listing there. Check “True cost” and “Buyer’s view”.',
    launch: 'Meesho funds ₹30 of a ₹50 launch discount on the first 20 orders only.',
    live: 'Press “Next week”. Around week 3 a rival cuts price; week 4 brings Diwali; week 6 flags returns. Accept or ignore each alert, then check Hisaab and the district console.',
  };
  return (
    <main className="seller-page">
      <SellerApp />
      <aside className="guide">
        <p className="kicker">Presenter guide</p>
        <h2>What to show here</h2>
        <p>{tips[s.step]}</p>
        <div className="guide-k"><span>Seller</span><b>{s.profile.name}</b><span>Week</span><b>{s.week}</b><span>Price</span><b>{s.price ? '₹' + s.price : '—'}</b></div>
        <a className="btn ghost" href="#district">See this seller in the district console →</a>
        <button className="btn ghost" onClick={() => reset()}>Restart demo</button>
      </aside>
    </main>
  );
}

function Toast() {
  const t = useToast();
  if (!t) return null;
  return <div className="toast" role="status"><b>{t.title}</b><p lang="hi">{t.body}</p></div>;
}
