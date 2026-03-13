'use client';

import { useState } from 'react';
import { Eye, EyeOff, Scale } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Demo frontend only: no backend validation.
    setTimeout(() => {
      setLoading(false);
      setEmail('');
      setPassword('');
      onLoginSuccess();
    }, 250);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Demo frontend only: simulate account creation and return to login mode.
    setTimeout(() => {
      setLoading(false);
      setEmail('');
      setPassword('');
      setIsLogin(true);
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isLogin) {
      void handleLogin(e);
    } else {
      void handleRegister(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-blue-900 px-6 py-8 text-white">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Scale className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Gestión Jurídica</h1>
            </div>
            <p className="text-center text-blue-100 text-sm">Administración Legal Profesional</p>
          </div>

          <div className="px-6 py-8">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  placeholder="tu@correo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-4">{isLogin ? '¿No tienes cuenta?' : 'Ya tienes cuenta?'}</p>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="w-full text-blue-900 font-medium py-2 rounded-lg hover:bg-blue-50 transition-all border border-blue-900"
              >
                {isLogin ? 'Crear una cuenta' : 'Iniciar sesion'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-blue-100 text-xs mt-6">Sistema seguro de gestión legal - 2026</p>
      </div>
    </div>
  );
}
