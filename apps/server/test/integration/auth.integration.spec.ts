import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { vi, describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { AuthService } from '../../src/auth/auth.service';
import { UserService } from '../../src/user/user.service';
import { JwtService } from '@nestjs/jwt';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
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

    authService = moduleFixture.get<AuthService>(AuthService);
    userService = moduleFixture.get<UserService>(UserService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow Integration', () => {
    const testUser = {
      email: 'integration-test@example.com',
      password: 'IntegrationTest123!',
      username: 'integrationtest',
    };

    let authToken: string;
    let refreshToken: string;

    it('should complete full authentication flow', async () => {
      // Step 1: Register user
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(registerResponse.body.code).toBe(0);
      expect(registerResponse.body.data.user.email).toBe(testUser.email);

      // Step 2: Login user
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(loginResponse.body.code).toBe(0);
      expect(loginResponse.body.data.access_token).toBeDefined();
      expect(loginResponse.body.data.refresh_token).toBeDefined();

      authToken = loginResponse.body.data.access_token;
      refreshToken = loginResponse.body.data.refresh_token;

      // Step 3: Access protected route
      const profileResponse = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(profileResponse.body.code).toBe(0);
      expect(profileResponse.body.data.user.email).toBe(testUser.email);

      // Step 4: Refresh token
      const refreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      expect(refreshResponse.body.code).toBe(0);
      expect(refreshResponse.body.data.access_token).toBeDefined();
      expect(refreshResponse.body.data.access_token).not.toBe(authToken);

      // Step 5: Logout
      const logoutResponse = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(logoutResponse.body.code).toBe(0);
    });

    it('should handle token expiration correctly', async () => {
      // Create an expired token
      const expiredToken = jwtService.sign(
        { sub: '1', email: testUser.email },
        { expiresIn: '0s' }
      );

      // Try to access protected route with expired token
      const response = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toContain('token');
    });

    it('should handle invalid refresh tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refresh_token: 'invalid-token' })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('User Service Integration', () => {
    it('should integrate with user service for profile operations', async () => {
      // Login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'integration-test@example.com',
          password: 'IntegrationTest123!',
        })
        .expect(200);

      const token = loginResponse.body.data.access_token;

      // Update profile
      const updateData = {
        username: 'updatedintegration',
        firstName: 'Integration',
        lastName: 'Test',
        bio: 'Integration test user',
      };

      const updateResponse = await request(app.getHttpServer())
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.code).toBe(0);
      expect(updateResponse.body.data.user.username).toBe(updateData.username);

      // Verify profile update
      const profileResponse = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.data.user.username).toBe(updateData.username);
      expect(profileResponse.body.data.user.firstName).toBe(updateData.firstName);
    });
  });

  describe('Password Management Integration', () => {
    it('should handle password change flow', async () => {
      // Login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'integration-test@example.com',
          password: 'IntegrationTest123!',
        })
        .expect(200);

      const token = loginResponse.body.data.access_token;

      // Change password
      const passwordData = {
        currentPassword: 'IntegrationTest123!',
        newPassword: 'NewIntegrationTest123!',
      };

      const changeResponse = await request(app.getHttpServer())
        .put('/api/users/password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData)
        .expect(200);

      expect(changeResponse.body.code).toBe(0);

      // Try to login with old password (should fail)
      const oldPasswordLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'integration-test@example.com',
          password: 'IntegrationTest123!',
        })
        .expect(401);

      expect(oldPasswordLogin.body.statusCode).toBe(401);

      // Login with new password (should succeed)
      const newPasswordLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'integration-test@example.com',
          password: 'NewIntegrationTest123!',
        })
        .expect(200);

      expect(newPasswordLogin.body.code).toBe(0);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle duplicate email registration', async () => {
      const duplicateUser = {
        email: 'integration-test@example.com', // Already exists
        password: 'AnotherPassword123!',
        username: 'duplicateuser',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toContain('email');
    });

    it('should handle invalid login credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should handle malformed requests', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123', // Too short
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('Security Integration', () => {
    it('should not expose sensitive information in responses', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'integration-test@example.com',
          password: 'NewIntegrationTest123!',
        })
        .expect(200);

      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
      expect(response.body.data.user).not.toHaveProperty('salt');
    });

    it('should validate JWT token structure', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'integration-test@example.com',
          password: 'NewIntegrationTest123!',
        })
        .expect(200);

      const token = loginResponse.body.data.access_token;
      
      // Verify token structure (should be a valid JWT)
      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3);
      
      // Verify token payload
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      expect(payload).toHaveProperty('sub');
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('iat');
      expect(payload).toHaveProperty('exp');
    });
  });
});
