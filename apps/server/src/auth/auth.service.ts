import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { username, email, password } = registerDto;

        // 检查用户名是否已存在
        const existingUser = await this.userService.findByUsernameOrEmail(username, email);
        if (existingUser) {
            throw new ConflictException('用户名或邮箱已被使用');
        }

        // 加密密码
        const saltRounds = this.configService.get<number>('security.bcryptSaltRounds', 12);
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 创建新用户
        const user = await this.userService.create({
            username,
            email,
            passwordHash,
        });

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };
    }

    async validateUser(usernameOrEmail: string, password: string) {
        const user = await this.userService.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);
        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(
            loginDto.usernameOrEmail,
            loginDto.password,
        );

        if (!user) {
            throw new UnauthorizedException('用户名或密码不正确');
        }

        const tokens = await this.getTokens(user.id, user.username, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.userService.findById(userId);
        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('访问被拒绝');
        }

        const isRefreshTokenValid = await bcrypt.compare(
            refreshToken,
            user.refreshToken,
        );

        if (!isRefreshTokenValid) {
            throw new UnauthorizedException('访问被拒绝');
        }

        const tokens = await this.getTokens(user.id, user.username, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        };
    }

    async logout(userId: string) {
        return this.userService.update(userId, { refreshToken: null });
    }

    async getTokens(userId: string, username: string, role: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    username,
                    role,
                },
                {
                    secret: this.configService.get<string>('jwt.secret'),
                    expiresIn: this.configService.get<string>('jwt.accessTokenExpiration'),
                },
            ),
            this.jwtService.signAsync(
                {
                    sub: userId,
                    username,
                    role,
                },
                {
                    secret: this.configService.get<string>('jwt.secret'),
                    expiresIn: this.configService.get<string>('jwt.refreshTokenExpiration'),
                },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        const saltRounds = this.configService.get<number>('security.bcryptSaltRounds', 12);
        const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);
        await this.userService.update(userId, {
            refreshToken: hashedRefreshToken,
        });
    }
}
