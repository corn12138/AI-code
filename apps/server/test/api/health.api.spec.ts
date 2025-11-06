import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../../src/app.module';

describe('Health API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

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

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('message', '操作成功');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'ok');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data).toHaveProperty('memory');
    });

    it('should return correct database status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      const { database } = response.body.data;
      expect(database).toHaveProperty('status', 'connected');
      expect(database).toHaveProperty('version');
      expect(database).toHaveProperty('connections');
      expect(database).toHaveProperty('driver', 'postgres');
    });

    it('should return memory information', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      const { memory } = response.body.data;
      expect(memory).toHaveProperty('rss');
      expect(memory).toHaveProperty('heapTotal');
      expect(memory).toHaveProperty('heapUsed');
      expect(typeof memory.rss).toBe('string');
      expect(typeof memory.heapTotal).toBe('string');
      expect(typeof memory.heapUsed).toBe('string');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      const { timestamp } = response.body.data;
      expect(new Date(timestamp).getTime()).not.toBeNaN();
      expect(new Date(timestamp)).toBeInstanceOf(Date);
    });

    it('should return valid uptime', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      const { uptime } = response.body.data;
      expect(typeof uptime).toBe('string');
      expect(uptime).toMatch(/^\d+m \d+s$/);
    });
  });

  describe('GET /api/health/db', () => {
    it('should return database health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/db')
        .expect(200);

      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('timestamp');
      expect(['healthy', 'unhealthy']).toContain(response.body.database);
    });
  });

  describe('API Response Format', () => {
    it('should follow standard API response format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
      expect(response.body).toHaveProperty('requestId');
    });

    it('should return correct HTTP headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/invalid')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
    });

    it('should handle method not allowed', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/health')
        .expect(405);

      expect(response.body).toHaveProperty('statusCode', 405);
    });
  });
});
