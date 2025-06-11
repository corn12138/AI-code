import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(
        private usersService: UsersService,
        private configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: any) {
        // 增强用户验证逻辑
        const user = await this.usersService.findOne(payload.sub);

        if (!user) {
            this.logger.warn(`尝试使用无效用户ID访问: ${payload.sub}`);
            throw new UnauthorizedException('用户不存在');
        }

        // 修复：检查用户状态属性，使用带有默认值的可选链操作符
        // 如果用户实体中没有isDisabled属性，默认为false
        if (user.roles?.includes('disabled')) {
            this.logger.warn(`禁用用户尝试访问: ${user.username}`);
            throw new UnauthorizedException('账户已被禁用');
        }

        // 移除不存在的方法调用
        // 如需实现最后活动时间更新功能，请先在UsersService中添加相应方法
        // await this.usersService.updateLastActive(user.id);

        return {
            userId: payload.sub,
            username: payload.username,
            roles: payload.roles || ['user'],
            // 添加其他上下文信息
            email: payload.email,
            permissions: payload.permissions || [],
        };
    }
}
