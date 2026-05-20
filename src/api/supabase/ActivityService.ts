import type { ActivityEntry } from '../../types';
import type { ApiResponse, PaginationOptions } from '../types';
import { success, error } from '../types';
import type { IActivityService, CreateActivityInput } from '../interfaces/IActivityService';
import { getSupabaseClient, mapActivityRow, type ActivityInsert, type ActivityRow } from './client';

export class ActivityService implements IActivityService {
  async getAll(options?: PaginationOptions): Promise<ApiResponse<ActivityEntry[]>> {
    try {
      const client = getSupabaseClient();
      let query = client.from('activity_log').select('*');

      if (options?.sortBy) {
        query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
      } else {
        query = query.order('timestamp', { ascending: false });
      }

      if (options?.limit) {
        const offset = ((options.page || 1) - 1) * options.limit;
        query = query.range(offset, offset + options.limit - 1);
      }

      const { data, error: dbError } = await query;

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success((data as ActivityRow[])?.map(mapActivityRow) || []);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async getByEquipmentId(equipmentId: string): Promise<ApiResponse<ActivityEntry[]>> {
    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from('activity_log')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('timestamp', { ascending: false });

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success((data as ActivityRow[])?.map(mapActivityRow) || []);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async create(input: CreateActivityInput): Promise<ApiResponse<ActivityEntry>> {
    try {
      const client = getSupabaseClient();
      const insertData: ActivityInsert = {
        timestamp: new Date().toISOString(),
        equipment_id: input.equipmentId,
        action: input.action,
        actor_name: input.actorName,
        actor_id: null, // Will be linked to auth user when available
        user_id: input.userId || null,
        note: input.note || null,
      };

      const { data, error: dbError } = await client
        .from('activity_log')
        .insert(insertData as never)
        .select()
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(mapActivityRow(data as ActivityRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  subscribe(callback: (activities: ActivityEntry[]) => void): () => void {
    const client = getSupabaseClient();
    const subscription = client
      .channel('activity-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, async () => {
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
