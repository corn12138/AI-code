import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import * as os from 'os';
import { DataSource } from 'typeorm';

interface HealthStatus {
    status: 'ok' | 'error';
    timestamp: string;
    uptime: string;
    database: DatabaseStatus;
    system: SystemStatus;
}

interface DatabaseStatus {
    status: 'connected' | 'disconnected' | 'error';
    version?: string;
    connections?: number;
    driver?: string;
    latency?: number;
    message?: string;
}

interface SystemStatus {
    memory: {
        total: string;
        free: string;
        used: string;
        usedPercent: number;
    };
    cpu: {
        loadAvg: number[];
        cores: number;
    };
    hostname: string;
    platform: string;
    uptime: string;
}

@Injectable()
export class HealthService {
    private readonly logger = new Logger(HealthService.name);

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    /**
     * 检查数据库连接是否正常
     */
    async checkDatabaseHealth(): Promise<boolean> {
        try {
            // 尝试执行一个简单的查询
            const startTime = Date.now();
            await this.dataSource.query('SELECT 1');
            const endTime = Date.now();
            this.logger.debug(`Database query latency: ${endTime - startTime}ms`);
            return true;
        } catch (error:any) {
            this.logger.error(`Database health check failed: ${error.message}`);
            return false;
        }
    }

    /**
     * 获取数据库连接状态详情
     */
    async getDatabaseStatus(): Promise<DatabaseStatus> {
        const isConnected = this.dataSource.isInitialized;

        if (!isConnected) {
            return { status: 'disconnected' };
        }

        const queryRunner = this.dataSource.createQueryRunner();

        try {
            // 测量数据库查询延迟
            const startTime = Date.now();
            const versionResult = await queryRunner.query('SELECT version()');
            const endTime = Date.now();
            const latency = endTime - startTime;

            const version = versionResult[0].version;

            // 获取当前连接数
            const connectionsResult = await queryRunner.query(
                `SELECT count(*) as connections FROM pg_stat_activity`
            );
            const connections = parseInt(connectionsResult[0].connections, 10);

            return {
                status: 'connected',
                version,
                connections,
                driver: this.dataSource.options.type as string,
                latency,
            };
        } catch (error:any) {
            this.logger.error(`Error getting database status: ${error.message}`);
            return {
                status: 'error',
                message: error.message,
            };
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 获取系统状态
     */
    getSystemStatus(): SystemStatus {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const usedPercent = Math.round((usedMem / totalMem) * 100);

        return {
            memory: {
                total: this.formatBytes(totalMem),
                free: this.formatBytes(freeMem),
                used: this.formatBytes(usedMem),
                usedPercent,
            },
            cpu: {
                loadAvg: os.loadavg(),
                cores: os.cpus().length,
            },
            hostname: os.hostname(),
            platform: `${os.type()} ${os.release()}`,
            uptime: this.formatUptime(os.uptime()),
        };
    }

    /**
     * 获取完整的健康状态报告
     */
    async getFullHealthStatus(): Promise<HealthStatus> {
        const isDbHealthy = await this.checkDatabaseHealth();
        const dbStatus = isDbHealthy
            ? await this.getDatabaseStatus()
            : { status: 'error', message: 'Database connection failed' } as DatabaseStatus;

        return {
            status: isDbHealthy ? 'ok' : 'error',
            timestamp: new Date().toISOString(),
            uptime: this.formatUptime(process.uptime()),
            database: dbStatus,
            system: this.getSystemStatus(),
        };
    }

    /**
     * 格式化字节数
     */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 格式化运行时间
     */
    private formatUptime(seconds: number): string {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

        return parts.join(' ');
    }
}
