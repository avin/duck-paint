import {
  validateCardNumber,
  required,
  composeValidators,
  validateCardDate,
  validateMinNumber,
  validateMaxNumber,
  validateNumber,
  validateCardCvc,
} from '../validation';

const VALID_CARD_NUMBER = '4561261212345467';
const INVALID_CARD_NUMBER = '4561261212345468';

test('validateCardNumber', async () => {
  expect(validateCardNumber()(VALID_CARD_NUMBER)).toBeFalsy();
  expect(validateCardNumber()(INVALID_CARD_NUMBER)).toBeTruthy();
  expect(validateCardNumber()('foo')).toBeTruthy();
  expect(validateCardNumber()('')).toBeTruthy();
});

test('required', async () => {
  expect(required()('foo')).toBeFalsy();
  expect(required()(' ')).toBeTruthy();
  expect(required()('')).toBeTruthy();
});

test('composeValidators', async () => {
  expect(composeValidators(required(), validateCardNumber())('')).toBeTruthy();
  expect(composeValidators(required(), validateCardNumber())('non_card')).toBeTruthy();
  expect(composeValidators(required(), validateCardNumber())(VALID_CARD_NUMBER)).toBeFalsy();
});

test('validateCardDate', async () => {
  expect(validateCardDate()('')).toBeTruthy();
  expect(validateCardDate()([])).toBeTruthy();
  expect(validateCardDate()(['11', '22', '33'])).toBeTruthy();
  expect(validateCardDate()(['', ''])).toBeTruthy();
  expect(validateCardDate()(['11', ''])).toBeTruthy();
  expect(validateCardDate()(['', '11'])).toBeTruthy();
  expect(validateCardDate()(['12', '25'])).toBeFalsy();
  expect(validateCardDate()(['0', '25'])).toBeTruthy();
  expect(validateCardDate()(['13', '25'])).toBeTruthy();
});

test('validateMinNumber', async () => {
  expect(validateMinNumber(10)(5)).toBeTruthy();
  expect(validateMinNumber(5)(10)).toBeFalsy();
  expect(validateMinNumber(5)(5)).toBeFalsy();
  expect(validateMinNumber(undefined)(5)).toBeFalsy();
  expect(validateMinNumber(5)(undefined)).toBeFalsy();
});

test('validateMaxNumber', async () => {
  expect(validateMaxNumber(10)(5)).toBeFalsy();
  expect(validateMaxNumber(5)(10)).toBeTruthy();
  expect(validateMaxNumber(5)(5)).toBeFalsy();
  expect(validateMaxNumber(undefined)(5)).toBeFalsy();
  expect(validateMaxNumber(5)(undefined)).toBeFalsy();
});

test('validateNumber', async () => {
  const options = {
    allowZero: true,
    min: 120,
    max: 1000,
  };
  expect(validateNumber(options)(500)).toBeFalsy();
  expect(validateNumber(options)(0)).toBeFalsy();
  expect(validateNumber(options)(10)).toBeTruthy();
  expect(validateNumber(options)(1010)).toBeTruthy();
});

test('validateCardCvc', async () => {
  expect(validateCardCvc()('123')).toBeFalsy();
  expect(validateCardCvc()('1234')).toBeFalsy();
  expect(validateCardCvc()('12')).toBeTruthy();
  expect(validateCardCvc()('12345')).toBeTruthy();
  expect(validateCardCvc()('foo')).toBeTruthy();
  expect(validateCardCvc()('123foo')).toBeTruthy();
  expect(validateCardCvc()('1fo')).toBeTruthy();
});
