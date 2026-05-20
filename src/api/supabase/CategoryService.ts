import type { Category } from '../../types';
import type { ApiResponse } from '../types';
import { success, error } from '../types';
import type { ICategoryService, UpdateCategoryInput } from '../interfaces/ICategoryService';
import { getSupabaseClient, mapCategoryRow, type CategoryUpdate, type CategoryRow } from './client';

export class CategoryService implements ICategoryService {
  async getAll(): Promise<ApiResponse<Category[]>> {
    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success((data as CategoryRow[])?.map(mapCategoryRow) || []);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async getById(id: string): Promise<ApiResponse<Category>> {
    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      if (!data) {
        return error('NOT_FOUND', `Category with id ${id} not found`);
      }

      return success(mapCategoryRow(data as CategoryRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async update(id: string, input: UpdateCategoryInput): Promise<ApiResponse<Category>> {
    try {
      const client = getSupabaseClient();
      const updateData: CategoryUpdate = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.bgColor !== undefined) updateData.bg_color = input.bgColor;

      const { data, error: dbError } = await client
        .from('categories')
        .update(updateData as never)
        .eq('id', id)
        .select()
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(mapCategoryRow(data as CategoryRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  subscribe(callback: (categories: Category[]) => void): () => void {
    const client = getSupabaseClient();
    const subscription = client
      .channel('category-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
        const result = await this.getAll();
        if (result.status === 'success' && result.data) {
          callback(result.data);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}
