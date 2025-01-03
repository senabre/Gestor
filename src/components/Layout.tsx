import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../lib/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { checkMonthlyPayments } from '../utils/notifications';

export default function Layout() {
  const { user } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    // Apply theme class to root element
    const root = document.documentElement;
    if (settings.theme === 'dark' || 
        (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set language
    root.lang = settings.language;
  }, [settings.theme, settings.language]);

  useEffect(() => {
    if (user) {
      // Check for monthly payments
      const now = new Date();
      if (now.getDate() === 1) {
        checkMonthlyPayments(user.id);
      }

      const checkDate = () => {
        const currentDate = new Date();
        if (currentDate.getDate() === 1) {
          checkMonthlyPayments(user.id);
        }
      };

      const timer = setInterval(checkDate, 24 * 60 * 60 * 1000);
      return () => clearInterval(timer);
    }
  }, [user]);

  return (
    <div className={`flex h-screen ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 dark:text-white">
        <div className="container mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}