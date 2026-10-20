import { useState } from 'react';
import { BadgeCheck, ChevronRight, CircleHelp, Globe, LogOut, PencilLine, ShieldAlert, ShieldCheck, SlidersHorizontal, Store } from 'lucide-react';
import { kycCount, kycDone, KYC_STEPS } from '../engine/kyc';
import { autoAccept } from '../engine/sim';
import { navigate } from '../router';
import { banner, buzz, inr, L, liveProducts, logout, startOver, toast, update, useStore } from '../store';
import { AppBar, BottomSheet, Button, Segmented } from '../ui/core';
import { Mic } from '../ui/mic';

const SOURCES: [string, string][] = [
  ['Amazon Automate Pricing', 'https://sell.amazon.com/tools/automate-pricing'],
  ['Airbnb new listing promotion', 'https://www.airbnb.com/e/new-listing-promotion'],
  ['Shopee 2026 new-seller policy (summary)', 'https://www.duoke.com/en/blog/article/405-2026-Shopee-New-Seller-Onboarding-Guide-Registration-New-Seller-Policy'],
  ['Temu fully managed model', 'https://shopappy.com/ecommerce/temu/temu-local-vs-fully-managed'],
  ['Etsy Optimize Prices beta', 'https://www.valueaddedresource.net/etsy-launches-optimize-prices-beta/'],
  ['Meesho shipping charges (indicative)', 'https://www.shiprocket.in/blog/meesho-shipping-charges/'],
  ['Khatabook vs Vyapar', 'https://www.mooninvoice.com/blog/khatabook-vs-vyapar'],
];

export function Profile() {
  const s = useStore();
  const [edit, setEdit] = useState(false);
  const [how, setHow] = useState(false);
  const [confirm, setConfirm] = useState<'logout' | 'clear' | null>(null);
  const live = liveProducts(s);
  const profit = live.flatMap(p => p.weeks).reduce((a, w) => a + w.profit, 0);
  const n = kycCount(s.kyc), verified = kycDone(s.kyc);
  const first = (s.seller.name.trim()[0] || 'M').toUpperCase();
  const mobile = s.seller.mobile ? `+91 ${s.seller.mobile.slice(0, 2)}XXX XX${s.seller.mobile.slice(-3)}` : '';
  const setLang = (v: 'en' | 'hi') => { toast.clear(); banner.clear(); update(d => { d.lang = v; }); };
  return (
    <main className="screen profile-page">
      <AppBar title={L(s, 'My profile', 'मेरी प्रोफ़ाइल')} />
      <div className="pad">
        <section className="prof-hero">
          <div className="avatar xl" aria-hidden="true">{first}</div>
          <div className="ph-t">
            <h2>{s.seller.name}</h2>
            <p><Store size={15} aria-hidden="true" /> {s.seller.shop}</p>
            <p className="ph-sub">{s.seller.city}{mobile ? ` · ${mobile}` : ''}</p>
            {verified ? <span className="vbadge ok"><BadgeCheck size={15} aria-hidden="true" />{L(s, 'Verified seller', 'वेरिफ़ाइड सेलर')}</span>
              : <span className="vbadge"><ShieldAlert size={15} aria-hidden="true" />{L(s, `Verification ${n}/${KYC_STEPS.length}`, `वेरिफ़िकेशन ${n}/${KYC_STEPS.length}`)}</span>}
          </div>
          <button className="ph-edit" onClick={() => { buzz(); setEdit(true); }} aria-label={L(s, 'Edit profile', 'प्रोफ़ाइल बदलें')}><PencilLine size={20} /></button>
        </section>
        <div className="prof-stats">
          <div><b>{live.length}</b><span>{L(s, 'Products live', 'लाइव सामान')}</span></div>
          <div><b>{s.week}</b><span>{L(s, 'Weeks selling', 'हफ़्ते बेचते हुए')}</span></div>
          <div><b className={profit >= 0 ? 'gain' : 'loss'}>{inr(profit)}</b><span>{L(s, 'Profit so far', 'अब तक मुनाफ़ा')}</span></div>
        </div>

        <h3 className="sec-t">{L(s, 'Business details', 'कारोबार की जानकारी')}</h3>
        <section className="group">
          {([['Owner name', 'मालिक का नाम', s.seller.name], ['Shop name', 'दुकान का नाम', s.seller.shop], ['What you sell', 'आप क्या बेचते हैं', s.seller.category], ['City', 'शहर', s.seller.city], ['Mobile', 'मोबाइल', mobile]] as const).map(([en, hi, v]) => (
            <div key={en} className="g-row"><span>{L(s, en, hi)}</span><b>{v || '—'}</b></div>))}
          <button className="g-row link" onClick={() => setEdit(true)}><span><PencilLine size={18} aria-hidden="true" /> {L(s, 'Edit business details', 'जानकारी बदलें')}</span><ChevronRight size={18} aria-hidden="true" /></button>
        </section>

        <h3 className="sec-t">{L(s, 'Verification & payments', 'वेरिफ़िकेशन और पेमेंट')}</h3>
        <section className="group">
          <button className="g-row link big" onClick={() => navigate('kyc')}>
            <span className={'g-ic ' + (verified ? 'ok' : 'warn')}>{verified ? <ShieldCheck size={22} aria-hidden="true" /> : <ShieldAlert size={22} aria-hidden="true" />}</span>
            <span className="g-main"><b>{verified ? L(s, 'KYC complete', 'KYC पूरा') : L(s, 'Complete your KYC', 'अपना KYC पूरा करें')}</b>
              <small>{verified ? `${s.kyc.bank?.bank ?? ''} ${s.kyc.bank?.masked ?? ''} · ${s.kyc.gst?.id ?? ''}` : L(s, `${n} of ${KYC_STEPS.length} done · needed to sell and get paid`, `${KYC_STEPS.length} में से ${n} पूरे · बेचने और पेमेंट के लिए ज़रूरी`)}</small>
              <i className="g-bar"><i style={{ width: `${(n / KYC_STEPS.length) * 100}%` }} /></i></span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </section>

        <h3 className="sec-t">{L(s, 'Settings', 'सेटिंग')}</h3>
        <section className="group">
          <div className="g-block"><p className="g-lbl"><Globe size={17} aria-hidden="true" /> {L(s, 'Language', 'भाषा')}</p>
            <Segmented label={L(s, 'Language', 'भाषा')} value={s.lang} onChange={setLang} options={[['hi', 'हिंदी'], ['en', 'English']]} /></div>
          <div className="g-block"><p className="g-lbl"><SlidersHorizontal size={17} aria-hidden="true" /> {L(s, 'Price changes', 'दाम कैसे बदलें')}</p>
            <Segmented label={L(s, 'Price mode', 'दाम मोड')} value={s.mode} onChange={m => update(d => { d.mode = m; if (m === 'auto') autoAccept(d); })}
              options={[['ask', L(s, 'Ask me first', 'पहले मुझसे पूछें')], ['auto', L(s, 'Auto within limits', 'सीमा में अपने-आप')]]} /></div>
        </section>

        <h3 className="sec-t">{L(s, 'Help', 'मदद')}</h3>
        <section className="group">
          <button className="g-row link" aria-expanded={how} onClick={() => setHow(h => !h)}><span><CircleHelp size={18} aria-hidden="true" /> {L(s, 'How Mool Mitra works', 'मूल मित्र कैसे काम करता है')}</span><span aria-hidden="true">{how ? '−' : '+'}</span></button>
          {how && <div className="how">
            <p>{L(s, 'For every order you ship, we count what you really get: some buyers never receive it (about 20%) and some return it (about 10%). From the money that comes in we subtract your making cost, shipping both ways, packing, ads and about 3% fees. What is left is what you keep.',
              'हर भेजे गए ऑर्डर पर हम देखते हैं कि असल में कितना मिलता है: कुछ पार्सल डिलीवर नहीं होते (लगभग 20%) और कुछ वापस आते हैं (लगभग 10%)। मिले पैसे में से बनाने का खर्च, आने-जाने की शिपिंग, पैकिंग, विज्ञापन और लगभग 3% फ़ीस घटाते हैं। जो बचता है, वही आपकी बचत है।')}</p>
            <p>{L(s, 'Your minimum price is where that is exactly ₹0. Your target floor keeps ₹40 more per order. We never let you list below the minimum.',
              'कम से कम दाम वह है जहां बचत ठीक ₹0 हो। सही न्यूनतम दाम पर हर ऑर्डर पर ₹40 और बचते हैं। हम आपको कम से कम दाम से नीचे लिस्ट नहीं करने देते।')}</p>
            <p className="demo-banner">{L(s, 'All orders, profits and alerts in this app are simulated demo data. Return and delivery rates are model assumptions based on public data. Survey figures come from a simulated survey (n=150).',
              'इस ऐप के सभी ऑर्डर, मुनाफ़ा और अलर्ट डेमो के लिए बनाए गए (सिम्युलेटेड) आंकड़े हैं। रिटर्न और डिलीवरी दरें सार्वजनिक आंकड़ों पर आधारित अनुमान हैं। सर्वे के आंकड़े सिम्युलेटेड सर्वे (n=150) से हैं।')}</p>
            <p className="field-l">{L(s, 'Sources', 'स्रोत')}</p>
            <ul className="sources">{SOURCES.map(([t, u]) => <li key={u}><a href={u} target="_blank" rel="noreferrer">{t}</a></li>)}
              <li>{L(s, 'Meesho FY26 seller figures: Deccan Herald; new-to-e-commerce share: Tigerfeathers; returns/RTO: Angadi Labs.', 'मीशो FY26 सेलर आंकड़े: डेक्कन हेराल्ड; नए ऑनलाइन सेलर: टाइगरफ़ेदर्स; रिटर्न/RTO: अंगडी लैब्स।')}</li></ul>
            <button className="text-btn" onClick={() => setConfirm('clear')}>{L(s, 'Clear demo data on this phone', 'इस फ़ोन से डेमो डेटा मिटाएं')}</button>
          </div>}
        </section>

        <Button full variant="ghost" className="logout" onClick={() => setConfirm('logout')}><LogOut size={20} aria-hidden="true" />{L(s, 'Log out', 'लॉग आउट')}</Button>
        <p className="hint center">Mool Mitra · {L(s, 'demo version', 'डेमो वर्ज़न')}</p>
      </div>

      {edit && <EditProfile onClose={() => setEdit(false)} />}
      <BottomSheet open={confirm === 'logout'} onClose={() => setConfirm(null)} title={L(s, 'Log out?', 'लॉग आउट करें?')}>
        <p className="small">{L(s, 'Your shop stays saved on this phone. Log in again with your mobile number and OTP to continue.', 'आपकी दुकान इस फ़ोन पर सेव रहेगी। आगे बढ़ने के लिए मोबाइल नंबर और OTP से फिर लॉग इन करें।')}</p>
        <div className="sheet-actions">
          <Button full onClick={() => { setConfirm(null); logout(); navigate('phone', { replace: true }); }}>{L(s, 'Yes, log out', 'हां, लॉग आउट')}</Button>
          <Button full variant="ghost" onClick={() => setConfirm(null)}>{L(s, 'Cancel', 'रद्द करें')}</Button>
        </div>
      </BottomSheet>
      <BottomSheet open={confirm === 'clear'} onClose={() => setConfirm(null)} title={L(s, 'Clear demo data?', 'डेमो डेटा मिटाएं?')}>
        <p className="small">{L(s, 'This deletes the shop, products, weeks and KYC saved on this phone and starts the demo again.', 'इससे इस फ़ोन पर सेव दुकान, सामान, हफ़्ते और KYC मिट जाएंगे और डेमो फिर से शुरू होगा।')}</p>
        <div className="sheet-actions">
          <Button full onClick={() => { setConfirm(null); startOver(); navigate('splash', { replace: true }); }}>{L(s, 'Yes, clear', 'हां, मिटाएं')}</Button>
          <Button full variant="ghost" onClick={() => setConfirm(null)}>{L(s, 'Cancel', 'रद्द करें')}</Button>
        </div>
      </BottomSheet>
    </main>
  );
}

function EditProfile({ onClose }: { onClose: () => void }) {
  const s = useStore();
  const [f, setF] = useState({ ...s.seller });
  const set = (k: keyof typeof f, v: string) => setF(x => ({ ...x, [k]: v }));
  const ok = f.name.trim().length > 1 && f.shop.trim().length > 1 && f.city.trim().length > 1;
  const fields: [keyof typeof f, string, string][] = [['name', 'Owner name', 'मालिक का नाम'], ['shop', 'Shop name', 'दुकान का नाम'], ['category', 'What you sell', 'आप क्या बेचते हैं'], ['city', 'City', 'शहर']];
  return (
    <BottomSheet open onClose={onClose} title={L(s, 'Edit business details', 'जानकारी बदलें')}>
      {fields.map(([k, en, hi]) => (
        <label key={k} className="field">{L(s, en, hi)}
          <span className="field-row"><input value={f[k]} onChange={e => set(k, e.target.value)} />
            <Mic lang={s.lang} label={L(s, `Speak ${en.toLowerCase()}`, `${hi} बोलकर भरें`)} onText={t => set(k, t)} /></span>
        </label>))}
      <p className="hint">{L(s, 'Your mobile number is your login and is changed through support.', 'मोबाइल नंबर आपका लॉग इन है; इसे बदलने के लिए सपोर्ट से संपर्क करें।')}</p>
      <div className="sheet-actions">
        <Button full disabled={!ok} onClick={() => { update(d => { d.seller = { ...d.seller, name: f.name.trim(), shop: f.shop.trim(), city: f.city.trim(), category: f.category.trim() }; }); onClose(); toast.show(L(s, 'Profile updated', 'प्रोफ़ाइल अपडेट हो गई')); }}>{L(s, 'Save changes', 'बदलाव सेव करें')}</Button>
        <Button full variant="ghost" onClick={onClose}>{L(s, 'Cancel', 'रद्द करें')}</Button>
      </div>
    </BottomSheet>
  );
}
