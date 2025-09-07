import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearStorage, getStorageItem, removeStorageItem, setStorageItem } from '../storage';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('Storage工具函数', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        localStorageMock.clear();
    });

    describe('getStorageItem', () => {
        it('应该正确获取字符串值', () => {
            localStorageMock.getItem.mockReturnValue('test-value');

            const result = getStorageItem('test-key');

            expect(result).toBe('test-value');
            expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
        });

        it('应该正确解析JSON值', () => {
            const testData = { name: '测试', age: 25 };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(testData));

            const result = getStorageItem('test-key', true);

            expect(result).toEqual(testData);
        });

        it('应该返回null当key不存在时', () => {
            localStorageMock.getItem.mockReturnValue(null);

            const result = getStorageItem('non-existent-key');

            expect(result).toBeNull();
        });

        it('应该处理无效的JSON', () => {
            localStorageMock.getItem.mockReturnValue('invalid-json');

            const result = getStorageItem('test-key', true);

            expect(result).toBeNull();
        });
    });

    describe('setStorageItem', () => {
        it('应该正确存储字符串值', () => {
            setStorageItem('test-key', 'test-value');

            expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', 'test-value');
        });

        it('应该正确存储对象值', () => {
            const testData = { name: '测试', age: 25 };
            setStorageItem('test-key', testData);

            expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
        });

        it('应该处理存储错误', () => {
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });

            expect(() => setStorageItem('test-key', 'value')).toThrow('Storage quota exceeded');
        });
    });

    describe('removeStorageItem', () => {
        it('应该正确删除存储项', () => {
            removeStorageItem('test-key');

            expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
        });

        it('应该处理删除不存在的项', () => {
            expect(() => removeStorageItem('non-existent-key')).not.toThrow();
        });
    });

    describe('clearStorage', () => {
        it('应该清空所有存储', () => {
            clearStorage();

            expect(localStorageMock.clear).toHaveBeenCalled();
        });
    });

    describe('错误处理', () => {
        it('应该处理localStorage不可用的情况', () => {
            // 模拟localStorage不可用
            Object.defineProperty(window, 'localStorage', {
                value: null,
                writable: true,
            });

            expect(() => getStorageItem('test-key')).not.toThrow();
            expect(() => setStorageItem('test-key', 'value')).not.toThrow();
            expect(() => removeStorageItem('test-key')).not.toThrow();
            expect(() => clearStorage()).not.toThrow();
        });
    });
});
