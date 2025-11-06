import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArticleService } from './article.service';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';

describe('articleService', () => {
  let service: ArticleService;
  let articleRepository: Repository<Article>;
  let tagRepository: Repository<Tag>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(Article),
          useValue: {
            findOne: vi.fn(),
            save: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            find: vi.fn(),
            createQueryBuilder: vi.fn(() => ({
              leftJoinAndSelect: vi.fn().mockReturnThis(),
              where: vi.fn().mockReturnThis(),
              andWhere: vi.fn().mockReturnThis(),
              orderBy: vi.fn().mockReturnThis(),
              skip: vi.fn().mockReturnThis(),
              take: vi.fn().mockReturnThis(),
              getManyAndCount: vi.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: {
            findOne: vi.fn(),
            save: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            find: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    articleRepository = module.get<Repository<Article>>(getRepositoryToken(Article));
    tagRepository = module.get<Repository<Tag>>(getRepositoryToken(Tag));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have basic functionality', () => {
    expect(typeof service).toBe('object');
  });
});
