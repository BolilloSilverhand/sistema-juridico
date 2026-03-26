
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import type { AuthUser } from '@/lib/services/auth';
import ClientListItem from '@/components/ClientListItem';
import {
  clientsService,
  ClientsServiceError,
  type Client,
  type ClientTransaction,
  type UpdateClientPayload,
} from '@/lib/services/clients';

interface ClientesProps {
  currentUser: AuthUser | null;
}

type Notice = {
  type: 'success' | 'error';
  text: string;
};

export default function Clientes({ currentUser }: ClientesProps) {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [clientDetails, setClientDetails] = useState<Record<string, Client>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [showTransactionFormClientId, setShowTransactionFormClientId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    agreed_amount: '',
  });

  const [editData, setEditData] = useState({
    name: '',
    last_name: '',
    agreed_amount: '',
    total_debt: '',
  });

  const [transactionForm, setTransactionForm] = useState({
    transaction_type: 'Cargo' as 'Cargo' | 'Abono',
    amount: '',
    description: '',
  });

  const resolveUserId = () => {
    const userIdFromSession = Number(currentUser?.id);
    if (Number.isFinite(userIdFromSession)) return userIdFromSession;
    return null;
  };

  const getClientTransactions = (clientId: string): ClientTransaction[] => {
    const detail = clientDetails[clientId];
    return detail?.transactions ?? [];
  };

  const getTransactionType = (transaction: ClientTransaction) =>
    (transaction.transaction_type ?? transaction.type ?? '').toString();

  const updateClientDebtInState = (clientId: string, clientTotalDebt: number) => {
    setClientes((prev) =>
      prev.map((client) => (client.id === clientId ? { ...client, total_debt: clientTotalDebt } : client)),
    );

    setClientDetails((prev) => {
      const detail = prev[clientId];
      if (!detail) return prev;
      return {
        ...prev,
        [clientId]: {
          ...detail,
          total_debt: clientTotalDebt,
        },
      };
    });
  };

  const fetchClients = async () => {
    setValidationErrors([]);
    const userId = resolveUserId();

    if (!userId) {
      setClientes([]);
      setNotice({ type: 'error', text: 'No se puede listar clientes sin user_id del usuario autenticado.' });
      return;
    }

    try {
      const data = await clientsService.getClients({
        user_id: userId,
        search: searchTerm || undefined,
      });
      setClientes(data);
    } catch (error) {
      if (error instanceof ClientsServiceError) {
        setNotice({ type: 'error', text: error.message });
        return;
      }
      setNotice({ type: 'error', text: 'No se pudieron cargar los clientes.' });
    }
  };

  useEffect(() => {
    void fetchClients();
  }, [searchTerm, currentUser?.id]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    setNotice(null);

    const userId = resolveUserId();
    if (!userId) {
      setNotice({ type: 'error', text: 'Define un user_id valido para crear cliente.' });
      return;
    }

    try {
      await clientsService.createClient({
        user_id: userId,
        name: formData.name,
        last_name: formData.last_name || undefined,
        agreed_amount: Number(formData.agreed_amount),
      });

      setFormData({ name: '', last_name: '', agreed_amount: '' });
      setShowForm(false);
      setNotice({ type: 'success', text: 'Cliente creado correctamente.' });
      await fetchClients();
    } catch (error) {
      if (error instanceof ClientsServiceError) {
        setNotice({ type: 'error', text: error.message });
        const flatErrors = error.validationErrors ? Object.values(error.validationErrors).flat() : [];
        setValidationErrors(flatErrors);
        return;
      }
      setNotice({ type: 'error', text: 'No se pudo crear el cliente.' });
    }
  };

  const handleExpandClient = async (clientId: string) => {
    const nextValue = expandedClientId === clientId ? null : clientId;
    setExpandedClientId(nextValue);

    if (!nextValue) return;

    try {
      const detail = await clientsService.getClientById(clientId);
      setClientDetails((prev) => ({ ...prev, [clientId]: detail }));
    } catch (error) {
      if (error instanceof ClientsServiceError) {
        setNotice({ type: 'error', text: error.message });
        return;
      }
      setNotice({ type: 'error', text: 'No se pudo cargar el detalle del cliente.' });
    }
  };

  const handleStartEdit = async (clientId: string) => {
    setValidationErrors([]);
    setNotice(null);

    try {
      const detail = clientDetails[clientId] ?? (await clientsService.getClientById(clientId));
      setClientDetails((prev) => ({ ...prev, [clientId]: detail }));
      setEditingClientId(clientId);
      setEditData({
        name: detail.name,
        last_name: detail.last_name ?? '',
        agreed_amount: String(detail.agreed_amount),
        total_debt: String(detail.total_debt),
      });
    } catch (error) {
      if (error instanceof ClientsServiceError) {
        setNotice({ type: 'error', text: error.message });
        return;
      }
      setNotice({ type: 'error', text: 'No se pudo cargar el cliente para editar.' });
    }
  };
  const handleUpdateClient = async (e: React.FormEvent, clientId: string) => {
    e.preventDefault();
    setValidationErrors([]);
    setNotice(null);

    const payload: UpdateClientPayload = {
      name: editData.name || undefined,
      last_name: editData.last_name || undefined,
    };

    const userId = resolveUserId();
    if (userId) payload.user_id = userId;

    try {
      await clientsService.updateClient(clientId, payload);
      setEditingClientId(null);
      setNotice({ type: 'success', text: 'Cliente actualizado correctamente.' });
      await fetchClients();

      const detail = await clientsService.getClientById(clientId);
      setClientDetails((prev) => ({ ...prev, [clientId]: detail }));
    } catch (error) {
      if (error instanceof ClientsServiceError) {
        setNotice({ type: 'error', text: error.message });
        const flatErrors = error.validationErrors ? Object.values(error.validationErrors).flat() : [];
        setValidationErrors(flatErrors);
        return;
      }
      setNotice({ type: 'error', text: 'No se pudo actualizar el cliente.' });
    }
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    const confirmed = window.confirm(`Se eliminara ${clientName}. Esta accion no se puede deshacer.`);
    if (!confirmed) return;

    setValidationErrors([]);
    setNotice(null);

    try {
      const result = await clientsService.deleteClient(clientId);
      setNotice({ type: 'success', text: result.message || 'Cliente eliminado correctamente.' });

      if (expandedClientId === clientId) {
        setExpandedClientId(null);
      }
      if (editingClientId === clientId) {
        setEditingClientId(null);
      }

      setClientDetails((prev) => {
        const next = { ...prev };
        delete next[clientId];
        return next;
      });

      await fetchClients();
    } catch (error) {
      if (error instanceof ClientsServiceError) {
        setNotice({ type: 'error', text: error.message });
        return;
      }
      setNotice({ type: 'error', text: 'No se pudo eliminar el cliente.' });
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent, clientId: string) => {
    e.preventDefault();
    setValidationErrors([]);
    setNotice(null);

    if (!transactionForm.transaction_type) {
      setNotice({ type: 'error', text: 'Selecciona el tipo de transaccion.' });
      return;
    }

    const amount = Number(transactionForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setNotice({ type: 'error', text: 'El monto debe ser mayor a 0.' });
      return;
    }

    const userId = resolveUserId();
    if (!userId) {
      setNotice({ type: 'error', text: 'Define un user_id valido para registrar transacciones.' });
      return;
    }

    try {
      const result = await clientsService.createClientTransaction({
        user_id: userId,
        client_id: clientId,
        transaction_type: transactionForm.transaction_type,
        amount,
        description: transactionForm.description || undefined,
      });

      updateClientDebtInState(clientId, result.clientTotalDebt);

      setClientDetails((prev) => {
        const detail = prev[clientId];
        if (!detail) return prev;
        return {
          ...prev,
          [clientId]: {
            ...detail,
            total_debt: result.clientTotalDebt,
            transactions: [result.transaction, ...(detail.transactions ?? [])],
          },
        };
      });

      setTransactionForm({ transaction_type: 'Cargo', amount: '', description: '' });
      setShowTransactionFormClientId(null);
      setNotice({ type: 'success', text: result.message || 'Transaccion creada correctamente.' });

      const detail = await clientsService.getClientById(clientId);
      setClientDetails((prev) => ({ ...prev, [clientId]: detail }));
      await fetchClients();
    } catch (error) {
      if (error instanceof ClientsServiceError) {
        setNotice({ type: 'error', text: error.message });
        const flatErrors = error.validationErrors ? Object.values(error.validationErrors).flat() : [];
        setValidationErrors(flatErrors);
        return;
      }
      setNotice({ type: 'error', text: 'No se pudo crear la transaccion.' });
    }
  };

  const handleDeleteTransaction = async (clientId: string, transactionId: string) => {
    setValidationErrors([]);
    setNotice(null);

    try {
      const result = await clientsService.deleteClientTransaction(transactionId);

      updateClientDebtInState(clientId, result.clientTotalDebt);

      setClientDetails((prev) => {
        const detail = prev[clientId];
        if (!detail) return prev;
        return {
          ...prev,
          [clientId]: {
            ...detail,
            total_debt: result.clientTotalDebt,
            transactions: (detail.transactions ?? []).filter((tx) => tx.id !== result.transactionId),
          },
        };
      });

      setNotice({ type: 'success', text: result.message || 'Transaccion eliminada correctamente.' });

      const detail = await clientsService.getClientById(clientId);
      setClientDetails((prev) => ({ ...prev, [clientId]: detail }));
      await fetchClients();
    } catch (error) {
      if (error instanceof ClientsServiceError) {
        setNotice({ type: 'error', text: error.message });
        const flatErrors = error.validationErrors ? Object.values(error.validationErrors).flat() : [];
        setValidationErrors(flatErrors);
        return;
      }
      setNotice({ type: 'error', text: 'No se pudo eliminar la transaccion.' });
    }
  };

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

      {notice?.text && (
        <div
          className={`p-3 rounded-lg border text-sm ${
            notice.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {notice.text}
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
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Nuevo Cliente</h3>
          <form onSubmit={handleCreateClient} className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="client-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                id="client-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="client-last-name" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                id="client-last-name"
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="client-agreed-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Monto pactado *
              </label>
              <input
                id="client-agreed-amount"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.agreed_amount}
                onChange={(e) => setFormData({ ...formData, agreed_amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                placeholder="0.00"
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
              <button type="submit" className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800">
                Guardar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <label htmlFor="search-clients" className="sr-only">
              Buscar clientes por nombre o apellido
            </label>
            <input
              id="search-clients"
              type="text"
              placeholder="Buscar clientes por nombre o apellido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            />
          </div>

        </div>

        <div className="divide-y divide-gray-200">
          {clientes.length === 0 && (
            <div className="p-6 text-sm text-gray-500">No hay clientes para este usuario.</div>
          )}
          {clientes.map((cliente) => {
            const fullName = `${cliente.name} ${cliente.last_name ?? ''}`.trim();
            return (
              <div key={cliente.id} className="border-b border-gray-200 last:border-b-0">
                <button
                  onClick={() => void handleExpandClient(cliente.id)}
                  className="w-full px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 text-left">
                    <ClientListItem
                      fullName={fullName}
                      totalDebt={Number(cliente.total_debt)}
                      agreedAmount={Number(cliente.agreed_amount)}
                    />
                  </div>
                  {expandedClientId === cliente.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedClientId === cliente.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-4">
                    {editingClientId === cliente.id ? (
                      <form onSubmit={(e) => void handleUpdateClient(e, cliente.id)} className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor={`edit-name-${cliente.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                              Nombre
                            </label>
                            <input
                              id={`edit-name-${cliente.id}`}
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor={`edit-last-name-${cliente.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                              Apellido
                            </label>
                            <input
                              id={`edit-last-name-${cliente.id}`}
                              value={editData.last_name}
                              onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor={`edit-agreed-amount-${cliente.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                              Monto pactado
                            </label>
                            <input
                              id={`edit-agreed-amount-${cliente.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={editData.agreed_amount}
                              readOnly
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                            />
                          </div>
                          <div>
                            <label htmlFor={`edit-total-debt-${cliente.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                              Total deuda (solo lectura)
                            </label>
                            <input
                              id={`edit-total-debt-${cliente.id}`}
                              value={editData.total_debt}
                              readOnly
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingClientId(null)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                          <button type="submit" className="flex-1 px-2 py-1 bg-blue-900 text-white rounded text-sm hover:bg-blue-800">
                            Editar Cliente
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Monto pactado</p>
                              <p className="text-lg font-bold text-blue-900">${Number(cliente.agreed_amount).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Adeudo actual</p>
                              <p className={`text-lg font-bold ${Number(cliente.total_debt) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ${Number(cliente.total_debt).toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Pagado</p>
                              <p className="text-lg font-bold text-green-600">
                                ${Math.max(0, Number(cliente.agreed_amount) - Number(cliente.total_debt)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Gestión de honorarios</h4>
                          <div className="space-y-2 mb-4">
                            {getClientTransactions(cliente.id).length === 0 && (
                              <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm text-gray-500">
                                Sin transacciones
                              </div>
                            )}

                            {getClientTransactions(cliente.id).map((transaction) => {
                              const txType = getTransactionType(transaction).toLowerCase();
                              const txLabel = txType === 'cargo' ? '+ Cargo' : '- Abono';
                              const txColor = txType === 'cargo' ? 'text-red-600' : 'text-green-600';

                              return (
                                <div
                                  key={transaction.id}
                                  className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-start"
                                >
                                  <div>
                                    <p className={`text-sm font-medium ${txColor}`}>
                                      {txLabel}: ${Number(transaction.amount).toFixed(2)}
                                    </p>
                                    {transaction.description && (
                                      <p className="text-xs text-gray-600 mt-1">{transaction.description}</p>
                                    )}
                                    {transaction.created_at && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(transaction.created_at).toLocaleDateString('es-ES')}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => void handleDeleteTransaction(cliente.id, transaction.id)}
                                    aria-label="Eliminar transaccion"
                                    title="Eliminar transaccion"
                                    className="text-red-600 hover:text-red-700 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {showTransactionFormClientId === cliente.id ? (
                            <form
                              onSubmit={(e) => void handleCreateTransaction(e, cliente.id)}
                              className="bg-white p-3 rounded-lg border border-gray-300 space-y-3"
                            >
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label htmlFor={`tx-type-${cliente.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                    Tipo *
                                  </label>
                                  <select
                                    id={`tx-type-${cliente.id}`}
                                    value={transactionForm.transaction_type}
                                    onChange={(e) =>
                                      setTransactionForm({
                                        ...transactionForm,
                                        transaction_type: e.target.value as 'Cargo' | 'Abono',
                                      })
                                    }
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                  >
                                    <option value="Cargo">Cargo</option>
                                    <option value="Abono">Abono</option>
                                  </select>
                                </div>
                                <div>
                                  <label htmlFor={`tx-amount-${cliente.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                    Monto *
                                  </label>
                                  <input
                                    id={`tx-amount-${cliente.id}`}
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    value={transactionForm.amount}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>

                              <div>
                                <label htmlFor={`tx-description-${cliente.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                  Descripcion
                                </label>
                                <input
                                  id={`tx-description-${cliente.id}`}
                                  type="text"
                                  value={transactionForm.description}
                                  onChange={(e) =>
                                    setTransactionForm({ ...transactionForm, description: e.target.value })
                                  }
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                  placeholder="Ej: Primer pago, ajuste..."
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowTransactionFormClientId(null)}
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
                              onClick={() => setShowTransactionFormClientId(cliente.id)}
                              className="w-full px-3 py-2 border border-blue-900 text-blue-900 rounded-lg text-sm hover:bg-blue-50"
                            >
                              + Añadir Cargo o Abono
                            </button>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => void handleStartEdit(cliente.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-blue-900 text-blue-900 rounded-lg text-sm hover:bg-blue-50"
                          >
                            <Pencil className="w-4 h-4" />
                            Editar cliente
                          </button>
                          <button
                            onClick={() => void handleDeleteClient(cliente.id, fullName)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
