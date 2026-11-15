/**
 * Configurações gerais do site. Edite aqui.
 */
export const config = {
  couple: 'Luiza & Bernardo',
  /** Data e hora da cerimônia (horário de Brasília). */
  date: '2027-03-20T16:00:00-03:00',
  venue: {
    name: 'Santa Teresa',
    city: 'Rio de Janeiro',
    // Troque pelo endereço exato quando definido.
    mapsUrl: 'https://maps.google.com/?q=Santa+Teresa,+Rio+de+Janeiro',
  },
  /** Prazo para confirmar presença. */
  rsvpDeadline: '2027-01-31',

  pix: {
    /** Chave Pix (CPF, e-mail, telefone no formato +5521999999999 ou chave aleatória). */
    key: 'SUA-CHAVE-PIX-AQUI',
    /** Nome do recebedor, até 25 caracteres, sem acentos. */
    merchantName: 'BERNARDO QUENTAL',
    /** Cidade do recebedor, até 15 caracteres, sem acentos. */
    merchantCity: 'RIO DE JANEIRO',
  },

  /**
   * URL do Web App do Google Apps Script (ver apps-script/README.md).
   * Enquanto estiver vazia, os formulários funcionam em modo de demonstração.
   */
  appsScriptUrl: '',

  /** Link de pagamento do Stripe com valor livre (opcional). Deixe '' para esconder. */
  stripeOpenAmountUrl: '',
};
