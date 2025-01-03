import { useEffect } from 'react';
import { UserSettings } from '../types/settings';
import { translations } from '../i18n';

export function useLanguage(language: UserSettings['language']) {
  useEffect(() => {
    // Set HTML lang attribute
    document.documentElement.lang = language;
    
    // Load translations
    const messages = translations[language];
    if (messages) {
      window.i18n = messages;
    }
  }, [language]);
}