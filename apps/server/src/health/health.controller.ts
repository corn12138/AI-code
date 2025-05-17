import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { HealthService } from '../database/health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    @Get()
    @Public()
    @ApiOperation({ summary: '系统健康检查' })
    async check() {
        const dbStatus = await this.healthService.getDatabaseStatus();
        const uptime = process.uptime();

        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
            database: dbStatus,
            memory: {
                rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            },
        };
    }

    @Get('db')
    @Public()
    @ApiOperation({ summary: '数据库健康检查' })
    async checkDb() {
        const isHealthy = await this.healthService.checkDatabaseHealth();
        const status = isHealthy ? 'healthy' : 'unhealthy';

        return {
            database: status,
            timestamp: new Date().toISOString(),
        };
    }
}
