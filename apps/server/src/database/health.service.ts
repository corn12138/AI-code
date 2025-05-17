import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
    constructor(
        @InjectDataSource()
        private dataSource: DataSource,
    ) { }

    /**
     * 检查数据库连接是否正常
     */
    async checkDatabaseHealth(): Promise<boolean> {
        try {
            // 尝试执行一个简单的查询
            await this.dataSource.query('SELECT 1');
            return true;
        } catch (error) {
            console.error('数据库连接检查失败:', error);
            return false;
        }
    }

    /**
     * 获取数据库连接状态详情
     */
    async getDatabaseStatus(): Promise<any> {
        const isConnected = this.dataSource.isInitialized;
        const queryRunner = this.dataSource.createQueryRunner();

        try {
            if (isConnected) {
                // 获取PostgreSQL版本信息
                const versionResult = await queryRunner.query('SELECT version()');
                const version = versionResult[0].version;

                // 获取当前连接数
                const connectionsResult = await queryRunner.query(
                    `SELECT count(*) as connections FROM pg_stat_activity`
                );
                const connections = connectionsResult[0].connections;

                return {
                    status: 'connected',
                    version,
                    connections,
                    driver: this.dataSource.driver.options.type,
                };
            }

            return {
                status: 'disconnected',
            };
        } catch (error:any) {
            return {
                status: 'error',
                message: error.message,
            };
        } finally {
            await queryRunner.release();
        }
    }
}
