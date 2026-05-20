// Service factory - creates service instances based on configured backend

import { env, validateEnv } from '../config/env';
import type { IEquipmentService } from './interfaces/IEquipmentService';
import type { ICheckoutService } from './interfaces/ICheckoutService';
import type { IUserService } from './interfaces/IUserService';
import type { IManagerService } from './interfaces/IManagerService';
import type { ICategoryService } from './interfaces/ICategoryService';
import type { IActivityService } from './interfaces/IActivityService';
import type { IAuthService } from './interfaces/IAuthService';

import * as SupabaseServices from './supabase';
import * as ExpressServices from './express';

export interface ApiServices {
  equipment: IEquipmentService;
  checkouts: ICheckoutService;
  users: IUserService;
  managers: IManagerService;
  categories: ICategoryService;
  activities: IActivityService;
  auth: IAuthService;
}

let servicesInstance: ApiServices | null = null;

export function createApiServices(): ApiServices {
  validateEnv();

  if (env.apiBackend === 'supabase') {
    console.log('Using Supabase backend');
    return {
      equipment: new SupabaseServices.EquipmentService(),
      checkouts: new SupabaseServices.CheckoutService(),
      users: new SupabaseServices.UserService(),
      managers: new SupabaseServices.ManagerService(),
      categories: new SupabaseServices.CategoryService(),
      activities: new SupabaseServices.ActivityService(),
      auth: new SupabaseServices.AuthService(),
    };
  } else {
    console.log('Using Express backend');
    return {
      equipment: new ExpressServices.EquipmentService(),
      checkouts: new ExpressServices.CheckoutService(),
      users: new ExpressServices.UserService(),
      managers: new ExpressServices.ManagerService(),
      categories: new ExpressServices.CategoryService(),
      activities: new ExpressServices.ActivityService(),
      auth: new ExpressServices.AuthService(),
    };
  }
}

// Singleton accessor
export function getApiServices(): ApiServices {
  if (!servicesInstance) {
    servicesInstance = createApiServices();
  }
  return servicesInstance;
}

// Re-export types
export type { ApiResponse, ApiError, PaginationOptions } from './types';
export type {
  IEquipmentService,
  ICheckoutService,
  IUserService,
  IManagerService,
  ICategoryService,
  IActivityService,
  IAuthService,
} from './interfaces';
