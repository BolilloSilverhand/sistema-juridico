import { useState, useEffect } from 'react';
import { supabase, type TribunalLaboral } from '../lib/supabase';
import { Plus, Landmark, Search, ChevronDown, ChevronUp, Check, X } from 'lucide-react';

export default function TribunalLaboralComponent() {
  const [tribunales, setTribunales] = useState<TribunalLaboral[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTribId, setExpandedTribId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    hoja_no_conciliacion: false
  });

  useEffect(() => {
    fetchTribunales();
  }, []);

  const fetchTribunales = async () => {
    const { data } = await supabase
      .from('tribunal_laboral')
      .select('*')
      .order('nombre');
    if (data) setTribunales(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('tribunal_laboral').insert([formData]);

    if (!error) {
      setFormData({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        hoja_no_conciliacion: false
      });
      setShowForm(false);
      fetchTribunales();
    }
  };

  const handleUpdateConciliacion = async (id: string, value: boolean) => {
    const { error } = await supabase
      .from('tribunal_laboral')
      .update({ hoja_no_conciliacion: value })
      .eq('id', id);

    if (!error) {
      fetchTribunales();
    }
  };

  const filteredTribunales = tribunales.filter(tribunal =>
    tribunal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tribunal.direccion.toLowerCase().includes(searchTerm.toLowerCase())
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Tribunal *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <textarea
                required
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hoja_no_conciliacion}
                  onChange={(e) => setFormData({ ...formData, hoja_no_conciliacion: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Hoja de No Conciliación</span>
              </label>
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
                Guardar Tribunal
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
              placeholder="Buscar tribunales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredTribunales.map((tribunal) => (
            <div key={tribunal.id} className="border-b border-gray-200 last:border-b-0">
              <button
                onClick={() => setExpandedTribId(expandedTribId === tribunal.id ? null : tribunal.id)}
                className="w-full px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{tribunal.nombre}</h3>
                      <p className="text-sm text-gray-600">{tribunal.direccion}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">{tribunal.telefono || '-'}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">{tribunal.email || '-'}</p>
                      </div>
                    </div>
                    <div>
                      {tribunal.hoja_no_conciliacion && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                          <Check className="w-3 h-3" /> Hoja No Conc.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {expandedTribId === tribunal.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedTribId === tribunal.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Detalles del Tribunal</h4>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                      <div>
                        <p className="text-xs text-gray-600">Dirección</p>
                        <p className="text-sm text-gray-900">{tribunal.direccion}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Teléfono</p>
                          <p className="text-sm text-gray-900">{tribunal.telefono || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Email</p>
                          <p className="text-sm text-gray-900">{tribunal.email || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Hoja de No Conciliación</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateConciliacion(tribunal.id, true)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          tribunal.hoja_no_conciliacion
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Check className="w-5 h-5" />
                        Sí
                      </button>
                      <button
                        onClick={() => handleUpdateConciliacion(tribunal.id, false)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          !tribunal.hoja_no_conciliacion
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <X className="w-5 h-5" />
                        No
                      </button>
                    </div>
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
