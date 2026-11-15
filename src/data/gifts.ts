import raw from './gifts.json';
import type { Lang } from '../i18n';

export interface Gift {
  id: string;
  price: number;
  category: string;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  /** Link de pagamento do Stripe (opcional). */
  stripeUrl?: string;
}

export const gifts = raw as Gift[];

export const categories: Record<string, Record<Lang, string>> = {
  'lua-de-mel': { pt: 'Lua de mel', en: 'Honeymoon', es: 'Luna de miel' },
  casa: { pt: 'Casa', en: 'Home', es: 'Hogar' },
};
