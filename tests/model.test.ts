// §10.5 test vectors: cost ₹180, Standard tier, median ₹250, no size chart.
import { describe, expect, it } from 'vitest';
import { bucketNote, econ, FESTIVE, metrics, pricePoints, recommend, type Inputs } from '../src/engine/model';

const inp: Inputs = { cost: 180, tier: 'standard', sizeChart: false, median: 250 };
const near = (got: number, want: number, tol: number) => expect(Math.abs(got - want)).toBeLessThanOrEqual(tol);

describe('price table (§10.5)', () => {
  const rows: [number, number, number, number][] = [
    [199, 60.0, -83.0, -21409],
    [249, 60.0, -49.0, -12649],
    [299, 33.3, -15.1, -2161],
    [349, 18.3, 18.9, 1484],
    [399, 10.0, 52.8, 2280],
    [449, 5.5, 86.8, 2055],
    [499, 3.0, 120.7, 1569],
    [549, 1.7, 154.7, 1104],
  ];
  for (const [P, o, keep, month] of rows) {
    it(`₹${P}`, () => {
      const m = metrics(P, inp);
      near(m.o, o, 0.1);
      near(m.c, keep, 1);
      near(m.month, month, 1);
    });
  }
});

describe('breakeven, floor and receipt', () => {
  const e = econ(399, inp);
  it('breakeven ₹321.2', () => near(e.breakeven, 321.2, 1));
  it('floor ₹380.1', () => near(e.floor, 380.1, 1));
  it('fixed cost ₹218.1', () => near(e.cogs + e.pack + e.fwdC + e.revC + e.ads, 218.1, 1));
  it('money received ₹270.9 at ₹399', () => near(e.realised, 270.9, 1));
  it('product cost ₹134.1', () => near(e.cogs, 134.1, 1));
  it('forward shipping ₹45.5', () => near(e.fwdC, 45.5, 1));
  it('return shipping ₹15.5', () => near(e.revC, 15.5, 1));
});

describe('recommendations', () => {
  it('candidate prices for median 250', () => expect(pricePoints(250)).toEqual([199, 249, 299, 349, 399, 449, 499, 549, 599]));
  it('first orders ₹349', () => expect(recommend('first', inp)).toBe(349));
  it('most profit ₹399', () => expect(recommend('profit', inp)).toBe(399));
  it('clear stock ₹299', () => expect(recommend('clear', inp)).toBe(299));
});

describe('scenarios', () => {
  it('size chart: breakeven ₹310.7', () => near(econ(399, { ...inp, sizeChart: true }).breakeven, 310.7, 1));
  it('Diwali: breakeven ₹333.7', () => near(econ(399, inp, undefined, FESTIVE).breakeven, 333.7, 1));
  it('Diwali: keep ₹39.3 at ₹399', () => near(econ(399, inp, undefined, FESTIVE).c, 39.3, 1));
});

describe('filter-edge note', () => {
  it('₹319 misses Under ₹299', () => expect(bucketNote(319)).toContain('just misses the "Under ₹299"'));
  it('₹399 is visible in Under ₹399', () => expect(bucketNote(399)).toContain('Visible in "Under ₹399"'));
});
