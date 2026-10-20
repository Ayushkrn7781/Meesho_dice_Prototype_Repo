import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { econ } from '../engine/model';
import { inputsOf } from '../engine/sim';
import { back, navigate } from '../router';
import { active, buzz, inr, L, update, useStore } from '../store';
import { Confetti, ParcelArt } from '../ui/art';
import { AppBar, Button, ReceiptRow, Stepper, StickyCTA } from '../ui/core';

// 8.8 Naya Launch
export function Launch() {
  const s = useStore();
  const p = active(s);
  const e = econ(p.price, inputsOf(p));
  const goLive = (withOffer: boolean) => {
    update(d => { const dp = active(d); dp.launch = withOffer; dp.launchLeft = withOffer ? 20 : 0; dp.live = true; dp.liveWeek = d.week; });
    navigate('golive');
  };
  return (
    <main className="screen">
      <AppBar title={L(s, 'Naya Launch', 'नया लॉन्च')} onBack={back} />
      {!s.onboarded && <Stepper stage={4} />}
      <div className="pad">
        <div className="coupon">
          <p className="coupon-k">{L(s, 'First 20 orders', 'पहले 20 ऑर्डर')} · <b>{L(s, 'NEW LAUNCH', 'नया लॉन्च')}</b></p>
          <p className="coupon-p">{L(s, 'Buyers see', 'खरीदार देखेंगे')} <s>{inr(p.price)}</s> <b>{inr(p.price - 50)}</b></p>
          <div className="coupon-cut" aria-hidden="true" />
          <ReceiptRow label={L(s, 'Meesho pays', 'मीशो देगा')} value={30} />
          <ReceiptRow label={L(s, 'You give', 'आप देंगे')} value={20} minus />
          <ReceiptRow label={L(s, 'You still keep per order', 'फिर भी हर ऑर्डर पर बचेगा')} value={e.c - 20} total />
        </div>
        <ul className="checks">
          {[['Shown first to buyers of similar products', 'मिलते-जुलते सामान के खरीदारों को सबसे पहले दिखेगा'],
            ['Price never goes below your minimum', 'दाम कभी आपके कम से कम दाम से नीचे नहीं जाएगा'],
            ['Ends automatically after 20 orders', '20 ऑर्डर के बाद अपने-आप खत्म']].map(([en, hi]) =>
            <li key={en}><CheckCircle2 size={22} aria-hidden="true" />{L(s, en, hi)}</li>)}
        </ul>
      </div>
      <StickyCTA>
        <Button full onClick={() => goLive(true)}>{L(s, 'Go live with launch offer', 'लॉन्च ऑफ़र के साथ लाइव करें')}</Button>
        <Button full variant="text" onClick={() => goLive(false)}>{L(s, 'Go live without offer', 'बिना ऑफ़र के लाइव करें')}</Button>
      </StickyCTA>
    </main>
  );
}

// 8.9 Go-live celebration
export function GoLive() {
  const s = useStore();
  const p = active(s);
  const e = econ(p.price, inputsOf(p));
  useEffect(() => { buzz(); }, []);
  return (
    <main className="golive">
      <Confetti />
      <div className="gl-art"><ParcelArt size={170} /></div>
      <h1>{L(s, 'Your product is live! 🎉', 'आपका प्रोडक्ट लाइव है! 🎉')}</h1>
      <p>{L(s, 'Mool Mitra will watch your price every week.', 'मूल मित्र हर हफ़्ते आपके दाम पर नज़र रखेगा।')}</p>
      <div className="gl-chips">
        <span>{L(s, 'Price', 'दाम')} <b>{inr(p.price)}</b></span>
        <span>{L(s, 'Minimum', 'कम से कम')} <b>{inr(e.breakeven)}</b></span>
        {p.launch && <span>{L(s, 'Launch orders left', 'लॉन्च ऑर्डर बाकी')} <b>{p.launchLeft}</b></span>}
      </div>
      <StickyCTA>
        <Button full className="on-dark" onClick={() => { update(d => { d.onboarded = true; }); navigate('home'); }}>{L(s, 'Go to my shop', 'मेरी दुकान पर चलें')}</Button>
      </StickyCTA>
    </main>
  );
}
