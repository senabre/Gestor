export interface EmailNotifications {
  payments: boolean;
  reminders: boolean;
  monthlyReport: boolean;
}

export interface EmailSettings {
  enabled: boolean;
  notifications: EmailNotifications;
}

export interface UserSettings {
  email: EmailSettings;
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en' | 'val';
}

export const defaultSettings: UserSettings = {
  email: {
    enabled: true,
    notifications: {
      payments: true,
      reminders: true,
      monthlyReport: true
    }
  },
  theme: 'system',
  language: 'es'
};