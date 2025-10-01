import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { DocCategory } from '../entities/mobile-doc.entity';

export class CreateMobileDocDto {
    @ApiProperty({ description: '文档标题' })
    @IsString()
    @MaxLength(200)
    title!: string;

    @ApiProperty({ description: '文档摘要', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    summary?: string;

    @ApiProperty({ description: '文档内容' })
    @IsString()
    content!: string;

    @ApiProperty({ description: '文档分类', enum: DocCategory })
    @IsEnum(DocCategory)
    category!: DocCategory;

    @ApiProperty({ description: '作者', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    author?: string;

    @ApiProperty({ description: '阅读时间（分钟）', required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    readTime?: number;

    @ApiProperty({ description: '标签列表', required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiProperty({ description: '封面图片URL', required: false })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiProperty({ description: '是否热门', required: false })
    @IsOptional()
    @IsBoolean()
    isHot?: boolean;

    @ApiProperty({ description: '是否发布', required: false })
    @IsOptional()
    @IsBoolean()
    published?: boolean;

    @ApiProperty({ description: '排序权重', required: false })
    @IsOptional()
    @IsInt()
    sortOrder?: number;

    @ApiProperty({ description: '文档类型', required: false })
    @IsOptional()
    @IsString()
    docType?: string;

    @ApiProperty({ description: '文件路径', required: false })
    @IsOptional()
    @IsString()
    filePath?: string;
}
