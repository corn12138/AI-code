import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/user.entity';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let userRepository: any;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            // 如果需要，可以重写数据库依赖项，避免测试影响实际数据库
            .overrideProvider(getRepositoryToken(User))
            .useValue({
                findOne: jest.fn(),
                save: jest.fn(),
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());

        userRepository = moduleFixture.get(getRepositoryToken(User));

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/api/auth/login (POST)', () => {
        it('should return 401 on invalid credentials', () => {
            userRepository.findOne.mockResolvedValue(null);

            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ usernameOrEmail: 'nonexistent', password: 'wrongpass' })
                .expect(401);
        });

        it('should return access token and user data on valid login', () => {
            const mockUser = {
                id: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                password: '$2b$10$somehashedpassword', // bcrypt hash
                roles: ['user'],
            };

            userRepository.findOne.mockResolvedValue(mockUser);

            // 需要模拟 bcrypt.compare 返回 true
            jest.mock('bcrypt', () => ({
                compare: jest.fn().mockResolvedValue(true),
            }));

            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ usernameOrEmail: 'testuser', password: 'password123' })
                .expect(200)
                .expect((res) => {
                    expect(res.body.accessToken).toBeDefined();
                    expect(res.body.user).toBeDefined();
                    expect(res.body.user.password).toBeUndefined(); // 确保密码未返回
                    expect(res.headers['set-cookie']).toBeDefined(); // 检查 refreshToken cookie
                });
        });
    });

    // 更多端点测试...
});
