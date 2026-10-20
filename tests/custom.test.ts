// "Format neatly" turns messy typing into the same listing shape for every product.
import { describe, expect, it } from 'vitest';
import { isComplete, titleFor } from '../src/engine/catalog';
import { attrsFromForm, formatListing, titleCase, type CustomForm } from '../src/engine/custom';
import { medianFor } from '../src/engine/sim';

const form: CustomForm = { industry: 'furnishing', sub: 'Cushion covers', name: '  BLUE cotton cushion cover!! 😀 ', material: 'COTTON', colour: 'blue', size: '16 x 16 in', pack: 2, desc: 'soft and washable', cost: 120, median: 499 };

describe('formatListing', () => {
  const l = formatListing(form);
  it('builds a clean, de-duplicated title with pack size', () => expect(l.title).toBe('Blue Cotton Cushion Cover (Pack of 2)'));
  it('lists details in a fixed order', () => expect(l.highlights.map(([k]) => k.en)).toEqual(['Category', 'Material', 'Colour', 'Size', 'Pack of']));
  it('shows the category path', () => expect(l.highlights[0][1]).toBe('Home furnishing › Cushion covers'));
  it('tidies the description into a sentence', () => expect(l.description).toBe('Soft and washable.'));
  it('writes a description when none was given', () => expect(formatListing({ ...form, desc: '' }).description).toBe('Blue Cotton Cushion Cover in cushion covers, made of cotton.'));
  it('tidies a typed-in sub-type', () => expect(formatListing({ ...form, sub: 'table RUNNER' }).highlights[0][1]).toBe('Home furnishing › Table Runner'));
  it('skips empty optional fields', () => expect(formatListing({ ...form, material: '', colour: '', size: '' }).highlights.map(([k]) => k.en)).toEqual(['Category', 'Pack of']));
});

describe('titleCase', () => {
  it('keeps short codes and lower-cases small words', () => expect(titleCase('LED lamp FOR the study')).toBe('LED Lamp for the Study'));
  it('does not keep shouted words in caps', () => expect(titleCase('BLUE COTTON BEDSHEET 3xl')).toBe('Blue Cotton Bedsheet 3XL'));
  it('leaves Devanagari as typed', () => expect(titleCase('हाथ से बना  दीया')).toBe('हाथ से बना दीया'));
});

describe('custom products in the engine', () => {
  it('"Add as entered" keeps the typed name', () => expect(titleFor(attrsFromForm(form, false)).en).toBe(form.name.trim()));
  it('"Format neatly" stores the formatted title', () => expect(titleFor(attrsFromForm(form, true)).en).toBe('Blue Cotton Cushion Cover (Pack of 2)'));
  it('"Format neatly" also tidies every detail field', () => {
    const a = attrsFromForm(form, true);
    expect([a.material, a.colour, a.sub, a.size]).toEqual(['Cotton', 'Blue', 'Cushion covers', '16 x 16 in']);
  });
  it('counts as complete and uses the seller-set typical price', () => {
    const a = attrsFromForm(form, true);
    expect(isComplete(a)).toBe(true);
    expect(medianFor(a)).toBe(499);
  });
});
