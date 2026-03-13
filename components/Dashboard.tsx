'use client';

import { FileCheck, FileText, Landmark, TrendingUp, Users } from 'lucide-react';

const stats = {
  expedientes: 12,
  clientes: 8,
  movimientos: 24,
  tribunales: 5,
  expedientesActivos: 9,
};

export default function Dashboard() {
  const statCards = [
    {
      title: 'Total Expedientes',
      value: stats.expedientes,
      icon: FileText,
      color: 'bg-blue-50 text-blue-900',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Expedientes Activos',
      value: stats.expedientesActivos,
      icon: TrendingUp,
      color: 'bg-green-50 text-green-900',
      iconBg: 'bg-green-100',
    },
    {
      title: 'Clientes',
      value: stats.clientes,
      icon: Users,
      color: 'bg-orange-50 text-orange-900',
      iconBg: 'bg-orange-100',
    },
    {
      title: 'Movimientos',
      value: stats.movimientos,
      icon: FileCheck,
      color: 'bg-cyan-50 text-cyan-900',
      iconBg: 'bg-cyan-100',
    },
    {
      title: 'Tribunales',
      value: stats.tribunales,
      icon: Landmark,
      color: 'bg-slate-50 text-slate-900',
      iconBg: 'bg-slate-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Panel de Control</h2>
        <p className="text-gray-600">Resumen general de gestion juridica</p>
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
    </div>
  );
}
