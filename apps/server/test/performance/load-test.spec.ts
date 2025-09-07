import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as autocannon from 'autocannon';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Load Testing', () => {
  let app: INestApplication;
  let baseUrl: string;

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

    const server = app.getHttpServer();
    const address = server.address();
    if (typeof address === 'string') {
      baseUrl = `http://${address}`;
    } else {
      baseUrl = `http://localhost:${address?.port || 3001}`;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check Load Test', () => {
    it('should handle 100 concurrent requests to health endpoint', async () => {
      const result = await autocannon({
        url: `${baseUrl}/api/health`,
        connections: 10,
        duration: 10,
        pipelining: 10,
      });

      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
      expect(result.non2xx).toBe(0);
      expect(result.requests.total).toBeGreaterThan(0);
      expect(result.latency.p99).toBeLessThan(1000); // 99th percentile < 1s
      expect(result.throughput.total).toBeGreaterThan(0);
    }, 30000);

    it('should handle 50 concurrent requests with 5 second duration', async () => {
      const result = await autocannon({
        url: `${baseUrl}/api/health`,
        connections: 50,
        duration: 5,
        pipelining: 1,
      });

      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
      expect(result.non2xx).toBe(0);
      expect(result.requests.total).toBeGreaterThan(0);
      expect(result.latency.p95).toBeLessThan(500); // 95th percentile < 500ms
    }, 15000);
  });

  describe('API Response Time Test', () => {
    it('should respond to health check within 100ms on average', async () => {
      const result = await autocannon({
        url: `${baseUrl}/api/health`,
        connections: 1,
        duration: 5,
        pipelining: 1,
      });

      expect(result.errors).toBe(0);
      expect(result.latency.average).toBeLessThan(100); // Average < 100ms
      expect(result.latency.p50).toBeLessThan(100); // Median < 100ms
    }, 10000);

    it('should handle burst requests efficiently', async () => {
      const result = await autocannon({
        url: `${baseUrl}/api/health`,
        connections: 20,
        duration: 3,
        pipelining: 5,
        setupClient: (client) => {
          client.setHeaders({
            'User-Agent': 'LoadTest/1.0',
          });
        },
      });

      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
      expect(result.non2xx).toBe(0);
      expect(result.requests.total).toBeGreaterThan(100);
    }, 10000);
  });

  describe('Memory Usage Test', () => {
    it('should maintain stable memory usage under load', async () => {
      const initialMemory = process.memoryUsage();
      
      const result = await autocannon({
        url: `${baseUrl}/api/health`,
        connections: 10,
        duration: 10,
        pipelining: 10,
      });

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      expect(result.errors).toBe(0);
      expect(memoryIncreaseMB).toBeLessThan(50); // Memory increase < 50MB
    }, 30000);
  });

  describe('Error Rate Test', () => {
    it('should maintain zero error rate under normal load', async () => {
      const result = await autocannon({
        url: `${baseUrl}/api/health`,
        connections: 5,
        duration: 10,
        pipelining: 5,
      });

      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
      expect(result.non2xx).toBe(0);
      expect(result.requests.total).toBeGreaterThan(0);
    }, 20000);

    it('should handle invalid endpoints gracefully', async () => {
      const result = await autocannon({
        url: `${baseUrl}/api/invalid-endpoint`,
        connections: 5,
        duration: 5,
        pipelining: 1,
      });

      // Should return 404 for invalid endpoints
      expect(result.non2xx).toBeGreaterThan(0);
      expect(result.errors).toBe(0);
    }, 10000);
  });

  describe('Throughput Test', () => {
    it('should achieve minimum throughput of 100 requests per second', async () => {
      const result = await autocannon({
        url: `${baseUrl}/api/health`,
        connections: 10,
        duration: 10,
        pipelining: 10,
      });

      const requestsPerSecond = result.requests.average;
      expect(requestsPerSecond).toBeGreaterThan(100);
      expect(result.errors).toBe(0);
    }, 30000);

    it('should scale linearly with connection count', async () => {
      const test1 = await autocannon({
        url: `${baseUrl}/api/health`,
        connections: 5,
        duration: 5,
        pipelining: 1,
      });

      const test2 = await autocannon({
        url: `${baseUrl}/api/health`,
        connections: 10,
        duration: 5,
        pipelining: 1,
      });

      // Throughput should increase with more connections
      expect(test2.requests.average).toBeGreaterThan(test1.requests.average * 0.8);
    }, 20000);
  });

  describe('Latency Distribution Test', () => {
    it('should maintain consistent latency distribution', async () => {
      const result = await autocannon({
        url: `${baseUrl}/api/health`,
        connections: 10,
        duration: 10,
        pipelining: 5,
      });

      expect(result.latency.p50).toBeLessThan(result.latency.p99);
      expect(result.latency.p99).toBeLessThan(result.latency.p99_9);
      expect(result.latency.average).toBeLessThan(result.latency.p95);
    }, 30000);
  });

  describe('Concurrent User Simulation', () => {
    it('should handle realistic user load pattern', async () => {
      const result = await autocannon({
        url: `${baseUrl}/api/health`,
        connections: 25,
        duration: 15,
        pipelining: 2,
        setupClient: (client) => {
          client.setHeaders({
            'User-Agent': 'Mozilla/5.0 (compatible; LoadTest/1.0)',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
          });
        },
      });

      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
      expect(result.non2xx).toBe(0);
      expect(result.requests.total).toBeGreaterThan(500);
      expect(result.latency.p99).toBeLessThan(2000); // 99th percentile < 2s
    }, 40000);
  });
});
