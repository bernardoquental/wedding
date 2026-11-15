import { config } from '../config';

export type Action = 'rsvp' | 'gift_message';

export interface ApiResult {
  ok: boolean;
  demo?: boolean;
  error?: string;
}

/**
 * Envia dados para o Web App do Google Apps Script.
 * Usa Content-Type text/plain para evitar o preflight de CORS.
 */
export async function send(action: Action, data: Record<string, unknown>): Promise<ApiResult> {
  const payload = { action, ...data, lang: document.documentElement.lang, sentAt: new Date().toISOString() };
  if (!config.appsScriptUrl) {
    console.info('[demo] payload', payload);
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, demo: true };
  }
  const res = await fetch(config.appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
  return (await res.json()) as ApiResult;
}
