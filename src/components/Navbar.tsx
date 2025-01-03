import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Navbar() {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Trophy className="h-6 w-6" />
              <span className="font-bold text-xl">Club Deportivo</span>
            </Link>
            <Link
              to="/invoices"
              className={`flex items-center space-x-1 hover:text-blue-200 ${
                location.pathname === '/invoices' ? 'text-blue-200' : ''
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Facturas</span>
            </Link>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-1 hover:text-blue-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </nav>
  );
}