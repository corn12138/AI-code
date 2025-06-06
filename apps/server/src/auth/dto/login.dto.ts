import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: '用户名或电子邮件',
        example: 'admin',
    })
    @IsNotEmpty({ message: '用户名或电子邮件不能为空' })
    @IsString()
    usernameOrEmail!: string;

    @ApiProperty({
        description: '密码',
        example: 'password123',
    })
    @IsNotEmpty({ message: '密码不能为空' })
    @IsString()
    password!: string;
}
