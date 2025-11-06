import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthModule } from '../../src/auth/auth.module';
import { User } from '../../src/user/entities/user.entity';
import { UserModule } from '../../src/user/user.module';
import { createMockRepository } from '../utils/test-helpers';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let moduleRef: TestingModule;
  let mockUserRepository: ReturnType<typeof createMockRepository>;

  beforeAll(async () => {
    mockUserRepository = createMockRepository<User>();

    moduleRef = await Test.createTestingModule({
      imports: [
        AuthModule,
        UserModule,
      ],
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getDataSourceToken(),
          useValue: {
            isInitialized: true,
            query: vi.fn().mockResolvedValue([{ version: 'PostgreSQL 16.8' }]),
            createQueryRunner: vi.fn().mockReturnValue({
              query: vi.fn().mockResolvedValue([{ connections: '6' }]),
              release: vi.fn().mockResolvedValue(undefined),
            }),
            driver: {
              options: {
                type: 'postgres',
              },
            },
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('应该成功注册新用户', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      };

      const response = await apiHelper.publicRequest('post', '/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        email: registerDto.email,
        username: registerDto.username,
        role: 'user',
      });
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('createdAt');
      expect(response.body.user).toHaveProperty('updatedAt');

      // 验证 JWT Token 是否有效
      const payload = jwtService.verify(response.body.access_token);
      expect(payload).toHaveProperty('sub', response.body.user.id);
      expect(payload).toHaveProperty('email', registerDto.email);
      expect(payload).toHaveProperty('username', registerDto.username);
      expect(payload).toHaveProperty('role', 'user');
    });

    it('应该在邮箱已存在时返回 409', async () => {
      const registerDto = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'Password123!',
      };

      // 先注册一个用户
      await apiHelper.publicRequest('post', '/auth/register')
        .send(registerDto)
        .expect(201);

      // 尝试用相同邮箱再次注册
      const response = await apiHelper.publicRequest('post', '/auth/register')
        .send({
          email: registerDto.email,
          username: 'differentuser',
          password: 'Password123!',
        })
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });

    it('应该在缺少必填字段时返回 400', async () => {
      const invalidDto = {
        email: 'test@example.com',
        // 缺少 username 和 password
      };

      const response = await apiHelper.publicRequest('post', '/auth/register')
        .send(invalidDto)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('应该在邮箱格式无效时返回 400', async () => {
      const invalidDto = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'Password123!',
      };

      await apiHelper.publicRequest('post', '/auth/register')
        .send(invalidDto)
        .expect(400);
    });

    it('应该在密码过弱时返回 400', async () => {
      const invalidDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: '123', // 过弱的密码
      };

      await apiHelper.publicRequest('post', '/auth/register')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    let registeredUser: any;

    beforeEach(async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      };

      const response = await apiHelper.publicRequest('post', '/auth/register')
        .send(registerDto)
        .expect(201);

      registeredUser = response.body.user;
    });

    it('应该成功登录有效用户', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const response = await apiHelper.publicRequest('post', '/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        id: registeredUser.id,
        email: loginDto.email,
        username: 'testuser',
        role: 'user',
      });
      expect(response.body.user).not.toHaveProperty('password');

      // 验证 JWT Token 是否有效
      const payload = jwtService.verify(response.body.access_token);
      expect(payload).toHaveProperty('sub', registeredUser.id);
      expect(payload).toHaveProperty('email', loginDto.email);
    });

    it('应该在密码错误时返回 401', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const response = await apiHelper.publicRequest('post', '/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('应该在用户不存在时返回 401', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      const response = await apiHelper.publicRequest('post', '/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('应该在缺少凭据时返回 400', async () => {
      const invalidDto = {
        email: 'test@example.com',
        // 缺少 password
      };

      await apiHelper.publicRequest('post', '/auth/login')
        .send(invalidDto)
        .expect(400);
    });

    it('应该在邮箱格式无效时返回 400', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password: 'Password123!',
      };

      await apiHelper.publicRequest('post', '/auth/login')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /auth/profile', () => {
    let accessToken: string;
    let user: any;

    beforeEach(async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      };

      const response = await apiHelper.publicRequest('post', '/auth/register')
        .send(registerDto)
        .expect(201);

      accessToken = response.body.access_token;
      user = response.body.user;
    });

    it('应该返回当前用户的资料', async () => {
      const response = await apiHelper.authenticatedRequest('get', '/auth/profile', accessToken)
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('应该在未提供 Token 时返回 401', async () => {
      await apiHelper.publicRequest('get', '/auth/profile')
        .expect(401);
    });

    it('应该在 Token 无效时返回 401', async () => {
      const invalidToken = 'invalid-jwt-token';

      await apiHelper.authenticatedRequest('get', '/auth/profile', invalidToken)
        .expect(401);
    });

    it('应该在 Token 过期时返回 401', async () => {
      // 创建一个过期的 Token
      const expiredPayload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        iat: Math.floor(Date.now() / 1000) - 3600, // 1小时前
        exp: Math.floor(Date.now() / 1000) - 1800, // 30分钟前过期
      };

      const expiredToken = jwtService.sign(expiredPayload, { expiresIn: '-30m' });

      await apiHelper.authenticatedRequest('get', '/auth/profile', expiredToken)
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    let accessToken: string;
    let user: any;

    beforeEach(async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      };

      const response = await apiHelper.publicRequest('post', '/auth/register')
        .send(registerDto)
        .expect(201);

      accessToken = response.body.access_token;
      user = response.body.user;
    });

    it('应该成功刷新有效的 Token', async () => {
      const refreshDto = {
        refresh_token: accessToken,
      };

      const response = await apiHelper.publicRequest('post', '/auth/refresh')
        .send(refreshDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });

      // 验证新 Token 是否有效
      const payload = jwtService.verify(response.body.access_token);
      expect(payload).toHaveProperty('sub', user.id);
      expect(payload).toHaveProperty('email', user.email);

      // 新 Token 应该与旧 Token 不同
      expect(response.body.access_token).not.toBe(accessToken);
    });

    it('应该在 Token 无效时返回 401', async () => {
      const refreshDto = {
        refresh_token: 'invalid-jwt-token',
      };

      const response = await apiHelper.publicRequest('post', '/auth/refresh')
        .send(refreshDto)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('应该在缺少 Token 时返回 400', async () => {
      const invalidDto = {
        // 缺少 refresh_token
      };

      await apiHelper.publicRequest('post', '/auth/refresh')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('应该成功登出用户', async () => {
      const response = await apiHelper.publicRequest('post', '/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Successfully logged out');
    });

    it('应该在未认证时也能成功登出', async () => {
      const response = await apiHelper.publicRequest('post', '/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Successfully logged out');
    });
  });

  describe('POST /auth/validate', () => {
    let accessToken: string;
    let user: any;

    beforeEach(async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      };

      const response = await apiHelper.publicRequest('post', '/auth/register')
        .send(registerDto)
        .expect(201);

      accessToken = response.body.access_token;
      user = response.body.user;
    });

    it('应该成功验证有效的 Token', async () => {
      const validateDto = {
        token: accessToken,
      };

      const response = await apiHelper.publicRequest('post', '/auth/validate')
        .send(validateDto)
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });
    });

    it('应该在 Token 无效时返回 401', async () => {
      const validateDto = {
        token: 'invalid-jwt-token',
      };

      await apiHelper.publicRequest('post', '/auth/validate')
        .send(validateDto)
        .expect(401);
    });

    it('应该在缺少 Token 时返回 400', async () => {
      const invalidDto = {
        // 缺少 token
      };

      await apiHelper.publicRequest('post', '/auth/validate')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('认证流程集成测试', () => {
    it('应该完成完整的认证流程', async () => {
      // 1. 注册用户
      const registerDto = {
        email: 'flow@example.com',
        username: 'flowuser',
        password: 'Password123!',
      };

      const registerResponse = await apiHelper.publicRequest('post', '/auth/register')
        .send(registerDto)
        .expect(201);

      const { access_token: registerToken, user } = registerResponse.body;

      // 2. 使用注册返回的 Token 获取用户资料
      const profileResponse = await apiHelper.authenticatedRequest('get', '/auth/profile', registerToken)
        .expect(200);

      expect(profileResponse.body.id).toBe(user.id);

      // 3. 登出
      await apiHelper.publicRequest('post', '/auth/logout')
        .expect(200);

      // 4. 重新登录
      const loginDto = {
        email: registerDto.email,
        password: registerDto.password,
      };

      const loginResponse = await apiHelper.publicRequest('post', '/auth/login')
        .send(loginDto)
        .expect(200);

      const { access_token: loginToken } = loginResponse.body;

      // 5. 使用新 Token 获取用户资料
      const profileResponse2 = await apiHelper.authenticatedRequest('get', '/auth/profile', loginToken)
        .expect(200);

      expect(profileResponse2.body.id).toBe(user.id);

      // 6. 刷新 Token
      const refreshDto = {
        refresh_token: loginToken,
      };

      const refreshResponse = await apiHelper.publicRequest('post', '/auth/refresh')
        .send(refreshDto)
        .expect(200);

      const { access_token: refreshedToken } = refreshResponse.body;

      // 7. 使用刷新后的 Token 获取用户资料
      const profileResponse3 = await apiHelper.authenticatedRequest('get', '/auth/profile', refreshedToken)
        .expect(200);

      expect(profileResponse3.body.id).toBe(user.id);

      // 8. 验证 Token
      const validateDto = {
        token: refreshedToken,
      };

      const validateResponse = await apiHelper.publicRequest('post', '/auth/validate')
        .send(validateDto)
        .expect(200);

      expect(validateResponse.body.valid).toBe(true);
      expect(validateResponse.body.user.id).toBe(user.id);
    });
  });

  describe('安全性测试', () => {
    it('应该在多次失败登录后保持一致的响应', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'WrongPassword',
      };

      const responses = await Promise.all([
        apiHelper.publicRequest('post', '/auth/login').send(loginDto),
        apiHelper.publicRequest('post', '/auth/login').send(loginDto),
        apiHelper.publicRequest('post', '/auth/login').send(loginDto),
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid credentials');
      });
    });

    it('应该不在响应中泄露敏感信息', async () => {
      const registerDto = {
        email: 'security@example.com',
        username: 'securityuser',
        password: 'VerySecretPassword123!',
      };

      const response = await apiHelper.publicRequest('post', '/auth/register')
        .send(registerDto)
        .expect(201);

      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toContain(registerDto.password);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('应该正确处理 SQL 注入尝试', async () => {
      const maliciousDto = {
        email: "'; DROP TABLE users; --",
        password: 'Password123!',
      };

      await apiHelper.publicRequest('post', '/auth/login')
        .send(maliciousDto)
        .expect(400); // 应该因为邮箱格式验证失败而返回 400
    });
  });

  describe('并发测试', () => {
    it('应该处理并发注册请求', async () => {
      const registerPromises = Array.from({ length: 5 }, (_, i) =>
        apiHelper.publicRequest('post', '/auth/register')
          .send({
            email: `concurrent${i}@example.com`,
            username: `concurrent${i}`,
            password: 'Password123!',
          })
      );

      const responses = await Promise.all(registerPromises);

      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('user');
      });

      // 确保所有用户都有唯一的 ID
      const userIds = responses.map(r => r.body.user.id);
      const uniqueIds = new Set(userIds);
      expect(uniqueIds.size).toBe(5);
    });

    it('应该处理并发登录请求', async () => {
      // 先注册一个用户
      const registerDto = {
        email: 'concurrent@example.com',
        username: 'concurrentuser',
        password: 'Password123!',
      };

      await apiHelper.publicRequest('post', '/auth/register')
        .send(registerDto)
        .expect(201);

      // 并发登录
      const loginDto = {
        email: registerDto.email,
        password: registerDto.password,
      };

      const loginPromises = Array.from({ length: 5 }, () =>
        apiHelper.publicRequest('post', '/auth/login').send(loginDto)
      );

      const responses = await Promise.all(loginPromises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('user');
      });
    });
  });
});