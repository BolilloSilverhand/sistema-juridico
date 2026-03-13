'use client';

import { useState } from 'react';
import type { Cliente, Expediente } from '@/lib/supabase';
import { FileText, Plus, Search } from 'lucide-react';

const initialClientes: Cliente[] = [
  { id: 'c1', nombre: 'Juan Perez', created_at: new Date().toISOString() },
  { id: 'c2', nombre: 'Maria Lopez', created_at: new Date().toISOString() },
];

const initialExpedientes: Expediente[] = [
  {
    id: 'e1',
    numero_expediente: 'EXP-2026-001',
    partes: 'Juan Perez vs Empresa XYZ',
    juzgado: 'Juzgado Primero',
    estatus: 'Activo',
    notas: 'Pendiente audiencia inicial',
    cliente_id: 'c1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState<Expediente[]>(initialExpedientes);
  const [clientes] = useState<Cliente[]>(initialClientes);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    numero_expediente: '',
    partes: '',
    juzgado: '',
    estatus: 'Activo',
    notas: '',
    cliente_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoExpediente: Expediente = {
      id: crypto.randomUUID(),
      numero_expediente: formData.numero_expediente,
      partes: formData.partes,
      juzgado: formData.juzgado,
      estatus: formData.estatus,
      notas: formData.notas,
      cliente_id: formData.cliente_id || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setExpedientes((prev) => [nuevoExpediente, ...prev]);
    setFormData({
      numero_expediente: '',
      partes: '',
      juzgado: '',
      estatus: 'Activo',
      notas: '',
      cliente_id: '',
    });
    setShowForm(false);
  };

  const filteredExpedientes = expedientes.filter(
    (exp) =>
      exp.numero_expediente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.partes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.juzgado.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-900" />
          <h2 className="text-2xl font-bold text-gray-800">Expedientes</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Expediente
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Nuevo Expediente</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expediente-numero" className="block text-sm font-medium text-gray-700 mb-1">Numero de Expediente *</label>
              <input id="expediente-numero" type="text" required value={formData.numero_expediente} onChange={(e) => setFormData({ ...formData, numero_expediente: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent" />
            </div>

            <div>
              <label htmlFor="expediente-cliente" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select id="expediente-cliente" value={formData.cliente_id} onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent">
                <option value="">Sin cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label htmlFor="expediente-partes" className="block text-sm font-medium text-gray-700 mb-1">Partes *</label>
              <input id="expediente-partes" type="text" required value={formData.partes} onChange={(e) => setFormData({ ...formData, partes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent" placeholder="Actor vs Demandado" />
            </div>

            <div>
              <label htmlFor="expediente-juzgado" className="block text-sm font-medium text-gray-700 mb-1">Juzgado *</label>
              <input id="expediente-juzgado" type="text" required value={formData.juzgado} onChange={(e) => setFormData({ ...formData, juzgado: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent" />
            </div>

            <div>
              <label htmlFor="expediente-estatus" className="block text-sm font-medium text-gray-700 mb-1">Estatus *</label>
              <select id="expediente-estatus" value={formData.estatus} onChange={(e) => setFormData({ ...formData, estatus: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent">
                <option>Activo</option>
                <option>En tramite</option>
                <option>Suspendido</option>
                <option>Concluido</option>
                <option>Archivado</option>
              </select>
            </div>

            <div className="col-span-2">
              <label htmlFor="expediente-notas" className="block text-sm font-medium text-gray-700 mb-1">Notas y Pendientes</label>
              <textarea id="expediente-notas" value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent" placeholder="Anadir notas sobre pendientes del juicio..." />
            </div>

            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800">Guardar Expediente</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Buscar expedientes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">No. Expediente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Partes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Juzgado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estatus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Notas</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpedientes.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exp.numero_expediente}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{exp.partes}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{exp.juzgado}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{exp.estatus}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{exp.notas || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
