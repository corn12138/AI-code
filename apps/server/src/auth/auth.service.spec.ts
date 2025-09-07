import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

import { vi, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
vi.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUserService = {
      findByUsernameOrEmail: vi.fn(),
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      create: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      updateRefreshToken: vi.fn(),
    };

    const mockJwtService = {
      signAsync: vi.fn(),
    };

    const mockConfigService = {
      get: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // 模拟配置服务返回值
    (mockConfigService.get as vi.Mock).mockImplementation(key => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      if (key === 'JWT_ACCESS_EXPIRATION') return '15m';
      if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
      if (key === 'BCRYPT_SALT_ROUNDS') return 10;
      return undefined;
    });

    // 模拟 getTokens 方法
    vi.spyOn(service as any, 'getTokens').mockResolvedValue({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      // 模拟用户已存在
      (userService.findByEmail as vi.Mock).mockResolvedValue({ id: 'exists' });

      await expect(
        service.register({
          email: 'existing@example.com',
          username: 'existingUser',
          password: 'password123',
        })
      ).rejects.toThrow(BadRequestException); // 注意这里使用BadRequestException而非ConflictException
    });

    it('should create a new user with hashed password', async () => {
      // 模拟用户不存在
      (userService.findByEmail as vi.Mock).mockResolvedValue(null);
      (userService.findByUsername as vi.Mock).mockResolvedValue(null);

      // 模拟密码哈希
      (bcrypt.hash as vi.Mock).mockResolvedValue('hashed_password');

      // 模拟用户创建
      (userService.create as vi.Mock).mockResolvedValue({
        id: 'new-user-id',
        email: 'new@example.com',
        username: 'newuser',
        roles: ['user']
      });

      const registerDto = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
      };

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashed_password',
        roles: ['user']
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
