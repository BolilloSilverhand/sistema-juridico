'use client';

import { useState } from 'react';
import type { Cliente } from '@/lib/supabase';
import { Plus, Search, Users } from 'lucide-react';

const initialClientes: Cliente[] = [
  {
    id: 'c1',
    nombre: 'Juan Perez',
    email: 'juan@example.com',
    telefono: '555-100-2000',
    direccion: 'Av. Reforma 100, CDMX',
    created_at: new Date().toISOString(),
  },
  {
    id: 'c2',
    nombre: 'Maria Lopez',
    email: 'maria@example.com',
    telefono: '555-300-4000',
    direccion: 'Col. Centro, Puebla',
    created_at: new Date().toISOString(),
  },
];

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoCliente: Cliente = {
      id: crypto.randomUUID(),
      nombre: formData.nombre,
      email: formData.email || undefined,
      telefono: formData.telefono || undefined,
      direccion: formData.direccion || undefined,
      created_at: new Date().toISOString(),
    };

    setClientes((prev) => [nuevoCliente, ...prev]);
    setFormData({ nombre: '', email: '', telefono: '', direccion: '' });
    setShowForm(false);
  };

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono?.includes(searchTerm),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-900" />
          <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Nuevo Cliente</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="cliente-nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                id="cliente-nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="cliente-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="cliente-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="cliente-telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Telefono
              </label>
              <input
                id="cliente-telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="cliente-direccion" className="block text-sm font-medium text-gray-700 mb-1">
                Direccion
              </label>
              <textarea
                id="cliente-direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div className="col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
              >
                Guardar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Telefono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Direccion</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cliente.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{cliente.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cliente.telefono || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{cliente.direccion || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
