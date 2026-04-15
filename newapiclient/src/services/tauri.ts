import { invoke } from '@tauri-apps/api/core';
import type {
  Credentials,
  LoginRequest,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PageInfo,
  Redemption,
  CreateRedemptionRequest,
} from '../types/api';

// 认证相关
export const authService = {
  login: (request: LoginRequest) => 
    invoke<Credentials>('login', { request }),
  
  logout: (username: string) => 
    invoke<void>('logout', { username }),
  
  checkAuth: (username: string, baseUrl: string) => 
    invoke<Credentials | null>('check_auth', { username, baseUrl }),
  
  getCurrentUser: () => 
    invoke<Credentials | null>('get_current_user'),
};

// 用户管理
export const userService = {
  getUsers: (page: number, pageSize: number) => 
    invoke<PageInfo<User>>('get_users', { page, pageSize }),
  
  searchUsers: (keyword: string, page: number, pageSize: number) => 
    invoke<PageInfo<User>>('search_users', { keyword, page, pageSize }),
  
  createUser: (request: CreateUserRequest) => 
    invoke<User>('create_user', { request }),
  
  updateUser: (request: UpdateUserRequest) => 
    invoke<User>('update_user', { request }),
  
  deleteUser: (userId: number) => 
    invoke<void>('delete_user', { userId }),
  
  manageUserQuota: (id: number, action: string, quota: number) => 
    invoke<void>('manage_user_quota', { request: { id, action, quota } }),
};

// 兑换码管理
export const redemptionService = {
  getRedemptions: (page: number, pageSize: number) => 
    invoke<PageInfo<Redemption>>('get_redemptions', { page, pageSize }),
  
  createRedemptions: (request: CreateRedemptionRequest) => 
    invoke<string[]>('create_redemptions', { request }),
  
  cleanInvalidRedemptions: () => 
    invoke<number>('clean_invalid_redemptions'),
  
  deleteRedemption: (redemptionId: number) => 
    invoke<void>('delete_redemption', { redemptionId }),
};
