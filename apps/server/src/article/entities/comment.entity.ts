import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Article } from './article.entity';

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text' })
    content!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'authorId' })
    author!: User;

    @Column({ type: 'uuid' })
    authorId!: string;

    @ManyToOne(() => Article, article => article.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'articleId' })
    article!: Article;

    @Column({ type: 'uuid' })
    articleId!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
