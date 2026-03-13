import { useState, useEffect } from 'react';
import { supabase, type Movimiento, type Expediente } from '../lib/supabase';
import { Plus, FileCheck, Search } from 'lucide-react';

const initialExpedientes: Expediente[] = [
  {
    id: 'exp-mov-1',
    numero_expediente: 'EXP-2026-010',
    partes: 'Ana Torres vs Comercial Nova',
    juzgado: 'Juzgado Segundo',
    estatus: 'Activo',
    notas: 'En etapa probatoria',
    cliente_id: 'cli-x',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialMovimientos: Movimiento[] = [
  {
    id: 'mov-1',
    expediente_id: 'exp-mov-1',
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'Presentacion de pruebas',
    descripcion: 'Se agrego documental privada.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mov-2',
    expediente_id: 'exp-mov-1',
    fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    tipo: 'Acuerdo',
    descripcion: 'Se fijo nueva fecha de audiencia.',
    created_at: new Date().toISOString(),
  },
];

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>(initialMovimientos);
  const [expedientes, setExpedientes] = useState<Expediente[]>(initialExpedientes);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    expediente_id: '',
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'Audiencia',
    descripcion: ''
  });

  useEffect(() => {
    fetchMovimientos();
    fetchExpedientes();
  }, []);

  const fetchMovimientos = async () => {
    const { data } = await supabase
      .from('movimientos')
      .select('*')
      .order('fecha', { ascending: false });
    if (data) setMovimientos(data);
  };

  const fetchExpedientes = async () => {
    const { data } = await supabase
      .from('expedientes')
      .select('*')
      .order('numero_expediente');
    if (data) setExpedientes(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('movimientos').insert([formData]);

    if (!error) {
      setFormData({
        expediente_id: '',
        fecha: new Date().toISOString().split('T')[0],
        tipo: 'Audiencia',
        descripcion: ''
      });
      setShowForm(false);
      fetchMovimientos();
    }
  };

  const getExpedienteNumero = (id: string) => {
    return expedientes.find(exp => exp.id === id)?.numero_expediente || 'N/A';
  };

  const filteredMovimientos = movimientos.filter(mov =>
    getExpedienteNumero(mov.expediente_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    mov.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mov.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileCheck className="w-8 h-8 text-blue-900" />
          <h2 className="text-2xl font-bold text-gray-800">Movimientos</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Movimiento
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Nuevo Movimiento</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expediente *
              </label>
              <select
                required
                value={formData.expediente_id}
                onChange={(e) => setFormData({ ...formData, expediente_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              >
                <option value="">Seleccionar expediente</option>
                {expedientes.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.numero_expediente} - {exp.partes}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              >
                <option>Audiencia</option>
                <option>Presentación de Pruebas</option>
                <option>Alegatos</option>
                <option>Resolución</option>
                <option>Apelación</option>
                <option>Otros</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                required
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                placeholder="Detalle del movimiento..."
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
                Guardar Movimiento
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
              placeholder="Buscar movimientos..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Expediente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Descripción
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovimientos.map((mov) => (
                <tr key={mov.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(mov.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getExpedienteNumero(mov.expediente_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {mov.tipo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {mov.descripcion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
