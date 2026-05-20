import { env } from '../../config/env';
import type { ApiResponse, ApiError } from '../types';

// HTTP client for Express REST API
class HttpClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = env.express.baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      return this.handleResponse<T>(response);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      return this.handleResponse<T>(response);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async patch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      return this.handleResponse<T>(response);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (e) {
      return this.handleError(e);
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        code: data.code || 'HTTP_ERROR',
        message: data.message || `HTTP ${response.status}`,
        details: data.details,
      };
      return { data: null, error, status: 'error' };
    }

    return { data: data as T, error: null, status: 'success' };
  }

  private handleError<T>(e: unknown): ApiResponse<T> {
    return {
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        message: e instanceof Error ? e.message : 'Network error',
      },
      status: 'error',
    };
  }
}

// Singleton instance
let httpClient: HttpClient | null = null;

export function getHttpClient(): HttpClient {
  if (!httpClient) {
    httpClient = new HttpClient();
    console.log('Express HTTP client initialized');
  }
  return httpClient;
}
