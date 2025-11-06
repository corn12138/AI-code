import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Category } from './category.entity';
import { Comment } from './comment.entity';
import { Tag } from './tag.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text', nullable: true })
  summary!: string;

  @Column({ type: 'boolean', default: false })
  published: boolean = false;

  @Column({ type: 'varchar', nullable: true })
  featuredImage!: string;

  @Column({ type: 'varchar', nullable: true })
  slug!: string;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @ManyToOne(() => User, user => user.articles)
  @JoinColumn({ name: 'authorId' })
  author: User = new User;

  @Column({ type: 'uuid' })
  authorId!: string;

  @ManyToOne(() => Category, category => category.articles)
  @JoinColumn({ name: 'categoryId' })
  category: Category = new Category;

  @Column({ type: 'uuid', nullable: true })
  categoryId!: string;

  @ManyToMany(() => Tag, tag => tag.articles)
  tags!: Tag[];  // 使用非空断言操作符

  @OneToMany(() => Comment, comment => comment.article)
  comments!: Comment[];  // 使用非空断言操作符，并移除 = [] 初始化

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
