/** Nome e sobrenome: pelo menos duas palavras com 2+ letras cada. */
export function isFullName(value: string): boolean {
  const words = value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/\s+/)
    .filter((w) => /^[A-Za-z][A-Za-z'.-]*$/.test(w) && w.replace(/[^A-Za-z]/g, '').length >= 2);
  return words.length >= 2;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isPhone(value: string): boolean {
  return value.replace(/\D/g, '').length >= 8;
}
