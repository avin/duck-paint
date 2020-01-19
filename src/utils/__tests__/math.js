import { clamp } from '../math';

test('clamp', async () => {
  expect(clamp(5, 0, 10)).toBe(5);
  expect(clamp(5, 5, 10)).toBe(5);
  expect(clamp(5, 7, 10)).toBe(7);
  expect(clamp(15, 7, 10)).toBe(10);
});
