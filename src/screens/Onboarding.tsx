import { useEffect, useRef, useState } from 'react';
import { estimate, isComplete, titleFor } from '../engine/catalog';
import { econ } from '../engine/model';
import { medianFor } from '../engine/sim';
import { navigate } from '../router';
import { inr, L, update, useStore } from '../store';
import { CoinArt, ParcelArt, SellerArt } from '../ui/art';
import { AppBar, Button, Card, Logo, Money, ReceiptRow, Skeleton, Stepper, StickyCTA, useCalculating } from '../ui/core';
import { QuestionFlow, RupeeStepper } from './common';

// 8.1 Splash
export function Splash() {
  const s = useStore();
  useEffect(() => {
    const t = setTimeout(() => navigate(s.onboarded ? 'home' : 'language', { replace: true }), 1200);
    return () => clearTimeout(t);
  }, [s.onboarded]);
  return (
    <main className="splash">
      <div className="splash-logo"><Logo size={88} /></div>
      <h1>Mool Mitra <span lang="hi">मूल मित्र</span></h1>
      <p>{L(s, 'Sahi daam, sahi munafa', 'सही दाम, सही मुनाफ़ा')}</p>
    </main>
  );
}

// 8.2 Choose language
export function Language() {
  const s = useStore();
  const pick = (lang: 'en' | 'hi') => { update(d => { d.lang = lang; }); navigate('story'); };
  return (
    <main className="screen pad">
      <div className="lang-head"><Logo size={56} /><h1>भाषा चुनें<br /><small>Choose your language</small></h1></div>
      <button className={'lang-card' + (s.lang === 'hi' ? ' on' : '')} onClick={() => pick('hi')} lang="hi">
        <b>हिंदी</b><span>मैं अपना सही दाम जानना चाहता हूं</span>
      </button>
      <button className={'lang-card' + (s.lang === 'en' ? ' on' : '')} onClick={() => pick('en')} lang="en">
        <b>English</b><span>I want to know my right price</span>
      </button>
      <p className="hint center">{L(s, 'You can change this anytime from the top bar.', 'ऊपर वाले बटन से कभी भी बदल सकते हैं।')}</p>
    </main>
  );
}

// 8.3 Onboarding story: three swipeable slides
export function Story() {
  const s = useStore();
  const [i, setI] = useState(0);
  const x0 = useRef<number | null>(null);
  const slides = [
    { art: <SellerArt />, t: L(s, "0% commission doesn't mean zero cost.", '0% कमीशन का मतलब ज़ीरो खर्च नहीं।'),
      b: L(s, 'Shipping, returns, failed deliveries, packing and fees all come out of every order.', 'शिपिंग, रिटर्न, वापस आए पार्सल, पैकिंग और फ़ीस — सब हर ऑर्डर से कटता है।') },
    { art: <ParcelArt size={170} />, t: L(s, '1 in 5 parcels comes back undelivered. 1 in 10 is returned.', '5 में से 1 पार्सल डिलीवर नहीं होता। 10 में से 1 वापस आता है।'),
      b: L(s, 'We add all of it into your price, so there are no surprises.', 'हम ये सब आपके दाम में पहले से जोड़ते हैं, ताकि बाद में झटका न लगे।') },
    { art: <CoinArt size={160} />, t: L(s, 'Know your minimum price before you list.', 'लिस्ट करने से पहले अपना कम से कम दाम जानिए।'),
      b: L(s, "Then get your first 20 orders with Meesho's help.", 'फिर मीशो की मदद से पहले 20 ऑर्डर पाइए।') },
  ];
  const go = (n: number) => setI(Math.max(0, Math.min(slides.length - 1, n)));
  const last = i === slides.length - 1;
  return (
    <main className="screen story" onTouchStart={e => { x0.current = e.touches[0].clientX; }}
      onTouchEnd={e => { if (x0.current === null) return; const dx = e.changedTouches[0].clientX - x0.current; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0.current = null; }}>
      <AppBar right={<button className="text-btn" onClick={() => navigate('calc')}>{L(s, 'Skip', 'छोड़ें')}</button>} />
      <div className="slide" key={i} aria-live="polite">
        <div className="slide-art">{slides[i].art}</div>
        <h1>{slides[i].t}</h1>
        <p>{slides[i].b}</p>
      </div>
      <div className="dots" role="tablist" aria-label={L(s, 'Slides', 'स्लाइड')}>
        {slides.map((_, k) => <button key={k} role="tab" aria-selected={k === i} aria-label={L(s, `Slide ${k + 1}`, `स्लाइड ${k + 1}`)} className={k === i ? 'on' : ''} onClick={() => go(k)} />)}
      </div>
      <StickyCTA>
        {last ? <Button full onClick={() => navigate('calc')}>{L(s, "Check what I'll earn", 'देखें मुझे कितना बचेगा')}</Button>
          : <Button full onClick={() => go(i + 1)}>{L(s, 'Next', 'आगे')}</Button>}
      </StickyCTA>
    </main>
  );
}

// 8.4 Kitna Bachega? (before sign-up)
export function Calc() {
  const s = useStore();
  const a = s.calc.attrs;
  const done = isComplete(a);
  const cost = s.calc.cost || (done ? estimate(a).cost : 0);
  const median = medianFor(a);
  const P = median;
  const e = econ(P, { cost, tier: 'standard', sizeChart: false, median });
  const busy = useCalculating(JSON.stringify(a));
  return (
    <main className="screen">
      <AppBar title={L(s, 'Kitna Bachega?', 'कितना बचेगा?')} onBack={() => navigate('story')}
        right={<button className="text-btn" onClick={() => navigate('phone')}>{L(s, 'Sign up directly', 'सीधे साइन अप')}</button>} />
      <Stepper stage={0} />
      <div className="pad">
        <div className="hero-card">
          <h2>{L(s, 'How much will you keep per piece?', 'हर पीस पर आपको कितना बचेगा?')}</h2>
          <p>{L(s, 'Answer a few taps about one product.', 'एक सामान के बारे में कुछ जवाब दीजिए।')}</p>
        </div>
        <QuestionFlow attrs={a} onChange={na => update(d => { d.calc.attrs = na; d.calc.cost = 0; })} />
        {done && <>
          <Card title={L(s, 'Your making cost per piece', 'एक पीस बनाने का खर्च')} kicker={L(s, 'Our estimate · change if different', 'हमारा अंदाज़ा · अलग हो तो बदलें')}>
            <RupeeStepper value={cost} label={L(s, 'Making cost per piece in rupees', 'एक पीस का खर्च, रुपये में')} onChange={n => update(d => { d.calc.cost = n; })} />
          </Card>
          {busy ? <Card><Skeleton rows={4} /></Card> :
            <Card tone={e.c >= 0 ? 'green' : 'pink'} className="result" title={titleFor(a)[s.lang]}>
              <p className="big-keep">{L(s, 'You keep', 'आपको बचेगा')} <b className={e.c >= 0 ? 'gain' : 'loss'}><Money value={e.c} /></b> <span>{L(s, `per order at ${inr(P)}`, `हर ऑर्डर पर, ${inr(P)} के दाम पर`)}</span></p>
              <ReceiptRow label={L(s, 'Minimum price (no loss)', 'कम से कम दाम (बिना घाटा)')} value={e.breakeven} />
              <ReceiptRow label={L(s, `Money received (after returns & 3% fees)`, `मिलने वाला पैसा (रिटर्न और 3% फ़ीस के बाद)`)} value={e.realised} />
              <ReceiptRow label={L(s, 'Making cost (incl. unsellable returns)', 'बनाने का खर्च (न बिकने वाले रिटर्न समेत)')} value={e.cogs} minus />
              <ReceiptRow label={L(s, 'Shipping both ways, packing, ads', 'आने-जाने की शिपिंग, पैकिंग, विज्ञापन')} value={e.fwdC + e.revC + e.pack + e.ads} minus />
              <ReceiptRow label={L(s, 'You keep', 'आपको बचेगा')} value={e.c} total />
              <p className="note strong">{L(s, '0% commission ≠ zero cost.', '0% कमीशन ≠ ज़ीरो खर्च।')}</p>
            </Card>}
        </>}
      </div>
      <StickyCTA>
        <Button full onClick={() => navigate('phone')}>{L(s, 'Start selling with Mool Mitra', 'मूल मित्र के साथ बेचना शुरू करें')}</Button>
      </StickyCTA>
    </main>
  );
}
