// Type-safe environment configuration

export type ApiBackend = 'supabase' | 'express';

export interface EnvConfig {
  apiBackend: ApiBackend;
  supabase: {
    url: string;
    anonKey: string;
  };
  express: {
    baseUrl: string;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    console.warn(`Environment variable ${key} is not set`);
    return '';
  }
  return value;
}

export const env: EnvConfig = {
  apiBackend: (getEnvVar('VITE_API_BACKEND', 'supabase') as ApiBackend),
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL', ''),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY', ''),
  },
  express: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', ''),
  },
};

// Validate required environment variables based on backend
export function validateEnv(): void {
  if (env.apiBackend === 'supabase') {
    if (!env.supabase.url || !env.supabase.anonKey) {
      console.error('Supabase backend requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
  } else if (env.apiBackend === 'express') {
    if (!env.express.baseUrl) {
      console.error('Express backend requires VITE_API_BASE_URL');
    }
  }
}
