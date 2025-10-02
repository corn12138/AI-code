import { describe, expect, it } from 'vitest';

describe('Simple Health Test', () => {
    it('应该通过基本测试', () => {
        expect(1 + 1).toBe(2);
    });

    it('应该验证字符串操作', () => {
        const message = 'Hello Vitest';
        expect(message).toContain('Vitest');
        expect(message.length).toBeGreaterThan(0);
    });

    it('应该验证数组操作', () => {
        const items = [1, 2, 3, 4, 5];
        expect(items).toHaveLength(5);
        expect(items).toContain(3);
    });

    it('应该验证对象操作', () => {
        const user = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
        };

        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name', 'Test User');
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('应该验证异步操作', async () => {
        const promise = Promise.resolve('async result');
        const result = await promise;

        expect(result).toBe('async result');
    });
});
