import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 50)
    @ApiProperty({ description: '用户名', example: 'johndoe' })
    username!: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: '电子邮箱', example: 'john@example.com' })
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @ApiProperty({ description: '密码', example: 'securepassword123' })
    password!: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: '全名', required: false, example: 'John Doe' })
    fullName?: string;
}
