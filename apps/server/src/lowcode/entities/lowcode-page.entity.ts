import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('lowcode_pages')
export class LowcodePage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ type: 'jsonb', default: '{}' })
  content!: Record<string, any>;

  @Column()
  ownerId!: string;

  @Column({ default: false })
  published!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ nullable: true, name: 'published_at' })
  publishedAt!: Date;

  // 添加与User的关系
  @ManyToOne(() => User, user => user.lowcodePages)
  owner!: User;
}
