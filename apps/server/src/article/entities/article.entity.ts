import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Category } from './category.entity';
import { Comment } from './comment.entity';
import { Tag } from './tag.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text', nullable: true })
  summary!: string;

  @Column({ default: false })
  published: boolean = false;

  @Column({ nullable: true })
  featuredImage!: string;

  @Column({ nullable: true })
  slug!: string;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @ManyToOne(() => User, user => user.articles)
  @JoinColumn({ name: 'authorId' })
  author: User = new User;

  @Column()
  authorId!: string;

  @ManyToOne(() => Category, category => category.articles)
  @JoinColumn({ name: 'categoryId' })
  category: Category = new Category;

  @Column({ nullable: true })
  categoryId!: string;

  @ManyToMany(() => Tag, tag => tag.articles)
  @JoinTable({
    name: 'article_tags',
    joinColumn: { name: 'articleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' }
  })
  tags: Tag[] = [];

  @OneToMany(() => Comment, comment => comment.article)
  comments: Comment[] = [];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
