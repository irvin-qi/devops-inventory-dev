import type { Equipment } from '../../types';
import type { ApiResponse, PaginationOptions } from '../types';
import { success, error } from '../types';
import type { IEquipmentService, CreateEquipmentInput, UpdateEquipmentInput } from '../interfaces/IEquipmentService';
import { getSupabaseClient, mapEquipmentRow, type EquipmentInsert, type EquipmentUpdate, type EquipmentRow } from './client';

export class EquipmentService implements IEquipmentService {
  async getAll(options?: PaginationOptions): Promise<ApiResponse<Equipment[]>> {
    try {
      const client = getSupabaseClient();
      let query = client.from('equipment').select('*');

      if (options?.sortBy) {
        query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (options?.limit) {
        const offset = ((options.page || 1) - 1) * options.limit;
        query = query.range(offset, offset + options.limit - 1);
      }

      const { data, error: dbError } = await query;

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success((data as EquipmentRow[])?.map(mapEquipmentRow) || []);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async getById(id: string): Promise<ApiResponse<Equipment>> {
    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      if (!data) {
        return error('NOT_FOUND', `Equipment with id ${id} not found`);
      }

      return success(mapEquipmentRow(data as EquipmentRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async getByCategoryId(categoryId: string): Promise<ApiResponse<Equipment[]>> {
    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from('equipment')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success((data as EquipmentRow[])?.map(mapEquipmentRow) || []);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async create(input: CreateEquipmentInput): Promise<ApiResponse<Equipment>> {
    try {
      const client = getSupabaseClient();
      const insertData: EquipmentInsert = {
        name: input.name,
        tag_number: input.tagNumber,
        category_id: input.categoryId,
        status: 'available',
        condition_notes: [],
        archived_reason: null,
      };

      const { data, error: dbError } = await client
        .from('equipment')
        .insert(insertData as never)
        .select()
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(mapEquipmentRow(data as EquipmentRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async update(id: string, input: UpdateEquipmentInput): Promise<ApiResponse<Equipment>> {
    try {
      const client = getSupabaseClient();
      const updateData: EquipmentUpdate = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.categoryId !== undefined) updateData.category_id = input.categoryId;
      if (input.status !== undefined) updateData.status = input.status;

      const { data, error: dbError } = await client
        .from('equipment')
        .update(updateData as never)
        .eq('id', id)
        .select()
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(mapEquipmentRow(data as EquipmentRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async archive(id: string, reason: string): Promise<ApiResponse<Equipment>> {
    try {
      const client = getSupabaseClient();
      const updateData: EquipmentUpdate = {
        status: 'archived',
        archived_reason: reason,
      };

      const { data, error: dbError } = await client
        .from('equipment')
        .update(updateData as never)
        .eq('id', id)
        .select()
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(mapEquipmentRow(data as EquipmentRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async addConditionNote(id: string, note: string): Promise<ApiResponse<Equipment>> {
    try {
      const client = getSupabaseClient();

      // First get current notes
      const { data: current, error: fetchError } = await client
        .from('equipment')
        .select('condition_notes')
        .eq('id', id)
        .single();

      if (fetchError) {
        return error('DB_ERROR', fetchError.message);
      }

      const currentRow = current as { condition_notes: string[] } | null;
      const currentNotes = currentRow?.condition_notes || [];

      const updateData: EquipmentUpdate = {
        condition_notes: [...currentNotes, note],
      };

      // Append new note
      const { data, error: dbError } = await client
        .from('equipment')
        .update(updateData as never)
        .eq('id', id)
        .select()
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(mapEquipmentRow(data as EquipmentRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  subscribe(callback: (equipment: Equipment[]) => void): () => void {
    const client = getSupabaseClient();
    const subscription = client
      .channel('equipment-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, async () => {
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
