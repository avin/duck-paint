import { formatDate, formatTime } from '../date';

test('formatDate', () => {
  expect(formatDate(0)).toBe('01.01.1970');
  expect(formatDate('2019-12-27T14:12:02+0300')).toBe('27.12.2019');
});

test('formatTime', () => {
  expect(formatTime(0)).toBe('03:00');
  expect(formatTime(1000, { withSeconds: true, separator: '::' })).toBe('03::00::01');
});
