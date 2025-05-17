import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString, Length } from 'class-validator';

export class UpdatePageDto {
    @IsOptional()
    @IsString()
    @Length(3, 100)
    @ApiProperty({ description: '页面名称', required: false })
    name?: string;

    @IsOptional()
    @IsString()
    @Length(3, 50)
    @ApiProperty({ description: '页面路径标识符', required: false })
    slug?: string;

    @IsOptional()
    @IsObject()
    @ApiProperty({ description: '页面配置和组件数据', required: false })
    content?: Record<string, any>;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: '页面描述', required: false })
    description?: string;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ description: '是否为首页', required: false })
    isHomePage?: boolean;

    @IsOptional()
    @IsObject()
    @ApiProperty({ description: '页面配置选项', required: false })
    config?: Record<string, any>;
}
