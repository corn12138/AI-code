import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { MetricsService } from './metrics.service';
import { register } from 'prom-client';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Public()
  @Header('Content-Type', register.contentType)
  @ApiOperation({ summary: 'Prometheus指标端点' })
  async getMetrics(): Promise<string> {
    return await register.metrics();
  }

  @Get('custom')
  @Public()
  @ApiOperation({ summary: '自定义应用指标' })
  async getCustomMetrics() {
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      custom_metrics: await this.metricsService.getApplicationMetrics(),
    };
  }
} 