import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('register')
    @ApiOperation({ summary: '用户注册' })
    @ApiResponse({ status: 201, description: '注册成功' })
    @ApiResponse({ status: 400, description: '注册信息有误' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: '用户登录' })
    @ApiResponse({ status: 200, description: '登录成功' })
    @ApiResponse({ status: 401, description: '登录失败' })
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const { accessToken, refreshToken, user } = await this.authService.login(loginDto);

        // 设置refreshToken到httpOnly cookie
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
        });

        return {
            accessToken,
            user
        };
    }

    @Public()
    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    @HttpCode(200)
    @ApiOperation({ summary: '刷新访问令牌' })
    @ApiResponse({ status: 200, description: '令牌刷新成功' })
    @ApiResponse({ status: 401, description: '刷新令牌无效' })
    async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken, user } = await this.authService.refreshTokens(
            req.user.id,
            req.user.refreshToken,
        );

        // 更新refreshToken cookie
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
        });

        return {
            accessToken,
            user,
        };
    }

    @Post('logout')
    @HttpCode(200)
    @ApiBearerAuth()
    @ApiOperation({ summary: '用户登出' })
    @ApiResponse({ status: 200, description: '登出成功' })
    async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(req.user.id);

        // 清除refreshToken cookie
        res.clearCookie('refresh_token');

        return { message: '登出成功' };
    }
}
