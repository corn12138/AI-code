import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    private readonly logger = new Logger(JwtRefreshStrategy.name);

    constructor(
        private usersService: UsersService,
        configService: ConfigService,
    ) {
        // 使用相同的方法确保密钥设置
        const jwtSecret = process.env.JWT_SECRET;
        const configJwtSecret = configService.get<string>('JWT_SECRET');

        // 使用备用方案
        const secretKey = jwtSecret || configJwtSecret || 'fd8e4c32a9b6f7d1e5c8b3a2d7f6e9c1b4a3d2f5e8c7b6a9d8f7e6c5b4a3f2e1';

        console.log('JwtRefreshStrategy - 使用的密钥已设置:', !!secretKey);

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secretKey,
            passReqToCallback: true,
        });

        this.logger.log('JWT刷新策略已初始化');
    }

    async validate(req: Request, payload: any) {
        const authHeader = req.get('Authorization');

        if (!authHeader) {
            throw new UnauthorizedException('授权头缺失');
        }

        const refreshToken = authHeader.replace('Bearer', '').trim();
        const user = await this.usersService.findOne(payload.sub);

        if (!user) {
            throw new UnauthorizedException('用户不存在');
        }

        // 确保返回的用户对象包含我们在类型定义中指定的属性
        return {
            userId: payload.sub,
            username: payload.username,
            roles: payload.roles,
            refreshToken,
        };
    }
}
