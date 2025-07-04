import type { User } from '@shared/types';
import apiClient from './client';

export const authApi = {
    login: (credentials: { email: string; password: string }) =>
        apiClient.post<{ user: User; token: string }>('/auth/login', credentials),

    register: (data: { email: string; password: string; username: string }) =>
        apiClient.post<{ user: User; token: string }>('/auth/register', data),

    refresh: () =>
        apiClient.post<{ token: string }>('/auth/refresh'),

    logout: () =>
        apiClient.post('/auth/logout'),

    getProfile: () =>
        apiClient.get<User>('/auth/profile')
}; 