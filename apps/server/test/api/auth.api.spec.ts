import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../../src/app.module';

describe('Auth API (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(getDataSourceToken())
            .useValue({
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
            })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/auth/register', () => {
        const validUserData = {
            email: 'test@example.com',
            password: 'TestPassword123!',
            username: 'testuser',
        };

        it('should register a new user successfully', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(validUserData)
                .expect(201);

            expect(response.body).toHaveProperty('code', 0);
            expect(response.body).toHaveProperty('message', '用户注册成功');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user).toHaveProperty('email', validUserData.email);
            expect(response.body.data.user).toHaveProperty('username', validUserData.username);
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        it('should reject registration with invalid email', async () => {
            const invalidData = {
                ...validUserData,
                email: 'invalid-email',
            };

            const response = await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(invalidData)
                .expect(400);

            expect(response.body).toHaveProperty('statusCode', 400);
            expect(response.body).toHaveProperty('message');
        });

        it('should reject registration with weak password', async () => {
            const weakPasswordData = {
                ...validUserData,
                password: '123',
            };

            const response = await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(weakPasswordData)
                .expect(400);

            expect(response.body).toHaveProperty('statusCode', 400);
            expect(response.body).toHaveProperty('message');
        });

        it('should reject registration with missing required fields', async () => {
            const incompleteData = {
                email: 'test@example.com',
                // missing password and username
            };

            const response = await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(incompleteData)
                .expect(400);

            expect(response.body).toHaveProperty('statusCode', 400);
        });
    });

    describe('POST /api/auth/login', () => {
        const validLoginData = {
            email: 'test@example.com',
            password: 'TestPassword123!',
        };

        it('should login with valid credentials', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send(validLoginData)
                .expect(200);

            expect(response.body).toHaveProperty('code', 0);
            expect(response.body).toHaveProperty('message', '登录成功');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('access_token');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user).toHaveProperty('email', validLoginData.email);
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        it('should reject login with invalid email', async () => {
            const invalidData = {
                ...validLoginData,
                email: 'nonexistent@example.com',
            };

            const response = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send(invalidData)
                .expect(401);

            expect(response.body).toHaveProperty('statusCode', 401);
            expect(response.body).toHaveProperty('message');
        });

        it('should reject login with wrong password', async () => {
            const wrongPasswordData = {
                ...validLoginData,
                password: 'WrongPassword123!',
            };

            const response = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send(wrongPasswordData)
                .expect(401);

            expect(response.body).toHaveProperty('statusCode', 401);
            expect(response.body).toHaveProperty('message');
        });

        it('should reject login with missing credentials', async () => {
            const incompleteData = {
                email: 'test@example.com',
                // missing password
            };

            const response = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send(incompleteData)
                .expect(400);

            expect(response.body).toHaveProperty('statusCode', 400);
        });
    });

    describe('POST /api/auth/refresh', () => {
        it('should refresh token with valid refresh token', async () => {
            // First login to get tokens
            const loginResponse = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'TestPassword123!',
                })
                .expect(200);

            const { access_token, refresh_token } = loginResponse.body.data;

            // Then refresh the token
            const response = await request(app.getHttpServer())
                .post('/api/auth/refresh')
                .send({ refresh_token })
                .expect(200);

            expect(response.body).toHaveProperty('code', 0);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('access_token');
            expect(response.body.data.access_token).not.toBe(access_token);
        });

        it('should reject refresh with invalid token', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/refresh')
                .send({ refresh_token: 'invalid-token' })
                .expect(401);

            expect(response.body).toHaveProperty('statusCode', 401);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/logout')
                .expect(200);

            expect(response.body).toHaveProperty('code', 0);
            expect(response.body).toHaveProperty('message', '登出成功');
        });
    });

    describe('Protected Routes', () => {
        it('should protect routes without authentication', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/users/profile')
                .expect(401);

            expect(response.body).toHaveProperty('statusCode', 401);
            expect(response.body).toHaveProperty('message');
        });

        it('should allow access to protected routes with valid token', async () => {
            // First login to get token
            const loginResponse = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'TestPassword123!',
                })
                .expect(200);

            const { access_token } = loginResponse.body.data;

            // Then access protected route
            const response = await request(app.getHttpServer())
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${access_token}`)
                .expect(200);

            expect(response.body).toHaveProperty('code', 0);
        });
    });

    describe('API Response Format', () => {
        it('should follow standard API response format for success', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'TestPassword123!',
                })
                .expect(200);

            expect(response.body).toHaveProperty('code');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('path');
            expect(response.body).toHaveProperty('requestId');
        });

        it('should follow standard error response format', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'invalid@example.com',
                    password: 'wrongpassword',
                })
                .expect(401);

            expect(response.body).toHaveProperty('statusCode');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('error');
        });
    });
});
