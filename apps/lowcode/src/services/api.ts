import axios from 'axios';
import { CreatePageDTO, PageResponse, UpdatePageDTO } from '@/types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true // 确保包含Cookie
});

// 请求拦截器：添加认证令牌
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 对于非安全方法，axios会自动获取名为XSRF-TOKEN的cookie并设置为X-XSRF-TOKEN头
  // 这是一种行业标准做法，无需手动处理
  
  return config;
});

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || '请求失败';
    console.error('API Error:', message);
    
    // 特殊处理CSRF错误
    if (error.response?.status === 401 && error.response?.data?.message?.includes('CSRF')) {
      console.error('CSRF token validation failed.');
      // 这里可以添加额外处理，如跳转到登录页
    }
    
    throw error;
  }
);

export const lowcodeApi = {
  // 页面相关接口
  getPages: async (): Promise<PageResponse[]> => {
    return api.get('/lowcode/pages');
  },
  
  getPageById: async (id: string): Promise<PageResponse> => {
    return api.get(`/lowcode/pages/${id}`);
  },
  
  createPage: async (data: CreatePageDTO): Promise<PageResponse> => {
    return api.post('/lowcode/pages', data);
  },
  
  updatePage: async (id: string, data: UpdatePageDTO): Promise<PageResponse> => {
    return api.put(`/lowcode/pages/${id}`, data);
  },
  
  deletePage: async (id: string): Promise<void> => {
    return api.delete(`/lowcode/pages/${id}`);
  },
  
  publishPage: async (id: string): Promise<PageResponse> => {
    return api.post(`/lowcode/pages/${id}/publish`);
  },
  
  // 其他接口
  exportPageAsCode: async (id: string): Promise<string> => {
    const response = await api.get(`/lowcode/export/${id}`, {
      responseType: 'blob'
    });
    return URL.createObjectURL(response);
  },
  
  previewPage: async (id: string): Promise<string> => {
    return api.get(`/lowcode/preview/${id}`);
  }
};
