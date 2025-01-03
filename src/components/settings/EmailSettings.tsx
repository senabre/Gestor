import React from 'react';
import { Mail } from 'lucide-react';
import { EmailSettings } from '../../types/settings';

interface EmailSettingsProps {
  settings: EmailSettings;
  onChange: (settings: EmailSettings) => void;
}

export default function EmailSettingsSection({ settings, onChange }: EmailSettingsProps) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Mail className="h-5 w-5 mr-2 text-gray-600" />
        Configuración de Email
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Notificaciones por email</h3>
            <p className="text-sm text-gray-500">
              Activar/desactivar todas las notificaciones por email
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => onChange({
                ...settings,
                enabled: e.target.checked
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {settings.enabled && (
          <>
            <NotificationToggle
              label="Notificaciones de pagos"
              description="Recibir notificaciones cuando se registren pagos"
              checked={settings.notifications.payments}
              onChange={(checked) => onChange({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  payments: checked
                }
              })}
            />

            <NotificationToggle
              label="Recordatorios"
              description="Recibir recordatorios de pagos pendientes"
              checked={settings.notifications.reminders}
              onChange={(checked) => onChange({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  reminders: checked
                }
              })}
            />

            <NotificationToggle
              label="Informe mensual"
              description="Recibir un resumen mensual de actividad"
              checked={settings.notifications.monthlyReport}
              onChange={(checked) => onChange({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  monthlyReport: checked
                }
              })}
            />
          </>
        )}
      </div>
    </div>
  );
}

interface NotificationToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function NotificationToggle({ label, description, checked, onChange }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between pl-4">
      <div>
        <h3 className="font-medium">{label}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
}