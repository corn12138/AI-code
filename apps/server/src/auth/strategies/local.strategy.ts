import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'usernameOrEmail',
        });
    }

    async validate(usernameOrEmail: string, password: string) {
        const user = await this.authService.validateUser(usernameOrEmail, password);
        if (!user) {
            throw new UnauthorizedException('用户名或密码不正确');
        }
        return user;
    }
}
