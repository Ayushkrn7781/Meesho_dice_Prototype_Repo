import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { isComplete } from '../engine/catalog';
import { econ, recommend } from '../engine/model';
import { inputsOf } from '../engine/sim';
import { active, inr, L, useStore, type AppState } from '../store';
import { BottomSheet } from '../ui/core';

interface Msg { me: boolean; text: string }

// Rule-based helper: English, Hinglish and Hindi keywords, answered with the seller's own numbers.
export function answer(s: AppState, q: string): string {
  const t = q.toLowerCase();
  const p = active(s);
  const has = isComplete(p.attrs) && p.cost > 0;
  const inp = inputsOf(p);
  const price = p.price || (has ? recommend('profit', inp) : 0);
  const e = has ? econ(price, inp) : null;
  const hi = s.lang === 'hi';
  const needProduct = hi ? 'पहले अपना सामान और खर्च डालिए, फिर मैं आपके हिसाब से बताऊंगा।' : 'Add your product and cost first, then I can answer with your own numbers.';
  if (/person|insaan|इंसान|human|baat kar|बात कर|call me/.test(t))
    return hi ? 'ठीक है। आपके इलाके का मीशो साथी 24 घंटे में WhatsApp पर बात करेगा (डेमो)।' : "Sure. A Meesho partner from your area will message you on WhatsApp within 24 hours (demo).";
  if (/rival|competitor|sasta|सस्ता|price cut|cut price|ghataya|घटाया|dusre seller|दूसरे सेलर/.test(t))
    return e ? (hi ? `दूसरे सेलर ने दाम घटाया तो तुरंत मत घटाइए। ${inr(e.breakeven)} से नीचे हर ऑर्डर पर घाटा है। 48 घंटे रुकिए — ज़्यादातर कटौती वापस हो जाती है।` : `If a rival cuts price, don't copy at once. Below ${inr(e.breakeven)} you lose on every order. Wait 48 hours: most cuts reverse.`) : needProduct;
  if (/min|kam se kam|न्यूनतम|कम से कम|loss|ghata|घाटा|nuksan|नुकसान|breakeven/.test(t))
    return e ? (hi ? `आपका कम से कम दाम ${inr(e.breakeven)} है। इससे नीचे हर ऑर्डर पर घाटा होगा। ${inr(e.floor)} या ऊपर रखेंगे तो हर ऑर्डर पर कम से कम ₹40 बचेंगे।` : `Your minimum price is ${inr(e.breakeven)}. Below it you lose money on every order. At ${inr(e.floor)} or more you keep at least ₹40 per order.`) : needProduct;
  if (/return|rto|wapas|वापस|रिटर्न|deliver/.test(t))
    return hi ? 'कपड़ों में लगभग 20% पार्सल डिलीवर नहीं होते और 10% वापस आते हैं। साइज़ चार्ट और असली फ़ोटो से रिटर्न 7% तक आते हैं और कम से कम दाम घटता है।' : 'In fashion about 20% of parcels fail delivery and 10% are returned. A size chart and real photos cut returns to about 7% and lower your minimum price.';
  if (/commission|kamishan|कमीशन|fee|फ़ीस|फीस/.test(t))
    return hi ? 'मीशो पर कमीशन 0% है, पर शिपिंग, वापसी शिपिंग, पैकिंग और लगभग 3% पेमेंट/TCS/TDS लगते हैं। मूल मित्र ये सब आपके दाम में पहले से जोड़ता है।' : 'Meesho charges 0% commission, but shipping, return shipping, packing and about 3% payment/TCS/TDS still apply. Mool Mitra adds all of these into your price upfront.';
  if (/launch|offer|chhoot|छूट|लॉन्च|ऑफ़र/.test(t))
    return hi ? 'पहले 20 ऑर्डर पर खरीदार को ₹50 की छूट मिलती है: ₹30 मीशो देता है, ₹20 आप। इससे पहले ऑर्डर और रिव्यू जल्दी आते हैं।' : 'Your first 20 orders get ₹50 off for the buyer: Meesho pays ₹30 and you pay ₹20. It brings first orders and reviews in days, not weeks.';
  if (/price|daam|dam|दाम|kimat|कीमत|kitna|कितना|rakhu|रखूं/.test(t))
    return e ? (hi ? `${inr(price)} पर हर ऑर्डर पर ${inr(e.c)} बचते हैं। सबसे ज़्यादा कमाई के लिए ${inr(recommend('profit', inp))} रखें। फ़्लोर इंजन में बाकी दाम देखें।` : `At ${inr(price)} you keep ${inr(e.c)} per order. For the most profit keep ${inr(recommend('profit', inp))}. Open the Floor Engine to compare prices.`) : needProduct;
  return hi ? 'मैं दाम, कम से कम दाम, रिटर्न, कमीशन और लॉन्च ऑफ़र के बारे में बता सकता हूं। या "किसी इंसान से बात करें" चुनें।' : 'I can help with your price, minimum price, returns, commission and the launch offer. Or choose "Talk to a person".';
}

export function Chat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [q, setQ] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, typing]);
  const send = (text: string) => {
    if (!text.trim() || typing) return;
    setMsgs(m => [...m, { me: true, text }]); setQ(''); setTyping(true);
    setTimeout(() => { setMsgs(m => [...m, { me: false, text: answer(s, text) }]); setTyping(false); }, 600);
  };
  const chips = s.lang === 'hi'
    ? ['मेरा न्यूनतम दाम?', 'कौन सा दाम रखूं?', 'रिटर्न क्यों आते हैं?', 'कमीशन कितना है?', 'लॉन्च ऑफ़र', 'दूसरे सेलर ने दाम घटाया', 'किसी इंसान से बात करें']
    : ['My minimum price?', 'What price should I keep?', 'Why returns?', 'Is commission zero?', 'Launch offer', 'A rival cut price', 'Talk to a person'];
  return (
    <BottomSheet open={open} onClose={onClose} title={L(s, 'Ask Mool Mitra', 'मूल मित्र से पूछें')} className="chat">
      <div className="chat-b" aria-live="polite">
        <p className="bub">{L(s, 'Namaste! I am Mool Mitra. Ask me about your price, returns or fees.', 'नमस्ते! मैं मूल मित्र हूं। दाम, रिटर्न या फ़ीस के बारे में पूछिए।')}</p>
        {msgs.map((m, i) => <p key={i} className={'bub' + (m.me ? ' me' : '')}>{m.text}</p>)}
        {typing && <p className="bub typing" aria-label={L(s, 'Mool Mitra is typing', 'मूल मित्र लिख रहा है')}><i /><i /><i /></p>}
        <div ref={end} />
      </div>
      <div className="chips-row scroll">{chips.map(c => <button key={c} className="chip" onClick={() => send(c)}>{c}</button>)}</div>
      <form className="chat-f" onSubmit={e => { e.preventDefault(); send(q); }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={L(s, 'Type a question…', 'सवाल लिखें…')} aria-label={L(s, 'Your question', 'आपका सवाल')} />
        <button aria-label={L(s, 'Send', 'भेजें')}><Send size={20} /></button>
      </form>
    </BottomSheet>
  );
}
