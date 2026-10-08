import type { Language } from './errors.ts';

export function currentTimeContext(now: Date, language: Language): string {
  const timestamp = new Intl.DateTimeFormat(language === 'hr' ? 'hr-HR' : 'en-GB', {
    timeZone: 'Europe/Zagreb', weekday: 'long', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(now);
  return `${language === 'hr' ? 'Trenutni datum i vrijeme' : 'Current date and time'}: ${timestamp}; Europe/Zagreb.`;
}
