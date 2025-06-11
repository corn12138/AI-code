import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

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

    // 创建CSRF中间件实例
    const csrfProtection = csrf({
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        }
    });

    // 应用CSRF中间件，为认证端点添加例外
    app.use((req: Request, res: Response, next: NextFunction) => {
        // 跳过API认证端点的CSRF验证
        const skipCSRFPaths = [
            '/api/auth/login',
            '/api/auth/register',
            '/api/auth/refresh'
        ];

        if (skipCSRFPaths.includes(req.path)) {
            return next();
        }

        // 对其他路径应用CSRF保护
        csrfProtection(req, res, next);
    });

    // CSRF令牌提供中间件（仅对非跳过路径）
    app.use((req: Request, res: Response, next: NextFunction) => {
        // 提供CSRF令牌到视图模板
        (res as any).locals = (res as any).locals || {};

        // 只有在CSRF令牌函数存在时才调用
        if (typeof req.csrfToken === 'function') {
            (res as any).locals.csrfToken = req.csrfToken();
        }

        // 如果是API请求，不用处理HTML页面
        if (req.path.startsWith('/api')) {
            return next();
        }

        // 在HTML页面中嵌入CSRF令牌
        const origSend = res.send;
        res.send = function (body: string | object) {
            if (typeof body === 'string' && body.includes('<meta name="csrf-token"') && typeof req.csrfToken === 'function') {
                body = body.replace(
                    '<meta name="csrf-token" content="" id="csrf-token">',
                    `<meta name="csrf-token" content="${req.csrfToken()}" id="csrf-token">`
                );
            }
            return origSend.call(this, body);
        };
        next();
    });

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
                        : 'http://localhost:3001'],
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
