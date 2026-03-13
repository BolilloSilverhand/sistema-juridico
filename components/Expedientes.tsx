'use client';

import { useEffect, useState } from 'react';
import { supabase, type Cliente, type Expediente, type Movimiento } from '@/lib/supabase';
import { ChevronDown, ChevronUp, FileText, Plus, Search, Trash2 } from 'lucide-react';

const initialClientes: Cliente[] = [
  {
    id: 'cli-seed-1',
    nombre: 'Carlos Ramirez',
    email: 'carlos@example.com',
    telefono: '555-101-2020',
    direccion: 'Col. Centro',
    monto_pactado: 12000,
    total_adeudo: 8000,
    created_at: new Date().toISOString(),
  },
];

const initialExpedientes: Expediente[] = [
  {
    id: 'exp-seed-1',
    numero_expediente: 'EXP-2026-001',
    partes: 'Carlos Ramirez vs Empresa Delta',
    juzgado: 'Juzgado Primero Laboral',
    estatus: 'Activo',
    notas: 'Revision de pruebas pendientes.',
    cliente_id: 'cli-seed-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialMovimientos: Movimiento[] = [
  {
    id: 'mov-seed-1',
    expediente_id: 'exp-seed-1',
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'Audiencia inicial',
    descripcion: 'Se recibio escrito de contestacion.',
    created_at: new Date().toISOString(),
  },
];

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState<Expediente[]>(initialExpedientes);
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [movimientos, setMovimientos] = useState<Movimiento[]>(initialMovimientos);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedExpId, setExpandedExpId] = useState<string | null>(null);
  const [showMovForm, setShowMovForm] = useState<string | null>(null);
  const [newMovimiento, setNewMovimiento] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: '',
    descripcion: '',
  });
  const [formData, setFormData] = useState({
    numero_expediente: '',
    partes: '',
    juzgado: '',
    estatus: 'Activo',
    cliente_id: '',
  });

  useEffect(() => {
    void fetchExpedientes();
    void fetchClientes();
    void fetchMovimientos();
  }, []);

  const fetchExpedientes = async () => {
    const { data } = await supabase.from('expedientes').select('*').order('created_at', { ascending: false });
    if (data) setExpedientes(data);
  };

  const fetchClientes = async () => {
    const { data } = await supabase.from('clientes').select('*').order('nombre');
    if (data) setClientes(data);
  };

  const fetchMovimientos = async () => {
    const { data } = await supabase.from('movimientos').select('*').order('fecha', { ascending: false });
    if (data) setMovimientos(data);
  };

  const getExpedienteMovimientos = (expId: string) => movimientos.filter((m) => m.expediente_id === expId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('expedientes').insert([
      {
        ...formData,
        cliente_id: formData.cliente_id || null,
      },
    ]);

    if (!error) {
      setFormData({ numero_expediente: '', partes: '', juzgado: '', estatus: 'Activo', cliente_id: '' });
      setShowForm(false);
      await fetchExpedientes();
    }
  };

  const handleAddMovimiento = async (e: React.FormEvent, expId: string) => {
    e.preventDefault();
    const { error } = await supabase.from('movimientos').insert([
      {
        expediente_id: expId,
        ...newMovimiento,
      },
    ]);

    if (!error) {
      setNewMovimiento({ fecha: new Date().toISOString().split('T')[0], tipo: '', descripcion: '' });
      setShowMovForm(null);
      await fetchMovimientos();
      await fetchExpedientes();
    }
  };

  const handleDeleteMovimiento = async (movId: string) => {
    await supabase.from('movimientos').delete().eq('id', movId);
    await fetchMovimientos();
  };

  const sortedExpedientes = [...expedientes].sort((a, b) => {
    const movimientosA = getExpedienteMovimientos(a.id);
    const movimientosB = getExpedienteMovimientos(b.id);
    const lastA = movimientosA[0]?.fecha || a.created_at;
    const lastB = movimientosB[0]?.fecha || b.created_at;
    return new Date(lastB).getTime() - new Date(lastA).getTime();
  });

  const filteredExpedientes = sortedExpedientes.filter(
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
              <label htmlFor="expediente-numero" className="block text-sm font-medium text-gray-700 mb-1">
                Numero de Expediente *
              </label>
              <input
                id="expediente-numero"
                type="text"
                required
                value={formData.numero_expediente}
                onChange={(e) => setFormData({ ...formData, numero_expediente: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="expediente-cliente" className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                id="expediente-cliente"
                value={formData.cliente_id}
                onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              >
                <option value="">Sin cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label htmlFor="expediente-partes" className="block text-sm font-medium text-gray-700 mb-1">
                Partes *
              </label>
              <input
                id="expediente-partes"
                type="text"
                required
                value={formData.partes}
                onChange={(e) => setFormData({ ...formData, partes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                placeholder="Actor vs Demandado"
              />
            </div>

            <div>
              <label htmlFor="expediente-juzgado" className="block text-sm font-medium text-gray-700 mb-1">
                Juzgado *
              </label>
              <input
                id="expediente-juzgado"
                type="text"
                required
                value={formData.juzgado}
                onChange={(e) => setFormData({ ...formData, juzgado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="expediente-estatus" className="block text-sm font-medium text-gray-700 mb-1">
                Estatus *
              </label>
              <select
                id="expediente-estatus"
                value={formData.estatus}
                onChange={(e) => setFormData({ ...formData, estatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              >
                <option>Activo</option>
                <option>En tramite</option>
                <option>Suspendido</option>
                <option>Concluido</option>
                <option>Archivado</option>
              </select>
            </div>

            <div className="col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800">
                Guardar Expediente
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
              placeholder="Buscar expedientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredExpedientes.map((exp) => (
            <div key={exp.id} className="border-b border-gray-200 last:border-b-0">
              <button
                onClick={() => setExpandedExpId(expandedExpId === exp.id ? null : exp.id)}
                className="w-full px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.numero_expediente}</h3>
                      <p className="text-sm text-gray-600">{exp.partes}</p>
                      <p className="text-xs text-gray-500">{exp.juzgado}</p>
                    </div>
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {exp.estatus}
                    </span>
                  </div>
                </div>
                {expandedExpId === exp.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedExpId === exp.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Movimientos</h4>
                    <div className="space-y-2 mb-4">
                      {getExpedienteMovimientos(exp.id).map((mov) => (
                        <div
                          key={mov.id}
                          className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-start"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{mov.tipo}</p>
                            <p className="text-sm text-gray-600">{mov.descripcion}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(mov.fecha).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteMovimiento(mov.id)}
                            aria-label="Eliminar movimiento"
                            title="Eliminar movimiento"
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {showMovForm === exp.id ? (
                      <form
                        onSubmit={(e) => handleAddMovimiento(e, exp.id)}
                        className="bg-white p-3 rounded-lg border border-gray-300 space-y-3"
                      >
                        <div>
                          <label htmlFor={`mov-fecha-${exp.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                            Fecha
                          </label>
                          <input
                            id={`mov-fecha-${exp.id}`}
                            type="date"
                            value={newMovimiento.fecha}
                            onChange={(e) => setNewMovimiento({ ...newMovimiento, fecha: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor={`mov-tipo-${exp.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                            Tipo de Movimiento *
                          </label>
                          <input
                            id={`mov-tipo-${exp.id}`}
                            type="text"
                            required
                            value={newMovimiento.tipo}
                            onChange={(e) => setNewMovimiento({ ...newMovimiento, tipo: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                            placeholder="Ej: Presentacion de demanda, Sentencia..."
                          />
                        </div>
                        <div>
                          <label htmlFor={`mov-descripcion-${exp.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                            Descripcion
                          </label>
                          <textarea
                            id={`mov-descripcion-${exp.id}`}
                            value={newMovimiento.descripcion}
                            onChange={(e) => setNewMovimiento({ ...newMovimiento, descripcion: e.target.value })}
                            rows={2}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowMovForm(null)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-2 py-1 bg-blue-900 text-white rounded text-sm hover:bg-blue-800"
                          >
                            Guardar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowMovForm(exp.id)}
                        className="w-full px-3 py-2 border border-blue-900 text-blue-900 rounded-lg text-sm hover:bg-blue-50"
                      >
                        + Anadir Movimiento
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
