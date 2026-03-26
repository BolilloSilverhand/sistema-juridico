'use client';

import { useEffect, useState } from 'react';
import { FileCheck, FileText, Landmark, LayoutDashboard, LogOut, Scale, Users } from 'lucide-react';
import Clientes from '@/components/Clientes';
import Dashboard from '@/components/Dashboard';
import Expedientes from '@/components/Expedientes';
import Login from '@/components/Login';
import Movimientos from '@/components/Movimientos';
import TribunalLaboral from '@/components/TribunalLaboral';
import { AuthServiceError, authService, type AuthUser } from '@/lib/services/auth';

type Section = 'dashboard' | 'expedientes' | 'movimientos' | 'clientes' | 'tribunal';

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authNotice, setAuthNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    try {
      const savedUser = window.localStorage.getItem('auth_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as AuthUser;
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch {
      window.localStorage.removeItem('auth_user');
    } finally {
      setIsSessionReady(true);
    }
  }, []);

  const navigation = [
    { id: 'dashboard' as Section, name: 'Panel de Control', icon: LayoutDashboard },
    { id: 'expedientes' as Section, name: 'Expedientes', icon: FileText },
    { id: 'movimientos' as Section, name: 'Movimientos', icon: FileCheck },
    { id: 'clientes' as Section, name: 'Clientes', icon: Users },
    { id: 'tribunal' as Section, name: 'Tribunal Laboral', icon: Landmark },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'expedientes':
        return <Expedientes currentUser={currentUser} />;
      case 'movimientos':
        return <Movimientos />;
      case 'clientes':
        return <Clientes currentUser={currentUser} />;
      case 'tribunal':
        return <TribunalLaboral />;
      default:
        return <Dashboard />;
    }
  };

  if (!isSessionReady) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Login
        notice={authNotice}
        onLoginSuccess={(user, message) => {
          setCurrentUser(user);
          setAuthNotice({ type: 'success', message });
          setIsAuthenticated(true);
          window.localStorage.setItem('auth_user', JSON.stringify(user));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 animate-slide-in-up">
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Scale className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold">Sistema de Gestión Jurídica</h1>
                <p className="text-sm text-blue-100">Administración Legal Profesional</p>
                {(currentUser?.name || currentUser?.email) && (
                  <p className="text-xs text-blue-100 mt-1">
                    Buen día {currentUser.name ? `${currentUser.name} ` : ''}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={async () => {
                setIsLoggingOut(true);
                try {
                  const result = await authService.logout();

                  if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('auth_user');
                    window.sessionStorage.clear();
                  }

                  setIsAuthenticated(false);
                  setCurrentUser(null);
                  setAuthNotice({ type: 'success', message: result.message });
                } catch (err) {
                  if (err instanceof AuthServiceError) {
                    setAuthNotice({ type: 'error', message: err.message });
                  } else {
                    setAuthNotice({ type: 'error', message: 'No se pudo cerrar la sesion.' });
                  }
                } finally {
                  setIsLoggingOut(false);
                }
              }}
              disabled={isLoggingOut}
              className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {isLoggingOut ? 'Cerrando...' : 'Cerrar sesion'}
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeSection === item.id
                      ? 'border-blue-900 text-blue-900 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {authNotice?.message && (
          <div
            className={`mb-4 p-3 rounded-lg border text-sm ${
              authNotice.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {authNotice.message}
          </div>
        )}
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-600">Sistema de Gestión Jurídica - {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
