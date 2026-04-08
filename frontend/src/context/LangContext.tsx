import { createContext, useContext, useState, type ReactNode } from 'react';
import { en, zh, type TranslationKey } from '../i18n/translations';

type Lang = 'en' | 'zh';

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const t = (key: TranslationKey): string => (lang === 'zh' ? zh[key] : en[key]) ?? key;
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
