import { useState, useEffect, ReactNode } from 'react';
import { LanguageContext, getTranslations, Language } from '@/lib/i18n';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    // Get language from localStorage or default to English
    const saved = localStorage.getItem('moore-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('moore-language', language);
  }, [language]);

  const t = getTranslations(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}