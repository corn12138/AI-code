import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { Article } from './entities/article.entity';
import { Category } from './entities/category.entity';
import { Comment } from './entities/comment.entity';
import { Tag } from './entities/tag.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Article, Category, Tag, Comment])],
    controllers: [ArticleController],
    providers: [ArticleService],
    exports: [ArticleService],
})
export class ArticleModule { }
