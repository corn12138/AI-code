import { Test, TestingModule } from '@nestjs/testing';
import { LowcodeService } from './lowcode.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('lowcodeService', () => {
  let service: LowcodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LowcodeService,
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

    service = module.get<LowcodeService>(LowcodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have basic functionality', () => {
    expect(typeof service).toBe('object');
  });
});
