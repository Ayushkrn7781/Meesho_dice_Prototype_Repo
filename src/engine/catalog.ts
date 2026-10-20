// Sequential product-detail questions. Each step's options can depend on earlier answers.
export interface Bi { en: string; hi: string }

export type Attrs = Record<string, string>;
export interface Opt { id: string; en: string; hi: string }
export interface Step { key: string; label: Bi; options: (a: Attrs) => Opt[]; skip?: (a: Attrs) => boolean }

const o = (id: string, en: string, hi: string): Opt => ({ id, en, hi });

export const STEPS: Step[] = [
  { key: 'category', label: { en: 'Category', hi: 'श्रेणी' }, options: () => [o('kurti', 'Kurti', 'कुर्ती'), o('set', 'Kurta set', 'कुर्ता सेट'), o('dupatta', 'Dupatta / stole', 'दुपट्टा / स्टोल')] },
  { key: 'style', label: { en: 'Style', hi: 'स्टाइल' }, options: a => a.category === 'dupatta' ? [o('dupatta', 'Dupatta (2.25 m)', 'दुपट्टा (2.25 मी)'), o('stole', 'Stole (1.8 m)', 'स्टोल (1.8 मी)')]
      : a.category === 'set' ? [o('palazzo', 'Kurta + palazzo', 'कुर्ता + प्लाज़ो'), o('three', 'Kurta + pant + dupatta', 'कुर्ता + पैंट + दुपट्टा')]
      : [o('straight', 'Straight', 'सीधी'), o('anarkali', 'Anarkali', 'अनारकली'), o('aline', 'A-line', 'ए-लाइन'), o('short', 'Short kurti', 'छोटी कुर्ती')] },
  { key: 'fabric', label: { en: 'Fabric', hi: 'कपड़ा' }, options: a => a.category === 'dupatta'
      ? [o('georgette', 'Georgette', 'जॉर्जेट'), o('chiffon', 'Chiffon', 'शिफ़ॉन'), o('cotton', 'Cotton', 'कॉटन'), o('chanderi', 'Chanderi', 'चंदेरी')]
      : [o('cotton', 'Cotton', 'कॉटन'), o('mul', 'Mul cotton', 'मलमल कॉटन'), o('georgette', 'Georgette', 'जॉर्जेट'), o('rayon', 'Rayon', 'रेयॉन'), o('chanderi', 'Chanderi', 'चंदेरी')] },
  { key: 'work', label: { en: 'Work / design', hi: 'काम / डिज़ाइन' }, options: a => a.fabric === 'rayon'
      ? [o('block', 'Block print', 'ब्लॉक प्रिंट'), o('machine', 'Machine chikankari', 'मशीन चिकनकारी'), o('plain', 'Plain / solid', 'सादा')]
      : [o('hand', 'Hand chikankari', 'हाथ की चिकनकारी'), o('mukaish', 'Chikankari + mukaish', 'चिकनकारी + मुकैश'), o('machine', 'Machine chikankari', 'मशीन चिकनकारी'), o('block', 'Block print', 'ब्लॉक प्रिंट'), o('plain', 'Plain / solid', 'सादा')] },
  { key: 'sleeve', label: { en: 'Sleeve', hi: 'आस्तीन' }, skip: a => a.category === 'dupatta', options: () => [o('34', '3/4 sleeve', '3/4 आस्तीन'), o('full', 'Full sleeve', 'पूरी आस्तीन'), o('short', 'Short sleeve', 'छोटी आस्तीन'), o('none', 'Sleeveless', 'बिना आस्तीन')] },
  { key: 'neck', label: { en: 'Neck', hi: 'गला' }, skip: a => a.category === 'dupatta', options: () => [o('round', 'Round neck', 'गोल गला'), o('v', 'V-neck', 'वी-नेक'), o('mandarin', 'Mandarin collar', 'मैंडरिन कॉलर'), o('boat', 'Boat neck', 'बोट नेक')] },
  { key: 'colour', label: { en: 'Main colour', hi: 'मुख्य रंग' }, options: () => [o('white', 'White', 'सफ़ेद'), o('pink', 'Pink', 'गुलाबी'), o('sky', 'Sky blue', 'आसमानी'), o('mint', 'Mint green', 'मिंट हरा'), o('yellow', 'Yellow', 'पीला'), o('maroon', 'Maroon', 'मैरून'), o('black', 'Black', 'काला')] },
  { key: 'sizes', label: { en: 'Sizes', hi: 'साइज़' }, options: a => a.category === 'dupatta' ? [o('free', 'Free size', 'फ़्री साइज़')] : [o('sxl', 'S to XL', 'S से XL'), o('sxxl', 'S to XXL', 'S से XXL'), o('mxxxl', 'M to 3XL', 'M से 3XL')] },
];

export function activeSteps(a: Attrs) { return STEPS.filter(s => !s.skip?.(a)); }
// a seller-defined product (from the "Add your own product" sheet) carries attrs.custom = '1'
export const isCustom = (a: Attrs) => a.custom === '1';
export function isComplete(a: Attrs) { return isCustom(a) ? !!(a.industry && a.name) : activeSteps(a).every(s => !!a[s.key]); }
export function labelOf(key: string, id: string, a: Attrs, lang: 'en' | 'hi') {
  const st = STEPS.find(s => s.key === key); const op = st?.options(a).find(x => x.id === id);
  return op ? op[lang] : id;
}

// estimated making cost and packed weight from the answers
export function estimate(a: Attrs) {
  if (isCustom(a)) return { cost: Number(a.cost) || 0, weight: 400 };
  const base: Record<string, number> = { straight: 170, anarkali: 300, aline: 210, short: 140, palazzo: 330, three: 420, dupatta: 90, stole: 75 };
  const fab: Record<string, number> = { cotton: 1, mul: 1.05, georgette: 1.15, rayon: 0.7, chanderi: 1.2, chiffon: 1.05 };
  const work: Record<string, number> = { hand: 70, mukaish: 160, machine: 15, block: 10, plain: 0 };
  const wt: Record<string, number> = { straight: 350, anarkali: 500, aline: 380, short: 250, palazzo: 600, three: 750, dupatta: 200, stole: 150 };
  const cost = Math.round(((base[a.style] ?? 190) * (fab[a.fabric] ?? 1) + (work[a.work] ?? 0)) / 5) * 5;
  return { cost, weight: wt[a.style] ?? 350 };
}

// which simulated market (design) these answers compete in
export function designFor(a: Attrs) {
  if (isCustom(a)) return 'custom';
  if (a.category === 'dupatta') return 'dupatta-chikan';
  if (a.style === 'anarkali' || a.category === 'set' || a.work === 'mukaish') return 'kurti-anarkali';
  if (a.work === 'block' || a.work === 'plain' || a.fabric === 'rayon') return 'kurti-printed';
  return 'kurti-chikan';
}

export function titleFor(a: Attrs): Bi {
  if (isCustom(a)) return { en: a.title || a.name, hi: a.title || a.name };
  const L = (k: string, lang: 'en' | 'hi') => (a[k] ? labelOf(k, a[k], a, lang) : '');
  const workEn = a.work === 'plain' ? '' : L('work', 'en');
  const en = [L('colour', 'en'), workEn, L('fabric', 'en'), a.category === 'dupatta' ? L('style', 'en').replace(/ \(.*\)/, '') : L('style', 'en'), a.category === 'kurti' && a.style !== 'short' ? 'kurti' : ''].filter(Boolean).join(' ');
  const hi = [L('colour', 'hi'), a.work === 'plain' ? '' : L('work', 'hi'), L('fabric', 'hi'), L('style', 'hi').replace(/ \(.*\)/, ''), a.category === 'kurti' && a.style !== 'short' ? 'कुर्ती' : ''].filter(Boolean).join(' ');
  return { en: en.charAt(0).toUpperCase() + en.slice(1).toLowerCase(), hi };
}

const COLOURS: Record<string, [string, string, string]> = {
  white: ['#fbfaf6', '#9b8f7a', '#ece6dc'], pink: ['#f6c9d9', '#a3245e', '#f6eaf0'], sky: ['#cfe0f2', '#2f5d8a', '#e8eef5'],
  mint: ['#d8efe4', '#2d6b4f', '#eef8f2'], yellow: ['#fde9a8', '#b45309', '#fff8e6'], maroon: ['#e7b8c4', '#7a1630', '#f7e9ee'], black: ['#4a4450', '#e8d9a8', '#ecebee'],
};
export function colourOf(a: Attrs) { return COLOURS[a.colour] ?? COLOURS.white; }

// emoji shown next to each option in the one-question-at-a-time picker
const ICONS: Record<string, string> = {
  kurti: '👗', set: '👘', dupatta: '🧣', straight: '📏', anarkali: '💃', aline: '🔺', short: '👚', palazzo: '👖', three: '🎁', stole: '🧣',
  cotton: '🌿', mul: '☁️', georgette: '✨', rayon: '🧵', chanderi: '🌟', chiffon: '🪶',
  hand: '🪡', mukaish: '💎', machine: '⚙️', block: '🟫', plain: '⬜',
  '34': '💪', full: '🧥', none: '🎽', round: '⭕', v: '🔻', mandarin: '👔', boat: '⛵',
  sxl: '📐', sxxl: '📐', mxxxl: '📐', free: '♾️',
};
export const iconFor = (id: string) => ICONS[id] ?? '•';

// swatch colours for the colour question
export const SWATCH: Record<string, string> = { white: '#FFFFFF', pink: '#F4A6C0', sky: '#8FB8E3', mint: '#9FD9BF', yellow: '#F7D154', maroon: '#7A1630', black: '#26222A' };
