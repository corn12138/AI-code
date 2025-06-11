import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Tag } from '../tags/tag.entity';
import { User } from '../users/user.entity';

@Entity('articles')
export class Article {
    @ApiProperty({ description: '文章ID' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ description: '文章标题' })
    @Column()
    title!: string;

    @ApiProperty({ description: 'URL友好的标题' })
    @Column({ unique: true })
    slug!: string;

    @ApiProperty({ description: '文章摘要' })
    @Column({ type: 'text', nullable: true })
    summary?: string;

    @ApiProperty({ description: '文章内容' })
    @Column({ type: 'text' })
    content!: string;

    @ApiProperty({ description: '文章封面图片' })
    @Column({ nullable: true })
    coverImage?: string;

    @ApiProperty({ description: '是否已发布' })
    @Column({ default: false })
    published!: boolean;

    @ApiProperty({ description: '发布时间' })
    @Column({ type: 'timestamp', nullable: true })
    publishedAt?: Date;

    @ApiProperty({ description: '文章作者' })
    @ManyToOne(() => User, { nullable: false })
    author!: User;

    @ApiProperty({ description: '作者ID' })
    @Column({ name: 'authorId' })
    authorId!: string;

    @ApiProperty({ description: '文章标签' })
    @ManyToMany(() => Tag, tag => tag.articles)
    @JoinTable({
        name: 'article_tags',
        joinColumn: { name: 'articleId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' }
    })
    tags!: Tag[];

    @ApiProperty({ description: '创建时间' })
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty({ description: '更新时间' })
    @UpdateDateColumn()
    updatedAt!: Date;
}