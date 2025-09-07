import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// 基础功能测试
describe('Basic Functionality Tests', () => {
    it('should pass basic arithmetic', () => {
        expect(1 + 1).toBe(2);
        expect(2 * 3).toBe(6);
        expect(10 / 2).toBe(5);
    });

    it('should handle async operations', async () => {
        const result = await Promise.resolve('success');
        expect(result).toBe('success');
    });

    it('should work with mocks', () => {
        const mockFn = vi.fn().mockReturnValue('mocked value');
        expect(mockFn()).toBe('mocked value');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should test environment variables', () => {
        expect(process.env.NODE_ENV).toBe('test');
    });
});

// NestJS基础测试
describe('NestJS Basic Tests', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'TEST_SERVICE',
                    useValue: {
                        test: vi.fn().mockReturnValue('test result'),
                        asyncTest: vi.fn().mockResolvedValue('async result'),
                    },
                },
            ],
        }).compile();
    });

    it('should create testing module', () => {
        expect(module).toBeDefined();
    });

    it('should get provider from module', () => {
        const service = module.get('TEST_SERVICE');
        expect(service).toBeDefined();
        expect(service.test()).toBe('test result');
    });

    it('should handle async provider methods', async () => {
        const service = module.get('TEST_SERVICE');
        const result = await service.asyncTest();
        expect(result).toBe('async result');
    });
});

// 测试工具函数
describe('Test Utility Functions', () => {
    it('should handle array operations', () => {
        const arr = [1, 2, 3, 4, 5];
        expect(arr.length).toBe(5);
        expect(arr.map(x => x * 2)).toEqual([2, 4, 6, 8, 10]);
        expect(arr.filter(x => x > 3)).toEqual([4, 5]);
    });

    it('should handle object operations', () => {
        const obj = { name: 'test', value: 42 };
        expect(obj.name).toBe('test');
        expect(obj.value).toBe(42);
        expect(Object.keys(obj)).toEqual(['name', 'value']);
    });

    it('should handle string operations', () => {
        const str = 'hello world';
        expect(str.length).toBe(11);
        expect(str.toUpperCase()).toBe('HELLO WORLD');
        expect(str.split(' ')).toEqual(['hello', 'world']);
    });
});

// 错误处理测试
describe('Error Handling Tests', () => {
    it('should handle synchronous errors', () => {
        expect(() => {
            throw new Error('test error');
        }).toThrow('test error');
    });

    it('should handle asynchronous errors', async () => {
        await expect(Promise.reject(new Error('async error'))).rejects.toThrow('async error');
    });

    it('should handle try-catch blocks', () => {
        let errorCaught = false;
        try {
            throw new Error('test');
        } catch (error) {
            errorCaught = true;
            expect(error).toBeInstanceOf(Error);
        }
        expect(errorCaught).toBe(true);
    });
});
