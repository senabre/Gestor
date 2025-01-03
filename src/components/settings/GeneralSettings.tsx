import React from 'react';
import { UserSettings } from '../../types/settings';
import { useTranslation } from '../../hooks/useTranslation';

interface GeneralSettingsProps {
  settings: Pick<UserSettings, 'theme' | 'language'>;
  onChange: (settings: Pick<UserSettings, 'theme' | 'language'>) => void;
}

export default function GeneralSettings({ settings, onChange }: GeneralSettingsProps) {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">{t('otherSettings')}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('theme')}
          </label>
          <select
            value={settings.theme}
            onChange={(e) => onChange({
              ...settings,
              theme: e.target.value as UserSettings['theme']
            })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="system">{t('themeSystem')}</option>
            <option value="light">{t('themeLight')}</option>
            <option value="dark">{t('themeDark')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('language')}
          </label>
          <select
            value={settings.language}
            onChange={(e) => onChange({
              ...settings,
              language: e.target.value as UserSettings['language']
            })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="es">{t('langEs')}</option>
            <option value="val">{t('langVal')}</option>
            <option value="en">{t('langEn')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}