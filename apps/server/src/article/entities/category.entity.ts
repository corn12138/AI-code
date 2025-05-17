import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from './article.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    name!: string;

    @Column({ nullable: true })
    description!: string;

    @Column({ nullable: true })
    slug!: string;

    @OneToMany(() => Article, article => article.category)
    articles!: Article[];
}
