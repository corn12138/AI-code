import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthService } from './health.service';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('database.host'),
                port: configService.get<number>('database.port'),
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
                database: configService.get<string>('database.name'),
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                synchronize: configService.get<boolean>('database.synchronize'),
                logging: configService.get<boolean>('database.logging'),
                ssl: configService.get<boolean>('database.ssl')
                    ? { rejectUnauthorized: false }
                    : false,
                // 添加连接池配置
                extra: {
                    max: 20, // 最大连接数
                    idleTimeoutMillis: 30000, // 连接闲置多久后关闭
                    connectionTimeoutMillis: 2000, // 连接超时
                },
                // 自动重连
                retryAttempts: 10,
                retryDelay: 3000,
                autoLoadEntities: true,
            }),
        }),
    ],
    providers: [HealthService],
    exports: [HealthService],
})
export class DatabaseModule { }
