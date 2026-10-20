import { useState } from 'react';
import { econ } from '../model';
import { inputsOf } from '../sim';
import { L, inr, useStore, type State } from '../store';

interface Msg { me: boolean; text: string }
// Rule-based helper: answers common seller questions using the seller's own numbers.
function answer(s: State, q: string): string {
  const t = q.toLowerCase();
  const has = s.product.cost > 0 && s.price > 0;
  const e = has ? econ(s.price, inputsOf(s)) : null;
  const hi = s.lang === 'hi';
  if (/min|kam se kam|न्यूनतम|कम से कम|loss|ghata|घाटा|nuksan|नुकसान|breakeven/.test(t)) return e
    ? (hi ? `आपका न्यूनतम दाम ${inr(e.breakeven)} है। इससे नीचे हर ऑर्डर पर घाटा होगा। ${inr(e.floor)} से ऊपर रखेंगे तो हर ऑर्डर पर कम से कम ₹40 बचेंगे।` : `Your minimum price is ${inr(e.breakeven)}. Below it you lose money on every order. Stay above ${inr(e.floor)} to keep at least ₹40 per order.`)
    : (hi ? 'पहले अपना प्रोडक्ट और लागत डालिए, फिर मैं न्यूनतम दाम बताऊंगा।' : 'Add your product and cost first, then I can tell you your minimum price.');
  if (/return|rto|wapas|वापस|रिटर्न|deliver/.test(t)) return hi ? 'फ़ैशन में लगभग 20% ऑर्डर डिलीवर नहीं होते और 10% वापस आते हैं। साइज़ चार्ट और असली फ़ोटो डालने से रिटर्न 7% तक आते हैं और आपका न्यूनतम दाम घटता है।' : 'In fashion about 20% of orders fail delivery and 10% are returned. A size chart and real photos cut returns to about 7% and lower your minimum price.';
  if (/commission|kamishan|कमीशन|fee|फ़ीस/.test(t)) return hi ? 'मीशो पर कमीशन 0% है, पर शिपिंग, रिटर्न शिपिंग, पैकिंग और 3% पेमेंट/TCS/TDS लगते हैं। मूल मित्र ये सब आपके दाम में पहले से जोड़ता है।' : 'Meesho charges 0% commission, but shipping, return shipping, packing and about 3% payment/TCS/TDS still apply. Mool Mitra adds all of these into your price upfront.';
  if (/launch|offer|chhoot|छूट|लॉन्च|ऑफ़र/.test(t)) return hi ? 'पहले 20 ऑर्डर पर खरीदार को ₹50 की छूट मिलती है: ₹30 मीशो देता है, ₹20 आप। इससे पहले ऑर्डर और रिव्यू जल्दी आते हैं।' : 'Your first 20 orders get ₹50 off for the buyer: Meesho pays ₹30 and you pay ₹20. It brings first orders and reviews in days, not weeks.';
  if (/person|insaan|इंसान|human|call|baat|बात/.test(t)) return hi ? 'ठीक है। आपके इलाके का मीशो मैनेजर या स्टार पार्टनर 24 घंटे में WhatsApp पर संपर्क करेगा (डेमो)।' : 'Sure. Your area\'s Meesho manager or Star partner will reach you on WhatsApp within 24 hours (demo).';
  if (/rival|competitor|sasta|सस्ता|cut|प्रतिद्वंद्वी|ghata ?diya|घटाया/.test(t)) return hi ? 'प्रतिद्वंद्वी ने दाम घटाया तो तुरंत न घटाएं। मूल मित्र 48 घंटे रुकने को कहता है और बताता है कि बराबरी करने पर कितने रुपये का घाटा होगा।' : 'If a rival cuts price, don’t copy at once. Mool Mitra asks you to wait 48 hours and shows exactly how many rupees matching would cost you.';
  if (/price|daam|dam|दाम|kimat|कीमत|kitna|कितना/.test(t)) return e
    ? (hi ? `${inr(s.price)} पर आपको हर ऑर्डर पर ${inr(e.c)} बचता है। फ़्लोर इंजन में “सबसे ज़्यादा कमाएं” चुनकर सबसे अच्छा दाम देखें।` : `At ${inr(s.price)} you keep ${inr(e.c)} per order. Open the Floor Engine and pick “Earn the most” to see your best price.`)
    : (hi ? 'फ़्लोर इंजन आपकी लागत से सही दाम निकालता है। पहले प्रोडक्ट जोड़िए।' : 'The Floor Engine works out your right price from your own cost. Add a product first.');
  return hi ? 'मैं दाम, न्यूनतम दाम, रिटर्न, कमीशन और लॉन्च ऑफ़र के बारे में बता सकता हूं। या “किसी इंसान से बात करें” चुनें।' : 'I can help with your price, minimum price, returns, commission and the launch offer. Or choose “Talk to a person”.';
}

export function Assistant({ onClose }: { onClose: () => void }) {
  const s = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([{ me: false, text: L(s, 'Namaste! I am Mool Mitra. Ask me about your price, returns or fees.', 'नमस्ते! मैं मूल मित्र हूं। दाम, रिटर्न या फ़ीस के बारे में पूछिए।') }]);
  const [q, setQ] = useState('');
  const send = (text: string) => { if (!text.trim()) return; setMsgs(m => [...m, { me: true, text }, { me: false, text: answer(s, text) }]); setQ(''); };
  const chips = s.lang === 'hi'
    ? ['मेरा न्यूनतम दाम?', 'कौन सा दाम रखूं?', 'रिटर्न क्यों?', 'कमीशन कितना?', 'लॉन्च ऑफ़र', 'प्रतिद्वंद्वी ने दाम घटाया', 'किसी इंसान से बात करें']
    : ['My minimum price?', 'What price should I set?', 'Why returns?', 'Is commission zero?', 'Launch offer', 'A rival cut price', 'Talk to a person'];
  return (
    <div className="chat" role="dialog" aria-label="Mool Mitra assistant">
      <div className="chat-h"><b>{L(s, 'Mool Mitra', 'मूल मित्र')}</b><small>{L(s, 'Helper · English or Hindi', 'सहायक · हिंदी या अंग्रेज़ी')}</small><button onClick={onClose} aria-label={L(s, 'Close', 'बंद करें')}>✕</button></div>
      <div className="chat-b">{msgs.map((m, i) => <p key={i} className={m.me ? 'me' : ''}>{m.text}</p>)}</div>
      <div className="chips">{chips.map(c => <button key={c} onClick={() => send(c)}>{c}</button>)}</div>
      <form className="chat-f" onSubmit={e => { e.preventDefault(); send(q); }}><input aria-label={L(s, 'Your question', 'आपका सवाल')} value={q} onChange={e => setQ(e.target.value)} placeholder={L(s, 'Type a question…', 'सवाल लिखें…')} /><button aria-label={L(s, 'Send', 'भेजें')}>➤</button></form>
    </div>
  );
}
