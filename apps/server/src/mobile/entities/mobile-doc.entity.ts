import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum DocCategory {
    LATEST = 'latest',
    FRONTEND = 'frontend',
    BACKEND = 'backend',
    AI = 'ai',
    MOBILE = 'mobile',
    DESIGN = 'design',
}

@Entity('mobile_docs')
export class MobileDoc {
    @ApiProperty({ description: '文档ID' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ description: '文档标题' })
    @Column({ type: 'varchar' })
    title!: string;

    @ApiProperty({ description: '文档摘要' })
    @Column({ type: 'text', nullable: true })
    summary?: string;

    @ApiProperty({ description: '文档内容' })
    @Column({ type: 'text' })
    content!: string;

    @ApiProperty({ description: '文档分类', enum: DocCategory })
    @Column({
        type: 'enum',
        enum: DocCategory,
        default: DocCategory.LATEST,
    })
    category!: DocCategory;

    @ApiProperty({ description: '作者' })
    @Column({ default: '系统管理员', type: 'varchar' })
    author!: string;

    @ApiProperty({ description: '阅读时间（分钟）' })
    @Column({ type: 'int', default: 5 })
    readTime!: number;

    @ApiProperty({ description: '标签列表' })
    @Column({ type: 'jsonb', default: [] })
    tags!: string[];

    @ApiProperty({ description: '封面图片URL' })
    @Column({ nullable: true, type: 'varchar' })
    imageUrl?: string;

    @ApiProperty({ description: '是否热门' })
    @Column({ default: false, type: 'boolean' })
    isHot!: boolean;

    @ApiProperty({ description: '是否发布' })
    @Column({ default: true, type: 'boolean' })
    published!: boolean;

    @ApiProperty({ description: '排序权重' })
    @Column({ type: 'int', default: 0 })
    sortOrder!: number;

    @ApiProperty({ description: '文档类型' })
    @Column({ default: 'markdown', type: 'varchar' })
    docType!: string;

    @ApiProperty({ description: '文件路径' })
    @Column({ nullable: true, type: 'varchar' })
    filePath?: string;

    @ApiProperty({ description: '创建时间' })
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty({ description: '更新时间' })
    @UpdateDateColumn()
    updatedAt!: Date;
}
