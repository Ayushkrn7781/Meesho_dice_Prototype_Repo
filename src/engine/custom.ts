// Seller-defined products: industries, sub-types and a formatter that turns whatever was typed
// into the same tidy listing shape, so every product reads alike.
import type { Attrs, Bi } from './catalog';

export interface Industry { id: string; en: string; hi: string; icon: string; median: number; apparel?: boolean; subs: [string, string][] }

// median = simulated typical price of similar items on the marketplace (₹); the seller can change it
export const INDUSTRIES: Industry[] = [
  { id: 'women', en: "Women's fashion", hi: 'महिलाओं के कपड़े', icon: '👗', median: 349, apparel: true, subs: [['Kurtis & kurtas', 'कुर्ती और कुर्ते'], ['Sarees', 'साड़ी'], ['Dress materials', 'ड्रेस मटीरियल'], ['Dupattas', 'दुपट्टे'], ['Tops & tunics', 'टॉप और ट्यूनिक'], ['Dresses', 'ड्रेस'], ['Leggings & pants', 'लेगिंग और पैंट'], ['Nightwear', 'नाइटवियर']] },
  { id: 'men', en: "Men's fashion", hi: 'पुरुषों के कपड़े', icon: '👔', median: 399, apparel: true, subs: [['T-shirts', 'टी-शर्ट'], ['Shirts', 'शर्ट'], ['Kurtas', 'कुर्ते'], ['Jeans & trousers', 'जींस और पैंट'], ['Ethnic jackets', 'एथनिक जैकेट'], ['Innerwear', 'इनरवियर']] },
  { id: 'kids', en: 'Kids & baby', hi: 'बच्चे और शिशु', icon: '🧸', median: 299, apparel: true, subs: [["Kids' clothing", 'बच्चों के कपड़े'], ['Baby essentials', 'शिशु का सामान'], ['Toys & games', 'खिलौने'], ['School supplies', 'स्कूल का सामान']] },
  { id: 'footwear', en: 'Footwear', hi: 'जूते-चप्पल', icon: '👟', median: 349, apparel: true, subs: [["Women's sandals", 'महिलाओं की सैंडल'], ["Men's shoes", 'पुरुषों के जूते'], ['Slippers & flip-flops', 'चप्पल'], ["Kids' footwear", 'बच्चों के जूते']] },
  { id: 'bags', en: 'Bags & accessories', hi: 'बैग और एक्सेसरी', icon: '👜', median: 399, subs: [['Handbags', 'हैंडबैग'], ['Wallets', 'पर्स'], ['Belts', 'बेल्ट'], ['Sunglasses', 'धूप का चश्मा'], ['Watches', 'घड़ियां']] },
  { id: 'jewellery', en: 'Jewellery', hi: 'ज्वेलरी', icon: '💍', median: 249, subs: [['Earrings', 'झुमके और बालियां'], ['Necklace sets', 'हार सेट'], ['Bangles & bracelets', 'चूड़ियां और ब्रेसलेट'], ['Rings', 'अंगूठी'], ['Anklets', 'पायल']] },
  { id: 'beauty', en: 'Beauty & personal care', hi: 'ब्यूटी और पर्सनल केयर', icon: '💄', median: 249, subs: [['Makeup', 'मेकअप'], ['Skincare', 'स्किनकेयर'], ['Hair care', 'बालों की देखभाल'], ['Fragrances', 'खुशबू']] },
  { id: 'decor', en: 'Home décor', hi: 'घर की सजावट', icon: '🪔', median: 349, subs: [['Wall décor', 'दीवार की सजावट'], ['Showpieces & idols', 'शोपीस और मूर्तियां'], ['Candles & diyas', 'मोमबत्ती और दीये'], ['Artificial flowers', 'नकली फूल'], ['Lights & lamps', 'लाइट और लैंप']] },
  { id: 'furnishing', en: 'Home furnishing', hi: 'होम फ़र्निशिंग', icon: '🛏️', median: 499, subs: [['Bedsheets', 'चादर'], ['Cushion covers', 'कुशन कवर'], ['Curtains', 'पर्दे'], ['Rugs & mats', 'दरी और मैट'], ['Blankets & quilts', 'कंबल और रजाई']] },
  { id: 'kitchen', en: 'Kitchen & dining', hi: 'रसोई और डाइनिंग', icon: '🍳', median: 349, subs: [['Cookware', 'बर्तन'], ['Storage containers', 'डिब्बे'], ['Dinnerware', 'डिनर सेट'], ['Kitchen tools', 'रसोई के औज़ार']] },
  { id: 'basics', en: 'Home basics', hi: 'घर का ज़रूरी सामान', icon: '🧺', median: 249, subs: [['Storage & organisers', 'स्टोरेज और ऑर्गनाइज़र'], ['Cleaning supplies', 'सफ़ाई का सामान'], ['Bathroom accessories', 'बाथरूम का सामान'], ['Laundry', 'कपड़े धोने का सामान']] },
  { id: 'electronics', en: 'Electronics accessories', hi: 'इलेक्ट्रॉनिक्स एक्सेसरी', icon: '🔌', median: 199, subs: [['Mobile covers', 'मोबाइल कवर'], ['Chargers & cables', 'चार्जर और केबल'], ['Earphones', 'ईयरफ़ोन'], ['Smart gadgets', 'स्मार्ट गैजेट']] },
  { id: 'sports', en: 'Sports & fitness', hi: 'खेल और फ़िटनेस', icon: '🏏', median: 399, subs: [['Yoga mats', 'योगा मैट'], ['Gym equipment', 'जिम का सामान'], ['Sportswear', 'स्पोर्ट्स कपड़े']] },
  { id: 'stationery', en: 'Stationery & office', hi: 'स्टेशनरी और ऑफ़िस', icon: '✏️', median: 199, subs: [['Notebooks & diaries', 'कॉपी और डायरी'], ['Pens & art supplies', 'पेन और आर्ट का सामान'], ['Office supplies', 'ऑफ़िस का सामान']] },
  { id: 'pets', en: 'Pet supplies', hi: 'पालतू जानवरों का सामान', icon: '🐾', median: 299, subs: [['Pet food bowls', 'खाने के बर्तन'], ['Collars & leashes', 'पट्टे'], ['Pet beds & toys', 'बिस्तर और खिलौने']] },
  { id: 'other', en: 'Something else', hi: 'कुछ और', icon: '📦', median: 299, subs: [] },
];
export const industryOf = (id?: string) => INDUSTRIES.find(i => i.id === id) ?? INDUSTRIES[INDUSTRIES.length - 1];

export interface CustomForm { industry: string; sub: string; name: string; material: string; colour: string; size: string; pack: number; desc: string; cost: number; median: number }

const SMALL = new Set(['and', 'or', 'of', 'for', 'with', 'in', 'on', 'the', 'a', 'an', 'to', 'by']);
const CODES = new Set(['LED', 'USB', 'LCD', 'TV', 'HD', 'PU', 'PVC', 'MDF', 'UV', 'BT', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'GSM', 'ML', 'KG', 'MM', 'CM', 'IN', 'COD']);
const clean = (t: string) => t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/[!*_~#|]+/g, ' ').replace(/\s+/g, ' ').trim();
// Title Case for Latin words (keeps codes like LED, XL or 3XL); Devanagari is left as typed
export function titleCase(t: string) {
  return clean(t).split(' ').filter(Boolean).map((w, i) => {
    if (!/[a-z]/i.test(w)) return w;
    const lw = w.toLowerCase();
    if (i > 0 && SMALL.has(lw)) return lw;
    if (CODES.has(w) || (/\d/.test(w) && /^[A-Za-z0-9-]+$/.test(w))) return w.toUpperCase();
    return lw.charAt(0).toUpperCase() + lw.slice(1);
  }).join(' ');
}
const sentence = (t: string) => { const c = clean(t); if (!c) return ''; const s = c.charAt(0).toUpperCase() + c.slice(1); return /[.!?।]$/.test(s) ? s : s + '.'; };
// drop words already said earlier in the title ("Blue Cotton Blue Cotton Bedsheet" → "Blue Cotton Bedsheet")
const dedupe = (words: string[]) => words.filter((w, i) => words.findIndex(x => x.toLowerCase() === w.toLowerCase()) === i);

// preset sub-types are already well written; only a typed-in "Other…" sub-type gets tidied
const subOf = (f: CustomForm) => (industryOf(f.industry).subs.some(([en]) => en === f.sub) ? f.sub : titleCase(f.sub));

export interface Listing { title: string; highlights: [Bi, string][]; description: string }

// read the raw form and present it as a standard listing: same order, same casing, same fields for every product
export function formatListing(f: CustomForm, lang: 'en' | 'hi' = 'en'): Listing {
  const ind = industryOf(f.industry);
  const sub = subOf(f);
  const name = titleCase(f.name);
  const head = dedupe([titleCase(f.colour), titleCase(f.material), name].join(' ').split(' ').filter(Boolean)).join(' ');
  const pack = f.pack > 1 ? ` (Pack of ${f.pack})` : '';
  let title = head + pack;
  if (title.length > 70) title = title.slice(0, 67).replace(/\s+\S*$/, '') + '…';
  const highlights: [Bi, string][] = [];
  highlights.push([{ en: 'Category', hi: 'श्रेणी' }, `${ind[lang]}${sub ? ' › ' + sub : ''}`]);
  if (f.material.trim()) highlights.push([{ en: 'Material', hi: 'मटीरियल' }, titleCase(f.material)]);
  if (f.colour.trim()) highlights.push([{ en: 'Colour', hi: 'रंग' }, titleCase(f.colour)]);
  if (f.size.trim()) highlights.push([{ en: 'Size', hi: 'साइज़' }, clean(f.size)]);   // sizes are codes ("16 x 16 in", "XL"): spacing only
  highlights.push([{ en: 'Pack of', hi: 'पैक में' }, String(Math.max(1, f.pack))]);
  const description = sentence(f.desc) || sentence(`${head}${sub ? ` in ${sub.toLowerCase()}` : ''}${f.material.trim() ? `, made of ${titleCase(f.material).toLowerCase()}` : ''}`);
  return { title, highlights, description };
}

// attrs saved on a product; `fmt` marks a formatted listing vs. one kept exactly as typed
export function attrsFromForm(f: CustomForm, formatted: boolean): Attrs {
  const l = formatted ? formatListing(f) : null;
  const tidy = (t: string) => (formatted ? titleCase(t) : t.trim());
  return {
    custom: '1', fmt: formatted ? '1' : '', industry: f.industry, sub: formatted ? subOf(f) : f.sub.trim(), name: tidy(f.name), material: tidy(f.material), colour: tidy(f.colour),
    size: l ? (l.highlights.find(([k]) => k.en === 'Size')?.[1] ?? '') : f.size.trim(), pack: String(Math.max(1, f.pack)),
    desc: l ? l.description : f.desc.trim(), cost: String(f.cost), median: String(f.median),
    title: l ? l.title : (f.name.trim() || 'My product'),
  };
}
export const formFromAttrs = (a: Attrs): CustomForm => ({
  industry: a.industry ?? '', sub: a.sub ?? '', name: a.name ?? '', material: a.material ?? '', colour: a.colour ?? '', size: a.size ?? '',
  pack: Number(a.pack) || 1, desc: a.desc ?? '', cost: Number(a.cost) || 0, median: Number(a.median) || industryOf(a.industry).median,
});

// tint for the thumbnail from a typed colour word, if we recognise one
const TINTS: [RegExp, string, string][] = [
  [/white|off.?white|cream|safed|सफ़ेद|सफेद/i, '#fbfaf6', '#9b8f7a'], [/pink|rose|gulabi|गुलाबी/i, '#f6c9d9', '#a3245e'], [/blue|navy|sky|neela|नीला/i, '#cfe0f2', '#2f5d8a'],
  [/green|mint|hara|हरा/i, '#d8efe4', '#2d6b4f'], [/yellow|mustard|peela|पीला/i, '#fde9a8', '#b45309'], [/red|maroon|laal|लाल|मैरून/i, '#e7b8c4', '#7a1630'],
  [/black|kala|काला/i, '#4a4450', '#e8d9a8'], [/brown|wood|beige|bhura|भूरा/i, '#ead7c3', '#7a4a1e'], [/gold|golden|sunehra/i, '#f7e2a8', '#8a5300'],
  [/grey|gray|silver|slate/i, '#e1e1e6', '#4a4a55'], [/purple|lavender|violet|baingani/i, '#e2d4f2', '#5b3a8a'], [/orange|peach|narangi/i, '#fbd9bd', '#a8501a'],
];
export function tintOf(colour = ''): [string, string] {
  const m = TINTS.find(([re]) => re.test(colour));
  return m ? [m[1], m[2]] : ['#FFF4E5', '#8A5300'];
}
