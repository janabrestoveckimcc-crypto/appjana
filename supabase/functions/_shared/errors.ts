import { jsonResponse } from './cors.ts';

const errors = {
  'AUTH-0001': { status: 401, hr: 'Za ovu provjeru potrebna je operatorska autorizacija.', en: 'Operator authorization is required for this check.' },
  'REQ-0001': { status: 405, hr: 'Metoda nije podržana.', en: 'Method not allowed.' },
  'REQ-0002': { status: 400, hr: 'Neispravan zahtjev.', en: 'Invalid request.' },
  'AI-0001': { status: 503, hr: 'AI još nije konfiguriran.', en: 'AI is not configured yet.' },
  'AI-0002': { status: 502, hr: 'AI provjera nije uspjela. Poziv nije ponovljen.', en: 'AI check failed. The request was not retried.' },
  'AI-0003': { status: 504, hr: 'AI nije odgovorio na vrijeme. Poziv nije ponovljen.', en: 'AI timed out. The request was not retried.' },
  'AI-0004': { status: 502, hr: 'AI je vratio neispravan odgovor. Poziv nije ponovljen.', en: 'AI returned an invalid response. The request was not retried.' },
  'SYS-0001': { status: 500, hr: 'Provjera nije uspjela.', en: 'The check failed.' },
} as const;

export type Language = 'hr' | 'en';
export class AppError extends Error {
  constructor(public readonly code: keyof typeof errors) { super(code); }
}

export function errorResponse(error: unknown, language: Language): Response {
  const code = error instanceof AppError ? error.code : 'SYS-0001';
  const definition = errors[code];
  return jsonResponse({ status: definition.status, code, detail: definition[language] }, definition.status);
}
