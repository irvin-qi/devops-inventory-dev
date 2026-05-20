import type { Category } from '../../types';
import type { ApiResponse } from '../types';

export type UpdateCategoryInput = {
  name?: string;
  color?: string;
  bgColor?: string;
};

export interface ICategoryService {
  getAll(): Promise<ApiResponse<Category[]>>;
  getById(id: string): Promise<ApiResponse<Category>>;
  update(id: string, input: UpdateCategoryInput): Promise<ApiResponse<Category>>;
  subscribe?(callback: (categories: Category[]) => void): () => void;
}
