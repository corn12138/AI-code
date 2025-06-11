import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get(':id')
    @ApiOperation({ summary: '通过ID获取用户' })
    @ApiResponse({ status: 200, description: '返回用户信息' })
    @ApiResponse({ status: 404, description: '用户不存在' })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    // 其他控制器方法应该根据UsersService的实际实现来添加
}
