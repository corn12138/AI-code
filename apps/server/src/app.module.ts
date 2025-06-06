import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ArticleModule } from './article/article.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CommonModule } from './common/common.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { XssProtectionMiddleware } from './common/middleware/xss-protection.middleware';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { LowcodeModule } from './lowcode/lowcode.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        // 配置模块
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            // 根据环境变量选择配置文件
            envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env',
        }),

        // 数据库模块
        DatabaseModule,

        // 请求限流
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                ttl: configService.get('throttle.ttl', 60),
                limit: configService.get('throttle.limit', 100),
            }),
        }),

        // 业务模块
        AuthModule,
        UserModule,
        ArticleModule,
        LowcodeModule,
        CommonModule,
        HealthModule,
    ],
    providers: [
        // 全局限流守卫
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard, // 全局应用JWT认证守卫
        },
        // 添加全局异常过滤器
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
        // 添加全局响应拦截器
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // 应用XSS防护中间件到所有路由
        consumer
            .apply(XssProtectionMiddleware)
            .forRoutes('*');
    }
}
