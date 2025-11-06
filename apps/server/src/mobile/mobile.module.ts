import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { MobileDoc } from './entities/mobile-doc.entity';

// Controllers
import { MobileV1Controller } from './controllers/mobile-v1.controller';
import { WebV1Controller } from './controllers/web-v1.controller';
import { MobileController } from './mobile.controller';

// Services
import { MobileService } from './mobile.service';

// Adapters
import { ClientAdapter } from './adapters/client.adapter';
import { ExternalServiceAdapter } from './adapters/external-service.adapter';

// Interceptors
import { ClientTrimInterceptor } from './interceptors/client-trim.interceptor';

// Filters
import { MobileExceptionFilter } from './filters/mobile-exception.filter';

@Module({
    imports: [
        TypeOrmModule.forFeature([MobileDoc]),
        ConfigModule,
    ],
    controllers: [
        MobileController,        // 兼容旧版本
        MobileV1Controller,      // 移动端统一 API v1
        WebV1Controller,         // Web 端 API v1
    ],
    providers: [
        MobileService,
        ClientAdapter,
        ExternalServiceAdapter,

        // 全局过滤器
        {
            provide: APP_FILTER,
            useClass: MobileExceptionFilter,
        },

        // 全局拦截器
        {
            provide: APP_INTERCEPTOR,
            useClass: ClientTrimInterceptor,
        },
    ],
    exports: [
        MobileService,
        ClientAdapter,
        ExternalServiceAdapter,
    ],
})
export class MobileModule { }
