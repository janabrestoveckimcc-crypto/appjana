export function formatDate(value: string, language: 'hr'|'en'): string {
  return new Intl.DateTimeFormat(language==='hr'?'hr-HR':'en-GB', {timeZone:'Europe/Zagreb',day:'numeric',month:'long',year:'numeric'}).format(new Date(value));
}
