import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}