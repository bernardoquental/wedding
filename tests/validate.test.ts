import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isFullName, isEmail, isPhone } from '../src/lib/validate.ts';

test('isFullName', () => {
  assert.ok(isFullName('Luiza Souza'));
  assert.ok(isFullName('  José  da Silva '));
  assert.ok(isFullName("Ana O'Neil"));
  assert.ok(!isFullName('Luiza'));
  assert.ok(!isFullName('Luiza S'));
  assert.ok(!isFullName('Luiza 123'));
  assert.ok(!isFullName(''));
});

test('contato', () => {
  assert.ok(isEmail('a@b.com'));
  assert.ok(!isEmail('a@b'));
  assert.ok(isPhone('+55 (21) 99999-9999'));
  assert.ok(!isPhone('123'));
});
