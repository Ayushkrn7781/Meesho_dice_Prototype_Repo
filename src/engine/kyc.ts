// Seller KYC checks (format only — this demo verifies nothing with any authority).
// Only masked values are ever stored on the phone.

// Verhoeff checksum, the scheme Aadhaar numbers use for their last digit
const D = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]];
const P = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]];
const INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];
const verhoeff = (num: string) => num.split('').reverse().reduce((c, d, i) => D[c][P[i % 8][Number(d)]], 0);
function verhoeffDigit(num: string) { let c = 0; num.split('').reverse().forEach((d, i) => { c = D[c][P[(i + 1) % 8][Number(d)]]; }); return INV[c]; }

export const digits = (s: string) => s.replace(/\D/g, '');
export const validAadhaar = (s: string) => { const d = digits(s); return /^[2-9]\d{11}$/.test(d) && verhoeff(d) === 0; };
/** a checksum-valid sample number for demos (not a real person's Aadhaar) */
export const sampleAadhaar = () => { const base = '23456789012'.slice(0, 11); return base + verhoeffDigit(base); };
export const fmtAadhaar = (s: string) => digits(s).slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ');

export const validPAN = (s: string) => /^[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]$/.test(s.toUpperCase().trim());
export const validGSTIN = (s: string) => /^\d{2}[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(s.toUpperCase().trim());
export const validIFSC = (s: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(s.toUpperCase().trim());
export const validAccount = (s: string) => /^\d{9,18}$/.test(digits(s)) && digits(s) === s.replace(/\s/g, '');
export const validPincode = (s: string) => /^[1-9]\d{5}$/.test(s.trim());
export const validEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s.trim());

export const maskAadhaar = (s: string) => 'XXXX XXXX ' + digits(s).slice(-4);
export const maskPAN = (s: string) => { const p = s.toUpperCase().trim(); return p.slice(0, 3) + '•••••' + p.slice(-2); };
export const maskAccount = (s: string) => '••••••' + digits(s).slice(-4);

const BANKS: Record<string, string> = {
  SBIN: 'State Bank of India', HDFC: 'HDFC Bank', ICIC: 'ICICI Bank', PUNB: 'Punjab National Bank', BARB: 'Bank of Baroda', UBIN: 'Union Bank of India',
  CNRB: 'Canara Bank', UTIB: 'Axis Bank', KKBK: 'Kotak Mahindra Bank', IDIB: 'Indian Bank', BKID: 'Bank of India', IOBA: 'Indian Overseas Bank', YESB: 'Yes Bank', INDB: 'IndusInd Bank',
};
export const bankFor = (ifsc: string) => BANKS[ifsc.toUpperCase().slice(0, 4)] ?? '';

// pincode → state from the first two digits (postal circles), plus the GST state code
const PIN: [number, number, string, string][] = [
  [11, 11, 'Delhi', '07'], [12, 13, 'Haryana', '06'], [14, 16, 'Punjab', '03'], [17, 17, 'Himachal Pradesh', '02'], [18, 19, 'Jammu & Kashmir', '01'],
  [20, 23, 'Uttar Pradesh', '09'], [24, 24, 'Uttarakhand', '05'], [25, 28, 'Uttar Pradesh', '09'], [30, 34, 'Rajasthan', '08'], [36, 39, 'Gujarat', '24'],
  [40, 44, 'Maharashtra', '27'], [45, 48, 'Madhya Pradesh', '23'], [49, 49, 'Chhattisgarh', '22'], [50, 50, 'Telangana', '36'], [51, 53, 'Andhra Pradesh', '37'],
  [56, 59, 'Karnataka', '29'], [60, 64, 'Tamil Nadu', '33'], [67, 69, 'Kerala', '32'], [70, 74, 'West Bengal', '19'], [75, 77, 'Odisha', '21'],
  [78, 78, 'Assam', '18'], [79, 79, 'North East', '18'], [80, 82, 'Bihar', '10'], [83, 83, 'Jharkhand', '20'], [84, 85, 'Bihar', '10'],
];
export function stateFor(pin: string): { state: string; code: string } | null {
  if (!validPincode(pin)) return null;
  const n = Number(pin.slice(0, 2));
  const m = PIN.find(([a, b]) => n >= a && n <= b);
  return m ? { state: m[2], code: m[3] } : null;
}

/** demo GST Enrolment ID for sellers without a GSTIN (lets them sell within their state); built from the masked PAN */
export const enrolmentId = (maskedPan: string, stateCode = '09') => `EID-${stateCode}-${maskedPan}`;

export interface Kyc {
  aadhaar?: { masked: string; name: string };
  pan?: { masked: string; name: string };
  gst?: { kind: 'gstin' | 'eid'; id: string };
  bank?: { holder: string; masked: string; ifsc: string; bank: string };
  address?: { line: string; pincode: string; city: string; state: string };
  email?: string;
}
export const KYC_STEPS = ['aadhaar', 'pan', 'gst', 'bank', 'address', 'email'] as const;
export type KycStep = typeof KYC_STEPS[number];
export const kycDone = (k: Kyc) => KYC_STEPS.every(s => !!k[s]);
export const kycCount = (k: Kyc) => KYC_STEPS.filter(s => !!k[s]).length;
