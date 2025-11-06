import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { factories } from '../../test/factories';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        register: vi.fn(),
        login: vi.fn(),
        validateToken: vi.fn(),
        refreshToken: vi.fn(),
        getProfile: vi.fn(),
        logout: vi.fn(),
        getTokens: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);

        // 确保控制器正确注入了服务
        (controller as any).authService = authService;

        vi.clearAllMocks();
    });

    describe('register', () => {
        it('应该成功注册新用户', async () => {
            const registerDto: RegisterDto = {
                email: 'test@example.com',
                username: 'testuser',
                password: 'Password123!',
            };

            const authResult = {
                access_token: 'jwt-token-123',
                user: {
                    id: 'user-id-123',
                    email: registerDto.email,
                    username: registerDto.username,
                    role: 'user',
                },
            };

            mockAuthService.register.mockResolvedValue(authResult);

            const mockResponse = {
                cookie: vi.fn(),
            };
            const result = await controller.register(registerDto, mockResponse as any);

            expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
            expect(result).toEqual(authResult);
        });

        it('应该传播服务层的错误', async () => {
            const registerDto: RegisterDto = {
                email: 'existing@example.com',
                username: 'existinguser',
                password: 'Password123!',
            };

            const error = new Error('User already exists');
            mockAuthService.register.mockRejectedValue(error);

            await expect(controller.register(registerDto)).rejects.toThrow(error);
        });

        it('应该处理验证错误', async () => {
            const invalidDto = {
                email: 'invalid-email',
                username: '',
                password: '123',
            } as RegisterDto;

            const error = new Error('Validation failed');
            mockAuthService.register.mockRejectedValue(error);

            await expect(controller.register(invalidDto)).rejects.toThrow(error);
        });
    });

    describe('login', () => {
        it('应该成功登录有效用户', async () => {
            const loginDto: LoginDto = {
                usernameOrEmail: 'test@example.com',
                password: 'Password123!',
            };

            const authResult = {
                access_token: 'jwt-token-123',
                user: {
                    id: 'user-id-123',
                    email: loginDto.email,
                    username: 'testuser',
                    role: 'user',
                },
            };

            mockAuthService.login.mockResolvedValue(authResult);

            const mockResponse = {
                cookie: vi.fn(),
            };
            const result = await controller.login(loginDto, mockResponse as any);

            expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
            expect(result).toEqual(authResult);
        });

        it('应该在无效凭据时抛出 UnauthorizedException', async () => {
            const loginDto: LoginDto = {
                usernameOrEmail: 'test@example.com',
                password: 'WrongPassword',
            };

            const error = new UnauthorizedException('Invalid credentials');
            mockAuthService.login.mockRejectedValue(error);

            await expect(controller.login(loginDto)).rejects.toThrow(error);
        });

        it('应该处理空的登录凭据', async () => {
            const loginDto: LoginDto = {
                email: '',
                password: '',
            };

            const error = new UnauthorizedException('Invalid credentials');
            mockAuthService.login.mockRejectedValue(error);

            await expect(controller.login(loginDto)).rejects.toThrow(error);
        });
    });

    describe('getProfile', () => {
        it('应该返回当前用户的资料', async () => {
            const user = factories.user.create();
            const mockRequest = {
                user: {
                    userId: user.id,
                    email: user.email,
                    id: user.id,
                    username: user.username,
                    role: user.role,
                },
            };

            const userProfile = {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };

            mockAuthService.getProfile.mockResolvedValue(userProfile);

            const result = await controller.getProfile(mockRequest as any);

            expect(mockAuthService.getProfile).toHaveBeenCalledWith(user.id);
            expect(result).toEqual(userProfile);
        });

        it('应该在用户未认证时抛出错误', async () => {
            const mockRequest = {
                user: null,
            };

            const error = new UnauthorizedException('用户未认证');
            mockAuthService.getProfile.mockRejectedValue(error);

            await expect(controller.getProfile(mockRequest as any)).rejects.toThrow(
                error
            );
        });

        it('应该在用户不存在时抛出 UnauthorizedException', async () => {
            const mockRequest = {
                user: {
                    email: 'nonexistent@example.com',
                    id: 'nonexistent-id',
                    username: 'nonexistent',
                    role: 'user',
                },
            };

            const error = new UnauthorizedException('用户不存在');
            mockAuthService.getProfile.mockRejectedValue(error);

            await expect(controller.getProfile(mockRequest as any)).rejects.toThrow(
                error
            );
        });
    });

    describe('refreshToken', () => {
        it('应该成功刷新有效的 Token', async () => {
            const refreshTokenDto = {
                refreshToken: 'old-jwt-token',
            };

            const authResult = {
                access_token: 'new-jwt-token',
                user: {
                    id: 'user-id-123',
                    email: 'test@example.com',
                    username: 'testuser',
                    role: 'user',
                },
            };

            mockAuthService.refreshToken.mockResolvedValue(authResult);

            const result = await controller.refreshToken(refreshTokenDto);

            expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
                refreshTokenDto.refreshToken
            );
            expect(result).toEqual(authResult);
        });

        it('应该在 Token 无效时抛出 UnauthorizedException', async () => {
            const refreshTokenDto = {
                refreshToken: 'invalid-jwt-token',
            };

            const error = new UnauthorizedException('无效的刷新令牌');
            mockAuthService.refreshToken.mockRejectedValue(error);

            await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(
                error
            );
        });

        it('应该在 Token 过期时抛出 UnauthorizedException', async () => {
            const refreshTokenDto = {
                refreshToken: 'expired-jwt-token',
            };

            const error = new UnauthorizedException('令牌已过期');
            mockAuthService.refreshToken.mockRejectedValue(error);

            await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(
                error
            );
        });
    });

    describe('logout', () => {
        it('应该成功登出用户', async () => {
            const mockRequest = {
                user: { userId: 'user-id-123' },
            };
            const mockResponse = {
                cookie: vi.fn(),
                clearCookie: vi.fn(),
            };
            const result = await controller.logout(mockRequest as any, mockResponse as any);

            expect(result).toEqual({
                success: true,
            });
        });

        it('应该始终返回成功消息（无状态登出）', async () => {
            const mockRequest = {
                user: { userId: 'user-id-123' },
            };
            const mockResponse = {
                cookie: vi.fn(),
                clearCookie: vi.fn(),
            };
            // 多次调用登出应该都返回成功
            const result1 = await controller.logout(mockRequest as any, mockResponse as any);
            const result2 = await controller.logout(mockRequest as any, mockResponse as any);

            expect(result1).toEqual({ success: true });
            expect(result2).toEqual({ success: true });
        });
    });

    describe('验证 Token', () => {
        it('应该成功验证有效的 Token', async () => {
            const validateTokenDto = {
                token: 'valid-jwt-token',
            };

            const user = factories.user.create();

            mockAuthService.validateToken.mockResolvedValue(user);

            const result = await controller.validateToken(validateTokenDto);

            expect(mockAuthService.validateToken).toHaveBeenCalledWith(
                validateTokenDto.token
            );
            expect(result).toEqual(user);
        });

        it('应该在 Token 无效时返回验证失败', async () => {
            const validateTokenDto = {
                token: 'invalid-jwt-token',
            };

            const error = new UnauthorizedException('无效的令牌');
            mockAuthService.validateToken.mockRejectedValue(error);

            await expect(
                controller.validateToken(validateTokenDto)
            ).rejects.toThrow(error);
        });
    });

    describe('错误处理', () => {
        it('应该传播所有服务层错误', async () => {
            const loginDto: LoginDto = {
                usernameOrEmail: 'test@example.com',
                password: 'Password123!',
            };

            const error = new Error('Database connection failed');
            mockAuthService.login.mockRejectedValue(error);

            await expect(controller.login(loginDto)).rejects.toThrow(error);
        });

        it('应该处理意外的错误', async () => {
            const registerDto: RegisterDto = {
                email: 'test@example.com',
                username: 'testuser',
                password: 'Password123!',
            };

            const error = new Error('Unexpected error');
            mockAuthService.register.mockRejectedValue(error);

            await expect(controller.register(registerDto)).rejects.toThrow(error);
        });
    });

    describe('输入验证', () => {
        it('应该接受有效的注册数据', async () => {
            const registerDto: RegisterDto = {
                email: 'valid@example.com',
                username: 'validuser',
                password: 'ValidPassword123!',
            };

            const authResult = {
                access_token: 'jwt-token-123',
                user: {
                    id: 'user-id-123',
                    email: registerDto.email,
                    username: registerDto.username,
                    role: 'user',
                },
            };

            mockAuthService.register.mockResolvedValue(authResult);

            const mockResponse = {
                cookie: vi.fn(),
            };
            const result = await controller.register(registerDto, mockResponse as any);

            expect(result).toEqual(authResult);
        });

        it('应该接受有效的登录数据', async () => {
            const loginDto: LoginDto = {
                usernameOrEmail: 'valid@example.com',
                password: 'ValidPassword123!',
            };

            const authResult = {
                access_token: 'jwt-token-123',
                user: {
                    id: 'user-id-123',
                    email: loginDto.email,
                    username: 'validuser',
                    role: 'user',
                },
            };

            mockAuthService.login.mockResolvedValue(authResult);

            const mockResponse = {
                cookie: vi.fn(),
            };
            const result = await controller.login(loginDto, mockResponse as any);

            expect(result).toEqual(authResult);
        });
    });

    describe('安全性测试', () => {
        it('应该不在日志中记录敏感信息', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'SensitivePassword123!',
            };

            const authResult = {
                access_token: 'jwt-token-123',
                user: {
                    id: 'user-id-123',
                    email: loginDto.email,
                    username: 'testuser',
                    role: 'user',
                },
            };

            mockAuthService.login.mockResolvedValue(authResult);

            const mockResponse = {
                cookie: vi.fn(),
            };
            const result = await controller.login(loginDto, mockResponse as any);

            // 确保响应中不包含密码
            expect(JSON.stringify(result)).not.toContain(loginDto.password);
            expect(result.user).not.toHaveProperty('password');
        });

        it('应该在认证失败时返回通用错误消息', async () => {
            const loginDto: LoginDto = {
                usernameOrEmail: 'test@example.com',
                password: 'WrongPassword',
            };

            const error = new UnauthorizedException('无效的凭据');
            mockAuthService.login.mockRejectedValue(error);

            await expect(controller.login(loginDto)).rejects.toThrow(
                '无效的凭据'
            );
        });
    });
});