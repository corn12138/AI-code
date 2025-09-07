// 'use client';

import { apiService } from '@/services/api';
import { useCallback, useState } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'moderator';
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    status: 'active' | 'inactive' | 'banned';
}

interface UserFilters {
    status: 'all' | 'active' | 'inactive' | 'banned';
    author: 'all' | string;
    tags: string[];
}

interface UseUserManagementReturn {
    users: User[];
    currentUser: User | null;
    loading: boolean;
    error: string | null;
    searchQuery: string;
    filters: UserFilters;
    selectedUser: User | null;
    loadUsers: () => Promise<void>;
    loadUser: (id: string) => Promise<void>;
    createUser: (userData: Partial<User>) => Promise<void>;
    updateUser: (id: string, updates: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    searchUsers: (query: string) => Promise<void>;
    selectUser: (user: User) => void;
    clearSelection: () => void;
    setFilters: (filters: UserFilters) => void;
    clearFilters: () => void;
    setError: (error: string) => void;
    clearError: () => void;
}

export const useUserManagement = (): UseUserManagementReturn => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<UserFilters>({
        status: 'all',
        author: 'all',
        tags: [],
    });
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getUsers();
            setUsers(response.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : '加载用户失败');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadUser = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getUser(id);
            setCurrentUser(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '加载用户失败');
        } finally {
            setLoading(false);
        }
    }, []);

    const createUser = useCallback(async (userData: Partial<User>) => {
        try {
            setLoading(true);
            setError(null);

            // 验证用户数据
            if (!userData.name || !userData.email) {
                throw new Error('姓名和邮箱为必填字段');
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
                throw new Error('邮箱格式不正确');
            }

            if (userData.role && !['user', 'admin', 'moderator'].includes(userData.role)) {
                throw new Error('无效的用户角色');
            }

            const response = await apiService.createUser(userData);
            const newUser = response.data;
            setUsers(prev => [...prev, newUser]);
        } catch (err) {
            setError(err instanceof Error ? err.message : '创建用户失败');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
        try {
            setLoading(true);
            setError(null);

            const userExists = users.find(u => u.id === id);
            if (!userExists) {
                throw new Error('用户不存在');
            }

            const response = await apiService.updateUser(id, updates);
            const updatedUser = response.data;
            setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));

            if (selectedUser?.id === id) {
                setSelectedUser(updatedUser);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '更新用户失败');
        } finally {
            setLoading(false);
        }
    }, [users, selectedUser]);

    const deleteUser = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const userExists = users.find(u => u.id === id);
            if (!userExists) {
                throw new Error('用户不存在');
            }

            await apiService.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));

            if (selectedUser?.id === id) {
                setSelectedUser(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '删除用户失败');
        } finally {
            setLoading(false);
        }
    }, [users, selectedUser]);

    const searchUsers = useCallback(async (query: string) => {
        try {
            setLoading(true);
            setError(null);
            setSearchQuery(query);

            if (!query.trim()) {
                await loadUsers();
                return;
            }

            const response = await apiService.searchUsers(query);
            setUsers(response.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : '搜索用户失败');
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const selectUser = useCallback((user: User) => {
        setSelectedUser(user);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedUser(null);
    }, []);

    const updateFilters = useCallback((newFilters: UserFilters) => {
        setFilters(newFilters);
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters({
            status: 'all',
            author: 'all',
            tags: [],
        });
    }, []);

    const setErrorMessage = useCallback((errorMessage: string) => {
        setError(errorMessage);
    }, []);

    const clearErrorMessage = useCallback(() => {
        setError(null);
    }, []);

    return {
        users,
        currentUser,
        loading,
        error,
        searchQuery,
        filters,
        selectedUser,
        loadUsers,
        loadUser,
        createUser,
        updateUser,
        deleteUser,
        searchUsers,
        selectUser,
        clearSelection,
        setFilters: updateFilters,
        clearFilters: clearAllFilters,
        setError: setErrorMessage,
        clearError: clearErrorMessage,
    };
};
