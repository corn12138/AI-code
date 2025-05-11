import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    const refreshToken = request?.cookies?.refresh_token;
                    if (!refreshToken) {
                        return null;
                    }
                    return refreshToken;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt.secret'),
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: any) {
        const refreshToken = req.cookies?.refresh_token;
        return {
            id: payload.sub,
            username: payload.username,
            role: payload.role,
            refreshToken,
        };
    }
}
