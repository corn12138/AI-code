// 认证相关
export { AuthProvider, useAuth } from './useAuth';
export type { AuthContextType, AuthState, User } from './useAuth';

// 增强认证相关
export { apiRequest, AuthSecureProvider, isTokenExpired, secureStorage, useAuthSecure } from './useAuthSecure';
export type { LoginCredentials, RegisterData, AuthContextType as SecureAuthContextType, AuthState as SecureAuthState, User as SecureUser } from './useAuthSecure';

// 防抖相关
export { useDebounce, useDebouncedCallback } from './useDebounce';

// 客户端相关
export { useClientSide, useClientSideEffect, useClientState } from './useClientSide';

// 编辑器相关
export { useEditor } from './useEditor';
export type { EditorComponent, EditorState } from './useEditor';

// 异步操作相关
export { useAsync } from './useAsync';
export type { UseAsyncOptions, UseAsyncReturn } from './useAsync';

// 网络状态相关
export { useNetworkStatus } from './useNetworkStatus';
export type { UseNetworkStatusOptions, UseNetworkStatusReturn } from './useNetworkStatus';

// 表单相关
export { useForm } from './useForm';
export type { UseFormOptions, UseFormReturn } from './useForm';

// 增强表单相关
export { debounce, deepClone, defaultValidators, getNestedValue, setNestedValue, useFormEnhanced } from './useFormEnhanced';
export type { FieldConfig, FieldError, FieldState, FormConfig, FormErrors, FormState, UseFormEnhancedReturn, ValidationRule } from './useFormEnhanced';

// 本地存储相关
export { useLocalStorage } from './useLocalStorage';
export type { UseLocalStorageOptions } from './useLocalStorage';

// 窗口大小相关
export { useWindowSize } from './useWindowSize';
export type { UseWindowSizeOptions, WindowSize } from './useWindowSize';

// API请求相关
export { useApi } from './useApi';
export type { UseApiOptions, UseApiReturn } from './useApi';

// Chat SSE相关
export { useChatSSE } from './useChatSSE';
export type { ChatSSEData, UseChatSSEOptions, UseChatSSEReturn } from './useChatSSE';

// 页面状态持久化相关
export { safeStorage, usePageState } from './usePageState';
export type { PageState, PageStateOptions, ScrollPosition, UsePageStateReturn } from './usePageState';

// 平滑路由相关
export { calculatePathSimilarity, generateNavigationId, preloadRoute, useSmoothRouter } from './useSmoothRouter';
export type { NavigationState, SmoothRouterOptions, UseSmoothRouterReturn } from './useSmoothRouter';

// UI交互增强相关
export { addGlobalStyles, createRippleEffect, getDeviceCapabilities, useUIInteraction } from './useUIInteraction';
export type { AnimationConfig, LoadingState, ToastOptions, UIInteractionOptions, UseUIInteractionReturn } from './useUIInteraction';

// 版本信息
export const version = '2.0.0'; 