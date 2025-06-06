import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';

// 正确地模拟bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;
    let configService: ConfigService;

    beforeEach(async () => {
        // 创建所有依赖的Mock
        const mockUsersService = {
            findByUsernameOrEmail: jest.fn(),
            findOne: jest.fn(),
            updateRefreshToken: jest.fn(),
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            create: jest.fn()
        };

        const mockJwtService = {
            signAsync: jest.fn().mockResolvedValue('test-token'),
        };

        const mockConfigService = {
            get: jest.fn().mockImplementation((key) => {
                if (key === 'JWT_SECRET') return 'test-secret';
                if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
                return null;
            }),
        };

        // 创建测试模块
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        // 获取服务实例
        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
        configService = module.get<ConfigService>(ConfigService);

        // 为 getTokens 方法提供一个简单的实现
        jest.spyOn(service as any, 'getTokens').mockImplementation(() => {
            return {
                accessToken: 'access-token',
                refreshToken: 'refresh-token'
            };
        });
    });

    // 简单测试确保服务存在
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // 添加validateUser方法测试
    describe('validateUser', () => {
        it('should return null when user is not found', async () => {
            (usersService.findByUsernameOrEmail as jest.Mock).mockResolvedValue(null);

            const result = await service.validateUser('nonexistent', 'password');

            expect(result).toBeNull();
            expect(usersService.findByUsernameOrEmail).toHaveBeenCalledWith('nonexistent');
        });

        it('should return user object when credentials are valid', async () => {
            const mockUser = {
                id: 'user-id',
                username: 'testuser',
                password: 'hashed_password',
                roles: ['user']
            };

            (usersService.findByUsernameOrEmail as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser('testuser', 'correct_password');

            expect(result).toEqual({
                id: 'user-id',
                username: 'testuser',
                roles: ['user']
            });
        });
    });

    // 添加登录方法测试
    describe('login', () => {
        it('should return access token and user data', async () => {
            const mockUser = {
                id: 'user-id',
                username: 'testuser',
                password: 'hashed_password'
            };

            (usersService.findByUsernameOrEmail as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.login({
                usernameOrEmail: 'testuser',
                password: 'password'
            });

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('user');
        });
    });
});
