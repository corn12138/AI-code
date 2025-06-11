import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async validateUser(usernameOrEmail: string, pass: string): Promise<any> {
        try {
            this.logger.debug(`验证用户: ${usernameOrEmail}`);

            const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);
            if (!user) {
                this.logger.warn(`用户不存在: ${usernameOrEmail}`);
                return null;
            }

            this.logger.debug(`找到用户: ${user.username} (${user.email})`);
            this.logger.debug(`数据库密码长度: ${user.password?.length || 0}`);
            this.logger.debug(`输入密码长度: ${pass?.length || 0}`);

            const isPasswordValid = await bcrypt.compare(pass, user.password);
            this.logger.debug(`密码比较结果: ${isPasswordValid}`);

            if (isPasswordValid) {
                this.logger.debug(`密码验证成功: ${usernameOrEmail}`);
                const { password, refreshToken, ...result } = user;
                return result;
            } else {
                this.logger.warn(`密码验证失败: ${usernameOrEmail}`);
                this.logger.debug(`期望密码哈希: ${user.password.substring(0, 10)}...`);
            }
            return null;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`用户验证过程出错: ${usernameOrEmail} - ${errorMessage}`, errorStack);
            throw error;
        }
    }

    async login(loginDto: LoginDto) {
        try {
            this.logger.log(`开始登录流程: ${loginDto.usernameOrEmail}`);

            const user = await this.validateUser(
                loginDto.usernameOrEmail,
                loginDto.password
            );

            if (!user) {
                this.logger.warn(`登录失败 - 无效凭据: ${loginDto.usernameOrEmail}`);
                throw new UnauthorizedException('用户名或密码错误');
            }

            this.logger.debug(`生成令牌: ${user.username}`);
            const tokens = await this.getTokens(user.id, user.username, user.email, user.roles);

            // 生成CSRF令牌
            const csrfToken = crypto.randomBytes(16).toString('hex');

            // 更新用户的刷新令牌
            this.logger.debug(`更新刷新令牌: ${user.username}`);
            await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

            this.logger.log(`登录成功: ${user.username}`);

            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                csrfToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles,
                },
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`登录过程出错: ${loginDto.usernameOrEmail} - ${errorMessage}`, errorStack);
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('登录失败，请稍后重试');
        }
    }

    // 令牌刷新方法
    async refreshToken(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
        try {
            // 验证刷新令牌
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET')
            });

            // 确保令牌未被撤销
            const isRevoked = await this.isTokenRevoked(refreshToken);
            if (isRevoked) {
                throw new UnauthorizedException('刷新令牌已被撤销');
            }

            // 生成新的令牌对
            const user = await this.usersService.findOne(payload.sub);
            const tokens = await this.getTokens(user!.id, user!.username, user!.email, user!.roles);
            await this.usersService.updateRefreshToken(user!.id, tokens.refreshToken);
            return tokens;
        } catch (error) {
            throw new UnauthorizedException('无效的刷新令牌');
        }
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

        const tokens = await this.getTokens(user.id, user.username, user.email, user.roles);
        await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async isTokenRevoked(refreshToken: string): Promise<boolean> {
        try {
            // Decode the token to get the user ID
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET')
            });

            // Find the user
            const user = await this.usersService.findOne(payload.sub);

            // If user doesn't exist or has no refresh token, consider the token revoked
            if (!user || !user.refreshToken) {
                return true;
            }

            // Check if the current refresh token matches the one stored for the user
            const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
            return !isMatch; // If not a match, token is revoked
        } catch (error) {
            // Any error means the token is invalid, so consider it revoked
            return true;
        }
    }

    async getTokens(userId: string, username: string, email: string, roles: string[]) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    username,
                    email,
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
                    email,
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
        const tokens = await this.getTokens(newUser.id, newUser.username, newUser.email, newUser.roles);

        // 更新刷新令牌
        await this.usersService.updateRefreshToken(newUser.id, tokens.refreshToken);

        return {
            user: result,
            ...tokens,
        };
    }
}
