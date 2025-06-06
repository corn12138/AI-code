import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async validateUser(usernameOrEmail: string, pass: string): Promise<any> {
        const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);
        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (isPasswordValid) {
            const { password, refreshToken, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.usernameOrEmail, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('用户名或密码错误');
        }

        const tokens = await this.getTokens(user.id, user.username, user.roles);
        await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                roles: user.roles,
                avatar: user.avatar,
            },
            ...tokens,
        };
    }

    async logout(userId: string) {
        await this.usersService.updateRefreshToken(userId, null);
        return { success: true };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.usersService.findOne(userId);
        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Access Denied');
        }

        const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!refreshTokenMatches) {
            throw new UnauthorizedException('Access Denied');
        }

        const tokens = await this.getTokens(user.id, user.username, user.roles);
        await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async getTokens(userId: string, username: string, roles: string[]) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    username,
                    roles,
                },
                {
                    secret: this.configService.get<string>('JWT_SECRET'),
                    expiresIn: '15m',
                },
            ),
            this.jwtService.signAsync(
                {
                    sub: userId,
                    username,
                    roles,
                },
                {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                    expiresIn: '7d',
                },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    async register(registerDto: any): Promise<any> {
        // 检查邮箱和用户名是否已存在
        const existingEmail = await this.usersService.findByEmail(registerDto.email);
        if (existingEmail) {
            throw new BadRequestException('该电子邮件已被注册');
        }

        const existingUsername = await this.usersService.findByUsername(registerDto.username);
        if (existingUsername) {
            throw new BadRequestException('该用户名已被注册');
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // 创建用户
        // 注意: 这里需要根据您的UserService实现创建用户的方法
        // 这里假设有一个create方法
        const newUser = await this.usersService.create({
            ...registerDto,
            password: hashedPassword,
            roles: ['user']
        });

        // 移除敏感信息
        const { password, refreshToken, ...result } = newUser;

        // 生成令牌
        const tokens = await this.getTokens(newUser.id, newUser.username, newUser.roles);

        // 更新刷新令牌
        await this.usersService.updateRefreshToken(newUser.id, tokens.refreshToken);

        return {
            user: result,
            ...tokens,
        };
    }
}
