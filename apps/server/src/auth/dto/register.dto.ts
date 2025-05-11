import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'johndoe', description: '用户名' })
    @IsNotEmpty({ message: '用户名不能为空' })
    @MinLength(3, { message: '用户名长度不能小于3' })
    @MaxLength(20, { message: '用户名长度不能大于20' })
    @Matches(/^[a-zA-Z0-9_-]+$/, { message: '用户名只能包含字母、数字、下划线和连字符' })
    username: string;

    @ApiProperty({ example: 'john@example.com', description: '邮箱' })
    @IsNotEmpty({ message: '邮箱不能为空' })
    @IsEmail({}, { message: '邮箱格式不正确' })
    email: string;

    @ApiProperty({ example: 'Password123!', description: '密码' })
    @IsNotEmpty({ message: '密码不能为空' })
    @MinLength(8, { message: '密码长度不能小于8' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
        message: '密码必须包含大小写字母、数字和特殊字符',
    })
    password: string;
}
