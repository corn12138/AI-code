import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @Length(3, 50)
    @ApiProperty({ description: '用户名', required: false })
    username?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    @ApiProperty({ description: '用户全名', required: false })
    fullName?: string;

    @IsOptional()
    @IsEmail()
    @ApiProperty({ description: '电子邮箱', required: false })
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @ApiProperty({ description: '个人简介', required: false })
    bio?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: '头像URL', required: false })
    avatar?: string;
}
