import type { Checkout } from '../../types';
import type { ApiResponse, PaginationOptions } from '../types';

export type CreateCheckoutInput = {
  equipmentId: string;
  userId: string;
  dueAt: string;
  conditionNoteOut?: string;
  checkedOutBy: string;
};

export type CheckInInput = {
  conditionNoteIn?: string;
  checkedInBy: string;
};

export interface ICheckoutService {
  getAll(options?: PaginationOptions): Promise<ApiResponse<Checkout[]>>;
  getByEquipmentId(equipmentId: string): Promise<ApiResponse<Checkout | null>>;
  getByUserId(userId: string): Promise<ApiResponse<Checkout[]>>;
  getOverdue(): Promise<ApiResponse<Checkout[]>>;
  create(input: CreateCheckoutInput): Promise<ApiResponse<Checkout>>;
  checkIn(checkoutId: string, input: CheckInInput): Promise<ApiResponse<Checkout>>;
  sendReminder(checkoutId: string): Promise<ApiResponse<void>>;
  subscribe?(callback: (checkouts: Checkout[]) => void): () => void;
}
