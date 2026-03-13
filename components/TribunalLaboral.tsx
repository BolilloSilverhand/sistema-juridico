'use client';

import { useState } from 'react';
import type { TribunalLaboral } from '@/lib/supabase';
import { Landmark, Plus, Search } from 'lucide-react';

const initialTribunales: TribunalLaboral[] = [
  {
    id: 't1',
    nombre: 'Tribunal Laboral Centro',
    direccion: 'Av. Juarez 100, CDMX',
    telefono: '555-111-2222',
    email: 'centro@tribunal.gob.mx',
    created_at: new Date().toISOString(),
  },
];

export default function TribunalLaboralComponent() {
  const [tribunales, setTribunales] = useState<TribunalLaboral[]>(initialTribunales);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ nombre: '', direccion: '', telefono: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoTribunal: TribunalLaboral = {
      id: crypto.randomUUID(),
      nombre: formData.nombre,
      direccion: formData.direccion,
      telefono: formData.telefono || undefined,
      email: formData.email || undefined,
      created_at: new Date().toISOString(),
    };

    setTribunales((prev) => [nuevoTribunal, ...prev]);
    setFormData({ nombre: '', direccion: '', telefono: '', email: '' });
    setShowForm(false);
  };

  const filteredTribunales = tribunales.filter(
    (tribunal) =>
      tribunal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tribunal.direccion.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Landmark className="w-8 h-8 text-blue-900" />
          <h2 className="text-2xl font-bold text-gray-800">Tribunal Laboral</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Tribunal
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Nuevo Tribunal</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="tribunal-nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Tribunal *</label>
              <input id="tribunal-nombre" type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent" />
            </div>

            <div className="col-span-2">
              <label htmlFor="tribunal-direccion" className="block text-sm font-medium text-gray-700 mb-1">Direccion *</label>
              <textarea id="tribunal-direccion" required value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent" />
            </div>

            <div>
              <label htmlFor="tribunal-telefono" className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
              <input id="tribunal-telefono" type="tel" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent" />
            </div>

            <div>
              <label htmlFor="tribunal-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="tribunal-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent" />
            </div>

            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800">Guardar Tribunal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Buscar tribunales..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Direccion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Telefono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTribunales.map((tribunal) => (
                <tr key={tribunal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{tribunal.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{tribunal.direccion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tribunal.telefono || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{tribunal.email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
