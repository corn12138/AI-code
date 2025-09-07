import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../api';

// Mock axios
const mockAxios = {
    create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
            request: {
                use: vi.fn(),
            },
            response: {
                use: vi.fn(),
            },
        },
    })),
};

vi.mock('axios', () => mockAxios);

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
});

describe('API服务', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('API实例', () => {
        it('应该创建axios实例', () => {
            expect(mockAxios.create).toHaveBeenCalledWith({
                baseURL: expect.any(String),
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        });

        it('应该设置请求拦截器', () => {
            const mockInstance = mockAxios.create();
            expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
        });

        it('应该设置响应拦截器', () => {
            const mockInstance = mockAxios.create();
            expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
        });
    });

    describe('请求方法', () => {
        it('应该处理GET请求', async () => {
            const mockResponse = { data: { message: 'success' } };
            const mockInstance = mockAxios.create();
            mockInstance.get.mockResolvedValue(mockResponse);

            const result = await api.get('/test');
            expect(mockInstance.get).toHaveBeenCalledWith('/test');
            expect(result).toEqual(mockResponse);
        });

        it('应该处理POST请求', async () => {
            const mockResponse = { data: { id: 1, name: 'test' } };
            const mockInstance = mockAxios.create();
            mockInstance.post.mockResolvedValue(mockResponse);

            const data = { name: 'test' };
            const result = await api.post('/test', data);
            expect(mockInstance.post).toHaveBeenCalledWith('/test', data);
            expect(result).toEqual(mockResponse);
        });

        it('应该处理PUT请求', async () => {
            const mockResponse = { data: { id: 1, name: 'updated' } };
            const mockInstance = mockAxios.create();
            mockInstance.put.mockResolvedValue(mockResponse);

            const data = { name: 'updated' };
            const result = await api.put('/test/1', data);
            expect(mockInstance.put).toHaveBeenCalledWith('/test/1', data);
            expect(result).toEqual(mockResponse);
        });

        it('应该处理DELETE请求', async () => {
            const mockResponse = { data: { success: true } };
            const mockInstance = mockAxios.create();
            mockInstance.delete.mockResolvedValue(mockResponse);

            const result = await api.delete('/test/1');
            expect(mockInstance.delete).toHaveBeenCalledWith('/test/1');
            expect(result).toEqual(mockResponse);
        });
    });

    describe('错误处理', () => {
        it('应该处理请求错误', async () => {
            const mockError = new Error('Network error');
            const mockInstance = mockAxios.create();
            mockInstance.get.mockRejectedValue(mockError);

            await expect(api.get('/test')).rejects.toThrow('Network error');
        });

        it('应该处理响应错误', async () => {
            const mockError = {
                response: {
                    status: 404,
                    data: { message: 'Not found' },
                },
            };
            const mockInstance = mockAxios.create();
            mockInstance.get.mockRejectedValue(mockError);

            await expect(api.get('/test')).rejects.toEqual(mockError);
        });

        it('应该处理token过期', async () => {
            const mockError = {
                response: {
                    status: 401,
                    data: { message: 'Token expired' },
                },
            };
            const mockInstance = mockAxios.create();
            mockInstance.get.mockRejectedValue(mockError);

            await expect(api.get('/test')).rejects.toEqual(mockError);
        });

        it('应该处理服务器错误', async () => {
            const mockError = {
                response: {
                    status: 500,
                    data: { message: 'Internal server error' },
                },
            };
            const mockInstance = mockAxios.create();
            mockInstance.get.mockRejectedValue(mockError);

            await expect(api.get('/test')).rejects.toEqual(mockError);
        });

        it('应该处理网络错误', async () => {
            const mockError = {
                message: 'Network Error',
                code: 'NETWORK_ERROR',
            };
            const mockInstance = mockAxios.create();
            mockInstance.get.mockRejectedValue(mockError);

            await expect(api.get('/test')).rejects.toEqual(mockError);
        });

        it('应该处理超时错误', async () => {
            const mockError = {
                message: 'timeout of 10000ms exceeded',
                code: 'ECONNABORTED',
            };
            const mockInstance = mockAxios.create();
            mockInstance.get.mockRejectedValue(mockError);

            await expect(api.get('/test')).rejects.toEqual(mockError);
        });
    });

    describe('请求拦截器', () => {
        it('应该添加认证头', () => {
            mockLocalStorage.getItem.mockReturnValue('test-token');
            const mockInstance = mockAxios.create();

            // 模拟请求拦截器
            const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
            const config = { headers: {} };
            const result = requestInterceptor(config);

            expect(result.headers.Authorization).toBe('Bearer test-token');
        });

        it('应该处理没有token的情况', () => {
            mockLocalStorage.getItem.mockReturnValue(null);
            const mockInstance = mockAxios.create();

            const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
            const config = { headers: {} };
            const result = requestInterceptor(config);

            expect(result.headers.Authorization).toBeUndefined();
        });
    });

    describe('响应拦截器', () => {
        it('应该返回响应数据', () => {
            const mockInstance = mockAxios.create();
            const mockResponse = { data: { message: 'success' } };

            const responseInterceptor = mockInstance.interceptors.response.use.mock.calls[0][0];
            const result = responseInterceptor(mockResponse);

            expect(result).toEqual(mockResponse);
        });

        it('应该处理错误响应', () => {
            const mockInstance = mockAxios.create();
            const mockError = {
                response: {
                    status: 400,
                    data: { message: 'Bad request' },
                },
            };

            const errorInterceptor = mockInstance.interceptors.response.use.mock.calls[0][1];
            const result = errorInterceptor(mockError);

            expect(result).rejects.toEqual(mockError);
        });
    });
});
