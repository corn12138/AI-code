import { Body, Controller, Delete, Get, Param, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('me')
    @ApiOperation({ summary: '获取当前用户信息' })
    @ApiResponse({ status: 200, description: '成功返回用户信息' })
    async getProfile(@Req() req) {
        return this.userService.findById(req.user.id);
    }

    @Patch('me')
    @ApiOperation({ summary: '更新当前用户信息' })
    @ApiResponse({ status: 200, description: '成功更新用户信息' })
    async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(req.user.id, updateUserDto);
    }

    @Get(':id')
    @ApiOperation({ summary: '获取指定用户信息' })
    @ApiResponse({ status: 200, description: '成功返回用户信息' })
    @ApiResponse({ status: 404, description: '用户不存在' })
    async findOne(@Param('id') id: string) {
        return this.userService.findById(id);
    }

    @Delete('me')
    @ApiOperation({ summary: '删除当前用户' })
    @ApiResponse({ status: 200, description: '成功删除用户' })
    async remove(@Req() req) {
        await this.userService.remove(req.user.id);
        return { message: '用户删除成功' };
    }
}
