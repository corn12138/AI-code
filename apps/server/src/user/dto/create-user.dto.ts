import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ description: '用户名' })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ description: '邮箱' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: '密码哈希', required: false })
    @IsNotEmpty()
    passwordHash: string;
}
