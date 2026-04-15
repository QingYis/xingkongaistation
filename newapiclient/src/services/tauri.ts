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
  SystemStatus,
  DashboardStats,
  QuotaDataPoint,
  LogStats,
  Token,
  CreateTokenRequest,
  UpdateTokenRequest,
  SystemOption,
  PerformanceStats,
  LogFile,
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

// Dashboard
export const dashboardService = {
  getSystemStatus: () =>
    invoke<SystemStatus>('get_system_status'),

  getDashboardStats: () =>
    invoke<DashboardStats>('get_dashboard_stats'),

  getQuotaData: (startTimestamp: number, endTimestamp: number) =>
    invoke<QuotaDataPoint[]>('get_quota_data', { startTimestamp, endTimestamp }),

  getLogStats: (startTimestamp: number, endTimestamp: number) =>
    invoke<LogStats>('get_log_stats', { startTimestamp, endTimestamp }),
};

// Token 管理
export const tokenService = {
  getTokens: (page: number, pageSize: number) =>
    invoke<PageInfo<Token>>('get_tokens', { page, pageSize }),

  searchTokens: (keyword: string, page: number, pageSize: number) =>
    invoke<PageInfo<Token>>('search_tokens', { keyword, page, pageSize }),

  createToken: (request: CreateTokenRequest) =>
    invoke<Token>('create_token', { request }),

  updateToken: (request: UpdateTokenRequest) =>
    invoke<Token>('update_token', { request }),

  deleteToken: (tokenId: number) =>
    invoke<void>('delete_token', { tokenId }),

  getTokenKey: (tokenId: number) =>
    invoke<string>('get_token_key', { tokenId }),

  deleteTokensBatch: (tokenIds: number[]) =>
    invoke<void>('delete_tokens_batch', { tokenIds }),
};

// Settings 管理
export const settingsService = {
  getSystemOptions: () =>
    invoke<SystemOption[]>('get_system_options'),

  updateSystemOption: (key: string, value: string) =>
    invoke<void>('update_system_option', { key, value }),

  getPerformanceStats: () =>
    invoke<PerformanceStats>('get_performance_stats'),

  clearDiskCache: () =>
    invoke<void>('clear_disk_cache'),

  forceGC: () =>
    invoke<void>('force_gc'),

  getLogFiles: () =>
    invoke<LogFile[]>('get_log_files'),

  cleanupLogFiles: () =>
    invoke<void>('cleanup_log_files'),
};
