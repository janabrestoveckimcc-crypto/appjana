import { jsonResponse } from './cors.ts';

const errors = {
  'AUTH-0001': { status: 401, hr: 'Prijavi se za nastavak.', en: 'Sign in to continue.' },
  'REQ-0001': { status: 405, hr: 'Metoda nije podržana.', en: 'Method not allowed.' },
  'REQ-0002': { status: 400, hr: 'Neispravan zahtjev.', en: 'Invalid request.' },
  'AI-0001': { status: 503, hr: 'AI još nije konfiguriran.', en: 'AI is not configured yet.' },
  'AI-0002': { status: 502, hr: 'AI trenutačno nije dostupan. Pokušaj ponovno kasnije.', en: 'AI is unavailable right now. Please try again later.' },
  'AI-0003': { status: 504, hr: 'AI nije odgovorio na vrijeme. Pokušaj ponovno.', en: 'AI timed out. Please try again.' },
  'AI-0004': { status: 502, hr: 'AI nije mogao pouzdano pročitati podatke. Pokušaj ponovno.', en: 'AI could not reliably read the data. Please try again.' },
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
