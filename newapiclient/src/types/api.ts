// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// 用户相关类型
export interface User {
  id: number;
  username: string;
  role: number;
  status: number;
  quota: number;
  used_quota: number;
  created_time: number;
  group: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: number;
  quota: number;
}

export interface UpdateUserRequest {
  id: number;
  username?: string;
  role?: number;
  status?: number;
  quota?: number;
}

// 渠道相关类型
export interface Channel {
  id: number;
  name: string;
  type: number;
  status: number;
  models: string[];
  balance: number;
  priority: number;
  created_time: number;
}

// 模型相关类型
export interface Model {
  id: number;
  name: string;
  ratio: number;
  enabled: boolean;
}

// 兑换码相关类型
export interface Redemption {
  id: number;
  name: string;
  key: string;
  quota: number;
  status: number;
  created_time: number;
  expired_time: number;
  redeemed_time: number;
  used_user_id: number;
}

export interface CreateRedemptionRequest {
  name: string;
  quota: number;
  count: number;
  expired_time: number;
}

// 令牌相关类型
export interface Token {
  id: number;
  name: string;
  key: string;
  status: number;
  remain_quota: number;
  unlimited_quota: boolean;
  created_time: number;
  expired_time: number;
}

export interface CreateTokenRequest {
  name: string;
  remain_quota: number;
  expired_time: number;
  unlimited_quota: boolean;
}

export interface UpdateTokenRequest {
  id: number;
  name?: string;
  status?: number;
  remain_quota?: number;
  expired_time?: number;
  unlimited_quota?: boolean;
}

// 系统设置相关类型
export interface SystemOption {
  key: string;
  value: string;
}

export interface PerformanceStats {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  goroutines: number;
}

export interface LogFile {
  name: string;
  size: number;
  modified_time: number;
}

// 日志相关类型
export interface Log {
  id: number;
  user_id: number;
  username: string;
  model_name: string;
  quota: number;
  created_at: number;
  channel_id: number;
}

// 系统状态类型
export interface SystemStatus {
  version: string;
  start_time: number;
}

export interface DashboardStats {
  user_count: number;
  channel_count: number;
  token_count: number;
}

export interface QuotaDataPoint {
  date: string;
  quota: number;
}

export interface LogStats {
  total_count: number;
  total_quota: number;
  today_count: number;
  today_quota: number;
}

// 分页信息
export interface PageInfo<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// 认证相关类型
export interface Credentials {
  access_token: string;
  user_id: number;
  username: string;
  role: number;
}

export interface LoginRequest {
  base_url: string;
  username: string;
  password: string;
}

// 角色枚举
export enum UserRole {
  User = 1,
  Admin = 10,
  Root = 100,
}

// 状态枚举
export enum UserStatus {
  Disabled = 0,
  Enabled = 1,
}

export enum ChannelStatus {
  Disabled = 0,
  Enabled = 1,
}

export enum RedemptionStatus {
  Enabled = 1,
  Used = 2,
  Disabled = 3,
}
