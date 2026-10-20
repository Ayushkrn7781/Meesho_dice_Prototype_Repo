import { useState } from 'react';
import { autoAccept } from '../engine/sim';
import { navigate } from '../router';
import { banner, L, startOver, toast, update, useStore } from '../store';
import { BottomSheet, Button, Segmented } from '../ui/core';

const SOURCES: [string, string][] = [
  ['Amazon Automate Pricing', 'https://sell.amazon.com/tools/automate-pricing'],
  ['Airbnb new listing promotion', 'https://www.airbnb.com/e/new-listing-promotion'],
  ['Shopee 2026 new-seller policy (summary)', 'https://www.duoke.com/en/blog/article/405-2026-Shopee-New-Seller-Onboarding-Guide-Registration-New-Seller-Policy'],
  ['Temu fully managed model', 'https://shopappy.com/ecommerce/temu/temu-local-vs-fully-managed'],
  ['Etsy Optimize Prices beta', 'https://www.valueaddedresource.net/etsy-launches-optimize-prices-beta/'],
  ['Meesho shipping charges (indicative)', 'https://www.shiprocket.in/blog/meesho-shipping-charges/'],
  ['Khatabook vs Vyapar', 'https://www.mooninvoice.com/blog/khatabook-vs-vyapar'],
];

// 8.15 Profile sheet
export function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useStore();
  const [how, setHow] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (<>
    <BottomSheet open={open && !confirm} onClose={onClose} title={L(s, 'Profile', 'प्रोफ़ाइल')}>
      <div className="prof">
        <div className="avatar big" aria-hidden="true">{(s.seller.name.trim()[0] || 'M').toUpperCase()}</div>
        <div><b>{s.seller.name}</b><small>{s.seller.shop} · {s.seller.city}</small></div>
      </div>
      <p className="field-l">{L(s, 'Language', 'भाषा')}</p>
      <Segmented label={L(s, 'Language', 'भाषा')} value={s.lang} onChange={v => { toast.clear(); banner.clear(); update(d => { d.lang = v; }); }} options={[['hi', 'हिंदी'], ['en', 'English']]} />
      <p className="field-l">{L(s, 'Price changes', 'दाम कैसे बदलें')}</p>
      <Segmented label={L(s, 'Price mode', 'दाम मोड')} value={s.mode} onChange={m => update(d => { d.mode = m; if (m === 'auto') autoAccept(d); })}
        options={[['ask', L(s, 'Ask me first', 'पहले मुझसे पूछें')], ['auto', L(s, 'Auto within limits', 'सीमा में अपने-आप')]]} />
      <button className="row-btn" aria-expanded={how} onClick={() => setHow(h => !h)}>{L(s, 'How Mool Mitra works', 'मूल मित्र कैसे काम करता है')} <span aria-hidden="true">{how ? '−' : '+'}</span></button>
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
      </div>}
      <Button full variant="ghost" className="danger" onClick={() => setConfirm(true)}>{L(s, 'Start over', 'फिर से शुरू करें')}</Button>
    </BottomSheet>
    <BottomSheet open={open && confirm} onClose={() => setConfirm(false)} title={L(s, 'Start over?', 'फिर से शुरू करें?')}>
      <p className="small">{L(s, 'This clears your products, weeks and alerts on this phone.', 'इससे इस फ़ोन पर आपके सामान, हफ़्ते और अलर्ट मिट जाएंगे।')}</p>
      <div className="sheet-actions">
        <Button full onClick={() => { startOver(); setConfirm(false); onClose(); navigate('splash', { replace: true }); }}>{L(s, 'Yes, start over', 'हां, फिर से शुरू करें')}</Button>
        <Button full variant="ghost" onClick={() => setConfirm(false)}>{L(s, 'Cancel', 'रद्द करें')}</Button>
      </div>
    </BottomSheet>
  </>);
}
