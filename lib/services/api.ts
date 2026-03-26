type ValidationErrors = Record<string, string[]>;

export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
}

interface NormalizedApiError {
  status: number;
  message: string;
  validationErrors?: ValidationErrors;
}

export class ApiServiceError extends Error {
  status: number;
  validationErrors?: ValidationErrors;

  constructor(payload: NormalizedApiError) {
    super(payload.message);
    this.name = 'ApiServiceError';
    this.status = payload.status;
    this.validationErrors = payload.validationErrors;
  }
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? '';

const extractValidationErrors = (payload: unknown): ValidationErrors | undefined => {
  if (!payload || typeof payload !== 'object') return undefined;
  if (!('data' in payload)) return undefined;

  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== 'object' || !('errors' in data)) return undefined;

  const errors = (data as { errors?: unknown }).errors;
  if (!errors || typeof errors !== 'object') return undefined;

  return errors as ValidationErrors;
};

const getFallbackMessage = (payload: unknown): string => {
  if (typeof payload === 'object' && payload && 'message' in payload) {
    return String((payload as { message?: unknown }).message || 'Unexpected error.');
  }

  return 'Unexpected error.';
};

export const normalizeApiError = (
  status: number,
  payload: unknown,
  customMessages?: Partial<Record<number, string>>,
): NormalizedApiError => {
  if (status === 422) {
    return {
      status,
      message: customMessages?.[422] ?? 'Please review the form data.',
      validationErrors: extractValidationErrors(payload),
    };
  }

  if (status === 500) {
    return {
      status,
      message: customMessages?.[500] ?? 'Server error. Please try again.',
    };
  }

  if (customMessages?.[status]) {
    return {
      status,
      message: customMessages[status] as string,
    };
  }

  return {
    status,
    message: getFallbackMessage(payload),
    validationErrors: extractValidationErrors(payload),
  };
};

const buildUrl = (path: string, query?: Record<string, string | number | boolean | undefined>) => {
  if (!apiBaseUrl) {
    throw new ApiServiceError({
      status: 500,
      message: 'Set VITE_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL in env vars.',
    });
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${apiBaseUrl}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

export const requestJson = async <TData, TBody = unknown>(options: {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: TBody;
  query?: Record<string, string | number | boolean | undefined>;
  customErrorMessages?: Partial<Record<number, string>>;
}): Promise<ApiResponse<TData>> => {
  const { path, method = 'GET', body, query, customErrorMessages } = options;
  const url = buildUrl(path, query);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(method === 'GET' ? {} : { body: JSON.stringify(body ?? {}) }),
    });
  } catch {
    throw new ApiServiceError({
      status: 0,
      message: 'Could not connect to server.',
    });
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<TData> | null;

  if (!response.ok || !payload) {
    throw new ApiServiceError(normalizeApiError(response.status, payload, customErrorMessages));
  }

  if (!payload.success) {
    throw new ApiServiceError({
      status: response.status,
      message: payload.message || 'Operation failed.',
      validationErrors: extractValidationErrors(payload),
    });
  }

  return payload;
};
