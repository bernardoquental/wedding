// @ts-check
import { defineConfig } from 'astro/config';

// Publicado em https://bernardoquental.github.io/wedding/ por padrão.
// Com domínio próprio (arquivo public/CNAME), defina SITE_URL e BASE_PATH=/ no workflow.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://bernardoquental.github.io',
  base: process.env.BASE_PATH ?? '/wedding',
  trailingSlash: 'ignore',
  i18n: {
    locales: ['pt', 'en', 'es'],
    defaultLocale: 'pt',
    routing: { prefixDefaultLocale: false },
  },
});
