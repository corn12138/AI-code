import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => {
                    // 从cookie中获取refresh token
                    return request?.cookies?.refresh_token;
                },
            ]),
            secretOrKey: configService.get<string>('jwt.secret'),
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: any) {
        // 从cookie中获取刷新令牌
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) {
            throw new UnauthorizedException('刷新令牌不存在');
        }

        try {
            // 获取用户信息
            const user = await this.userService.findById(payload.sub);

            return {
                ...user,
                id: payload.sub,
                refreshToken,
            };
        } catch (error) {
            throw new UnauthorizedException('刷新令牌无效');
        }
    }
}
