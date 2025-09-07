import { describe, expect, it } from 'vitest';

describe('简单测试', () => {
    it('应该通过基本测试', () => {
        expect(1 + 1).toBe(2);
    });

    it('应该处理字符串', () => {
        expect('hello').toBe('hello');
    });

    it('应该处理数组', () => {
        expect([1, 2, 3]).toHaveLength(3);
    });

    it('应该处理对象', () => {
        const obj = { name: 'test', value: 123 };
        expect(obj.name).toBe('test');
        expect(obj.value).toBe(123);
    });
});
