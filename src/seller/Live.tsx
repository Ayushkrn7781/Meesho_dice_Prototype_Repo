import { titleFor, colourOf } from '../catalog';
import { econ, CONFIG, FESTIVE } from '../model';
import { applyAlert, autoAccept, inputsOf, nextWeek, isFestive } from '../sim';
import { L, inr, update, useStore, type Alert, type State } from '../store';
import { Bars, Card, Pill, Row, Stat } from '../ui';

// multi-week jumps pause on any week that brings a new alert, so ask-me-first advice is never skipped
const advance = (n: number) => update(d => {
  for (let i = 0; i < n; i++) {
    const before = d.alerts.length;
    nextWeek(d);
    if (d.mode === 'ask' && d.alerts.length > before) break;
  }
});

export function TimeBar() {
  const s = useStore();
  return (
    <div className="timebar">
      <span>{L(s, `Week ${s.week} on Meesho`, `मीशो पर हफ़्ता ${s.week}`)}{isFestive(s.week + 1) && <Pill tone="warn">{L(s, 'Diwali next', 'आगे दिवाली')}</Pill>}</span>
      <div><button className="btn sm" onClick={() => advance(1)}>{L(s, 'Next week ▸', 'अगला हफ़्ता ▸')}</button><button className="btn sm ghost" onClick={() => advance(4)} aria-label={L(s, 'Skip up to 4 weeks', '4 हफ़्ते तक आगे')}>+4</button></div>
    </div>
  );
}

function ProductCard({ s }: { s: State }) {
  const [bg, fg] = colourOf(s.product.attrs);
  const e = econ(s.price, inputsOf(s));
  return (
    <div className="prod">
      <div className="thumb" style={{ background: bg }}><svg viewBox="0 0 40 48" width="34"><path d="M12 4l8 4 8-4 8 8-6 6v26H10V18l-6-6z" fill={fg} opacity=".85" /></svg></div>
      <div className="pi"><b>{titleFor(s.product.attrs)[s.lang]}</b>
        <span>{inr(s.price)} · {L(s, 'min', 'न्यूनतम')} {inr(e.breakeven)} · {L(s, 'keep', 'बचत')} <em className={e.c >= 0 ? 'good' : 'bad'}>{inr(e.c)}</em></span>
        {s.launchLeft > 0 && s.launch && <Pill tone="warn">{L(s, `Launch offer: ${s.launchLeft} orders left`, `लॉन्च ऑफ़र: ${s.launchLeft} ऑर्डर बाकी`)}</Pill>}</div>
    </div>
  );
}

export function Home() {
  const s = useStore();
  const tot = s.weeks.reduce((a, w) => ({ o: a.o + w.orders, p: a.p + w.profit }), { o: 0, p: 0 });
  const last = s.weeks.at(-1);
  const pending = s.alerts.filter(a => a.status === 'new').length;
  return (<>
    <h2 className="screen-t">{L(s, `Namaste, ${s.profile.name.split(' ')[0]} ji`, `नमस्ते, ${s.profile.name.split(' ')[0]} जी`)}</h2>
    <TimeBar />
    {s.week === 0 && <Card tone="peach"><p className="small">{L(s, 'Your product is live. Press “Next week” to let time pass and watch orders, profit and Mool Mitra alerts arrive.', 'आपका प्रोडक्ट लाइव है। “अगला हफ़्ता” दबाइए और ऑर्डर, मुनाफ़ा और मूल मित्र अलर्ट देखिए।')}</p></Card>}
    <div className="stats">
      <Stat label={L(s, 'Orders so far', 'अब तक ऑर्डर')} value={tot.o} />
      <Stat label={L(s, 'Profit so far', 'अब तक मुनाफ़ा')} value={inr(tot.p)} tone={tot.p >= 0 ? 'good' : 'bad'} />
      <Stat label={L(s, 'Last week', 'पिछला हफ़्ता')} value={last ? inr(last.profit) : '—'} sub={last ? `${last.orders} ${L(s, 'orders', 'ऑर्डर')}` : undefined} />
    </div>
    <ProductCard s={s} />
    {pending > 0 && <button className="alert-banner" onClick={() => update(d => { d.tab = 'alerts'; })}>🔔 {L(s, `${pending} new Mool Mitra alert${pending > 1 ? 's' : ''} need your OK`, `${pending} नए मूल मित्र अलर्ट आपकी मंज़ूरी चाहते हैं`)} ›</button>}
    {s.weeks.length > 0 && <Card kicker={L(s, 'Profit by week', 'हर हफ़्ते का मुनाफ़ा')}>
      <Bars data={s.weeks.slice(-8).map(w => ({ label: 'W' + w.week, value: w.profit, hi: w.festive }))} />
      <p className="hint">{L(s, 'Green = Diwali weeks (more demand, more failed deliveries).', 'हरा = दिवाली के हफ़्ते (ज़्यादा मांग, ज़्यादा फ़ेल डिलीवरी)।')}</p>
    </Card>}
  </>);
}

export function Hisaab() {
  const s = useStore();
  const w = s.weeks.at(-1);
  if (!w) return (<><h2 className="screen-t">{L(s, 'Weekly Hisaab', 'साप्ताहिक हिसाब')}</h2><TimeBar /><Card><p className="small">{L(s, 'No orders yet. Press “Next week”.', 'अभी कोई ऑर्डर नहीं। “अगला हफ़्ता” दबाइए।')}</p></Card></>);
  const e = econ(w.price, inputsOf(s), CONFIG, w.festive ? FESTIVE : {});
  const realRet = Math.max(0, Math.round(100 * (w.returned / w.orders - e.r)));
  const assumed = Math.round(e.q * 100);
  return (<>
    <h2 className="screen-t">{L(s, 'Weekly Hisaab', 'साप्ताहिक हिसाब')}</h2>
    <TimeBar />
    <Card kicker={L(s, `Week ${w.week}`, `हफ़्ता ${w.week}`)} title={<>{L(s, 'You kept', 'आपको बचा')} <span className={w.profit >= 0 ? 'good' : 'bad'}>{inr(w.profit)}</span></>}>
      <Row k={L(s, `Orders kept by buyers (of ${w.orders})`, `खरीदारों ने रखे (${w.orders} में से)`)} v={w.kept} />
      <Row k={L(s, 'Money received (after 3% fees)', 'मिला पैसा (3% फ़ीस के बाद)')} v={inr(w.received)} />
      <Row k={L(s, 'Making cost', 'बनाने की लागत')} v={inr(-w.making)} tone="bad" />
      <Row k={L(s, 'Shipping, returns, packing, ads', 'शिपिंग, रिटर्न, पैकिंग, विज्ञापन')} v={inr(-w.costs)} tone="bad" />
      {w.launchShare > 0 && <Row k={L(s, 'Your share of launch offer (₹20 × order)', 'लॉन्च ऑफ़र में आपका हिस्सा (₹20 × ऑर्डर)')} v={inr(-w.launchShare)} tone="bad" />}
      <Row k={L(s, 'Profit', 'मुनाफ़ा')} v={inr(w.profit)} tone={w.profit >= 0 ? 'good' : 'bad'} strong />
      <p className="note">{L(s, 'Every rupee shown, every week. No percentages to decode.', 'हर हफ़्ते, हर रुपया साफ़। कोई प्रतिशत समझने की ज़रूरत नहीं।')}</p>
    </Card>
    <Card tone={realRet <= assumed ? 'green' : 'pink'} kicker={L(s, 'Returns check', 'रिटर्न जांच')}>
      <p className="small">{L(s, `Actual customer returns ≈ ${realRet}% (we assumed ${assumed}%). ${realRet < assumed ? 'Your minimum price will come down as this holds.' : 'Add a size chart and real photos to bring this down.'}`, `असल ग्राहक रिटर्न ≈ ${realRet}% (हमने ${assumed}% माना था)। ${realRet < assumed ? 'ऐसा ही रहा तो आपका न्यूनतम दाम घटेगा।' : 'साइज़ चार्ट और असली फ़ोटो से इसे कम करें।'}`)}</p>
    </Card>
    <Card kicker={L(s, 'All weeks', 'सभी हफ़्ते')}>
      <div className="wk-t"><div className="mh"><span>{L(s, 'Week', 'हफ़्ता')}</span><span>{L(s, 'Price', 'दाम')}</span><span>{L(s, 'Orders', 'ऑर्डर')}</span><span>{L(s, 'Profit', 'मुनाफ़ा')}</span></div>
        {[...s.weeks].reverse().map(x => <div key={x.week} className="mr"><span>W{x.week}{x.festive ? ' 🪔' : ''}</span><span>{inr(x.price)}</span><span>{x.orders}</span><span className={x.profit >= 0 ? 'good' : 'bad'}>{inr(x.profit)}</span></div>)}</div>
    </Card>
  </>);
}

const alertText = (s: State, a: Alert) => {
  switch (a.kind) {
    case 'rival': return { t: L(s, `A rival dropped to ${inr(a.price!)}`, `एक प्रतिद्वंद्वी ${inr(a.price!)} पर आ गया`), b: L(s, `Matching would lose you ${inr(-econ(a.price!, inputsOf(s)).c)} per order. Wait 48 hours: most price cuts reverse.`, `बराबरी करने पर हर ऑर्डर पर ${inr(-econ(a.price!, inputsOf(s)).c)} घाटा होगा। 48 घंटे रुकिए: ज़्यादातर कटौती वापस हो जाती है।`), yes: L(s, 'Hold my price', 'मेरा दाम रखें'), no: L(s, 'Ignore', 'नज़रअंदाज़') };
    case 'festive': return { t: L(s, 'Diwali demand is rising', 'दिवाली की मांग बढ़ रही है'), b: L(s, `Raise to ${inr(a.price!)} for 3 weeks. Failed deliveries rise to 28% in festive weeks, so your minimum goes up too.`, `3 हफ़्ते के लिए ${inr(a.price!)} करें। त्योहार में फ़ेल डिलीवरी 28% तक जाती है, इसलिए न्यूनतम भी बढ़ता है।`), yes: L(s, `Set ${inr(a.price!)}`, `${inr(a.price!)} करें`), no: L(s, 'Keep current', 'अभी वाला रखें') };
    case 'returns': return { t: L(s, 'Returns are higher than they should be', 'रिटर्न ज़्यादा हैं'), b: L(s, '“Size didn’t fit” is the top reason. Adding a size chart and real photos cuts returns from 10% to 7% and lowers your minimum price.', '“साइज़ नहीं आया” सबसे बड़ा कारण है। साइज़ चार्ट और असली फ़ोटो से रिटर्न 10% से 7% होंगे।'), yes: L(s, 'Add size chart', 'साइज़ चार्ट जोड़ें'), no: L(s, 'Later', 'बाद में') };
    case 'cost_change': return { t: L(s, 'Message from your Meesho manager', 'आपके मीशो मैनेजर का संदेश'), b: L(s, a.message ?? '', a.messageHi ?? a.message ?? ''), yes: L(s, 'OK, noted', 'ठीक है'), no: L(s, 'Ignore', 'नज़रअंदाज़') };
    case 'post_festive': return { t: L(s, 'Festive weeks are over', 'त्योहार के हफ़्ते खत्म'), b: L(s, `Go back to ${inr(a.price!)}, your best everyday price.`, `${inr(a.price!)} पर लौटें, आपका सबसे अच्छा रोज़ का दाम।`), yes: L(s, `Set ${inr(a.price!)}`, `${inr(a.price!)} करें`), no: L(s, 'Keep current', 'अभी वाला रखें') };
  }
};

export function Alerts() {
  const s = useStore();
  return (<>
    <h2 className="screen-t">{L(s, 'Mool Mitra alerts', 'मूल मित्र अलर्ट')}</h2>
    <TimeBar />
    <Card kicker={L(s, 'How should prices change?', 'दाम कैसे बदलें?')}>
      <div className="seg">
        <button className={s.mode === 'ask' ? 'on' : ''} onClick={() => update(d => { d.mode = 'ask'; })}>{L(s, 'Ask me first', 'पहले मुझसे पूछें')}</button>
        <button className={s.mode === 'auto' ? 'on' : ''} onClick={() => update(d => { d.mode = 'auto'; autoAccept(d); })}>{L(s, 'Auto within limits', 'सीमा में अपने-आप')}</button>
      </div>
      <p className="hint">{L(s, `Limits: never below ${inr(econ(s.price, inputsOf(s)).breakeven)}. At most one alert a day, each with its reason and the rupees at stake.`, `सीमा: कभी ${inr(econ(s.price, inputsOf(s)).breakeven)} से नीचे नहीं। दिन में अधिकतम एक अलर्ट, कारण और रुपये के साथ।`)}</p>
    </Card>
    {s.alerts.length === 0 && <Card><p className="small">{L(s, 'No alerts yet. They arrive as weeks pass (try week 3).', 'अभी कोई अलर्ट नहीं। हफ़्ते बीतने पर आएंगे (हफ़्ता 3 आज़माएं)।')}</p></Card>}
    {s.alerts.map(a => { const x = alertText(s, a); return (
      <div key={a.id} className={'alert ' + a.status}>
        <div className="ah"><b>{x.t}</b><small>{L(s, 'Week', 'हफ़्ता')} {a.week} · WhatsApp</small></div>
        <p>{x.b}</p>
        {a.status === 'new' ? <div className="ab"><button className="btn sm" onClick={() => update(d => applyAlert(d, a, true))}>{x.yes}</button><button className="btn sm ghost" onClick={() => update(d => applyAlert(d, a, false))}>{x.no}</button></div>
          : <Pill tone={a.status === 'accepted' ? 'good' : 'plum'}>{a.status === 'accepted' ? L(s, 'Done', 'हो गया') : L(s, 'Ignored', 'नज़रअंदाज़')}</Pill>}
      </div>); })}
  </>);
}

export function Listing() {
  const s = useStore();
  const inp = inputsOf(s); const e = econ(s.price, inp);
  return (<>
    <h2 className="screen-t">{L(s, 'My listing', 'मेरी लिस्टिंग')}</h2>
    <ProductCard s={s} />
    <Card kicker={L(s, 'Price guard', 'दाम सुरक्षा')}>
      <Row k={L(s, 'Current price', 'मौजूदा दाम')} v={inr(s.price)} />
      <Row k={L(s, 'Breakeven', 'बराबरी')} v={inr(e.breakeven)} tone="bad" />
      <Row k={L(s, 'Target floor', 'लक्ष्य न्यूनतम')} v={inr(e.floor)} />
      <Row k={L(s, 'Size chart + real photos', 'साइज़ चार्ट + असली फ़ोटो')} v={s.product.sizeChart ? '✓' : '✕'} tone={s.product.sizeChart ? 'good' : 'bad'} />
    </Card>
    <button className="btn ghost wide" onClick={() => update(d => { d.step = 'price'; })}>{L(s, 'Re-check price in Floor Engine', 'फ़्लोर इंजन में दाम दोबारा देखें')}</button>
  </>);
}
