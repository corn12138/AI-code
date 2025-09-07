import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('articleService', () => {
  let service: ArticleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticleService,
        {
          provide: 'Repository',
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have basic functionality', () => {
    expect(typeof service).toBe('object');
  });
});
