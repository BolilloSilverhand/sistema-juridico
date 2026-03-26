import { ApiServiceError, requestJson } from '@/lib/services/api';

export interface AuthUser {
  id?: string | number;
  name?: string;
  last_name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface RegisterPayload {
  name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  message: string;
  user: AuthUser;
}

interface LogoutResult {
  success: boolean;
  message: string;
}

export class AuthServiceError extends ApiServiceError {}

const getUserFromData = (data: unknown): AuthUser => {
  if (data && typeof data === 'object' && 'user' in data) {
    const user = (data as { user?: unknown }).user;
    if (user && typeof user === 'object') return user as AuthUser;
  }

  if (data && typeof data === 'object') return data as AuthUser;
  return {};
};

const requestAuth = async <TPayload>(path: string, payload: TPayload): Promise<AuthResult> => {
  try {
    const response = await requestJson<unknown, TPayload>({
      path,
      method: 'POST',
      body: payload,
      customErrorMessages: {
        401: 'Credenciales invalidas',
        403: 'Correo no verificado',
        422: 'Revisa los datos del formulario.',
        500: 'Error del servidor. Intenta nuevamente.',
      },
    });

    return {
      success: response.success,
      message: response.message,
      user: getUserFromData(response.data),
    };
  } catch (error) {
    if (error instanceof ApiServiceError) {
      throw new AuthServiceError({
        status: error.status,
        message: error.message,
        validationErrors: error.validationErrors,
      });
    }
    throw error;
  }
};

export const authService = {
  register: (payload: RegisterPayload) => requestAuth('/api/auth/register', payload),
  login: (payload: LoginPayload) => requestAuth('/api/auth/login', payload),
  logout: async (): Promise<LogoutResult> => {
    try {
      const response = await requestJson<Record<string, never>, Record<string, never>>({
        path: '/api/auth/logout',
        method: 'POST',
        body: {},
        customErrorMessages: {
          500: 'Error del servidor. Intenta nuevamente.',
        },
      });

      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw new AuthServiceError({
          status: error.status,
          message: error.message || 'No se pudo cerrar la sesion.',
          validationErrors: error.validationErrors,
        });
      }
      throw error;
    }
  },
};
