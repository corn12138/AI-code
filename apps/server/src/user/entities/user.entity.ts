import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Article } from '../../article/entities/article.entity';
import { LowcodePage } from '../../lowcode/entities/lowcode-page.entity';

// 用户角色枚举
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    EDITOR = 'editor',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    username!: string;

    @Column({ nullable: true })
    fullName!: string;

    @Column()
    @Exclude({ toPlainOnly: true })
    password!: string;

    @Column({ nullable: true })
    avatar!: string;

    @Column({ nullable: true, type: 'text' })
    bio!: string | null;

    @Column({ type: 'jsonb', default: ['user'] })
    roles!: string[];

    @Column({ nullable: true, type: 'text' }) // 将类型从Object改为text
    @Exclude({ toPlainOnly: true })
    refreshToken!: string | null;

    @OneToMany(() => Article, (article) => article.author)
    articles!: Article[];

    @OneToMany(() => LowcodePage, (page) => page.owner)
    lowcodePages!: LowcodePage[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
