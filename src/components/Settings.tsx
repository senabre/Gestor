import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import EmailSettingsSection from './settings/EmailSettings';
import GeneralSettings from './settings/GeneralSettings';
import { UserSettings } from '../types/settings';

export default function Settings() {
  const { settings: currentSettings, updateSettings, loading } = useSettings();
  const [settings, setSettings] = useState<UserSettings>(currentSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Update local settings when context settings change
  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      await updateSettings(settings);
      setMessage({
        type: 'success',
        text: 'Configuración guardada correctamente'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({
        type: 'error',
        text: 'Error al guardar la configuración'
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(currentSettings);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold">Configuración</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Guardar cambios</span>
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md divide-y">
        <EmailSettingsSection 
          settings={settings.email}
          onChange={(emailSettings) => setSettings({ ...settings, email: emailSettings })}
        />
        <GeneralSettings
          settings={settings}
          onChange={(generalSettings) => setSettings({ ...settings, ...generalSettings })}
        />
      </div>
    </div>
  );
}