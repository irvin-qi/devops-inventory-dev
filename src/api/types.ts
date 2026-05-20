export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  status: 'success' | 'error';
};

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type PaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

// Helper to create successful response
export function success<T>(data: T): ApiResponse<T> {
  return { data, error: null, status: 'success' };
}

// Helper to create error response
export function error<T>(code: string, message: string, details?: Record<string, unknown>): ApiResponse<T> {
  return { data: null, error: { code, message, details }, status: 'error' };
}
