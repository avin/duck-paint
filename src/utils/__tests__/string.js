import { formatAmount, formatBindingLabel } from '../string';

test('formatAmount', () => {
  expect(formatAmount('foo')).toBe('--.--');
  expect(formatAmount('1')).toBe('1');
  expect(formatAmount(1)).toBe('1');
  expect(formatAmount(100)).toBe('100');
  expect(formatAmount(100.1)).toBe('100.10');
  expect(formatAmount(1000)).toBe('1 000');
  expect(formatAmount(10000)).toBe('10 000');
  expect(formatAmount(100000)).toBe('100 000');
  expect(formatAmount(1000000)).toBe('1 000 000');
  expect(formatAmount(1000000.01)).toBe('1 000 000.01');
});

test('formatBindingLabel', () => {
  const binding = {
    name: 'foo bar',
    maskedPan: '11223344****9999',
  };
  expect(formatBindingLabel(binding)).toBe('foo bar **9999');
});
