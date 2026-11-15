/**
 * Backend do site (RSVP + recados de presentes) em Google Apps Script.
 * Grava cada envio como uma linha na planilha à qual este script está vinculado.
 * Instruções de instalação: apps-script/README.md
 */

const SHEETS = {
  rsvp: {
    name: 'RSVP',
    headers: ['Data', 'Nome', 'E-mail', 'Telefone', 'Vai?', 'Acompanhantes', 'Nomes dos acompanhantes',
              'Restrições', 'Recado', 'Idioma', 'Possível duplicado'],
  },
  gift_message: {
    name: 'Presentes',
    headers: ['Data', 'Nome', 'Presente', 'ID', 'Valor (R$)', 'Recado', 'Idioma', 'Conferido no extrato?'],
  },
};

/** E-mail que recebe um aviso a cada envio ('' para desligar). */
const NOTIFY_EMAIL = '';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.website) return json({ ok: true }); // honeypot: robô
    const cfg = SHEETS[data.action];
    if (!cfg) return json({ ok: false, error: 'ação inválida' });
    if (!isFullName(data.fullName)) return json({ ok: false, error: 'nome inválido' });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getSheet(cfg);
      const row = data.action === 'rsvp' ? rsvpRow(sheet, data) : giftRow(data);
      sheet.appendRow(row.map(clean));
    } finally {
      lock.releaseLock();
    }
    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, `[Casamento] ${cfg.name}: ${data.fullName}`, JSON.stringify(data, null, 2));
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, service: 'casamento' });
}

function rsvpRow(sheet, d) {
  const key = normalize(d.fullName);
  const names = sheet.getLastRow() > 1 ? sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues().flat() : [];
  const duplicate = names.some((n) => normalize(n) === key);
  return [
    new Date(), d.fullName, d.email, d.phone, d.attending === 'yes' ? 'Sim' : 'Não',
    Number(d.guests) || 0, (d.guestNames || []).join(', '), d.dietary, d.message, d.lang,
    duplicate ? 'SIM' : '',
  ];
}

function giftRow(d) {
  return [new Date(), d.fullName, d.giftName, d.giftId, Number(d.amount) || '', d.message, d.lang, ''];
}

function getSheet(cfg) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(cfg.name);
  if (!sheet) {
    sheet = ss.insertSheet(cfg.name);
    sheet.appendRow(cfg.headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, cfg.headers.length).setFontWeight('bold');
  }
  return sheet;
}

function normalize(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function isFullName(s) {
  return normalize(s).split(' ').filter((w) => /^[a-z][a-z'.-]*$/.test(w) && w.replace(/[^a-z]/g, '').length >= 2).length >= 2;
}

/** Evita injeção de fórmulas na planilha e limita tamanho. */
function clean(v) {
  if (typeof v !== 'string') return v;
  v = v.slice(0, 1000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
