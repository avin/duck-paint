import { arrayToKeyObject, prepareTranslationObj } from '../helpers';

describe('arrayToKeyObject', () => {
  test('ключ как строка', () => {
    const arr = [
      { id: 'i1', val: 'v1' },
      { id: 'i2', val: 'v2' },
    ];
    const result = arrayToKeyObject(arr, 'id');

    expect(result).toEqual({ [arr[0].id]: arr[0], [arr[1].id]: arr[1] });
  });

  test('ключ как цифра', () => {
    const arr = [
      { idNum: 10, val: 'v1' },
      { idNum: 20, val: 'v2' },
    ];
    const result = arrayToKeyObject(arr, 'idNum');

    expect(result).toEqual({ [arr[0].idNum]: arr[0], [arr[1].idNum]: arr[1] });
  });
});

describe('prepareTranslationObj', () => {
  test('плоский словарь', () => {
    const srcObj = {
      foo: {
        ru: 'foo-ru',
        en: 'foo-en',
      },
      bar: {
        ru: 'bar-ru',
        en: 'bar-en',
      },
    };
    const result = prepareTranslationObj(srcObj, 'en');

    expect(result).toEqual({
      foo: 'foo-en',
      bar: 'bar-en',
    });
  });

  test('глубокий словарь', () => {
    const srcObj = {
      foo: {
        ru: 'foo-ru',
        en: 'foo-en',
      },
      barDeep: {
        bar1: {
          ru: 'bar1-ru',
          en: 'bar1-en',
        },
        bar2: {
          ru: 'bar2-ru',
          en: 'bar2-en',
        },
      },
    };
    const result = prepareTranslationObj(srcObj, 'en');

    expect(result).toEqual({
      foo: 'foo-en',
      barDeep: {
        bar1: 'bar1-en',
        bar2: 'bar2-en',
      },
    });
  });
});
