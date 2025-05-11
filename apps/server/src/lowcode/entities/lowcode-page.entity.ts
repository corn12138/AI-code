import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('lowcode_pages')
export class LowcodePage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  components: object;

  @Column({ default: '1.0.0' })
  version: string;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ nullable: true })
  publishedUrl: string;

  @Column({ nullable: true })
  thumbnail: string;

  @ManyToOne(() => User, user => user.lowcodePages)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
