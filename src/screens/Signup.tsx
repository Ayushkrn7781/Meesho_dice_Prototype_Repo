import { useEffect, useRef, useState } from 'react';
import { isComplete, estimate } from '../engine/catalog';
import { navigate } from '../router';
import { active, L, update, useStore } from '../store';
import { AppBar, Button, Card, Stepper, StickyCTA } from '../ui/core';
import { Mic } from '../ui/mic';

const DemoBanner = () => {
  const s = useStore();
  return <p className="demo-banner">{L(s, 'Demo app: use any number. Nothing is sent anywhere.', 'डेमो ऐप: कोई भी नंबर डालें। कुछ भी कहीं नहीं भेजा जाता।')}</p>;
};

// 8.5 step 1: mobile number
export function Phone() {
  const s = useStore();
  const [num, setNum] = useState(s.seller.mobile);
  const ok = /^\d{10}$/.test(num);
  const send = () => { update(d => { d.seller.mobile = num; }); navigate('otp'); };
  return (
    <main className="screen">
      <AppBar title={L(s, 'Create your account', 'अपना खाता बनाएं')} onBack={() => navigate('calc')} />
      <Stepper stage={1} />
      <div className="pad">
        <DemoBanner />
        <h2 className="h2">{L(s, 'Your mobile number', 'आपका मोबाइल नंबर')}</h2>
        <p className="muted">{L(s, "We'll send a 4-digit code.", 'हम 4 अंकों का कोड भेजेंगे।')}</p>
        <label className="phone-in">
          <span>+91</span>
          <input type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={num} placeholder="98765 43210"
            aria-label={L(s, 'Mobile number', 'मोबाइल नंबर')} onChange={e => setNum(e.target.value.replace(/\D/g, '').slice(0, 10))}
            onKeyDown={e => { if (e.key === 'Enter' && ok) send(); }} />
        </label>
        <button className="text-btn" onClick={() => setNum('9876543210')}>{L(s, 'Use a sample number', 'नमूना नंबर डालें')}</button>
      </div>
      <StickyCTA><Button full disabled={!ok} onClick={send}>{L(s, 'Send OTP', 'OTP भेजें')}</Button></StickyCTA>
    </main>
  );
}

// 8.5 step 2: OTP (4 boxes, auto-advance, 30s resend)
export function Otp() {
  const s = useStore();
  const [d, setD] = useState(['', '', '', '']);
  const [left, setLeft] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { refs.current[0]?.focus(); }, []);
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft(l => l - 1), 1000); return () => clearTimeout(t); }, [left]);
  const full = d.every(x => x);
  useEffect(() => { if (full) { const t = setTimeout(() => navigate('about'), 350); return () => clearTimeout(t); } }, [full]);
  const setAt = (i: number, v: string) => {
    const digits = v.replace(/\D/g, '');
    if (digits.length > 1) {   // pasted code
      const next = [...d]; digits.slice(0, 4 - i).split('').forEach((c, k) => { next[i + k] = c; }); setD(next);
      refs.current[Math.min(3, i + digits.length)]?.focus(); return;
    }
    const next = [...d]; next[i] = digits; setD(next);
    if (digits && i < 3) refs.current[i + 1]?.focus();
  };
  const masked = s.seller.mobile ? `+91 ${s.seller.mobile.slice(0, 2)}XXX XX${s.seller.mobile.slice(-3)}` : '';
  return (
    <main className="screen">
      <AppBar title={L(s, 'Verify number', 'नंबर पक्का करें')} onBack={() => navigate('phone')} />
      <Stepper stage={1} />
      <div className="pad">
        <h2 className="h2">{L(s, 'Enter the 4-digit code', '4 अंकों का कोड डालें')}</h2>
        <p className="muted">{L(s, `Sent to ${masked}`, `${masked} पर भेजा गया`)}</p>
        <div className="otp">
          {d.map((v, i) => <input key={i} ref={el => { refs.current[i] = el; }} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={4} value={v}
            aria-label={L(s, `Digit ${i + 1}`, `अंक ${i + 1}`)} onChange={e => setAt(i, e.target.value)}
            onKeyDown={e => { if (e.key === 'Backspace' && !v && i > 0) refs.current[i - 1]?.focus(); }} />)}
        </div>
        <p className="otp-hint">{L(s, 'Demo OTP: 1234 (any 4 digits work)', 'डेमो OTP: 1234 (कोई भी 4 अंक चलेंगे)')}</p>
        <p className="muted center">{left > 0 ? L(s, `Resend code in ${left}s`, `${left} सेकंड में दोबारा भेजें`)
          : <button className="text-btn" onClick={() => setLeft(30)}>{L(s, 'Resend code', 'कोड दोबारा भेजें')}</button>}</p>
      </div>
      <StickyCTA><Button full disabled={!full} onClick={() => navigate('about')}>{L(s, 'Verify', 'पक्का करें')}</Button></StickyCTA>
    </main>
  );
}

// 8.5 step 3: about you
export function About() {
  const s = useStore();
  const set = (k: 'name' | 'shop' | 'city', v: string) => update(d => { d.seller[k] = v; });
  const next = () => {
    update(d => {   // carry the calculator answers into the first product
      const p = active(d);
      if (!isComplete(p.attrs) && isComplete(d.calc.attrs)) { p.attrs = { ...d.calc.attrs }; p.cost = d.calc.cost || estimate(d.calc.attrs).cost; }
    });
    navigate('product');
  };
  const fields: ['name' | 'shop' | 'city', string, string][] = [['name', 'Your name', 'आपका नाम'], ['shop', 'Shop name', 'दुकान का नाम'], ['city', 'City', 'शहर']];
  return (
    <main className="screen">
      <AppBar title={L(s, 'About you', 'आपके बारे में')} onBack={() => navigate('otp')} />
      <Stepper stage={1} />
      <div className="pad">
        <p className="ok-line">✓ {L(s, 'Number verified (demo)', 'नंबर पक्का हो गया (डेमो)')}</p>
        {fields.map(([k, en, hi]) => (
          <label key={k} className="field">{L(s, en, hi)}
            <span className="field-row"><input value={s.seller[k]} onChange={e => set(k, e.target.value)} autoComplete={k === 'name' ? 'name' : k === 'city' ? 'address-level2' : 'organization'} />
              <Mic lang={s.lang} label={L(s, `Speak ${en.toLowerCase()}`, `${hi} बोलकर भरें`)} onText={t => set(k, t)} /></span>
          </label>))}
        <Card tone="peach" title={L(s, 'No GSTIN? No problem.', 'GSTIN नहीं है? कोई बात नहीं।')}>
          <p className="small">{L(s, "We'll create a GST Enrolment ID from your PAN so you can sell in your state from day one.", 'हम आपके PAN से GST एनरोलमेंट ID बना देंगे, ताकि आप पहले दिन से अपने राज्य में बेच सकें।')}</p>
        </Card>
      </div>
      <StickyCTA><Button full disabled={!s.seller.name.trim() || !s.seller.shop.trim()} onClick={next}>{L(s, 'Continue', 'आगे बढ़ें')}</Button></StickyCTA>
    </main>
  );
}
