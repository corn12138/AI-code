import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'johndoe', description: '用户名或邮箱' })
    @IsNotEmpty({ message: '用户名或邮箱不能为空' })
    usernameOrEmail: string;

    @ApiProperty({ example: 'Password123!', description: '密码' })
    @IsNotEmpty({ message: '密码不能为空' })
    password: string;
}
