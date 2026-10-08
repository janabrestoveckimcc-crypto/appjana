import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { hr } from './hr';
import { en } from './en';
type Language = 'hr' | 'en';
const LanguageContext = createContext({ language: 'hr' as Language, setLanguage: (_value: Language): void => {}, t: hr as Record<keyof typeof hr, string> });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('hr');
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage, t: language === 'hr' ? hr : en }}>{children}</LanguageContext.Provider>;
}
export function useT() { return useContext(LanguageContext); }
