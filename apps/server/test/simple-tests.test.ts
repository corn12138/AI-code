import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// 简单的测试，不导入任何实体文件
describe('Simple Tests', () => {
    it('should pass basic test', () => {
        expect(1 + 1).toBe(2);
    });

    it('should handle async operations', async () => {
        const result = await Promise.resolve('test');
        expect(result).toBe('test');
    });

    it('should work with mocks', () => {
        const mockFn = vi.fn().mockReturnValue('mocked');
        expect(mockFn()).toBe('mocked');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should test environment variables', () => {
        expect(process.env.NODE_ENV).toBe('test');
    });
});

// 测试NestJS基础功能
describe('NestJS Basic Tests', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'TEST_SERVICE',
                    useValue: {
                        test: vi.fn().mockReturnValue('test result'),
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
});
