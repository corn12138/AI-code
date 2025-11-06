import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from './article.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, type: 'varchar' })
    name!: string;

    @Column({ nullable: true, type: 'text' })
    description!: string;

    @Column({ nullable: true, type: 'varchar' })
    slug!: string;

    @OneToMany(() => Article, article => article.category)
    articles!: Article[];
}
