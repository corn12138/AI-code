import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthService } from './health.service';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const logger = new Logger('DatabaseModule');

                // SSH隧道连接信息
                const dbHost = configService.get<string>('DATABASE_HOST', 'localhost'); // 使用localhost连接隧道
                const dbPort = configService.get<number>('DATABASE_PORT', 6543); // 使用隧道端口6543
                const dbName = configService.get<string>('DATABASE_NAME', 'blogdb');
                const dbUser = configService.get<string>('DATABASE_USER');

                logger.log(`通过SSH隧道连接远程数据库: ${dbHost}:${dbPort}/${dbName} (转发到华为云5432端口)`);

                return {
                    type: 'postgres',
                    host: dbHost,
                    port: dbPort,
                    username: dbUser,
                    password: configService.get<string>('DATABASE_PASSWORD'),
                    database: dbName,
                    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                    synchronize: configService.get('NODE_ENV') !== 'production',
                    logging: configService.get('DATABASE_LOGGING') === 'true',
                    ssl: configService.get('DATABASE_SSL') === 'true'
                        ? { rejectUnauthorized: false }
                        : false,

                    // 增加连接超时和重试配置，适应SSH隧道可能的延迟
                    retryAttempts: 10,
                    retryDelay: 3000,
                    connectTimeoutMS: 15000, // 增加连接超时时间
                    autoLoadEntities: true,

                    // 优化连接池配置
                    extra: {
                        // 减小连接池大小以适应SSH隧道
                        max: 10,
                        // 增加连接超时时间
                        connectionTimeoutMillis: 15000,
                        // 增加查询超时时间
                        statement_timeout: 20000,
                    },
                };
            },
        }),
    ],
    providers: [HealthService],
    exports: [HealthService],
})
export class DatabaseModule { }
