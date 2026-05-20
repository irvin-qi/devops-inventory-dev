import type { ApiResponse } from '../types';
import { success, error } from '../types';
import type { IAuthService, AuthUser, SignInCredentials } from '../interfaces/IAuthService';
import { getSupabaseClient, mapManagerRow } from './client';

export class AuthService implements IAuthService {
  async getCurrentUser(): Promise<ApiResponse<AuthUser | null>> {
    try {
      const client = getSupabaseClient();
      const { data: { user }, error: authError } = await client.auth.getUser();

      if (authError) {
        return error('AUTH_ERROR', authError.message);
      }

      if (!user) {
        return success(null);
      }

      // Get associated manager record
      const { data: manager, error: managerError } = await client
        .from('managers')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (managerError) {
        return error('DB_ERROR', managerError.message);
      }

      return success({
        id: user.id,
        email: user.email || '',
        manager: manager ? mapManagerRow(manager) : null,
      });
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async signIn(credentials: SignInCredentials): Promise<ApiResponse<AuthUser>> {
    try {
      const client = getSupabaseClient();
      const { data, error: authError } = await client.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        return error('AUTH_ERROR', authError.message);
      }

      if (!data.user) {
        return error('AUTH_ERROR', 'Sign in failed');
      }

      // Get associated manager record
      const { data: manager, error: managerError } = await client
        .from('managers')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .maybeSingle();

      if (managerError) {
        return error('DB_ERROR', managerError.message);
      }

      return success({
        id: data.user.id,
        email: data.user.email || '',
        manager: manager ? mapManagerRow(manager) : null,
      });
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async signOut(): Promise<ApiResponse<void>> {
    try {
      const client = getSupabaseClient();
      const { error: authError } = await client.auth.signOut();

      if (authError) {
        return error('AUTH_ERROR', authError.message);
      }

      return success(undefined);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    const client = getSupabaseClient();
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        callback(null);
        return;
      }

      // Get associated manager record
      const { data: manager } = await client
        .from('managers')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      callback({
        id: session.user.id,
        email: session.user.email || '',
        manager: manager ? mapManagerRow(manager) : null,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }
}
