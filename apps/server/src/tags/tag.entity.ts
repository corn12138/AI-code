import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Article } from '../articles/article.entity';

@Entity('tags')
export class Tag {
    @ApiProperty({ description: '标签ID' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ description: '标签名称' })
    @Column({ unique: true, type: 'varchar' })
    name!: string;

    @ApiProperty({ description: '标签别名/URL友好名称' })
    @Column({ unique: true, type: 'varchar' })
    slug!: string;

    @ApiProperty({ description: '标签描述', required: false })
    @Column({ type: 'text', nullable: true })
    description?: string;

    @ApiProperty({ description: '标签颜色', required: false })
    @Column({ nullable: true, type: 'varchar' })
    color?: string;

    @ApiProperty({ description: '关联的文章' })
    @ManyToMany(() => Article, article => article.tags)
    articles!: Article[];

    @ApiProperty({ description: '创建时间' })
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty({ description: '更新时间' })
    @UpdateDateColumn()
    updatedAt!: Date;

    // 添加虚拟属性来支持文章计数（不映射到数据库）
    @ApiProperty({ description: '关联文章数量', required: false })
    articleCount?: number;
}
