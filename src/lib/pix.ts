/**
 * Gera o payload "Pix copia e cola" (BR Code estático, padrão EMV/Banco Central).
 * Não depende de nenhum serviço: tudo é calculado no navegador.
 */

export interface PixOptions {
  key: string;
  merchantName: string;
  merchantCity: string;
  /** Valor em reais. Omitir/0 = o pagador digita o valor. */
  amount?: number;
  /** Identificador da transação (até 25 caracteres alfanuméricos). */
  txid?: string;
  /** Mensagem exibida ao pagador (opcional). */
  description?: string;
}

function field(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  if (value.length > 99) throw new Error(`Campo ${id} muito longo`);
  return `${id}${len}${value}`;
}

/** Remove acentos e caracteres fora do conjunto aceito pelos bancos. */
export function sanitize(text: string, max: number): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 .,\-@+/]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, max)
    .trim();
}

/** CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF). */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function pixPayload(opts: PixOptions): string {
  const account =
    field('00', 'br.gov.bcb.pix') +
    field('01', opts.key.trim()) +
    (opts.description ? field('02', sanitize(opts.description, 40)) : '');
  const txid = (opts.txid ?? '***').replace(/[^A-Za-z0-9*]/g, '').slice(0, 25) || '***';

  let payload =
    field('00', '01') +
    field('26', account) +
    field('52', '0000') +
    field('53', '986') +
    (opts.amount && opts.amount > 0 ? field('54', opts.amount.toFixed(2)) : '') +
    field('58', 'BR') +
    field('59', sanitize(opts.merchantName, 25)) +
    field('60', sanitize(opts.merchantCity, 15)) +
    field('62', field('05', txid)) +
    '6304';
  payload += crc16(payload);
  return payload;
}
