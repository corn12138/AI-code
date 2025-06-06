import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/common/cache';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LowcodePage } from './entities/lowcode-page.entity';
import { LowcodeController } from './lowcode.controller';
import { LowcodeService } from './lowcode.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([LowcodePage]),
        CacheModule.registerAsync({
            isGlobal: true,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                // Para resolver el error de tipo, siempre devolvemos un objeto con la misma estructura
                // pero con valores predeterminados cuando no usamos Redis
                const useRedis = configService.get('USE_REDIS_CACHE') === 'true';

                return {
                    ttl: 60 * 60 * 24, // 24 horas de caché
                    // Usamos null como valor predeterminado para las propiedades requeridas
                    // cuando no utilizamos Redis
                    store: useRedis ? require('cache-manager-redis-store') : undefined,
                    host: useRedis ? configService.get('REDIS_HOST', 'localhost') : undefined,
                    port: useRedis ? parseInt(configService.get('REDIS_PORT', '6379')) : undefined,
                    // Añadimos una aserción de tipo para asegurar la compatibilidad
                } as any; // Usamos 'as any' para evitar el error de tipo
            },
        }),
    ],
    controllers: [LowcodeController],
    providers: [LowcodeService],
})
export class LowcodeModule { }
