import type { Manager, Role } from '../../types';
import type { ApiResponse, PaginationOptions } from '../types';

export type CreateManagerInput = {
  name: string;
  email: string;
  role: Role;
};

export type UpdateManagerInput = Partial<CreateManagerInput>;

export interface IManagerService {
  getAll(options?: PaginationOptions): Promise<ApiResponse<Manager[]>>;
  getById(id: string): Promise<ApiResponse<Manager>>;
  getByEmail(email: string): Promise<ApiResponse<Manager | null>>;
  create(input: CreateManagerInput): Promise<ApiResponse<Manager>>;
  update(id: string, input: UpdateManagerInput): Promise<ApiResponse<Manager>>;
  remove(id: string): Promise<ApiResponse<void>>;
  subscribe?(callback: (managers: Manager[]) => void): () => void;
}
