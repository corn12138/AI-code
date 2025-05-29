import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '@/user/entities/user.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('邮箱或密码不正确');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('邮箱或密码不正确');
        }

        // 不返回密码等敏感字段
        const { password: _, refreshToken: __, ...result } = user;
        return result;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        const tokens = await this.getTokens(user.id, user.email, user.roles);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return {
            ...tokens,
            user
        };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.userService.findById(userId);

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('刷新令牌已失效');
        }

        const refreshTokenMatches = await bcrypt.compare(
            refreshToken,
            user.refreshToken,
        );

        if (!refreshTokenMatches) {
            throw new UnauthorizedException('刷新令牌已失效');
        }

        const tokens = await this.getTokens(user.id, user.email, user.roles);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        // 不返回密码等敏感字段
        const { password: _, refreshToken: __, ...userResult } = user;

        return {
            ...tokens,
            user: userResult
        };
    }

    async register(registerDto: RegisterDto) {
        // 检查邮箱是否已存在
        const existingUser = await this.userService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new BadRequestException('该邮箱已被注册');
        }

        // 哈希密码
        const hashedPassword = await this.hashData(registerDto.password);

        // 创建新用户
        // 注意：这里假设UserRepository或UserService中有create方法
        // 实际实现时需要补充此方法
        const newUser = await this.createUser({
            ...registerDto,
            password: hashedPassword,
            roles: ['user'], // 默认角色
        });

        // 不返回密码等敏感字段
        const { password: _, ...result } = newUser;
        return result;
    }

    async logout(userId: string) {
        // 清除用户的refreshToken
        await this.updateRefreshToken(userId, null);
    }

    private async updateRefreshToken(userId: string, refreshToken: string | null) {
        // 如果提供了refreshToken，则哈希后存储
        const hashedRefreshToken = refreshToken
            ? await this.hashData(refreshToken)
            : null;

        // 更新用户的refreshToken
        await this.updateUserRefreshToken(userId, hashedRefreshToken);
    }

    private async getTokens(userId: string, email: string, roles: string[]) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    email,
                    roles,
                },
                {
                    secret: this.configService.get<string>('jwt.secret'),
                    expiresIn: this.configService.get<string>('jwt.accessTokenExpiration'),
                },
            ),
            this.jwtService.signAsync(
                {
                    sub: userId,
                    email,
                    roles,
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

    private async hashData(data: string): Promise<string> {
        const saltRounds = this.configService.get<number>('security.bcryptSaltRounds', 10);
        return bcrypt.hash(data, saltRounds);
    }

    // 辅助方法 - 创建用户
    private async createUser(userData: DeepPartial<User>): Promise<any> {
        // 实际实现中需要调用用户仓库或服务
        return this.userService.create(userData as any);
    }

    // 辅助方法 - 更新用户的refreshToken
    private async updateUserRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
        // 实际实现中需要调用用户仓库或服务
        await this.userService.update(userId, { 
            refreshToken: refreshToken === null ? undefined : refreshToken 
        });
    }
}
