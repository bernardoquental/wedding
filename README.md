# Luiza & Bernardo — site do casamento

Site estático (Astro) com RSVP e lista de presentes, publicado no GitHub Pages. Custo zero:

- **RSVP e recados** → Google Sheets via Apps Script ([apps-script/README.md](apps-script/README.md))
- **Presentes** → Pix gerado no navegador (QR + copia e cola, sem taxa) e, opcionalmente, links de pagamento do Stripe
- **Idiomas** → português (`/`), inglês (`/en/`) e espanhol (`/es/`)
- **Guia de estilo** → `/estilo/` (cores, ilustrações, tipografia, componentes)

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:4321/wedding/
npm test           # testes do Pix e da validação de nomes
npm run build
```

## Onde editar

| O quê | Arquivo |
| --- | --- |
| Data, local, chave Pix, URL do Apps Script, link Stripe de valor livre | `src/config.ts` |
| Textos (história, programação, FAQ, traje, hospedagem…) | `src/i18n/pt.ts`, `en.ts`, `es.ts` |
| Lista de presentes (nome, valor, descrição, link Stripe) | `src/data/gifts.json` |
| Categorias dos presentes | `src/data/gifts.ts` |
| Cores e fontes | `src/styles/global.css` (variáveis no topo) |

Textos marcados com `[preencher]` são placeholders.

## Padrão visual e ilustrações

A arte do save the date foi feita à mão, então as ilustrações são **vetorizadas** a partir da imagem
(`source/save-the-date.jpg`) por `tools/vectorize.py` (Pillow + numpy + scipy + `potrace`). O script separa
a moldura, a faixa (vazia), os letterings e recortes (concha, querubins, guirlandas, ramos) em
`public/art/*.svg`. Os SVGs são pintados pela cor do texto via CSS mask (componente `Art.astro`).

Para melhorar a nitidez: escaneie o desenho original em alta resolução (600 dpi), salve como
`source/save-the-date.jpg` com o mesmo enquadramento e rode:

```bash
pip install pillow numpy scipy && sudo apt install potrace
npm run vectorize
```

**Tipografia:** os letterings originais (nomes, data, local) são usados como imagem vetorial. Para títulos
novos usa-se uma cursiva do Google Fonts (padrão: *Mrs Saint Delafield*; compare as candidatas em
`/estilo/`) e, para o texto, *Cormorant Garamond*. Para uma fonte idêntica à letra original, preencha a
folha-modelo do [Calligraphr](https://www.calligraphr.com) à mão e troque `--font-script`.

## Publicar no GitHub Pages

1. No GitHub: **Settings › Pages › Source: GitHub Actions**.
2. Faça merge na branch `main`: o workflow `.github/workflows/deploy.yml` testa, compila e publica em
   `https://bernardoquental.github.io/wedding/`.
3. Domínio próprio (opcional): crie `public/CNAME` com o domínio, configure o DNS e, no workflow,
   use `SITE_URL=https://seudominio` e `BASE_PATH=/`.

## Pagamentos

- **Pix** (principal): preencha `pix.key`, `merchantName` e `merchantCity` em `src/config.ts`. O código
  segue o padrão BR Code do Banco Central; teste com um presente de R$1 antes de divulgar.
  Não há confirmação automática: o convidado deixa um recado após pagar e vocês conferem no extrato.
- **Stripe** (opcional, com taxa ~3,99% + R$0,39): crie *Payment Links* no painel do Stripe e cole em
  `stripeUrl` de cada presente e/ou em `stripeOpenAmountUrl` (valor livre). Sem link, o botão não aparece.

## Privacidade

O repositório é público: **não** coloque dados de convidados aqui. As respostas ficam só na planilha.
