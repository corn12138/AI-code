import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
// import csrf from 'csurf'; // Deprecated package, removed for security
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { MetricsService } from './metrics/metrics.service';

async function bootstrap() {
    // 配置Winston日志
    const logger = WinstonModule.createLogger({
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.ms(),
                    winston.format.colorize(),
                    winston.format.printf((info) => {
                        return `${info.timestamp} ${info.level}: ${info.message}`;
                    }),
                ),
            }),
            new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json(),
                ),
            }),
            new winston.transports.File({
                filename: 'logs/combined.log',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json(),
                ),
            }),
        ],
    });

    // 创建应用
    const app = await NestFactory.create(AppModule, {
        logger,
    });

    // 全局异常过滤器
    app.useGlobalFilters(new HttpExceptionFilter());

    // 使用cookie-parser中间件
    app.use(cookieParser());

    // CSRF protection has been removed due to deprecated csurf package
    // Consider implementing alternative CSRF protection if needed
    // For API-only applications, CSRF protection may not be necessary with proper CORS configuration

    // 全局前缀
    app.setGlobalPrefix('api');

    // 安全headers
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: [`'self'`],
                    scriptSrc: [`'self'`, `'unsafe-inline'`, 'https://cdn.jsdelivr.net'],
                    styleSrc: [`'self'`, `'unsafe-inline'`, 'https://cdn.jsdelivr.net'],
                    imgSrc: [`'self'`, 'data:', 'https://cdn.jsdelivr.net'],
                    connectSrc: [`'self'`, process.env.NODE_ENV === 'production'
                        ? 'https://api.yourdomain.com'
                        : 'http://localhost:3001', 'http://192.168.1.3:3001'],
                    fontSrc: [`'self'`, 'https://cdn.jsdelivr.net'],
                    objectSrc: [`'none'`],
                    mediaSrc: [`'self'`],
                    frameSrc: [`'none'`],
                },
            },
            crossOriginResourcePolicy: { policy: 'cross-origin' },
            xssFilter: true,
        })
    );

    // CORS配置 - 确保包含credentials选项
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3002',
            'http://192.168.1.3:3000',
            'http://192.168.1.3:3001',
            'http://192.168.1.3:3002',
            // 生产环境下的域名
        ],
        credentials: true, // 允许携带cookies
        exposedHeaders: ['X-CSRF-Token'],
    });

    // 全局验证管道
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // 添加全局指标收集拦截器
    const metricsService = app.get(MetricsService);
    app.useGlobalInterceptors(new MetricsInterceptor(metricsService));

    // Swagger API文档
    const config = new DocumentBuilder()
        .setTitle('博客与低代码API')
        .setDescription('博客与低代码平台的后端API文档')
        .setVersion('1.0')
        .addTag('auth', '认证相关')
        .addTag('users', '用户相关')
        .addTag('articles', '文章相关')
        .addTag('lowcode', '低代码平台相关')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // 检查重要的环境变量
    const bootstrapLogger = new Logger('Bootstrap');
    if (!process.env.JWT_SECRET) {
        bootstrapLogger.error('缺少环境变量: JWT_SECRET');
        process.exit(1);
    }

    await app.listen(process.env.PORT || 3001);
    bootstrapLogger.log(`应用已启动: ${await app.getUrl()}`);
}

bootstrap();
