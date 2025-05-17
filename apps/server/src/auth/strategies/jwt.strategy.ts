import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('jwt.secret'),
        });
    }

    async validate(payload: any) {
        try {
            // 从payload的sub中获取用户ID
            const user = await this.userService.findById(payload.sub);
            // 验证成功，返回用户信息（不含敏感数据）
            const { password, refreshToken, ...result } = user;
            return { ...result, id: payload.sub };
        } catch (error) {
            throw new UnauthorizedException('无效的认证令牌');
        }
    }
}
