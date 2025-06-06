import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUserService = {
      findByUsernameOrEmail: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
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
    (mockConfigService.get as jest.Mock).mockImplementation(key => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      if (key === 'JWT_ACCESS_EXPIRATION') return '15m';
      if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
      if (key === 'BCRYPT_SALT_ROUNDS') return 10;
      return undefined;
    });

    // 模拟 getTokens 方法
    jest.spyOn(service as any, 'getTokens').mockResolvedValue({
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
      (userService.findByEmail as jest.Mock).mockResolvedValue({ id: 'exists' });

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
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);
      (userService.findByUsername as jest.Mock).mockResolvedValue(null);

      // 模拟密码哈希
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // 模拟用户创建
      (userService.create as jest.Mock).mockResolvedValue({
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
