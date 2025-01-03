import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings, defaultSettings } from '../types/settings';
import { useAuth } from '../lib/AuthContext';
import { loadUserSettings, saveUserSettings } from '../lib/settings';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: UserSettings) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply theme and language effects
  useTheme(settings.theme);
  useLanguage(settings.language);

  // Load settings when user changes
  useEffect(() => {
    let mounted = true;

    async function initSettings() {
      if (!user) {
        setSettings(defaultSettings);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userSettings = await loadUserSettings(user.id);
        if (mounted) {
          setSettings(userSettings);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        if (mounted) {
          setError('Error loading settings');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initSettings();
    return () => { mounted = false; };
  }, [user]);

  async function updateSettings(newSettings: UserSettings) {
    if (!user) return;

    try {
      setError(null);
      await saveUserSettings(user.id, newSettings);
      setSettings(newSettings);
    } catch (err) {
      console.error('Error updating settings:', err);
      throw new Error('Failed to update settings');
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
}