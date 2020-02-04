/* global test expect */
import minus from '../src/minus';

test('check 1 - 1', () => {
  expect(minus(1, 1)).toBe(0);
});

test('check 3 - 5', () => {
  expect(minus(3, 5)).toBe(0);
});

test('check 200 - 50', () => {
  expect(minus(200, 50)).toBe(100);
});
