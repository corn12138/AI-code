import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { DocCategory } from '../entities/mobile-doc.entity';

export class QueryMobileDocDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiProperty({ description: '文档分类', enum: DocCategory, required: false })
  @IsOptional()
  @IsEnum(DocCategory)
  category?: DocCategory;

  @ApiProperty({ description: '搜索关键词', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: '标签过滤', required: false })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiProperty({ description: '是否只显示热门', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isHot?: boolean;

  @ApiProperty({ description: '是否只显示已发布', required: false, default: true })
  @IsOptional()
  @Transform(({ value }) => value !== 'false')
  published?: boolean = true;
}
