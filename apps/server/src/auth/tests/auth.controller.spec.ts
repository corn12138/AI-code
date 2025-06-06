import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users/users.service';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;
    let usersService: UsersService;

    beforeEach(async () => {
        // 创建Mock服务
        const mockAuthService = {
            login: jest.fn(),
            logout: jest.fn(),
        };

        const mockUsersService = {
            findOne: jest.fn(),
        };

        // 创建测试模块
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: UsersService, useValue: mockUsersService },
            ],
        }).compile();

        // 获取控制器和服务实例
        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
    });

    // 简单测试确保控制器存在
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // 添加至少一个测试用例
    describe('login', () => {
        it('should call authService.login with correct params', async () => {
            // 模拟login方法返回值
            const loginResult = {
                accessToken: 'test-token',
                refreshToken: 'refresh-token',
                user: { id: 'user-id' }
            };
            (authService.login as jest.Mock).mockResolvedValue(loginResult);

            // 模拟Response对象
            const mockResponse = {
                cookie: jest.fn(),
            };

            // 调用控制器方法
            const loginDto = { usernameOrEmail: 'test', password: 'password' };
            await controller.login(loginDto, mockResponse as any);

            // 验证Auth服务的login方法被正确调用
            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(mockResponse.cookie).toHaveBeenCalled();
        });
    });

    // 可以根据需要添加更多测试...
});
