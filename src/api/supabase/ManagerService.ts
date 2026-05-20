import type { Manager } from '../../types';
import type { ApiResponse, PaginationOptions } from '../types';
import { success, error } from '../types';
import type { IManagerService, CreateManagerInput, UpdateManagerInput } from '../interfaces/IManagerService';
import { getSupabaseClient, mapManagerRow, type ManagerInsert, type ManagerUpdate, type ManagerRow } from './client';

export class ManagerService implements IManagerService {
  async getAll(options?: PaginationOptions): Promise<ApiResponse<Manager[]>> {
    try {
      const client = getSupabaseClient();
      let query = client.from('managers').select('*');

      if (options?.sortBy) {
        query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
      } else {
        query = query.order('name', { ascending: true });
      }

      if (options?.limit) {
        const offset = ((options.page || 1) - 1) * options.limit;
        query = query.range(offset, offset + options.limit - 1);
      }

      const { data, error: dbError } = await query;

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success((data as ManagerRow[])?.map(mapManagerRow) || []);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async getById(id: string): Promise<ApiResponse<Manager>> {
    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from('managers')
        .select('*')
        .eq('id', id)
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      if (!data) {
        return error('NOT_FOUND', `Manager with id ${id} not found`);
      }

      return success(mapManagerRow(data as ManagerRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async getByEmail(email: string): Promise<ApiResponse<Manager | null>> {
    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from('managers')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(data ? mapManagerRow(data as ManagerRow) : null);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async create(input: CreateManagerInput): Promise<ApiResponse<Manager>> {
    try {
      const client = getSupabaseClient();
      const insertData: ManagerInsert = {
        name: input.name,
        email: input.email,
        role: input.role,
        auth_user_id: null, // Will be linked when auth is set up
      };

      const { data, error: dbError } = await client
        .from('managers')
        .insert(insertData as never)
        .select()
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(mapManagerRow(data as ManagerRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async update(id: string, input: UpdateManagerInput): Promise<ApiResponse<Manager>> {
    try {
      const client = getSupabaseClient();
      const updateData: ManagerUpdate = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.role !== undefined) updateData.role = input.role;

      const { data, error: dbError } = await client
        .from('managers')
        .update(updateData as never)
        .eq('id', id)
        .select()
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(mapManagerRow(data as ManagerRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async remove(id: string): Promise<ApiResponse<void>> {
    try {
      const client = getSupabaseClient();
      const { error: dbError } = await client
        .from('managers')
        .delete()
        .eq('id', id);

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(undefined);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  subscribe(callback: (managers: Manager[]) => void): () => void {
    const client = getSupabaseClient();
    const subscription = client
      .channel('manager-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'managers' }, async () => {
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
