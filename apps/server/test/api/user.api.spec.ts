import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../../src/app.module';

describe('User API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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

    // Get authentication token for protected routes
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!',
      });

    authToken = loginResponse.body.data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('message', '获取用户信息成功');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email');
      expect(response.body.data.user).toHaveProperty('username');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('statusCode', 401);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('statusCode', 401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/users/profile', () => {
    const validUpdateData = {
      username: 'updateduser',
      firstName: 'Updated',
      lastName: 'User',
      bio: 'This is an updated bio',
    };

    it('should update user profile with valid data', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validUpdateData)
        .expect(200);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('message', '用户信息更新成功');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('username', validUpdateData.username);
      expect(response.body.data.user).toHaveProperty('firstName', validUpdateData.firstName);
      expect(response.body.data.user).toHaveProperty('lastName', validUpdateData.lastName);
      expect(response.body.data.user).toHaveProperty('bio', validUpdateData.bio);
    });

    it('should reject update with invalid data', async () => {
      const invalidData = {
        email: 'invalid-email', // Invalid email format
      };

      const response = await request(app.getHttpServer())
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject update without authentication', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/users/profile')
        .send(validUpdateData)
        .expect(401);

      expect(response.body).toHaveProperty('statusCode', 401);
    });
  });

  describe('PUT /api/users/password', () => {
    const validPasswordData = {
      currentPassword: 'TestPassword123!',
      newPassword: 'NewPassword123!',
    };

    it('should change password with valid current password', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPasswordData)
        .expect(200);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('message', '密码修改成功');
    });

    it('should reject password change with wrong current password', async () => {
      const wrongPasswordData = {
        ...validPasswordData,
        currentPassword: 'WrongPassword123!',
      };

      const response = await request(app.getHttpServer())
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(wrongPasswordData)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject password change with weak new password', async () => {
      const weakPasswordData = {
        ...validPasswordData,
        newPassword: '123',
      };

      const response = await request(app.getHttpServer())
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(weakPasswordData)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject password change without authentication', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/users/password')
        .send(validPasswordData)
        .expect(401);

      expect(response.body).toHaveProperty('statusCode', 401);
    });
  });

  describe('DELETE /api/users/account', () => {
    it('should delete user account with confirmation', async () => {
      const deleteData = {
        password: 'TestPassword123!',
        confirmation: 'DELETE',
      };

      const response = await request(app.getHttpServer())
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`)
        .send(deleteData)
        .expect(200);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('message', '账户删除成功');
    });

    it('should reject account deletion with wrong password', async () => {
      const wrongPasswordData = {
        password: 'WrongPassword123!',
        confirmation: 'DELETE',
      };

      const response = await request(app.getHttpServer())
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`)
        .send(wrongPasswordData)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject account deletion without confirmation', async () => {
      const noConfirmationData = {
        password: 'TestPassword123!',
        confirmation: 'CANCEL',
      };

      const response = await request(app.getHttpServer())
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noConfirmationData)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject account deletion without authentication', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/users/account')
        .send({
          password: 'TestPassword123!',
          confirmation: 'DELETE',
        })
        .expect(401);

      expect(response.body).toHaveProperty('statusCode', 401);
    });
  });

  describe('GET /api/users', () => {
    it('should get users list with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should get users list with search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users?search=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('users');
    });

    it('should reject users list without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .expect(401);

      expect(response.body).toHaveProperty('statusCode', 401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get specific user by ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('email');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject user details without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/1')
        .expect(401);

      expect(response.body).toHaveProperty('statusCode', 401);
    });
  });

  describe('API Response Format', () => {
    it('should follow standard API response format for success', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
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
        .get('/api/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
    });
  });
});
