import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: '用户邮箱', example: 'user@example.com' })
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @ApiProperty({ description: '用户密码', example: 'password123' })
    password!: string;
}
