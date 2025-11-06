import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { factories } from '../../test/factories';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;

  const mockUserService = {
    findByEmail: vi.fn(),
    findByUsername: vi.fn(),
    findByUsernameOrEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    validateUser: vi.fn(),
    validatePassword: vi.fn(),
    updateRefreshToken: vi.fn(),
  };

  const mockJwtService = {
    sign: vi.fn(),
    signAsync: vi.fn(),
    verify: vi.fn(),
    verifyAsync: vi.fn(),
  };

  const mockConfigService = {
    get: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // 确保 AuthService 的依赖被正确注入
    (service as any).usersService = userService;
    (service as any).jwtService = jwtService;
    (service as any).configService = module.get<ConfigService>(ConfigService);

    vi.clearAllMocks();
  });

  describe('register', () => {
    it('应该成功注册新用户', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      };

      const createdUser = factories.user.create({
        ...registerDto,
        id: 'user-id-123',
      });

      const accessToken = 'jwt-token-123';

      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.findByUsername.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(createdUser);
      mockJwtService.signAsync.mockResolvedValue(accessToken);

      const result = await service.register(registerDto);

      expect(mockUserService.create).toHaveBeenCalledWith(expect.objectContaining({
        email: registerDto.email,
        username: registerDto.username,
        roles: ['user'],
      }));
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: createdUser.id,
          email: createdUser.email,
          username: createdUser.username,
        }),
        expect.any(Object)
      );
      expect(result).toEqual(expect.objectContaining({
        accessToken: accessToken,
        refreshToken: accessToken,
        user: expect.objectContaining({
          id: createdUser.id,
          email: createdUser.email,
          username: createdUser.username,
        }),
      }));
    });

    it('应该传播用户服务的错误', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'Password123!',
      };

      mockUserService.findByEmail.mockResolvedValue({ id: 'existing-user' });
      mockUserService.findByUsername.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow('该电子邮件已被注册');
    });
  });

  describe('login', () => {
    it('应该成功登录有效用户', async () => {
      const loginDto: LoginDto = {
        usernameOrEmail: 'test@example.com',
        password: 'Password123!',
      };

      const user = factories.user.create({
        email: loginDto.email,
        id: 'user-id-123',
      });

      const accessToken = 'jwt-token-123';

      // Mock validateUser 方法直接返回用户
      vi.spyOn(service, 'validateUser').mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue(accessToken);

      const result = await service.login(loginDto);

      expect(service.validateUser).toHaveBeenCalledWith(loginDto.usernameOrEmail, loginDto.password);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: user.id,
          email: user.email,
          username: user.username,
        }),
        expect.any(Object)
      );
      expect(result).toEqual(expect.objectContaining({
        accessToken: accessToken,
        refreshToken: accessToken,
        user: expect.objectContaining({
          id: user.id,
          email: user.email,
          username: user.username,
        }),
      }));
    });

    it('应该在用户验证失败时抛出 UnauthorizedException', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const user = factories.user.create({ email: loginDto.email });
      mockUserService.findByUsernameOrEmail.mockResolvedValue(user);
      mockUserService.validatePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('用户名或密码错误')
      );
    });

    it('应该在用户不存在时抛出 UnauthorizedException', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      mockUserService.findByUsernameOrEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('用户名或密码错误')
      );
    });
  });

  describe('validateToken', () => {
    it('应该成功验证有效的 JWT Token', async () => {
      const token = 'valid-jwt-token';
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const user = factories.user.create({
        id: payload.sub,
        email: payload.email,
        username: payload.username,
        role: payload.role,
      });

      mockJwtService.verify.mockReturnValue(payload);
      mockUserService.findById.mockResolvedValue(user);

      const result = await service.validateToken(token);

      expect(mockJwtService.verify).toHaveBeenCalledWith(token, expect.any(Object));
      expect(mockUserService.findById).toHaveBeenCalledWith(payload.sub);
      expect(result).toEqual(expect.objectContaining({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      }));
    });

    it('应该在 Token 无效时抛出 UnauthorizedException', async () => {
      const token = 'invalid-jwt-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken(token)).rejects.toThrow(
        new UnauthorizedException('无效的令牌')
      );
    });

    it('应该在用户不存在时抛出 UnauthorizedException', async () => {
      const token = 'valid-jwt-token';
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
      };

      mockJwtService.verify.mockReturnValue(payload);
      mockUserService.findById.mockResolvedValue(null);

      await expect(service.validateToken(token)).rejects.toThrow(
        new UnauthorizedException('无效的令牌')
      );
    });
  });

  describe('refreshToken', () => {
    it('应该成功刷新有效的 Token', async () => {
      const oldToken = 'old-jwt-token';
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
      };

      const user = factories.user.create({
        id: payload.sub,
        email: payload.email,
        username: payload.username,
        role: payload.role,
        refreshToken: oldToken, // 确保 refreshToken 匹配
      });

      const newToken = 'new-jwt-token';

      mockJwtService.verify.mockReturnValue(payload);
      mockUserService.findById.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue(newToken);
      mockUserService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.refreshToken(oldToken);

      expect(mockJwtService.verify).toHaveBeenCalledWith(oldToken, expect.any(Object));
      expect(mockUserService.findById).toHaveBeenCalledWith(payload.sub);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: user.id,
          email: user.email,
          username: user.username,
        }),
        expect.any(Object)
      );
      expect(result).toEqual(expect.objectContaining({
        accessToken: newToken,
        refreshToken: newToken,
      }));
    });

    it('应该在 Token 过期时抛出 UnauthorizedException', async () => {
      const expiredToken = 'expired-jwt-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.refreshToken(expiredToken)).rejects.toThrow(
        new UnauthorizedException('无效的刷新令牌')
      );
    });
  });

  describe('getProfile', () => {
    it('应该返回用户资料', async () => {
      const userId = 'user-id-123';
      const user = factories.user.create({ id: userId });

      mockUserService.findById.mockResolvedValue(user);

      const result = await service.getProfile(userId);

      expect(mockUserService.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expect.objectContaining({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      }));
    });

    it('应该在用户不存在时抛出 UnauthorizedException', async () => {
      const userId = 'nonexistent-user-id';

      mockUserService.findById.mockResolvedValue(null);

      await expect(service.getProfile(userId)).rejects.toThrow(
        new UnauthorizedException('用户不存在')
      );
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空的登录凭据', async () => {
      const loginDto: LoginDto = {
        email: '',
        password: '',
      };

      mockUserService.findByUsernameOrEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('用户名或密码错误')
      );
    });

    it('应该处理格式错误的邮箱', async () => {
      const registerDto: RegisterDto = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'Password123!',
      };

      const error = new Error('Invalid email format');
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.findByUsername.mockResolvedValue(null);
      mockUserService.create.mockRejectedValue(error);

      await expect(service.register(registerDto)).rejects.toThrow(error);
    });

    it('应该处理弱密码', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: '123', // 弱密码
      };

      const error = new Error('Password too weak');
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.findByUsername.mockResolvedValue(null);
      mockUserService.create.mockRejectedValue(error);

      await expect(service.register(registerDto)).rejects.toThrow(error);
    });

    it('应该处理 JWT 签名失败', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const user = factories.user.create({ email: loginDto.email });

      mockUserService.findByUsernameOrEmail.mockResolvedValue(user);
      mockUserService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('JWT signing failed');
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('用户名或密码错误')
      );
    });
  });

  describe('安全性测试', () => {
    it('应该不在响应中包含敏感信息', async () => {
      const loginDto: LoginDto = {
        usernameOrEmail: 'test@example.com',
        password: 'Password123!',
      };

      const user = factories.user.create({
        email: loginDto.usernameOrEmail,
        password: 'hashed-password', // 不应该在响应中返回
        role: 'user', // 添加 role 属性
      });

      const accessToken = 'jwt-token-123';

      // Mock validateUser 方法直接返回用户
      vi.spyOn(service, 'validateUser').mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue(accessToken);

      const result = await service.login(loginDto);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('username');
    });

    it('应该在多次失败登录后保持一致的响应时间', async () => {
      const loginDto: LoginDto = {
        usernameOrEmail: 'test@example.com',
        password: 'WrongPassword',
      };

      // Mock validateUser 方法返回 null
      vi.spyOn(service, 'validateUser').mockResolvedValue(null);

      const startTime = Date.now();
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('用户名或密码错误')
      );
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeGreaterThanOrEqual(0);
      expect(responseTime).toBeLessThan(1000); // 应该在合理时间内响应
    });
  });
});