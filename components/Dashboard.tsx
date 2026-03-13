'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Users, FileCheck, Landmark, TrendingUp } from 'lucide-react';

interface Stats {
  expedientes: number;
  clientes: number;
  movimientos: number;
  tribunales: number;
  expedientesActivos: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    expedientes: 0,
    clientes: 0,
    movimientos: 0,
    tribunales: 0,
    expedientesActivos: 0
  });

  async function fetchStats() {
    const [expedientes, clientes, movimientos, tribunales, activos] = await Promise.all([
      supabase.from('expedientes').select('*', { count: 'exact', head: true }),
      supabase.from('clientes').select('*', { count: 'exact', head: true }),
      supabase.from('movimientos').select('*', { count: 'exact', head: true }),
      supabase.from('tribunal_laboral').select('*', { count: 'exact', head: true }),
      supabase.from('expedientes').select('*', { count: 'exact', head: true }).eq('estatus', 'Activo')
    ]);

    setStats({
      expedientes: expedientes.count || 0,
      clientes: clientes.count || 0,
      movimientos: movimientos.count || 0,
      tribunales: tribunales.count || 0,
      expedientesActivos: activos.count || 0
    });
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Expedientes',
      value: stats.expedientes,
      icon: FileText,
      color: 'bg-blue-50 text-blue-900',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Expedientes Activos',
      value: stats.expedientesActivos,
      icon: TrendingUp,
      color: 'bg-green-50 text-green-900',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Clientes',
      value: stats.clientes,
      icon: Users,
      color: 'bg-orange-50 text-orange-900',
      iconBg: 'bg-orange-100'
    },
    {
      title: 'Movimientos',
      value: stats.movimientos,
      icon: FileCheck,
      color: 'bg-cyan-50 text-cyan-900',
      iconBg: 'bg-cyan-100'
    },
    {
      title: 'Tribunales',
      value: stats.tribunales,
      icon: Landmark,
      color: 'bg-slate-50 text-slate-900',
      iconBg: 'bg-slate-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Panel de Control</h2>
        <p className="text-gray-600">Resumen general de gestión jurí­dica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.color} rounded-lg shadow-md p-6 border border-gray-200 transition-transform hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.iconBg} p-3 rounded-lg`}>
                  <Icon className="w-8 h-8" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Bienvenido al Sistema de Gestión Jurídica</h3>
        <div className="space-y-3 text-gray-700">
          <p>Este sistema le permite gestionar todos los aspectos de su práctica legal:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Expedientes:</strong> Registre y dé seguimiento a todos sus casos legales con información completa de partes, juzgados, estatus y notas.</li>
            <li><strong>Movimientos:</strong> Lleve un registro cronológico de todas las actuaciones en cada expediente.</li>
            <li><strong>Clientes:</strong> Mantenga una base de datos completa de sus clientes con toda su información de contacto.</li>
            <li><strong>Tribunal Laboral:</strong> Administre el directorio de tribunales con sus datos de contacto y ubicación.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

