import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  Counter,
  Gauge,
  Histogram
} from 'prom-client';
import { DataSource } from 'typeorm';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  // HTTP请求指标
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;

  // 数据库指标
  private readonly databaseConnections: Gauge<string>;
  private readonly databaseQueryDuration: Histogram<string>;

  // 应用指标
  private readonly activeUsers: Gauge<string>;
  private readonly articlesTotal: Gauge<string>;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    // 注意：默认指标收集已在PrometheusModule中启用，这里不需要重复启用

    // 初始化自定义指标
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    this.databaseConnections = new Gauge({
      name: 'database_connections_active',
      help: 'Number of active database connections',
    });

    this.databaseQueryDuration = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      buckets: [0.001, 0.01, 0.1, 0.5, 1],
    });

    this.activeUsers = new Gauge({
      name: 'active_users_total',
      help: 'Number of active users in the system',
    });

    this.articlesTotal = new Gauge({
      name: 'articles_total',
      help: 'Total number of articles in the system',
    });

    // 启动定期更新应用指标
    this.startMetricsUpdater();
  }

  // 记录HTTP请求
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString()
    });

    this.httpRequestDuration.observe({ method, route }, duration);
  }

  // 记录数据库查询
  recordDatabaseQuery(duration: number) {
    this.databaseQueryDuration.observe(duration);
  }

  // 更新数据库连接数
  async updateDatabaseConnections() {
    try {
      const result = await this.dataSource.query(
        'SELECT count(*) as connections FROM pg_stat_activity'
      );
      const connections = parseInt(result[0].connections, 10);
      this.databaseConnections.set(connections);
    } catch (error: any) {
      this.logger.error(`Failed to update database connections metric: ${error.message}`);
    }
  }

  // 获取应用指标
  async getApplicationMetrics() {
    try {
      // 获取用户总数
      const usersResult = await this.dataSource.query('SELECT count(*) as total FROM users');
      const usersCount = parseInt(usersResult[0].total, 10);
      this.activeUsers.set(usersCount);

      // 获取文章总数
      const articlesResult = await this.dataSource.query('SELECT count(*) as total FROM articles');
      const articlesCount = parseInt(articlesResult[0].total, 10);
      this.articlesTotal.set(articlesCount);

      return {
        users_total: usersCount,
        articles_total: articlesCount,
        database_connections: await this.getDatabaseConnectionsCount(),
      };
    } catch (error: any) {
      this.logger.error(`Failed to get application metrics: ${error.message}`);
      return {
        users_total: 0,
        articles_total: 0,
        database_connections: 0,
      };
    }
  }

  // 获取数据库连接数
  private async getDatabaseConnectionsCount(): Promise<number> {
    try {
      const result = await this.dataSource.query(
        'SELECT count(*) as connections FROM pg_stat_activity'
      );
      return parseInt(result[0].connections, 10);
    } catch (error) {
      return 0;
    }
  }

  // 启动指标更新器
  private startMetricsUpdater() {
    // 每30秒更新一次应用指标
    setInterval(async () => {
      await this.getApplicationMetrics();
      await this.updateDatabaseConnections();
    }, 30000);
  }
} 