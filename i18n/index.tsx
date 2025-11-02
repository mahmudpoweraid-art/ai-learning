
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'en' | 'bn';
type Translations = Record<string, string>;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<Language, Translations> | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [enResponse, bnResponse] = await Promise.all([
          fetch('./i18n/locales/en.json'),
          fetch('./i18n/locales/bn.json')
        ]);
        if (!enResponse.ok || !bnResponse.ok) {
          throw new Error('Failed to fetch translation files');
        }
        const enData = await enResponse.json();
        const bnData = await bnResponse.json();
        setTranslations({ en: enData, bn: bnData });
      } catch (error) {
        console.error("Failed to load translation files:", error);
      }
    };
    fetchTranslations();
  }, []);

  const t = (key: string, replacements?: Record<string, string>): string => {
    if (!translations) {
      return key; // Fallback to key if translations are not loaded
    }

    let translation = translations[language]?.[key] || translations['en']?.[key] || key;
    
    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(`{{${placeholder}}}`, replacements[placeholder]);
      });
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
