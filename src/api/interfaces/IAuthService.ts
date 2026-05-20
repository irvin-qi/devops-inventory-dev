import type { Manager } from '../../types';
import type { ApiResponse } from '../types';

export type AuthUser = {
  id: string;
  email: string;
  manager: Manager | null;
};

export type SignInCredentials = {
  email: string;
  password: string;
};

export interface IAuthService {
  getCurrentUser(): Promise<ApiResponse<AuthUser | null>>;
  signIn(credentials: SignInCredentials): Promise<ApiResponse<AuthUser>>;
  signOut(): Promise<ApiResponse<void>>;
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void;
}
