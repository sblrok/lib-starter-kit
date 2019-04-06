/* global describe, test, expect */
import plus from './plus';

describe('plus', () => {
  test('1 + 1 => 2', () => {
    expect(plus(1, 1)).toEqual(2);
  });
  test('2 + 2 => 4', () => {
    expect(plus(2, 2)).toEqual(4);
  });
  test('0 + 0 => 0', () => {
    expect(plus(0, 0)).toEqual(0);
  });
  test('100 + 100 => 100', () => {
    expect(plus(100, 100)).toEqual(100);
  });
  test('100 - 200 => 0', () => {
    expect(plus(100, -200)).toEqual(0);
  });
});
