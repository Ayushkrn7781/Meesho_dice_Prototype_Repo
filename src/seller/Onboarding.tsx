import { useState } from 'react';
import { estimate, isComplete, titleFor } from '../catalog';
import { econ, TIERS, type Tier } from '../model';
import { inputsOf, medianFor } from '../sim';
import { L, inr, update, useStore, type Step } from '../store';
import { Card, Mic, Row, Pill } from '../ui';
import { ProductForm } from './ProductForm';

const go = (step: Step) => update(d => { d.step = step; });

// 0 · Kitna Bachega? (before signup)
export function Calc() {
  const s = useStore();
  const a = s.calc.attrs;
  const done = isComplete(a);
  const cost = s.calc.cost || estimate(a).cost;
  const median = medianFor(a);
  const P = median;
  const e = econ(P, { cost, tier: 'standard', sizeChart: false, median });
  return (<>
    <div className="hero-card">
      <p className="kicker light">{L(s, 'Before you sign up', 'साइन अप से पहले')}</p>
      <h2>{L(s, 'Kitna Bachega?', 'कितना बचेगा?')}</h2>
      <p>{L(s, 'Tell us about one product. See what you really keep per order on Meesho, after every deduction.', 'एक प्रोडक्ट के बारे में बताइए। हर कटौती के बाद हर ऑर्डर पर असल में कितना बचेगा, देखिए।')}</p>
    </div>
    <Card>
      <ProductForm attrs={a} onChange={na => update(d => { d.calc.attrs = na; d.calc.cost = 0; })} />
      {done && <label className="field">{L(s, 'Making / buying cost per piece (₹)', 'प्रति पीस बनाने/खरीदने की लागत (₹)')}
        <input type="number" inputMode="numeric" value={cost} onChange={e => update(d => { d.calc.cost = Number(e.target.value) || 0; })} /></label>}
    </Card>
    {done && <Card kicker={L(s, 'Your answer', 'आपका जवाब')} title={titleFor(a)[s.lang]} tone={e.c >= 0 ? 'green' : 'pink'}>
      <Row k={L(s, 'Typical price of similar items', 'मिलते-जुलते सामान का आम दाम')} v={inr(median)} />
      <Row k={L(s, 'Minimum price (no loss)', 'न्यूनतम दाम (बिना घाटा)')} v={inr(e.breakeven)} tone="bad" />
      <Row k={L(s, `You keep at ${inr(P)}`, `${inr(P)} पर आपको बचेगा`)} v={inr(e.c)} tone={e.c >= 0 ? 'good' : 'bad'} strong />
      <p className="note">{L(s, '0% commission does not mean zero cost: shipping, returns, failed deliveries, packing and fees are all included.', '0% कमीशन का मतलब ज़ीरो खर्च नहीं: शिपिंग, रिटर्न, फ़ेल डिलीवरी, पैकिंग और फ़ीस सब जोड़े गए हैं।')}</p>
    </Card>}
    <button className="cta" onClick={() => go('signup')}>{done ? L(s, 'Start selling with Mool Mitra', 'मूल मित्र के साथ बेचना शुरू करें') : L(s, 'Skip and sign up', 'छोड़ें और साइन अप करें')}</button>
  </>);
}

// 1 · Sign up
export function Signup() {
  const s = useStore(); const p = s.profile;
  const set = (k: keyof typeof p, v: string) => update(d => { (d.profile as Record<string, unknown>)[k] = v; });
  const [otp, setOtp] = useState(false);
  return (<>
    <h2 className="screen-t">{L(s, 'Create your account', 'अपना खाता बनाएं')}</h2>
    <p className="demo-note">{L(s, 'Demo: fields are pre-filled with sample details. Do not enter real information.', 'डेमो: फ़ील्ड में नमूना जानकारी भरी है। असली जानकारी न डालें।')}</p>
    <Card>
      {([['name', 'Your name', 'आपका नाम'], ['shop', 'Shop name', 'दुकान का नाम'], ['city', 'City', 'शहर'], ['mobile', 'Mobile (sample)', 'मोबाइल (नमूना)']] as const).map(([k, en, hi]) => (
        <label key={k} className="field">{L(s, en, hi)}
          <span className="field-row"><input value={p[k]} inputMode={k === 'mobile' ? 'tel' : undefined} onChange={e => set(k, e.target.value)} />
            {k !== 'mobile' && <Mic lang={s.lang} label={L(s, `Speak ${en.toLowerCase()}`, `${hi} बोलें`)} onText={t => set(k, t)} />}</span>
        </label>))}
      {!otp ? <button className="btn ghost" onClick={() => setOtp(true)}>{L(s, 'Send OTP', 'OTP भेजें')}</button>
        : <p className="ok-line">✓ {L(s, 'OTP 1234 verified (demo)', 'OTP 1234 सत्यापित (डेमो)')}</p>}
      <div className="mic">🎙️ {L(s, 'Prefer speaking? Tap the mic next to a field (works in Chrome; typing always works).', 'बोलकर भरना है? फ़ील्ड के पास माइक दबाएं (क्रोम में चलता है; टाइप करना हमेशा चलेगा)।')}</div>
    </Card>
    <Card tone="peach" kicker={L(s, 'No GSTIN? No problem', 'GSTIN नहीं? कोई बात नहीं')}>
      <p className="small">{L(s, 'We create a GST Enrolment ID from your PAN so you can sell within your state on day one.', 'हम आपके PAN से GST एनरोलमेंट ID बनाएंगे, ताकि आप पहले दिन से अपने राज्य में बेच सकें।')}</p>
    </Card>
    <button className="cta" disabled={!otp || !p.name} onClick={() => go('costs')}>{L(s, 'Continue', 'आगे बढ़ें')}</button>
  </>);
}

// 2 · 90-second cost profile + product
export function Costs() {
  const s = useStore(); const pr = s.product;
  const a = pr.attrs; const done = isComplete(a);
  return (<>
    <h2 className="screen-t">{L(s, 'Your first product', 'आपका पहला प्रोडक्ट')}</h2>
    <p className="sub">{L(s, '90 seconds. Answer one question at a time.', '90 सेकंड। एक-एक सवाल का जवाब दें।')}</p>
    <Card><ProductForm attrs={a} onChange={na => update(d => { d.product.attrs = na; d.product.cost = isComplete(na) ? estimate(na).cost : 0; })} /></Card>
    {done && <Card kicker={L(s, 'Costs', 'लागत')}>
      <label className="field">{L(s, 'Making cost per piece (₹) · our estimate, edit if different', 'प्रति पीस लागत (₹) · हमारा अनुमान, अलग हो तो बदलें')}
        <input type="number" inputMode="numeric" value={pr.cost} onChange={e => update(d => { d.product.cost = Number(e.target.value) || 0; })} /></label>
      <p className="field-l">{L(s, 'Quality compared to similar listings', 'मिलती-जुलती लिस्टिंग से क्वालिटी')}</p>
      <div className="seg">{(Object.keys(TIERS) as Tier[]).map(t => <button key={t} className={pr.tier === t ? 'on' : ''} onClick={() => update(d => { d.product.tier = t; })}>{TIERS[t][s.lang === 'hi' ? 'hi' : 'label']}</button>)}</div>
      <label className="check"><input type="checkbox" checked={pr.sizeChart} onChange={e => update(d => { d.product.sizeChart = e.target.checked; })} />{L(s, 'I will add a size chart and real photos (cuts returns 10% → 7%)', 'मैं साइज़ चार्ट और असली फ़ोटो डालूंगा (रिटर्न 10% → 7%)')}</label>
      <label className="field">{L(s, 'Pieces in stock', 'स्टॉक में पीस')}<input type="number" value={pr.stock} onChange={e => update(d => { d.product.stock = Number(e.target.value) || 0; })} /></label>
    </Card>}
    <button className="cta" disabled={!done || pr.cost <= 0} onClick={() => update(d => { d.step = 'price'; d.price = 0; })}>{L(s, 'Find my right price →', 'मेरा सही दाम निकालें →')}</button>
  </>);
}

// 4 · Launch
export function Launch() {
  const s = useStore();
  const e = econ(s.price, inputsOf(s));
  return (<>
    <h2 className="screen-t">{L(s, 'Naya Launch', 'नया लॉन्च')}</h2>
    <Card tone="peach" kicker={L(s, 'First 20 orders', 'पहले 20 ऑर्डर')} title={<>{L(s, 'Buyers see', 'खरीदार देखेंगे')}: <s>{inr(s.price)}</s> <span className="accent">{inr(s.price - 50)}</span> <Pill tone="warn">{L(s, 'New launch', 'नया लॉन्च')}</Pill></>}>
      <Row k={L(s, 'Meesho pays', 'मीशो देगा')} v="₹30" tone="good" />
      <Row k={L(s, 'You give', 'आप देंगे')} v="₹20" />
      <Row k={L(s, 'You still keep per order', 'फिर भी हर ऑर्डर पर बचेगा')} v={inr(e.c - 20)} tone={e.c - 20 >= 0 ? 'good' : 'bad'} strong />
    </Card>
    <Card kicker={L(s, 'Also during launch', 'लॉन्च के दौरान')}>
      <ul className="ticks">
        <li>{L(s, 'Shown first to buyers of similar products', 'मिलते-जुलते सामान के खरीदारों को पहले दिखेगा')}</li>
        <li>{L(s, 'Price never goes below your minimum', 'दाम कभी आपके न्यूनतम से नीचे नहीं जाएगा')}</li>
        <li>{L(s, 'Capped at 20 orders, then normal price', '20 ऑर्डर तक, फिर सामान्य दाम')}</li>
      </ul>
    </Card>
    <button className="cta" onClick={() => update(d => { d.launch = true; d.launchLeft = 20; d.wentLive = true; d.step = 'live'; d.tab = 'home'; })}>{L(s, 'Go live with launch offer', 'लॉन्च ऑफ़र के साथ लाइव करें')}</button>
    <button className="btn ghost wide" onClick={() => update(d => { d.launch = false; d.launchLeft = 0; d.wentLive = true; d.step = 'live'; d.tab = 'home'; })}>{L(s, 'Go live without offer', 'बिना ऑफ़र के लाइव करें')}</button>
  </>);
}
