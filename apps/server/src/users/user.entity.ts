import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Article } from '../articles/article.entity';

@Entity({ name: 'users' })
export class User {
    @ApiProperty({ description: '用户ID' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ description: '电子邮件' })
    @Column({ unique: true })
    email!: string;

    @ApiProperty({ description: '用户名' })
    @Column({ unique: true })
    username!: string;

    @ApiProperty({ description: '姓名' })
    @Column({ name: 'fullName' })
    fullName!: string;

    @Column()
    password!: string;

    @ApiProperty({ description: '头像' })
    @Column({ nullable: true, type: 'varchar' }) // Cambiar el tipo a varchar
    avatar!: string | null;

    @ApiProperty({ description: '个人简介' })
    @Column({ nullable: true, type: 'text' }) // 将类型从Object改为text
    @Exclude({ toPlainOnly: true })
    refreshToken!: string | null;

    @ApiProperty({ description: '用户角色' })
    @Column({ type: 'jsonb', default: '["user"]' })
    roles!: string[];

    @ApiProperty({ description: '用户发布的文章' })
    @OneToMany(() => Article, article => article.author)
    articles!: Article[];

    @CreateDateColumn({ name: 'createdAt' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt!: Date;
}
