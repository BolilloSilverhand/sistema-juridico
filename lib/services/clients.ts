import { ApiServiceError, requestJson } from '@/lib/services/api';

export class ClientsServiceError extends ApiServiceError {}

export interface ClientTransaction {
  id: string;
  client_id: string;
  type: 'charge' | 'payment' | string;
  transaction_type?: 'Cargo' | 'Abono' | 'cargo' | 'abono' | string;
  amount: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  user_id: number;
  name: string;
  last_name?: string | null;
  agreed_amount: number;
  total_debt: number;
  created_at?: string;
  updated_at?: string;
  transactions?: ClientTransaction[];
}

export interface GetClientsParams {
  search?: string;
  user_id: number;
}

export interface CreateClientPayload {
  user_id: number;
  name: string;
  last_name?: string;
  agreed_amount: number;
}

export interface UpdateClientPayload {
  user_id?: number;
  name?: string;
  last_name?: string;
  agreed_amount?: number;
}

export interface CreateClientTransactionPayload {
  user_id: number;
  client_id: string;
  transaction_type: 'Cargo' | 'Abono' | 'cargo' | 'abono';
  amount: number;
  description?: string;
}

interface CreateClientTransactionResponseData {
  client_transaction: ClientTransaction;
  client_total_debt: number;
}

interface DeleteClientTransactionResponseData {
  client_transaction_id: string;
  client_total_debt: number;
}

type ClientsListData = Client[] | { items?: Client[]; data?: Client[] };

const toClientArray = (value: unknown): Client[] => {
  if (!Array.isArray(value)) return [];
  return value as Client[];
};

const normalizeList = (payload: ClientsListData | Record<string, unknown>): Client[] => {
  if (Array.isArray(payload)) return toClientArray(payload);

  if (payload && typeof payload === 'object') {
    const objectPayload = payload as Record<string, unknown>;

    const directKeys = ['items', 'data', 'clients', 'results'];
    for (const key of directKeys) {
      const parsed = toClientArray(objectPayload[key]);
      if (parsed.length > 0) return parsed;
    }

    if (objectPayload.data && typeof objectPayload.data === 'object') {
      const nestedData = objectPayload.data as Record<string, unknown>;
      for (const key of directKeys) {
        const parsed = toClientArray(nestedData[key]);
        if (parsed.length > 0) return parsed;
      }
    }
  }

  return [];
};

const castClient = (data: unknown): Client => {
  if (data && typeof data === 'object' && 'client' in data) {
    const client = (data as { client?: unknown }).client;
    if (client && typeof client === 'object') return client as Client;
  }

  return data as Client;
};

export const clientsService = {
  getClients: async (params: GetClientsParams): Promise<Client[]> => {
    try {
      const response = await requestJson<ClientsListData>({
        path: '/api/clients',
        method: 'GET',
        query: {
          search: params.search,
          user_id: params.user_id,
        },
        customErrorMessages: {
          422: 'No se puede listar clientes sin user_id.',
          500: 'Error del servidor. Intenta nuevamente.',
        },
      });

      return normalizeList(response.data);
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw new ClientsServiceError({
          status: error.status,
          message: error.message,
          validationErrors: error.validationErrors,
        });
      }
      throw error;
    }
  },

  createClient: async (payload: CreateClientPayload): Promise<Client> => {
    try {
      const response = await requestJson<unknown, CreateClientPayload>({
        path: '/api/clients',
        method: 'POST',
        body: payload,
        customErrorMessages: {
          422: 'Revisa los datos del cliente.',
          500: 'Error del servidor. Intenta nuevamente.',
        },
      });
      return castClient(response.data);
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw new ClientsServiceError({
          status: error.status,
          message: error.message,
          validationErrors: error.validationErrors,
        });
      }
      throw error;
    }
  },

  getClientById: async (id: string): Promise<Client> => {
    try {
      const response = await requestJson<unknown>({
        path: `/api/clients/${id}`,
        method: 'GET',
        customErrorMessages: {
          404: 'Client not found',
          500: 'Error del servidor. Intenta nuevamente.',
        },
      });
      return castClient(response.data);
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw new ClientsServiceError({
          status: error.status,
          message: error.message,
          validationErrors: error.validationErrors,
        });
      }
      throw error;
    }
  },

  updateClient: async (id: string, payload: UpdateClientPayload): Promise<Client> => {
    try {
      const response = await requestJson<unknown, UpdateClientPayload>({
        path: `/api/clients/${id}`,
        method: 'PATCH',
        body: payload,
        customErrorMessages: {
          404: 'Client not found',
          422: 'Revisa los datos del cliente.',
          500: 'Error del servidor. Intenta nuevamente.',
        },
      });
      return castClient(response.data);
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw new ClientsServiceError({
          status: error.status,
          message: error.message,
          validationErrors: error.validationErrors,
        });
      }
      throw error;
    }
  },

  deleteClient: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await requestJson<Record<string, never>>({
        path: `/api/clients/${id}`,
        method: 'DELETE',
        customErrorMessages: {
          404: 'Client not found',
          500: 'Error del servidor. Intenta nuevamente.',
        },
      });

      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw new ClientsServiceError({
          status: error.status,
          message: error.message,
          validationErrors: error.validationErrors,
        });
      }
      throw error;
    }
  },

  createClientTransaction: async (
    payload: CreateClientTransactionPayload,
  ): Promise<{ transaction: ClientTransaction; clientTotalDebt: number; message: string }> => {
    try {
      const response = await requestJson<CreateClientTransactionResponseData, CreateClientTransactionPayload>({
        path: '/api/client-transactions',
        method: 'POST',
        body: payload,
        customErrorMessages: {
          404: 'Client not found',
          409: 'Operacion invalida por consistencia de saldo.',
          422: 'Revisa los datos de la transaccion.',
          500: 'Error del servidor. Intenta nuevamente.',
        },
      });

      return {
        transaction: response.data.client_transaction,
        clientTotalDebt: response.data.client_total_debt,
        message: response.message,
      };
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw new ClientsServiceError({
          status: error.status,
          message: error.message,
          validationErrors: error.validationErrors,
        });
      }
      throw error;
    }
  },

  deleteClientTransaction: async (
    id: string,
  ): Promise<{ transactionId: string; clientTotalDebt: number; message: string }> => {
    try {
      const response = await requestJson<DeleteClientTransactionResponseData>({
        path: `/api/client-transactions/${id}`,
        method: 'DELETE',
        customErrorMessages: {
          404: 'Client transaction not found',
          409: 'Operacion invalida por consistencia de saldo.',
          500: 'Error del servidor. Intenta nuevamente.',
        },
      });

      return {
        transactionId: response.data.client_transaction_id,
        clientTotalDebt: response.data.client_total_debt,
        message: response.message,
      };
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw new ClientsServiceError({
          status: error.status,
          message: error.message,
          validationErrors: error.validationErrors,
        });
      }
      throw error;
    }
  },
};
