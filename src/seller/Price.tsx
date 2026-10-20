import { useState } from 'react';
import { titleFor } from '../catalog';
import { bucketNote, econ, metrics, pricePoints, recommend, type Goal } from '../model';
import { inputsOf } from '../sim';
import { L, inr, update, useStore } from '../store';
import { Card, Curve, Pill, Row } from '../ui';

// 3 · Floor Engine: true cost → price menu → buyer's view
export function Price() {
  const s = useStore();
  const inp = inputsOf(s);
  const [tab, setTab] = useState<'menu' | 'cost' | 'buyer'>('menu');
  const goals: { g: Goal; en: string; hi: string; den: string; dhi: string }[] = [
    { g: 'first', en: 'Get first orders', hi: 'पहले ऑर्डर पाएं', den: 'Lowest price that still keeps ₹15+', dhi: 'सबसे कम दाम जिसमें ₹15+ बचे' },
    { g: 'profit', en: 'Earn the most', hi: 'सबसे ज़्यादा कमाएं', den: 'Highest profit per month', dhi: 'महीने में सबसे ज़्यादा मुनाफ़ा' },
    { g: 'clear', en: 'Clear old stock', hi: 'पुराना स्टॉक निकालें', den: 'Lose at most ₹20 per order', dhi: 'हर ऑर्डर पर अधिकतम ₹20 घाटा' },
  ];
  const recs = Object.fromEntries(goals.map(x => [x.g, recommend(x.g, inp)])) as Record<Goal, number>;
  const price = s.price || recs[s.goal];
  const e = econ(price, inp);
  const m = metrics(price, inp);
  const menu = pricePoints(inp.median).map(p => metrics(p, inp));
  const shop = Math.round(s.product.cost * 1.3);
  const shopKeep = econ(shop, inp).c;
  const charm = (p: number) => Math.round(p / 10) * 10 - 1;
  const rivals = [charm(price * 0.75), charm(price * 0.88), price, charm(price * 1.2)];
  const setPrice = (p: number) => update(d => { d.price = p; });
  return (<>
    <h2 className="screen-t">{L(s, 'Floor Engine', 'फ़्लोर इंजन')}</h2>
    <p className="sub">{titleFor(s.product.attrs)[s.lang]} · {L(s, 'cost', 'लागत')} {inr(s.product.cost)}</p>

    <div className="price-hero">
      <div><span>{L(s, 'Your price', 'आपका दाम')}</span><b>{inr(price)}</b></div>
      <div><span>{L(s, 'You keep / order', 'हर ऑर्डर पर बचत')}</span><b className={e.c >= 0 ? 'good' : 'bad'}>{inr(e.c)}</b></div>
      <div><span>{L(s, 'Per month', 'हर महीने')}</span><b>{inr(m.month)}</b><small>~{Math.round(m.o)} {L(s, 'orders/wk', 'ऑर्डर/हफ़्ता')}</small></div>
    </div>
    <div className="floor-strip">
      <Pill tone="bad">{L(s, 'Breakeven', 'बराबरी')} {inr(e.breakeven)}</Pill>
      <Pill tone="warn">{L(s, 'Target floor', 'लक्ष्य न्यूनतम')} {inr(e.floor)}</Pill>
      {price < e.breakeven && <Pill tone="bad">⚠ {L(s, 'Loss on every order', 'हर ऑर्डर पर घाटा')}</Pill>}
    </div>

    <div className="tabs">{([['menu', 'Price menu', 'दाम मेन्यू'], ['cost', 'True cost', 'असली लागत'], ['buyer', "Buyer's view", 'खरीदार की नज़र']] as const).map(([k, en, hi]) =>
      <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{L(s, en, hi)}</button>)}</div>

    {tab === 'menu' && <>
      <div className="goals">{goals.map(x => (
        <button key={x.g} className={'goal' + (s.goal === x.g && price === recs[x.g] ? ' on' : '')} onClick={() => update(d => { d.goal = x.g; d.price = recs[x.g]; })}>
          <span>{L(s, x.en, x.hi)}</span><b>{inr(recs[x.g])}</b><small>{L(s, x.den, x.dhi)}</small>
        </button>))}</div>
      <Card kicker={L(s, 'Profit per month at each price', 'हर दाम पर महीने का मुनाफ़ा')}>
        <Curve pts={menu.map(x => ({ x: x.p, y: Math.round(x.month) }))} mark={price} floor={Math.round(e.breakeven)} floorLabel={L(s, 'breakeven', 'बराबरी')} />
        <div className="menu-t">
          <div className="mh"><span>{L(s, 'Price', 'दाम')}</span><span>{L(s, 'Orders/wk', 'ऑर्डर/हफ़्ता')}</span><span>{L(s, 'Keep', 'बचत')}</span><span>{L(s, 'Month', 'महीना')}</span></div>
          {menu.map(x => <button key={x.p} className={'mr' + (x.p === price ? ' on' : '') + (x.c < 0 ? ' loss' : '')} onClick={() => setPrice(x.p)}>
            <span>{inr(x.p)}</span><span>{x.o.toFixed(1)}</span><span>{inr(x.c)}</span><span>{inr(x.month)}</span></button>)}
        </div>
        <p className="hint">{L(s, 'Tap any row to try that price.', 'कोई भी पंक्ति दबाकर वह दाम आज़माएं।')}</p>
      </Card>
    </>}

    {tab === 'cost' && <Card kicker={L(s, `Where ${inr(price)} goes, per shipped order`, `${inr(price)} कहां जाता है, हर भेजे ऑर्डर पर`)}>
      <Row k={L(s, `Money received (${Math.round(e.clean * 100)}% of orders kept, after 3% fees)`, `मिला पैसा (${Math.round(e.clean * 100)}% ऑर्डर रखे गए, 3% फ़ीस के बाद)`)} v={inr(e.realised)} />
      <Row k={L(s, 'Product cost (incl. unsellable returns)', 'प्रोडक्ट लागत (न बिकने वाले रिटर्न सहित)')} v={inr(-e.cogs)} tone="bad" />
      <Row k={L(s, 'Forward shipping', 'भेजने का खर्च')} v={inr(-e.fwdC)} tone="bad" />
      <Row k={L(s, 'Return shipping', 'वापसी का खर्च')} v={inr(-e.revC)} tone="bad" />
      <Row k={L(s, 'Packing', 'पैकिंग')} v={inr(-e.pack)} tone="bad" />
      <Row k={L(s, 'Ads', 'विज्ञापन')} v={inr(-e.ads)} tone="bad" />
      <Row k={L(s, 'You keep', 'आपको बचेगा')} v={inr(e.c)} tone={e.c >= 0 ? 'good' : 'bad'} strong />
      <p className="note">{L(s, `Failed deliveries ${Math.round(e.r * 100)}% and returns ${Math.round(e.q * 100)}% are priced in. Shop logic (cost + 30% = ${inr(shop)}) looks fine offline; online it ${shopKeep < 0 ? 'loses ' + inr(-shopKeep) : 'keeps only ' + inr(shopKeep)} per order.`, `फ़ेल डिलीवरी ${Math.round(e.r * 100)}% और रिटर्न ${Math.round(e.q * 100)}% जोड़े गए हैं। दुकान वाला हिसाब (लागत + 30% = ${inr(shop)}) दुकान में ठीक है; ऑनलाइन इस पर हर ऑर्डर पर ${shopKeep < 0 ? inr(-shopKeep) + ' घाटा' : 'सिर्फ़ ' + inr(shopKeep) + ' बचत'} होगी।`)}</p>
    </Card>}

    {tab === 'buyer' && <Card kicker={L(s, 'How buyers see you', 'खरीदार आपको कैसे देखेंगे')}>
      <div className="feed">{rivals.map((p, i) => (
        <div key={i} className={'feed-i' + (i === 2 ? ' me' : '')}><div className="ph" /><b>{inr(p)}</b><small>{i === 2 ? L(s, 'Your listing', 'आपकी लिस्टिंग') : L(s, 'Similar item', 'मिलता-जुलता')}</small></div>))}</div>
      <p className="note strong">{bucketNote(price, s.lang)}</p>
    </Card>}

    <button className="cta" disabled={price < e.breakeven} onClick={() => update(d => { d.price = price; if (d.wentLive) { d.step = 'live'; d.tab = 'home'; } else d.step = 'launch'; })}>
      {s.wentLive ? L(s, `Update listing to ${inr(price)}`, `लिस्टिंग ${inr(price)} पर अपडेट करें`) : L(s, `Use ${inr(price)} and continue`, `${inr(price)} रखें और आगे बढ़ें`)}</button>
    {price < e.breakeven && <p className="warn-line">{L(s, 'Mool Mitra will not let you list below your minimum price.', 'मूल मित्र आपको न्यूनतम दाम से नीचे लिस्ट नहीं करने देगा।')}</p>}
  </>);
}
