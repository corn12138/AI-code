import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * 创建请求实例配置
 */
export interface RequestConfig extends AxiosRequestConfig {
  /**
   * 请求错误时是否自动显示错误信息
   */
  showError?: boolean;
  /**
   * 请求成功时是否自动显示成功信息
   */
  showSuccess?: boolean;
  /**
   * 成功信息内容
   */
  successMessage?: string;
}

/**
 * 请求响应数据结构
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

/**
 * 创建一个封装了常用功能的axios实例
 * @param baseConfig 基础配置
 */
export function createRequest(baseConfig: RequestConfig = {}): AxiosInstance {
  // 创建axios实例
  const instance = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    ...baseConfig,
  });
  
  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 从本地存储获取token
      const token = localStorage.getItem('accessToken');
      
      // 如果有token则带上
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // 处理成功响应
      const config = response.config as RequestConfig;
      const apiResponse = response.data as ApiResponse;
      
      // 如果接口设置了显示成功消息，则显示
      if (config.showSuccess && apiResponse.success && config.successMessage) {
        console.log('Success:', config.successMessage);
        // 这里可以集成toast/notification组件
      }
      
      return response;
    },
    (error) => {
      // 处理错误响应
      const config = error.config as RequestConfig;
      let message = '请求失败，请稍后重试';
      
      if (error.response) {
        const { status, data } = error.response;
        
        // 根据状态码处理不同错误
        switch (status) {
          case 400:
            message = data.message || '请求参数错误';
            break;
          case 401:
            message = '未授权，请登录';
            // 可以在这里处理token过期等情况
            break;
          case 403:
            message = '禁止访问';
            break;
          case 404:
            message = '请求的资源不存在';
            break;
          case 500:
            message = '服务器错误';
            break;
          default:
            message = data.message || `请求失败，状态码: ${status}`;
        }
      } else if (error.request) {
        // 请求已发送但没有收到响应
        if (error.message.includes('timeout')) {
          message = '请求超时，请稍后重试';
        } else {
          message = '网络错误，请检查您的网络连接';
        }
      }
      
      // 如果接口设置了显示错误消息，则显示
      if (config.showError !== false) {
        console.error('Error:', message);
        // 这里可以集成toast/notification组件
      }
      
      return Promise.reject(error);
    }
  );
  
  return instance;
}

// 导出一个默认的请求实例
export const request = createRequest();

/**
 * GET请求
 * @param url 请求地址
 * @param params 请求参数
 * @param config 请求配置
 */
export function get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> {
  return request.get(url, { params, ...config }).then(res => res.data);
}

/**
 * POST请求
 * @param url 请求地址
 * @param data 请求数据
 * @param config 请求配置
 */
export function post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
  return request.post(url, data, config).then(res => res.data);
}

/**
 * PUT请求
 * @param url 请求地址
 * @param data 请求数据
 * @param config 请求配置
 */
export function put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
  return request.put(url, data, config).then(res => res.data);
}

/**
 * DELETE请求
 * @param url 请求地址
 * @param config 请求配置
 */
export function del<T = any>(url: string, config?: RequestConfig): Promise<T> {
  return request.delete(url, config).then(res => res.data);
}
