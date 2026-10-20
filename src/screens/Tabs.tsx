import { Bell, ChevronRight, MessageCircle, RefreshCw, Plus } from 'lucide-react';
import { titleFor } from '../engine/catalog';
import { CONFIG, econ, FESTIVE } from '../engine/model';
import { autoAccept, inputsOf } from '../engine/sim';
import { navigate } from '../router';
import { active, buzz, inr, L, liveProducts, newProduct, profile, toast, update, useStore, type AppState, type Product } from '../store';
import { ChartArt, ParcelArt } from '../ui/art';
import { Bars } from '../ui/charts';
import { Button, Card, Chip, Empty, LangPill, MoneyTile, Pill, ReceiptRow, Segmented, Thumb } from '../ui/core';
import { alertText, answerAlert, isApparel, keepOf, ProductInfo, WeekStrip } from './common';

// tab app bar: title, language pill and the profile avatar
function TabHeader({ title, sub }: { title: string; sub?: string }) {
  const s = useStore();
  const first = s.seller.name.trim().split(' ')[0] || 'M';
  return (
    <header className="tab-h">
      <div><h1>{title}</h1>{sub && <small>{sub}</small>}</div>
      <LangPill />
      <button className="avatar" onClick={() => profile.set(true)} aria-label={L(s, 'Open profile', 'प्रोफ़ाइल खोलें')}>{first.charAt(0).toUpperCase()}</button>
    </header>
  );
}

const pending = (s: AppState) => s.products.reduce((n, p) => n + p.alerts.filter(a => a.status === 'new').length, 0);

function ProductSwitch() {
  const s = useStore();
  const live = liveProducts(s);
  if (live.length < 2) return null;
  return <div className="chips-row">{live.map(p => <Chip key={p.id} on={p.id === s.activeProductId} onClick={() => update(d => { d.activeProductId = p.id; })}>{titleFor(p.attrs)[s.lang]}</Chip>)}</div>;
}

function ProductCard({ p }: { p: Product }) {
  const s = useStore();
  const e = keepOf(p);
  const used = 20 - p.launchLeft;
  return (
    <button className={'pcard' + (p.id === s.activeProductId ? ' on' : '')} onClick={() => { update(d => { d.activeProductId = p.id; }); navigate('listing'); }}>
      <Thumb attrs={p.attrs} size={60} />
      <span className="pc-b">
        <b>{titleFor(p.attrs)[s.lang]}</b>
        <span className="pc-n">{inr(p.price)} · {L(s, 'min', 'कम से कम')} {inr(e.breakeven)} · {L(s, 'keep', 'बचत')} <em className={e.c >= 0 ? 'gain' : 'loss'}>{inr(e.c)}</em></span>
        {p.launch && <span className="launchbar"><span><i style={{ width: `${(used / 20) * 100}%` }} /></span><small>{p.launchLeft > 0 ? L(s, `${used} of 20 launch orders used`, `20 में से ${used} लॉन्च ऑर्डर हो गए`) : L(s, 'Launch offer complete', 'लॉन्च ऑफ़र पूरा')}</small></span>}
      </span>
      <ChevronRight size={20} aria-hidden="true" />
    </button>
  );
}

// 8.10 Home
export function Home({ onFirstProfit }: { onFirstProfit: () => void }) {
  const s = useStore();
  const live = liveProducts(s);
  const all = live.flatMap(p => p.weeks);
  const orders = all.reduce((n, w) => n + w.orders, 0);
  const profit = all.reduce((n, w) => n + w.profit, 0);
  const lastWeek = all.filter(w => w.week === s.week);
  const n = pending(s);
  const byWeek = Array.from({ length: s.week }, (_, i) => i + 1).map(w => ({ label: 'W' + w, value: all.filter(x => x.week === w).reduce((a, x) => a + x.profit, 0), festive: w >= 5 && w <= 7 })).slice(-8);
  const first = s.seller.name.trim().split(' ')[0] || L(s, 'friend', 'दोस्त');
  return (
    <main className="screen tabscreen">
      <TabHeader title={L(s, `Namaste, ${first} ji 👋`, `नमस्ते, ${first} जी 👋`)} sub={s.seller.shop} />
      <div className="pad">
        <WeekStrip onFirstProfit={onFirstProfit} />
        <div className="tiles3">
          <MoneyTile label={L(s, 'Orders so far', 'अब तक ऑर्डर')} text={String(orders)} />
          <MoneyTile label={L(s, 'Profit so far', 'अब तक मुनाफ़ा')} value={profit} />
          <MoneyTile label={L(s, 'Last week', 'पिछला हफ़्ता')} value={lastWeek.length ? lastWeek.reduce((a, w) => a + w.profit, 0) : undefined}
            caption={lastWeek.length ? L(s, `${lastWeek.reduce((a, w) => a + w.orders, 0)} orders`, `${lastWeek.reduce((a, w) => a + w.orders, 0)} ऑर्डर`) : undefined} />
        </div>
        {n > 0 && <button className="alert-banner" onClick={() => navigate('alerts')}><Bell size={20} aria-hidden="true" />
          <span>{L(s, `${n} Mool Mitra alert${n > 1 ? 's' : ''} need${n > 1 ? '' : 's'} your OK`, `${n} मूल मित्र अलर्ट आपकी हां का इंतज़ार कर रहे हैं`)}</span><ChevronRight size={20} aria-hidden="true" /></button>}
        {live.map(p => <ProductCard key={p.id} p={p} />)}
        {s.week === 0 ? <Empty art={<ParcelArt size={110} />} text={L(s, 'Your shop is live. Tap Next week to see your first orders.', 'आपकी दुकान लाइव है। पहले ऑर्डर देखने के लिए "अगला हफ़्ता" दबाएं।')} />
          : <Card title={L(s, 'Profit by week', 'हर हफ़्ते का मुनाफ़ा')}>
            <Bars data={byWeek} label={L(s, 'Bar chart of profit by week', 'हर हफ़्ते के मुनाफ़े का चार्ट')} />
            <p className="legend"><i className="lg-plum" />{L(s, 'Normal week', 'आम हफ़्ता')} <i className="lg-gain" />{L(s, 'Diwali week', 'दिवाली हफ़्ता')} <i className="lg-loss" />{L(s, 'Loss', 'घाटा')}</p>
          </Card>}
      </div>
    </main>
  );
}

// 8.11 Hisaab
export function Hisaab() {
  const s = useStore();
  const p = active(s);
  const w = p.weeks.at(-1);
  if (!w) return (
    <main className="screen tabscreen"><TabHeader title={L(s, 'Hisaab', 'हिसाब')} />
      <div className="pad"><ProductSwitch /><Empty art={<ChartArt />} text={L(s, 'No orders yet. Tap Next week on Home.', 'अभी कोई ऑर्डर नहीं। होम पर "अगला हफ़्ता" दबाएं।')}
        action={<Button variant="ghost" onClick={() => navigate('home')}>{L(s, 'Go to Home', 'होम पर जाएं')}</Button>} /></div></main>);
  const e = econ(w.price, inputsOf(p), CONFIG, w.festive ? FESTIVE : {});
  const realRet = Math.max(0, Math.round(100 * (w.returned / w.orders - e.r)));
  const assumed = Math.round(e.q * 100);
  const msg = L(s,
    `${s.seller.shop} · Week ${w.week} on Meesho\n${w.orders} orders, ${w.kept} kept by buyers\nMoney received ${inr(w.received)}\nProfit ${inr(w.profit)}\n— via Mool Mitra (demo)`,
    `${s.seller.shop} · मीशो पर ${w.week}वां हफ़्ता\n${w.orders} ऑर्डर, ${w.kept} खरीदारों ने रखे\nमिला पैसा ${inr(w.received)}\nमुनाफ़ा ${inr(w.profit)}\n— मूल मित्र से (डेमो)`);
  return (
    <main className="screen tabscreen">
      <TabHeader title={L(s, 'Hisaab', 'हिसाब')} sub={titleFor(p.attrs)[s.lang]} />
      <div className="pad">
        <ProductSwitch />
        <div className={'hisaab-hero ' + (w.profit >= 0 ? 'gain' : 'loss')}>
          <span>{L(s, `Week ${w.week} · You kept`, `${w.week}वां हफ़्ता · आपको बचा`)}{w.festive ? ' 🪔' : ''}</span>
          <b>{inr(w.profit)}</b>
          <small>{w.profit >= 0 ? L(s, 'Profit', 'मुनाफ़ा') : L(s, 'Loss', 'घाटा')}</small>
        </div>
        <Card title={L(s, 'This week, rupee by rupee', 'इस हफ़्ते का पूरा हिसाब')}>
          <ReceiptRow plain label={L(s, `Orders kept by buyers (of ${w.orders})`, `खरीदारों ने रखे (${w.orders} में से)`)} value={w.kept} />
          <ReceiptRow label={L(s, 'Money received (after 3% fees)', 'मिला पैसा (3% फ़ीस के बाद)')} value={w.received} />
          <ReceiptRow label={L(s, 'Making cost', 'बनाने का खर्च')} value={w.making} minus />
          <ReceiptRow label={L(s, 'Shipping, returns, packing, ads', 'शिपिंग, रिटर्न, पैकिंग, विज्ञापन')} value={w.costs} minus />
          {w.launchShare > 0 && <ReceiptRow label={L(s, 'Your share of the launch offer', 'लॉन्च ऑफ़र में आपका हिस्सा')} value={w.launchShare} minus />}
          <ReceiptRow label={L(s, 'Profit', 'मुनाफ़ा')} value={w.profit} total />
        </Card>
        <Card tone={realRet <= assumed ? 'green' : 'pink'} title={L(s, 'Returns check', 'रिटर्न जांच')}>
          <p className="small">{L(s, `Actual returns ≈ ${realRet}% (we assumed ${assumed}%).`, `असल रिटर्न ≈ ${realRet}% (हमने ${assumed}% माना था)।`)}{' '}
            <b>{realRet < assumed ? L(s, 'Your minimum price will come down.', 'आपका कम से कम दाम घटेगा।') : L(s, 'Add a size chart.', 'साइज़ चार्ट जोड़ें।')}</b></p>
        </Card>
        <a className="btn wa full" href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" onClick={buzz}>
          <MessageCircle size={20} aria-hidden="true" />{L(s, 'Share on WhatsApp', 'WhatsApp पर भेजें')}</a>
        <Card title={L(s, 'All weeks', 'सभी हफ़्ते')}>
          <ul className="passbook">
            {[...p.weeks].reverse().map(x => (
              <li key={x.week}>
                <span className="pb-w">{L(s, `Week ${x.week}`, `हफ़्ता ${x.week}`)}{x.festive ? ' 🪔' : ''}<small>{inr(x.price)} · {x.orders} {L(s, 'orders', 'ऑर्डर')}</small></span>
                <b className={x.profit >= 0 ? 'gain' : 'loss'}>{x.profit >= 0 ? '+' : ''}{inr(x.profit)}</b>
              </li>))}
          </ul>
        </Card>
      </div>
    </main>
  );
}

// 8.12 Alerts
export function Alerts() {
  const s = useStore();
  const items = s.products.flatMap(p => p.alerts.map(a => ({ p, a }))).sort((x, y) => y.a.week - x.a.week);
  const be = keepOf(active(s)).breakeven;
  return (
    <main className="screen tabscreen">
      <TabHeader title={L(s, 'Alerts', 'अलर्ट')} />
      <div className="pad">
        <Card title={L(s, 'How should prices change?', 'दाम कैसे बदलें?')}>
          <Segmented label={L(s, 'Price mode', 'दाम मोड')} value={s.mode} onChange={m => update(d => { d.mode = m; if (m === 'auto') autoAccept(d); })}
            options={[['ask', L(s, 'Ask me first', 'पहले मुझसे पूछें')], ['auto', L(s, 'Auto within limits', 'सीमा में अपने-आप')]]} />
          <p className="hint">{L(s, `Never below ${inr(be)}. At most one alert a day.`, `कभी ${inr(be)} से नीचे नहीं। दिन में ज़्यादा से ज़्यादा एक अलर्ट।`)}</p>
        </Card>
        {items.length === 0 && <Empty art={<ChartArt />} text={L(s, 'No alerts yet. They arrive as weeks pass.', 'अभी कोई अलर्ट नहीं। हफ़्ते बीतने पर आएंगे।')} />}
        {items.map(({ p, a }) => {
          const x = alertText(s, p, a);
          return (
            <article key={a.id} className={'alert ' + a.status}>
              <div className="al-h"><Pill tone="wa">WhatsApp</Pill><small>{L(s, `Week ${a.week}`, `हफ़्ता ${a.week}`)}{liveProducts(s).length > 1 ? ' · ' + titleFor(p.attrs)[s.lang] : ''}</small></div>
              <h2>{x.t}</h2>
              <p>{x.b}</p>
              {x.stake > 0 && a.status === 'new' && <p className="stake">{L(s, `At stake: ${inr(x.stake)} per order`, `दांव पर: हर ऑर्डर पर ${inr(x.stake)}`)}</p>}
              {a.status === 'new'
                ? <div className="al-b"><Button size="sm" onClick={() => answerAlert(p, a, true)}>{x.yes}</Button><Button size="sm" variant="ghost" onClick={() => answerAlert(p, a, false)}>{x.no}</Button></div>
                : <Pill tone={a.status === 'accepted' ? 'gain' : 'plum'}>{a.status === 'accepted' ? '✓ ' + L(s, 'Done', 'हो गया') : L(s, 'Ignored', 'छोड़ दिया')}</Pill>}
            </article>);
        })}
      </div>
    </main>
  );
}

// 8.13 Listing
export function Listing() {
  const s = useStore();
  const p = active(s);
  const e = keepOf(p);
  const launchOn = p.launch && p.launchLeft > 0;
  const addSizeChart = () => {
    if (p.sizeChart) return;
    const before = e.breakeven;
    update(d => { active(d).sizeChart = true; });
    toast.show(isApparel(p.attrs) ? L(s, `Size chart added · minimum ${inr(before)} → ${inr(econ(p.price, { ...inputsOf(p), sizeChart: true }).breakeven)}`, `साइज़ चार्ट जुड़ गया · कम से कम दाम ${inr(before)} → ${inr(econ(p.price, { ...inputsOf(p), sizeChart: true }).breakeven)}`)
      : L(s, `Photos & size added · minimum ${inr(before)} → ${inr(econ(p.price, { ...inputsOf(p), sizeChart: true }).breakeven)}`, `फ़ोटो और नाप जुड़ गए · कम से कम दाम ${inr(before)} → ${inr(econ(p.price, { ...inputsOf(p), sizeChart: true }).breakeven)}`));
  };
  const addProduct = () => { const np = newProduct(); update(d => { d.products.push(np); d.activeProductId = np.id; }); navigate('product'); };
  return (
    <main className="screen tabscreen">
      <TabHeader title={L(s, 'Listing', 'लिस्टिंग')} />
      <div className="pad">
        <ProductSwitch />
        <div className="listing-hero">
          <Thumb attrs={p.attrs} size={130} />
          <div>
            <b>{titleFor(p.attrs)[s.lang]}</b>
            <p className="lh-price">{launchOn ? <><s>{inr(p.price)}</s> <span>{inr(p.price - 50)}</span></> : <span>{inr(p.price)}</span>}</p>
            {launchOn && <Pill tone="saffron">{L(s, `Launch offer · ${p.launchLeft} left`, `लॉन्च ऑफ़र · ${p.launchLeft} बाकी`)}</Pill>}
          </div>
        </div>
        <Card title={L(s, 'Price guard', 'दाम की सुरक्षा')}>
          <ReceiptRow plain label={L(s, 'Current price', 'अभी का दाम')} value={inr(p.price)} />
          <ReceiptRow plain label={L(s, 'Breakeven (no loss)', 'कम से कम दाम (बिना घाटा)')} value={inr(e.breakeven)} />
          <ReceiptRow plain label={L(s, 'Target floor', 'सही न्यूनतम दाम')} value={inr(e.floor)} />
          <button className="rrow tap" onClick={addSizeChart} disabled={p.sizeChart}>
            <span>{isApparel(p.attrs) ? L(s, 'Size chart + real photos', 'साइज़ चार्ट + असली फ़ोटो') : L(s, 'Real photos + exact size', 'असली फ़ोटो + सही नाप')}{!p.sizeChart && <small>{L(s, 'Tap to add · lowers your minimum', 'जोड़ने के लिए दबाएं · कम से कम दाम घटेगा')}</small>}</span>
            <b className={p.sizeChart ? 'gain' : 'loss'}>{p.sizeChart ? '✓ ' + L(s, 'Added', 'जुड़ा') : '✕ ' + L(s, 'Missing', 'नहीं है')}</b>
          </button>
        </Card>
        <ProductInfo attrs={p.attrs} />
        <Button full variant="ghost" onClick={() => navigate('floor')}><RefreshCw size={18} aria-hidden="true" />{L(s, 'Re-check price', 'दाम दोबारा जांचें')}</Button>
        <Button full variant="text" onClick={addProduct}><Plus size={18} aria-hidden="true" />{L(s, 'Add another product', 'एक और सामान जोड़ें')}</Button>
      </div>
    </main>
  );
}
