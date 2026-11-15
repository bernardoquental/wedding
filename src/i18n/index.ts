import pt from './pt';
import en from './en';
import es from './es';

export const languages = { pt: 'Português', en: 'English', es: 'Español' } as const;
export type Lang = keyof typeof languages;
export type Dict = typeof pt;

const dicts: Record<Lang, Dict> = { pt, en, es };

export function t(lang: Lang): Dict {
  return dicts[lang];
}

/** Caminho de cada página por idioma (sem o base path). */
export const routes = {
  home: { pt: '/', en: '/en/', es: '/es/' },
  gifts: { pt: '/presentes/', en: '/en/gifts/', es: '/es/regalos/' },
} as const;
export type RouteKey = keyof typeof routes;

/** Prefixa com o base path do site (ex.: /wedding). */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}

export function route(key: RouteKey, lang: Lang, hash = ''): string {
  return url(routes[key][lang]) + hash;
}

export function formatBRL(value: number, lang: Lang): string {
  const locale = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[lang];
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}
