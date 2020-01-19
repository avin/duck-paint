import { objectToQueryString } from '../url';

describe('objectToQueryString', () => {
  test('общий тест', () => {
    const obj = {
      foo: 'bar',
      azz: 'buzz',
      val1: 1,
      valNull: null,
      valUndef: undefined,
    };
    expect(objectToQueryString(obj, false)).toBe('foo=bar&azz=buzz&val1=1');
    expect(objectToQueryString(obj, true)).toBe(
      'foo=bar&azz=buzz&val1=1&valNull=null&valUndef=undefined',
    );
  });

  test('хранит массив', () => {
    const obj = {
      arr: [1, 2, 3],
    };
    expect(objectToQueryString(obj, false)).toBe('arr[]=1&arr[]=2&arr[]=3');
  });

  test('экранирует', () => {
    const obj = {
      str: 'hello world!%&',
    };
    expect(objectToQueryString(obj, false)).toBe(`str=${encodeURIComponent(obj.str)}`);
  });
});
