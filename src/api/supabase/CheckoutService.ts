import type { Checkout } from '../../types';
import type { ApiResponse, PaginationOptions } from '../types';
import { success, error } from '../types';
import type { ICheckoutService, CreateCheckoutInput, CheckInInput } from '../interfaces/ICheckoutService';
import { getSupabaseClient, mapCheckoutRow, type CheckoutInsert, type CheckoutUpdate, type CheckoutRow } from './client';

export class CheckoutService implements ICheckoutService {
  async getAll(options?: PaginationOptions): Promise<ApiResponse<Checkout[]>> {
    try {
      const client = getSupabaseClient();
      // Only get active checkouts (not checked in)
      let query = client
        .from('checkouts')
        .select('*')
        .is('checked_in_at', null);

      if (options?.sortBy) {
        query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
      } else {
        query = query.order('checked_out_at', { ascending: false });
      }

      if (options?.limit) {
        const offset = ((options.page || 1) - 1) * options.limit;
        query = query.range(offset, offset + options.limit - 1);
      }

      const { data, error: dbError } = await query;

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success((data as CheckoutRow[])?.map(mapCheckoutRow) || []);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async getByEquipmentId(equipmentId: string): Promise<ApiResponse<Checkout | null>> {
    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from('checkouts')
        .select('*')
        .eq('equipment_id', equipmentId)
        .is('checked_in_at', null)
        .maybeSingle();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(data ? mapCheckoutRow(data as CheckoutRow) : null);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async getByUserId(userId: string): Promise<ApiResponse<Checkout[]>> {
    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from('checkouts')
        .select('*')
        .eq('user_id', userId)
        .is('checked_in_at', null)
        .order('checked_out_at', { ascending: false });

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success((data as CheckoutRow[])?.map(mapCheckoutRow) || []);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async getOverdue(): Promise<ApiResponse<Checkout[]>> {
    try {
      const client = getSupabaseClient();
      const now = new Date().toISOString();
      const { data, error: dbError } = await client
        .from('checkouts')
        .select('*')
        .is('checked_in_at', null)
        .lt('due_at', now)
        .order('due_at', { ascending: true });

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success((data as CheckoutRow[])?.map(mapCheckoutRow) || []);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async create(input: CreateCheckoutInput): Promise<ApiResponse<Checkout>> {
    try {
      const client = getSupabaseClient();
      const insertData: CheckoutInsert = {
        equipment_id: input.equipmentId,
        user_id: input.userId,
        checked_out_at: new Date().toISOString(),
        due_at: input.dueAt,
        condition_note_out: input.conditionNoteOut || null,
        checked_out_by: input.checkedOutBy,
      };

      const { data, error: dbError } = await client
        .from('checkouts')
        .insert(insertData as never)
        .select()
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(mapCheckoutRow(data as CheckoutRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async checkIn(checkoutId: string, input: CheckInInput): Promise<ApiResponse<Checkout>> {
    try {
      const client = getSupabaseClient();
      const updateData: CheckoutUpdate = {
        checked_in_at: new Date().toISOString(),
        condition_note_in: input.conditionNoteIn || null,
        checked_in_by: input.checkedInBy,
      };

      const { data, error: dbError } = await client
        .from('checkouts')
        .update(updateData as never)
        .eq('id', checkoutId)
        .select()
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(mapCheckoutRow(data as CheckoutRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async sendReminder(checkoutId: string): Promise<ApiResponse<void>> {
    // In a real implementation, this would send an email/notification
    // For now, just log and return success
    console.log(`Reminder sent for checkout ${checkoutId}`);
    return success(undefined);
  }

  subscribe(callback: (checkouts: Checkout[]) => void): () => void {
    const client = getSupabaseClient();
    const subscription = client
      .channel('checkout-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkouts' }, async () => {
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
