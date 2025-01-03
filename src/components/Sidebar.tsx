import { Link, useLocation } from 'react-router-dom';
import { Trophy, FileText, CreditCard, Users, DollarSign, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import NotificationBell from './NotificationBell';

export default function Sidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    { path: '/', icon: Trophy, label: t('teams') },
    { path: '/fees', icon: CreditCard, label: t('fees') },
    { path: '/staff', icon: Users, label: t('staff') },
    { path: '/player-salaries', icon: DollarSign, label: t('playerSalaries') },
    { path: '/invoices', icon: FileText, label: t('invoices') },
    { path: '/settings', icon: SettingsIcon, label: t('settings') },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8" />
            <span className="text-xl font-bold">Club Deportivo</span>
          </div>
          <NotificationBell />
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-2 px-4 py-2 w-full text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
}