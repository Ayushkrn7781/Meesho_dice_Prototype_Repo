import { describe, expect, it } from 'vitest';
import { bankFor, enrolmentId, kycDone, maskAadhaar, maskAccount, maskPAN, sampleAadhaar, stateFor, validAadhaar, validAccount, validEmail, validGSTIN, validIFSC, validPAN, validPincode } from '../src/engine/kyc';

describe('KYC format checks', () => {
  it('Aadhaar: 12 digits with a valid Verhoeff check digit', () => {
    expect(validAadhaar(sampleAadhaar())).toBe(true);
    const s = sampleAadhaar();
    expect(validAadhaar(s.slice(0, 11) + ((Number(s[11]) + 1) % 10))).toBe(false);
    expect(validAadhaar('123456789012')).toBe(false);   // cannot start with 0 or 1
    expect(validAadhaar('2345 6789')).toBe(false);
  });
  it('PAN', () => { expect(validPAN('ABCPE1234F')).toBe(true); expect(validPAN('abcpe1234f')).toBe(true); expect(validPAN('ABCXE1234F')).toBe(false); expect(validPAN('AB1PE1234F')).toBe(false); });
  it('GSTIN', () => { expect(validGSTIN('09ABCPE1234F1Z5')).toBe(true); expect(validGSTIN('09ABCPE1234F1X5')).toBe(false); });
  it('IFSC and bank name', () => { expect(validIFSC('SBIN0001234')).toBe(true); expect(validIFSC('SBIN1001234')).toBe(false); expect(bankFor('sbin0001234')).toBe('State Bank of India'); });
  it('account number', () => { expect(validAccount('123456789012')).toBe(true); expect(validAccount('12345')).toBe(false); expect(validAccount('12345678A')).toBe(false); });
  it('pincode → state', () => { expect(validPincode('226001')).toBe(true); expect(validPincode('026001')).toBe(false); expect(stateFor('226001')).toEqual({ state: 'Uttar Pradesh', code: '09' }); expect(stateFor('400001')?.state).toBe('Maharashtra'); });
  it('email', () => { expect(validEmail('ramesh@gmail.com')).toBe(true); expect(validEmail('ramesh@gmail')).toBe(false); });
});

describe('masking (only masked values are stored)', () => {
  it('Aadhaar', () => expect(maskAadhaar(sampleAadhaar())).toMatch(/^XXXX XXXX \d{4}$/));
  it('PAN', () => expect(maskPAN('ABCPE1234F')).toBe('ABC•••••4F'));
  it('account', () => expect(maskAccount('123456789012')).toBe('••••••9012'));
  it('GST Enrolment ID uses the masked PAN', () => expect(enrolmentId(maskPAN('abcpe1234f'), '09')).toBe('EID-09-ABC•••••4F'));
});

describe('kycDone', () => {
  it('needs all six parts', () => {
    const k = { aadhaar: { masked: '', name: '' }, pan: { masked: '', name: '' }, gst: { kind: 'eid' as const, id: '' }, bank: { holder: '', masked: '', ifsc: '', bank: '' }, address: { line: '', pincode: '', city: '', state: '' } };
    expect(kycDone(k)).toBe(false);
    expect(kycDone({ ...k, email: 'a@b.co' })).toBe(true);
  });
});
