/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { supabase, type Cliente, type Expediente } from '@/lib/supabase';
import {
  caseEventsService,
  CaseEventsServiceError,
  type CaseEvent,
  type UpdateCaseEventPayload,
} from '@/lib/services/caseEvents';
import type { AuthUser } from '@/lib/services/auth';
import { ChevronDown, ChevronUp, FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react';

const initialClientes: Cliente[] = [];

const initialExpedientes: Expediente[] = [];

const initialMovimientos: CaseEvent[] = [];

interface ExpedientesProps {
  currentUser: AuthUser | null;
}

export default function Expedientes({ currentUser }: ExpedientesProps) {
  const [expedientes, setExpedientes] = useState<Expediente[]>(initialExpedientes);
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [movimientos, setMovimientos] = useState<CaseEvent[]>(initialMovimientos);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedExpId, setExpandedExpId] = useState<string | null>(null);
  const [showMovForm, setShowMovForm] = useState<string | null>(null);
  const [editingMovId, setEditingMovId] = useState<string | null>(null);
  const [eventsMessage, setEventsMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [newMovimiento, setNewMovimiento] = useState({
    event_date: new Date().toISOString().split('T')[0],
    event_type: '',
    description: '',
    is_payment: false,
  });
  const [editMovimiento, setEditMovimiento] = useState<{
    legal_case_id: string;
    event_date: string;
    event_type: string;
    description: string;
    is_payment: boolean;
  }>({
    legal_case_id: '',
    event_date: '',
    event_type: '',
    description: '',
    is_payment: false,
  });
  const [formData, setFormData] = useState({
    numero_expediente: '',
    partes: '',
    juzgado: '',
    estatus: 'Activo',
    cliente_id: '',
  });

  async function fetchExpedientes() {
    const { data } = await supabase.from('expedientes').select('*').order('created_at', { ascending: false });
    if (data) setExpedientes(data);
  }

  async function fetchClientes() {
    const { data } = await supabase.from('clientes').select('*').order('nombre');
    if (data) setClientes(data);
  }

  async function fetchMovimientos() {
    try {
      const data = await caseEventsService.getCaseEvents({
        search: searchTerm || undefined,
      });
      setMovimientos(data);
    } catch (error) {
      if (error instanceof CaseEventsServiceError) {
        setEventsMessage({ type: 'error', text: error.message });
      } else {
        setEventsMessage({ type: 'error', text: 'No se pudieron cargar los eventos.' });
      }
    }
  }

  useEffect(() => {
    void fetchExpedientes();
    void fetchClientes();
  }, []);

  useEffect(() => {
    void fetchMovimientos();
  }, [searchTerm]);

  const getCurrentUserId = () => {
    const id = Number(currentUser?.id);
    if (!Number.isFinite(id)) return null;
    return id;
  };

  const getExpedienteMovimientos = (expId: string) => movimientos.filter((m) => m.legal_case_id === expId);

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
    setValidationErrors([]);
    setEventsMessage(null);

    const userId = getCurrentUserId();
    if (!userId) {
      setEventsMessage({ type: 'error', text: 'No se encontro un usuario valido para registrar el evento.' });
      return;
    }

    try {
      await caseEventsService.createCaseEvent({
        user_id: userId,
        legal_case_id: expId,
        event_date: newMovimiento.event_date || undefined,
        event_type: newMovimiento.event_type,
        description: newMovimiento.description,
        is_payment: newMovimiento.is_payment,
      });

      setNewMovimiento({
        event_date: new Date().toISOString().split('T')[0],
        event_type: '',
        description: '',
        is_payment: false,
      });
      setShowMovForm(null);
      setEventsMessage({ type: 'success', text: 'Evento creado correctamente.' });
      await fetchMovimientos();
      await fetchExpedientes();
    } catch (error) {
      if (error instanceof CaseEventsServiceError) {
        setEventsMessage({ type: 'error', text: error.message });
        const flatValidationErrors = error.validationErrors ? Object.values(error.validationErrors).flat() : [];
        setValidationErrors(flatValidationErrors);
        return;
      }

      setEventsMessage({ type: 'error', text: 'No se pudo crear el evento.' });
    }
  };

  const handleEditMovimiento = async (movId: string) => {
    setValidationErrors([]);
    setEventsMessage(null);
    try {
      const event = await caseEventsService.getCaseEventById(movId);
      setEditingMovId(movId);
      setEditMovimiento({
        legal_case_id: event.legal_case_id,
        event_date: event.event_date || '',
        event_type: event.event_type,
        description: event.description,
        is_payment: Boolean(event.is_payment),
      });
    } catch (error) {
      if (error instanceof CaseEventsServiceError) {
        setEventsMessage({ type: 'error', text: error.message });
        return;
      }
      setEventsMessage({ type: 'error', text: 'No se pudo cargar el evento.' });
    }
  };

  const handleUpdateMovimiento = async (e: React.FormEvent, movId: string) => {
    e.preventDefault();
    setValidationErrors([]);
    setEventsMessage(null);

    const payload: UpdateCaseEventPayload = {
      event_date: editMovimiento.event_date || undefined,
      event_type: editMovimiento.event_type,
      description: editMovimiento.description,
      is_payment: editMovimiento.is_payment,
    };

    const userId = getCurrentUserId();
    if (userId) payload.user_id = userId;

    try {
      await caseEventsService.updateCaseEvent(movId, payload);
      setEditingMovId(null);
      setEventsMessage({ type: 'success', text: 'Evento actualizado correctamente.' });
      await fetchMovimientos();
    } catch (error) {
      if (error instanceof CaseEventsServiceError) {
        setEventsMessage({ type: 'error', text: error.message });
        const flatValidationErrors = error.validationErrors ? Object.values(error.validationErrors).flat() : [];
        setValidationErrors(flatValidationErrors);
        return;
      }

      setEventsMessage({ type: 'error', text: 'No se pudo actualizar el evento.' });
    }
  };

  const handleDeleteMovimiento = async (movId: string) => {
    setValidationErrors([]);
    setEventsMessage(null);
    try {
      const result = await caseEventsService.deleteCaseEvent(movId);
      setEventsMessage({ type: 'success', text: result.message || 'Evento eliminado correctamente.' });
      await fetchMovimientos();
    } catch (error) {
      if (error instanceof CaseEventsServiceError) {
        setEventsMessage({ type: 'error', text: error.message });
        return;
      }
      setEventsMessage({ type: 'error', text: 'No se pudo eliminar el evento.' });
    }
  };

  const sortedExpedientes = [...expedientes].sort((a, b) => {
    const movimientosA = getExpedienteMovimientos(a.id);
    const movimientosB = getExpedienteMovimientos(b.id);
    const lastA = movimientosA[0]?.event_date || a.created_at;
    const lastB = movimientosB[0]?.event_date || b.created_at;
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

      {eventsMessage?.text && (
        <div
          className={`p-3 rounded-lg border text-sm ${
            eventsMessage.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {eventsMessage.text}
          {validationErrors.length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              {validationErrors.map((validationError, index) => (
                <li key={`${validationError}-${index}`}>{validationError}</li>
              ))}
            </ul>
          )}
        </div>
      )}

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
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar expedientes (puedes buscar por tipo, descripcion o DD-MM-AAAA)..."
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
                        <div key={mov.id} className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                          {editingMovId === mov.id ? (
                            <form onSubmit={(e) => void handleUpdateMovimiento(e, mov.id)} className="space-y-3">
                              <div>
                                <label htmlFor={`edit-legal-case-id-${mov.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                  Legal Case ID (bloqueado)
                                </label>
                                <input
                                  id={`edit-legal-case-id-${mov.id}`}
                                  value={editMovimiento.legal_case_id}
                                  readOnly
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                                />
                              </div>
                              <div>
                                <label htmlFor={`edit-event-date-${mov.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                  Fecha
                                </label>
                                <input
                                  id={`edit-event-date-${mov.id}`}
                                  type="date"
                                  value={editMovimiento.event_date}
                                  onChange={(e) => setEditMovimiento({ ...editMovimiento, event_date: e.target.value })}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label htmlFor={`edit-event-type-${mov.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                  Tipo de Evento *
                                </label>
                                <input
                                  id={`edit-event-type-${mov.id}`}
                                  type="text"
                                  required
                                  value={editMovimiento.event_type}
                                  onChange={(e) => setEditMovimiento({ ...editMovimiento, event_type: e.target.value })}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label htmlFor={`edit-event-description-${mov.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                  Descripcion *
                                </label>
                                <textarea
                                  id={`edit-event-description-${mov.id}`}
                                  required
                                  rows={2}
                                  value={editMovimiento.description}
                                  onChange={(e) => setEditMovimiento({ ...editMovimiento, description: e.target.value })}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <label htmlFor={`edit-event-is-payment-${mov.id}`} className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                  id={`edit-event-is-payment-${mov.id}`}
                                  type="checkbox"
                                  checked={editMovimiento.is_payment}
                                  onChange={(e) => setEditMovimiento({ ...editMovimiento, is_payment: e.target.checked })}
                                />
                                Es pago
                              </label>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => setEditingMovId(null)} className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                                  Cancelar
                                </button>
                                <button type="submit" className="flex-1 px-2 py-1 bg-blue-900 text-white rounded text-sm hover:bg-blue-800">
                                  Actualizar
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{mov.event_type}</p>
                                <p className="text-sm text-gray-600">{mov.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {mov.event_date ? new Date(mov.event_date).toLocaleDateString('es-ES') : 'Sin fecha'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">legal_case_id: {mov.legal_case_id}</p>
                                {mov.is_payment && (
                                  <span className="inline-flex mt-2 px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800">
                                    Pago
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => void handleEditMovimiento(mov.id)}
                                  aria-label="Editar movimiento"
                                  title="Editar movimiento"
                                  className="text-blue-700 hover:text-blue-800 p-1"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => void handleDeleteMovimiento(mov.id)}
                                  aria-label="Eliminar movimiento"
                                  title="Eliminar movimiento"
                                  className="text-red-600 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {showMovForm === exp.id ? (
                      <form onSubmit={(e) => void handleAddMovimiento(e, exp.id)} className="bg-white p-3 rounded-lg border border-gray-300 space-y-3">
                        <div>
                          <label htmlFor={`mov-fecha-${exp.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                            Fecha
                          </label>
                          <input
                            id={`mov-fecha-${exp.id}`}
                            type="date"
                            value={newMovimiento.event_date}
                            onChange={(e) => setNewMovimiento({ ...newMovimiento, event_date: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor={`mov-tipo-${exp.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                            Tipo de Evento *
                          </label>
                          <input
                            id={`mov-tipo-${exp.id}`}
                            type="text"
                            required
                            value={newMovimiento.event_type}
                            onChange={(e) => setNewMovimiento({ ...newMovimiento, event_type: e.target.value })}
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
                            value={newMovimiento.description}
                            onChange={(e) => setNewMovimiento({ ...newMovimiento, description: e.target.value })}
                            rows={2}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={newMovimiento.is_payment}
                            onChange={(e) => setNewMovimiento({ ...newMovimiento, is_payment: e.target.checked })}
                          />
                          Es pago
                        </label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setShowMovForm(null)} className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                            Cancelar
                          </button>
                          <button type="submit" className="flex-1 px-2 py-1 bg-blue-900 text-white rounded text-sm hover:bg-blue-800">
                            Guardar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowMovForm(exp.id)}
                        className="w-full px-3 py-2 border border-blue-900 text-blue-900 rounded-lg text-sm hover:bg-blue-50"
                      >
                        + Anadir Evento
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
