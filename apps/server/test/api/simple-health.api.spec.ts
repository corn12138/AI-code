import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HealthController } from '../../src/health/health.controller';
import { HealthService } from '../../src/database/health.service';
import { DataSource } from 'typeorm';
import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Simple Health API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            getDatabaseStatus: vi.fn().mockResolvedValue({
              status: 'connected',
              version: 'PostgreSQL 16.8',
              connections: 6,
              driver: 'postgres',
            }),
            getSystemStatus: vi.fn().mockReturnValue({
              uptime: '1m 30s',
              memory: {
                rss: '50.2 MB',
                heapTotal: '25.1 MB',
                heapUsed: '15.3 MB',
              },
            }),
            getFullHealthStatus: vi.fn().mockResolvedValue({
              status: 'ok',
              timestamp: new Date().toISOString(),
              uptime: '1m 30s',
              database: {
                status: 'connected',
                version: 'PostgreSQL 16.8',
                connections: 6,
                driver: 'postgres',
              },
              memory: {
                rss: '50.2 MB',
                heapTotal: '25.1 MB',
                heapUsed: '15.3 MB',
              },
            }),
          },
        },
        {
          provide: DataSource,
          useValue: {
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
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('memory');
    });

    it('should return correct database status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const { database } = response.body;
      expect(database).toHaveProperty('status', 'connected');
      expect(database).toHaveProperty('version', 'PostgreSQL 16.8');
      expect(database).toHaveProperty('connections', 6);
      expect(database).toHaveProperty('driver', 'postgres');
    });

    it('should return memory information', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const { memory } = response.body;
      expect(memory).toHaveProperty('rss');
      expect(memory).toHaveProperty('heapTotal');
      expect(memory).toHaveProperty('heapUsed');
      expect(typeof memory.rss).toBe('string');
      expect(typeof memory.heapTotal).toBe('string');
      expect(typeof memory.heapUsed).toBe('string');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const { timestamp } = response.body;
      expect(new Date(timestamp).getTime()).not.toBeNaN();
      expect(new Date(timestamp)).toBeInstanceOf(Date);
    });

    it('should return valid uptime', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const { uptime } = response.body;
      expect(typeof uptime).toBe('string');
      expect(uptime).toMatch(/^\d+m \d+s$/);
    });
  });

  describe('GET /health/db', () => {
    it('should return database health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/db')
        .expect(200);

      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('timestamp');
      expect(['healthy', 'unhealthy']).toContain(response.body.database);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/invalid')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
    });

    it('should handle method not allowed', async () => {
      const response = await request(app.getHttpServer())
        .post('/health')
        .expect(405);

      expect(response.body).toHaveProperty('statusCode', 405);
    });
  });

  describe('HTTP Headers', () => {
    it('should return correct content type', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});
