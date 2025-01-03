import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../i18n';
import type { TranslationKey } from '../i18n';

type InterpolationParams = Record<string, string | number>;

export function useTranslation() {
  const { settings } = useSettings();
  const messages = translations[settings.language];

  function t(key: TranslationKey, params?: InterpolationParams): string {
    let text = messages[key] || translations.es[key] || key;

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{{${key}}}`, String(value));
      });
    }

    return text;
  }

  return { t };
}