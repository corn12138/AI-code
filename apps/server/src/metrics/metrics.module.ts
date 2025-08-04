import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
    imports: [
        PrometheusModule.register({
            path: '/api/metrics',
            defaultMetrics: {
                enabled: true,
                config: {
                    prefix: 'nestjs_',
                },
            },
        }),
    ],
    controllers: [MetricsController],
    providers: [MetricsService],
    exports: [MetricsService],
})
export class MetricsModule { } 