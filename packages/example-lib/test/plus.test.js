/* global test expect */
import plus from '../src/plus'; // eslint-disable-line

test('check 1 + 1', () => {
  expect(plus(1, 1)).toBe(2);
});

test('check 10 + -20', () => {
  expect(plus(10, -20)).toBe(0);
});

test('check 50 + 50', () => {
  expect(plus(50, 50)).toBe(100);
});

test('check 51 + 51', () => {
  expect(plus(51, 51)).toBe(100);
});
