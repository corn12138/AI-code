import {
    Body, Controller,
    HttpCode,
    Logger,
    Post,
    Req, Res, UnauthorizedException, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(
        private readonly authService: AuthService,
    ) { }

    @Public()
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: '用户登录' })
    @ApiResponse({ status: 200, description: '登录成功' })
    @ApiResponse({ status: 401, description: '用户名或密码错误' })
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        try {
            this.logger.log(`登录尝试: ${loginDto.usernameOrEmail}`);

            const result = await this.authService.login(loginDto);

            this.logger.log(`用户 ${loginDto.usernameOrEmail} 登录成功`);

            // 设置安全的HTTP Only Cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
                path: '/',
            });

            // 设置CSRF令牌作为普通cookie（可被JavaScript访问）
            if (result.csrfToken) {
                res.cookie('XSRF-TOKEN', result.csrfToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000, // 1天
                    path: '/',
                });
            }

            // 不在响应中返回refreshToken
            const { refreshToken, ...response } = result;
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`登录失败: ${loginDto.usernameOrEmail} - ${errorMessage}`, errorStack);
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(200)
    @ApiOperation({ summary: '用户登出' })
    @ApiBearerAuth()
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        if (!req.user) {
            throw new UnauthorizedException('用户未认证');
        }

        // 使用类型断言
        const user = req.user as any;
        await this.authService.logout(user.userId);

        res.clearCookie('refreshToken');
        res.clearCookie('XSRF-TOKEN');
        return { success: true };
    }

    @UseGuards(JwtRefreshAuthGuard)
    @Post('refresh')
    @HttpCode(200)
    @ApiOperation({ summary: '刷新访问令牌' })
    async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        if (!req.user) {
            throw new UnauthorizedException('无效的刷新令牌');
        }

        // 使用类型断言
        const user = req.user as any;
        const userId = user.userId;
        const refreshToken = user.refreshToken;

        const tokens = await this.authService.refreshTokens(userId, refreshToken);

        // 更新refreshToken cookie
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        return { accessToken: tokens.accessToken };
    }

    @Public()
    @Post('register')
    @HttpCode(201)
    @ApiOperation({ summary: '用户注册' })
    @ApiResponse({ status: 201, description: '注册成功' })
    @ApiResponse({ status: 400, description: '注册信息无效或用户已存在' })
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        try {
            this.logger.log(`注册尝试: ${registerDto.email}`);

            const result = await this.authService.register(registerDto);

            this.logger.log(`用户 ${registerDto.email} 注册成功`);

            // 设置安全的HTTP Only Cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
                path: '/',
            });

            // 设置CSRF令牌作为普通cookie（可被JavaScript访问）
            if (result.csrfToken) {
                res.cookie('XSRF-TOKEN', result.csrfToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000, // 1天
                    path: '/',
                });
            }

            // 不在响应中返回refreshToken
            const { refreshToken, ...response } = result;
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`注册失败: ${registerDto.email} - ${errorMessage}`, errorStack);
            throw error;
        }
    }
}
