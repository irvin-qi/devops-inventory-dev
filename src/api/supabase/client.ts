import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

// Database row types
export type CategoryRow = {
  id: string;
  name: string;
  color: string;
  bg_color: string;
  created_at: string;
  updated_at: string;
};

export type EquipmentRow = {
  id: string;
  name: string;
  tag_number: string;
  category_id: string;
  status: 'available' | 'checked_out' | 'archived';
  condition_notes: string[];
  archived_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type UserRow = {
  id: string;
  full_name: string;
  bruin_card_number: string;
  publication: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type ManagerRow = {
  id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  role: 'super_admin' | 'manager';
  created_at: string;
  updated_at: string;
};

export type CheckoutRow = {
  id: string;
  equipment_id: string;
  user_id: string;
  checked_out_at: string;
  due_at: string;
  condition_note_out: string | null;
  checked_in_at: string | null;
  condition_note_in: string | null;
  checked_out_by: string;
  checked_in_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityRow = {
  id: string;
  timestamp: string;
  equipment_id: string;
  action: 'check_out' | 'check_in' | 'reminder' | 'note' | 'added' | 'archived';
  actor_id: string | null;
  actor_name: string;
  user_id: string | null;
  note: string | null;
  created_at: string;
};

// Insert types
export type CategoryInsert = Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'>;
export type EquipmentInsert = Omit<EquipmentRow, 'id' | 'created_at' | 'updated_at'>;
export type UserInsert = Omit<UserRow, 'id' | 'created_at' | 'updated_at'>;
export type ManagerInsert = Omit<ManagerRow, 'id' | 'created_at' | 'updated_at'>;
export type CheckoutInsert = Omit<CheckoutRow, 'id' | 'created_at' | 'updated_at' | 'checked_in_at' | 'condition_note_in' | 'checked_in_by'>;
export type ActivityInsert = Omit<ActivityRow, 'id' | 'created_at'>;

// Update types
export type CategoryUpdate = Partial<CategoryInsert>;
export type EquipmentUpdate = Partial<EquipmentInsert>;
export type UserUpdate = Partial<UserInsert>;
export type ManagerUpdate = Partial<ManagerInsert>;
export type CheckoutUpdate = Partial<CheckoutInsert> & {
  checked_in_at?: string | null;
  condition_note_in?: string | null;
  checked_in_by?: string | null;
};
export type ActivityUpdate = Partial<ActivityInsert>;

// Database type for Supabase client
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      equipment: {
        Row: EquipmentRow;
        Insert: EquipmentInsert;
        Update: EquipmentUpdate;
      };
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      managers: {
        Row: ManagerRow;
        Insert: ManagerInsert;
        Update: ManagerUpdate;
      };
      checkouts: {
        Row: CheckoutRow;
        Insert: CheckoutInsert;
        Update: CheckoutUpdate;
      };
      activity_log: {
        Row: ActivityRow;
        Insert: ActivityInsert;
        Update: ActivityUpdate;
      };
    };
  };
};

let supabaseClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    if (!env.supabase.url || !env.supabase.anonKey) {
      throw new Error('Supabase URL and anon key must be configured');
    }
    supabaseClient = createClient<Database>(env.supabase.url, env.supabase.anonKey);
    console.log('Supabase client initialized');
  }
  return supabaseClient;
}

// Helper to map snake_case DB rows to camelCase frontend types
export function mapEquipmentRow(row: EquipmentRow) {
  return {
    id: row.id,
    name: row.name,
    tagNumber: row.tag_number,
    categoryId: row.category_id,
    status: row.status,
    conditionNotes: row.condition_notes || [],
    archivedReason: row.archived_reason ?? undefined,
  };
}

export function mapCategoryRow(row: CategoryRow) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    bgColor: row.bg_color,
  };
}

export function mapUserRow(row: UserRow) {
  return {
    id: row.id,
    fullName: row.full_name,
    bruinCardNumber: row.bruin_card_number,
    publication: row.publication,
    phone: row.phone,
    email: row.email,
  };
}

export function mapManagerRow(row: ManagerRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

export function mapCheckoutRow(row: CheckoutRow) {
  const now = new Date();
  const dueAt = new Date(row.due_at);
  return {
    id: row.id,
    equipmentId: row.equipment_id,
    userId: row.user_id,
    performedById: row.checked_out_by,           // ← added: maps checked_out_by → performedById
    checkedOutAt: row.checked_out_at,
    dueAt: row.due_at,
    returnedAt: row.checked_in_at ?? undefined,  // ← added: maps checked_in_at → returnedAt
    conditionNoteOut: row.condition_note_out ?? undefined,
    conditionNoteIn: row.condition_note_in ?? undefined, // ← added
    isOverdue: row.checked_in_at === null && dueAt < now,
  };
}

export function mapActivityRow(row: ActivityRow) {
  return {
    id: row.id,
    timestamp: row.timestamp,
    equipmentId: row.equipment_id,
    action: row.action,
    actorName: row.actor_name,
    userId: row.user_id ?? undefined,
    note: row.note ?? undefined,
  };
}