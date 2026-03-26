import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Users, FileCheck, Landmark, TrendingUp } from 'lucide-react';

interface Stats {
  expedientes: number;
  clientes: number;
  movimientos: number;
  tribunales: number;
  expedientesActivos: number;
}

type StatCard = {
  title: string;
  color: string;
  iconBg: string;
  href?: string;
  icon?: typeof FileText;
  value?: number;
  imageSrc?: string;
  imageAlt?: string;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    expedientes: 0,
    clientes: 0,
    movimientos: 0,
    tribunales: 0,
    expedientesActivos: 0,
  });
  const [statsLoaded, setStatsLoaded] = useState(false);

  const fetchStats = async () => {
    const [expedientes, clientes, movimientos, tribunales, activos] = await Promise.all([
      supabase.from('expedientes').select('*', { count: 'exact', head: true }),
      supabase.from('clientes').select('*', { count: 'exact', head: true }),
      supabase.from('movimientos').select('*', { count: 'exact', head: true }),
      supabase.from('tribunal_laboral').select('*', { count: 'exact', head: true }),
      supabase.from('expedientes').select('*', { count: 'exact', head: true }).eq('estatus', 'Activo'),
    ]);

    setStats({
      expedientes: expedientes.count || 0,
      clientes: clientes.count || 0,
      movimientos: movimientos.count || 0,
      tribunales: tribunales.count || 0,
      expedientesActivos: activos.count || 0,
    });
    setStatsLoaded(true);
  };

  const statCards: StatCard[] = [
    {
      title: 'Poder en Linea',
      imageSrc: '/pel.png',
      imageAlt: 'Poder en Linea',
      href: 'https://poderenlinea.gob.mx/auth/login',
      color: 'bg-lime-50 text-lime-900',
      iconBg: 'bg-lime-100',
      icon: FileText,
    },
    {
      title: 'Portal de Servicios en Linea del Poder Judicial de la Federacion',
      imageSrc: '/pjf.png',
      imageAlt: 'Portal de Servicios en Linea del Poder Judicial de la Federacion',
      href: 'https://www.serviciosenlinea.pjf.gob.mx/juicioenlinea',
      color: 'bg-cyan-50 text-cyan-900',
      iconBg: 'bg-cyan-100',
      icon: FileText,
    },
    {
      title: 'Suprema Corte de Justicia de la Nacion',
      imageSrc: '/scjn.png',
      imageAlt: 'Suprema Corte de Justicia de la Nacion',
      href: 'https://www.scjn.gob.mx',
      color: 'bg-violet-50 text-violet-900',
      iconBg: 'bg-violet-100',
      icon: FileText,
    },
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
        <button
          onClick={() => void fetchStats()}
          className="mt-3 px-4 py-2 rounded-lg bg-blue-900 text-white text-sm hover:bg-blue-800 transition-colors"
        >
          {statsLoaded ? 'Actualizar resumen' : 'Cargar resumen'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const cardContent = stat.imageSrc ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-left max-w-[60%]">{stat.title}</p>
              <img src={stat.imageSrc} alt={stat.imageAlt} className="h-24 w-auto object-contain flex-shrink-0" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.iconBg} p-3 rounded-lg`}>{Icon && <Icon className="w-8 h-8" />}</div>
            </div>
          );

          if (stat.href) {
            return (
              <a
                key={index}
                href={stat.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${stat.color} rounded-lg shadow-md p-6 border border-gray-200 transition-transform hover:scale-105 block`}
              >
                {cardContent}
              </a>
            );
          }

          return (
            <div
              key={index}
              className={`${stat.color} rounded-lg shadow-md p-6 border border-gray-200 transition-transform hover:scale-105`}
            >
              {cardContent}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Bienvenido al Sistema de Gestion Juridica</h3>
        <div className="space-y-3 text-gray-700">
          <p>Este sistema le permite gestionar todos los aspectos de su practica legal:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Expedientes:</strong> Registre y de seguimiento a todos sus casos legales con informacion completa de
              partes, juzgados, estatus y notas.
            </li>
            <li>
              <strong>Movimientos:</strong> Lleve un registro cronologico de todas las actuaciones en cada expediente.
            </li>
            <li>
              <strong>Clientes:</strong> Mantenga una base de datos completa de sus clientes con toda su informacion de
              contacto.
            </li>
            <li>
              <strong>Tribunal Laboral:</strong> Administre el directorio de tribunales con sus datos de contacto y ubicacion.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
