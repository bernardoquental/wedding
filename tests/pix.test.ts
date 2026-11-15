import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crc16, pixPayload, sanitize } from '../src/lib/pix.ts';

test('crc16 CCITT-FALSE check value', () => {
  assert.equal(crc16('123456789'), '29B1');
});

test('payload estático conhecido', () => {
  // Exemplo do manual do BR Code (chave aleatória, sem valor).
  const p = pixPayload({
    key: '123e4567-e12b-12d1-a456-426655440000',
    merchantName: 'Fulano de Tal',
    merchantCity: 'BRASILIA',
  });
  assert.equal(
    p,
    '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D',
  );
});

test('valor, txid e acentos', () => {
  const p = pixPayload({
    key: 'noivos@example.com',
    merchantName: 'Luíza & Bernardo Casamento Muito Longo',
    merchantCity: 'Rio de Janeiro - RJ',
    amount: 150,
    txid: 'lua-de-mel',
  });
  assert.match(p, /5406150\.00/);
  assert.match(p, /62120508luademel6304/);
  assert.match(p, /6014Rio de Janeiro6/);
  assert.ok(p.includes('5924Luiza Bernardo Casamento6014'));
  assert.equal(p.slice(-4), crc16(p.slice(0, -4)));
});

test('sanitize', () => {
  assert.equal(sanitize('São João', 15), 'Sao Joao');
});
