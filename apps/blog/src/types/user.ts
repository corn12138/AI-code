/**
 * 用户类型定义
 */

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 用户状态类型
 */
export interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * 用户更新数据
 */
export interface UserUpdateData {
  username?: string;
  email?: string;
  bio?: string;
  avatar?: string;
}

/**
 * 用户验证错误
 */
export interface UserValidationError {
  field: string;
  message: string;
}

/**
 * 用户API响应
 */
export interface UserApiResponse {
  success: boolean;
  data?: User;
  error?: string;
  validationErrors?: UserValidationError[];
}
