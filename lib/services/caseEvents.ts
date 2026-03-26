import { ApiServiceError, requestJson } from '@/lib/services/api';

export class CaseEventsServiceError extends ApiServiceError {}

export interface CaseEvent {
  id: string;
  user_id: number;
  legal_case_id: string;
  event_date?: string | null;
  event_type: string;
  description: string;
  is_payment?: boolean | null;
  created_at?: string;
  updated_at?: string;
  legalCase?: unknown;
  user?: unknown;
}

export interface GetCaseEventsParams {
  search?: string;
  legal_case_id?: string;
}

export interface CreateCaseEventPayload {
  user_id: number;
  legal_case_id: string;
  event_date?: string;
  event_type: string;
  description: string;
  is_payment?: boolean;
}

export interface UpdateCaseEventPayload {
  user_id?: number;
  event_date?: string;
  event_type?: string;
  description?: string;
  is_payment?: boolean;
}

type CaseEventsListData = CaseEvent[] | { items?: CaseEvent[]; data?: CaseEvent[] };

const normalizeList = (payload: CaseEventsListData): CaseEvent[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

export const caseEventsService = {
  getCaseEvents: async (params?: GetCaseEventsParams): Promise<CaseEvent[]> => {
    try {
      const response = await requestJson<CaseEventsListData>({
        path: '/api/case-events',
        method: 'GET',
        query: {
          search: params?.search,
          legal_case_id: params?.legal_case_id,
        },
        customErrorMessages: {
          500: 'Error del servidor. Intenta nuevamente.',
        },
      });

      return normalizeList(response.data);
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw new CaseEventsServiceError({
          status: error.status,
          message: error.message,
          validationErrors: error.validationErrors,
        });
      }
      throw error;
    }
  },

  createCaseEvent: async (payload: CreateCaseEventPayload): Promise<CaseEvent> => {
    try {
      const response = await requestJson<CaseEvent, CreateCaseEventPayload>({
        path: '/api/case-events',
        method: 'POST',
        body: payload,
        customErrorMessages: {
          422: 'Revisa los datos del evento.',
          500: 'Error del servidor. Intenta nuevamente.',
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw new CaseEventsServiceError({
          status: error.status,
          message: error.message,
          validationErrors: error.validationErrors,
        });
      }
      throw error;
    }
  },

  getCaseEventById: async (id: string): Promise<CaseEvent> => {
    try {
      const response = await requestJson<CaseEvent>({
        path: `/api/case-events/${id}`,
        method: 'GET',
        customErrorMessages: {
          404: 'Case event not found',
          500: 'Error del servidor. Intenta nuevamente.',
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw new CaseEventsServiceError({
          status: error.status,
          message: error.message,
          validationErrors: error.validationErrors,
        });
      }
      throw error;
    }
  },

  updateCaseEvent: async (id: string, payload: UpdateCaseEventPayload): Promise<CaseEvent> => {
    try {
      const response = await requestJson<CaseEvent, UpdateCaseEventPayload>({
        path: `/api/case-events/${id}`,
        method: 'PATCH',
        body: payload,
        customErrorMessages: {
          404: 'Case event not found',
          422: 'Revisa los datos del evento.',
          500: 'Error del servidor. Intenta nuevamente.',
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw new CaseEventsServiceError({
          status: error.status,
          message: error.message,
          validationErrors: error.validationErrors,
        });
      }
      throw error;
    }
  },

  deleteCaseEvent: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await requestJson<Record<string, never>>({
        path: `/api/case-events/${id}`,
        method: 'DELETE',
        customErrorMessages: {
          404: 'Case event not found',
          500: 'Error del servidor. Intenta nuevamente.',
        },
      });
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw new CaseEventsServiceError({
          status: error.status,
          message: error.message,
          validationErrors: error.validationErrors,
        });
      }
      throw error;
    }
  },
};
