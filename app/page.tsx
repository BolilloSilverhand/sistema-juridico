'use client';

import { useEffect, useState } from 'react';
import {
  FileCheck,
  FileText,
  Landmark,
  LayoutDashboard,
  LogOut,
  Scale,
  Users,
} from 'lucide-react';
import Clientes from '@/components/Clientes';
import Dashboard from '@/components/Dashboard';
import Expedientes from '@/components/Expedientes';
import Login from '@/components/Login';
import Movimientos from '@/components/Movimientos';
import TribunalLaboral from '@/components/TribunalLaboral';
import { supabase } from '@/lib/supabase';

type Section = 'dashboard' | 'expedientes' | 'movimientos' | 'clientes' | 'tribunal';

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setUserEmail(session.user.email);
        setIsAuthenticated(true);
      }

      setLoading(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        setIsAuthenticated(true);
      } else {
        setUserEmail('');
        setIsAuthenticated(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserEmail('');
    setActiveSection('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <Scale className="w-12 h-12 text-blue-900" />
          </div>
          <p className="text-gray-600 mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

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
        return <Expedientes />;
      case 'movimientos':
        return <Movimientos />;
      case 'clientes':
        return <Clientes />;
      case 'tribunal':
        return <TribunalLaboral />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 animate-slide-in-up">
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold">Sistema de Gestión Jurídica</h1>
                <p className="text-sm text-blue-100">Administración Legal Profesional</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-blue-100">{userEmail}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderContent()}</main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-600">
            Sistema de Gestión Jurídica - {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
