# Luiza & Bernardo — site do casamento

Site estático (Astro) com RSVP e lista de presentes, publicado no GitHub Pages. Custo zero:

- **RSVP e recados** → Google Sheets via Apps Script ([apps-script/README.md](apps-script/README.md))
- **Presentes** → Pix gerado no navegador (QR + copia e cola, sem taxa) e, opcionalmente, links de pagamento do Stripe
- **Idiomas** → português (`/`), inglês (`/en/`) e espanhol (`/es/`)
- **Design system** → [Luiza & Bernardo](https://claude.ai/artifact/NYweRMNvz93NoXQmLLhSgV)

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
| Data, links de mapa, chave Pix, URL do Apps Script, link Stripe de valor livre | `src/config.ts` |
| Textos (história, programação, FAQ, traje, hospedagem…) | `src/i18n/pt.ts`, `en.ts`, `es.ts` |
| Lista de presentes (nome, valor, descrição, link Stripe) | `src/data/gifts.json` |
| Categorias dos presentes | `src/data/gifts.ts` |
| Cores, fontes, componentes | `src/styles/tokens.css` e `components.css` (vêm do design system) |

Textos marcados com `[preencher]` são placeholders.

## Design system

O visual segue o design system **Luiza & Bernardo** (artifact: https://claude.ai/artifact/NYweRMNvz93NoXQmLLhSgV):
azul de azulejo sobre branco de cal, painéis de azulejo emoldurados em pedra lioz, curvas e conchas;
Alex Brush (nomes e data), Cormorant Garamond (títulos) e Manrope (texto, rótulos, botões).

| Arquivo | O que é |
| --- | --- |
| `src/styles/tokens.css` | Cópia do `project/tokens.css` do DS (sem `@font-face`) + bloco de **aliases** no fim |
| `src/styles/components.css` | Cópia do `project/components/bundle.css` do DS: as classes `lb-*` |
| `src/styles/global.css` | Só o que o DS não cobre: layout, seções, utilitários e ajustes marcados `site:` |
| `public/azulejo/` | `padrao.svg` e `cercadura.svg` do DS (`assets/Azulejo`) |
| `src/components/` | Wrappers Astro dos componentes do DS: `Hero`, `TituloSecao`, `CartaoEvento`, `BarraAzulejo`, `Ornamento`, `FitaTitulo` |

**Quando o DS mudar:** copie de novo `tokens.css` e `bundle.css` para os dois arquivos acima, mantendo o
cabeçalho, o bloco de aliases e a remoção do `@import`/`@font-face`/`body`.

Diferenças em relação ao DS, resolvidas aqui (o artifact não foi alterado):
- o `bundle.css` usa `--espaco-*`, `--raio-*`, `--traco*` e `--modulo-azulejo`, que o `tokens.css` não define: os aliases em `tokens.css` mapeiam para `spacing-*`, `radius-*`, `weight-*`;
- os estilos sans do `tokens.json` apontam para `Inter`, mas o README do DS usa **Manrope**: o site usa Manrope;
- as fontes vêm do Google Fonts (os `/_blob/` do DS só existem dentro do artifact).

### Ilustrações

As peças do convite (moldura, concha, fita, letterings, querubins) são **vetores** gerados por
`tools/vectorize.py` a partir de `source/save-the-date.jpg` (o original 1500×2102 do DS), equivalentes aos
PNGs de `assets/Ilustracao` e `assets/Lettering`. Ficam em `public/art/` e são pintados em `cobalto` via
CSS mask (`Art.astro`). Para regenerar (Pillow, numpy, scipy e `potrace`):

```bash
npm run vectorize
```

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
