// Express service stubs - to be implemented for UCLA production servers
// These throw "not implemented" errors as placeholders

import type { Equipment, Checkout, User, Manager, Category, ActivityEntry } from '../../types';
import type { ApiResponse, PaginationOptions } from '../types';
import { error } from '../types';
import type { IEquipmentService, CreateEquipmentInput, UpdateEquipmentInput } from '../interfaces/IEquipmentService';
import type { ICheckoutService, CreateCheckoutInput, CheckInInput } from '../interfaces/ICheckoutService';
import type { IUserService, CreateUserInput, UpdateUserInput } from '../interfaces/IUserService';
import type { IManagerService, CreateManagerInput, UpdateManagerInput as ManagerUpdateInput } from '../interfaces/IManagerService';
import type { ICategoryService, UpdateCategoryInput } from '../interfaces/ICategoryService';
import type { IActivityService, CreateActivityInput } from '../interfaces/IActivityService';
import type { IAuthService, AuthUser, SignInCredentials } from '../interfaces/IAuthService';

const NOT_IMPLEMENTED = 'NOT_IMPLEMENTED';
const NOT_IMPLEMENTED_MSG = 'Express backend not yet implemented';

export class EquipmentService implements IEquipmentService {
  async getAll(_options?: PaginationOptions): Promise<ApiResponse<Equipment[]>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async getById(_id: string): Promise<ApiResponse<Equipment>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async getByCategoryId(_categoryId: string): Promise<ApiResponse<Equipment[]>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async create(_input: CreateEquipmentInput): Promise<ApiResponse<Equipment>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async update(_id: string, _input: UpdateEquipmentInput): Promise<ApiResponse<Equipment>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async archive(_id: string, _reason: string): Promise<ApiResponse<Equipment>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async addConditionNote(_id: string, _note: string): Promise<ApiResponse<Equipment>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
}

export class CheckoutService implements ICheckoutService {
  async getAll(_options?: PaginationOptions): Promise<ApiResponse<Checkout[]>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async getByEquipmentId(_equipmentId: string): Promise<ApiResponse<Checkout | null>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async getByUserId(_userId: string): Promise<ApiResponse<Checkout[]>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async getOverdue(): Promise<ApiResponse<Checkout[]>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async create(_input: CreateCheckoutInput): Promise<ApiResponse<Checkout>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async checkIn(_checkoutId: string, _input: CheckInInput): Promise<ApiResponse<Checkout>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async sendReminder(_checkoutId: string): Promise<ApiResponse<void>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
}

export class UserService implements IUserService {
  async getAll(_options?: PaginationOptions): Promise<ApiResponse<User[]>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async getById(_id: string): Promise<ApiResponse<User>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async getByBruinCard(_bruinCardNumber: string): Promise<ApiResponse<User | null>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async getByEmail(_email: string): Promise<ApiResponse<User | null>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async create(_input: CreateUserInput): Promise<ApiResponse<User>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async update(_id: string, _input: UpdateUserInput): Promise<ApiResponse<User>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
}

export class ManagerService implements IManagerService {
  async getAll(_options?: PaginationOptions): Promise<ApiResponse<Manager[]>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async getById(_id: string): Promise<ApiResponse<Manager>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async getByEmail(_email: string): Promise<ApiResponse<Manager | null>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async create(_input: CreateManagerInput): Promise<ApiResponse<Manager>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async update(_id: string, _input: ManagerUpdateInput): Promise<ApiResponse<Manager>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async remove(_id: string): Promise<ApiResponse<void>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
}

export class CategoryService implements ICategoryService {
  async getAll(): Promise<ApiResponse<Category[]>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async getById(_id: string): Promise<ApiResponse<Category>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async update(_id: string, _input: UpdateCategoryInput): Promise<ApiResponse<Category>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
}

export class ActivityService implements IActivityService {
  async getAll(_options?: PaginationOptions): Promise<ApiResponse<ActivityEntry[]>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async getByEquipmentId(_equipmentId: string): Promise<ApiResponse<ActivityEntry[]>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async create(_input: CreateActivityInput): Promise<ApiResponse<ActivityEntry>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
}

export class AuthService implements IAuthService {
  async getCurrentUser(): Promise<ApiResponse<AuthUser | null>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async signIn(_credentials: SignInCredentials): Promise<ApiResponse<AuthUser>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  async signOut(): Promise<ApiResponse<void>> {
    return error(NOT_IMPLEMENTED, NOT_IMPLEMENTED_MSG);
  }
  onAuthStateChange(_callback: (user: AuthUser | null) => void): () => void {
    console.warn('Express auth state change not implemented');
    return () => {};
  }
}
