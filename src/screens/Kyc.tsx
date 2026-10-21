// Seller verification: everything Meesho needs before a seller can go live, one pop-up per item.
import { useState, type ReactNode } from 'react';
import { BadgeCheck, Building2, ChevronRight, CreditCard, FileText, Fingerprint, Landmark, Mail, MapPin } from 'lucide-react';
import {
  bankFor, digits, enrolmentId, fmtAadhaar, kycCount, kycDone, KYC_STEPS, maskAadhaar, maskAccount, maskPAN, sampleAadhaar, stateFor,
  validAadhaar, validAccount, validEmail, validGSTIN, validIFSC, validPAN, validPincode, type Kyc, type KycStep,
} from '../engine/kyc';
import { back, navigate } from '../router';
import { active, buzz, L, toast, update, useStore, type AppState } from '../store';
import { AppBar, BottomSheet, Button, Segmented, StickyCTA } from '../ui/core';

const ICON: Record<KycStep, typeof Fingerprint> = { aadhaar: Fingerprint, pan: CreditCard, gst: FileText, bank: Landmark, address: MapPin, email: Mail };
const TITLE: Record<KycStep, [string, string]> = {
  aadhaar: ['Aadhaar card', 'आधार कार्ड'], pan: ['PAN card', 'पैन कार्ड'], gst: ['GST details', 'GST जानकारी'],
  bank: ['Bank account for payments', 'पेमेंट के लिए बैंक खाता'], address: ['Pickup address', 'पिकअप पता'], email: ['Email', 'ईमेल'],
};
const WHY: Record<KycStep, [string, string]> = {
  aadhaar: ['Confirms who you are', 'आपकी पहचान पक्की करता है'], pan: ['Needed for tax (TCS/TDS)', 'टैक्स (TCS/TDS) के लिए ज़रूरी'],
  gst: ['GSTIN, or a free Enrolment ID if you have none', 'GSTIN, या न हो तो मुफ़्त एनरोलमेंट ID'], bank: ['Where Meesho sends your money', 'जहां मीशो आपका पैसा भेजेगा'],
  address: ['Where the courier picks up orders', 'जहां से कूरियर ऑर्डर उठाएगा'], email: ['For invoices and updates', 'बिल और अपडेट के लिए'],
};

export function summary(s: AppState, k: KycStep): string {
  const v = s.kyc;
  switch (k) {
    case 'aadhaar': return v.aadhaar ? v.aadhaar.masked : '';
    case 'pan': return v.pan ? v.pan.masked : '';
    case 'gst': return v.gst ? v.gst.id : '';
    case 'bank': return v.bank ? `${v.bank.bank || v.bank.ifsc} · ${v.bank.masked}` : '';
    case 'address': return v.address ? `${v.address.city}, ${v.address.state} ${v.address.pincode}` : '';
    case 'email': return v.email ?? '';
  }
}

export function KycScreen() {
  const s = useStore();
  const [open, setOpen] = useState<KycStep | null>(null);
  const n = kycCount(s.kyc), done = kycDone(s.kyc);
  const p = active(s);
  const toLaunch = !p.live && p.price > 0;
  const next = KYC_STEPS.find(k => !s.kyc[k]);
  return (
    <main className="screen">
      <AppBar title={L(s, 'Seller verification', 'सेलर वेरिफ़िकेशन')} />
      <div className="pad">
        <div className="kyc-hero">
          <div className="ring" style={{ ['--p' as string]: `${(n / KYC_STEPS.length) * 360}deg` }} aria-hidden="true"><span>{n}/{KYC_STEPS.length}</span></div>
          <div>
            <h2>{done ? L(s, "You're verified ✓", 'आप वेरिफ़ाइड हैं ✓') : L(s, 'Complete your seller profile', 'अपनी सेलर प्रोफ़ाइल पूरी करें')}</h2>
            <p>{done ? L(s, 'You can now go live and receive payments.', 'अब आप लाइव कर सकते हैं और पेमेंट पा सकते हैं।')
              : L(s, 'Meesho needs these before you can sell. Takes about 3 minutes.', 'बेचने से पहले मीशो को ये चाहिए। लगभग 3 मिनट लगेंगे।')}</p>
          </div>
        </div>
        <ul className="kyc-list">
          {KYC_STEPS.map(k => {
            const Icon = ICON[k]; const ok = !!s.kyc[k];
            return <li key={k}><button className={'kyc-row' + (ok ? ' ok' : '')} onClick={() => { buzz(); setOpen(k); }}>
              <span className="kr-i"><Icon size={22} aria-hidden="true" /></span>
              <span className="kr-t"><b>{L(s, ...TITLE[k])}</b><small>{ok ? summary(s, k) : L(s, ...WHY[k])}</small></span>
              {ok ? <span className="kr-s ok"><BadgeCheck size={18} aria-hidden="true" />{L(s, 'Done', 'हो गया')}</span> : <span className="kr-s">{L(s, 'Add', 'जोड़ें')}<ChevronRight size={18} aria-hidden="true" /></span>}
            </button></li>;
          })}
        </ul>
      </div>
      <StickyCTA>
        {done ? <Button full onClick={() => (toLaunch ? navigate('launch') : back())}>{toLaunch ? L(s, 'Continue to launch →', 'लॉन्च पर चलें →') : L(s, 'Done', 'हो गया')}</Button>
          : <Button full onClick={() => setOpen(next!)}>{L(s, `Next: ${TITLE[next!][0]}`, `आगे: ${TITLE[next!][1]}`)}</Button>}
      </StickyCTA>
      {open && <KycSheet step={open} onClose={() => setOpen(null)} onSaved={() => {
        const after = KYC_STEPS.find(k => k !== open && !s.kyc[k]);
        setOpen(null);
        toast.show(L(s, `${TITLE[open][0]} saved`, `${TITLE[open][1]} सेव हो गया`));
        if (after) setTimeout(() => setOpen(after), 350);
      }} />}
    </main>
  );
}

function Field({ label, children, error, hint }: { label: string; children: ReactNode; error?: string; hint?: ReactNode }) {
  return <label className="field">{label}{children}{error ? <small className="f-err" role="alert">{error}</small> : hint ? <small className="f-hint">{hint}</small> : null}</label>;
}

function KycSheet({ step, onClose, onSaved }: { step: KycStep; onClose: () => void; onSaved: () => void }) {
  const s = useStore();
  const save = (patch: Partial<Kyc>) => { buzz(); update(d => { d.kyc = { ...d.kyc, ...patch }; }); onSaved(); };
  const title = L(s, ...TITLE[step]);
  return (
    <BottomSheet open onClose={onClose} title={title} className="kyc-sheet">
      {step === 'aadhaar' && <AadhaarForm onSave={save} />}
      {step === 'pan' && <PanForm onSave={save} />}
      {step === 'gst' && <GstForm onSave={save} />}
      {step === 'bank' && <BankForm onSave={save} />}
      {step === 'address' && <AddressForm onSave={save} />}
      {step === 'email' && <EmailForm onSave={save} />}
    </BottomSheet>
  );
}

type SaveFn = (patch: Partial<Kyc>) => void;
const useTouched = () => { const [t, setT] = useState(false); return [t, () => setT(true)] as const; };

function AadhaarForm({ onSave }: { onSave: SaveFn }) {
  const s = useStore();
  const [name, setName] = useState(s.seller.name);
  const [num, setNum] = useState('');
  const [consent, setConsent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [t, touch] = useTouched();
  const ok = validAadhaar(num);
  const err = t && !ok ? (digits(num).length < 12 ? L(s, 'Aadhaar has 12 digits.', 'आधार में 12 अंक होते हैं।') : L(s, "This doesn't look like a valid Aadhaar number.", 'यह सही आधार नंबर नहीं लगता।')) : '';
  if (otpSent) return (<>
    <p className="small">{L(s, `Enter the OTP sent to the mobile linked with ${maskAadhaar(num)}.`, `${maskAadhaar(num)} से जुड़े मोबाइल पर आया OTP डालें।`)}</p>
    <Field label={L(s, 'Aadhaar OTP', 'आधार OTP')} hint={L(s, 'OTP: 1234', 'OTP: 1234')}>
      <input inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(digits(e.target.value))} autoComplete="one-time-code" />
    </Field>
    <div className="sheet-actions"><Button full disabled={otp.length < 4} onClick={() => onSave({ aadhaar: { masked: maskAadhaar(num), name: name.trim() } })}>{L(s, 'Verify Aadhaar', 'आधार वेरिफ़ाई करें')}</Button>
      <Button full variant="text" onClick={() => setOtpSent(false)}>{L(s, 'Change number', 'नंबर बदलें')}</Button></div>
  </>);
  return (<>
    <Field label={L(s, 'Name as on Aadhaar', 'आधार पर लिखा नाम')}><input value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></Field>
    <Field label={L(s, 'Aadhaar number', 'आधार नंबर')} error={err}>
      <input inputMode="numeric" value={fmtAadhaar(num)} onChange={e => setNum(digits(e.target.value).slice(0, 12))} onBlur={touch} placeholder="XXXX XXXX XXXX" autoComplete="off" />
    </Field>
    <button className="text-btn" onClick={() => setNum(sampleAadhaar())}>{L(s, 'Use a sample number', 'नमूना नंबर डालें')}</button>
    <label className="check"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />{L(s, 'I agree to verify my identity with an Aadhaar OTP.', 'मैं आधार OTP से अपनी पहचान वेरिफ़ाई करने के लिए सहमत हूं।')}</label>
    <div className="sheet-actions"><Button full disabled={!ok || !consent || name.trim().length < 2} onClick={() => setOtpSent(true)}>{L(s, 'Send OTP', 'OTP भेजें')}</Button></div>
  </>);
}

function PanForm({ onSave }: { onSave: SaveFn }) {
  const s = useStore();
  const [pan, setPan] = useState('');
  const [name, setName] = useState(s.kyc.aadhaar?.name ?? s.seller.name);
  const [t, touch] = useTouched();
  const ok = validPAN(pan);
  return (<>
    <Field label={L(s, 'PAN number', 'पैन नंबर')} error={t && !ok ? L(s, 'PAN looks like ABCPE1234F: 5 letters, 4 digits, 1 letter.', 'पैन ऐसा होता है: ABCPE1234F — 5 अक्षर, 4 अंक, 1 अक्षर।') : ''}>
      <input value={pan} maxLength={10} onChange={e => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} onBlur={touch} placeholder="ABCPE1234F" autoCapitalize="characters" autoComplete="off" className="mono" />
    </Field>
    <button className="text-btn" onClick={() => setPan('ABCPE1234F')}>{L(s, 'Use a sample PAN', 'नमूना पैन डालें')}</button>
    <Field label={L(s, 'Name as on PAN', 'पैन पर लिखा नाम')}><input value={name} onChange={e => setName(e.target.value)} /></Field>
    <div className="sheet-actions"><Button full disabled={!ok || name.trim().length < 2} onClick={() => onSave({ pan: { masked: maskPAN(pan), name: name.trim() } })}>{L(s, 'Verify PAN', 'पैन वेरिफ़ाई करें')}</Button></div>
  </>);
}

function GstForm({ onSave }: { onSave: SaveFn }) {
  const s = useStore();
  const [kind, setKind] = useState<'eid' | 'gstin'>('eid');
  const [gstin, setGstin] = useState('');
  const [t, touch] = useTouched();
  const code = stateFor(s.kyc.address?.pincode ?? '')?.code ?? '09';
  return (<>
    <Segmented label={L(s, 'Do you have a GSTIN?', 'क्या आपके पास GSTIN है?')} value={kind} onChange={setKind}
      options={[['eid', L(s, "I don't have GSTIN", 'मेरे पास GSTIN नहीं है')], ['gstin', L(s, 'I have GSTIN', 'मेरे पास GSTIN है')]]} />
    {kind === 'gstin' ? <>
      <Field label="GSTIN" error={t && !validGSTIN(gstin) ? L(s, 'GSTIN has 15 characters, like 09ABCPE1234F1Z5.', 'GSTIN में 15 अक्षर होते हैं, जैसे 09ABCPE1234F1Z5।') : ''}>
        <input value={gstin} maxLength={15} onChange={e => setGstin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} onBlur={touch} placeholder="09ABCPE1234F1Z5" className="mono" autoComplete="off" />
      </Field>
      <div className="sheet-actions"><Button full disabled={!validGSTIN(gstin)} onClick={() => onSave({ gst: { kind: 'gstin', id: gstin } })}>{L(s, 'Save GSTIN', 'GSTIN सेव करें')}</Button></div>
    </> : <>
      <div className="info-card"><b>{L(s, 'No GSTIN? No problem.', 'GSTIN नहीं? कोई बात नहीं।')}</b>
        <p>{L(s, "We'll create a free GST Enrolment ID from your PAN. You can sell within your own state from day one.", 'हम आपके पैन से मुफ़्त GST एनरोलमेंट ID बनाएंगे। पहले दिन से अपने राज्य में बेच सकते हैं।')}</p></div>
      {!s.kyc.pan && <p className="cta-warn">{L(s, 'Add your PAN first.', 'पहले पैन जोड़ें।')}</p>}
      <div className="sheet-actions"><Button full disabled={!s.kyc.pan} onClick={() => onSave({ gst: { kind: 'eid', id: enrolmentId(s.kyc.pan!.masked, code) } })}>{L(s, 'Create Enrolment ID', 'एनरोलमेंट ID बनाएं')}</Button></div>
    </>}
  </>);
}

function BankForm({ onSave }: { onSave: SaveFn }) {
  const s = useStore();
  const [holder, setHolder] = useState(s.kyc.pan?.name ?? s.seller.name);
  const [acc, setAcc] = useState('');
  const [acc2, setAcc2] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [t, touch] = useTouched();
  const [checking, setChecking] = useState(false);
  const bank = validIFSC(ifsc) ? bankFor(ifsc) : '';
  const ok = holder.trim().length > 1 && validAccount(acc) && acc === acc2 && validIFSC(ifsc);
  const verify = () => { setChecking(true); setTimeout(() => onSave({ bank: { holder: holder.trim(), masked: maskAccount(acc), ifsc: ifsc.toUpperCase(), bank } }), 900); };
  return (<>
    <Field label={L(s, 'Account holder name', 'खाताधारक का नाम')}><input value={holder} onChange={e => setHolder(e.target.value)} /></Field>
    <Field label={L(s, 'Account number', 'खाता नंबर')} error={t && !validAccount(acc) ? L(s, 'Account numbers have 9 to 18 digits.', 'खाता नंबर में 9 से 18 अंक होते हैं।') : ''}>
      <input inputMode="numeric" value={acc} onChange={e => setAcc(digits(e.target.value).slice(0, 18))} onBlur={touch} autoComplete="off" className="mono" />
    </Field>
    <Field label={L(s, 'Re-enter account number', 'खाता नंबर दोबारा डालें')} error={acc2 && acc2 !== acc ? L(s, "Numbers don't match.", 'नंबर मेल नहीं खाते।') : ''}>
      <input inputMode="numeric" value={acc2} onChange={e => setAcc2(digits(e.target.value).slice(0, 18))} autoComplete="off" className="mono" />
    </Field>
    <Field label="IFSC" error={ifsc.length >= 11 && !validIFSC(ifsc) ? L(s, 'IFSC looks like SBIN0001234.', 'IFSC ऐसा होता है: SBIN0001234।') : ''} hint={bank ? <><Building2 size={14} aria-hidden="true" /> {bank}</> : undefined}>
      <input value={ifsc} maxLength={11} onChange={e => setIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} placeholder="SBIN0001234" className="mono" autoComplete="off" />
    </Field>
    <button className="text-btn" onClick={() => { setAcc('123456789012'); setAcc2('123456789012'); setIfsc('SBIN0001234'); }}>{L(s, 'Use sample bank details', 'नमूना बैंक जानकारी डालें')}</button>
    <div className="sheet-actions"><Button full disabled={!ok || checking} onClick={verify}>{checking ? L(s, 'Sending ₹1 to check…', 'जांच के लिए ₹1 भेज रहे हैं…') : L(s, 'Verify with ₹1', '₹1 से वेरिफ़ाई करें')}</Button></div>
    <p className="hint">{L(s, 'We send ₹1 to this account and match the name.', 'हम इस खाते में ₹1 भेजकर नाम मिलाते हैं।')}</p>
  </>);
}

function AddressForm({ onSave }: { onSave: SaveFn }) {
  const s = useStore();
  const [line, setLine] = useState(s.seller.shop ? `${s.seller.shop}, ` : '');
  const [pin, setPin] = useState('');
  const [city, setCity] = useState(s.seller.city);
  const st = stateFor(pin);
  const ok = line.trim().length > 5 && validPincode(pin) && !!st && city.trim().length > 1;
  return (<>
    <Field label={L(s, 'Shop / building, street, area', 'दुकान / बिल्डिंग, गली, इलाका')}><textarea rows={2} value={line} onChange={e => setLine(e.target.value)} autoComplete="street-address" /></Field>
    <div className="two">
      <Field label={L(s, 'Pincode', 'पिनकोड')} error={pin.length === 6 && !st ? L(s, 'Check the pincode.', 'पिनकोड जांचें।') : ''}>
        <input inputMode="numeric" maxLength={6} value={pin} onChange={e => setPin(digits(e.target.value))} autoComplete="postal-code" />
      </Field>
      <Field label={L(s, 'City', 'शहर')}><input value={city} onChange={e => setCity(e.target.value)} autoComplete="address-level2" /></Field>
    </div>
    {st && <p className="ok-line">✓ {st.state}</p>}
    <div className="sheet-actions"><Button full disabled={!ok} onClick={() => onSave({ address: { line: line.trim(), pincode: pin, city: city.trim(), state: st!.state } })}>{L(s, 'Save address', 'पता सेव करें')}</Button></div>
  </>);
}

function EmailForm({ onSave }: { onSave: SaveFn }) {
  const s = useStore();
  const [email, setEmail] = useState(s.kyc.email ?? '');
  const [t, touch] = useTouched();
  return (<>
    <Field label={L(s, 'Email address', 'ईमेल पता')} error={t && !validEmail(email) ? L(s, 'Enter an email like name@gmail.com.', 'ऐसा ईमेल डालें: name@gmail.com') : ''}>
      <input type="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={touch} autoComplete="email" placeholder="name@gmail.com" />
    </Field>
    <div className="sheet-actions"><Button full disabled={!validEmail(email)} onClick={() => onSave({ email: email.trim() })}>{L(s, 'Save email', 'ईमेल सेव करें')}</Button></div>
  </>);
}
