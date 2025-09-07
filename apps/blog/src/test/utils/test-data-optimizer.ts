/**
 * 测试数据优化工具
 * 用于优化mock数据，减少重复代码，提高测试可维护性
 */

import { User } from '@/types/user';

/**
 * 基础用户数据工厂
 */
export class UserDataFactory {
  private static counter = 0;

  /**
   * 创建基础用户数据
   */
  static createBaseUser(overrides: Partial<User> = {}): User {
    this.counter++;
    
    return {
      id: `user-${this.counter}`,
      username: `testuser${this.counter}`,
      email: `testuser${this.counter}@example.com`,
      avatar: `/default-avatar.svg`,
      bio: `这是测试用户${this.counter}的个人简介`,
      roles: ['user'],
      ...overrides,
    };
  }

  /**
   * 创建管理员用户
   */
  static createAdminUser(overrides: Partial<User> = {}): User {
    return this.createBaseUser({
      username: 'admin',
      email: 'admin@example.com',
      roles: ['admin', 'user'],
      bio: '系统管理员',
      ...overrides,
    });
  }

  /**
   * 创建多个用户
   */
  static createUsers(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, (_, index) => 
      this.createBaseUser({
        username: `user${index + 1}`,
        email: `user${index + 1}@example.com`,
        ...overrides,
      })
    );
  }

  /**
   * 重置计数器
   */
  static reset(): void {
    this.counter = 0;
  }
}

/**
 * 测试环境配置
 */
export class TestEnvironmentConfig {
  private static config = {
    mockApiDelay: 100,
    enablePerformanceMonitoring: true,
    enableDetailedLogging: false,
    testTimeout: 10000,
  };

  /**
   * 设置配置
   */
  static setConfig(newConfig: Partial<typeof TestEnvironmentConfig.config>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取配置
   */
  static getConfig() {
    return { ...this.config };
  }

  /**
   * 设置API延迟
   */
  static setApiDelay(delay: number): void {
    this.config.mockApiDelay = delay;
  }

  /**
   * 启用/禁用性能监控
   */
  static setPerformanceMonitoring(enabled: boolean): void {
    this.config.enablePerformanceMonitoring = enabled;
  }

  /**
   * 启用/禁用详细日志
   */
  static setDetailedLogging(enabled: boolean): void {
    this.config.enableDetailedLogging = enabled;
  }
}

/**
 * 测试数据缓存
 */
export class TestDataCache {
  private static cache = new Map<string, any>();

  /**
   * 设置缓存数据
   */
  static set<T>(key: string, data: T): void {
    this.cache.set(key, data);
  }

  /**
   * 获取缓存数据
   */
  static get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  /**
   * 检查缓存是否存在
   */
  static has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * 清除缓存
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * 删除特定缓存
   */
  static delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

/**
 * 测试工具函数
 */
export class TestUtils {
  /**
   * 等待指定时间
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 模拟API调用
   */
  static async mockApiCall<T>(data: T, delay?: number): Promise<T> {
    const config = TestEnvironmentConfig.getConfig();
    const actualDelay = delay ?? config.mockApiDelay;
    
    await this.wait(actualDelay);
    return data;
  }

  /**
   * 创建测试ID
   */
  static createTestId(prefix: string = 'test'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 验证对象结构
   */
  static validateObjectStructure(obj: any, expectedKeys: string[]): boolean {
    return expectedKeys.every(key => key in obj);
  }

  /**
   * 深度克隆对象
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * 创建测试错误
   */
  static createTestError(message: string, code?: string): Error {
    const error = new Error(message);
    if (code) {
      (error as any).code = code;
    }
    return error;
  }
}

/**
 * 测试数据验证器
 */
export class TestDataValidator {
  /**
   * 验证用户数据
   */
  static validateUser(user: any): boolean {
    const requiredFields = ['id', 'username', 'email'];
    return TestUtils.validateObjectStructure(user, requiredFields);
  }

  /**
   * 验证用户数组
   */
  static validateUsers(users: any[]): boolean {
    return users.every(user => this.validateUser(user));
  }

  /**
   * 验证邮箱格式
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证用户名格式
   */
  static validateUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 50;
  }
}

/**
 * 测试数据生成器
 */
export class TestDataGenerator {
  /**
   * 生成随机字符串
   */
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  /**
   * 生成随机邮箱
   */
  static randomEmail(): string {
    const username = this.randomString(8);
    const domain = this.randomString(6);
    return `${username}@${domain}.com`;
  }

  /**
   * 生成随机用户名
   */
  static randomUsername(): string {
    return `user_${this.randomString(6)}`;
  }

  /**
   * 生成随机ID
   */
  static randomId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 测试数据清理器
 */
export class TestDataCleaner {
  /**
   * 清理测试数据
   */
  static cleanup(): void {
    UserDataFactory.reset();
    TestDataCache.clear();
    
    if (TestEnvironmentConfig.getConfig().enableDetailedLogging) {
      console.log('🧹 测试数据已清理');
    }
  }

  /**
   * 清理DOM
   */
  static cleanupDOM(): void {
    const root = document.getElementById('root') || document.body;
    if (root) {
      root.innerHTML = '';
    }
  }

  /**
   * 清理所有测试数据
   */
  static cleanupAll(): void {
    this.cleanup();
    this.cleanupDOM();
  }
}
