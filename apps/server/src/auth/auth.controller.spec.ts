import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { vi, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;
    let usersService: UsersService;

    beforeEach(async () => {
        // 创建模拟服务
        const mockAuthService = {
            login: vi.fn().mockResolvedValue({
                accessToken: 'test-access-token',
                refreshToken: 'test-refresh-token',
                user: { id: '1', username: 'testuser' }
            }),
            logout: vi.fn().mockResolvedValue({ success: true }),
            refreshTokens: vi.fn().mockResolvedValue({
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token'
            })
        };

        const mockUsersService = {
            findOne: vi.fn().mockResolvedValue({
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                roles: ['user']
            })
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: UsersService, useValue: mockUsersService },
                { provide: ConfigService, useValue: { get: vi.fn() } }
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
    });

    // 添加一个基本的测试，确保控制器被定义
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should return access token and user info', async () => {
            // 模拟请求和响应对象
            const loginDto = { usernameOrEmail: 'testuser', password: 'password123' };
            const res = {
                cookie: vi.fn()
            } as unknown as Response;

            const result = await controller.login(loginDto, res);

            // 验证结果
            expect(result).toHaveProperty('accessToken', 'test-access-token');
            expect(result).toHaveProperty('user');
            expect(result).not.toHaveProperty('refreshToken'); // 不应该包含刷新令牌

            // 验证Cookie设置
            expect(res.cookie).toHaveBeenCalledWith(
                'refreshToken',
                'test-refresh-token',
                expect.objectContaining({
                    httpOnly: true
                })
            );
        });
    });

    describe('logout', () => {
        it('should clear refresh token cookie', async () => {
            // 模拟请求和响应对象
            const req = { user: { userId: '1' } };
            const res = { clearCookie: vi.fn() } as unknown as Response;

            const result = await controller.logout(req as any, res);

            // 验证结果
            expect(result).toEqual({ success: true });
            expect(authService.logout).toHaveBeenCalledWith('1');
            expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
        });
    });
});
