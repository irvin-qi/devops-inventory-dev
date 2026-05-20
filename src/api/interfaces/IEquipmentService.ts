import type { Equipment, EquipmentStatus } from '../../types';
import type { ApiResponse, PaginationOptions } from '../types';

export type CreateEquipmentInput = {
  name: string;
  tagNumber: string;
  categoryId: string;
};

export type UpdateEquipmentInput = {
  name?: string;
  categoryId?: string;
  status?: EquipmentStatus;
};

export interface IEquipmentService {
  getAll(options?: PaginationOptions): Promise<ApiResponse<Equipment[]>>;
  getById(id: string): Promise<ApiResponse<Equipment>>;
  getByCategoryId(categoryId: string): Promise<ApiResponse<Equipment[]>>;
  create(input: CreateEquipmentInput): Promise<ApiResponse<Equipment>>;
  update(id: string, input: UpdateEquipmentInput): Promise<ApiResponse<Equipment>>;
  archive(id: string, reason: string): Promise<ApiResponse<Equipment>>;
  addConditionNote(id: string, note: string): Promise<ApiResponse<Equipment>>;
  subscribe?(callback: (equipment: Equipment[]) => void): () => void;
}
