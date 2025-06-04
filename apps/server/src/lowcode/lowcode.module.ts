import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { LowcodePage } from './entities/lowcode-page.entity';
import { LowcodeController } from './lowcode.controller';
import { LowcodeService } from './lowcode.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([LowcodePage]),
        CacheModule.register({
            store: redisStore,
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            ttl: 60 * 60, // 默认缓存1小时
            max: 100, // 最大缓存项数
        }),
    ],
    controllers: [LowcodeController],
    providers: [LowcodeService],
    exports: [LowcodeService],
})
export class LowcodeModule { }
