import type { User } from '../../types';
import type { ApiResponse, PaginationOptions } from '../types';
import { success, error } from '../types';
import type { IUserService, CreateUserInput, UpdateUserInput } from '../interfaces/IUserService';
import { getSupabaseClient, mapUserRow, type UserInsert, type UserUpdate, type UserRow } from './client';

export class UserService implements IUserService {
  async getAll(options?: PaginationOptions): Promise<ApiResponse<User[]>> {
    try {
      const client = getSupabaseClient();
      let query = client.from('users').select('*');

      if (options?.sortBy) {
        query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
      } else {
        query = query.order('full_name', { ascending: true });
      }

      if (options?.limit) {
        const offset = ((options.page || 1) - 1) * options.limit;
        query = query.range(offset, offset + options.limit - 1);
      }

      const { data, error: dbError } = await query;

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success((data as UserRow[])?.map(mapUserRow) || []);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async getById(id: string): Promise<ApiResponse<User>> {
    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      if (!data) {
        return error('NOT_FOUND', `User with id ${id} not found`);
      }

      return success(mapUserRow(data as UserRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async getByBruinCard(bruinCardNumber: string): Promise<ApiResponse<User | null>> {
    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from('users')
        .select('*')
        .eq('bruin_card_number', bruinCardNumber)
        .maybeSingle();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(data ? mapUserRow(data as UserRow) : null);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async getByEmail(email: string): Promise<ApiResponse<User | null>> {
    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(data ? mapUserRow(data as UserRow) : null);
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async create(input: CreateUserInput): Promise<ApiResponse<User>> {
    try {
      const client = getSupabaseClient();
      const insertData: UserInsert = {
        full_name: input.fullName,
        bruin_card_number: input.bruinCardNumber,
        publication: input.publication,
        phone: input.phone,
        email: input.email,
      };

      const { data, error: dbError } = await client
        .from('users')
        .insert(insertData as never)
        .select()
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(mapUserRow(data as UserRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async update(id: string, input: UpdateUserInput): Promise<ApiResponse<User>> {
    try {
      const client = getSupabaseClient();
      const updateData: UserUpdate = {};

      if (input.fullName !== undefined) updateData.full_name = input.fullName;
      if (input.bruinCardNumber !== undefined) updateData.bruin_card_number = input.bruinCardNumber;
      if (input.publication !== undefined) updateData.publication = input.publication;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.email !== undefined) updateData.email = input.email;

      const { data, error: dbError } = await client
        .from('users')
        .update(updateData as never)
        .eq('id', id)
        .select()
        .single();

      if (dbError) {
        return error('DB_ERROR', dbError.message);
      }

      return success(mapUserRow(data as UserRow));
    } catch (e) {
      return error('UNKNOWN_ERROR', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  subscribe(callback: (users: User[]) => void): () => void {
    const client = getSupabaseClient();
    const subscription = client
      .channel('user-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
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
