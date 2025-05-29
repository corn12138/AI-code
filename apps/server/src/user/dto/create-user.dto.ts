import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ description: '用户名' })
    @IsNotEmpty()
    @IsString()
    username!: string;

    @ApiProperty({ description: '邮箱' })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email!: string;

    @ApiProperty({ description: '密码哈希', required: false })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    passwordHash!: string;

    @ApiProperty({ description: '全名', required: false })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiProperty({ description: '头像', required: false })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiProperty({ description: '个人简介', required: false })
    @IsOptional()
    @IsString()
    bio?: string;
}
