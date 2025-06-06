import {
    Body, Controller, Get, HttpCode, Post,
    Req, Res, UnauthorizedException, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';
import { Public } from '../decorators/public.decorator';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ) { }

    @Public()
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: '用户登录' })
    @ApiResponse({ status: 200, description: '登录成功' })
    @ApiResponse({ status: 401, description: '用户名或密码错误' })
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(loginDto);

        // 设置安全的HTTP Only Cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
            path: '/',
        });

        // 不在响应中返回refreshToken
        const { refreshToken, ...response } = result;
        return response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiOperation({ summary: '获取当前用户信息' })
    @ApiBearerAuth()
    async getCurrentUser(@Req() req: Request) {
        if (!req.user) {
            throw new UnauthorizedException('用户不存在');
        }

        // 使用类型断言
        const user = req.user as any;
        const dbUser = await this.usersService.findOne(user.userId);
        if (!dbUser) {
            throw new UnauthorizedException('用户不存在');
        }

        const { password, refreshToken, ...userInfo } = dbUser;
        return userInfo;
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

        if (!userId || !refreshToken) {
            throw new UnauthorizedException('无效的刷新令牌');
        }

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
}
