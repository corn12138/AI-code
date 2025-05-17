import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';

export class CreateArticleDto {
    @IsString()
    @Length(5, 100)
    @ApiProperty({ description: '文章标题' })
    title!: string;

    @IsString()
    @ApiProperty({ description: '文章内容' })
    content!: string;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    @ApiProperty({ description: '文章摘要', required: false })
    summary?: string;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ description: '是否发布', default: false, required: false })
    published?: boolean;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: '特色图片URL', required: false })
    featuredImage?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: '文章别名', required: false })
    slug?: string;

    @IsOptional()
    @IsUUID()
    @ApiProperty({ description: '分类ID', required: false })
    categoryId?: string;

    @IsOptional()
    @IsArray()
    @ApiProperty({ description: '标签列表', type: [String], required: false })
    tags?: string[];
}
