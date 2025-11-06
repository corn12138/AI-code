import { vi } from 'vitest';

// 创建 Logger Mock 类
export class MockLogger {
    log = vi.fn();
    error = vi.fn();
    warn = vi.fn();
    debug = vi.fn();
    verbose = vi.fn();
    setContext = vi.fn();
    setLogLevels = vi.fn();

    constructor(context?: string) {
        // 可以在这里设置上下文
    }
}

// Mock Logger 原型
export const mockLoggerPrototype = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
    setContext: vi.fn(),
    setLogLevels: vi.fn(),
};

// 设置全局 Logger Mock
vi.mock('@nestjs/common', async () => {
    const actual = await vi.importActual('@nestjs/common');
    return {
        ...actual,
        Logger: MockLogger,
    };
});

// 设置 Logger 原型 Mock
Object.defineProperty(MockLogger.prototype, 'log', {
    value: vi.fn(),
    writable: true,
});

Object.defineProperty(MockLogger.prototype, 'error', {
    value: vi.fn(),
    writable: true,
});

Object.defineProperty(MockLogger.prototype, 'warn', {
    value: vi.fn(),
    writable: true,
});

Object.defineProperty(MockLogger.prototype, 'debug', {
    value: vi.fn(),
    writable: true,
});

Object.defineProperty(MockLogger.prototype, 'verbose', {
    value: vi.fn(),
    writable: true,
});
