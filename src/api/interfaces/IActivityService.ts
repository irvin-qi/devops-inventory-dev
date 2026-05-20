import type { ActivityEntry } from '../../types';
import type { ApiResponse, PaginationOptions } from '../types';

export type ActivityAction = 'check_out' | 'check_in' | 'reminder' | 'note' | 'added' | 'archived';

export type CreateActivityInput = {
  equipmentId: string;
  action: ActivityAction;
  actorName: string;
  userId?: string;
  note?: string;
};

export interface IActivityService {
  getAll(options?: PaginationOptions): Promise<ApiResponse<ActivityEntry[]>>;
  getByEquipmentId(equipmentId: string): Promise<ApiResponse<ActivityEntry[]>>;
  create(input: CreateActivityInput): Promise<ApiResponse<ActivityEntry>>;
  subscribe?(callback: (activities: ActivityEntry[]) => void): () => void;
}
