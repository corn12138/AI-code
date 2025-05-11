import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
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

    const app = await NestFactory.create(AppModule, {
        logger,
    });

    // 全局异常过滤器
    app.useGlobalFilters(new HttpExceptionFilter());

    // 使用cookie-parser中间件
    app.use(cookieParser());

    // 全局前缀
    app.setGlobalPrefix('api');

    // 安全headers
    app.use(helmet());

    // CORS配置
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3002',
            // 生产环境下的域名
        ],
        credentials: true,
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

    await app.listen(3001);
    console.log(`应用运行在: ${await app.getUrl()}`);
}

bootstrap();
