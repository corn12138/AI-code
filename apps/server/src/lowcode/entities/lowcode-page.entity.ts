import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('lowcode_pages')
export class LowcodePage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'jsonb' })
  content!: Record<string, any>;

  @Column({ nullable: true })
  description!: string;

  @Column({ default: false })
  isHomePage!: boolean;

  @Column({ default: false })
  published!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  config!: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  meta!: Record<string, any>;

  @ManyToOne(() => User, user => user.lowcodePages)
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @Column()
  ownerId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  publishedAt!: Date;
}
