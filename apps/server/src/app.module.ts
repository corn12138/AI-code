import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleModule } from './article/article.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import configuration from './config/configuration';
import { LowcodeModule } from './lowcode/lowcode.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        // 配置模块
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
        }),

        // 数据库连接
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('database.host', 'localhost'),
                port: configService.get('database.port', 5432),
                username: configService.get('database.username', 'bloguser'),
                password: configService.get('database.password', 'blogpassword'),
                database: configService.get('database.name', 'blogdb'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: configService.get('database.synchronize', false),
                logging: configService.get('database.logging', false),
                ssl: configService.get('database.ssl', false)
                    ? { rejectUnauthorized: false }
                    : false,
            }),
        }),

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
    ],
    providers: [
        // 全局限流守卫
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
