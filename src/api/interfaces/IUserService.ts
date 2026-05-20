import type { User } from '../../types';
import type { ApiResponse, PaginationOptions } from '../types';

export type CreateUserInput = {
  fullName: string;
  bruinCardNumber: string;
  publication: string;
  phone: string;
  email: string;
};

export type UpdateUserInput = Partial<CreateUserInput>;

export interface IUserService {
  getAll(options?: PaginationOptions): Promise<ApiResponse<User[]>>;
  getById(id: string): Promise<ApiResponse<User>>;
  getByBruinCard(bruinCardNumber: string): Promise<ApiResponse<User | null>>;
  getByEmail(email: string): Promise<ApiResponse<User | null>>;
  create(input: CreateUserInput): Promise<ApiResponse<User>>;
  update(id: string, input: UpdateUserInput): Promise<ApiResponse<User>>;
  subscribe?(callback: (users: User[]) => void): () => void;
}
